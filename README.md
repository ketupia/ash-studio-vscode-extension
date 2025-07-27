# Ash Studio VS Code Extension

A VS Code extension that enhances development experience for the Ash Framework (Elixir) with
intelligent navigation and code insight tools.

## ✨ Features

- **🧭 Smart Navigation** - Jump between Ash sections with document outline integration
- **⚡ Quick Section Search** - Instantly find and navigate to any Ash section via Command Palette
- **📊 Sidebar Overview** - Dedicated panel showing all Ash sections and their hierarchy
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

### Navigation Features

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

### Supported Ash Constructs

The extension recognizes and navigates:

- **Resources & Domains**: Main Ash modules
- **Attributes**: Field definitions and types
- **Actions**: Create, read, update, delete operations
- **Relationships**: Associations between resources
- **Calculations**: Computed fields
- **Aggregates**: Data aggregations
- **Policies**: Authorization rules
- **Code Interface**: API definitions

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
- **Parser Strategy**: Choose parsing approach (Hybrid/Grammar-only/Simple-only)
- **Auto Refresh**: Automatically update sidebar when files change
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
