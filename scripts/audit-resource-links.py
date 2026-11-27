#!/usr/bin/env python3
"""Check every listing URL in D1 and write a CSV audit.

Usage: python3 scripts/audit-resource-links.py [output.csv]

Classification is based on the actual HTTP response: ok (2xx), redirect (3xx),
blocked (403/429 or bot wall), broken (404/410), server (5xx), error (network).
A 403 is NOT treated as broken: many providers block datacenter agents but the
same link opens for a visitor in a browser.
"""
import csv
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'resource-link-audit.csv')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'


def fetch_rows():
    env = dict(os.environ)
    env['PATH'] = '/home/eric/.hermes/tools/node-26.12.1-linux-x64/bin:' + env.get('PATH', '')
    cmd = [
        'npx', 'wrangler', 'd1', 'execute', 'baseimpact-verify', '--remote', '--json',
        '--command', 'SELECT id,name,website,service_url,source_url FROM resources ORDER BY id',
    ]
    raw = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True, timeout=180).stdout
    data = json.loads(raw)
    return [r for block in data for r in block.get('results', [])]


def classify(url):
    if not url or not isinstance(url, str):
        return '', '', 'missing', '', ''
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': UA, 'Accept': '*/*'})
        with urllib.request.urlopen(req, timeout=9) as r:
            return r.status, r.url, 'ok', '', ''
    except urllib.error.HTTPError as e:
        if e.code in (403, 429):
            return e.code, url, 'blocked', e.reason, ''
        if e.code in (404, 410):
            return e.code, url, 'broken', e.reason, ''
        if 300 <= e.code < 400:
            return e.code, e.headers.get('Location', ''), 'redirect', '', ''
        if 500 <= e.code:
            return e.code, url, 'server', e.reason, ''
        return e.code, url, 'other-http', e.reason, ''
    except Exception as e:
        # Some hosts reject HEAD but serve GET; retry once with GET.
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
            with urllib.request.urlopen(req, timeout=9) as r:
                return r.status, r.url, 'ok' if r.status < 400 else 'other-http', 'GET fallback', ''
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                return e.code, url, 'blocked', 'GET fallback', ''
            if e.code in (404, 410):
                return e.code, url, 'broken', 'GET fallback', ''
            return e.code, url, 'other-http', 'GET fallback', ''
        except Exception as e2:
            return '', url, 'error', str(e)[:120], str(e2)[:120]


def main():
    rows = fetch_rows()
    tasks = []
    for r in rows:
        for field in ('website', 'service_url', 'source_url'):
            url = (r.get(field) or '').strip()
            if url:
                tasks.append((r['id'], r['name'], field, url))
    # Dedupe identical URLs so shared provider pages are fetched once.
    unique = {}
    for t in tasks:
        unique.setdefault(t[3], t)
    print(f'{len(rows)} rows, {len(tasks)} URL slots, {len(unique)} unique URLs', flush=True)

    results = {}
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {pool.submit(classify, u): u for u in unique}
        for i, fut in enumerate(as_completed(futures), 1):
            u = futures[fut]
            try:
                results[u] = fut.result()
            except Exception as e:
                results[u] = ('', u, 'error', str(e)[:120], '')
            if i % 50 == 0:
                print(f'checked {i}/{len(unique)}', flush=True)

    counts = {}
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['id', 'name', 'field', 'url', 'status', 'effective_url', 'classification', 'detail', 'detail2'])
        for rid, name, field, url in tasks:
            status, effective, kind, d1, d2 = results.get(url, ('', '', 'error', '', ''))
            counts[kind] = counts.get(kind, 0) + 1
            w.writerow([rid, name, field, url, status, effective, kind, d1, d2])
    print('COUNTS', json.dumps(counts, sort_keys=True), flush=True)
    print('WROTE', OUT, flush=True)


if __name__ == '__main__':
    main()
