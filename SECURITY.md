# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it **privately** rather than opening a public issue.

**Preferred method:** Open a [GitHub Security Advisory](https://github.com/syoo/agenv-package/security/advisories/new) using the "Report a vulnerability" button on this repository's Security tab.

**Alternatively:** Send an email describing the issue. Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (if possible)
- Any suggested mitigations

## Response Timeline

- **Acknowledgement:** Within 3 business days of receiving the report
- **Initial assessment:** Within 7 business days
- **Patch or resolution:** We aim to address confirmed vulnerabilities within 30 days, depending on severity and complexity

## Scope

This project is a CLI tool that generates AI workspace configuration files. The primary attack surfaces to consider:

- **File system writes:** The tool writes files to the local filesystem. Manifests and generated files should be reviewed before committing.
- **npm dependencies:** Keep dependencies up to date. Run `npm audit` regularly.
- **MCP server configurations:** Generated `.mcp.json` files may include third-party MCP server references. Review server trust levels before using with sensitive projects.

## Out of Scope

- Vulnerabilities in third-party tools or services that this project integrates with (MCP servers, AI providers)
- Issues requiring physical access to the user's machine
