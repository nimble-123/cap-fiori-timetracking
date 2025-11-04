#!/bin/bash
set -e

echo "🔧 Setting up CAP Fiori Time Tracking development environment..."

# Install global npm tools
echo "📦 Installing global npm packages..."
npm install -g \
  @sap/cds-dk \
  typescript \
  tsx \
  mbt \
  prettier \
  @cap-js/mcp-server

# Install Cloud Foundry CLI
echo "☁️ Installing Cloud Foundry CLI..."
wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo gpg --dearmor -o /usr/share/keyrings/cloudfoundry-cli.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudfoundry-cli.gpg] https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
sudo apt-get update
sudo apt-get install -y cf8-cli

# Install CF MultiApps plugin
echo "🔌 Installing CF MultiApps plugin..."
cf install-plugin -r CF-Community "multiapps" -f || echo "MultiApps plugin may already be installed or failed to install"

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
