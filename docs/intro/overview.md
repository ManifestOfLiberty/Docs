---
title: Overview
description: What SteamPipe is and how all the pieces connect.
---

# Overview

Steam delivers every game through its own content system called **SteamPipe**. Each game is split into **depots**, which are just named groups of files. Every depot has a **manifest** that describes exactly what files are in it and how they are split up. The actual file data lives in encrypted **chunks** on HTTP servers worldwide.

::: info The full chain
AppID -> Depot IDs -> Manifest GID -> Manifest Request Code -> Download manifest -> Depot key to decrypt -> Iterate chunks -> Reconstruct files
:::

## What this covers

- The difference between Steam's CM network and its CDN
- How to pull app and depot metadata
- Getting Manifest Request Codes from public mirror services
- Downloading and decrypting manifest files
- Where depot keys come from and how to use them
- Generating a Lua config for Steam injectors

## The pipeline

| Step | What happens |
|------|-------------|
| 1 | Connect to Steam CM anonymously |
| 2 | Fetch app and depot metadata |
| 3 | Parse the depot list, grab manifest GIDs |
| 4 | Fetch the Manifest Request Code from a mirror service |
| 5 | Download the manifest via CDNClient |
| 6 | Decrypt manifest filenames using the depot key (if available) |
| 7 | Save the `.manifest` file to disk |
| 8 | Write the `.lua` config with depot keys and manifest overrides |
