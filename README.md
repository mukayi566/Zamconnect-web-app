ZamID Connect Admin Panel

Official government administration dashboard for Zambia's national digital identity system.
 Overview

The ZamID Connect Admin Panel is a secure, role-based web application built for government officials to manage Zambia's national digital identity infrastructure. It enables administrators, registrars, and verifiers to register citizens, manage ID statuses, verify identities, and maintain a full audit trail of all sensitive actions  all through a clean, accessible interface built on Zambia's national colors.

What it does

  Registers citizens and generates signed digital ID cards with QR codes
  Provides real-time dashboards with registration trends and status breakdowns by province
  Enables instant identity verification by NRC number or QR payload
  Maintains a tamper-evident audit log of every action with actor, IP, and timestamp
  Supports role-based access so verifiers can't perform admin-level actions

 Demo Access

> For development and demonstration purposes only. Remove from production.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@zamid.gov.zm | ZamID@2026! |
| Registrar | registrar@zamid.gov.zm | ZamID@2026! |
| Verifier | verifier@zamid.gov.zm | ZamID@2026! |

 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL) |
| Server State | TanStack Query v5 (React Query) |
| Client State | Zustand |
| Charts | Recharts |
| Forms | Formik + Yup |
| Icons | Lucide React |
| Date Utilities | date-fns |
| QR Codes | react-qr-code |

 Project Structure

```
zamid-admin/
├── public/
│   └── zambia-coat-of-arms.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Fixed sidebar with nav links
│   │   │   ├── Header.tsx           # Top bar with breadcrumbs + admin info
│   │   │   └── AppLayout.tsx        # Authenticated page wrapper
│   │   ├── ui/
│   │   │   ├── Badge.tsx            # Status badges (pending/active/suspended)
│   │   │   ├── StatCard.tsx         # Metric cards for dashboard
│   │   │   ├── DataTable.tsx        # Reusable paginated table
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ConfirmDialog.tsx    # Destructive action confirmation
│   │   └── charts/
│   │       ├── RegistrationLineChart.tsx   # Daily registrations (30 days)
│   │       ├── StatusPieChart.tsx          # Citizen status breakdown
│   │       └── ProvinceBarChart.tsx        # Citizens by province
│   ├── pages/
│   │   ├── Login.tsx                # Split-screen Zambia-branded login
│   │   ├── Dashboard.tsx            # Stats + charts + recent activity
│   │   ├── Citizens.tsx             # Paginated citizens table
│   │   ├── CitizenDetail.tsx        # Full profile + QR + status actions
│   │   ├── VerificationLogs.tsx     # Verification history table
│   │   ├── AuditLogs.tsx            # Full audit trail with export
│   │   ├── VerifyTool.tsx           # Live NRC/QR identity checker
│   │   └── Settings.tsx             # Admin profile + password
│   ├── hooks/
│   │   ├── useCitizens.ts
│   │   ├── useAuditLogs.ts
│   │   └── useVerificationLogs.ts
│   ├── services/
│   │   ├── supabase.ts              # Supabase client singleton
│   │   ├── citizenService.ts        # All citizen CRUD operations
│   │   ├── verifyService.ts         # NRC + QR verification
│   │   └── auditService.ts          # Audit log writes
│   ├── store/
│   │   └── authStore.ts             # Zustand auth session store
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript interfaces
│   └── utils/
│       ├── formatters.ts            # Date, NRC, phone formatters
│       └── statusColors.ts          # Status → Tailwind class map
├── .env
├── .env.example
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

Pages

Dashboard
Real-time stats overview with four metric cards (Total Citizens, Pending, Active, Verifications Today) and three Recharts visualizations: a line chart of daily registrations over 30 days, a pie chart of citizen statuses, and a horizontal bar chart of citizens by province. The bottom of the page shows the last 10 audit log entries.

Citizens
Full paginated table of all registered citizens with live search (by name or NRC), filter dropdowns for status and province, and per-row actions to view, activate, or suspend. Returns 20 rows per page using Supabase range queries.

Citizen Detail
Complete citizen profile with a styled digital ID card component showing the citizen's photo, name, NRC number, date of birth, province, and a live QR code rendered from the signed payload. The right column shows all personal information fields and a status management panel with Activate / Suspend / Reject buttons, each protected by a confirmation dialog. Below that, the last 10 verification events for this citizen are shown.

Verification Logs
Full table of every verification event across the system with columns for date/time, citizen name and NRC, method (QR, NRC, biometric), result (verified, failed, tampered), organization, verifier, and IP address. Supports result filtering and CSV export.

Audit Log
Tamper-evident log of every sensitive action in the system every status change, login, registration, and verification. Shows actor email, action code, target resource, IP address, and expandable metadata. Color-coded action badges and date range filtering. Supports full CSV export.

Verify Tool
Two-tab identity checker for use at point-of-service. Tab 1 accepts an NRC number and returns the citizen's verified status card. Tab 2 accepts a pasted QR JSON payload, validates the HMAC signature, and returns a VERIFIED or TAMPERED/INVALID result. All verification attempts are logged automatically.

 Settings
Admin profile management  view current account details, change password via Supabase auth, and log out from all sessions.

Getting Started

### Prerequisites

- Node.js 20 or later
- A Supabase project with the ZamID schema applied (see Database Setup below)
- npm or pnpm

Installation

```bash
# Clone the repository
git clone https://github.com/your-org/zamid-admin.git
cd zamid-admin

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

 Environment Variables

Open `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Use the **anon key** (not the service role key) in the frontend. Row Level Security policies on Supabase handle access control.

 Run in Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

Build for Production

```bash
npm run build
npm run preview    # preview the production build locally
```
 Database Setup

Run the following in your Supabase SQL Editor in order:

Step 1 — Extensions**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Step 2 — Tables

Apply the full schema (citizens, verification_logs, audit_logs, admin_users) from the `supabase/schema.sql` file included in this repository.

Step 3 — Row Level Security

Apply the RLS policies from `supabase/rls.sql`. These ensure authenticated admin users can read and write all records, while citizens (via the mobile app) can only access their own data.

Step 4 — Demo Users

Create the three demo accounts via Supabase Dashboard → Authentication → Users, then insert their UUIDs into the `admin_users` table:

```sql
INSERT INTO public.admin_users (id, email, full_name, role)
VALUES
  ('admin-uuid-here',      'admin@zamid.gov.zm',     'Super Admin',      'admin'),
  ('registrar-uuid-here',  'registrar@zamid.gov.zm', 'Chanda Registrar', 'registrar'),
  ('verifier-uuid-here',   'verifier@zamid.gov.zm',  'Mutinta Verifier', 'verifier');
```

---

## Role Permissions

| Feature | Admin | Registrar | Verifier |
|---------|:-----:|:---------:|:--------:|
| View Dashboard | ✅ | ✅ | ✅ |
| View Citizens | ✅ | ✅ | ✅ |
| Register Citizens | ✅ | ✅ | ❌ |
| Activate / Suspend / Reject | ✅ | ❌ | ❌ |
| View Verification Logs | ✅ | ❌ | ✅ |
| View Audit Logs | ✅ | ❌ | ❌ |
| Export Audit Logs (CSV) | ✅ | ❌ | ❌ |
| Use Verify Tool | ✅ | ✅ | ✅ |
| Manage Admin Users | ✅ | ❌ | ❌ |
| Change Own Password | ✅ | ✅ | ✅ |

 Design System

The UI uses Zambia's national colors throughout:

| Token | Color | Usage |
|-------|-------|-------|
| Primary Green | `#006B3F` | Sidebar, buttons, active states |
| Primary Orange | `#EF7D00` | Accents, highlights |
| Background | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Content surfaces |
| Border | `#E2E8F0` | Dividers, input borders |
| Text Primary | `#0F172A` | Headings, body |
| Text Secondary | `#64748B` | Labels, captions |

Status badge colors:

| Status | Background | Text |
|--------|-----------|------|
| pending | `#FEF9C3` | `#A16207` |
| active | `#DCFCE7` | `#15803D` |
| suspended | `#FEE2E2` | `#DC2626` |
| rejected | `#FEE2E2` | `#B91C1C` |
| verified | `#DCFCE7` | `#15803D` |
| failed | `#FEE2E2` | `#DC2626` |
| tampered | `#FFEDD5` | `#C2410C` |

Font: Inter (loaded from Google Fonts)

Security

- All routes except `/login` require a valid Supabase session
- Role-based access is enforced both in the UI (hidden buttons) and at the Supabase RLS layer (hidden data)
- Supabase anon key is used — it cannot bypass Row Level Security
- Account lockout is handled by the backend API after 5 failed login attempts
- Destructive actions (suspend, reject) always require a confirmation dialog
- All status changes are written to `audit_logs` with actor identity and IP address
- QR payload signatures are verified using HMAC-SHA256 before any verification is logged as successful





