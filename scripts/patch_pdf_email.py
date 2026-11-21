import zlib, re

path = 'public/base-impact-one-pager.pdf'
data = open(path, 'rb').read()

def repl(s):
    return s.replace(b'admin@baseimpact.org', b'contact@baseimpact.org')

# 'stream' + optional CRLF + compressed data + CRLF 'endstream'
pattern = re.compile(rb'stream\r?\n(.*?)\r?\nendstream', re.DOTALL)
matches = list(pattern.finditer(data))
print('streams found:', len(matches))

result = data
count = 0
for m in matches:
    compressed = m.group(1)
    try:
        decompressed = zlib.decompress(compressed)
    except Exception as e:
        print('decompress failed:', e)
        continue
    new_data = repl(decompressed)
    if new_data != decompressed:
        new_compressed = zlib.compress(new_data)
        result = result[:m.start()] + b'stream\r\n' + new_compressed + data[m.end():]
        count += 1
    else:
        print('no change for this stream')
print('modified:', count)
open(path, 'wb').write(result)
