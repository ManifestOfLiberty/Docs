# Contributing to Manifest of Liberty

Contributions are welcome. If you find inaccurate details, broken links, outdated mirror endpoints, or missing SteamPipe protocol information, feel free to open a pull request or issue.

## How to contribute

1. Fork the repository on GitHub: `https://github.com/ManifestOfLiberty/Docs`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/Docs.git
   cd Docs
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run docs:dev
   ```
4. Make your edits inside the `docs/` folder.
5. Verify the site builds without errors:
   ```bash
   npm run docs:build
   ```
6. Commit your changes and open a Pull Request.

## Guidelines

- Keep markdown clean and readable.
- Use relative links for internal pages (e.g. `/auth/depot-keys`).
- Ensure all code snippets are tested before submitting.