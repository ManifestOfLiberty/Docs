---
title: Anonymous vs Full Login
---

# Anonymous vs Full Login

| Capability | Anonymous | Full (owned account) |
|-----------|-----------|---------------------|
| Connect to CM | yes | yes |
| `get_product_info()` for free apps | yes | yes |
| `get_product_info()` for paid apps | no (empty dict) | yes |
| `get_depot_key()` for free depots | yes | yes |
| `get_depot_key()` for paid depots | no (AccessDenied) | yes |
| `get_manifest_request_code()` for free content | yes | yes |
| `get_manifest_request_code()` for paid content | no (AccessDenied) | yes |
| Download manifest with MRC from a mirror | yes | yes |
| Download chunks (with depot key) | yes | yes |

Anonymous login is enough for the entire workflow as long as you supply depot keys and MRCs from the community databases. You do not need to own anything.

```python
from steam.client import SteamClient
from steam.client.cdn import CDNClient

client = SteamClient()
client.anonymous_login()   # no username or password

try:
    cdn = CDNClient(client)
    # your code here
finally:
    client.disconnect()
```
