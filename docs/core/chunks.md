---
title: Chunks
---

# Chunks

Steam does not store files as files on its CDN. Every file gets split into **chunks** of up to 1 MB each. This is what you are actually downloading.

## What Valve does when building a depot

1. Split each file into segments up to 1 MB
2. Compress each segment (LZMA/VZ format or ZIP)
3. Encrypt with AES using the depot key
4. Store on the CDN, identified by the SHA-1 of the original data

## What you do when downloading

1. Find the chunk SHA from the manifest's file mapping
2. `HTTP GET /depot/{depot_id}/chunk/{sha}` from a CDN server
3. AES decrypt with the depot key to get compressed bytes
4. Check the header: `VZ` means LZMA, otherwise it is ZIP
5. Decompress and verify against the CRC32/SHA-1
6. The result is cached in `LRUCache(20)` to avoid re-downloading

::: tip Why this design is useful
If two files share any content, they share chunks. A chunk downloaded once does not need to be downloaded again. Updates only pull the chunks that actually changed.
:::

## Decryption and decompression

```python
import struct, lzma
from zipfile import ZipFile
from io import BytesIO
from steam.core.crypto import symmetric_decrypt

def decode_chunk(raw_bytes: bytes, depot_key: bytes) -> bytes:
    # AES decrypt using Steam's CBC mode wrapper
    data = symmetric_decrypt(raw_bytes, depot_key)

    if data[:2] == b'VZ':
        # VZ (LZMA) format
        vzfilter = lzma._decode_filter_properties(lzma.FILTER_LZMA1, data[7:12])
        vzdec    = lzma.LZMADecompressor(lzma.FORMAT_RAW, filters=[vzfilter])
        checksum, decompressed_size = struct.unpack('<II', data[-10:-2])
        data = vzdec.decompress(data[12:-9])[:decompressed_size]
    else:
        # ZIP format (PK header)
        with ZipFile(BytesIO(data)) as zf:
            data = zf.read(zf.filelist[0])

    return data
```
