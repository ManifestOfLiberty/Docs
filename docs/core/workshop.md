---
title: Workshop & UGC Depots
description: How Steam Workshop items use PublishedFileIDs, hcontent_file manifest GIDs, and how to configure them in .lua files.
---

# Workshop & UGC Depots

Steam Workshop items (User Generated Content) use two storage formats depending on size and file structure: single-file UGC and SteamPipe workshop depots. Single files are served directly over HTTP, while multi-file items (mods, maps, soundpacks) are stored as standard SteamPipe manifests on Steam's CDN.

## Storage types

| Type | Identifiers | Download URL | Uses Manifest? |
|------|-------------|--------------|----------------|
| Single File | `UGCHandle_t` (`hcontent_preview` / `filename`) | Direct GET from `cloud-X.steampowered.com` | No |
| SteamPipe Workshop Item | `PublishedFileId_t` + `hcontent_file` | Chunk download from `/depot/<depot_id>/chunk/<sha1>` | Yes (`hcontent_file` is the manifest GID) |

## Resolving PublishedFileIDs

To download a SteamPipe workshop item, resolve its `PublishedFileId` (the ID from the Workshop page URL) to get its `hcontent_file` manifest GID and parent `consumer_app_id`.

Query `ISteamRemoteStorage/GetPublishedFileDetails/v1/`:

```http
POST https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/
Content-Type: application/x-www-form-urlencoded

itemcount=1&publishedfileids[0]=104479831
```

Example response:

```json
{
  "response": {
    "result": 1,
    "resultcount": 1,
    "publishedfiledetails": [
      {
        "publishedfileid": "104479831",
        "result": 1,
        "creator_app_id": 4000,
        "consumer_app_id": 4000,
        "hcontent_file": "918994036723335461",
        "title": "Stacker STool"
      }
    ]
  }
}
```

- `consumer_app_id` is the base game AppID (for example `4000` for Garry's Mod).
- `hcontent_file` is the 64-bit manifest GID.

## Downloading the manifest

Workshop manifests live on the standard SteamPipe CDN:

```http
GET https://<cdn_server>/depot/<workshop_depot_id>/manifest/<hcontent_file>/5
```

While workshop manifest metadata is often public, downloaded file chunks for SteamPipe workshop depots are encrypted using the 32-byte AES depot key of the `workshopdepot`. Without this key registered in the `.lua` file, the Steam client or injector will fail with **`CONTENT ENCRYPTED`** when downloading or updating mods.

In most cases `workshop_depot_id` is identical to the parent AppID (e.g. `4000` for Garry's Mod, `3167020` for Escape From Duckov). For games with explicit workshop depots, check the `workshopdepot` field under `depots` in AppInfo.

## Adding to .lua configs

Steam injectors (OpenSteamTool, SteamTools, SmokeAPI) read local `.lua` files to authenticate downloads and decrypt Workshop content.

1. **Grant Base Game Ownership**: `addappid(AppID)` allows Steam to accept workshop subscriptions.
2. **Register Workshop Depot Key**: `addappid(workshop_depot_id, 0, "32_byte_aes_key")` provides the decryption key for Steam to unpack downloaded mod chunks without throwing `CONTENT ENCRYPTED`.
3. **Optional Offline Manifest Binding**: `setManifestid(workshop_depot_id, "hcontent_file_gid")` is only required if you are pre-caching a specific mod's `.manifest` file offline into `steamapps/depotcache/`. For normal dynamic in-game downloading, only the `addappid` key line is needed.

### Example .lua file for Escape From Duckov (3167020)

```lua
-- Grant base game ownership
addappid(3167020)

-- Register Workshop Depot AES key (prevents "CONTENT ENCRYPTED" on mod downloads)
addappid(3167020, 0, "868bad77591803956d03d9863f4775a7d402330362cbd41c1c764c994dfae9fa")

-- Game Content Depots
addappid(3167021, 0, "6a1377569bff7441f985074b6ed8692c0c8f6681b80a75e020dd1a10419b5dea")
setManifestid(3167021, "942677920170955747")
```

## Python helper

Script to look up a `PublishedFileID`, print the `setManifestid` line, and fetch its manifest info:

```python
import urllib.request
import urllib.parse
import json

def get_workshop_info(file_id: int):
    url = "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/"
    data = urllib.parse.urlencode({
        "itemcount": 1,
        "publishedfileids[0]": file_id
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        
    item = res["response"]["publishedfiledetails"][0]
    return item["consumer_app_id"], item["hcontent_file"], item.get("title", "")

app_id, manifest_gid, title = get_workshop_info(104479831)
print(f"-- Workshop item: {title}")
print(f"addappid({app_id})")
print(f'setManifestid({app_id}, "{manifest_gid}")')
```
