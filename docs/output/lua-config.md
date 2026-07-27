---
title: Lua Config File
---

# Lua Config File

The pipeline generates a `{app_id}.lua` file that third-party Steam injectors (Goldberg, CreamAPI, SmokeAPI) read to spoof ownership and override which manifests Steam serves locally.

## Example output

```lua
-- Auto-generated config for Dota 2 (AppID: 570)
addappid(570)

-- Associated DLC AppIDs
addappid(570001)
addappid(570002)

-- Depot unlocks and manifest overrides
addappid(373301, 0, "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2")
setManifestid(373301, "6397590570861788404")

addappid(373302, 0, "ff00aa11bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc55")
setManifestid(373302, "3561463682334619841")

addappid(373305)          -- no key for this depot, just unlock it
setManifestid(373305, "4435851250675935801")
```

## Function reference

| Function | Signature | What it does |
|----------|-----------|--------------|
| `addappid` | `addappid(app_id)` | Tells the injector to treat this AppID as owned |
| `addappid` | `addappid(depot_id, 0, "hex_key")` | Same, but also registers the 32-byte AES depot key |
| `setManifestid` | `setManifestid(depot_id, "gid")` | Override: serve the manifest with this GID from the local cache |

## Workshop Items (UGC)

For Steam Workshop items stored via SteamPipe, the `setManifestid` function is used to bind the `hcontent_file` (Manifest GID) to the target workshop depot ID:

```lua
-- Grant parent AppID ownership so Steam allows Workshop subscription & download
addappid(570)

-- Bind Workshop item manifest GID (hcontent_file) to the Workshop Depot
setManifestid(570, "8492019482019481029")
```

For a comprehensive technical breakdown of resolving PublishedFileIDs and downloading Workshop manifests, see [Workshop & UGC Depots](/core/workshop).

::: info Only successful downloads get Lua entries
The script checks whether the `.manifest` file exists on disk before writing a `setManifestid` line. Depots that failed to download are left out silently.
:::

