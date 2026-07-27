---
title: Content Servers
---

# Content Servers

Steam operates a worldwide network of CDN edge nodes. Each one is an HTTP server that serves manifests and chunks.

## Server attributes

| Attribute | Description |
|-----------|-------------|
| `host` | Hostname, e.g. `cache1-ams1.steamcontent.com` |
| `port` | 80 for HTTP, 443 for HTTPS |
| `https` | Whether HTTPS is required |
| `type` | `SteamCache`, `EdgeCache`, `Akamai`, etc. |
| `cell_id` | Geographic region ID |
| `load` / `weighted_load` | Load metrics. CDNClient prefers the server with the lowest `weighted_load`. |

## How rotation works

CDNClient keeps servers in a `deque`. `get_content_server()` returns the front. `get_content_server(rotate=True)` shifts the deque so the next server is up. This happens automatically on HTTP errors.

::: warning OpenCache servers are excluded
The CDNClient removes servers of type `OpenCache` from the pool. These are community-operated and not reliable enough.
:::

## Fetching the server list

```python
import requests

def get_cdn_servers(cell_id: int = 0, max_servers: int = 20) -> list[dict]:
    url = "https://api.steampowered.com/IContentServerDirectoryService/GetServersForSteamPipe/v1/"
    r   = requests.get(url, params={"cell_id": cell_id, "max_servers": max_servers}, timeout=10)
    r.raise_for_status()
    return r.json()["response"]["servers"]
```
