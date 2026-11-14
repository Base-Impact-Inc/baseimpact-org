# Security Policy

## Supported Versions

We take security seriously. The following versions are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Yes             |
| Previous| ❌ No              |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to **[YOUR SECURITY EMAIL]**.

We will acknowledge receipt within 48 hours and provide a more detailed response within 7 days indicating the next steps in handling your report.

## What to Include

Please include the following information in your report:

- Type of issue (e.g., XSS, SQL injection, authentication bypass, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker could exploit it
- Any suggested fixes or mitigations

## Security Considerations for Base Impact

### Crisis User Safety
This platform serves neighbors in crisis (homelessness, domestic violence, food insecurity). Security issues that could:
- Expose user location or personal information
- Compromise resource verification integrity
- Enable impersonation of legitimate resources
- Disrupt access to emergency contacts (211, 988)

...are treated as **CRITICAL** severity.

### Data Handling
- **No PII stored** — We do not collect or store personally identifiable information from directory users
- **Report submissions** — "Report an issue" forms collect optional email only for follow-up; stored in Cloudflare D1 with TTL
- **Analytics** — Cloudflare Web Analytics (no cookies, no IP tracking)
- **No authentication** — Public directory, no user accounts

### Infrastructure
- **Cloudflare Workers** — Edge compute, DDoS protection included
- **D1 Database** — SQLite at edge, parameterized queries only
- **Turnstile** — Bot protection on forms
- **Content Security Policy** — Configured via Cloudflare Workers headers

### Dependencies
- `npm audit` run in CI on every PR
- Dependabot alerts enabled
- Only production dependencies in `package.json` (devDependencies excluded from build)

## Disclosure Policy

- We aim to patch critical vulnerabilities within 7 days of verification
- We will publicly disclose fixed vulnerabilities after users have had time to update
- We credit reporters who follow responsible disclosure (unless anonymity requested)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Cloudflare Security](https://www.cloudflare.com/security/)

---

**Contact:** [YOUR SECURITY EMAIL]  
**PGP Key:** [YOUR PGP KEY IF AVAILABLE]