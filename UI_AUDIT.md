# Skillovate UI Audit and Migration Plan

Status: Phase 1 analysis only. No redesign. No placeholder pages. No iframe migration.

## Source Files Audited

### HTML Pages

| Original file | Lines | Target route | Purpose |
|---|---:|---|---|
| `frontend/index.html` | 288 | `app/page.tsx` | Public landing page |
| `frontend/learner.html` | 1663 | `app/learner/page.tsx` | Standalone learner portal |
| `frontend/institutional.html` | 5074 | `app/institutional/page.tsx` | Multi-role institutional portal: student, faculty, college admin, super admin |
| `frontend/hr.html` | 830 | `app/hr/page.tsx` | Recruiter/HR portal |

### JavaScript Files

| File | Lines | Current responsibility |
|---|---:|---|
| `frontend/data.js` | 209 | Static aptitude questions, MNCs, interview questions, job roles, college list |
| `frontend/qbank.js` | 21 | Question-bank bootstrap/global exports |
| `frontend/core.js` | 4712 | Shared app state, navigation, profile/settings, admin/faculty/HR utilities, resume, charts, tests, exports |
| `frontend/learner.js` | 1095 | Learner auth, practice, MNC tests, mock interviews, profile tabs, resume builder |
| `frontend/institutional-core.js` | 1647 | Institutional API client, auth, role routing, session recovery, admin dashboards, college DB, exports |
| `frontend/institutional-student.js` | 2008 | Institutional student dashboard, practice, tests, MNC, interview, resume, leaderboard, placement submission |
| `frontend/institutional-faculty.js` | 462 | Faculty batch upload, extraction flow, history, student tracker |
| `frontend/institutional-admin.js` | 380 | College admin dashboard, assessments CRUD/results/overview |
| `frontend/hr.js` | 662 | HR auth, vacancy posting, AI profile summary, billing, AI toggles, applicant tools |
| Utility/dev scripts | 156 | `extract.js`, `extract_and_inject.js`, `inject.js`, `split_js.js`; not runtime migration targets |

### CSS Files

| File | Lines | Current responsibility |
|---|---:|---|
| `frontend/landing.css` | 562 | Landing page visual system, hero, feature cards, about section, footer, responsive landing layout |
| `frontend/styles.css` | 7071 | Main portal design system: auth layout, sidebar/topbar, cards, dashboards, tests, resume, admin, faculty, HR, leaderboard, animations |
| `frontend/settings_v3.css` | 374 | Settings v3 profile/account/billing layout and responsive behavior |

## Visual System Inventory

### Typography

The whole product uses `Plus Jakarta Sans` with weights 300, 400, 500, 600, 700, 800. Migration should load this once in `app/layout.tsx` via `next/font/google` and preserve existing font weights.

### Core Color Tokens

`styles.css` defines the main portal palette:

| Token | Value |
|---|---|
| `--bg` | `#F7F5F0` |
| `--surface` | `#FFFCF8` |
| `--surface2` | `#FDF9F3` |
| `--surface3` | `#F5F1EA` |
| `--accent` | `#1B6FE6` |
| `--accent2` | `#4A90F5` |
| `--green` | `#0E9F6E` |
| `--purple` | `#6C5CE7` |
| `--amber` | `#F59E0B` |
| `--red` | `#EF4444` |
| `--teal` | `#0D9488` |
| `--pink` | `#EC4899` |
| `--text` | `#1E2350` |
| `--muted` | `#6B7280` |
| `--sidebar` | `232px` |

`landing.css` has its own landing tokens using `--lp-*`, including `--lp-bg`, `--lp-text`, `--lp-accent`, `--lp-surface`, and `--lp-border`.

`settings_v3.css` has `--sv3-*` tokens for the settings module.

### Layout Patterns

The original app uses:

- Fixed full-screen login/auth pages with split left narrative panel and right auth card.
- Sidebar + topbar + content shell for learner, institutional, and HR portals.
- Screen switching through `.screen` elements and `ss(screenId, navId)`.
- Dense dashboard cards with `.sg`, `.g2`, `.g3`, `.gms`, `.card`, `.sc`, `.ct`, `.ph`, `.pt`, `.ps`.
- Modal overlays for student profile, assessment creation, applications, tests, and resume preview.
- Chart.js canvases for dashboard, profile, results, and analytics visualizations.
- Export flows using XLSX/html2pdf/Word document generation.

### Animations and Responsiveness

Preserve these named animation behaviors:

- Global: `fadeIn`, `slideUp`, `barGrow`, `shake`, `spin`, `pulse`, `dotPop`.
- Landing: `slideUp`, `fadeIn`, `slideInRight`.
- Settings: `sv3-fade`.
- Advanced leaderboard/admin effects: `skFadeUp`, `sk-pulse`, `sk-fade-in`, `meshMove`, `vaultScan`, `liquidEntrance`, `particleFall`, `rowEntrance`, `pulseSoft`, `shimmer`.

Responsive breakpoints currently exist around `1400px`, `991px`, `900px`, `640px`, and `600px`.

## Page Inventory

### Landing Page: `index.html`

Route: `/`

Major sections:

- Navbar: logo, Features, About, HR/Recruitment, Institutional Login, Sign up free.
- Hero: AI-powered placement prep pill, headline, subtext, CTA buttons, `hero_video.mp4`.
- Features grid: AI Assessment, Real-Time Analytics, Secure Access, Unified Management, Career Enablement, Resource Center.
- About section: long-form Skillovate platform description and stacked feature cards.
- CTA section: mission/value proposition.
- Footer: brand, product links, company links.

Dependencies:

- `landing.css`
- `logo.png`
- `hero_video.mp4`

### Learner Portal: `learner.html`

Route: `/learner`

Screens:

- Login screen: `learner-login-page`
- `screen-dash`: learner dashboard
- `screen-practice`: mock practice subject selection
- `screen-question`: active practice question flow
- `screen-tests`: aptitude tests
- `screen-test-active`: active aptitude test
- `screen-test-results`: test results/review
- `screen-mnc`: MNC/company test selection
- `screen-mnc-test`: active MNC test
- `screen-lb`: top talent board
- `screen-profile`: profile summarizer
- `screen-resume`: resume builder
- `screen-iv`: mock interviewer
- `screen-subs`: subscription/plan screen
- `screen-settings`: settings v3

Navigation:

- Dashboard -> `dash`
- Mock Practice -> `practice`
- Aptitude Tests -> `tests`
- MNC Test -> `mnc`
- Mock Interviewer -> `iv`
- Profile Summarizer -> `profile`
- Resume Builder -> `resume`
- Top Talent Board -> `lb`
- Settings -> `settings`
- Plan strip -> `subs`

Runtime scripts:

- `data.js`
- `qbank.js`
- `core.js`
- `learner.js`

Key behaviors to migrate:

- Learner email/password login.
- Practice session generation, option selection, per-question timer, summary overlay.
- MNC search, MNC test generation, timer, results.
- Mock interview role filtering, timed questions, answer capture, AI-style feedback summary.
- Profile tabs and Chart.js charts.
- Resume builder modes, template switching, upload simulation, ATS score behavior.
- Sidebar collapse and mobile sidebar behavior.
- Settings profile/account/billing tabs.

### Institutional Portal: `institutional.html`

Route: `/institutional`

Login/auth entry:

- Student tab: college + roll/password login.
- Faculty tab: login/register.
- Admin tab: login/register.
- Master console access: hidden/revealed super admin access.
- College dropdowns and session recovery.

Super admin screens:

- `screen-master-dash`
- `screen-master-approvals`

Student screens:

- `screen-dash`
- `screen-practice`
- `screen-question`
- `screen-tests`
- `screen-test-active`
- `screen-test-results`
- `screen-mnc`
- `screen-mnc-test`
- `screen-iv`
- `screen-profile`
- `screen-resume`
- `screen-lb`
- `screen-placement-submit`
- `screen-settings`

Faculty screens:

- `screen-fac-upload`
- `screen-fac-history`
- `screen-fac-tracker`
- `screen-settings`

College admin screens:

- `screen-cadm-dash`
- `screen-cadm-db`
- `screen-cadm-placement`
- `screen-cadm-testresults`
- `screen-cadm-scores`
- `screen-cadm-jobs`
- `screen-cadm-cycle`
- `screen-cadm-members`
- `screen-cadm-company`
- `screen-cadm-mockiv`
- `screen-cadm-scheduletest`
- `screen-cadm-learning`
- `screen-cadm-events`
- `screen-cadm-forms`
- `screen-cadm-assess`
- `screen-cadm-community`
- `screen-settings`

Runtime scripts:

- `data.js`
- `qbank.js`
- `core.js`
- `institutional-core.js`
- `institutional-student.js`
- `institutional-faculty.js`
- `institutional-admin.js`

External libraries currently used:

- Chart.js
- XLSX
- html2pdf.js
- tsparticles
- Google GSI, to be removed in Phase 5

Key behaviors to migrate:

- Role-scoped login and routing.
- API wrapper with credentialed fetch.
- Heartbeat persistence to `/api/userdata`.
- Student identity sync by college and roll number.
- Student practice/test/MNC/interview/resume/leaderboard/placement flows.
- Faculty upload, spreadsheet-style extraction, approval submission, history and tracker.
- College admin dashboard, student DB filters, exports, scores, jobs, cycles, members, companies, mock interviews, scheduled tests, learning resources, events, forms, assessments.
- Assessment create modal, CRUD, results, overview charts.
- Super admin approvals/system dashboard.

### HR Portal: `hr.html`

Route: `/hr`

Screens:

- Login/register screen: `hr-login-page`
- `screen-hr-dash`: dashboard
- `screen-hr-vac`: post vacancy
- `screen-hr-app`: applicants
- `screen-hr-lb`: global talent board
- `screen-hr-analytics`: candidate analytics
- `screen-hr-settings`: settings

Navigation:

- Dashboard -> `hr-dash`
- Post Vacancy -> `hr-vac`
- Applicants -> `hr-app`
- Talent Board -> `hr-lb`
- Candidate Analytics -> `hr-analytics`
- Settings -> `hr-settings`

Runtime scripts:

- `data.js`
- `qbank.js`
- `core.js`
- `hr.js`

Key behaviors to migrate:

- HR email/password login/register.
- Vacancy posting live UI update.
- Applicant table actions and resume/profile modals.
- Talent board visual effects.
- Candidate analytics.
- Billing toggle.
- AI mode toggle/metrics behavior.

## Component Inventory

### Shared Components

- `Logo`
- `ToastViewport`
- `AuthSplitLayout`
- `AuthCard`
- `TextInput`, `PasswordInput`, `SelectInput`, `Textarea`
- `Button`
- `Badge`
- `Sidebar`
- `SidebarSection`
- `SidebarItem`
- `PlanStrip`
- `Topbar`
- `SearchBox`
- `UserMenu`
- `IconButton`
- `ScreenContainer`
- `StatCard`
- `MetricStrip`
- `Card`
- `Table`
- `Tabs`
- `Modal`
- `ProgressBar`
- `Timer`
- `ChartPanel`
- `EmptyState`
- `FileDropzone`
- `SettingsV3`

### Landing Components

- `LandingNav`
- `LandingHero`
- `HeroVideo`
- `FeatureGrid`
- `FeatureCard`
- `AboutSection`
- `AboutFeatureStack`
- `LandingCta`
- `LandingFooter`

### Learner Components

- `LearnerLogin`
- `LearnerShell`
- `LearnerSidebar`
- `LearnerDashboard`
- `PracticeSubjectGrid`
- `PracticeQuestionScreen`
- `PracticeSummaryModal`
- `AptitudeTests`
- `ActiveTest`
- `TestResults`
- `MncGrid`
- `MncTest`
- `InterviewRoleGrid`
- `InterviewSession`
- `InterviewSummaryModal`
- `ProfileSummarizer`
- `ProfileTabContent`
- `ResumeBuilder`
- `Leaderboard`
- `SubscriptionPanel`
- `LearnerSettings`

### Institutional Components

- `InstitutionalLogin`
- `InstitutionSelect`
- `StudentLoginPanel`
- `FacultyAuthPanel`
- `AdminAuthPanel`
- `MasterConsoleAccess`
- `InstitutionalShell`
- `RoleAwareSidebar`
- `StudentPortalScreens`
- `FacultyPortalScreens`
- `CollegeAdminPortalScreens`
- `SuperAdminScreens`
- `FacultyUpload`
- `FacultyExtractionPreview`
- `FacultyHistory`
- `FacultyTracker`
- `CollegeAdminDashboard`
- `CollegeDatabase`
- `PlacementManagement`
- `TestResultsAdmin`
- `CollegeScores`
- `JobsManager`
- `PlacementCycleManager`
- `MembersManager`
- `CompanyManager`
- `MockInterviewAdmin`
- `ScheduleTestAdmin`
- `LearningResources`
- `EventsManager`
- `FormsManager`
- `AssessmentManager`
- `CreateAssessmentModal`
- `AssessmentResults`
- `AssessmentOverview`
- `CommunityManager`
- `PlacementSubmission`

### HR Components

- `HrLogin`
- `HrRegister`
- `HrShell`
- `HrDashboard`
- `VacancyForm`
- `VacancyPreview`
- `ApplicantsTable`
- `TalentBoard`
- `CandidateAnalytics`
- `HrSettings`
- `BillingToggle`
- `AiModeToggle`

## State and Data Inventory

### Current Global State

Current vanilla JS relies on globals:

- `currentUser`
- `state`
- `Qs`
- `MNCs`
- `MNCQs`
- `ivQs`
- `jobRoles`
- `colleges`
- `liveAssessments`
- `cadmAllStudents`
- `profileCharts`
- `ivAnswers`
- `localPersistentState`
- localStorage keys such as `skilloUser`, `sk_token`, `sk_approved_students`, and `sk_track_v3_*`.

### Zustand Store Plan

- `useAuthStore`: user, tokens, role, login/register/logout/session recovery.
- `useUiStore`: active screen, active nav, sidebar collapsed/open, toast queue, UI mode.
- `useLearnerStore`: practice state, test state, MNC state, interview state, profile/resume state.
- `useInstitutionStore`: selected college, roll number, role portal, student sync data, approvals, faculty upload state.
- `useAdminStore`: college DB filters, assessments, results, dashboard sync, exports.
- `useHrStore`: vacancies, applicants, talent board filters, billing, AI mode.
- `useSettingsStore`: profile form, avatar, password field, completion/health.

### React Query Plan

Queries:

- `auth.me`
- `colleges.list`
- `students.identify`
- `students.list`
- `students.detail`
- `dashboard.student`
- `dashboard.admin`
- `dashboard.super`
- `assessments.list`
- `assessments.detail`
- `assessments.results`
- `assessments.overview`
- `batches.history`
- `batches.students`
- `placements.list`
- `leaderboard.list`

Mutations:

- `auth.register`
- `auth.login`
- `auth.logout`
- `auth.refresh`
- `students.update`
- `students.resume.save`
- `students.apply`
- `tests.submit`
- `interviews.submit`
- `batches.create`
- `batches.approveReject`
- `assessments.create/update/delete`
- `placements.create/verify`

## API Endpoint Inventory From Frontend

The frontend currently calls these backend endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google-login` - remove in Phase 5
- `POST /api/auth/forgot-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/colleges`
- `GET /api/colleges/me`
- `POST /api/students/identify`
- `GET /api/students?limit=1000`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- `POST /api/students/:id/resume`
- `POST /api/students/:id/apply`
- `POST /api/students/:id/track`
- `GET /api/students/:id/tests`
- `POST /api/students/:id/tests`
- `GET /api/students/:id/tests/analytics`
- `POST /api/tests/submit`
- `GET /api/tests/college/results`
- `GET /api/students/:id/interviews`
- `POST /api/students/:id/interviews`
- `GET /api/students/:id/achievements`
- `POST /api/students/:id/achievements/evaluate`
- `GET /api/leaderboard`
- `GET /api/dashboard/student/:id`
- `GET /api/dashboard/admin`
- `GET /api/dashboard/super`
- `GET /api/userdata`
- `POST /api/userdata`
- `GET /api/batches/history`
- `GET /api/batches/students`
- `GET /api/batches/pending`
- `POST /api/batches`
- `PUT /api/batches/:id/status`
- `GET /api/assessments`
- `POST /api/assessments`
- `GET /api/assessments/:id`
- `PUT /api/assessments/:id`
- `DELETE /api/assessments/:id`
- `GET /api/assessments/:id/results`
- `GET /api/assessments/overview/stats?days=&dept=`
- `GET /api/placements`
- `POST /api/placements`
- `GET /api/placements/student/:id`
- `PUT /api/placements/:id/verify`

External non-migrated/local AI endpoints:

- `http://localhost:11434/api/generate`
- `http://localhost:11434/api/tags`

## Asset Inventory

| Asset | Size | Usage |
|---|---:|---|
| `logo.png` | 152821 bytes | Brand logo in all pages/auth/sidebar/footer |
| `hero_video.mp4` | 931648 bytes | Landing hero video |
| `wallpaper_skillovate.jpeg` | 63988 bytes | Background/visual asset |
| `beginner.jpeg` | 126994 bytes | Achievement badge image |
| `proficientjpeg.jpeg` | 141193 bytes | Achievement badge image |
| `advance.png.jpeg` | 160089 bytes | Achievement badge image |
| `expert.jpeg` | 177323 bytes | Achievement badge image |
| `quantitative_mcq.json` | 69276 bytes | Question bank |
| `logical_mcq_500.json` | 89997 bytes | Question bank |
| `verbal_json_20260418_40a84d.json` | 79900 bytes | Question bank |
| `datainterpretation_json_20260418_efaa7a.json` | 71750 bytes | Question bank |
| `berth_sample.json` | 3 bytes | BerthAI placeholder data |
| `temp_berth.txt` | 915574 bytes | Generated/training text; migration decision needed |

## UI Migration Plan

### Ground Rules

- Preserve original layout, colors, spacing, typography, animations, and responsive behavior.
- Do not introduce a new visual design system.
- Use Tailwind only as implementation support; CSS variables and existing class semantics remain authoritative.
- Use ShadCN only where it can match the original behavior without visible redesign, mainly accessible dialogs/forms if needed.
- Remove Google login in Phase 5, but keep the surrounding auth layout visually intact.
- Replace DOM mutation with React state and component rendering.
- Replace `onclick`/global functions with typed component props and hooks.
- Replace `fetch` with Axios clients and React Query hooks.

### Phase 2 Steps

1. Move assets into `v2/frontend/public` with the same filenames expected by the UI.
2. Port `landing.css`, `styles.css`, and `settings_v3.css` into the Next app unchanged first.
3. Convert `index.html` into typed React components while keeping markup/class parity.
4. Convert each portal shell and screen from HTML into route-scoped components.
5. Extract shared components only after parity is achieved for repeated structures.
6. Convert `data.js` and `qbank.js` into typed data modules.
7. Convert `core.js` functionality into stores, hooks, and utilities in small slices.
8. Convert page-specific scripts:
   - `learner.js` -> learner hooks/components/store.
   - `institutional-core.js` -> institutional API/auth/session hooks.
   - `institutional-student.js` -> student portal modules.
   - `institutional-faculty.js` -> faculty modules.
   - `institutional-admin.js` -> college admin modules.
   - `hr.js` -> HR modules.
9. Validate visual parity screen-by-screen before deleting the original HTML dependency.

## Next.js Component Structure

```text
v2/frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── learner/page.tsx
│   ├── institutional/page.tsx
│   ├── hr/page.tsx
│   ├── globals.css
│   ├── landing.css
│   ├── styles.css
│   └── settings_v3.css
├── components/
│   ├── shared/
│   ├── landing/
│   ├── learner/
│   ├── institutional/
│   ├── faculty/
│   ├── admin/
│   ├── hr/
│   └── settings/
├── hooks/
│   ├── use-auth.ts
│   ├── use-screen-nav.ts
│   ├── use-timer.ts
│   ├── use-question-session.ts
│   ├── use-assessments.ts
│   ├── use-batches.ts
│   └── use-dashboard.ts
├── stores/
│   ├── auth-store.ts
│   ├── ui-store.ts
│   ├── learner-store.ts
│   ├── institutional-store.ts
│   ├── admin-store.ts
│   ├── hr-store.ts
│   └── settings-store.ts
├── lib/
│   ├── api.ts
│   ├── auth-token.ts
│   ├── charts.ts
│   ├── export.ts
│   ├── question-bank.ts
│   └── utils.ts
├── data/
│   ├── questions.ts
│   ├── mnc.ts
│   ├── interviews.ts
│   ├── job-roles.ts
│   └── colleges.ts
└── types/
    ├── auth.ts
    ├── user.ts
    ├── assessment.ts
    ├── batch.ts
    ├── placement.ts
    ├── interview.ts
    └── dashboard.ts
```

## Validation Plan Before Any Next Phase

For each migration slice:

1. `npm run build`
2. TypeScript check through Next build.
3. Visual comparison against original page/screen.
4. No placeholder screens.
5. No route advances until all screens in the current page are migrated.

Backend validation starts only after the frontend migration phase is approved and implemented.
