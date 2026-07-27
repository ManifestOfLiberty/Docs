---
title: Manifests
---

# Manifests

A **manifest** is a binary protobuf file that works like a table of contents for one specific version of a depot. It does not contain any actual file data, just the map of files to chunks.

## What a manifest contains

| Field | Description |
|-------|-------------|
| `metadata.creation_time` | Unix timestamp of when this manifest was built |
| `metadata.cb_disk_original` | Total uncompressed size of all files in the depot |
| `payload.mappings` | List of FileMapping entries, one per file |
| `filenames_encrypted` | If true, file paths are AES-encrypted with the depot key |

## What each FileMapping contains

| Field | Description |
|-------|-------------|
| `filename` / `filename_raw` | File path inside the depot, may be encrypted |
| `size` | Total uncompressed file size in bytes |
| `flags` | Bitmask: is it a directory, symlink, or executable |
| `sha_content` | SHA-1 of the full uncompressed file for integrity checking |
| `chunks` | Ordered list of ChunkData entries that make up this file |

## What each ChunkData contains

| Field | Description |
|-------|-------------|
| `sha` | SHA-1 of the chunk, used as its CDN address and for verification |
| `offset` | Where this chunk belongs in the reconstructed file |
| `cb_original` | Size after decompression |
| `cb_compressed` | Size as stored on the CDN (compressed and encrypted) |

## Encrypted filenames

If `manifest.filenames_encrypted` is true, call `manifest.decrypt_filenames(depot_key_bytes)` to get readable paths. See [Decrypting Manifests](/download/decrypt).

## Saving to disk

`manifest.serialize()` converts the in-memory manifest back to binary protobuf bytes. That blob is what gets written to disk as `{depot_id}_{manifest_gid}.manifest`.
