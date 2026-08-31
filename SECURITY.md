# Security Policy

## Reporting a vulnerability

Please do not disclose security vulnerabilities in public issues.

Use the repository's private security reporting mechanism when available. Include:

- affected component and version
- reproduction steps
- impact assessment
- suggested mitigation, if known

Never include passwords, API tokens, private keys, or other credentials in a report.

## Deployment security

- Keep Cloudflare API tokens out of the repository.
- Store deployment credentials in GitHub Actions Secrets.
- Do not commit `.env`, `.dev.vars`, or production credentials.
- Use least-privilege Cloudflare API tokens.
