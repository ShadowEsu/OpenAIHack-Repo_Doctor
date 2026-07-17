# Repo Doctor — Frontend Design Specification

## 1. Existing Frontend Audit

### Current State
- **Framework**: None (greenfield)
- **Package Manager**: None configured
- **Existing Components**: None
- **Styling**: None
- **Routes**: None
- **API Integration**: None
- **Backend Contracts**: Undefined

### Assessment
This is a greenfield project. There is no existing frontend to audit, preserve, or refactor. All design decisions are open.

### Reusable Pieces
- The `.antigravityignore` file defines sensible exclusions (`.env`, `node_modules/`, `dist/`, `build/`)
- The README establishes the hackathon context but needs replacement with product documentation

### Technical Risks
- No backend API defined yet — frontend must be designed to work with mock data initially
- No database schema — health records, diagnoses, and treatments are conceptual
- No authentication system — initial implementation will be single-user
- No deployment target defined

---

## 2. Product Flow Map

### Journey A: First-Time User
```
Landing Page
→ Understand product value (5 seconds)
→ Click "Connect Repository"
→ Enter GitHub URL or upload ZIP
→ Repository validation (loading state)
→ Examination begins (progress stages)
→ Examination completes
→ Repository Overview with health score
→ View diagnosis list
→ Select highest-priority diagnosis
→ Review evidence and affected files
→ Generate treatment proposal
→ Review diff
→ Approve treatment
→ Verification runs
→ View result (success/failure)
→ Download repaired copy or rollback
```

### Journey B: Returning User
```
Dashboard (previous repositories)
→ Select repository
→ View latest health record
→ Compare with previous examination (if available)
→ Continue unresolved diagnosis
→ Apply another treatment
```

### Journey C: Examination Failure
```
Submit repository
→ Validation succeeds
→ Examination fails at specific stage
→ User sees failure stage and explanation
→ Retry or change repository source
```

### Journey D: Repair Fails Verification
```
Approve treatment
→ Patch applies successfully
→ Verification fails (tests/lint/build)
→ Repo Doctor explains failure
→ Original state remains safe
→ User views failed diff
→ User rolls back
```

### Journey E: Healthy Repository
```
Examination completes
→ High health score
→ Few or no major problems
→ User sees positive status
→ Low-priority recommendations available
```

### Journey F: Repository Without Tests
```
Examination completes
→ Repairable issue found
→ Treatment applies
→ Lint passes
→ Tests unavailable
→ Interface states: "No automated tests found. Linting completed successfully."
```

---

## 3. Information Architecture

### Primary Navigation (Sidebar)
```
Overview        — Repository health summary
Diagnoses       — All findings with filters
Treatments      — Active and completed repairs
History         — Past examinations and changes
Settings        — Repository and account preferences
```

### Route Structure
```
/                                   — Landing page
/connect                            — Repository connection
/exam/:id/progress                  — Examination progress
/app                                — Application shell
  /app/repos                        — Repository list (dashboard)
  /app/repos/:repoId                — Repository overview
  /app/repos/:repoId/diagnoses      — Diagnosis list
  /app/repos/:repoId/diagnoses/:id  — Diagnosis detail
  /app/repos/:repoId/treatments     — Treatment list
  /app/repos/:repoId/treatments/:id — Treatment detail/diff
  /app/repos/:repoId/history        — Treatment history
  /app/repos/:repoId/settings       — Repository settings
/sample                             — Sample health record
```

### Navigation Behavior
- **Global**: Persistent sidebar on desktop, bottom sheet on mobile
- **Repository-level**: Tabs within repository context
- **Breadcrumbs**: `Repos / [Repo Name] / Diagnoses / [Diagnosis]`
- **Back navigation**: Always available, returns to previous context
- **Cross-links**: Diagnosis → related treatments, Treatment → source diagnosis

---

## 4. Screen Inventory

### Public Screens

| # | Screen | Purpose |
|---|--------|---------|
| 1 | Landing Page | Product introduction, primary CTA |
| 2 | Connect Repository | GitHub URL input, ZIP upload, validation |
| 3 | Sample Health Record | Polished example for exploration |

### Application Screens

| # | Screen | Purpose |
|---|--------|---------|
| 4 | Repository List | Dashboard of connected repositories |
| 5 | Examination Progress | Real-time examination stages |
| 6 | Repository Overview | Health score, summary, priorities |
| 7 | Diagnosis List | All findings with search and filters |
| 8 | Diagnosis Detail | Full evidence, files, treatment options |
| 9 | Treatment List | Active and completed treatments |
| 10 | Treatment Proposal | What will change, risk, approval |
| 11 | Diff Review | File changes, insertions, deletions |
| 12 | Treatment Execution | Real-time verification progress |
| 13 | Treatment Result | Success/failure, score impact |
| 14 | Treatment History | Past changes with timestamps |
| 15 | Settings | Preferences, retention, deletion |

---

## 5. State Matrix

### Repository Intake States
| State | UI Treatment |
|-------|--------------|
| Empty | URL input field, ZIP dropzone |
| URL entered | Validate button enabled |
| URL invalid | Inline error: "Enter a valid GitHub URL" |
| Repository unavailable | Error: "Repository not found or private" |
| Private repository | Error: "Private repos require authentication" |
| Repository too large | Error: "Repository exceeds 100MB limit" |
| ZIP selected | Show filename, size, extract button |
| ZIP invalid | Error: "Upload a valid .zip file" |
| ZIP extracting | Progress indicator |
| Extraction failed | Error: "Could not extract ZIP contents" |
| Repository accepted | Transition to examination |

### Examination States
| State | UI Treatment |
|-------|--------------|
| Waiting | "Preparing examination..." |
| Starting | Progress bar at 0% |
| Active | Stage indicator, progress bar |
| Paused | Pause icon, resume button |
| Completed | Transition to overview |
| Failed | Error with stage, retry button |
| Timed out | "Examination timed out after 5 minutes" |
| Unsupported | "Repository type not supported" |
| No files | "No source files detected" |

### Diagnosis States
| State | UI Treatment |
|-------|--------------|
| Loading | Skeleton cards |
| Loaded | Diagnosis list |
| No diagnoses | Empty state: "No issues found" |
| Filtered empty | "No diagnoses match your filters" |
| Low confidence | Confidence badge: "Possible false positive" |
| Non-repairable | Badge: "Manual fix required" |
| Resolved | Strikethrough, resolved badge |
| Dismissed | Hidden by default, toggle to show |

### Treatment States
| State | UI Treatment |
|-------|--------------|
| Proposal unavailable | "Automatic repair not available" |
| Generating | "Analyzing repair options..." |
| Ready | Show proposal with risk |
| Awaiting approval | Diff review, approval button |
| Applying | Progress: "Applying patch..." |
| Verifying | Verification steps running |
| Successful | Green result, score update |
| Successful with warnings | Amber result, warnings listed |
| Failed to apply | Red result, error details |
| Verification failed | Red result, failed steps |
| Rolled back | "Changes reverted" |
| Download ready | Download button enabled |

### Verification States
| State | UI Treatment |
|-------|--------------|
| Waiting | Gray dot, "Pending" |
| Running | Spinner, "Running..." |
| Passed | Green checkmark |
| Failed | Red X, expandable output |
| Unavailable | Gray dash, "Not configured" |
| Timed out | Amber, "Timed out after 60s" |

---

## 6. Page-by-Page Wireframe Descriptions

### 1. Landing Page

**Layout**: Full-width, single column, generous whitespace

**Hierarchy**:
1. Product name and tagline (centered)
2. Primary value proposition (2-3 sentences)
3. Primary CTA: "Connect Repository"
4. Secondary CTA: "View Sample Report"
5. Feature highlights (3 columns)
6. Trust signals (privacy, safety, control)

**Primary Action**: "Connect Repository" button

**Empty State**: N/A (always has content)

**Failure State**: N/A

**Mobile**: Stacked layout, full-width CTAs

---

### 2. Connect Repository

**Layout**: Centered card, max-width 640px

**Hierarchy**:
1. Page title: "Connect Repository"
2. GitHub URL input with validation
3. Divider: "or"
4. ZIP upload dropzone
5. Privacy explanation text
6. Size limitations note

**Primary Action**: "Begin Examination" button

**Secondary Actions**: Cancel, Learn more about privacy

**Empty State**: Input fields empty, CTAs disabled

**Failure State**: Inline errors below inputs

**Mobile**: Full-width card, larger touch targets

---

### 3. Examination Progress

**Layout**: Centered content, progress visualization

**Hierarchy**:
1. Repository name and icon
2. Current stage label
3. Progress bar with percentage
4. Stage checklist (completed/active/pending)
5. Elapsed time
6. Cancel button

**Primary Action**: None (automated process)

**Secondary Action**: Cancel examination

**Empty State**: N/A (always shows progress)

**Failure State**: Error message, retry button, failed stage highlighted

**Mobile**: Stacked stages, full-width progress bar

---

### 4. Repository Overview

**Layout**: Dashboard grid

**Hierarchy**:
1. Repository header (name, branch, last examined)
2. Health score (prominent, with label and explanation)
3. Category breakdown (security, reliability, etc.)
4. Issue counts by severity
5. Highest-priority diagnosis (linked)
6. Recent treatments
7. Quick actions (re-examine, view all diagnoses)

**Primary Action**: "View Top Diagnosis" or "Re-examine"

**Secondary Actions**: View all diagnoses, View treatments

**Empty State**: "Connect a repository to see its health"

**Failure State**: "Could not load repository data"

**Mobile**: Stacked sections, score prominent at top

---

### 5. Diagnosis List

**Layout**: Filterable list with sidebar filters

**Hierarchy**:
1. Page title with count
2. Search input
3. Filter sidebar (severity, category, confidence, repairability, status)
4. Sort dropdown
5. Diagnosis cards (scrollable list)

**Primary Action**: Select diagnosis to view detail

**Secondary Actions**: Clear filters, Export

**Empty State**: "No diagnoses found" with filter reset

**Failure State**: "Could not load diagnoses"

**Mobile**: Filters in bottom sheet, full-width cards

---

### 6. Diagnosis Detail

**Layout**: Two-column on desktop (content + sidebar), stacked on mobile

**Hierarchy**:
1. Diagnosis header (severity icon, title, status)
2. One-sentence summary
3. "Why it matters" section
4. Evidence panel (code references, file paths)
5. Affected files list (linked)
6. Confidence and uncertainty
7. Recommended treatment
8. Verification plan
9. Action buttons

**Primary Action**: "Generate Treatment Proposal"

**Secondary Actions**: Dismiss, View related diagnoses, Mark resolved

**Empty State**: N/A (requires diagnosis selection)

**Failure State**: "Could not load diagnosis details"

**Mobile**: Stacked layout, evidence collapsible

---

### 7. Treatment Proposal

**Layout**: Split view (summary + diff preview)

**Hierarchy**:
1. Treatment summary (what will change)
2. Risk assessment
3. Affected files count
4. Diff preview (collapsed by default)
5. Verification steps planned
6. Safety message: "Your original repository will remain unchanged"
7. Approval section

**Primary Action**: "Approve and Run Verification"

**Secondary Actions**: View full diff, Cancel

**Empty State**: N/A

**Failure State**: "Could not generate treatment proposal"

**Mobile**: Stacked, diff expandable

---

### 8. Diff Review

**Layout**: Full-width diff viewer

**Hierarchy**:
1. Treatment summary header
2. File list with operations (added/modified/deleted)
3. Unified diff view (or side-by-side on wide screens)
4. Per-file explanations
5. Risk indicators
6. Approval section with safety message

**Primary Action**: "Approve and Run Verification"

**Secondary Actions**: Expand/collapse files, Copy path, Cancel

**Empty State**: N/A

**Failure State**: "Could not load diff"

**Mobile**: Unified diff only, file list collapsible

---

### 9. Treatment Execution

**Layout**: Centered progress view

**Hierarchy**:
1. Treatment title
2. Current step label
3. Verification steps checklist:
   - Creating working copy
   - Applying patch
   - Formatting
   - Linting
   - Type checking
   - Running tests
   - Running build
   - Re-examining
4. Progress indicator
5. Elapsed time

**Primary Action**: None (automated)

**Secondary Action**: Cancel

**Empty State**: N/A

**Failure State**: Failed step highlighted, error details expandable

**Mobile**: Stacked steps, full-width progress

---

### 10. Treatment Result

**Layout**: Result card with summary

**Hierarchy**:
1. Result status (success/failure/warnings)
2. Files changed count
3. Verification summary (passed/failed steps)
4. Score before → Score after
5. Diagnoses resolved
6. New problems introduced (if any)
7. Action buttons

**Primary Action**: "Download Repaired Copy" (success) or "Rollback" (failure)

**Secondary Actions**: View diff, View affected diagnoses, New examination

**Empty State**: N/A

**Failure State**: Clear error with rollback option

**Mobile**: Stacked result sections

---

### 11. Treatment History

**Layout**: Table or timeline

**Hierarchy**:
1. Page title with count
2. Date range filter
3. Status filter
4. History entries (date, diagnosis, treatment, status, files, score impact)
5. Entry detail expandable

**Primary Action**: Select entry to view details

**Secondary Actions**: Filter, Sort, Export

**Empty State**: "No treatment history yet"

**Failure State**: "Could not load history"

**Mobile**: Card-based list instead of table

---

### 12. Settings

**Layout**: Sectioned form

**Hierarchy**:
1. Repository retention policy
2. AI processing preferences
3. Appearance (dark/light mode)
4. Privacy information
5. Delete repository (destructive, confirmed)

**Primary Action**: Save changes

**Secondary Actions**: Delete repository

**Empty State**: N/A (always has defaults)

**Failure State**: "Could not save settings"

**Mobile**: Stacked sections

---

### 13. Sample Health Record

**Layout**: Same as Repository Overview, populated with example data

**Hierarchy**: Mirrors Repository Overview

**Primary Action**: "Connect Your Repository"

**Secondary Action**: Explore sample diagnoses

**Purpose**: Let users experience the product without connecting a repository

---

## 7. Visual Direction

### Design Personality
- Clinical precision meets developer-tool seriousness
- Editorial clarity with calm technical confidence
- Subtle visual sophistication, not decorative

### Medical Theme
**Use conceptually**: Examination, Diagnosis, Health Record, Treatment, Recovery, Verification
**Avoid literally**: Stethoscopes, cartoon doctors, medical crosses, hospital imagery, mascots

### Color System

**Foundation**:
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FAFAF9` (warm off-white) | Page background |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--surface-elevated` | `#F5F5F4` | Hover states, secondary surfaces |
| `--border` | `#E7E5E4` | Dividers, borders |
| `--text-primary` | `#1C1917` | Headings, primary text |
| `--text-secondary` | `#57534E` | Descriptions, secondary text |
| `--text-muted` | `#A8A29E` | Placeholders, metadata |

**Product Accent**:
| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#0D9488` (teal) | Primary actions, links |
| `--accent-hover` | `#0F766E` | Hover states |
| `--accent-light` | `#CCFBF1` | Accent backgrounds |

**Semantic Colors**:
| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#16A34A` | Passed verification, healthy states |
| `--success-light` | `#DCFCE7` | Success backgrounds |
| `--warning` | `#D97706` | Warnings, low severity |
| `--warning-light` | `#FEF3C7` | Warning backgrounds |
| `--critical` | `#DC2626` | Errors, high severity |
| `--critical-light` | `#FEE2E2` | Error backgrounds |
| `--info` | `#2563EB` | Informational |
| `--info-light` | `#DBEAFE` | Info backgrounds |

**Severity Colors** (used with icon + text, never color-only):
| Severity | Color | Icon |
|----------|-------|------|
| Critical | `--critical` | Alert triangle |
| High | `--warning` | Arrow up |
| Medium | `--info` | Minus |
| Low | `--text-muted` | Arrow down |

### Typography

**Font Stack**:
- **UI**: Geist, Inter, system-ui, sans-serif
- **Code**: Geist Mono, JetBrains Mono, monospace

**Scale**:
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-display` | 36px | 600 | Hero headings |
| `--text-h1` | 30px | 600 | Page titles |
| `--text-h2` | 24px | 600 | Section titles |
| `--text-h3` | 20px | 600 | Subsection titles |
| `--text-body` | 16px | 400 | Body text |
| `--text-small` | 14px | 400 | Secondary text |
| `--text-xs` | 12px | 400 | Labels, metadata |
| `--text-code` | 14px | 400 | Code, paths, hashes |

### Spacing Scale
4px base unit: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Buttons, inputs |
| `--radius-md` | 8px | Cards, panels |
| `--radius-lg` | 12px | Modals, dialogs |

### Shadows
Minimal use. Only for:
- Dropdowns and menus: `0 4px 6px -1px rgba(0,0,0,0.1)`
- Modals: `0 10px 15px -3px rgba(0,0,0,0.1)`

### Borders
Thin (1px), subtle color (`--border`). No heavy outlines.

### Density
Generous spacing between sections. Compact within data-dense areas (tables, lists). Never compress diagnosis evidence, verification results, or diffs.

---

## 8. Health Score Design

### Display
```
Repository Health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

68 / 100
Needs Attention

The score is affected by:
• 1 exposed credential (critical)
• Weak test coverage signals
• 4 undocumented environment variables

Last examined: 2 hours ago
Previous score: 72 (-4)
```

### Components
- **Numeric score**: Large, prominent
- **Health label**: "Excellent" (90-100), "Good" (70-89), "Needs Attention" (50-69), "Critical" (0-49)
- **Score explanation**: Plain-language summary of factors
- **Category breakdown**: Security, Reliability, Maintainability, Testing, Documentation, Dependencies
- **Trend**: Change from previous examination
- **Timestamp**: When last examined

### Avoid
- Giant decorative circles
- Gamification language
- Unexplained numbers

---

## 9. Diagnosis Card Design

### Card Layout
```
┌─────────────────────────────────────────────────────┐
│ ● Critical    Confidence: High    3 files affected  │
│                                                     │
│ Exposed GitHub Token in Configuration               │
│                                                     │
│ A valid GitHub personal access token is stored in   │
│ plain text in config.json, exposing repository      │
│ access to anyone with the source code.              │
│                                                     │
│ ● Automatic repair available                        │
│                                       View →        │
└─────────────────────────────────────────────────────┘
```

### Elements
- Severity indicator (icon + color + text)
- Confidence badge
- File count
- Title
- One-sentence explanation
- Repair availability
- Navigation arrow

---

## 10. Component Architecture

### Layout Components
| Component | Purpose |
|-----------|---------|
| `AppShell` | Main layout with sidebar and content area |
| `Sidebar` | Navigation sidebar |
| `TopBar` | Top navigation bar (mobile) |
| `RepositoryHeader` | Repository identity and status |
| `PageHeader` | Page title and actions |
| `SectionHeader` | Section within a page |
| `MobileNav` | Bottom navigation or drawer |

### Repository Components
| Component | Purpose |
|-----------|---------|
| `RepositoryCard` | Repository list item |
| `RepositoryIdentity` | Name, branch, language badges |
| `TechnologyBadge` | Detected technology indicator |
| `ExaminationStatus` | Current examination state |

### Health Components
| Component | Purpose |
|-----------|---------|
| `HealthScore` | Score display with explanation |
| `HealthGrade` | Letter grade or label |
| `HealthDimension` | Single category score |
| `HealthSummary` | Compact health overview |
| `ScoreTrend` | Score change indicator |

### Diagnosis Components
| Component | Purpose |
|-----------|---------|
| `DiagnosisCard` | List item for diagnoses |
| `DiagnosisList` | Scrollable diagnosis list |
| `DiagnosisFilters` | Filter sidebar/panel |
| `DiagnosisDetail` | Full diagnosis view |
| `SeverityBadge` | Severity indicator |
| `ConfidenceBadge` | Confidence level |
| `RepairabilityBadge` | Repair availability |
| `EvidencePanel` | Code evidence display |
| `AffectedFiles` | List of affected files |

### Treatment Components
| Component | Purpose |
|-----------|---------|
| `TreatmentProposal` | Proposed changes summary |
| `TreatmentSummary` | Compact treatment info |
| `DiffViewer` | Code diff display |
| `DiffFileHeader` | File change header |
| `ApprovalPanel` | Approval actions |
| `VerificationStep` | Single verification step |
| `VerificationList` | All verification steps |
| `TreatmentResult` | Outcome display |
| `RollbackPanel` | Rollback actions |

### Feedback Components
| Component | Purpose |
|-----------|---------|
| `EmptyState` | No content available |
| `ErrorState` | Error with recovery |
| `LoadingState` | Loading indicator |
| `ProgressTimeline` | Multi-step progress |
| `InlineAlert` | Inline messages |
| `Toast` | Temporary notifications |
| `ConfirmDialog` | Confirmation modals |

### Code Components
| Component | Purpose |
|-----------|---------|
| `CodeSnippet` | Inline code display |
| `FilePath` | File path with icon |
| `LineReference` | Line number reference |
| `CommandOutput` | Terminal output |
| `CopyButton` | Copy to clipboard |

---

## 11. Data Contract Plan

### Core Types

```typescript
// Repository
interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  branch: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  size: number; // bytes
  technologies: Technology[];
  createdAt: string;
  lastExaminedAt: string | null;
}

interface Technology {
  name: string;
  version: string | null;
  confidence: number;
}

// Examination
type ExaminationStatus =
  | "queued"
  | "validating"
  | "extracting"
  | "mapping"
  | "scanning"
  | "diagnosing"
  | "scoring"
  | "completed"
  | "failed";

interface Examination {
  id: string;
  repositoryId: string;
  status: ExaminationStatus;
  progress: number; // 0-100
  currentStage: string;
  stages: ExaminationStage[];
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

interface ExaminationStage {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
}

// Health
interface HealthRecord {
  id: string;
  repositoryId: string;
  examinationId: string;
  score: number; // 0-100
  grade: "excellent" | "good" | "needs_attention" | "critical";
  previousScore: number | null;
  scoreChange: number | null;
  dimensions: HealthDimension[];
  summary: string;
  examinedAt: string;
}

interface HealthDimension {
  name: string;
  score: number;
  weight: number;
  findings: number;
  summary: string;
}

// Diagnosis
type DiagnosisSeverity = "critical" | "high" | "medium" | "low";
type DiagnosisStatus = "open" | "resolved" | "dismissed";

interface Diagnosis {
  id: string;
  repositoryId: string;
  healthRecordId: string;
  title: string;
  summary: string;
  description: string;
  severity: DiagnosisSeverity;
  confidence: number; // 0-1
  category: string;
  affectedFiles: AffectedFile[];
  evidence: Evidence[];
  repairable: boolean;
  repairRisk: "low" | "medium" | "high";
  repairEffort: "quick" | "moderate" | "significant";
  status: DiagnosisStatus;
  createdAt: string;
}

interface AffectedFile {
  path: string;
  lines: [number, number][];
  relevance: string;
}

interface Evidence {
  type: "code" | "config" | "dependency" | "pattern";
  description: string;
  filePath: string | null;
  lines: [number, number][] | null;
  snippet: string | null;
}

// Treatment
type TreatmentStatus =
  | "proposed"
  | "approved"
  | "applying"
  | "verifying"
  | "completed"
  | "failed"
  | "rolled_back";

interface Treatment {
  id: string;
  repositoryId: string;
  diagnosisId: string;
  status: TreatmentStatus;
  proposal: TreatmentProposal;
  patches: FilePatch[];
  verification: VerificationRun;
  scoreBefore: number | null;
  scoreAfter: number | null;
  createdAt: string;
  completedAt: string | null;
}

interface TreatmentProposal {
  summary: string;
  risk: "low" | "medium" | "high";
  affectedFiles: string[];
  assumptions: string[];
  verificationPlan: string[];
}

interface FilePatch {
  path: string;
  operation: "add" | "modify" | "delete";
  additions: number;
  deletions: number;
  diff: string;
  explanation: string;
}

interface VerificationRun {
  steps: VerificationStep[];
  overallStatus: "pending" | "passed" | "failed" | "partial";
}

interface VerificationStep {
  name: string;
  command: string;
  status: "pending" | "running" | "passed" | "failed" | "unavailable" | "timeout";
  output: string | null;
  duration: number | null; // ms
}
```

### API Endpoints (Expected)

```
POST   /api/repos/connect          — Connect repository
GET    /api/repos                   — List repositories
GET    /api/repos/:id               — Get repository
DELETE /api/repos/:id               — Delete repository

POST   /api/repos/:id/examine       — Start examination
GET    /api/repos/:id/examination    — Get examination status
GET    /api/repos/:id/health         — Get latest health record
GET    /api/repos/:id/health/history — Get health history

GET    /api/repos/:id/diagnoses      — List diagnoses
GET    /api/repos/:id/diagnoses/:id  — Get diagnosis
PATCH  /api/repos/:id/diagnoses/:id  — Update diagnosis status

POST   /api/repos/:id/treatments     — Create treatment proposal
GET    /api/repos/:id/treatments     — List treatments
GET    /api/repos/:id/treatments/:id — Get treatment
POST   /api/repos/:id/treatments/:id/approve — Approve treatment
POST   /api/repos/:id/treatments/:id/rollback — Rollback treatment
GET    /api/repos/:id/treatments/:id/download  — Download result
```

### State Management

- **Server State**: TanStack Query for fetching, caching, and polling
- **Polling**: Examination progress polls every 2 seconds
- **Cache**: Treatment results cached, health records cached
- **Retry**: Automatic retry on network errors, exponential backoff
- **Optimistic Updates**: Diagnosis status changes (dismiss/resolve)

---

## 12. Responsive Design

### Breakpoints
| Name | Width | Layout |
|------|-------|--------|
| Desktop | ≥1280px | Sidebar + content |
| Laptop | 1024-1279px | Collapsible sidebar |
| Tablet | 768-1023px | No sidebar, tab navigation |
| Mobile | <768px | Bottom navigation, stacked |

### Desktop (≥1280px)
- Persistent sidebar (240px)
- Content area with max-width 1200px
- Split layouts for diagnosis detail
- Side-by-side diff when space permits
- Full filter sidebar

### Laptop (1024-1279px)
- Collapsible sidebar (icons only)
- Content area fills available space
- Split layouts where possible
- Filters in dropdown panel

### Tablet (768-1023px)
- No sidebar
- Top navigation with dropdown
- Stacked layouts
- Unified diff
- Filters in bottom sheet

### Mobile (<768px)
- Bottom navigation (5 items max)
- Stacked everything
- Compact repository header
- Filters in bottom sheet
- Full-width diagnosis cards
- Unified diff only
- Sticky primary actions

### Information Hiding Strategy
| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Sidebar | Visible | Collapsed | Hidden (bottom nav) |
| Filters | Sidebar | Dropdown | Bottom sheet |
| Diagnosis evidence | Side panel | Below content | Collapsible |
| Diff view | Side-by-side | Unified | Unified |
| Health dimensions | Grid | Stack | Stack |
| Repository metadata | Header | Collapsible | Collapsible |

---

## 13. Accessibility Requirements

### Semantic Structure
- Proper heading hierarchy (h1 → h2 → h3)
- Landmark regions (nav, main, aside, footer)
- List structures for diagnosis lists
- Table structures for treatment history

### Keyboard Navigation
- Tab order follows visual flow
- Skip links for main content
- Arrow keys for list navigation
- Enter/Space for actions
- Escape to close modals/sheets
- Focus trapping in dialogs

### Focus Management
- Visible focus rings (2px, offset 2px)
- Focus restoration on dialog close
- Focus management on route change
- Announce page changes to screen readers

### ARIA Patterns
- `role="progressbar"` for examination progress
- `aria-live="polite"` for status updates
- `aria-expanded` for collapsible sections
- `aria-selected` for tabs
- `aria-label` for icon-only buttons

### Color Independence
- Severity: icon + text + color (never color-only)
- Status: icon + text + color
- Score: numeric value + label

### Contrast
- Text: minimum 4.5:1 against background
- Large text: minimum 3:1
- Interactive elements: minimum 3:1 against adjacent colors

### Reduced Motion
- Respect `prefers-reduced-motion`
- Disable animations when enabled
- Keep transitions functional (position, opacity only)

### Screen Reader Support
- Announce examination progress updates
- Announce diagnosis count changes
- Announce verification step completion
- Describe diff changes

---

## 14. Motion Design

### Principles
- Indicate progress, cause and effect, state change
- Never decorative, never distracting
- Respect reduced-motion preferences

### Transitions
| Element | Duration | Easing |
|---------|----------|--------|
| Page transitions | 200ms | ease-in-out |
| Card expansion | 200ms | ease-out |
| Filter changes | 150ms | ease-in-out |
| Score reveal | 400ms | ease-out |
| Verification step | 150ms | ease-in-out |
| Success confirmation | 300ms | ease-out |

### Animations
- Examination stages: fade + slide up
- Score counter: count-up animation
- Verification checks: scale + color transition
- Diff expansion: height transition
- Toast notifications: slide in from top

### Avoid
- Constant pulsing
- Floating decorations
- Large parallax effects
- Excessive gradient movement
- Fake terminal typing
- Bouncy animations
- Confetti

---

## 15. Content and Microcopy

### Voice
Confident, restrained, technical, honest.

### Primary Actions
| Context | Label |
|---------|-------|
| Start examination | Begin Examination |
| View diagnosis | View Diagnosis |
| Generate treatment | Generate Treatment Proposal |
| Approve treatment | Approve and Run Verification |
| Download result | Download Repaired Copy |
| Rollback | Rollback Changes |
| Re-examine | Re-examine Repository |

### Status Messages
| State | Message |
|-------|---------|
| No tests found | "No automated tests were found. Linting and static checks completed successfully." |
| Verification incomplete | "Verification was incomplete. Some checks could not be run." |
| Treatment failed | "Treatment failed verification. Your original repository is unchanged." |
| Healthy repo | "Repository is in good health. No critical issues detected." |

### Error Messages
| Error | Message |
|-------|---------|
| Invalid URL | "Enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)" |
| Private repo | "Private repositories require authentication. Coming soon." |
| Too large | "Repository exceeds 100MB limit. Try a smaller repository." |
| Examination failed | "Examination failed at [stage]. [Reason]. Try again or connect a different repository." |
| Network error | "Could not connect to Repo Doctor. Check your internet connection." |

### Avoid
- "Let AI work its magic"
- "Instantly fix your entire codebase"
- "Your repository is doomed"
- "We found every bug"
- "One-click perfect code"
- "AI-powered awesomeness"
- "Guaranteed secure"

---

## 16. Implementation Roadmap

### Phase 1: Design Foundation
**Files to create**:
- `tailwind.config.ts` — Design tokens
- `src/styles/globals.css` — Global styles, fonts
- `src/lib/types.ts` — All TypeScript types
- `src/lib/api.ts` — API client

**Dependencies**: Tailwind CSS, Geist font

**Validation**: Styles render correctly, types compile

---

### Phase 2: Application Shell
**Files to create**:
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/app/layout.tsx`

**Dependencies**: None beyond Phase 1

**Validation**: Navigation works, responsive behavior correct

---

### Phase 3: Repository Intake
**Files to create**:
- `src/app/page.tsx` — Landing page
- `src/app/connect/page.tsx` — Repository connection
- `src/components/repository/RepositoryForm.tsx`
- `src/components/repository/URLInput.tsx`
- `src/components/repository/ZIPUpload.tsx`

**Dependencies**: TanStack Query for form submission

**Validation**: Form validation works, error states display

---

### Phase 4: Examination Progress
**Files to create**:
- `src/app/exam/[id]/progress/page.tsx`
- `src/components/examination/ProgressTimeline.tsx`
- `src/components/examination/StageIndicator.tsx`

**Dependencies**: Polling via TanStack Query

**Validation**: Progress updates in real-time, failure states work

---

### Phase 5: Repository Health Dashboard
**Files to create**:
- `src/app/app/repos/[repoId]/page.tsx`
- `src/components/health/HealthScore.tsx`
- `src/components/health/HealthDimensions.tsx`
- `src/components/health/ScoreTrend.tsx`

**Dependencies**: Health data types, API integration

**Validation**: Score displays correctly, dimensions render

---

### Phase 6: Diagnosis Experience
**Files to create**:
- `src/app/app/repos/[repoId]/diagnoses/page.tsx`
- `src/app/app/repos/[repoId]/diagnoses/[id]/page.tsx`
- `src/components/diagnosis/DiagnosisCard.tsx`
- `src/components/diagnosis/DiagnosisList.tsx`
- `src/components/diagnosis/DiagnosisFilters.tsx`
- `src/components/diagnosis/DiagnosisDetail.tsx`
- `src/components/diagnosis/EvidencePanel.tsx`

**Dependencies**: Diagnosis types, filter state management

**Validation**: Filters work, detail view renders evidence

---

### Phase 7: Treatment Experience
**Files to create**:
- `src/app/app/repos/[repoId]/treatments/[id]/page.tsx`
- `src/components/treatment/TreatmentProposal.tsx`
- `src/components/treatment/DiffViewer.tsx`
- `src/components/treatment/ApprovalPanel.tsx`
- `src/components/treatment/VerificationSteps.tsx`
- `src/components/treatment/TreatmentResult.tsx`

**Dependencies**: Diff viewer library (Monaco or similar)

**Validation**: Diff renders, approval flow works, verification updates

---

### Phase 8: History and Secondary Screens
**Files to create**:
- `src/app/app/repos/[repoId]/history/page.tsx`
- `src/app/app/repos/[repoId]/settings/page.tsx`
- `src/components/history/HistoryList.tsx`
- `src/components/settings/SettingsForm.tsx`

**Dependencies**: History data types

**Validation**: History displays, settings save correctly

---

### Phase 9: Quality Pass
**Tasks**:
- Responsive review at all breakpoints
- Keyboard navigation testing
- Screen reader testing
- Empty state review
- Error state review
- Motion review
- Performance optimization
- Visual consistency audit

**Validation**: All screens pass quality checklist

---

## 17. Risks and Open Questions

### Assumed Decisions
1. **Single-user for MVP**: No authentication required initially
2. **GitHub only**: ZIP upload as secondary option
3. **No real-time backend**: Polling for progress updates
4. **Local storage for settings**: No server-side preferences
5. **Sample data**: Hardcoded sample health record for demo

### Open Questions
1. Backend API timeline — affects mock data strategy
2. Deployment target — Vercel, Netlify, or self-hosted?
3. Authentication scope — when to add user accounts?
4. Repository size limits — what's the actual maximum?
5. Treatment scope — single fix or batch fixes?

### Technical Risks
1. **Diff viewer complexity**: Monaco Editor is heavy; consider lighter alternatives
2. **Polling efficiency**: Many concurrent examinations could strain backend
3. **Mobile diff readability**: Code diffs on small screens are inherently challenging
4. **Score explanation generation**: AI-generated summaries need quality control

---

## FRONEND PLANNING COMPLETE

**Ready to begin implementation in this order**:

1. **Phase 1**: Design Foundation — Tailwind config, global styles, TypeScript types, API client
2. **Phase 2**: Application Shell — Layout, sidebar, mobile navigation
3. **Phase 3**: Repository Intake — Landing page, connection form, validation
4. **Phase 4**: Examination Progress — Progress timeline, stage indicators, polling
5. **Phase 5**: Repository Dashboard — Health score, dimensions, summary
6. **Phase 6**: Diagnosis Experience — List, filters, detail, evidence
7. **Phase 7**: Treatment Experience — Proposal, diff, approval, verification, result
8. **Phase 8**: History and Settings — Treatment history, repository settings
9. **Phase 9**: Quality Pass — Responsive, accessibility, motion, performance
