---
title: Depot Keys
description: AES-256 keys that decrypt chunks and manifest filenames, where they come from and how to use them.
---

# Depot Keys

Every depot has a unique **32-byte AES key**. Unlike manifest GIDs and MRCs, depot keys never change. Once you have one for a depot, it works forever.

## What the key decrypts

- **File chunks** - every chunk is AES-encrypted before being stored on the CDN
- **Manifest filenames** - when `filenames_encrypted` is true in the manifest
- Both use the same 32-byte key but different AES modes. CBC for chunks, ECB for filenames.

## Getting a key if you own the game

The CM hands it over directly:

```python
msg = client.get_depot_key(app_id, depot_id)
raw_key = msg.depot_encryption_key   # bytes, 32 bytes long
```

This requires a full authenticated session, not anonymous.

## depotkeys.json

The project ships a `depotkeys.json` file containing community-collected depot keys for thousands of games. Keys are stored as 64-character hex strings (32 bytes). The file is around 17 MB.

```python
import json

def load_depot_keys(path: str = "depotkeys.json") -> dict[int, str]:
    """Returns {depot_id (int): hex_key (str)}."""
    with open(path, "r") as f:
        raw = json.load(f)
    return {int(k): v for k, v in raw.items()}

keys = load_depot_keys("depotkeys.json")

depot_id = 373301
if depot_id in keys:
    hex_key = keys[depot_id]          # 64 hex chars = 32 bytes
    raw_key = bytes.fromhex(hex_key)  # convert for crypto operations
    print(f"Key for depot {depot_id}: {hex_key[:8]}...")
```

## Registering keys with CDNClient

```python
def register_keys(cdn, depot_keys: dict) -> None:
    """Pre-register known depot keys so CDNClient does not need to ask Steam."""
    for depot_id, hex_key in depot_keys.items():
        try:
            cdn.depot_keys[int(depot_id)] = bytes.fromhex(hex_key)
        except ValueError:
            print(f"Warning: invalid key for depot {depot_id}")

register_keys(cdn, keys)

# Or just register one manually:
cdn.depot_keys[373301] = bytes.fromhex("a1b2c3d4e5f6...")
```

## What happens if you have no key

- You can still download the manifest. Filenames stay encrypted but the protobuf structure is fine.
- You can still download chunks. They are encrypted blobs you cannot decompress, but you can save them.
- The `.manifest` file writes to disk normally. Steam's injector will decrypt at runtime using the key in your Lua config.
- Pass `decrypt=False` to `cdn.get_manifest()` to skip decryption and avoid an error.

::: warning Wrong key causes a confusing error
AES decryption with the wrong key succeeds cryptographically but produces garbage, which then fails to parse. You will get an exception but the message may not be obvious. Always double-check that the depot ID matches the key. Key length must be 32 bytes (64 hex characters).
:::
