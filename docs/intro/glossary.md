---
title: Glossary
---

# Glossary

| Term | Definition |
|------|-----------|
| **AppID** | Unique number identifying any Steam product. 570 is Dota 2, 730 is CS2. |
| **DepotID** | Identifies one depot inside an app. A single game usually has several. |
| **Manifest** | Binary file (protobuf) listing every file in a depot version and how it is chunked. |
| **Manifest GID** | 64-bit number identifying one specific version of a manifest. Changes on every update. |
| **MRC** | Manifest Request Code. A short-lived uint64 token that goes in the CDN URL to authorize a manifest download. |
| **Depot Key** | 32-byte AES key used to decrypt file chunks and manifest filenames. Never changes once issued. |
| **CDN** | Content Delivery Network. The HTTP edge servers that actually send you manifest and chunk data. |
| **CM** | Connection Manager. Steam's backend servers where you authenticate and request tokens. |
| **SteamClient** | The ValvePython class that manages your CM connection. |
| **CDNClient** | ValvePython class that wraps SteamClient to add manifest and chunk downloading. |
| **cell_id** | Steam's region number used to pick the closest CDN servers. |
| **Branch** | A named version of an app. `public` is the live version, others are betas or staging builds. |
| **VDF** | Valve Data Format. Valve's own key-value format used for app metadata. |
| **Payload** | The section of a manifest that holds the actual file to chunk mappings. |
| **Chunk SHA** | SHA-1 of a chunk's raw data, used as its address on the CDN and for integrity checking. |
| **depotfromapp** | Depot property meaning the content actually lives under a different AppID. |
| **VZ format** | Steam's custom LZMA compression format for chunks. Starts with the bytes `VZ`. |
| **SteamPipe** | Valve's content delivery system for distributing game files. |
