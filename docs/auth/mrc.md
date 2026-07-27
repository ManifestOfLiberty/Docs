---
title: Manifest Request Code
description: The auth token required to download any manifest, why anonymous sessions cannot get it directly, and how mirrors fill the gap.
---

# Manifest Request Code (MRC)

::: warning Required for every manifest download
Since around 2022-2023, Valve requires a Manifest Request Code in the download URL. Without it, the CDN returns 401 or 403. There is no way around this.
:::

## What it is

An MRC is a large integer (uint64) that Steam's CM generates when you call `ContentServerDirectory.GetManifestRequestCode` with your `app_id`, `depot_id`, and `manifest_id`. The CM checks whether your session holds a license for that depot and, if yes, hands back a code you put in the URL.

## Why anonymous sessions cannot get one for paid games

Anonymous sessions only have **package 17906**, which covers free-to-play content. Ask for an MRC for a paid depot and Steam responds with `AccessDenied`. This is the main reason the workflow relies on public mirror services.

## Getting an MRC (requires ownership)

```python
# Only works if your session actually owns the depot
mrc = cdn.get_manifest_request_code(
    app_id       = 570,
    depot_id     = 373301,
    manifest_gid = 6397590570861788404,
)
```

## How mirrors work

Someone who actually owns the game can request a valid MRC and submit it to a public database. Those codes stay valid and can be reused by anyone. The CDN does not tie them to the original session.

See [MRC Mirror Services](/auth/mrc-mirrors) for the full list and fetcher code.
