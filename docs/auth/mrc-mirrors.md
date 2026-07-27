---
title: MRC Mirror Services
description: All known public Manifest Request Code mirror services and a multi-mirror fetcher.
---

# MRC Mirror Services

These are community-run databases of donated Manifest Request Codes. The fetcher tries them in order until one responds.

## Known mirrors

| Service | URL pattern |
|---------|------------|
| opensteamtool.com | `https://manifest.opensteamtool.com/{manifest_gid}` |
| gmrc.wudrm.com | `http://gmrc.wudrm.com/manifest/{manifest_gid}` |
| steamapi.993499094.xyz | `https://steamapi.993499094.xyz/manifest/{manifest_gid}` |
| steam.run | `https://manifest.steam.run/api/manifest/{manifest_gid}` |

::: warning Note on steam.run
`steam.run` is currently down, but it is kept in the fallback list in case it comes back online.
:::

## Response format

All active mirrors return the Manifest Request Code directly as a plain uint64 integer string in the HTTP response body:

```
16706270354871428084
```

## Multi-mirror fetcher

```python
import requests

MIRRORS = [
    "https://manifest.opensteamtool.com/{gid}",
    "http://gmrc.wudrm.com/manifest/{gid}",
    "https://steamapi.993499094.xyz/manifest/{gid}",
    "https://manifest.steam.run/api/manifest/{gid}",
]

def fetch_mrc(manifest_gid: int) -> int | None:
    """Return the Manifest Request Code, or None if all mirrors fail."""
    for url_tpl in MIRRORS:
        url = url_tpl.format(gid=manifest_gid)
        try:
            r = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code == 200:
                text = r.text.strip()
                if text.isdigit():
                    return int(text)
        except Exception:
            pass

    return None
```
