---
layout: home

hero:
  name: "Manifest of Liberty"
  text: "The complete CDN reference"
  tagline: Everything you need to understand Steam's SteamPipe, depots, manifests, MRCs, depot keys, the full download pipeline, and Lua config output.
  actions:
    - theme: brand
      text: Get Started ->
      link: /intro/overview
    - theme: alt
      text: Full Download Flow
      link: /download/download-flow
    - theme: alt
      text: Depot Keys
      link: /auth/depot-keys

features:
  - icon: 🗺️
    title: Architecture
    details: Steam's CM vs CDN split explained. What each network does, how CDNClient bridges them, and where every token comes from.
    link: /intro/architecture

  - icon: 🔑
    title: Manifest Request Code
    details: The mandatory gating mechanism. Why anonymous sessions cannot get MRCs for paid games, and how public mirror services provide them.
    link: /auth/mrc

  - icon: 🔐
    title: Depot Keys
    details: 32-byte AES keys that decrypt chunks and filenames. How to load the community key database and inject keys into CDNClient.
    link: /auth/depot-keys

  - icon: ⬇️
    title: Full Download Pipeline
    details: Step-by-step from AppID to saved .manifest file with a complete, annotated working code example.
    link: /download/download-flow

  - icon: 🔓
    title: Decryption
    details: How depot keys decrypt manifest filenames and file chunks. AES-CBC and VZ-LZMA format, with fallback handling.
    link: /download/decrypt

  - icon: 📝
    title: Lua Config Output
    details: How addappid() and setManifestid() work and what Steam injectors read from the generated .lua file.
    link: /output/lua-config

  - icon: ⚠️
    title: Gotchas
    details: Type confusion, caching, gevent issues, VZ edge cases, and DLC app_id pitfalls documented.
    link: /reference/gotchas

  - icon: 🛠️
    title: Workshop & UGC Depots
    details: How PublishedFileIDs map to hcontent_file manifest GIDs, downloading unencrypted Workshop manifests, and binding them in .lua configs.
    link: /core/workshop
---

