# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do NOT open a public GitHub issue.**

Instead, please email: **ridho.arachman22@gmail.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

You should receive a response within **48 hours**. We will work with you to understand and address the issue before any public disclosure.

## Enforced Controls

- Cloudflare Turnstile is fail-closed in production (`TURNSTILE_SECRET_KEY` is required at boot; CI/build uses the official test keys).
- Test bypasses (`DISABLE_RATE_LIMIT`, empty captcha) are ignored when `NODE_ENV=production`.
- Admin API requires an `ADMIN` session; destructive actions (purge, settings reset) need explicit confirmation and emit a JSON audit line to stdout.
- Rate limiting is atomic (DB transaction) and keyed by validated client IP.
- Public API returns explicit selects only — no internal columns (`deletedAt`, ordering, timestamps).

This policy applies to vulnerabilities found in:

- The portfolio web application
- API routes and authentication flows
- Docker and deployment configurations

## Disclosure

We follow responsible disclosure. Once a fix is released, we will credit the reporter (unless they prefer to remain anonymous).
