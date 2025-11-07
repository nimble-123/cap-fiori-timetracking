#!/bin/bash
set -e

echo "🔧 Setting up CAP Fiori Time Tracking development environment..."

# Install Starship prompt
echo "⭐ Installing Starship prompt..."
curl -sS https://starship.rs/install.sh | sh -s -- -y

# Configure Starship for bash
if ! grep -q "starship init bash" ~/.bashrc; then
  echo 'eval "$(starship init bash)"' >> ~/.bashrc
fi

# Copy Starship configuration
mkdir -p ~/.config
cp /workspace/.devcontainer/starship.toml ~/.config/starship.toml
echo "✨ Starship prompt configured with Git info, Node version, and more!"

# Install global npm tools
echo "📦 Installing global npm packages..."
npm install -g \
  @sap/cds-dk \
  typescript \
  tsx \
  mbt \
  prettier \
  @cap-js/mcp-server \
  @sap/appfront-cli

# Install Cloud Foundry CLI
echo "☁️ Installing Cloud Foundry CLI..."
wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo gpg --dearmor -o /usr/share/keyrings/cloudfoundry-cli.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudfoundry-cli.gpg] https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
sudo apt-get update
sudo apt-get install -y cf8-cli

# Install CF MultiApps plugin
echo "🔌 Installing CF MultiApps plugin..."
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

# Map architecture names
case $ARCH in
  x86_64)
    ARCH_NAME="amd64"
    ;;
  aarch64|arm64)
    ARCH_NAME="arm64"
    ;;
  *)
    echo "⚠️  Unsupported architecture: $ARCH. Skipping MultiApps plugin installation."
    ARCH_NAME=""
    ;;
esac

# Map OS names
case $OS in
  linux)
    OS_NAME="linux"
    ;;
  darwin)
    OS_NAME="darwin"
    ;;
  *)
    echo "⚠️  Unsupported OS: $OS. Skipping MultiApps plugin installation."
    OS_NAME=""
    ;;
esac

# Download and install the plugin if architecture and OS are supported
if [ -n "$ARCH_NAME" ] && [ -n "$OS_NAME" ]; then
  PLUGIN_VERSION="3.8.0"
  PLUGIN_URL="https://github.com/cloudfoundry/multiapps-cli-plugin/releases/download/v${PLUGIN_VERSION}/multiapps-plugin.${OS_NAME}${ARCH_NAME}"
  PLUGIN_FILE="/tmp/multiapps-plugin"

  echo "Downloading MultiApps plugin v${PLUGIN_VERSION} for ${OS_NAME}-${ARCH_NAME}..."
  wget -q -O "$PLUGIN_FILE" "$PLUGIN_URL"
  chmod +x "$PLUGIN_FILE"

  echo "Installing MultiApps plugin..."
  cf install-plugin "$PLUGIN_FILE" -f || echo "⚠️  MultiApps plugin installation failed. You can install it manually later."

  rm -f "$PLUGIN_FILE"
else
  echo "⚠️  Skipping MultiApps plugin installation due to unsupported platform."
fi

# Install CF Autoscaler plugin
echo "🔌 Installing CF Autoscaler plugin..."
if [ -n "$ARCH_NAME" ] && [ -n "$OS_NAME" ]; then
  AUTOSCALER_VERSION="4.1.2"
  AUTOSCALER_URL="https://github.com/cloudfoundry/app-autoscaler-cli-plugin/releases/download/v${AUTOSCALER_VERSION}/ascli-${OS_NAME}-${ARCH_NAME}-${AUTOSCALER_VERSION}-release+0"
  AUTOSCALER_FILE="/tmp/autoscaler-plugin"

  echo "Downloading Autoscaler plugin v${AUTOSCALER_VERSION} for ${OS_NAME}-${ARCH_NAME}..."
  wget -q -O "$AUTOSCALER_FILE" "$AUTOSCALER_URL"
  chmod +x "$AUTOSCALER_FILE"

  echo "Installing Autoscaler plugin..."
  cf install-plugin "$AUTOSCALER_FILE" -f || echo "⚠️  Autoscaler plugin installation failed. You can install it manually later."

  rm -f "$AUTOSCALER_FILE"
else
  echo "⚠️  Skipping Autoscaler plugin installation due to unsupported platform."
fi

# Install CF HTML5 Apps Repository plugin
echo "🔌 Installing CF HTML5 Apps Repository plugin..."
if [ -n "$ARCH_NAME" ] && [ -n "$OS_NAME" ]; then
  # Map architecture for HTML5 plugin (uses different naming)
  case $ARCH_NAME in
    amd64)
      HTML5_ARCH="amd64"
      ;;
    arm64)
      HTML5_ARCH="arm64"
      ;;
  esac

  HTML5_URL="https://github.com/SAP/cf-html5-apps-repo-cli-plugin/releases/latest/download/cf-html5-apps-repo-cli-plugin-${OS_NAME}-${HTML5_ARCH}"
  HTML5_FILE="/tmp/html5-plugin"

  echo "Downloading HTML5 Apps Repository plugin for ${OS_NAME}-${HTML5_ARCH}..."
  wget -q -O "$HTML5_FILE" "$HTML5_URL"
  chmod +x "$HTML5_FILE"

  echo "Installing HTML5 Apps Repository plugin..."
  cf install-plugin "$HTML5_FILE" -f || echo "⚠️  HTML5 Apps Repository plugin installation failed. You can install it manually later."

  rm -f "$HTML5_FILE"
else
  echo "⚠️  Skipping HTML5 Apps Repository plugin installation due to unsupported platform."
fi

# Install project dependencies
echo "📚 Installing project dependencies..."
npm ci

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
  echo "⚙️ Creating .env file from .env.example..."
  cp .env.example .env
fi

# Generate TypeScript types
echo "🎯 Generating TypeScript types..."
npx cds-typer "*" || echo "Type generation completed with warnings"

# Print success message
echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "🚀 Quick Start Commands:"
echo "  npm run watch    - Start development server with auto-reload"
echo "  npm test         - Run tests"
echo "  npm run format   - Format code with Prettier"
echo "  npm run build    - Build the project"
echo ""
echo "🌐 After running 'npm run watch', access the app at:"
echo "  http://localhost:4004"
echo ""
echo "🔐 Test Users:"
echo "  max.mustermann@test.de / max"
echo "  erika.musterfrau@test.de / erika"
echo ""
