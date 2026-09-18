#!/usr/bin/env python3
"""Generate the two PWA icons. Run once; the PNGs are committed."""
import struct
import zlib
import pathlib

BG = (31, 111, 235)    # --accent
FG = (255, 255, 255)


def glyph_pixels(size):
    """A thick sine-like wave across the middle: the course in one mark."""
    import math
    on = set()
    thickness = max(2, size // 12)
    for x in range(size):
        phase = (x / size) * 2 * math.pi * 1.5
        y = size / 2 - math.sin(phase) * size * 0.22
        for dy in range(-thickness // 2, thickness // 2 + 1):
            yy = int(y) + dy
            if 0 <= yy < size:
                on.add((x, yy))
    return on


def write_png(path, size):
    on = glyph_pixels(size)
    raw = bytearray()
    for y in range(size):
        raw.append(0)                      # filter type 0 for each scanline
        for x in range(size):
            raw.extend(FG if (x, y) in on else BG)

    def chunk(tag, data):
        out = struct.pack('>I', len(data)) + tag + data
        return out + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    path.write_bytes(png)
    print(f'{path}: {size}x{size}, {len(png)} bytes')


def main():
    out = pathlib.Path('icons')
    out.mkdir(exist_ok=True)
    write_png(out / 'icon-192.png', 192)
    write_png(out / 'icon-512.png', 512)


if __name__ == '__main__':
    main()
