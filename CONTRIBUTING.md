# Contributing to Allied Solutions OS

Thank you for your interest in contributing to Allied Solutions OS! This document outlines our development process and contribution guidelines.

## Code of Conduct

- Respect and professionalism in all interactions
- Focus on constructive feedback
- Celebrate diverse perspectives
- Report issues responsibly

## Development Setup

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/ChaitanyaJoshi1769/AlliedSolutionsOS.git
cd AlliedSolutionsOS

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development environment
docker-compose up -d

# Run migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/FEATURE-NAME
# or for bug fixes:
git checkout -b fix/BUG-NAME
# or for documentation:
git checkout -b docs/DOC-NAME
```

Branch naming convention:
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions/improvements
- `chore/*` - Build, CI, dependencies

### 2. Make Changes

#### Code Style
- Use TypeScript strict mode
- Follow ESLint rules (enforced pre-commit)
- Follow Prettier formatting (enforced pre-commit)
- Write meaningful variable/function names
- Add JSDoc for public APIs

#### File Organization
```
src/
├── modules/          # Feature modules
├── common/           # Shared utilities, filters, interceptors
├── entities/         # Database entities
├── database/         # Migrations, seeds, configuration
├── observability/    # Monitoring & logging setup
└── config/           # Configuration management
```

#### Testing Requirements
- Unit tests for business logic (Jest)
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### 3. Keep Your Branch Updated

```bash
git fetch origin
git rebase origin/main
```

### 4. Run Quality Checks

```bash
# Lint code
pnpm lint

# Type check
pnpm type-check

# Format code
pnpm format

# Run tests
pnpm test

# All checks together
pnpm lint && pnpm type-check && pnpm test
```

### 5. Commit Changes

Commit messages should be clear and descriptive:

```
feat: add fraud detection graph engine

- Initialize Neo4j integration
- Create fraud entity relationships
- Implement anomaly detection algorithm
```

Commit message format:
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes (formatting, semi-colons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions/changes
- `chore` - Build, CI, dependencies

### 6. Push and Create Pull Request

```bash
git push origin feature/FEATURE-NAME
```

Then create a PR on GitHub with:

**Title**: Short, descriptive title
**Description**: Include:
- What problem does this solve?
- How does it solve it?
- Links to related issues
- Testing instructions
- Screenshots (for UI changes)

Example:
```markdown
## Description
Implements fraud detection graph engine using Neo4j for real-time risk assessment.

## Changes
- Added Neo4j database integration
- Implemented entity relationship mapping
- Created fraud scoring algorithm
- Added unit tests (92% coverage)

## Testing
1. Start the dev environment: `docker-compose up`
2. Run migrations: `pnpm db:migrate`
3. Run tests: `pnpm test`
4. Check API: `curl http://localhost:3001/health`

Fixes #123
```

### 7. Code Review Process

- At least 2 approvals required
- CI/CD pipeline must pass
- All conversations must be resolved
- Auto-squash commits before merge

## Pull Request Review Criteria

### Code Quality
- [ ] Follows project conventions
- [ ] No console.log or debug code
- [ ] Proper error handling
- [ ] No hardcoded values
- [ ] TypeScript strict mode compliance

### Testing
- [ ] Unit tests included
- [ ] Integration tests included
- [ ] Test coverage >= 80%
- [ ] All tests passing locally

### Documentation
- [ ] JSDoc comments on public functions
- [ ] README updated (if necessary)
- [ ] API documentation updated
- [ ] CHANGELOG updated

### Security
- [ ] No sensitive data in code
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] XSS prevention implemented
- [ ] Authentication/authorization correct

## Project Structure Guidelines

### Adding a New Module

1. Create module directory: `src/modules/my-feature/`
2. Create required files:
   ```
   my-feature/
   ├── my-feature.module.ts
   ├── my-feature.controller.ts
   ├── my-feature.service.ts
   ├── dto/
   │  ├── create-my-feature.dto.ts
   │  └── update-my-feature.dto.ts
   ├── entities/
   │  └── my-feature.entity.ts
   └── __tests__/
      └── my-feature.service.spec.ts
   ```

3. Register in AppModule

4. Implement CRUD operations with proper validation

5. Add GraphQL resolver (if needed)

### Adding a Database Entity

1. Create entity file in `src/entities/`
2. Add TypeORM decorators
3. Create migration: `pnpm db:migrate:create`
4. Update migration with SQL
5. Run migration: `pnpm db:migrate`
6. Add to TypeOrmModule imports

### Adding a New Service

Services should:
- Have single responsibility
- Use dependency injection
- Have proper error handling
- Be testable (inject dependencies)
- Have comprehensive unit tests

## Testing Guidelines

### Unit Tests
```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should hash password on creation', () => {
    const result = service.createUser({...});
    expect(result.passwordHash).toBeDefined();
  });
});
```

### Integration Tests
- Test API endpoints
- Use test database
- Mock external services
- Clean up test data

### E2E Tests
- Test complete user flows
- Use test environment
- Verify real responses
- Clean up test data

## Documentation

- Keep README up-to-date
- Document complex logic
- Add examples for public APIs
- Maintain ARCHITECTURE.md
- Keep API docs in sync with code

## Performance Considerations

- Avoid N+1 queries
- Use database indexes properly
- Cache when appropriate
- Optimize database queries
- Use pagination for large datasets
- Profile before optimizing

## Security Best Practices

- Never commit secrets or API keys
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Use HTTPS in production
- Add CSRF protection
- Sanitize user inputs
- Follow OWASP guidelines

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release commit
4. Tag commit: `git tag v1.0.0`
5. Push with tags: `git push --tags`
6. Create GitHub release
7. Build and deploy

## Getting Help

- Open an issue for bugs
- Check existing issues first
- Ask in discussions for questions
- Tag maintainers if urgent
- Include error logs and reproduction steps

## Recognition

Contributors will be:
- Thanked in CHANGELOG.md
- Added to CONTRIBUTORS.md
- Featured in release notes (for major contributions)
- Invited to contributor meetups

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to Allied Solutions OS! 🎉
