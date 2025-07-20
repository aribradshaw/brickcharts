# 🤝 Contributing to BrickCharts

We love your input! We want to make contributing to BrickCharts as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Setup

1. **Fork the repo** and clone your fork
```bash
git clone https://github.com/aribradshaw/brickcharts.git
cd brickcharts
```

2. **Install dependencies**
```bash
npm install
```

3. **Test that everything works**
```bash
npm run test:interactive  # Interactive testing
npm run demo             # Core demo
npm test                 # Unit tests
npm run build           # Build validation
```

## 🐛 Bug Reports

Great bug reports tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

**Use the interactive tester** to help reproduce issues:
```bash
npm run test:interactive
```

## 💡 Feature Requests

We use GitHub Issues to track feature requests. When suggesting a feature:

1. **Check existing issues** first
2. **Describe the feature** clearly
3. **Explain the use case** - why would this be useful?
4. **Consider the scope** - should this be in core or a plugin?

## 🔧 Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**
3. **Add tests** if you've added code that should be tested
4. **Update documentation** if you changed APIs
5. **Ensure tests pass**: `npm test`
6. **Ensure builds work**: `npm run build`
7. **Test interactively**: `npm run test:interactive`
8. **Create the pull request**

### Code Style

- Use **TypeScript** for all new code
- Follow existing code style
- Use **ESLint** and **Prettier** (run `npm run lint` and `npm run format`)
- Add **JSDoc comments** for public APIs

### Testing

- **Unit tests** for core functionality
- **Integration tests** for client interactions
- **Performance tests** for caching and search
- **Interactive tests** for manual verification

```bash
# Run specific test types
npm test                    # Unit tests
npm run test:coverage      # Coverage report  
npm run test:interactive   # Manual testing
npm run demo              # Integration demo
```

## 📂 Project Structure

```
src/
├── core/          # Main BrickCharts class
├── clients/       # Data source clients (Billboard, Last.FM)
├── data/          # Caching and data management
├── search/        # Advanced search engine
├── export/        # Export functionality
├── components/    # React visualization components
├── utils/         # Utility functions
└── types/         # TypeScript type definitions

tests/             # Test files
demo/              # Demo applications
docs/              # Documentation
```

## 🎯 Contributing Areas

### 🔥 High Impact, Easy Wins
- **Bug fixes** in existing functionality
- **Documentation improvements**
- **Additional export formats** (Excel, PDF)
- **More React components** (Bar, Bubble, Heatmap)
- **Billboard chart type additions** - New chart categories

### 🚀 New Features
- **Additional chart sources** - Spotify, Apple Music, etc.
- **Real-time updates** - WebSocket support
- **Mobile components** - React Native equivalents
- **Enhanced Billboard integration** - Historical data improvements
- **Performance optimizations** - Faster chart fetching and caching

### 🧪 Advanced
- **Performance optimizations**
- **Machine learning** - Trend prediction
- **Chart animations** - Smooth transitions
- **Offline support** - Service worker integration
- **Billboard API enhancements** - Custom chart types and data processing
- **Advanced caching strategies** - Multi-level caching and prefetching

## 📋 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add CSV export validation
fix: handle empty search results correctly
docs: update API reference for SearchEngine
test: add unit tests for export manager
perf: optimize chart data caching
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `perf`: Performance improvement
- `refactor`: Code change that neither fixes a bug nor adds a feature

## 🔍 Review Process

1. **Automated checks** must pass (tests, build, linting)
2. **Manual review** by maintainers
3. **Interactive testing** if the change affects user experience
4. **Documentation review** if APIs changed

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🆘 Getting Help

- **Discord/Discussions**: [Link to community]
- **Issues**: For bugs and feature requests
- **Email**: For private security issues

## 🎉 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special recognition for major features

---

## 💝 Thank You!

Your contributions make BrickCharts better for everyone. Whether it's a typo fix or a major feature, every contribution matters!

**Happy coding!** 🎵 