---
title: Gotchas & Edge Cases
---

# Gotchas & Edge Cases

Things that will bite you if you are not expecting them.

## manifest_gid type confusion

It comes back as a **string** in product info. `cdn.get_manifest()` wants an **int**. The CDN URL uses it as a string path segment again.

```python
# Wrong — string where int is required
manifest_gid = depot_info["manifests"]["public"]["gid"]   # "6397590570861788404"
cdn.get_manifest(app_id, depot_id, manifest_gid, ...)      # will error

# Correct
manifest_gid = int(depot_info["manifests"]["public"]["gid"])
```

## DLC app_id vs parent app_id

Always pass the DLC's own `app_id` to `cdn.get_manifest()` and the auth token methods. Using the parent game's ID causes auth failures.

## CDNClient infinite server rotation

If every CDN server returns a non-2xx and non-4xx response, `cdn_cmd()` retries forever. Wrap manifest downloads in a `try/except` with a timeout or kill the greenlet if it hangs.

## Manifest in-memory cache

`cdn.manifests` caches results by `(app_id, depot_id, manifest_gid)`. Calling `get_manifest()` twice hands you the cached copy. Call `cdn.clear_cache()` if you need a fresh download.

## depotkeys.json memory usage

At around 17 MB, loading the full file into a Python dict takes noticeable memory. For production use, consider SQLite with an index on depot_id instead.

## Gevent vs requests

ValvePython runs on `gevent`. The `requests` library is not gevent-cooperative by default. Call `steam.monkey.patch_minimal()` at the very top of your script (before any other imports) to avoid blocking the event loop.

## VZ decompression edge case

LZMA output can be slightly longer or shorter than the declared size. The code uses `data[12:-9]` as input and trims to `[:decompressed_size]` to handle both cases.

## Wrong depot key

AES decryption does not fail when you use the wrong key. It produces garbage bytes that fail to parse downstream. You get an exception but the message may not make it obvious what happened. Key length must be 32 bytes (64 hex characters). Check this first.

## Empty oslist means include the depot

If `config.oslist` is empty, do not skip the depot. An empty list means no platform restriction. Only skip when `oslist` is non-empty and your OS is missing from it.

## OpenCache servers

The Steam web API sometimes returns servers with `type='OpenCache'`. CDNClient filters these out automatically. If you are building your own server picker without CDNClient, make sure to exclude them.
