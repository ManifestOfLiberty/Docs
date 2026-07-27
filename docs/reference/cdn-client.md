---
title: CDNClient API
---

# CDNClient API

Reference for every method in `cdn.py`.

## Methods

| Method | Arguments | Returns | Description |
|--------|-----------|---------|-------------|
| `__init__` | `client: SteamClient` | - | Creates gevent pool, fetches CDN server list, loads licenses |
| `clear_cache` | - | - | Clears the manifests, app_depots, and beta_passwords caches |
| `load_licenses` | - | - | Reads session licenses and populates `licensed_app_ids` and `licensed_depot_ids` |
| `fetch_content_servers` | `num_servers=20` | - | Refreshes the CDN server list from the Steam web API |
| `get_content_server` | `rotate=False` | `ContentServer` | Returns the current best CDN server. Rotate shifts the deque. |
| `get_depot_key` | `app_id, depot_id` | `bytes` | Returns the 32-byte AES depot key. Fetches from CM if not cached. |
| `cdn_cmd` | `command, args` | `Response` | Low-level HTTP GET to a CDN server. Rotates on failure. |
| `get_chunk` | `app_id, depot_id, chunk_id` | `bytes` | Download, decrypt, and decompress one chunk. LRU-cached. |
| `get_manifest_request_code` | `app_id, depot_id, manifest_gid, branch, branch_password_hash` | `int` | Asks CM for an MRC. Requires a license for the depot. |
| `get_manifest` | `app_id, depot_id, manifest_gid, decrypt=True, manifest_request_code=0` | `CDNDepotManifest` | Download and optionally decrypt a manifest. |
| `check_beta_password` | `app_id, password` | `EResult` | Validates a beta password with CM and stores the beta key internally. |
| `get_app_depot_info` | `app_id` | `dict` | Returns depot info for an app. Cached. |
| `has_license_for_depot` | `depot_id` | `bool` | Checks if the current session has access to this depot. |
| `get_manifests` | `app_id, branch, password, filter_func, decrypt` | `list[CDNDepotManifest]` | Fetches all manifests for an app concurrently. |
| `iter_files` | `app_id, filename_filter, branch, password, filter_func` | `generator[CDNDepotFile]` | Yields every file in every manifest for an app. |
| `get_manifest_for_workshop_item` | `item_id` | `CDNDepotManifest` | Gets the manifest for a Steam Workshop item. |

## Key instance attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `cdn.depot_keys` | `dict {int: bytes}` | Injected or fetched depot keys. Pre-fill from `depotkeys.json`. |
| `cdn.manifests` | `dict {(app,depot,gid): CDNDepotManifest}` | In-memory manifest cache |
| `cdn.servers` | `deque[ContentServer]` | Rotating list of CDN servers |
| `cdn.licensed_app_ids` | `set` | App IDs the current session has a license for |
| `cdn.licensed_depot_ids` | `set` | Depot IDs the current session has a license for |
