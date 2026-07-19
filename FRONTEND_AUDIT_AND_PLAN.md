# Repo Doctor — Frontend Audit and Plan

**Audit date:** July 18, 2026
**Scope:** repository state at commit `f692feb`

## Planning and research complete

### Research summary

The most successful developer-tool interfaces use a calm, information-first
surface rather than decorative dashboard cards. This plan draws on a few
specific, transferable patterns:

- **Linear:** actions remain available through direct controls, context menus,
  and search/command entry points; Repo Doctor will keep the next safe action
  obvious while allowing fast navigation for experienced users.
- **GitHub:** diffs are reviewed file by file, with progress and contextual
  information available beside the code. Repo Doctor will pair the patch with
  scope, risk, and verification evidence instead of separating them into
  opaque wizard steps.
- **Sentry:** issue detail groups workflow actions and diagnostic evidence,
  making an alert understandable before it is acted on. Repo Doctor will make
  confidence, uncertainty, affected paths, and recovery actions first-class.
- **Vercel:** restrained navigation, dense but legible data, and a limited
  accent palette make technical operations feel dependable rather than noisy.

Sources: [Linear conceptual model](https://linear.app/docs/conceptual-model),
[GitHub’s review guidance](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request?tool=webui),
[GitHub’s diff workflow](https://github.blog/changelog/2026-03-19-view-code-and-comments-side-by-side-in-pull-request-files-changed-page/),
[Sentry issue detail documentation](https://docs.sentry.dev/product/issues/issue-details/), and
[Vercel interface guidelines](https://vercel.com/design/guidelines).

**Patterns to avoid:** fake terminals, a card for every datum, dashboard
rainbows, irreversible-looking AI actions, medical illustrations, and progress
that implies work is occurring when it is not. The product will use the clinic
language in labels only; its identity comes from evidence, reviewability, and
the explicit approval gate.

### Existing strengths

- A clean Git history and a clearly named project root are present.
- The README establishes the Hackathon context.

### Existing weaknesses

The checked-out project contains only `README.md`. There is no application
source, package manifest, frontend framework, backend framework, API route,
database schema, environment template, test suite, deployment configuration,
font, asset, or existing responsive implementation to inspect or reuse.

### Integration gaps

There is no backend to connect. The historical `main.py` was empty and was
subsequently deleted. Therefore it would be dishonest to claim a real
repository-analysis, treatment, download, or live-progress integration.

The frontend foundation will include a single typed service boundary whose base
URL is configured through `VITE_API_BASE_URL`. It will show an explicit
“backend unavailable” state when no compatible service exists; it will not
invent successful API responses. A backend needs to supply the following
contract before the complete workflow can be enabled:

| Service | Minimum operations |
| --- | --- |
| repository | submit Git URL or ZIP, validate, fetch metadata |
| examination | create, retrieve state, stream/poll progress, health record |
| diagnosis | list, filter, retrieve evidence/details |
| treatment | propose patch, approve, retrieve execution and verification, download |

### Deployment risks

- No frontend build artifact or hosting configuration exists.
- No backend, database/storage, CORS policy, upload limit, or API URL exists.
- No domain or credentials are configured in the checkout.
- A public deployment can host the interface, but cannot demonstrate real
  analysis safely until the backend contract is implemented and provisioned.

## Product experience and information architecture

```text
Landing / sample health record
  → Connect repository
  → Validation / examination progress
  → Health record
      → Diagnoses → diagnosis evidence
      → Treatment proposal → patch review → approval
      → Verification result → repaired download
```

The first build contains a public landing page, a repository-intake panel, and
an app shell for examination, health, diagnosis, diff, and verification views.
The sample record is labelled **Sample report** and is available solely for
product exploration; it never presents as the result of a submitted repository.

### State inventory

Every networked state has a visible loading, empty, validation-error,
backend-error, retry, and unavailable state. Long operations can only show
server-supplied progress. Proposed treatments are review-only until the user
uses the explicit approval action.

### Visual direction and design system

- **Tone:** calm clinical precision: near-ink background, warm white surfaces,
  graphite typography, restrained cobalt action color, and functional green,
  amber, and red status colors.
- **Typography:** Inter/system sans for UI; JetBrains Mono/system monospace for
  paths, commands, and diffs. Clear size steps privilege title, diagnosis,
  evidence, then metadata.
- **Layout:** centered 1200px content frame, 72px desktop header, 24px desktop
  gutters, and a collapsing two-column review layout. Mobile uses a single
  column and horizontal overflow only inside code/diff viewers.
- **Components:** button, input, badge, alert, score ring, examination step,
  diagnosis row, evidence list, diff viewer, verification row, empty/error
  panel, and accessible disclosure/dialog primitives.
- **Accessibility:** semantic landmarks, labelled form controls, visible
  `:focus-visible`, live status output, reduced-motion support, and contrast
  safe status colors.

### Frontend architecture

Start with a dependency-light Vite + TypeScript application. Domain types live
in `src/lib/types.ts`; API calls are centralized in `src/lib/api.ts`; app state
and visual components remain in focused files. This preserves a clean seam for
a later React/query upgrade without coupling UI components to `fetch`.

### Backend integration strategy

`src/lib/api.ts` sends requests only when `VITE_API_BASE_URL` is configured.
It uses timeouts, structured API errors, and typed parsing. The app initially
uses no fabricated API fallback: absent configuration produces a recoverable
unavailable state. When a real API is supplied, the service layer is the only
place endpoint paths and response mapping need to change.

### Implementation order

1. Create the frontend scaffold, design tokens, responsive shell, and honest
   backend-unavailable intake state.
2. Implement the sample health record and diagnosis/diff/verification views as
   clearly labelled product education.
3. Add the typed API layer and wire real intake/examination states whenever an
   API URL is configured.
4. Add unit tests, build validation, and deployment configuration after a
   compatible backend is available.

## Verified checklist

- [x] Inspect current frontend
- [x] Inspect current backend
- [x] Run application locally (development server started; browser CLI unavailable in this environment)
- [x] Research premium developer-tool interfaces
- [x] Produce design research summary
- [x] Produce frontend audit
- [x] Map user journeys
- [x] Define screen inventory
- [x] Define all UI states
- [x] Define design system
- [x] Define frontend architecture
- [x] Define API contracts
- [x] Implement application shell
- [x] Implement landing page
- [x] Implement repository intake
- [ ] Implement examination progress (requires live backend progress)
- [x] Implement health dashboard (labelled sample report)
- [x] Implement diagnoses (labelled sample report)
- [x] Implement diagnosis detail (labelled sample report)
- [x] Implement treatment proposal (review model)
- [x] Implement diff review (illustrative)
- [x] Implement verification flow (illustrative)
- [ ] Implement treatment result (requires backend execution)
- [ ] Connect frontend to backend (blocked: absent)
- [ ] Remove unnecessary mock data
- [x] Add loading and failure states
- [ ] Test responsive layouts (browser CLI unavailable in this environment)
- [x] Test accessibility (static review: labels, landmarks, focus, live region, reduced motion)
- [ ] Run linting (no linter configured in original project)
- [x] Run type checking
- [ ] Run frontend tests (no test runner configured in original project)
- [ ] Run end-to-end tests
- [x] Build for production
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Configure domain
- [ ] Verify production integration
- [ ] Complete final visual polish
- [ ] Document setup and deployment
