---
title: App Info & Product Info
---

# App Info & Product Info

Once you are connected to the CM, you can ask for structured metadata about any app. The response is a nested dict parsed from Valve's VDF format.

```python
# Simplified shape of what client.get_product_info(apps=[app_id]) returns:
product_info = {
    "apps": {
        570: {
            "common": {
                "name":  "Dota 2",
                "type":  "game",
                "dlc":   {"0": "570001", "1": "570002"},
            },
            "depots": {
                "373301": {
                    "name":   "Dota 2 Content",
                    "config": {"oslist": "windows,linux,macos"},
                    "manifests": {
                        "public": {
                            "gid":      "6397590570861788404",
                            "size":     "31541145600",
                            "download": "10823000064",
                        },
                    },
                },
                "branches": {
                    "public":   {"buildid": "12345678", "timeupdated": "1703000000"},
                    "internal": {"buildid": "12345679", "pwdrequired": "1"},
                },
            },
        }
    }
}
```

::: warning Protected apps
Some apps lock their product info. Anonymous login only works for free apps. Paid apps come back as an empty dict. When that happens you can fall back to the steamtools.games mirror.
:::

## Fallback: steamtools.games

When product info is empty, query:

```
https://steamtools.games/api/files/{app_id}/lua
```

This returns a Lua script that already has manifest GIDs and depot keys baked in. You parse it with regex to get the depot list back.
