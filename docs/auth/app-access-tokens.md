---
title: App Access Tokens
description: PICS App Access Tokens, what they are, why anonymous sessions need them to read protected app metadata, and how the community token database works.
---

# App Access Tokens

::: info Quick summary
An **App Access Token** is a 64-bit integer tied to a specific AppID. You pass it alongside the AppID in a PICS product info request so Steam's CM will hand back the full depot metadata for that app. Without one, paid apps come back empty.
:::

## What is PICS?

PICS (Product Info Cache Service) is the part of Steam's CM network responsible for serving app and package metadata. Every call to `client.get_product_info(apps=[app_id])` goes through PICS. Free-to-play games need no token at all. For paid or restricted apps, the CM checks for a valid access token before returning anything useful. Skip it and the response has `_missing_token: True` with an empty depot list.

## Why anonymous sessions hit a wall

Anonymous logins ship with only **package 17906**, which is the free-to-play bundle. Valve never issues access tokens to anonymous sessions for paid content. The token itself is proof that someone with a legitimate relationship to the app (owner, developer, or authorized party) retrieved it at some point. Once it exists, it works from any session.

## The token database

`appaccesstokens.json` is a community-maintained dump of known PICS tokens. The format is straightforward:

```json
{
  "570":  "7620803809741004454",
  "730":  "6631264976498983397",
  "400":  "1234567890123456789"
}
```

| Key | Value |
|-----|-------|
| App ID (as string) | PICS access token (uint64, stored as string) |

These tokens are global per app, not per account. Whoever collected them can share them freely and they will work from any session, including anonymous ones.

## Using a token

### Method 1 - Pass it inline

```python
import json
from steam.client import SteamClient

client = SteamClient()
client.anonymous_login()

with open("appaccesstokens.json") as f:
    tokens = json.load(f)

app_id = 223540
token  = int(tokens.get(str(app_id), 0))

# auto_access_tokens=False stops the library from trying to
# fetch the token from Steam itself, which always fails on anon sessions
product_info = client.get_product_info(
    apps=[{'appid': app_id, 'access_token': token}],
    auto_access_tokens=False,
)

app_data = product_info['apps'].get(app_id, {})

if app_data.get('_missing_token'):
    print("Token was rejected, app data still locked")
else:
    depots = app_data.get('depots', {})
    print(f"Got {len(depots)} depots")
```

### Method 2 - Pre-register on the client

```python
# Write the token directly into the client's internal lookup
client._app_access_tokens[app_id] = token

# After this a plain call works, the client attaches the token automatically
product_info = client.get_product_info(apps=[app_id])
```

::: warning Method 2 touches internal state
`client._app_access_tokens` is a private attribute. It works fine in practice but nothing stops it from changing in a future version of the steam library. Method 1 is safer.
:::

## What a token actually gives you

::: info Worth clarifying
Passing an access token to `get_product_info()` only unlocks the metadata layer. It makes `_missing_token` go away and fills in the depot list, including manifest GIDs. It has no effect on `get_manifest_request_code()`. That call still requires a license or a mirror service regardless of whether a token was used.
:::

| With a valid token | Without effect |
|-------------------|----------------|
| `_missing_token` flips to `False` | MRC from CM still returns `EResult 15` |
| Depot list becomes visible | Mirrors are still the only way to get an MRC |
| Manifest GID readable from depot info | Depot key requirement is unchanged |

In short, the token's job is to unlock reading. It does not unlock downloading.

## Practical use

The main reason to use a token is reading the manifest GID for a paid app when you have no license and the app is too obscure to appear in public SteamDB dumps.

```python
# After a successful product info call with a valid token:
depot_info   = app_data['depots'][str(depot_id)]
manifest_gid = int(depot_info['manifests']['public']['gid'])  # now readable

# Getting the MRC still requires a mirror regardless:
import requests
r   = requests.get(f"http://gmrc.wudrm.com/manifest/{manifest_gid}")
mrc = int(r.text.strip())

manifest = cdn.get_manifest(
    app_id=app_id,
    depot_id=depot_id,
    manifest_gid=manifest_gid,
    decrypt=True,
    manifest_request_code=mrc,
)
```

## Helper function

```python
def get_product_info_with_token(client, app_id: int, tokens: dict) -> dict:
    """
    Fetch product info for an app, injecting a token from the community
    database if one exists. Returns the app data dict, or empty dict
    if the app is inaccessible.
    """
    token = int(tokens.get(str(app_id), 0))

    if token:
        result = client.get_product_info(
            apps=[{'appid': app_id, 'access_token': token}],
            auto_access_tokens=False,
        )
    else:
        result = client.get_product_info(apps=[app_id])

    app_data = result.get('apps', {}).get(app_id, {})

    if app_data.get('_missing_token'):
        print(f"No valid token for app {app_id}, depot info unavailable")
        return {}

    return app_data
```

## Token vs Depot Key

People mix these up constantly. They are completely different things.

| | App Access Token | Depot Key |
|-|-----------------|-----------|
| **Purpose** | Unlocks reading app and depot metadata from CM | Decrypts file content (chunks and filenames) |
| **Type** | uint64 integer | 32-byte AES key |
| **Scope** | Per AppID | Per DepotID |
| **Stored in** | `appaccesstokens.json` | `depotkeys.json` |
| **Used in** | `get_product_info()` | `cdn.get_manifest(decrypt=True)` and chunk decryption |
| **Changes?** | Rarely | Never, permanent once issued |
