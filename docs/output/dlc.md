---
title: DLC & Shared Depots
---

# DLC & Shared Depots

## DLC Depots

DLC AppIDs live in the main game's `common.dlc` field. You need a separate `get_product_info()` call to get their depot metadata. DLC depots use the DLC's own `app_id`, not the parent game's.

::: warning Use the right app_id for DLC
When calling `cdn.get_manifest()` and `cdn.get_cdn_auth_token()` for a DLC depot, pass the DLC's `app_id`. Steam checks the license against it. Using the parent game's ID will get you an auth error.
:::

## Shared Depots (depotfromapp)

Some depots have a `depotfromapp` key pointing at a different app. This means the actual files live under that other app's CDN space, not the current one.

```python
for key, val in depots_data.items():
    if not key.isdigit():
        continue

    if "depotfromapp" in val:
        source_app_id = int(val["depotfromapp"])
        depot_id      = int(key)
        # Files live under source_app_id
        print(f"Depot {depot_id} is shared from app {source_app_id}")
        # Use cdn.get_manifests(source_app_id, ...)
        continue

    # Normal depot
    manifest_gid = int(val["manifests"]["public"]["gid"])
```
