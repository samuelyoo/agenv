export type PromptTemplateDefinition = {
  title: string;
  goal: string;
  useWhen: string;
  focusAreas: string[];
  deliverables: string[];
};

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
};
