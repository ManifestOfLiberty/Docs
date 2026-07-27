---
title: CM vs CDN Architecture
---

# CM vs CDN Architecture

Steam runs two completely separate networks and it helps to understand what each one does before touching anything else.

## CM (Connection Manager)

This is where your session lives. You connect here over TCP or WebSocket using the `steam` Python library.

- Authentication happens here, anonymous or with credentials
- You request product info, depot keys, manifest request codes, and license checks here
- The CM never sends file data, only metadata and tokens
- In code: `SteamClient -> client.connect() -> client.anonymous_login()`

## CDN (Content Delivery Network)

These are plain HTTP servers spread around the world. They serve the actual bytes.

- Manifests and chunks come from here
- You pick a server using the `IContentServerDirectoryService/GetServersForSteamPipe` web API
- Each server has a type (SteamCache, EdgeCache), an HTTPS flag, and load metrics

::: tip How CDNClient bridges the two
CDNClient uses SteamClient to get tokens and keys from the CM, then makes plain HTTP requests to CDN servers for the actual file data. It handles both sides so you mostly do not have to think about the split.
:::

## Finding CDN servers

```python
import requests

def get_cdn_servers(cell_id: int = 0, max_servers: int = 20) -> list[dict]:
    url = "https://api.steampowered.com/IContentServerDirectoryService/GetServersForSteamPipe/v1/"
    r   = requests.get(url, params={"cell_id": cell_id, "max_servers": max_servers}, timeout=10)
    r.raise_for_status()
    return r.json()["response"]["servers"]

servers = get_cdn_servers()
for s in servers[:3]:
    scheme = "https" if s["https_support"] == "mandatory" else "http"
    print(f"  [{s['type']}]  {scheme}://{s['host']}  load={s['weighted_load']}")
```
