---
title: OpenSteamTool
description: Technical reference for OpenSteamTool, an open-source SteamTools alternative with hot reloading, DRM ticket handling, manifest pinning, and ticket extraction tools.
---

# OpenSteamTool

[OpenSteamTool](https://github.com/OpenSteam001/OpenSteamTool) is an open-source DLL proxy and hooking toolkit for Steam. It acts as an open alternative to proprietary tools, enabling unowned game/DLC unlocks, manifest pinning, DRM ticket management, achievement tracking, and live script hot-reloading.

## How it works

OpenSteamTool uses DLL proxying. Copying `OpenSteamTool.dll`, `dwmapi.dll`, and `xinput1_4.dll` into the Steam root folder causes Steam to load the proxy on launch.

On startup, OpenSteamTool hashes `steamclient64.dll` and `steamui.dll` on disk and fetches matching pattern files from the [OpenSteam001/steam-monitor](https://github.com/OpenSteam001/steam-monitor) repository (with jsDelivr fallback and local caching). This means pattern updates happen automatically across Steam client updates without needing manual binary patches.

## Key features

- **Hot Reloading**: Automatically watches the `<Steam>/config/lua` directory. Modifying or adding `.lua` scripts updates Steam's state instantly without restarting the client.
- **Unowned Game and DLC Unlocks**: Register AppIDs directly in Lua scripts.
- **Manifest Pinning**: Pin specific depot version GIDs to prevent Steam from updating games.
- **Upstream Manifest Resolvers**: Fetches MRCs from `opensteamtool` (`https://manifest.opensteamtool.com/{gid}`), `wudrm`, or `steamrun`.
- **Denuvo and SteamStub DRM Handling**: Forges local ConfigStore tickets for SteamStub and manages `AppTicket`/`ETicket` credentials for Denuvo titles.
- **Family Sharing Bypass**: Removes Family Sharing locks for games added via `addappid` when participating family members run OpenSteamTool.
- **Stats and Achievements**: Syncs achievements using custom SteamIDs or the fallback stats API (`https://stats.opensteamtool.com/{appid}`).
- **Online Fix Matchmaking**: Optional `-onlinefix` launch parameter enables AppID 480 lobby matchmaking.

## Lua configuration reference

Script files go into `<Steam>/config/lua/` (e.g. `C:\Program Files (x86)\Steam\config\lua\main.lua`). All function names are case-insensitive.

```lua
-- Unlock an app or DLC
addappid(1361510)

-- Unlock a depot with an explicit 32-byte AES key
addappid(1361511, 0, "5954562e7f5260400040a818bc29b60b335bb690066ff767e20d145a3b6b4af0")

-- Add a PICS access token for protected metadata
addtoken(1361510, "2764735786934684318")

-- Pin a depot to a specific manifest GID (optional third param is size in bytes)
setManifestid(1361511, "5656605350306673283")
setManifestid(1361511, "5656605350306673283", 12345678)

-- Write Denuvo AppTicket and ETicket hex to the Windows Credential Store
setAppTicket(1361510, "1400000000...")
setETicket(1361510, "0100000000...")

-- Custom SteamID for achievement and stat tracking
setStat(1361510, "76561197960287930")
```

## Denuvo and SteamStub DRM mechanics

### SteamStub
SteamStub games do not require explicit ticket extraction. OpenSteamTool uses a SteamDRMP ticket parsing vulnerability to forge requested AppIDs directly from Steam's local `ConfigStore` ticket without injecting code into game processes.

### Denuvo
Denuvo games require valid ticket data. OpenSteamTool stores `AppTicket` and `ETicket` entries in the platform credential store (on Windows: `HKCU\Software\Valve\Steam\Apps\<AppId>`).

::: warning Denuvo ticket expiration
Denuvo authorization tickets expire roughly every 30 minutes. After expiration, launches fail with Denuvo error `88500005` until fresh ticket hex strings are supplied.
:::

### Extracting tickets with extract_tickets.exe

When logged into an account that owns a target Denuvo game, build or run `extract_tickets.exe`:

```cmd
extract_tickets.exe 1361510
```

The tool reads the registry, loads `steamclient64.dll`, and creates an `<appid>/` folder containing `tickets.txt`:

```text
appid:1361510
appticket(184 bytes):14000000...
eticket(143 bytes):...
```

Paste these hex values into your Lua script using `setAppTicket()` and `setETicket()`.

## Configuration file (opensteamtool.toml)

Place `opensteamtool.toml` in the Steam root directory (next to `steam.exe`). It is watched and hot-reloaded automatically.

```toml
[log]
level = "info"

[manifest]
# Upstream MRC resolver provider ("opensteamtool", "steamrun", or "wudrm")
url = "opensteamtool"
timeout_resolve_ms = 5000
timeout_connect_ms = 5000
timeout_send_ms    = 10000
timeout_recv_ms    = 10000

[stats]
# Query stats.opensteamtool.com/{appid} when no Lua setStat override exists
enable_api = true

[lua]
# Extra directories to watch for Lua scripts
paths = []

[inject]
# Optional DLL injection into game processes matching architecture
enabled = false
# library_x64 = "OpenSteamTool.GameHook.x64.dll"
# library_x86 = "OpenSteamTool.GameHook.x86.dll"
```

## Custom Manifest Resolvers in Lua

If you run a custom manifest endpoint, OpenSteamTool exposes HTTP helpers inside Lua:

```lua
-- Extended manifest resolver function
function fetch_manifest_code_ex(app_id, depot_id, gid)
    local headers = { ["User-Agent"] = "Mozilla/5.0" }
    local body, status = http_get("https://your-custom-api.com/mrc?app=" .. app_id .. "&gid=" .. gid, headers)
    if status == 200 then
        return body
    end
    return nil
end
```

## Setup and Installation

1. Download or compile OpenSteamTool (`build.bat`).
2. Copy `OpenSteamTool.dll`, `dwmapi.dll`, and `xinput1_4.dll` into your Steam root folder (e.g. `C:\Program Files (x86)\Steam\`).
3. Create the Lua script directory `<Steam>\config\lua\`.
4. Place your `.lua` script files inside. OpenSteamTool loads them automatically.
