# PRD: AI Workspace Bootstrapper for Dashboard Development

## 1. Overview

### Product name
Working name: **AI Workspace Bootstrapper for Dashboards**

### Summary
AI Workspace Bootstrapper for Dashboards is an npm package that initializes and manages a portable AI coding environment specifically for **dashboard development repositories**. It generates and maintains a canonical project-level AI configuration, then emits tool-specific files and settings for supported coding assistants such as VS Code Copilot, Claude Code, OpenAI Codex, and MCP-compatible tools.

The product is optimized for teams building internal tools, admin panels, analytics dashboards, BI-style frontend apps, and operational web portals. It scaffolds opinionated instructions, dashboard-focused skills, recommended agent roles, UI/data-layer conventions, and MCP server setup so teams can start with a strong, consistent environment instead of configuring each tool manually.

### Problem statement
Dashboard projects have recurring setup needs that are often more specific than general application development:
- consistent frontend architecture
- table, chart, filter, and form patterns
- API integration conventions
- auth and role-based access rules
- design system usage
- data fetching and caching rules
- dashboard-specific AI instructions and implementation skills
- safe tooling for schema inspection, documentation lookup, and repo workflows

Today, teams recreate this setup manually across multiple AI tools using different formats and locations. As a result, AI assistance becomes inconsistent, hard to audit, and difficult to scale across dashboard repositories.

### Vision
Create a single source of truth for dashboard-development AI setup at the repository level, then generate safe, reviewable, tool-specific configurations from that source.

---

## 2. Goals

### Primary goals
- Reduce setup time for AI coding environments in new and existing repositories.
- Provide a single canonical config that can generate tool-specific outputs.
- Make generated AI environment files reviewable, reproducible, and team-friendly.
- Support safe defaults for permissions, hooks, and MCP configuration.
- Enable teams to standardize repository-specific AI behavior across tools.

### Secondary goals
- Improve onboarding for new developers.
- Reduce configuration drift across tools.
- Provide validation and diagnostics for broken or unsafe setup.
- Make it easy to update generated configs as vendor formats evolve.

### Non-goals for v1
- Full editor installation or account provisioning.
- Managing secrets beyond placeholders and best-practice scaffolding.
- Realtime sync across editors and assistants.
- Hosting or managing remote MCP infrastructure.
- Deep GUI dashboard as the primary interface.

---

## 3. Target users

### Primary users
- Frontend and full-stack developers building dashboards and admin panels.
- Startup/product teams building internal tools and operational consoles.
- Tech leads who want shared UI, data, and architecture conventions for dashboard repos.
- Freelancers and agencies delivering dashboard products for clients.

### Secondary users
- Developer experience/platform teams supporting frontend-heavy repositories.
- Agencies managing multiple dashboard codebases.
- Teams standardizing design-system-based product surfaces.

### User needs
- "Set up this dashboard repo for my AI tools in one command."
- "Enforce our dashboard stack, component rules, and coding conventions consistently."
- "Generate skills and agents tailored to charts, tables, filters, forms, auth, and API integration."
- "Make dashboard implementation patterns reusable across Claude, Copilot, and Codex."
- "Separate local-only settings from repo-committed team setup."

---

## 4. Core product concept

The product uses a **canonical AI workspace manifest** as the source of truth, but it is specifically designed around **dashboard development workflows**.

Example concept:
- `ai-workspace.json`
- or `ai-workspace.yaml`

From this manifest, the CLI generates dashboard-focused tool-specific outputs such as:
- `AGENTS.md`
- Copilot instruction files
- prompt files for dashboard tasks
- Claude skills for common dashboard implementation work
- Claude subagent definitions for UI, data, QA, and refactoring roles
- Claude hooks/settings skeletons
- MCP server configuration files
- onboarding documentation for dashboard repositories

In addition to core configuration, the manifest captures dashboard-specific standards such as:
- frontend framework and routing model
- component library / design system
- charting library
- data-fetching approach
- table/grid library
- form/validation approach
- auth / RBAC requirements
- testing expectations
- accessibility rules

This approach avoids forcing a fake universal format onto all tools, while still giving users one place to define dashboard development intent.

---

## 5. Key product principles

1. **One source of truth**  
   Users define intent once and generate many outputs.

2. **Repo-first**  
   The unit of configuration is the repository, not the machine.

3. **Safe by default**  
   Generated permissions, hooks, and servers should be conservative and auditable.

4. **Transparent output**  
   Users can see what files were generated and why.

5. **Portable intent, tool-specific emission**  
   Standardize project intent, not vendor file formats.

6. **Incremental adoption**  
   Users can adopt only the parts they need.

---

## 6. User stories

### Setup
- As a developer, I want to initialize AI tooling for a repo with one command.
- As a tech lead, I want shared coding instructions committed to the repo.
- As a developer, I want local-only overrides that are not committed.

### Generation
- As a user, I want tool-specific files generated from one config.
- As a user, I want recommended templates based on my project type.
- As a user, I want MCP server config generated consistently.

### Maintenance
- As a user, I want to regenerate files after changing the manifest.
- As a user, I want a doctor command that detects broken configs.
- As a user, I want upgrade support when vendor formats change.

### Safety
- As a user, I want dangerous permissions clearly labeled.
- As a user, I want generated hooks to be reviewable before use.
- As a team, I want to avoid secrets leaking into committed files.

---

## 6.5. Installation and setup flow

### Proposed first-run flow
When the user runs the CLI after npm install, the product should guide them through a structured setup wizard.

#### Step 1: Choose tools to configure
Allow multi-select.

Initial supported or near-term tools to consider:
- GitHub Copilot / VS Code
- Claude Code
- OpenAI Codex
- Cursor
- Windsurf
- Antigravity
- Cline / Roo Code style adapter layer if feasible later

The reason this tool-selection step is valid is that several of these tools already support persistent project customization surfaces such as rules, skills, workflows, MCP, subagents, or instruction files. Cursor supports rules, skills, hooks, subagents, and MCP; Windsurf supports memories/rules, workflows, and MCP; VS Code Copilot supports repo/project AI customization; Claude Code supports skills/subagents/hooks; and Codex uses `AGENTS.md`. This makes a multi-target generator realistic, but only if each target is handled through its own adapter rather than a fake shared file format. ([cursor.com](https://cursor.com/docs/rules)) ([docs.windsurf.com](https://docs.windsurf.com/windsurf/cascade/workflows)) ([code.visualstudio.com](https://code.visualstudio.com/docs/copilot/customization/overview))

#### Step 2: Choose development type
Single select at first, optional multi-profile later.

Suggested development types:
- Dashboard
- Web app
- API / backend service
- Full-stack app
- Admin panel / internal tool
- Mobile app
- Library / SDK
- CLI tool

For v1, the product should stay opinionated and fully optimized for **Dashboard** first.

#### Step 2.5: Choose setup depth
Ask how opinionated the setup should be so users are not forced through unnecessary advanced questions.

Options:
- Recommended defaults
- Semi-custom
- Advanced/manual

Recommended v1 behavior:
- `Recommended defaults` should prefill the strongest dashboard-first defaults and minimize prompts
- `Semi-custom` should ask the core stack and generation questions
- `Advanced/manual` should unlock the full session tree for teams that want fine-grained control

#### Step 3: Choose stack profile
Example questions:
- Framework: React / Next.js / Vite React
- Styling: Tailwind / custom
- Component layer: shadcn/ui / custom design system
- Data fetching: TanStack Query / custom
- Tables: TanStack Table / AG Grid / custom
- Charts: Recharts / ECharts / Nivo
- Forms: React Hook Form + Zod / custom
- Testing: Vitest / RTL / Playwright

#### Step 4: Choose setup mode
- Generate only base instructions
- Generate instructions + skills
- Generate instructions + skills + agents/subagents
- Generate everything including MCP starter setup

#### Step 5: Choose prompt bootstrap behavior
This is important based on your idea.

Options:
- Do not generate prompt packs
- Generate starter prompt files only
- Generate a single master setup prompt that the user can run inside their AI tool
- Generate a prompt pack with one prompt per agent/skill/domain area

Recommended v1 behavior:
- create directories and markdown templates automatically
- generate one **master bootstrap prompt**
- also generate optional **prompt pack** files

This gives users both paths:
- one-shot setup prompt
- modular prompts if they want more control

#### Step 6: Choose config scope
- Shared repo config
- Local-only config
- Mixed mode (recommended)

Mixed mode should create:
- repo-committed shared standards
- ignored local overrides for machine/user-specific config

#### Step 7: Review and generate
Show:
- selected tools
- selected dev profile
- generated files
- local-only vs committed files
- warnings for secrets / MCP / hooks / unsupported target mappings

### Wizard behavior
The setup flow should be staged and adaptive rather than showing every question to every user.

Recommended v1 behavior:
- ask tool targets first
- ask development type second
- ask setup depth early so the wizard can branch
- only show follow-up questions relevant to the selected project type and setup depth
- show a preview of generated files before writing anything

This keeps the wizard approachable for casual users while still supporting advanced teams.

### Generation layers
Generated outputs should be organized into three clear layers so the product is easier to understand and maintain.

#### Layer 1: Base repo config
Examples:
- `AGENTS.md`
- Copilot instructions
- shared repo rules
- project conventions docs

#### Layer 2: Skill and agent templates
Examples:
- dashboard implementation skills
- agent/subagent markdown files
- role-specific working docs such as UI Builder or Data Integrator

#### Layer 3: Prompt packs
Examples:
- one master bootstrap prompt
- one prompt per agent
- one prompt per common task type

This separation helps users adopt the product incrementally and makes the CLI output easier to reason about.

### Additional setup sessions to include
Beyond the three sessions you described, these are the other useful setup sessions:

1. **Stack and architecture session**  
   Captures framework, folder conventions, state management, routing, and layering.

2. **UI conventions session**  
   Captures component rules, design system usage, spacing/layout rules, table/chart/form patterns.

3. **Data and API session**  
   Captures data-fetching style, caching, API client patterns, schema typing, error/loading states.

4. **Auth and access control session**  
   Captures RBAC/permission rules, protected routes, role-aware UI visibility, and safe defaults.

5. **Quality session**  
   Captures test expectations, linting, formatting, accessibility, responsive behavior, and review rules.

6. **Tooling and MCP session**  
   Captures which MCP servers, docs sources, repo tools, and shell/hook permissions should be configured.

7. **Prompt/agent generation session**  
   Decides whether to create starter prompts only, full agent/subagent docs, or both.

These sessions matter because the product will be much more useful if it captures both **what stack the repo uses** and **how the team wants the AI to behave**.

## 7. MVP scope

### Supported tools in v1
- VS Code / GitHub Copilot customization files
- Claude Code
- OpenAI Codex via `AGENTS.md`
- MCP configuration generation

### Candidate tools for later adapters
- Cursor
- Windsurf
- Antigravity
- Cline
- Roo Code

Not all of these should be first-class in v1. Cursor and Windsurf are especially promising later targets because they already expose reusable configuration concepts like rules, skills/workflows, hooks/subagents, and MCP integration. ([cursor.com](https://cursor.com/docs/rules?utm_source=chatgpt.com))

### Supported dashboard stacks in v1
- React + TypeScript dashboard
- Next.js dashboard / admin panel
- Vite + React internal tool

### Opinionated tech choices in v1
The product should let users select or accept defaults for these dashboard technologies:
- **UI framework:** React, Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component system:** shadcn/ui or a custom design-system mode
- **Data fetching:** TanStack Query
- **Tables:** TanStack Table
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts or ECharts
- **State management:** minimal local state first, optional Zustand
- **Testing:** Vitest + React Testing Library, optional Playwright
- **Linting/formatting:** ESLint + Prettier

### Core CLI commands

#### `init`
Initializes the workspace manifest and generates starter outputs.

Example:
```bash
npx ai-workspace-bootstrapper init
```

Responsibilities:
- detect dashboard stack
- ask setup questions or accept flags
- create canonical manifest
- create starter generated files
- show a summary of outputs

#### `generate`
Generates or regenerates tool-specific files from the manifest.

#### `doctor`
Validates the current setup and reports issues.

Checks may include:
- unsupported tool targets
- malformed config
- missing env placeholders
- unsafe hooks
- invalid MCP references
- missing dashboard dependencies
- stack mismatch between manifest and repo

#### `upgrade`
Updates generated outputs for the current CLI version and target adapters.

#### `diff`
Shows what would change before writing files.

#### `templates list`
Shows available starter templates.

### MVP outputs
- canonical manifest
- `AGENTS.md`
- Copilot instructions file(s)
- dashboard-specific prompt templates
- Claude skills directory and skeleton files
- Claude subagent skeletons for dashboard roles
- Claude settings/hooks skeletons where appropriate
- MCP config file(s)
- `.env.example` placeholders where relevant
- `.gitignore` recommendations for local-only files
- dashboard architecture and conventions doc

### Dashboard-specific generated skills in v1
- `build-page-shell`
- `build-data-table`
- `build-filter-panel`
- `build-kpi-cards`
- `build-chart-section`
- `connect-api-resource`
- `build-form-flow`
- `handle-loading-empty-error-states`
- `enforce-accessibility-and-responsive-layout`
- `write-dashboard-tests`

### Dashboard-specific generated agents/subagents in v1
- **UI Builder** — layouts, cards, responsive structure, design-system usage
- **Data Integrator** — queries, API hooks, caching, transformation
- **Table Specialist** — sorting, filtering, pagination, column design
- **Chart Specialist** — chart selection, formatting, tooltip/legend behavior
- **Form Builder** — validation, mutation flows, error handling
- **QA Reviewer** — accessibility, edge states, tests, consistency

## 8. Out of scope for MVP

- Full Visual Studio support if it substantially increases complexity.
- Automatic installation of third-party MCP servers from arbitrary sources.
- Remote dashboard with authentication.
- Analytics backend.
- Marketplace or registry of community templates.
- Full organization policy management.

---

## 9. Canonical config draft

Example:
```json
{
  "project": {
    "name": "ops-dashboard",
    "type": "dashboard",
    "framework": "nextjs"
  },
  "dashboard": {
    "ui": {
      "styling": "tailwind",
      "components": "shadcn-ui"
    },
    "data": {
      "fetching": "tanstack-query",
      "tables": "tanstack-table",
      "charts": "recharts"
    },
    "forms": {
      "library": "react-hook-form",
      "validation": "zod"
    },
    "quality": {
      "testing": ["vitest", "rtl"],
      "accessibility": true,
      "responsive": true
    }
  },
  "instructions": {
    "codingStyle": [
      "Use TypeScript strict mode.",
      "Prefer reusable dashboard sections over one-off page code.",
      "Handle loading, empty, error, and success states explicitly.",
      "Keep filters, tables, and charts composable."
    ],
    "reviewRules": [
      "Do not introduce new UI libraries without approval.",
      "Prefer existing design-system components first.",
      "Protect role-based UI behavior and permission boundaries."
    ]
  },
  "agents": [
    {
      "id": "ui-builder",
      "role": "Build dashboard layouts and reusable UI sections",
      "capabilities": ["components", "layout", "responsive-ui"],
      "restrictions": ["use-approved-components-only"]
    },
    {
      "id": "data-integrator",
      "role": "Implement query hooks and resource integration",
      "capabilities": ["api", "queries", "transforms"],
      "restrictions": ["no-schema-assumptions-without-types"]
    }
  ],
  "skills": [
    {
      "id": "build-data-table",
      "description": "How to build sortable, filterable, paginated tables in this repo"
    },
    {
      "id": "build-chart-section",
      "description": "How to create reusable chart sections with the selected charting library"
    }
  ],
  "mcp": {
    "servers": [
      {
        "id": "github",
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "${GITHUB_TOKEN}"
        }
      }
    ]
  },
  "output": {
    "targets": ["copilot", "claude", "codex", "mcp"]
  }
}
```

### Config design requirements
- human-readable
- diff-friendly
- optimized for dashboard stack choices
- supports local override file
- supports team-shared vs local-only output
- supports target-specific extensions without breaking portability

## 10. Architecture

### High-level architecture
1. CLI layer
2. manifest parser/validator
3. template engine
4. adapter/emitter layer
5. diagnostics engine
6. file writer and diff engine

### Internal modules

#### Manifest module
- parse config
- validate schema
- normalize defaults

#### Template module
- project templates
- agent templates
- skill templates
- MCP server presets

#### Adapter layer
Each adapter translates canonical intent into target-specific files.

Initial adapters:
- Copilot adapter
- Claude adapter
- Codex adapter
- MCP adapter

#### Diagnostics module
- config validation
- target compatibility checks
- security warnings
- path/env validation

#### File operations module
- dry run
- write with backup strategy
- diff mode
- conflict detection

---

## 11. Safety and security requirements

### Principles
- Never silently enable dangerous permissions.
- Never write real secrets into committed config by default.
- Clearly label generated files that may execute commands or expose tools.
- Prefer explicit user action for elevated capabilities.

### Requirements
- Support env placeholders instead of raw secrets.
- Generate `.env.example` when needed.
- Mark local-only files for `.gitignore` when appropriate.
- Warn when hooks or MCP servers invoke shell commands.
- Show trust-sensitive changes in `diff` and `doctor` output.
- Make generated commands auditable and commented.

### Risks
- Overly broad permissions in hooks or agents.
- Secret leakage through committed config.
- Unsafe default MCP server setup.
- Vendor trust prompts being bypassed by user misunderstanding.

---

## 12. UX requirements

### CLI UX goals
- Simple first-run experience.
- Good defaults.
- Interactive and non-interactive modes.
- Clear summaries and warnings.
- Idempotent generation.

### Example initialization flow
1. Detect project type.
2. Ask which tools to target.
3. Ask whether config is team-shared, local-only, or mixed.
4. Offer starter templates for instructions/agents/MCP.
5. Generate files.
6. Print summary with next steps.

### Example output summary
- Created `ai-workspace.json`
- Created `AGENTS.md`
- Created `.github/copilot-instructions.md`
- Created `.claude/...`
- Created `.mcp.json`
- Skipped local override file because `--no-local`
- Warning: `github` MCP server requires `GITHUB_TOKEN`

---

## 13. Success metrics

### Product metrics
- Time to first usable setup
- Number of generated targets per repo
- Doctor command issue resolution rate
- Upgrade success rate
- Template adoption rate

### User outcome metrics
- Reduced manual setup time
- Reduced configuration inconsistency
- Faster team onboarding
- Higher confidence in AI environment reproducibility

### Qualitative signals
- Users keep the manifest as source of truth
- Teams commit generated shared configs
- Users trust `doctor` and `diff` before changes

---

## 14. Risks and challenges

### 1. Vendor format drift
Tools evolve quickly and may change config locations or semantics.

Mitigation:
- version-aware adapters
- compatibility matrix
- upgrade command
- adapter test fixtures

### 2. False abstraction
Not every tool concept maps cleanly to every other tool.

Mitigation:
- portable core concepts only
- target-specific extension fields
- graceful degradation where a feature has no equivalent

### 3. Unsafe automation
Generated hooks or MCP setup may be too permissive.

Mitigation:
- conservative defaults
- explicit warnings
- dry run and diff
- documented risk tiers

### 4. Config sprawl
Users may become confused by generated files.

Mitigation:
- clear directory conventions
- generated-file headers
- summary docs
- optional minimal mode

### 5. Git churn
Generated files may change too often.

Mitigation:
- stable formatting
- deterministic generation
- separate shared vs local outputs

---

## 15. Rollout plan

### Phase 1
- Canonical manifest
- Copilot adapter
- Claude adapter
- Codex `AGENTS.md`
- MCP adapter
- `init`, `generate`, `doctor`, `diff`

### Phase 2
- More project templates
- Better local/shared config separation
- Upgrade assistant
- More MCP presets
- Better adapter overrides

### Phase 3
- Visual Studio support
- Config migration helpers
- Remote template registry
- Optional dashboard or TUI

---

## 16. Open questions

- Should v1 support only React-based dashboards, or include Vue later?
- Should charting support start with one default library only to keep prompts and skills consistent?
- Should shadcn/ui be the default component path, with design-system overrides for advanced teams?
- How opinionated should generated skills be about file/folder structure?
- Which MCP presets are most useful for dashboard teams in v1: GitHub, docs, database-readonly, design/docs retrieval?
- Should agents be generated only for Claude first, while other tools receive prompt-based fallbacks?
- Should the CLI generate a dashboard architecture doc alongside AI config by default?

## 17. Recommendation

Start with a **repo-first CLI** and a **single canonical manifest**, but focus it tightly on **dashboard development**.

The MVP should optimize for:
- opinionated dashboard stacks
- reusable dashboard implementation skills
- safe, reviewable output
- predictable generation
- portability across supported AI tools

The core product promise should be:

> Set up a portable, reviewable AI coding environment for dashboard development in one command.

That is a stronger and clearer value proposition than a generic multi-tool AI setup product, especially for teams that repeatedly build internal dashboards, admin panels, and analytics interfaces.
