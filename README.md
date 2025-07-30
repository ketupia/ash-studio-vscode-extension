# Ash Studio VS Code Extension

Working with Ash Framework projects often means dealing with long resource files, making it hard to find and navigate between sections.

Ash Studio is a VS Code extension that solves this by providing navigation and code insight tools, helping you quickly jump between Ash DSL blocks and understand your code structure at a glance.

## ✨ Features

- **🧭 Smart Navigation** - Jump between Ash sections with document outline integration
- **⚡ Quick Section Search** - Instantly find and navigate to any Ash section via Command Palette
- **📊 Sidebar Overview** - Dedicated panel showing all Ash sections and their hierarchy
- **📚 Documentation Links** - CodeLens provides direct links to Ash documentation for DSL blocks
- **�️ Robust Parsing** - Works reliably with complex Ash files using intelligent fallback
  strategies

## 📦 Installation

### From VSIX File

1. Download the latest `ash-studio-x.x.x.vsix` file
2. Open VS Code
3. Go to Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file
6. Reload VS Code when prompted

### Requirements

- VS Code 1.75.0 or higher
- Ash Framework project with `.ex` files using `Ash.Resource` or `Ash.Domain`

## 🚀 Getting Started

1. **Open an Ash Project**: Open any folder containing Ash Framework `.ex` files
2. **Open Ash Files**: The extension activates when you open files with `use Ash.Resource` or
   `use Ash.Domain`
3. **Explore Features**:
   - **Sidebar Panel**: Look for "Ash Studio" in the Explorer sidebar
   - **Document Outline**: View Ash sections in VS Code's Outline panel
   - **Quick Navigation**: Use `Cmd+Shift+P` → "Go to Ash Section..."

## 🎯 Usage

### Navigation and Documentation Features

**Sidebar Navigation**

- View all Ash sections organized by type (attributes, actions, relationships, etc.)
- Click any section to jump directly to it in the code
- Hierarchical view shows section details and nested elements

**Quick Pick Navigation**

- Press `Cmd+Shift+P` (Ctrl+Shift+P on Windows/Linux)
- Type "Go to Ash Section" or just "ash"
- Select any section for instant navigation

**Document Outline**

- Use VS Code's built-in Outline panel
- See all Ash sections as navigable tree structure
- Click to jump to any section

**CodeLens Documentation Links**

- Enable CodeLens in settings (see Configuration section)
- Hover over DSL blocks like `resource`, `authentication`, etc. to see documentation links
- Click on CodeLens links to open relevant Ash Framework documentation in your browser

### Supported Ash Constructs

#### Core Ash Framework

The extension recognizes and navigates these core Ash DSL blocks:

- **Resources**: `resource`, `attributes`, `actions`, `relationships`, `calculations`, `aggregates`,
  `policies`, `code_interface`
- **Domain**: `resources`
- **PubSub**: `pub_sub`

#### Ash Ecosystem Libraries

The extension also supports DSL blocks from popular Ash libraries:

- **AshAdmin**: `admin`
- **AshAuthentication**: `authentication`, `strategies`
- **AshPaperTrail**: `paper_trail`
- **AshPostgres**: `postgres`

## 🐛 Troubleshooting

**Extension not activating?**

- Ensure your `.ex` files contain `use Ash.Resource` or `use Ash.Domain`
- Check that file extensions are `.ex` (not `.exs`)

**Sidebar showing as empty?**

- Open an Ash file (Resource or Domain)
- Check VS Code's Output panel → "Ash Studio" for parsing logs
- Verify the file has recognizable Ash DSL sections

**Performance with large files?**

- The extension automatically uses optimized parsing for complex files
- Large files (>5000 lines) use fast simple parser mode
- No action needed - this is automatic and transparent

**Missing sections in navigation?**

- Complex or malformed DSL blocks may not be recognized
- Check VS Code Output → "Ash Studio" for parsing details
- File an issue with example code if needed

## 🔧 Configuration

Access settings via VS Code Preferences → Extensions → Ash Studio:

- **Log Level**: Control debug output (Error/Warning/Info/Debug)
- **Auto Refresh**: Automatically update sidebar when files change
- **CodeLens**: Enable or disable documentation links in Elixir files
- **Performance**: Enable metrics collection and tune parsing delays

## 💬 Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/ketupia/ash-studio-vscode-extension/issues)
- **Feature Requests**: Use GitHub Issues with "enhancement" label
- **Questions**: Start a
  [GitHub Discussion](https://github.com/ketupia/ash-studio-vscode-extension/discussions)

## 🏗️ For Developers

Interested in contributing or understanding the architecture? See our comprehensive developer
documentation:

- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup, quality standards, and contribution
  guidelines
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Technical design and implementation details
- **[Feature Roadmap](docs/feature-plan.md)** - Planned features and development priorities

---

**Made with ❤️ for the Ash Framework community**
