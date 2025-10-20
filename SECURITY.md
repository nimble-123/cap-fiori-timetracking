# Security Policy

## Supported Versions

We currently support the latest commit on the default branch. No backports are maintained.

## Reporting a Vulnerability

1. **Do not create a public issue.**
2. Contact the maintainers privately via the repository’s GitHub Security Advisory workflow or by sending a direct message through GitHub Discussions.
3. Include a detailed description of the issue, reproduction steps, and any suggested fixes.

We aim to acknowledge reports within 3 business days and provide status updates until the issue is resolved. Once a fix is available, we will coordinate a responsible disclosure timeline with you before publishing details.

## Security Best Practices

- Keep dependencies updated (`npm install`, `npm audit`, and SAP patch notes).
- Rotate any credentials used for external services (e.g., holiday APIs) and avoid storing secrets in the repository.
- Run automated tests (unit + integration) before deploying to production.
- Enable HTTPS and role-based access when deploying CAP services beyond local development.

Thank you for helping us keep the project secure.
