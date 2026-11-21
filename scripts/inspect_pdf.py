import zlib, re

path = 'public/base-impact-one-pager.pdf'
data = open(path, 'rb').read()

print('total size', len(data))
print('stream keyword count', data.count(b'stream'))

# Find all occurrences of 'stream' and show surrounding bytes
for m in re.finditer(rb'stream', data):
    start = max(0, m.start() - 30)
    seg = data[start:m.start()+40]
    print('offset', m.start(), repr(seg))
