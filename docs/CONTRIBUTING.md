# Contributing to AI Installer Hub

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-installer-hub.git
   cd ai-installer-hub
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b your-feature
   ```

## Development Workflow

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Check types
npm run typecheck

# Lint code
npm run lint

# Test the CLI locally
node dist/index.js list
node dist/index.js doctor
```

## How to Contribute

### Add a New AI Tool

See [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md) for full instructions.

### Fix a Bug

1. Find an issue or create one describing the bug
2. Create a branch: `git checkout -b fix-description`
3. Write the fix with tests
4. Submit a PR

### Improve Documentation

- Fix typos, unclear instructions, or missing information
- Add examples for common use cases
- Translate documentation to other languages

### Improve Error Handling

- Better error messages
- More auto-repair strategies
- Better diagnostic output

## Code Standards

- TypeScript with strict mode
- ESLint for code style
- All public functions must have types
- No `any` types unless absolutely necessary
- Tests for core functionality

## Commit Messages

Use conventional commits:

```
feat: add Ollama installer plugin
fix: resolve port conflict detection on Windows
docs: improve installation guide
test: add env-detector tests
```

## Pull Request Process

1. Ensure your code passes `npm run lint` and `npm test`
2. Update documentation if needed
3. Describe what your PR does and why
4. Reference any related issues

## Areas We Need Help With

- **New AI tool installers** - See the list of tools we want to support
- **Linux distribution testing** - We need testing on more dists
- **Translation** - Chinese, Japanese, Korean, Spanish, etc.
- **Error messages** - More helpful, user-friendly messages
- **Performance** - Faster installation and detection
- **Documentation** - Better examples and tutorials

## Questions?

Open an issue with the `question` label. We're happy to help!
