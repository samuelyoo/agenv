---
description: "Bootstrap a complete GitHub Copilot agent setup (instructions, agents, prompts, pipeline) for any project in VS Code."
mode: "agent"
---

# Bootstrap Copilot Project Setup

Use this prompt to set up a full GitHub Copilot agent configuration — instructions, agents, reusable prompts, and a development pipeline — for **any** project in VS Code.

---

## What This Creates

```
.github/
├── copilot-instructions.md          # Global project instructions (always loaded)
└── copilot/
    ├── architect.agent.md            # Architect agent (design, review, quality gate)
    ├── developer.agent.md            # Developer agent (LLD, implement, code review)
    ├── planner.agent.md              # Planner agent (execution plans)
    ├── start-pipeline.prompt.md      # Kick off new work items
    ├── code-review.prompt.md         # Run code review checklist
    ├── arch-review.prompt.md         # Run architecture review
    ├── bugfix.prompt.md              # Lightweight bug fix flow
    └── {name}.instructions.md        # Per-repo/folder instructions (auto-applied)
docs/
└── planning/
    └── GENERIC_DEV_PIPELINE.md       # 8-stage development pipeline reference
```

---

## Instructions

Analyze this project and create a complete Copilot setup. Follow these steps:

### Step 1 — Project Discovery

Explore the workspace thoroughly:

1. **Identify the project structure:**
   - Is it a monorepo or single repo?
   - What are the top-level directories/packages?
   - What is the dependency graph between packages?

2. **Identify the tech stack per package:**
   - Language (TypeScript, Python, Go, Rust, etc.)
   - Framework (Next.js, Express, Django, FastAPI, etc.)
   - Build tool (tsup, webpack, vite, cargo, etc.)
   - Test framework (Vitest, Jest, pytest, go test, etc.)
   - Linter (ESLint, Ruff, golangci-lint, etc.)
   - Package manager (pnpm, npm, yarn, pip, cargo, etc.)

3. **Identify conventions already in use:**
   - Read existing README files, CONTRIBUTING guides, linting configs
   - Check for existing CI/CD workflows
   - Look at commit history for commit message conventions
   - Look at existing test patterns
   - Check for existing architecture docs or ADRs

4. **Identify security patterns:**
   - Auth mechanism (JWT, sessions, OAuth, API keys)
   - Access control model (RBAC, ABAC, RLS, etc.)
   - Input validation approach (Zod, Joi, Pydantic, etc.)
   - Secret management (env vars, vault, etc.)

### Step 2 — Create Global Instructions

Create `.github/copilot-instructions.md` with:

```markdown
You are working on **{PROJECT_NAME}** — {one-line description}.

## Project Structure
{Table: Package/Dir | Purpose | Stack}

## Dependency Graph
{ASCII or text diagram showing how packages depend on each other}

## Coding Conventions
{Bullet list of enforced conventions — strict types, commit style, testing approach, validation, etc.}

## Testing
{Table: Package | Framework | Test Command | Lint Command}

## Security Requirements
{Bullet list of security rules — auth, access control, validation, secrets, injection prevention}

## Key Reference Documents
{List of important docs with relative paths}
```

**Rules for global instructions:**
- Keep it concise — this is loaded into EVERY conversation
- Focus on facts the agent needs to know, not aspirational goals
- Include test/lint commands so agents can verify their work
- Include the dependency graph so agents don't break build order

### Step 3 — Create Agent Configurations

Create three agents in `.github/copilot/`:

#### `architect.agent.md`
```yaml
---
description: "Solution Architect agent for research, design, review, and quality gates."
tools:
  - semantic_search
  - read_file
  - grep_search
  - file_search
  - list_dir
  - create_file
  - replace_string_in_file
  - run_in_terminal
  - runSubagent
---
```

Body should define:
- Role: Owns pipeline Stages 1 (Research), 2 (HLD), 4 (Design Review), 8 (Final Review)
- How each stage works (numbered steps)
- Design principles to enforce (use existing patterns, respect dependency graph, security by default, minimize blast radius)
- Review severity levels: Critical / Major / Minor
- Output format: structured Markdown with tables and Mermaid diagrams

#### `developer.agent.md`
```yaml
---
description: "Senior Developer agent for low-level design, implementation, and code review."
tools:
  - semantic_search
  - read_file
  - grep_search
  - file_search
  - list_dir
  - create_file
  - replace_string_in_file
  - multi_replace_string_in_file
  - run_in_terminal
  - get_errors
  - runSubagent
---
```

Body should define:
- Role: Owns pipeline Stages 3 (LLD), 6 (Implementation), 7 (Code Review)
- How each stage works (numbered steps)
- Per-package coding conventions (language, framework, test command, lint command, patterns)
- TDD workflow: write failing test → implement → pass → lint
- Quality checklist: tests pass, lint clean, no `any`/unsafe, no secrets, validation, error handling

#### `planner.agent.md`
```yaml
---
description: "Context Engineer agent for translating designs into executable implementation prompts."
tools:
  - semantic_search
  - read_file
  - grep_search
  - file_search
  - list_dir
  - create_file
  - replace_string_in_file
---
```

Body should define:
- Role: Owns pipeline Stage 5 (Execution Plan)
- Prompt engineering rules (self-contained, context block, requirements, tests, acceptance criteria, git)
- Prompt sizing (< 30 min each, split if too large)
- Ordering rules (dependencies first: schema → API → UI, shared → consumers)
- Verification (test + lint commands in every prompt)
- Prompt template with all sections

### Step 4 — Create Reusable Prompts

Create these `.prompt.md` files in `.github/copilot/`:

#### `start-pipeline.prompt.md`
- Description: "Start the development pipeline for a new work item"
- Mode: agent
- Agent: architect
- Body: Create pipeline folder, run Stage 1 research, output research context, commit

#### `code-review.prompt.md`
- Description: "Run a comprehensive code review checklist"
- Mode: agent
- Agent: developer
- Body: Full review checklist (completeness, quality, tests, security, performance)

#### `arch-review.prompt.md`
- Description: "Architecture review — verify implementation matches design"
- Mode: agent
- Agent: architect
- Body: Architectural integrity, security posture, production readiness

#### `bugfix.prompt.md`
- Description: "Lightweight bug fix pipeline"
- Mode: agent
- Agent: developer
- Body: 4-stage flow (research root cause → fix plan → implement with TDD → self-review)

### Step 5 — Create Per-Repo/Folder Instructions

For EACH significant package/directory, create a `{name}.instructions.md` in `.github/copilot/`:

```yaml
---
applyTo: "{package-path}/**"
---
```

Body should include:
- Stack summary (language, framework, runtime)
- Conventions specific to that package (file structure, naming, imports, patterns)
- Test command and lint command
- Package-specific rules that differ from the global conventions

**Only create instructions for directories with meaningfully different conventions.** If two packages share identical conventions, one instructions file with an `applyTo` pattern covering both is fine.

### Step 6 — Create Development Pipeline Document

Create `docs/planning/GENERIC_DEV_PIPELINE.md` (or equivalent path for the project's docs location) with:

1. **Overview** — 8-stage pipeline flowchart (Mermaid)
2. **When to use** — Table mapping scenario → pipeline mode (full, lightweight, partial, skip)
3. **Agent roles** — Table mapping agent → stages → responsibilities
4. **Stage definitions (1-8)** — Each with: agent, trigger, input, gate, full prompt template, output, git commit
5. **Artifacts directory structure** — Where pipeline docs go
6. **Lightweight modes** — Compressed pipelines for enhancements and bug fixes
7. **Agent handoff matrix** — Quick reference for who hands off to whom

### Step 7 — Verify & Commit

1. List all created files and confirm the structure is complete
2. Verify frontmatter YAML syntax is valid in all `.md` files
3. Check that `applyTo` patterns match actual directory paths
4. Ensure all prompts reference the correct agent names

```bash
git add .github/ docs/planning/ && git commit -m "chore: bootstrap Copilot agent setup with pipeline, agents, prompts, and instructions"
```

---

## Customization Notes

After initial setup, the user should:
- **Tune global instructions** — add/remove conventions based on team preferences
- **Add more prompts** — for recurring workflows (deploy, migrate, create component, etc.)
- **Add decision records** — so agents reference them during design stages
- **Adjust agent tools** — restrict or expand tool access based on trust level
