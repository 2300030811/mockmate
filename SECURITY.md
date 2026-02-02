# Security Policy

## Supported Versions

Use the latest version of Mockmate to ensure you have the most secure experience.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability:

1.  **Do not** create a public GitHub issue.
2.  Email your findings to the repository owner (or the email listed in the profile).
3.  We will investigate and address the issue as soon as possible.

## Sensitive Data

This repository is configured to exclude sensitive configuration files (like `.env`) via `.gitignore`.
**NEVER** commit API keys, secrets, or passwords to this repository.

### Automated Checks

GitHub's secret scanning features are recommended for this repository once public.
