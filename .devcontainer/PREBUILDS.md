# 🚀 Enabling Codespaces Pre-builds

Pre-builds significantly speed up Codespaces creation by pre-building the container image.

## Benefits

- ⚡ **10x faster**: Codespace ready in ~30 seconds instead of 3-5 minutes
- 💰 **Free**: Pre-build compute is included in GitHub Actions minutes
- 🔄 **Automatic**: Rebuilds on changes to `.devcontainer/*`, `package.json`, etc.
- 👥 **Team benefit**: All contributors get faster setup

## How to Enable (Repository Admin Only)

### Step 1: Access Settings

1. Navigate to the repository on GitHub
2. Click **Settings** (requires admin access)
3. Click **Codespaces** in the left sidebar

### Step 2: Configure Pre-builds

1. Click **Set up prebuild**
2. Configure:
   - **Branch**: `main` (and optionally `develop`)
   - **Configuration**: `.devcontainer/devcontainer.json`
   - **Regions**: Select your team's region (e.g., `Europe West`, `US East`)
   - **Trigger**:
     - ✅ Configuration change
     - ✅ On push (optional: only if you want every push to rebuild)
     - ✅ On schedule (optional: weekly)

3. Click **Create**

### Step 3: Wait for First Build

- First pre-build takes ~5-10 minutes
- Check progress in **Actions** tab
- Look for workflow: "Create and publish a dev container"

### Step 4: Verify

After first pre-build completes:

1. Create a new Codespace
2. Should be ready in ~30-60 seconds (instead of 3-5 minutes)
3. All tools pre-installed, no `setup.sh` needed

## Configuration Options

### Minimal (Recommended for Start)

```
Branch: main
Trigger: Configuration change only
Regions: 1 region (your primary)
```

**Cost**: ~5-10 minutes of Actions minutes per configuration change

### Aggressive (For Active Development)

```
Branch: main, develop
Trigger: Configuration change + On push
Regions: 2-3 regions (for global teams)
```

**Cost**: More Actions minutes, but fastest experience for all contributors

## Best Practices

### Do:

- ✅ Enable for `main` branch at minimum
- ✅ Choose region closest to your team
- ✅ Start with "configuration change" trigger only
- ✅ Add `develop` branch if you have frequent devcontainer changes

### Don't:

- ❌ Enable "on push" trigger for all branches (wastes Actions minutes)
- ❌ Select all regions unless you have a global team
- ❌ Pre-build feature branches (not necessary, wastes resources)

## Monitoring Pre-builds

### Check Pre-build Status

1. Go to **Settings** → **Codespaces**
2. Click on the pre-build configuration
3. View:
   - Last build time
   - Last build status
   - Actions minutes used

### Pre-build Failed?

Common causes:

- `setup.sh` script error
- Network timeout during `npm ci`
- Invalid `devcontainer.json` syntax

**Fix**:

1. Check Actions tab for error logs
2. Fix the issue in `.devcontainer/*`
3. Push to trigger new pre-build
4. Verify locally with Dev Containers first

## Cost Estimation

### GitHub Actions Minutes Usage

| Scenario                       | Pre-build Time | Frequency | Monthly Minutes |
| ------------------------------ | -------------- | --------- | --------------- |
| Config changes only            | ~10 min        | ~2/month  | ~20 min         |
| Config + push (main)           | ~10 min        | ~20/month | ~200 min        |
| Config + push (main + develop) | ~10 min        | ~40/month | ~400 min        |

**Reference**: GitHub Free includes 2,000 Actions minutes/month

### Storage Usage

- Each pre-build: ~2-4 GB
- Retained for 2 weeks
- Old pre-builds are automatically cleaned up

## Troubleshooting

### Pre-build Not Used

**Symptoms**: Codespace still takes 3-5 minutes to create

**Possible causes**:

1. Pre-build not completed yet (check Actions tab)
2. Created Codespace from branch without pre-build
3. Pre-build failed (check Settings → Codespaces)

**Solution**:

1. Ensure pre-build completed successfully
2. Create Codespace from `main` branch
3. Clear browser cache and retry

### Pre-build Out of Date

**Symptoms**: Codespace completes quickly but then runs setup steps

**Cause**: Pre-build is stale (> 2 weeks old or configuration changed)

**Solution**:

- Pre-builds auto-refresh on configuration changes
- Manually trigger: Push a trivial change to `.devcontainer/devcontainer.json` (e.g., add a comment)

## Alternative: Manual Pre-build

If you don't have admin access or want to test pre-builds:

### Using Dev Containers Locally

1. Open project in VS Code
2. **F1** → "Dev Containers: Rebuild Container"
3. Wait for build to complete
4. Image is cached locally for future use

### Push Pre-built Image to Registry

Advanced option for teams:

1. Build devcontainer locally
2. Tag and push to GitHub Container Registry
3. Reference pre-built image in `devcontainer.json`:

```json
{
  "image": "ghcr.io/nimble-123/cap-fiori-timetracking-devcontainer:latest"
  // ... rest of config
}
```

## Resources

- [GitHub Codespaces Pre-builds Docs](https://docs.github.com/en/codespaces/prebuilding-your-codespaces)
- [Dev Container Specification](https://containers.dev/)
- [GitHub Actions Billing](https://docs.github.com/en/billing/managing-billing-for-github-actions)

---

**Note**: Pre-builds are optional but highly recommended for active projects with multiple contributors.
