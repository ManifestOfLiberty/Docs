---
title: CDN URL Anatomy
---

# CDN URL Anatomy

A complete manifest download URL looks like this:

```
https://cache1-ams1.steamcontent.com:443/depot/373301/manifest/6397590570861788404/5/7382910483726418273?__token__=...
```

## Segment breakdown

| Segment | Meaning |
|---------|---------|
| `https://cache1-ams1.steamcontent.com:443` | CDN content server (host and port) |
| `/depot/373301` | The depot ID |
| `/manifest/6397590570861788404` | The manifest GID (which version you want) |
| `/5` | Manifest format version, always 5 for modern Steam |
| `/7382910483726418273` | The Manifest Request Code, the auth token |
| `?__token__=...` | CDN auth token, appended as a query string when needed |

## Chunk URL format

Chunks use a simpler pattern, no MRC needed:

```
https://cache1-ams1.steamcontent.com:443/depot/373301/chunk/{chunk_sha_hex}
```

## Building the URL manually

```python
def build_manifest_url(cdn, depot_app_id, depot_id, manifest_gid, mrc):
    server   = cdn.get_content_server()
    scheme   = "https" if server.https else "http"
    base_url = f"{scheme}://{server.host}:{server.port}"
    token    = cdn.get_cdn_auth_token(depot_app_id, depot_id, str(server.host))
    url      = f"{base_url}/depot/{depot_id}/manifest/{manifest_gid}/5/{mrc}{token}"
    return url
```
