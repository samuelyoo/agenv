# Documentation

These documents describe the current public contract for users and contributors.

| Document | Purpose |
| --- | --- |
| [Getting started](getting-started.md) | Local setup, project structure, and first contributions |
| [CLI specification](cli-spec.md) | Commands, flags, and exit behavior |
| [Manifest specification](manifest-spec.md) | Canonical schema v2 and local overrides |
| [Output map](output-map.md) | Generated files, scopes, and ownership |
| [Release readiness](release-readiness.md) | Versioning, safety, and release checklist |
| [Product requirements](prd.md) | Historical v1 product design context |
| [Technical requirements](trd.md) | Historical v1 architecture context |

The TypeScript sources are authoritative if prose and behavior ever diverge: `src/manifest/schema.ts` for manifests, `src/planner/output-map.ts` for destinations, and `src/cli/index.ts` for the command surface.
