<div align="center">
  <img src="docs/public/assets/images/logo.png" width="160" alt="Manifest of Liberty Logo">

  <h1>Manifest of Liberty</h1>

  <p>
    <strong>Educational Technical Reference for SteamPipe Internals & CDN Authentication</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18%2B-2ea44f?logo=node.js&logoColor=white" alt="Node.js 18+">
    <img src="https://img.shields.io/badge/VitePress-2.0%2B-2ea44f?logo=vitepress&logoColor=white" alt="VitePress 2.0+">
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License">
  </p>

  <p>
    <a href="README.md"><img src="https://img.shields.io/badge/US-English-blue" alt="English"></a>
    <a href="README_HU.md"><img src="https://img.shields.io/badge/HU-Hungarian-red" alt="Hungarian"></a>
    <a href="README_RU.md"><img src="https://img.shields.io/badge/RU-Russian-blue" alt="Russian"></a>
    <a href="README_ZH.md"><img src="https://img.shields.io/badge/CN-Chinese-red" alt="Chinese"></a>
  </p>
</div>

<hr>

> **Disclaimer**: This documentation project is created strictly for educational, historical, and research purposes.

## What You'll Learn

- **CM vs CDN Architecture**: Detailed breakdown of Connection Manager vs Content Delivery Network operations.
- **PICS & Metadata**: App product info format, PICS access tokens, and reading restricted app data.
- **Depots & Manifests**: Depot layouts, manifest GIDs, protobuf payloads, and chunk mappings.
- **Keys & Authentication**: Manifest Request Codes (MRCs), public mirror fallbacks, and 32-byte AES depot keys.
- **Download Pipeline**: Content server selection, chunk decompression (LZMA/VZ), and generating Lua configs for Steam injectors.
- **OpenSteamTool Mechanics**: OpenSteamTool internal architecture, ticket extraction tools, Denuvo/SteamStub credentials, and Lua scripts.

## Running Locally

### Prerequisites

- Node.js v18 or newer
- npm or pnpm

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ManifestOfLiberty/Docs.git
   cd Docs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run docs:dev
   ```

4. Open `http://localhost:5174` in your browser.

## Project Structure

```text
docs/
├── .vitepress/          # VitePress theme, plugins, and configuration
├── intro/               # Overview, glossary, and CM vs CDN architecture
├── core/                # App info, depots, manifests, GIDs, and chunking
├── auth/                # Login modes, access tokens, MRCs, mirrors, and depot keys
├── download/            # Content servers, URL structure, download flow, and decryption
├── output/              # Lua configs, beta branches, and DLC depots
└── reference/           # OpenSteamTool, CDNClient API reference, and edge cases
```

## Available Scripts

- `npm run docs:dev` - Starts the local development server
- `npm run docs:build` - Builds the static site for production
- `npm run docs:preview` - Previews the built production site locally

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.  
*Provided strictly for educational purposes only. Not affiliated with or endorsed by Valve Corporation.*
