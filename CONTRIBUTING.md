# Contributing to MindFlow Platform

Thank you for your interest in contributing to the MindFlow Construction Platform!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ConstructionPlatform.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Set up your development environment (see [QUICK_START.md](./QUICK_START.md))

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### Commit Messages

We use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(customers): add customer search functionality
fix(auth): resolve JWT expiration issue
docs(api): update authentication endpoint docs
```

## Code Standards

### TypeScript

- **Strict mode enabled** - No `any` types
- Use explicit type annotations for function parameters and returns
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values

### React (Frontend)

- Functional components with hooks
- Use React Query for server state
- Co-locate tests with components
- Follow component naming: `PascalCase.tsx`

### Node.js (Backend)

- Use async/await for asynchronous operations
- Validate all inputs with Zod schemas
- Follow file naming: `camelCase.ts` with suffixes (`.controller.ts`, `.service.ts`)
- Handle errors explicitly (no empty catch blocks)

### Testing

- **Required coverage:** 80%+
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Ensure all tests pass:**
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

3. **Update documentation** if needed

4. **Create the PR** with:
   - Clear title following commit conventions
   - Description of changes
   - Screenshots for UI changes
   - Link to related issues

5. **Request review** from maintainers

6. **Address feedback** and update as needed

## Code Review Guidelines

### For Authors

- Keep PRs focused and small (<400 lines when possible)
- Provide context in PR description
- Respond to feedback promptly
- Be open to suggestions

### For Reviewers

- Be respectful and constructive
- Explain the "why" behind suggestions
- Approve when satisfied, don't nitpick
- Focus on correctness, security, and maintainability

## Project Structure

```
frontend/src/
├── components/     # Reusable UI components
│   ├── common/     # Generic components (Button, Modal)
│   ├── layout/     # Layout components (Header, Sidebar)
│   └── [domain]/   # Domain-specific components
├── pages/          # Route pages
├── services/       # API client services
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
└── types/          # TypeScript types

backend/src/
├── routes/         # API route definitions
├── controllers/    # Request handlers
├── services/       # Business logic
├── middleware/     # Express middleware
├── validators/     # Input validation
└── types/          # TypeScript types
```

## Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Report security vulnerabilities privately to security@mindflow.com
- Follow OWASP guidelines

## Questions?

- Check existing issues and discussions
- Open a discussion for questions
- Join our Discord community

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project.

---

Thank you for contributing to MindFlow Platform!
