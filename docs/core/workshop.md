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

Unlike paid game depots, Workshop manifests and chunks are unencrypted. You do not need a Manifest Request Code (MRC) or a 32-byte AES depot key. The manifest payload uses the standard protobuf format (`ContentManifestPayload`), compressed with LZMA/VZ.

In most cases `workshop_depot_id` is identical to the parent AppID (e.g. `4000`). For games with explicit workshop depots, check the `workshopdepot` field under `depots` in AppInfo.

## Adding to .lua configs

Steam injectors (OpenSteamTool, SteamTools, SmokeAPI) read local `.lua` files to handle Workshop manifests and bypass subscription checks.

1. Add `addappid(AppID)` to grant ownership of the base game so Steam permits the subscription request.
2. Add `setManifestid(depot_id, "hcontent_file_gid")` to bind the workshop manifest to the depot.
3. Save the downloaded `.manifest` file into Steam's local manifest folder (`steamapps/depotcache/<depot_id>_<hcontent_file>.manifest`).

Example `.lua` file:

```lua
-- Grant base game ownership (Garry's Mod: 4000)
addappid(4000)

-- Map workshop item manifest GID
setManifestid(4000, "918994036723335461")
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
