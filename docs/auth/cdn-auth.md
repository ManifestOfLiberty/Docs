---
title: CDN Auth Tokens
---

# CDN Auth Tokens

Some CDN servers require an extra auth token appended to the URL as a query parameter. It proves your session is allowed to access that depot.

```python
# cdn.get_cdn_auth_token() returns a string starting with '?__token__=...'
token = cdn.get_cdn_auth_token(depot_app_id, depot_id, str(server.host))
url   = f"{base_url}/depot/{depot_id}/manifest/{manifest_gid}/5/{mrc}{token}"
```

::: info Starts with a question mark
`cdn.get_cdn_auth_token()` already includes the `?` at the start. Append it directly to the URL without adding anything in between.
:::

::: tip Not always needed
Free-to-play depots and some CDN server types do not require this token at all. Building the full URL anyway is fine for debugging purposes.
:::
