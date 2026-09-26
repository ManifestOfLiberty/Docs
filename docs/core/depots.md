---
title: Depots
---

# Depots

A **depot** is just a named group of files. Games split their content into multiple depots for a bunch of reasons:

- Main content depot (assets, data files)
- Platform depots (Windows binaries, Linux binaries)
- Language and localization depots
- DLC depots
- Workshop tool depots
- Shared depots reused across multiple games

## Fields in product info

| Field | Type | Meaning |
|-------|------|---------|
| `name` | string | Human-readable depot name |
| `config.oslist` | string | Comma-separated OS list. Empty means no platform restriction. |
| `manifests.public.gid` | string (uint64) | Current manifest GID for the public branch |
| `manifests.beta.gid` | string (uint64) | Manifest GID for the beta branch, if there is one |
| `depotfromapp` | int | Content lives under this other AppID instead |

## OS filtering

Skip depots where `config.oslist` is non-empty and does not include your OS.

::: tip Empty oslist means include it
If `oslist` is missing or empty, the depot has no platform restriction. Always include it. This covers shared data depots that work on all platforms.
:::

## Shared depots (depotfromapp)

```python
for key, val in depots_data.items():
    if not key.isdigit():
        continue

    if "depotfromapp" in val:
        source_app_id = int(val["depotfromapp"])
        depot_id      = int(key)
        # Files live under source_app_id, not the current app
        print(f"Depot {depot_id} is shared from app {source_app_id}")
        continue

    # Normal depot
    manifest_gid = int(val["manifests"]["public"]["gid"])
```
