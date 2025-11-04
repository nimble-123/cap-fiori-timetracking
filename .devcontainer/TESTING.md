# 🧪 Devcontainer Testing Checklist

This checklist ensures the devcontainer configuration works correctly in both GitHub Codespaces and local Dev Containers.

## Pre-Testing Requirements

- [ ] Docker Desktop installed and running (for local testing)
- [ ] VS Code with Dev Containers extension installed
- [ ] GitHub account with Codespaces access

---

## ✅ Test 1: GitHub Codespaces

### 1.1 Initial Setup

- [ ] Click "Open in GitHub Codespaces" badge from README
- [ ] Codespace creation starts (~3-5 minutes)
- [ ] Container builds without errors
- [ ] Terminal shows completion message: "🚀 CAP Fiori Time Tracking Devcontainer is ready!"

### 1.2 Environment Verification

```bash
# Verify Node.js version
node --version
# Expected: v22.20.0

# Verify npm
npm --version
# Expected: 10.x.x or higher

# Verify Java
java -version
# Expected: openjdk version "17.x.x" (Temurin)

# Verify SAP tools
cds version
# Expected: @sap/cds version 9.x.x or higher

mbt --version
# Expected: MBT version x.x.x

cf --version
# Expected: cf version 8.x.x

# Verify CF plugin
cf plugins | grep multiapps
# Expected: multiapps plugin listed

# Verify TypeScript
tsc --version
# Expected: Version 5.x.x
```

### 1.3 VS Code Extensions

Check installed extensions (Extensions panel):
- [ ] SAP CDS Language Support (SAPSE.vscode-cds)
- [ ] ESLint (dbaeumer.vscode-eslint)
- [ ] Prettier (esbenp.prettier-vscode)
- [ ] REST Client (humao.rest-client)
- [ ] GitLens (eamodio.gitlens)
- [ ] Docker (ms-azuretools.vscode-docker)

### 1.4 Project Dependencies

```bash
# Check if dependencies are installed
ls -la node_modules | head -10
# Expected: node_modules directory exists with packages

# Verify TypeScript types generated
ls -la @cds-models
# Expected: @cds-models directory with generated types

# Check .env file
cat .env
# Expected: .env file exists with environment variables
```

### 1.5 Development Server

```bash
# Start development server
npm run watch
```

- [ ] Server starts without errors
- [ ] Shows: "server listening on { url: 'http://localhost:4004' }"
- [ ] Port forwarding notification appears
- [ ] Click "Open in Browser"
- [ ] CAP welcome page loads with UI links

### 1.6 Application Access

In the forwarded browser tab:
- [ ] Navigate to `/io.nimble.timetable/`
- [ ] Login with `max.mustermann@test.de` / `max`
- [ ] List Report loads successfully
- [ ] Navigate to `/io.nimble.timetracking/`
- [ ] Dashboard loads successfully
- [ ] Navigate to `/$api-docs/odata/v4/track/`
- [ ] Swagger UI loads successfully

### 1.7 Development Workflow

```bash
# Run tests
npm test
# Expected: Tests pass

# Check formatting
npm run format:check
# Expected: No formatting issues

# Build project
npm run build
# Expected: Build succeeds, gen/ directory created
```

### 1.8 Port Forwarding

- [ ] Port 4004 forwarding shows "notify" badge
- [ ] Port 8080 forwarding is silent
- [ ] Forwarded URLs use HTTPS: `https://[codespace-name]-4004.app.github.dev`
- [ ] Can access app from mobile device using forwarded URL

---

## ✅ Test 2: VS Code Dev Containers (Local)

### 2.1 Initial Setup

```bash
# Clone repository
git clone https://github.com/nimble-123/cap-fiori-timetracking.git
cd cap-fiori-timetracking

# Open in VS Code
code .
```

- [ ] VS Code opens project
- [ ] Notification appears: "Folder contains a Dev Container configuration file"
- [ ] Click "Reopen in Container"
- [ ] Container builds (~3-5 minutes first time)
- [ ] Terminal shows: "🚀 CAP Fiori Time Tracking Devcontainer is ready!"

### 2.2 Environment Verification

Run same checks as Test 1.2 (Environment Verification)

### 2.3 Port Forwarding (Local)

- [ ] Ports tab shows 4004 and 8080
- [ ] Click on port 4004 → Opens `http://localhost:4004`
- [ ] Application loads correctly

### 2.4 Development Workflow

Run same checks as Test 1.7 (Development Workflow)

---

## ✅ Test 3: Setup Script Idempotency

Test that `setup.sh` can be run multiple times without errors:

```bash
# Run setup script again
bash .devcontainer/setup.sh
```

- [ ] Script completes without errors
- [ ] Shows "✅ Development environment setup complete!"
- [ ] No duplicate installations
- [ ] All tools still work after re-run

---

## ✅ Test 4: Editor Settings

### 4.1 Prettier Integration

1. Open a `.ts` file
2. Add extra spaces or formatting issues
3. Save file (Ctrl+S / Cmd+S)
- [ ] File automatically formats on save

### 4.2 ESLint Integration

1. Open a `.ts` file
2. Add an unused variable: `const unused = 123;`
- [ ] ESLint shows warning/error
3. Save file
- [ ] Auto-fix applies if configured

### 4.3 CDS Language Support

1. Open `db/data-model.cds`
- [ ] Syntax highlighting works
- [ ] IntelliSense shows CDS keywords
- [ ] No errors for valid CDS syntax

---

## ✅ Test 5: Cloud Foundry Integration

### 5.1 CF Login (Optional - requires BTP account)

```bash
# Login to Cloud Foundry
cf login -a <api-endpoint>
```

- [ ] CF CLI works
- [ ] Can authenticate
- [ ] Can list services: `cf services`

### 5.2 MTA Build

```bash
# Build MTA
npm run build:mta
```

- [ ] MTA build completes
- [ ] Creates `gen/mta.mtar` file
- [ ] No Java errors

---

## ✅ Test 6: Secrets Management (Codespaces Only)

### 6.1 Set Codespace Secret

1. GitHub → Settings → Codespaces → Secrets
2. Add secret: `TEST_SECRET` = `test-value`
3. In Codespace terminal:

```bash
echo $TEST_SECRET
# Expected: test-value
```

- [ ] Secret is accessible in Codespace
- [ ] Secret is NOT in git

---

## ✅ Test 7: Performance

### 7.1 Container Creation Time

- [ ] **First creation**: 3-5 minutes (acceptable)
- [ ] **With pre-builds**: < 60 seconds (if enabled)
- [ ] **Subsequent rebuilds**: 2-3 minutes (cached layers)

### 7.2 Hot Reload

1. Start `npm run watch`
2. Edit a `.ts` file in `srv/`
3. Save file
- [ ] Server automatically reloads
- [ ] Changes reflected immediately
- [ ] No manual restart needed

---

## ✅ Test 8: Documentation Accuracy

- [ ] `.devcontainer/README.md` - All commands work
- [ ] `.devcontainer/QUICKSTART.md` - Quick commands succeed
- [ ] `README.md` Codespaces badge links work
- [ ] `GETTING_STARTED.md` - All three options documented correctly
- [ ] `docs/ADR/0021-*` - Decision record is accurate

---

## 🐛 Known Issues to Test

### Issue 1: Port Already in Use

```bash
# Kill existing process
lsof -ti:4004 | xargs kill -9
# Or use alternative port
PORT=4005 npm run watch
```

- [ ] Workaround documented and works

### Issue 2: TypeScript Types Not Generated

```bash
# Regenerate types
npx cds-typer "*"
```

- [ ] Types regenerate successfully
- [ ] No import errors in VS Code

---

## 📊 Test Results Template

Copy this template for test runs:

```markdown
## Test Run: [Date]

**Tester**: [Name]
**Environment**: [Codespaces / Dev Containers / Both]
**Branch**: [Branch name]

### Results

- [ ] Test 1: GitHub Codespaces - PASS/FAIL
- [ ] Test 2: Dev Containers Local - PASS/FAIL
- [ ] Test 3: Setup Script Idempotency - PASS/FAIL
- [ ] Test 4: Editor Settings - PASS/FAIL
- [ ] Test 5: CF Integration - PASS/FAIL/SKIP
- [ ] Test 6: Secrets - PASS/FAIL/SKIP
- [ ] Test 7: Performance - PASS/FAIL
- [ ] Test 8: Documentation - PASS/FAIL

### Issues Found

1. [Description of issue]
   - **Severity**: Critical/High/Medium/Low
   - **Workaround**: [If available]

### Notes

[Any additional observations]
```

---

## 🔧 Troubleshooting During Testing

### Container Build Fails

1. Check Docker Desktop is running
2. Check available disk space (need ~10GB free)
3. Try: `Dev Containers: Rebuild Container Without Cache`

### Setup Script Fails

1. Check internet connectivity
2. Check npm registry access
3. Check CloudFoundry CLI download URL
4. Review logs in terminal output

### TypeScript Errors After Setup

1. Reload VS Code window: `Cmd+Shift+P` → "Reload Window"
2. Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
3. Delete and regenerate: `rm -rf @cds-models && npx cds-typer "*"`

---

## ✅ Sign-Off

After completing all tests:

- [ ] All critical tests pass
- [ ] Documentation is accurate
- [ ] Performance is acceptable
- [ ] Known issues documented
- [ ] Ready for production use

**Tested by**: ___________________
**Date**: ___________________
**Signature**: ___________________
