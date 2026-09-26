<div align="center">
  <img src="docs/public/assets/images/logo.png" width="160" alt="Manifest of Liberty Logo">

  <h1>Manifest of Liberty</h1>

  <p>
    <strong>Учебное и исследовательское руководство по инфраструктуре SteamPipe и авторизации Steam CDN</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18%2B-2ea44f?logo=node.js&logoColor=white" alt="Node.js 18+">
    <img src="https://img.shields.io/badge/VitePress-2.0%2B-2ea44f?logo=vitepress&logoColor=white" alt="VitePress 2.0+">
    <img src="https://img.shields.io/badge/Лицензия-MIT-blue" alt="Лицензия MIT">
  </p>

  <p>
    <a href="README.md"><img src="https://img.shields.io/badge/US-English-blue" alt="English"></a>
    <a href="README_HU.md"><img src="https://img.shields.io/badge/HU-Hungarian-red" alt="Hungarian"></a>
    <a href="README_RU.md"><img src="https://img.shields.io/badge/RU-Russian-blue" alt="Russian"></a>
    <a href="README_ZH.md"><img src="https://img.shields.io/badge/CN-Chinese-red" alt="Chinese"></a>
  </p>
</div>

<hr>

> **Отказ от ответственности**: Этот документационный проект создан исключительно в образовательных, исторических и исследовательских целях.

## Чему вы научитесь

- **Архитектура CM и CDN**: Подробный разбор взаимодействия между Connection Manager и Content Delivery Network.
- **PICS и метаданные**: Формат данных о продукте, токены доступа PICS и чтение защищенных метаданных приложений.
- **Депо и манифесты**: Структура депо, GID манифестов, Protobuf-структуры и сопоставление фрагментов (chunks).
- **Ключи и авторизация**: Коды запроса манифеста (MRC), публичные зеркала и 32-байтные ключи расшифровки AES.
- **Конвейер скачивания**: Выбор серверов контента, распаковка фрагментов (LZMA/VZ) и генерация Lua-конфигураций.
- **Принципы OpenSteamTool**: Внутренняя архитектура, инструменты извлечения тикетов, авторизация Denuvo/SteamStub и скрипты Lua.

## Локальный запуск

### Требования

- Node.js v18 или новее
- npm или pnpm

### Быстрый старт

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/ManifestOfLiberty/Docs.git
   cd Docs
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите сервер разработки:
   ```bash
   npm run docs:dev
   ```

4. Откройте `http://localhost:5174` в браузере.

## Структура проекта

```text
docs/
├── .vitepress/          # Тема, плагины и конфигурация VitePress
├── intro/               # Обзор, глоссарий и архитектура CM/CDN
├── core/                # Данные приложений, депо, манифесты, GID и чанки
├── auth/                # Режимы входа, токены доступа, MRC, зеркала и ключи депо
├── download/            # Серверы контента, структура URL, скачивание и расшифровка
├── output/              # Конфигурации Lua, бета-ветки и DLC-депо
└── reference/           # Справка по OpenSteamTool, API CDNClient и нюансы
```

## Доступные скрипты

- `npm run docs:dev` — Запуск локального сервера разработки
- `npm run docs:build` — Сборка статического сайта для продакшена
- `npm run docs:preview` — Предпросмотр собранного сайта

## Лицензия

Проект распространяется под лицензией MIT. Подробности см. в файле [LICENSE](LICENSE).  
*Предоставляется исключительно в образовательных целях. Не связан с Valve Corporation.*
