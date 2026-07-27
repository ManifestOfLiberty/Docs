<div align="center">
  <img src="docs/public/assets/images/logo.png" width="160" alt="Manifest of Liberty Logo">

  <h1>Manifest of Liberty</h1>

  <p>
    <strong>Oktatási és kutatási útmutató a SteamPipe hálózathoz és a Steam CDN hitelesítéshez</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18%2B-2ea44f?logo=node.js&logoColor=white" alt="Node.js 18+">
    <img src="https://img.shields.io/badge/VitePress-2.0%2B-2ea44f?logo=vitepress&logoColor=white" alt="VitePress 2.0+">
    <img src="https://img.shields.io/badge/Licensz-MIT-blue" alt="MIT Licensz">
  </p>

  <p>
    <a href="README.md"><img src="https://img.shields.io/badge/US-English-blue" alt="English"></a>
    <a href="README_HU.md"><img src="https://img.shields.io/badge/HU-Hungarian-red" alt="Hungarian"></a>
    <a href="README_RU.md"><img src="https://img.shields.io/badge/RU-Russian-blue" alt="Russian"></a>
    <a href="README_ZH.md"><img src="https://img.shields.io/badge/CN-Chinese-red" alt="Chinese"></a>
  </p>
</div>

<hr>

> **Felelősségkizárás**: Ez a dokumentációs projekt kizárólag oktatási, történeti és kutatási célból készült.

## Amit megtanulhatsz

- **CM és CDN architektúra**: Részletes áttekintés a Connection Manager és a Content Delivery Network működéséről.
- **PICS és metaadatok**: App információk, PICS hozzáférési tokenek és védett alkalmazások adatai.
- **Depotok és manifesztek**: Depot felépítések, manifeszt GID-ek, protobuf adatstruktúrák és chunk feltérképezés.
- **Kulcsok és hitelesítés**: Manifest Request Code-ok (MRC), nyilvános tükörszerverek és 32 bájtos AES kulcsok.
- **Letöltési folyamat**: Tartalomszerverek kiválasztása, chunk kitömörítés (LZMA/VZ) és Lua konfigurációk generálása.
- **OpenSteamTool működése**: Belső architektúra, jegykinyerő eszközök, Denuvo/SteamStub hitelesítők és Lua scriptek.

## Helyi futtatás

### Előfeltételek

- Node.js v18 vagy újabb
- npm vagy pnpm

### Első lépések

1. Klónozd a tárolót:
   ```bash
   git clone https://github.com/ManifestOfLiberty/Docs.git
   cd Docs
   ```

2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

3. Indítsd el a fejlesztői szervert:
   ```bash
   npm run docs:dev
   ```

4. Nyisd meg a böngészőt a `http://localhost:5174` címen.

## Projekt felépítése

```text
docs/
├── .vitepress/          # VitePress téma, bővítmények és konfiguráció
├── intro/               # Áttekintés, szójegyzék és CM/CDN architektúra
├── core/                # App infó, depotok, manifesztek, GID-ek és chunking
├── auth/                # Bejelentkezési módok, tokenek, MRC-k, tükrök és kulcsok
├── download/            # Tartalomszerverek, URL szerkezet, letöltés és titkosítás
├── output/              # Lua konfigurációk, béta ágak és DLC depotok
└── reference/           # OpenSteamTool, CDNClient API leírás és hibakeresés
```

## Használható parancsok

- `npm run docs:dev` - Helyi fejlesztői szerver indítása
- `npm run docs:build` - Statikus oldal felépítése éles használatra
- `npm run docs:preview` - Az éles oldal helyi előnézete

## Licensz

Ez a projekt az MIT Licensz alatt áll. Részletekért lásd a [LICENSE](LICENSE) fájlt.  
*Kizárólag oktatási célból készült. Nem áll kapcsolatban a Valve Corporationnel.*
