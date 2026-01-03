# Security Policy

Security policy for `@aibos/kernel`.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security details to: [security@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

### For Users

- **Keep dependencies updated**
  ```bash
  npm audit
  npm audit fix
  ```

- **Validate kernel integrity**
  ```typescript
  import { validateKernelIntegrity } from "@aibos/kernel";
  validateKernelIntegrity();
  ```

- **Use type-safe imports**
  ```typescript
  // ✅ Good - Type-safe
  import { CONCEPT } from "@aibos/kernel";
  
  // ❌ Bad - Potential injection
  const concept = userInput; // Never trust user input
  ```

### For Contributors

- **Never commit secrets**
  - API keys
  - Passwords
  - Private keys
  - Tokens

- **Validate all inputs**
  - Use Zod schemas
  - Validate against kernel contract
  - Sanitize user inputs

- **Follow secure coding practices**
  - No eval() or similar
  - No SQL injection risks
  - No XSS vulnerabilities

## Security Considerations

### Type Safety

The kernel's type-safe design prevents many security issues:

- **No raw strings** - Prevents injection attacks
- **Compile-time validation** - Catches errors early
- **Runtime validation** - Zod schemas validate data

### Package Integrity

- **NPM package verification** - Use `npm ci` for reproducible installs
- **Lock file integrity** - Commit `pnpm-lock.yaml`
- **Dependency scanning** - Regular `npm audit`

### Database Security

- **Snapshot validation** - Prevents unauthorized changes
- **Drift detection** - CI/CD validates database state
- **Access control** - Database-level permissions

## Known Security Considerations

### Kernel as SSOT

The kernel is the Single Source of Truth. This means:
- **Unauthorized changes** to kernel definitions could affect entire platform
- **Version control** is critical
- **Access control** to kernel repository is important

### Mitigation

- Repository access controls
- Code review requirements
- Automated validation
- Snapshot verification

## Security Updates

Security updates are released as:
- **Patch versions** for non-breaking fixes
- **Minor versions** for security enhancements
- **Major versions** for breaking security changes

## Related Documentation

- **[Contributing Guidelines](./contributing.md)** - Contribution process
- **[Release Process](./release-process.md)** - Versioning and releases
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Code Standards](./code-standards.md)** - Secure coding practices

