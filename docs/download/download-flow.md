---
title: Full Download Flow
description: Step-by-step walkthrough of the entire pipeline from AppID to a saved .manifest file.
---

# Full Download Flow

This is the complete pipeline from start to finish. Read this before diving into any individual page.

## Steps

| Step | What happens | API call |
|------|-------------|----------|
| 1 | Load depotkeys.json into memory | `json.load()` |
| 2 | Connect to Steam CM anonymously | `client.anonymous_login()` |
| 3 | Fetch app and depot metadata | `client.get_product_info(apps=[app_id])` |
| 4 | Parse depots, filter by OS, grab manifest GIDs | `app_data['depots']` |
| 5 | Optionally fetch DLC app info | `client.get_product_info(apps=dlc_ids)` |
| 6 | Fall back to steamtools.games mirror if product info is locked | `requests.get(mirror_url)` |
| 7 | Inject depot key for each depot | `cdn.depot_keys[id] = bytes.fromhex(...)` |
| 8 | Fetch MRC from a public mirror | `fetch_mrc(manifest_gid)` |
| 9 | Download the manifest | `cdn.get_manifest(...)` |
| 10 | Try `decrypt=True` first, fall back to `decrypt=False` if it fails | |
| 11 | Save the manifest to disk | `manifest.serialize()` |
| 12 | Write the `.lua` config | `addappid` and `setManifestid` lines |
| 13 | Disconnect | `client.disconnect()` |

## Working example

```python
import json, os, requests
from steam.client import SteamClient
from steam.client.cdn import CDNClient

# 1. Load depot keys
depot_keys = {}
if os.path.exists("depotkeys.json"):
    with open("depotkeys.json", "r") as f:
        raw = json.load(f)
    depot_keys = {int(k): v for k, v in raw.items()}
    print(f"Loaded {len(depot_keys)} depot keys")

# 2. Connect
client = SteamClient()
client.anonymous_login()

# 3. Get metadata
app_id       = 570   # Dota 2
product_info = client.get_product_info(apps=[app_id])
app_data     = product_info["apps"][app_id]
depots_data  = app_data.get("depots", {})

# 4. Pick a depot
depot_id     = 373301
depot_info   = depots_data[str(depot_id)]
manifest_gid = int(depot_info["manifests"]["public"]["gid"])

# 5. Fetch MRC from mirrors
def get_mrc(gid):
    mirrors = [
        f"https://manifest.opensteamtool.com/{gid}",
        f"http://gmrc.wudrm.com/manifest/{gid}",
        f"https://steamapi.993499094.xyz/manifest/{gid}",
    ]
    for url in mirrors:
        try:
            r = requests.get(url, timeout=5)
            if r.status_code == 200 and r.text.strip().isdigit():
                return int(r.text.strip())
        except Exception:
            pass
    return None

mrc = get_mrc(manifest_gid)
if not mrc:
    raise RuntimeError("No MRC found, all mirrors failed")

print(f"Got MRC: {mrc}")

# 6. Set up CDN client and inject key
cdn = CDNClient(client)
if depot_id in depot_keys:
    cdn.depot_keys[depot_id] = bytes.fromhex(depot_keys[depot_id])
    print(f"Depot key registered for {depot_id}")

# 7. Download manifest
has_key  = depot_id in cdn.depot_keys
manifest = cdn.get_manifest(
    app_id                = app_id,
    depot_id              = depot_id,
    manifest_gid          = manifest_gid,
    decrypt               = has_key,
    manifest_request_code = mrc,
)

# 8. Save to disk
os.makedirs("downloads", exist_ok=True)
out_path = f"downloads/{depot_id}_{manifest_gid}.manifest"
with open(out_path, "wb") as f:
    f.write(manifest.serialize())

print(f"Saved: {out_path}")
client.disconnect()
```
