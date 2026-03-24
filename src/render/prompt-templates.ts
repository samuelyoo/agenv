export type PromptTemplateDefinition = {
  title: string;
  goal: string;
  useWhen: string;
  focusAreas: string[];
  deliverables: string[];
};

export type { ProjectType } from "../manifest/schema.js";
import type { ProjectType } from "../manifest/schema.js";
import { getPromptPacksForType } from "../planner/output-map.js";

export function getPromptTemplateKeysForType(type: ProjectType): string[] {
  return getPromptPacksForType(type);
}

export const PROMPT_TEMPLATE_DEFINITIONS: Record<string, PromptTemplateDefinition> = {
  "build-page-shell": {
    title: "Build Page Shell",
    goal: "Create or refine a durable page shell with clear layout structure, route-level organization, and responsive behavior.",
    useWhen: "Use this when a route needs the overall frame, header, navigation, spacing system, and page-level loading or empty states.",
    focusAreas: [
      "Define the route-level structure and the main content regions before filling in detailed widgets.",
      "Make navigation, titles, actions, and responsive breakpoints feel intentional instead of incidental.",
      "Keep loading, empty, and error states visible at the page-shell level where they affect the whole experience.",
    ],
    deliverables: [
      "The page shell implementation and any supporting layout components.",
      "A short summary of the structure decisions, responsive behavior, and state handling.",
      "Any follow-up gaps or risks that still need product or design input.",
    ],
  },
  "build-data-table": {
    title: "Build Data Table",
    goal: "Implement a production-ready data table with clear columns, sorting, filtering, pagination, and state handling.",
    useWhen: "Use this when a page needs dense data presentation, list management, or admin workflows driven by tabular data.",
    focusAreas: [
      "Model the columns, row actions, empty states, and loading behavior around the real user task.",
      "Keep filtering, sorting, and pagination predictable and easy to reason about.",
      "Preserve accessibility, keyboard behavior, and legibility for dense information.",
    ],
    deliverables: [
      "The table implementation, helpers, and any state wiring required to support it.",
      "A note describing how sorting, filtering, pagination, and row actions behave.",
      "Tests or verification steps covering the most failure-prone table interactions.",
    ],
  },
  "build-filter-panel": {
    title: "Build Filter Panel",
    goal: "Build a filter panel or filter bar that makes narrowing results fast, understandable, and reversible.",
    useWhen: "Use this when users need to refine lists, charts, dashboards, or search results with multiple controls.",
    focusAreas: [
      "Choose controls that fit the data shape and are easy to reset or inspect at a glance.",
      "Keep filter state synchronized with the page state, URL state, or request state as appropriate.",
      "Make the active filter set visible so users understand why results changed.",
    ],
    deliverables: [
      "The filter UI and any associated state/query integration.",
      "A summary of how filter state is initialized, applied, cleared, and persisted.",
      "Verification that empty, loading, and no-match states remain understandable with filters applied.",
    ],
  },
  "build-kpi-cards": {
    title: "Build KPI Cards",
    goal: "Create KPI or summary cards that surface the most important metrics clearly and credibly.",
    useWhen: "Use this when a page needs top-level metrics, health indicators, or summary snapshots before deeper detail.",
    focusAreas: [
      "Prioritize the metrics, labels, trends, and comparisons that help users orient quickly.",
      "Handle loading, stale data, missing values, and surprising values without visual confusion.",
      "Keep the card hierarchy readable on both wide and narrow screens.",
    ],
    deliverables: [
      "The KPI card components and the data formatting needed to support them.",
      "A short explanation of metric hierarchy, trend treatment, and fallback behavior.",
      "Verification that cards remain legible and accurate across representative states.",
    ],
  },
  "build-chart-section": {
    title: "Build Chart Section",
    goal: "Implement a chart section that turns data into a readable story without sacrificing accuracy or usability.",
    useWhen: "Use this when the page needs trends, comparisons, distributions, or time-series views supported by charts.",
    focusAreas: [
      "Choose chart types, labels, legends, and supporting context that match the data question being answered.",
      "Make edge cases explicit, including empty data, partial ranges, and suspicious outliers.",
      "Pair the chart with surrounding copy or summary context so users can interpret it quickly.",
    ],
    deliverables: [
      "The chart section implementation with any data adapters or formatting helpers it needs.",
      "A brief note explaining the chart choice, axis treatment, and edge-case handling.",
      "Verification that the chart stays readable and accessible across screen sizes and states.",
    ],
  },
  "connect-api-resource": {
    title: "Connect API Resource",
    goal: "Wire a UI surface to an API resource with strong typing, state handling, and clear failure behavior.",
    useWhen: "Use this when you need to fetch, mutate, cache, or normalize data from an API or backend resource.",
    focusAreas: [
      "Keep request state explicit and typed, including loading, empty, success, stale, and error states.",
      "Separate transport concerns from UI concerns so components stay easier to test and maintain.",
      "Make retry behavior, optimistic updates, and error boundaries deliberate instead of accidental.",
    ],
    deliverables: [
      "The resource integration code plus the UI wiring that consumes it.",
      "A summary of data flow, caching or invalidation behavior, and failure handling.",
      "Tests or verification steps for the most important success and failure paths.",
    ],
  },
  "build-form-flow": {
    title: "Build Form Flow",
    goal: "Implement a form flow with clear validation, submission states, and user guidance from start to finish.",
    useWhen: "Use this when the work involves data entry, editing, onboarding, configuration, or multi-step submission flows.",
    focusAreas: [
      "Design the field structure, validation, and submission lifecycle around the real user journey.",
      "Keep errors actionable and in-context, especially for async validation or server responses.",
      "Ensure the form remains usable with keyboard navigation, screen readers, and narrow viewports.",
    ],
    deliverables: [
      "The form implementation, validation schema or rules, and submission handling.",
      "A short summary of validation behavior, success handling, and failure recovery.",
      "Verification that the form behaves correctly across happy path, invalid input, and submission failure cases.",
    ],
  },
  "handle-loading-empty-error-states": {
    title: "Handle Loading, Empty, and Error States",
    goal: "Design and implement resilient loading, empty, and error states so the experience stays understandable under real-world data conditions.",
    useWhen: "Use this when a feature is functionally complete on the happy path but still feels fragile, confusing, or incomplete around asynchronous states and failures.",
    focusAreas: [
      "Audit the user journey for loading, empty, partial, stale, retry, and failure states instead of only the success state.",
      "Make fallback UI informative enough that users understand what happened and what they can do next.",
      "Keep state handling consistent across page-level and component-level boundaries so the UI does not contradict itself.",
    ],
    deliverables: [
      "The UI and state-handling changes needed to cover loading, empty, and error scenarios properly.",
      "A short summary of which edge states were added or improved and why.",
      "Verification that the feature remains understandable across representative failure and no-data conditions.",
    ],
  },
  "enforce-accessibility-and-responsive-layout": {
    title: "Enforce Accessibility and Responsive Layout",
    goal: "Refine the implementation so accessibility, keyboard support, semantics, and responsive behavior are built into the feature rather than added as an afterthought.",
    useWhen: "Use this when a UI surface is implemented but still needs a structured pass for accessibility quality, semantic clarity, and device responsiveness.",
    focusAreas: [
      "Review headings, landmarks, labels, focus order, and keyboard interaction before treating the UI as complete.",
      "Check how layout, density, spacing, and overflow behave across narrow, medium, and wide screens.",
      "Prefer adjustments that improve both usability and maintainability instead of layering one-off fixes on top.",
    ],
    deliverables: [
      "The accessibility and responsive-layout improvements required for the feature.",
      "A short note describing the key improvements and any remaining accessibility risks.",
      "Verification steps covering keyboard behavior, semantics, and responsive layout expectations.",
    ],
  },
  "write-dashboard-tests": {
    title: "Write Feature Tests",
    goal: "Add focused automated tests that prove the implementation works across the most important user flows and failure paths.",
    useWhen: "Use this when the implementation exists but confidence is still too dependent on manual checking or the happy path only.",
    focusAreas: [
      "Choose the test level that best matches the behavior under risk instead of defaulting blindly to unit or integration tests.",
      "Cover realistic user-visible outcomes, including loading, empty, error, validation, or permission-sensitive behavior where relevant.",
      "Keep the tests readable enough that future contributors can understand what behavior is protected.",
    ],
    deliverables: [
      "Automated tests that protect the highest-risk behavior in the feature.",
      "A brief summary of what the new tests cover and what they intentionally do not cover yet.",
      "Notes on any remaining blind spots that still need manual verification or future coverage.",
    ],
  },
  "ui-builder": {
    title: "UI Builder",
    goal: "Design and implement cohesive UI structure that feels intentional, consistent, and maintainable.",
    useWhen: "Use this when the task spans multiple components, layout decisions, or visual hierarchy choices.",
    focusAreas: [
      "Work from page structure and information hierarchy down to component detail.",
      "Reuse existing patterns or design-system primitives before inventing new ones.",
      "Keep implementation readable so future UI changes do not require large rewrites.",
    ],
    deliverables: [
      "The relevant UI implementation and any shared components needed to support it.",
      "A summary of the composition decisions and reused patterns.",
      "Notes on any assumptions, tradeoffs, or visual follow-ups still needed.",
    ],
  },
  "data-integrator": {
    title: "Data Integrator",
    goal: "Connect application state, API resources, and presentation components into a stable user-facing flow.",
    useWhen: "Use this when the work crosses fetch logic, transformation, UI binding, and state synchronization boundaries.",
    focusAreas: [
      "Trace the data flow end to end before changing component behavior.",
      "Keep transformation logic explicit so mismatches between backend data and UI state are easy to debug.",
      "Make loading, error, and stale-data transitions predictable across the whole flow.",
    ],
    deliverables: [
      "The data integration changes across fetch, transform, and UI layers.",
      "A short explanation of state boundaries and data ownership.",
      "Verification steps that prove the integrated flow works across realistic scenarios.",
    ],
  },
  "table-specialist": {
    title: "Table Specialist",
    goal: "Refine tabular workflows for clarity, speed, and robustness in dense data experiences.",
    useWhen: "Use this when the table is the main working surface and needs careful attention to interactions and edge cases.",
    focusAreas: [
      "Optimize discoverability of sorting, filtering, row actions, and bulk actions.",
      "Protect usability in dense states with long text, many columns, or mixed row states.",
      "Keep implementation modular enough to evolve without turning the table into a monolith.",
    ],
    deliverables: [
      "Improvements to the table surface and its supporting interaction model.",
      "A summary of the interaction model and the edge cases it now covers.",
      "Verification that the table remains predictable under realistic heavy-use scenarios.",
    ],
  },
  "chart-specialist": {
    title: "Chart Specialist",
    goal: "Refine charts and surrounding data presentation so they are both analytically useful and easy to read.",
    useWhen: "Use this when data visualization is central to the task and chart quality matters as much as raw implementation.",
    focusAreas: [
      "Tune chart semantics, labels, legends, and supporting UI for the actual user question.",
      "Avoid visual noise and misleading encodings when data is sparse, skewed, or incomplete.",
      "Make sure the chart section still communicates the right story without hover interactions.",
    ],
    deliverables: [
      "The chart refinements and any supporting copy, formatting, or data-shaping changes.",
      "A note describing why the chosen visualization is a fit for the data.",
      "Verification that the visualization remains understandable across common edge cases.",
    ],
  },
  "form-builder": {
    title: "Form Builder",
    goal: "Build reliable forms that are easy to complete, validate, and recover from when something goes wrong.",
    useWhen: "Use this when forms are the primary interaction surface and need thoughtful UX plus dependable implementation.",
    focusAreas: [
      "Reduce ambiguity in labels, defaults, validation, and confirmation states.",
      "Treat async submission and server-side validation as first-class concerns.",
      "Keep forms composable so later edits do not require rewriting the entire flow.",
    ],
    deliverables: [
      "The form flow implementation and any supporting abstractions required to keep it maintainable.",
      "A brief summary of validation, error handling, and success feedback decisions.",
      "Verification steps covering both user-facing UX and implementation correctness.",
    ],
  },
  "qa-reviewer": {
    title: "QA Reviewer",
    goal: "Review an implementation for regressions, missing states, and quality gaps before it moves on.",
    useWhen: "Use this when a feature is implemented and needs a structured pass for bugs, edge cases, and verification coverage.",
    focusAreas: [
      "Look for behavior regressions, missing states, accessibility gaps, and weak error handling first.",
      "Review the code path against realistic user flows, not just the happy path.",
      "Call out concrete follow-up checks or tests when risk remains.",
    ],
    deliverables: [
      "A concise review summary ordered by the most important findings first.",
      "Clear notes on missing tests, residual risks, or behavior that still needs manual verification.",
      "If no issues are found, an explicit statement that the pass was clean plus any remaining blind spots.",
    ],
  },

  // --- Web-App Skills ---
  "build-page-layout": {
    title: "Build Page Layout",
    goal: "Create a durable page layout with clear content regions, responsive breakpoints, and consistent navigation.",
    useWhen: "Use this when a route needs structure, content areas, header/footer, and responsive behavior.",
    focusAreas: [
      "Define the primary content regions and navigation areas before adding page-specific detail.",
      "Make responsive breakpoints and spacing intentional rather than compensatory.",
      "Ensure page-level loading, empty, and error states are handled at the layout boundary.",
    ],
    deliverables: [
      "The page layout implementation and any supporting layout components.",
      "A short summary of the structure decisions, responsive behavior, and state handling.",
      "Any follow-up gaps or risks that still need product or design input.",
    ],
  },
  "build-navigation": {
    title: "Build Navigation",
    goal: "Build navigation (sidebar, top bar, breadcrumbs) with active-state tracking and responsive collapse.",
    useWhen: "Use this when the app needs primary and secondary navigation patterns.",
    focusAreas: [
      "Make active states, route transitions, and nested navigation predictable and visually clear.",
      "Handle mobile/responsive collapse without hiding critical navigation from users.",
      "Keep navigation accessible with keyboard support and correct ARIA roles.",
    ],
    deliverables: [
      "The navigation implementation with active-state tracking and responsive behavior.",
      "A short summary of the routing integration and state decisions.",
      "Verification that keyboard navigation and screen reader semantics work correctly.",
    ],
  },
  "build-auth-flow": {
    title: "Build Auth Flow",
    goal: "Implement sign-in, sign-up, password reset, and session management flows.",
    useWhen: "Use this when the app requires user authentication.",
    focusAreas: [
      "Treat auth state as a first-class concern — make login, logout, and session expiry explicit.",
      "Protect routes and data behind appropriate guards rather than relying on UI hiding.",
      "Keep error messages informative for users but non-leaking about system internals.",
    ],
    deliverables: [
      "The auth flow implementation including sign-in, sign-up, and session handling.",
      "A summary of token storage, session lifecycle, and route guard behavior.",
      "Tests covering login success, invalid credentials, and session expiry scenarios.",
    ],
  },
  "build-state-management": {
    title: "Build State Management",
    goal: "Set up application state management with clear ownership boundaries.",
    useWhen: "Use this when the app has shared state that crosses component boundaries.",
    focusAreas: [
      "Establish clear boundaries between server state, UI state, and form state.",
      "Avoid over-engineering — only lift state as high as necessary.",
      "Document ownership and update patterns so future contributors understand the state model.",
    ],
    deliverables: [
      "The state management setup with clearly defined ownership boundaries.",
      "A summary of what lives in global state vs. local component state.",
      "Verification that state updates are predictable and side-effect-free.",
    ],
  },
  "build-api-integration": {
    title: "Build API Integration",
    goal: "Connect the frontend to API endpoints with typed responses, caching, and error handling.",
    useWhen: "Use this when a feature needs to fetch or mutate remote data.",
    focusAreas: [
      "Keep request state typed and explicit — loading, success, error, and stale states all matter.",
      "Separate transport concerns from UI concerns so components stay testable.",
      "Make retry, optimistic updates, and error recovery deliberate choices not accidental behavior.",
    ],
    deliverables: [
      "The API integration code and the UI wiring that consumes it.",
      "A summary of data flow, caching or invalidation behavior, and failure handling.",
      "Tests for the most important success and failure paths.",
    ],
  },
  "implement-routing": {
    title: "Implement Routing",
    goal: "Configure client-side routing with lazy loading, guards, and nested layouts.",
    useWhen: "Use this when the app needs URL-driven navigation with route-level code splitting.",
    focusAreas: [
      "Keep route definitions centralized and easy to reason about at a glance.",
      "Apply lazy loading at route boundaries to reduce initial bundle size.",
      "Protect authenticated routes with explicit guards rather than relying on UI hiding.",
    ],
    deliverables: [
      "The routing configuration with lazy loading and route guards in place.",
      "A summary of the route tree, protected routes, and code-splitting strategy.",
      "Verification that navigation, deep links, and protected routes behave correctly.",
    ],
  },
  "write-web-app-tests": {
    title: "Write Web App Tests",
    goal: "Write focused tests for user flows, component behavior, and integration with API boundaries.",
    useWhen: "Use this when a feature needs automated test coverage.",
    focusAreas: [
      "Choose test level based on the risk being protected — unit, integration, or end-to-end.",
      "Cover user-visible behavior including loading, error, and edge-case states.",
      "Keep tests readable enough for future contributors to understand what is protected.",
    ],
    deliverables: [
      "Automated tests protecting the highest-risk behavior in the feature.",
      "A summary of what the tests cover and what is intentionally deferred.",
      "Notes on remaining blind spots that still need manual verification.",
    ],
  },

  // --- API-Service Skills ---
  "design-api-endpoints": {
    title: "Design API Endpoints",
    goal: "Design RESTful or GraphQL endpoints with clear resource naming, status codes, and response shapes.",
    useWhen: "Use this when a new resource or capability needs an API surface.",
    focusAreas: [
      "Model resources and actions around the consumer's mental model, not the database schema.",
      "Use standard HTTP semantics for methods, idempotency, and status codes.",
      "Define error shapes upfront so consumers can handle failures predictably.",
    ],
    deliverables: [
      "The endpoint design with resource names, HTTP methods, status codes, and response shapes.",
      "A brief note on versioning strategy, pagination, and filtering conventions.",
      "Any open questions about consumer requirements or backward-compatibility constraints.",
    ],
  },
  "build-request-validation": {
    title: "Build Request Validation",
    goal: "Implement schema-based request validation at the handler boundary.",
    useWhen: "Use this when incoming requests need input validation before processing.",
    focusAreas: [
      "Validate all external inputs at the handler boundary before passing them to service functions.",
      "Return clear, structured validation errors that help consumers fix their requests.",
      "Keep validation schemas as the single source of truth for request shape.",
    ],
    deliverables: [
      "The validation schema and handler-level integration.",
      "A summary of validated fields, constraints, and error response format.",
      "Tests verifying that invalid inputs are rejected with correct error shapes.",
    ],
  },
  "build-database-layer": {
    title: "Build Database Layer",
    goal: "Build data access with typed queries, migrations, and connection management.",
    useWhen: "Use this when a feature needs database reads, writes, or schema changes.",
    focusAreas: [
      "Keep database access behind typed repository or service functions — avoid raw queries in controllers.",
      "Write migrations that are safe to run forward and easy to reason about when things go wrong.",
      "Handle connection errors, timeouts, and transaction boundaries explicitly.",
    ],
    deliverables: [
      "The data access implementation and any schema migrations required.",
      "A summary of the query patterns, transaction strategy, and migration approach.",
      "Tests covering the most critical read and write paths.",
    ],
  },
  "build-auth-middleware": {
    title: "Build Auth Middleware",
    goal: "Implement authentication and authorization middleware with token validation.",
    useWhen: "Use this when endpoints need to verify identity or check permissions.",
    focusAreas: [
      "Validate tokens at the middleware boundary, not inside service functions.",
      "Return standard 401 and 403 responses without leaking internal error details.",
      "Make permission checks explicit and testable rather than buried in business logic.",
    ],
    deliverables: [
      "The authentication and authorization middleware with token validation.",
      "A summary of the auth model, token format, and permission checking strategy.",
      "Tests covering valid tokens, expired tokens, and unauthorized access scenarios.",
    ],
  },
  "build-error-handling": {
    title: "Build Error Handling",
    goal: "Build consistent error response shapes, status code mapping, and error logging.",
    useWhen: "Use this when the service needs structured error handling across all endpoints.",
    focusAreas: [
      "Establish a consistent error response shape used across all endpoints.",
      "Map internal error types to appropriate HTTP status codes without leaking internals.",
      "Log errors with enough context to diagnose production issues without exposing sensitive data.",
    ],
    deliverables: [
      "The error handling middleware and error type definitions.",
      "A summary of error classification, status code mappings, and logging strategy.",
      "Tests verifying error responses across common failure scenarios.",
    ],
  },
  "implement-logging": {
    title: "Implement Logging",
    goal: "Set up structured logging with request context, correlation IDs, and appropriate log levels.",
    useWhen: "Use this when the service needs observable request/response logging.",
    focusAreas: [
      "Attach correlation IDs to every request so logs can be traced across services.",
      "Use structured log format (JSON) with consistent field names for tooling compatibility.",
      "Set log levels appropriately — avoid logging sensitive data in any environment.",
    ],
    deliverables: [
      "The logging setup with structured output and request context propagation.",
      "A summary of log levels used, fields logged, and correlation ID strategy.",
      "Verification that logs are emitted correctly in local and deployed environments.",
    ],
  },
  "write-api-tests": {
    title: "Write API Tests",
    goal: "Write integration and unit tests for handlers, services, and middleware.",
    useWhen: "Use this when API endpoints need automated test coverage.",
    focusAreas: [
      "Test at the handler level for realistic coverage of the full request/response cycle.",
      "Cover validation failures, auth errors, service errors, and edge-case inputs.",
      "Keep tests isolated from external dependencies using mocks or test databases.",
    ],
    deliverables: [
      "Automated tests for the highest-risk handlers, services, and middleware.",
      "A summary of what the test suite covers and what is still manual.",
      "Notes on test isolation strategy and any required test infrastructure.",
    ],
  },
  "build-background-jobs": {
    title: "Build Background Jobs",
    goal: "Implement background job processing with retry semantics and failure handling.",
    useWhen: "Use this when work needs to happen outside the request/response cycle.",
    focusAreas: [
      "Make job definitions, retry policies, and failure handling explicit and observable.",
      "Avoid tight coupling between the API layer and job processing internals.",
      "Ensure jobs are idempotent so retries do not cause duplicate side effects.",
    ],
    deliverables: [
      "The job implementation with retry logic and failure handling.",
      "A summary of the job queue setup, retry strategy, and observability approach.",
      "Tests verifying retry behavior and failure scenarios.",
    ],
  },
  "configure-deployment": {
    title: "Configure Deployment",
    goal: "Set up deployment configuration (Dockerfile, CI, health checks, env management).",
    useWhen: "Use this when the service needs deployment automation.",
    focusAreas: [
      "Keep the Dockerfile minimal and production-safe — no dev dependencies or secrets in the image.",
      "Set up health check endpoints that reflect real service readiness, not just process liveness.",
      "Manage environment variables through the deployment environment, not hardcoded values.",
    ],
    deliverables: [
      "The Dockerfile, CI config, and health check implementation.",
      "A summary of environment variable strategy, build steps, and health check behavior.",
      "Verified that the container builds, starts, and passes health checks in a clean environment.",
    ],
  },
  "document-api": {
    title: "Document API",
    goal: "Generate or write API documentation with examples, authentication notes, and error catalogs.",
    useWhen: "Use this when the API needs consumer-facing documentation.",
    focusAreas: [
      "Document every public endpoint with request shape, response shape, and example payloads.",
      "Include authentication requirements and error codes prominently so consumers can handle failures.",
      "Keep documentation versioned and co-located with the code so it stays accurate.",
    ],
    deliverables: [
      "The API documentation covering endpoints, authentication, and error reference.",
      "A summary of the documentation format and update workflow.",
      "Notes on any undocumented edge cases or known gaps.",
    ],
  },

  // --- Web-App Agents ---
  "state-architect": {
    title: "State Architect",
    goal: "Design and manage application state architecture including global, route, and component state.",
    useWhen: "Use this when state ownership is unclear, contested, or causing bugs across components.",
    focusAreas: [
      "Map state ownership clearly — what is global, what is route-scoped, what is local.",
      "Design state transitions so they are predictable, testable, and easy to debug.",
      "Identify and eliminate redundant state that creates synchronization problems.",
    ],
    deliverables: [
      "A state architecture design with clear ownership boundaries.",
      "Any refactoring needed to align the current implementation with the design.",
      "Documentation of state ownership decisions for future contributors.",
    ],
  },
  "api-integrator": {
    title: "API Integrator",
    goal: "Connect frontend components to API endpoints with proper error handling and loading states.",
    useWhen: "Use this when the work involves connecting UI to remote data with reliability and type safety.",
    focusAreas: [
      "Trace the data flow from fetch through transform to presentation before changing anything.",
      "Keep request state typed and all async transitions explicit.",
      "Make retry, caching, and invalidation decisions deliberate rather than default.",
    ],
    deliverables: [
      "The API integration layer and the UI components wired to it.",
      "A summary of caching strategy, error handling, and loading state behavior.",
      "Verification steps for the critical data-flow paths.",
    ],
  },
  "auth-specialist": {
    title: "Auth Specialist",
    goal: "Implement and review authentication and authorization flows across the application.",
    useWhen: "Use this when auth flows need to be built or audited for correctness and security.",
    focusAreas: [
      "Verify that token handling, session lifecycle, and logout flows are secure and complete.",
      "Check that route guards protect all sensitive surfaces consistently.",
      "Review for common auth pitfalls: token leakage, missing expiry handling, and insecure redirects.",
    ],
    deliverables: [
      "The auth implementation or audit findings, prioritized by risk.",
      "A summary of the token strategy, session lifecycle, and guard coverage.",
      "Tests or verification steps for the most critical auth paths.",
    ],
  },
  "test-writer": {
    title: "Test Writer",
    goal: "Write and maintain automated tests that protect critical user flows and edge cases.",
    useWhen: "Use this when the implementation exists but test coverage is insufficient or fragile.",
    focusAreas: [
      "Identify the highest-risk behavior and write tests that would catch regressions there first.",
      "Cover realistic user-visible outcomes across happy path, error, and edge cases.",
      "Keep tests maintainable — avoid brittle assertions that break on unrelated changes.",
    ],
    deliverables: [
      "Automated tests for the highest-risk behavior in the feature.",
      "A summary of coverage decisions and known gaps.",
      "Notes on test infrastructure or CI integration needed to run them reliably.",
    ],
  },

  // --- API-Service Agents ---
  "api-designer": {
    title: "API Designer",
    goal: "Design API resources, endpoints, and contracts that are consistent and easy to consume.",
    useWhen: "Use this when new API surfaces need to be designed or existing ones need to be reviewed for consistency.",
    focusAreas: [
      "Apply consistent resource naming, HTTP semantics, and response shapes across all endpoints.",
      "Design for the consumer's mental model rather than the implementation's convenience.",
      "Make versioning, pagination, filtering, and error shapes explicit from the start.",
    ],
    deliverables: [
      "The API contract definition with resource shapes, endpoints, and error catalog.",
      "A summary of design decisions and any tradeoffs made for backward compatibility.",
      "Open questions that need consumer input before implementation.",
    ],
  },
  "data-layer-builder": {
    title: "Data Layer Builder",
    goal: "Build and optimize the data access layer including queries, migrations, and connection pooling.",
    useWhen: "Use this when the data access layer needs to be built, optimized, or made type-safe.",
    focusAreas: [
      "Keep data access behind typed abstractions that hide raw database details.",
      "Write migrations with forward-and-backward safety in mind.",
      "Profile query performance for any operation that touches large tables or complex joins.",
    ],
    deliverables: [
      "The data access implementation with typed queries and migrations.",
      "A summary of the query patterns, index strategy, and migration approach.",
      "Performance verification for the most critical read and write paths.",
    ],
  },
  "error-handler": {
    title: "Error Handler",
    goal: "Design and implement error handling strategies across the service.",
    useWhen: "Use this when error handling is inconsistent, leaky, or missing across the service boundaries.",
    focusAreas: [
      "Classify errors by type — validation, auth, not-found, internal — and map each to the right HTTP status.",
      "Prevent internal error details from leaking in API responses.",
      "Ensure errors are logged with enough context to diagnose production failures.",
    ],
    deliverables: [
      "The error handling implementation with consistent response shapes.",
      "A summary of error classification, status code conventions, and logging strategy.",
      "Tests verifying that each error class produces the correct response.",
    ],
  },
  "devops-reviewer": {
    title: "DevOps Reviewer",
    goal: "Review infrastructure, deployment config, and observability setups for production readiness.",
    useWhen: "Use this when a service is approaching deployment and needs an infrastructure and observability review.",
    focusAreas: [
      "Check that Dockerfiles, CI pipelines, and health checks reflect production requirements.",
      "Verify that environment variable management, secrets handling, and logging are production-safe.",
      "Look for missing alerting, monitoring hooks, or observability gaps that would make incidents hard to diagnose.",
    ],
    deliverables: [
      "A review summary of infrastructure, deployment, and observability findings prioritized by risk.",
      "Concrete recommendations for any gaps found.",
      "A checklist of items to verify before the next deployment.",
    ],
  },

  // --- Full-Stack Skills ---
  "write-full-stack-tests": {
    title: "Write Full-Stack Tests",
    goal: "Write tests that cover both frontend behavior and backend API contracts end to end.",
    useWhen: "Use this when a feature spans the frontend and backend and needs confident coverage across both layers.",
    focusAreas: [
      "Test frontend components at the integration level against mocked or real API responses.",
      "Test backend handlers for correct request validation, business logic, and error responses.",
      "Add end-to-end tests for the most critical user flows when confidence requires it.",
    ],
    deliverables: [
      "Tests covering the highest-risk paths across both frontend and backend.",
      "A summary of the layered test strategy and what each layer protects.",
      "Notes on any gaps intentionally left for future coverage.",
    ],
  },

  // --- Library Skills ---
  "design-public-api": {
    title: "Design Public API",
    goal: "Design a minimal, stable public API surface that is easy to use and hard to misuse.",
    useWhen: "Use this when defining the exports, types, and contract of a library module.",
    focusAreas: [
      "Expose only what consumers genuinely need — every extra export is a future maintenance burden.",
      "Name exports after the consumer's intent, not the implementation detail.",
      "Document breaking-change boundaries so semver decisions are straightforward.",
    ],
    deliverables: [
      "The public API surface definition including exported types, functions, and constants.",
      "A short rationale for what was included, excluded, and why.",
      "Notes on semver implications and backward-compatibility constraints.",
    ],
  },
  "write-library-tests": {
    title: "Write Library Tests",
    goal: "Write tests that protect the public API contract and the most critical internal logic.",
    useWhen: "Use this when a library module needs confident automated coverage.",
    focusAreas: [
      "Test the public API as a consumer would use it — not implementation internals.",
      "Cover edge cases in input types, optional parameters, and error paths.",
      "Keep tests independent of build tooling so they remain stable across bundler changes.",
    ],
    deliverables: [
      "Tests protecting the most important public API behaviors.",
      "A summary of covered behaviors and known gaps.",
      "Notes on test isolation and any required environment setup.",
    ],
  },
  "build-tree-shakeable-exports": {
    title: "Build Tree-shakeable Exports",
    goal: "Structure module exports so consumers only pay for what they import.",
    useWhen: "Use this when the library has multiple entry points or exports that should be individually tree-shakeable.",
    focusAreas: [
      "Use named exports and avoid side effects at module top level.",
      "Define entry points in package.json exports map to match the tree-shaking boundary.",
      "Verify with a bundle analysis tool that unused exports are eliminated.",
    ],
    deliverables: [
      "The refactored exports and updated package.json exports map.",
      "A bundle analysis showing tree-shaking is working as intended.",
      "Notes on any exports that cannot be tree-shaken and why.",
    ],
  },
  "generate-typedoc": {
    title: "Generate TypeDoc",
    goal: "Set up TypeDoc to generate accurate, navigable API documentation from JSDoc comments.",
    useWhen: "Use this when the library needs generated API reference documentation.",
    focusAreas: [
      "Ensure all public symbols have JSDoc comments that TypeDoc can render meaningfully.",
      "Configure TypeDoc entry points and output to match the published package structure.",
      "Add documentation generation to the build or CI workflow so it stays current.",
    ],
    deliverables: [
      "TypeDoc configuration and any JSDoc improvements needed for clean output.",
      "Generated documentation verifying that all public symbols are documented.",
      "CI or build integration keeping docs in sync with the codebase.",
    ],
  },
  "configure-build": {
    title: "Configure Build",
    goal: "Set up the bundler to produce clean, correctly typed build artifacts ready for publishing.",
    useWhen: "Use this when the library build pipeline needs to be created or significantly improved.",
    focusAreas: [
      "Produce both ESM and CJS outputs unless there is a clear reason not to.",
      "Generate accurate `.d.ts` declaration files alongside each output format.",
      "Keep sourcemaps and package.json exports map aligned with the output structure.",
    ],
    deliverables: [
      "The build configuration producing ESM, CJS, and type declarations.",
      "A verification that the published package resolves correctly in both ESM and CJS consumers.",
      "Notes on any intentional tradeoffs in the output format or target support.",
    ],
  },

  // --- CLI-Tool Skills ---
  "design-commands": {
    title: "Design Commands",
    goal: "Design a CLI command surface that is intuitive, consistent, and self-documenting.",
    useWhen: "Use this when defining or refactoring the CLI's command structure and UX.",
    focusAreas: [
      "Model commands after user tasks, not internal code structure.",
      "Use consistent naming conventions for commands, subcommands, flags, and args.",
      "Make --help output informative enough that users rarely need to consult external docs.",
    ],
    deliverables: [
      "The CLI command design with names, flags, args, and help text.",
      "A summary of UX decisions and deferred options.",
      "Notes on backward-compatibility constraints if commands already exist.",
    ],
  },
  "build-arg-parsing": {
    title: "Build Arg Parsing",
    goal: "Implement argument parsing that handles flags, positional args, and validation cleanly.",
    useWhen: "Use this when adding new commands or improving the reliability of existing argument handling.",
    focusAreas: [
      "Validate inputs early and produce clear error messages for invalid or missing arguments.",
      "Keep argument parsing logic separate from command business logic.",
      "Use typed argument definitions so invalid inputs are caught at parse time, not runtime.",
    ],
    deliverables: [
      "The argument parsing implementation with typed definitions and validation.",
      "Tests covering valid input, missing required args, and invalid flag values.",
      "A short note on the parsing library choices and any constraints they impose.",
    ],
  },
  "implement-config-file": {
    title: "Implement Config File",
    goal: "Add support for a project-level config file that controls CLI behavior without flags.",
    useWhen: "Use this when the CLI needs persistent or project-scoped configuration.",
    focusAreas: [
      "Support standard config file locations (project root, home directory) with a clear priority order.",
      "Validate config file contents on load and produce actionable errors for invalid values.",
      "Keep the config schema versioned so future changes are backward-compatible.",
    ],
    deliverables: [
      "The config file loader, schema, and merge logic with flag overrides.",
      "Tests verifying config loading, validation, and flag precedence.",
      "Documentation of supported config keys and their default values.",
    ],
  },
  "write-cli-tests": {
    title: "Write CLI Tests",
    goal: "Write tests that exercise CLI commands programmatically without spawning subprocesses.",
    useWhen: "Use this when CLI commands need automated coverage.",
    focusAreas: [
      "Test command handlers as functions with injected dependencies rather than spawned processes.",
      "Cover argument validation, happy paths, error paths, and edge-case inputs.",
      "Keep tests fast and free of I/O side effects by mocking filesystem and network calls.",
    ],
    deliverables: [
      "Tests for the highest-risk CLI commands and argument paths.",
      "A summary of the test strategy and mocking approach.",
      "Notes on any commands that are harder to test and why.",
    ],
  },
  "configure-package-bin": {
    title: "Configure Package Bin",
    goal: "Set up package.json bin entries so the CLI is installable and runnable as expected.",
    useWhen: "Use this when preparing the CLI for npm publishing or global installation.",
    focusAreas: [
      "Ensure the bin script has a correct shebang and is executable.",
      "Align bin name, package name, and command names so installation is predictable.",
      "Test the installed CLI in a clean environment before publishing.",
    ],
    deliverables: [
      "The updated package.json bin config and bin entry script.",
      "Verification that the CLI installs and runs correctly in a clean environment.",
      "Notes on versioning, scoped package names, and any OS-specific concerns.",
    ],
  },

  // --- Mobile Skills ---
  "build-screen-layout": {
    title: "Build Screen Layout",
    goal: "Create a screen layout with clear content regions, safe-area handling, and keyboard-aware behavior.",
    useWhen: "Use this when a screen needs structured layout, safe area insets, and device-aware behavior.",
    focusAreas: [
      "Handle safe area insets and notch layouts for both iOS and Android.",
      "Make the layout keyboard-aware so inputs are not obscured when the keyboard opens.",
      "Keep layout components focused so screens remain easy to compose and test.",
    ],
    deliverables: [
      "The screen layout implementation with safe-area and keyboard handling.",
      "A short summary of the layout regions, scroll behavior, and device edge cases.",
      "Verification on both iOS and Android form factors.",
    ],
  },
  "build-navigation-stack": {
    title: "Build Navigation Stack",
    goal: "Set up the navigation stack with typed routes, transitions, and deep-link support.",
    useWhen: "Use this when the app needs screen-to-screen navigation with back behavior and deep links.",
    focusAreas: [
      "Define a typed route tree so navigation calls are checked at compile time.",
      "Handle back gestures and hardware back button consistently across platforms.",
      "Set up deep-link handling for any routes that need to be reachable from external URLs.",
    ],
    deliverables: [
      "The navigation stack configuration with typed routes and deep-link support.",
      "A summary of the route tree, transition behavior, and auth guard integration.",
      "Verification that navigation, back behavior, and deep links work on both platforms.",
    ],
  },
  "write-mobile-tests": {
    title: "Write Mobile Tests",
    goal: "Write tests for mobile screens, components, and service integrations.",
    useWhen: "Use this when mobile features need automated coverage.",
    focusAreas: [
      "Test screens and components using React Native Testing Library for user-facing behavior.",
      "Mock native modules and device APIs to keep tests fast and cross-platform.",
      "Cover navigation, auth, and API integration paths that are most likely to regress.",
    ],
    deliverables: [
      "Tests protecting the most important screen behaviors and service integrations.",
      "A summary of test coverage and mocking strategy.",
      "Notes on any gaps that require device or emulator testing.",
    ],
  },

  // --- New Agents ---
  "docs-writer": {
    title: "Docs Writer",
    goal: "Write and maintain technical documentation that is accurate, well-structured, and easy to navigate.",
    useWhen: "Use this when a library or API needs consumer-facing documentation.",
    focusAreas: [
      "Organize docs around the reader's use cases, not the implementation structure.",
      "Keep code examples runnable and co-located with explanations.",
      "Update docs as part of the same PR as the feature or API change.",
    ],
    deliverables: [
      "The documentation covering the public API, usage examples, and known limitations.",
      "A summary of what was added, removed, or restructured.",
      "Notes on any documentation gaps that still need input from product or design.",
    ],
  },
  "cli-designer": {
    title: "CLI Designer",
    goal: "Design CLI command surfaces that are intuitive, consistent, and aligned with user intent.",
    useWhen: "Use this when the CLI needs new commands, a UX audit, or help text improvements.",
    focusAreas: [
      "Model commands after user tasks, not internal code modules.",
      "Apply consistent conventions for command names, flags, and argument shapes.",
      "Make error messages and --help output actionable without requiring documentation.",
    ],
    deliverables: [
      "The CLI design decisions including command names, flags, and help text.",
      "A summary of UX tradeoffs and deferred features.",
      "Notes on backward-compatibility constraints for any existing commands.",
    ],
  },
};
