# Security Policy

## Supported Versions

Vibeo is currently in active development and has not yet published any official releases. Security updates and patches are applied directly to the `main` branch. 

| Version | Supported          |
| ------- | ------------------ |
| main    | Yes                |

## Reporting a Vulnerability

If you discover a security vulnerability within Vibeo, please do not disclose it publicly via public issue trackers or forums. 

Instead, please report it privately. You can submit a report by opening a draft security advisory on GitHub or by contacting the maintainers directly. 

Please provide the following details in your report:
* A description of the vulnerability and its potential impact.
* Steps to reproduce the issue.
* Potential mitigation or patching strategies, if known.

Reports will be acknowledged within 48 hours, and a timeline for a fix will be provided based on the severity of the vulnerability. 

## API Key & Credential Management

Vibeo relies on several third-party services:
* Google Gemini API
* TMDB API
* Firebase

Never commit your personal API keys, Firebase configuration files, or service account credentials to version control. The repository uses environment variables (`.env`) to manage these secrets. Ensure your `.env` file is listed in `.gitignore` to prevent accidental exposure of your backend infrastructure.

## Authentication & Authorization

User authentication is handled exclusively through Firebase Authentication. Any discovered vulnerabilities related to session hijacking, improper access control, or authentication bypass should be reported immediately following the vulnerability reporting guidelines above.
