# ⚡ Devcontainer Quick Start

## 🚀 One-Click Start (Codespaces)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=nimble-123/cap-fiori-timetracking)

1. Click badge above
2. Wait ~3-5 minutes
3. Run: `npm run watch`
4. Access forwarded port

---

## 💻 Local Dev Container

```bash
# Open in VS Code
code /path/to/cap-fiori-timetracking

# Press F1, then:
"Dev Containers: Reopen in Container"
```

---

## 🎯 Essential Commands

```bash
# Start development server
npm run watch

# Run tests
npm test

# Format code
npm run format

# Build project
npm run build

# Deploy to BTP
npm run build:mta && npm run deploy:cf
```

---

## 🔐 Test Users

| Email                        | Password | Role  |
|------------------------------|----------|-------|
| max.mustermann@test.de       | max      | Admin |
| erika.musterfrau@test.de     | erika    | User  |
| frank.genehmiger@test.de     | frank    | Approver |

---

## 🌐 Access Points

**Local Dev Container:**
- CAP Server: http://localhost:4004
- Swagger UI: http://localhost:4004/$api-docs/odata/v4/track/

**GitHub Codespaces:**
- CAP Server: https://[codespace-name]-4004.app.github.dev
- (Swagger UI uses same host)

---

## 🐛 Quick Fixes

### Port already in use
```bash
PORT=4005 npm run watch
```

### TypeScript errors
```bash
npx cds-typer "*"
# Then: F1 → "TypeScript: Restart TS Server"
```

### Dependencies out of sync
```bash
rm -rf node_modules package-lock.json
npm ci
```

### Container rebuild
```bash
# Press F1 → "Dev Containers: Rebuild Container"
```

---

## 📚 Full Documentation

- [Devcontainer README](./README.md)
- [Getting Started](../GETTING_STARTED.md)
- [ADR-0021](../docs/ADR/0021-devcontainer-github-codespaces.md)

---

**Need Help?** [Open an Issue](https://github.com/nimble-123/cap-fiori-timetracking/issues)
