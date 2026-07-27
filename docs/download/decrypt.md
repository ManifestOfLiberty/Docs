---
title: Decrypting Manifests
description: Using depot keys to read encrypted filenames in a manifest.
---

# Decrypting Manifests

Manifests from paid games have their filenames AES-encrypted. You need the depot key to make them readable. There are two ways to handle this.

## Option 1 - Decrypt at download time

Pass `decrypt=True` to `cdn.get_manifest()`. The library calls `manifest.decrypt_filenames(depot_key_bytes)` internally and the returned manifest object has readable `filename` strings.

## Option 2 - Save encrypted, decrypt later

Pass `decrypt=False`. The manifest saves with `filenames_encrypted=True`. When Steam's injector loads the `.manifest` file alongside the Lua config (which has the depot key in `addappid(depot_id, 0, "hex_key")`), it decrypts the filenames at runtime.

## Download with fallback

```python
def download_manifest(cdn, app_id, depot_id, manifest_gid, mrc):
    """
    Try to download with decryption first.
    If it fails (bad key or no key), save with encrypted filenames instead.

    Returns (manifest, was_decrypted: bool)
    """
    has_key = depot_id in cdn.depot_keys

    if has_key:
        try:
            manifest = cdn.get_manifest(
                app_id                = app_id,
                depot_id              = depot_id,
                manifest_gid          = manifest_gid,
                decrypt               = True,
                manifest_request_code = mrc,
            )
            return manifest, True
        except Exception as err:
            print(f"  Decryption failed ({err}), retrying without...")

    manifest = cdn.get_manifest(
        app_id                = app_id,
        depot_id              = depot_id,
        manifest_gid          = manifest_gid,
        decrypt               = False,
        manifest_request_code = mrc,
    )
    return manifest, False

manifest, decrypted = download_manifest(cdn, app_id, depot_id, manifest_gid, mrc)

if decrypted:
    for f in manifest.payload.mappings:
        print(f.filename)   # real path, e.g.  game\dota\gameinfo.gi
else:
    print("Filenames are encrypted. Add the depot key to decrypt them.")
```

::: warning Wrong key gives a confusing error
AES decryption with the wrong key produces garbage bytes that fail to parse. You get an exception but the message may not be obvious. Make sure the depot ID matches its correct key.
:::

## How chunk decryption works internally

```python
import struct, lzma
from zipfile import ZipFile
from io import BytesIO
from steam.core.crypto import symmetric_decrypt

def decode_chunk(raw_bytes: bytes, depot_key: bytes) -> bytes:
    # AES decrypt using Steam's CBC mode
    data = symmetric_decrypt(raw_bytes, depot_key)

    if data[:2] == b'VZ':
        # VZ (LZMA) format
        vzfilter = lzma._decode_filter_properties(lzma.FILTER_LZMA1, data[7:12])
        vzdec    = lzma.LZMADecompressor(lzma.FORMAT_RAW, filters=[vzfilter])
        checksum, decompressed_size = struct.unpack('<II', data[-10:-2])
        data = vzdec.decompress(data[12:-9])[:decompressed_size]
    else:
        # ZIP format
        with ZipFile(BytesIO(data)) as zf:
            data = zf.read(zf.filelist[0])

    return data
```
