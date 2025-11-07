# 🐳 Devcontainer Configuration

This directory contains the configuration for developing the CAP Fiori Time Tracking application in a **GitHub Codespaces** or **VS Code Dev Container** environment.

## 🚀 Quick Start

### Using GitHub Codespaces

1. Click the **"Code"** button on the GitHub repository
2. Select the **"Codespaces"** tab
3. Click **"Create codespace on [branch]"**
4. Wait for the container to build and setup (~3-5 minutes first time)
5. Once ready, run: `npm run watch`
6. Access the app at the forwarded port (usually `https://[codespace-name]-4004.app.github.dev`)

### Using VS Code Dev Container (Local)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open the project in VS Code
4. Press `F1` → Select **"Dev Containers: Reopen in Container"**
5. Wait for setup to complete
6. Run: `npm run watch`
7. Access the app at `http://localhost:4004`

## 📦 What's Included

### Base Image

- **Node.js**: 22.20.0 (matches `.nvmrc`)
- **npm**: Latest compatible version
- **Debian Bookworm**: Stable Linux base

### Development Tools

#### SAP-Specific
- **@sap/cds-dk**: SAP Cloud Application Programming Model Development Kit
- **mbt**: Multi-Target Application Build Tool
- **@cap-js/mcp-server**: CAP MCP Server for AI assistance

#### Cloud Foundry
- **cf CLI**: Cloud Foundry Command Line Interface (v8)
- **MultiApps Plugin**: For deploying Multi-Target Applications

#### Build Tools
- **Java 17** (Temurin): Required for `@sap/ams-dev` builds
- **TypeScript**: Language tooling
- **tsx**: TypeScript execution
- **Prettier**: Code formatter

### VS Code Extensions

The following extensions are automatically installed:

1. **SAPSE.vscode-cds** - SAP CDS Language Support
   - Syntax highlighting for `.cds` files
   - IntelliSense and validation
   - Snippets for common patterns

2. **dbaeumer.vscode-eslint** - ESLint
   - JavaScript/TypeScript linting
   - Auto-fix on save

3. **esbenp.prettier-vscode** - Prettier
   - Code formatting
   - Format on save enabled

4. **humao.rest-client** - REST Client
   - Test HTTP requests from `.http` files
   - Perfect for testing the CAP OData service

5. **eamodio.gitlens** - GitLens
   - Git supercharged features
   - Blame, history, and more

6. **ms-azuretools.vscode-docker** - Docker
   - Docker support (if needed for local development)

## 🔧 Configuration Details

### Port Forwarding

| Port | Service           | Auto-Forward |
|------|-------------------|--------------|
| 4004 | CAP Server        | Notify       |
| 8080 | UI Testing        | Silent       |

### Environment Variables

- `NODE_ENV=development`
- `CDS_ENV=development`

### Editor Settings

- **Format on Save**: Enabled
- **Default Formatter**: Prettier
- **ESLint Auto-fix**: Enabled on save
- **Line Endings**: LF (Unix-style)
- **Trim Trailing Whitespace**: Enabled
- **Insert Final Newline**: Enabled

## 🛠️ Setup Process

The `setup.sh` script runs automatically when the container is created and performs:

1. ✅ Installs global npm packages (`cds-dk`, `typescript`, `tsx`, `mbt`, `prettier`, `cds-mcp`)
2. ✅ Installs Cloud Foundry CLI v8
3. ✅ Installs CF MultiApps plugin
4. ✅ Runs `npm ci` to install project dependencies
5. ✅ Copies `.env.example` to `.env` (if not exists)
6. ✅ Generates TypeScript types with `cds-typer`

### Manual Setup (if needed)

If the automatic setup fails or you need to re-run it:

```bash
bash .devcontainer/setup.sh
```

## 📝 Common Tasks

### Start Development Server

```bash
npm run watch
```

Access at: `http://localhost:4004` (local) or forwarded URL (Codespaces)

### Run Tests

```bash
npm test
```

### Format Code

```bash
npm run format
```

### Build Project

```bash
npm run build
```

### Deploy to SAP BTP

```bash
# Login to Cloud Foundry
cf login -a <api-endpoint>

# Build MTA
npm run build:mta

# Deploy
npm run deploy:cf
```

## 🔍 Troubleshooting

### Container Build Fails

**Issue**: Container fails to build or setup

**Solution**:
1. Check Docker Desktop is running (local dev)
2. Ensure you have sufficient disk space
3. Try rebuilding: `F1` → **"Dev Containers: Rebuild Container"**

### Port Already in Use

**Issue**: Port 4004 already in use

**Solution**:
```bash
# Use a different port
PORT=4005 npm run watch
```

### npm ci Fails

**Issue**: `npm ci` fails during setup

**Solution**:
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Types Not Generated

**Issue**: `#cds-models/*` imports show errors

**Solution**:
```bash
# Regenerate types
npx cds-typer "*"

# Restart TypeScript server in VS Code
# Press F1 → "TypeScript: Restart TS Server"
```

### CF CLI Not Found

**Issue**: `cf` command not available

**Solution**:
```bash
# Re-run the setup script
bash .devcontainer/setup.sh

# Or install manually
wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo gpg --dearmor -o /usr/share/keyrings/cloudfoundry-cli.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudfoundry-cli.gpg] https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
sudo apt-get update
sudo apt-get install -y cf8-cli
```

## 🔐 Security Considerations

### Secrets Management

- ⚠️ **Never commit `.env` files with real credentials**
- ✅ Use GitHub Secrets for CI/CD
- ✅ Use Codespaces Secrets for development
- ✅ The `.env` file is in `.gitignore`

### Cloud Foundry Credentials

When using Codespaces, store CF credentials as Codespaces secrets:
1. Go to GitHub Settings → Codespaces → Secrets
2. Add secrets: `CF_API`, `CF_ORG`, `CF_SPACE`, `CF_USERNAME`, `CF_PASSWORD`
3. Access in terminal: `echo $CF_USERNAME`

## 📚 Additional Resources

### Devcontainer Documentation
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Dev Container Specification](https://containers.dev/)

### Project Documentation
- [README.md](../README.md) - Project overview
- [GETTING_STARTED.md](../GETTING_STARTED.md) - Getting started guide
- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Architecture documentation
- [ADR-0021](../docs/ADR/0021-devcontainer-github-codespaces.md) - Devcontainer decision record

### SAP Documentation
- [SAP CAP Documentation](https://cap.cloud.sap)
- [SAP Cloud Foundry](https://help.sap.com/docs/btp/sap-business-technology-platform/cloud-foundry-environment)
- [MTA Development](https://help.sap.com/docs/btp/sap-business-technology-platform/developing-multitarget-applications)

## 🤝 Contributing

When contributing to the devcontainer configuration:

1. Test changes locally first (using VS Code Dev Containers)
2. Document any new tools or extensions
3. Update this README if behavior changes
4. Test in a fresh Codespace before merging
5. Follow the project's [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines

## 📊 Performance Tips

### Speed Up Container Creation

1. **Pre-build containers**: Enable Codespaces pre-builds in repository settings
2. **Use shallow clones**: Already configured in GitHub Codespaces
3. **Cache dependencies**: The `node_modules` is cached between rebuilds

### Optimize Development Experience

1. **Use `npm run watch`**: Faster than rebuilding each time
2. **Leverage TypeScript watch mode**: `tsc --watch` in separate terminal
3. **Use REST Client**: Faster than switching to browser for API testing

## 🔄 Updates and Maintenance

### Updating Node.js Version

If `.nvmrc` is updated:
1. Update `devcontainer.json` → `features.node.version`
2. Test in a fresh container
3. Update this README

### Adding New Tools

1. Add to `setup.sh` or `devcontainer.json` features
2. Document in this README
3. Test thoroughly
4. Consider impact on container build time

### Updating VS Code Extensions

1. Add extension ID to `devcontainer.json` → `customizations.vscode.extensions`
2. Document purpose in this README
3. Consider if it should be required or optional

---

**Happy Coding in Codespaces! 🚀**

_For questions or issues with the devcontainer setup, please open an issue on GitHub._
