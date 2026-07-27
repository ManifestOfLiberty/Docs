---
title: Manifest GID
---

# Manifest GID

The **Manifest GID** is a 64-bit number that uniquely identifies one specific version of a manifest for one specific depot.

- Changes every time Valve pushes an update to that depot
- The current GID for the public branch lives in `depot_info["manifests"]["public"]["gid"]`
- Example value: `6397590570861788404`
- Shows up in the CDN URL path as `.../manifest/{gid}/5/...`
- The `/5` at the end is the manifest version number, always 5 for modern Steam

::: info Pinning older GIDs
Older GIDs point to older versions of the game. If you have the manifest for a specific GID, you can use `setManifestid()` in the Lua config to lock Steam to that version, which is basically how version pinning and downgrading works.
:::

::: warning String vs int
The GID comes back as a **string** in the product info dict. `cdn.get_manifest()` wants an **int**. Always cast it: `int(manifest_gid)`. The CDN URL uses it as a string again.
:::
