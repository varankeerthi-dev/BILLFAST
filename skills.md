---
name: react-supabase-erp
description: >
  Best practices for building a React + Vite + Supabase ERP-style SaaS app
  covering inventory, project management, quotations, client management, site
  management, and daily updates. Use this skill whenever the user asks about
  Supabase queries, React performance, page lag on navigation, module switching,
  data fetching patterns, TanStack Query setup, Realtime subscriptions, RLS
  policies, route-level code splitting, skeleton loaders, mobile layout,
  responsive design, Capacitor app views, PDF export, typography, table font
  size, schema changes, new database fields, or any ERP module architecture in a
  Vite + React + Supabase stack. Trigger even if the user only mentions one
  module (e.g. "inventory query", "projects page is slow", "quotation line
  items", "add a new field", "export to PDF") — this skill covers the full
  stack pattern for all of them.
---

## Error
When a error is occured, update the skills that that error shouldnot be encountred again.

# React + Vite + Supabase ERP Skill

## Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Backend / DB | Supabase (Postgres + Auth + Realtime + Storage) |
| Data fetching | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| UI | **shadcn/ui + Tailwind CSS** |
| Charts | Recharts |
| PDF Export | **react-pdf (`@react-pdf/renderer`)** |
| Mobile | Capacitor (Android) |

---

## UI Rules (NON-NEGOTIABLE — apply to every component)

These rules apply to every page, component, and table generated for this project.
Do not deviate from them even if not explicitly mentioned in the prompt.

### Typography

```js
// tailwind.config.js — font setup
fontFamily: {
  sans: ['Inter', 'sans-serif'],       // body text, inputs, labels, table cells
  heading: ['Raleway', 'sans-serif'],  // all headings: h1–h4, page titles, card titles
}
```

Load both from Google Fonts in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Raleway:wght@600;700;800&display=swap" rel="stylesheet" />
```

Usage rules:
- **Headings / page titles / card titles** → `font-heading` (Raleway)
- **Body text, labels, inputs, table cells** → `font-sans` (Inter)
- **Table cell minimum font size** → `text-xs` (12px) — NEVER go below this in tables
- **Table header font size** → `text-xs font-semibold uppercase tracking-wide`

### shadcn/ui Component Usage

Always use shadcn components — never build raw HTML equivalents:

| Need | shadcn Component |
|---|---|
| Data table | `<Table>` + TanStack Table |
| Forms | `<Form>`, `<Input>`, `<Select>`, `<Textarea>` |
| Dialogs / modals | `<Dialog>` |
| Confirm / alerts | `<AlertDialog>` |
| Dropdown menus | `<DropdownMenu>` |
| Tabs | `<Tabs>` |
| Date picker | `<Popover>` + `<Calendar>` |
| Badges / status | `<Badge>` |
| Skeletons | `<Skeleton>` |
| Toasts | `sonner` (via shadcn) |
| Cards | `<Card>`, `<CardHeader>`, `<CardContent>` |


### Zod validation

- Use Zod validation whenever there are manual fields - let user decide the zod schema rules.
- Ask user if how they want to have the zod schema
- Every new modules introduce zod schema

### git commit
- Whenever theres is changes in code, before committing - always give a commit description for git desktop.

### Tailwind CSS Rules

- Use Tailwind utility classes only — no inline styles except for truly dynamic values
- Use `cn()` (from `lib/utils`) to merge conditional classes
- Color tokens: use shadcn CSS variables (`bg-background`, `text-foreground`, `border`, `muted`, `primary`, etc.)
- Never hardcode hex colors — use the design token system

---

## Mobile & Mobile App Layout (Auto-Optimise)

Every page and component MUST be responsive by default. There are two target viewports:

| View | Context | Key Differences |
|---|---|---|
| **Web / Desktop** | Browser, ≥ 1024px | Sidebar nav, dense tables, multi-column layouts |
| **Mobile Web** | Browser, < 768px | Bottom nav, stacked cards, collapsed tables |
| **Mobile App** | Capacitor / Android WebView | Bottom nav, safe area insets, touch targets ≥ 44px |

### Responsive Layout Pattern

```jsx
// PageWrapper — use this as the root wrapper on every page
<div className="min-h-screen bg-background">
  {/* Desktop sidebar — hidden on mobile */}
  <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r bg-card">
    <Sidebar />
  </aside>

  {/* Main content — offset on desktop, full width on mobile */}
  <main className="lg:pl-64 pb-20 lg:pb-0">
    <div className="p-4 md:p-6 lg:p-8">
      {children}
    </div>
  </main>

  {/* Mobile bottom nav — hidden on desktop */}
  <nav className="fixed bottom-0 inset-x-0 lg:hidden border-t bg-card safe-area-pb">
    <BottomNav />
  </nav>
</div>
```

### Mobile Bottom Nav

```jsx
// components/shared/BottomNav.jsx
import { Home, FolderOpen, Package, FileText, MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home',      icon: Home,            path: '/' },
  { label: 'Projects',  icon: FolderOpen,      path: '/projects' },
  { label: 'Inventory', icon: Package,         path: '/inventory' },
  { label: 'Quotes',    icon: FileText,        path: '/quotations' },
  { label: 'More',      icon: MoreHorizontal,  path: '/more' },
]

export function BottomNav() {
  return (
    <div className="flex items-center justify-around h-16 px-2">
      {tabs.map(tab => (
        <NavLink key={tab.path} to={tab.path}
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs font-sans transition-colors',
               isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')
          }>
          <tab.icon className="w-5 h-5" />
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
```

### Tables on Mobile — Card Stack Pattern

On mobile, data-dense tables collapse to card stacks. Always implement both:

```jsx
function ItemList({ items }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide font-sans">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide font-sans">SKU</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide font-sans">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="text-xs font-sans">{item.name}</TableCell>
                <TableCell className="text-xs font-sans text-muted-foreground">{item.sku}</TableCell>
                <TableCell className="text-xs font-sans">{item.qty_on_hand}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card stack */}
      <div className="md:hidden space-y-2">
        {items.map(item => (
          <Card key={item.id}>
            <CardContent className="p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium font-sans">{item.name}</p>
                <p className="text-xs text-muted-foreground font-sans">{item.sku}</p>
              </div>
              <Badge variant="outline" className="text-xs font-sans">{item.qty_on_hand}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
```

### Capacitor / Mobile App — Safe Area & Touch Targets

```css
/* index.css */
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pt { padding-top: env(safe-area-inset-top); }
```

Touch targets — all interactive elements must be ≥ 44px × 44px on mobile:
```jsx
<Button className="min-h-[44px] md:min-h-9">Save</Button>
<Input className="h-11 md:h-9" />
```

---

## PDF Export (react-pdf)

Use `@react-pdf/renderer` for all document exports (quotes, invoices, reports).
Never use `window.print()` or browser print CSS.

Install: `npm install @react-pdf/renderer`

### Quote PDF Template

```jsx
// components/pdf/QuotePDF.jsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
})

const s = StyleSheet.create({
  page:        { fontFamily: 'Inter', padding: 40, fontSize: 10, color: '#111827' },
  heading:     { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  label:       { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  value:       { fontSize: 10 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  table:       { marginTop: 16 },
  tableHead:   { flexDirection: 'row', backgroundColor: '#f9fafb', padding: '6 8',
                 fontSize: 8, fontWeight: 'bold', color: '#374151',
                 borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tableRow:    { flexDirection: 'row', padding: '5 8',
                 borderBottomWidth: 1, borderColor: '#f3f4f6' },
  col1: { flex: 3 }, col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1, textAlign: 'right' }, col4: { flex: 1, textAlign: 'right' },
  totalRow:    { flexDirection: 'row', justifyContent: 'flex-end',
                 marginTop: 16, gap: 32 },
})

export function QuotePDF({ quote }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.row}>
          <View>
            <Text style={s.heading}>Quotation</Text>
            <Text style={s.label}>Ref No: {quote.ref_no}</Text>
            <Text style={s.label}>Date: {new Date(quote.created_at).toLocaleDateString()}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>Status: {quote.status}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.label}>Bill To</Text>
            <Text style={s.value}>{quote.client.name}</Text>
            <Text style={s.label}>{quote.client.email}</Text>
            <Text style={s.label}>{quote.client.address}</Text>
          </View>
        </View>

        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={s.col1}>Item</Text>
            <Text style={s.col2}>Qty</Text>
            <Text style={s.col3}>Unit Price</Text>
            <Text style={s.col4}>Total</Text>
          </View>
          {quote.line_items.map(line => (
            <View key={line.id} style={s.tableRow}>
              <Text style={s.col1}>{line.item.name}</Text>
              <Text style={s.col2}>{line.qty}</Text>
              <Text style={s.col3}>{Number(line.unit_price).toFixed(2)}</Text>
              <Text style={s.col4}>{(line.qty * line.unit_price).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={s.totalRow}>
          <Text style={{ color: '#6b7280' }}>Grand Total</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>
            {Number(quote.total).toFixed(2)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

### Download Button

```jsx
import { PDFDownloadLink } from '@react-pdf/renderer'

<PDFDownloadLink
  document={<QuotePDF quote={quote} />}
  fileName={`quote-${quote.ref_no}.pdf`}
>
  {({ loading }) => (
    <Button variant="outline" disabled={loading} className="min-h-[44px] md:min-h-9">
      {loading ? 'Generating…' : 'Export PDF'}
    </Button>
  )}
</PDFDownloadLink>
```

---

## Schema Check Rule (MANDATORY)

**Every time a new field is introduced — in a query, form, mutation, or UI component — run this check before writing any frontend code.**

### Step 1 — Confirm the column exists

```sql
-- Run in Supabase SQL editor
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name   = '<table_name>'
order by ordinal_position;
```

### Step 2 — If missing, generate the migration

```sql
alter table <table_name>
  add column <column_name> <data_type> default <default_value>;

-- Examples
alter table items        add column reorder_level integer     default 0;
alter table quotes       add column notes         text        default '';
alter table daily_updates add column weather      varchar(50) default null;
```

### Step 3 — Re-check RLS

New columns on protected tables must still be covered by existing RLS policies.
If the column is sensitive, add an explicit policy:

```sql
-- Verify existing policy still applies
select * from pg_policies where tablename = '<table_name>';
```

### Step 4 — Regenerate TypeScript types

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
```

**Never use a new field in frontend code without first confirming it exists in the schema.**

---

## Performance: Page Lag on Module Switch

Fix in this order of priority:

### 1. Lazy-load every module route

```jsx
import { lazy, Suspense } from 'react'

const Inventory  = lazy(() => import('./pages/Inventory'))
const Projects   = lazy(() => import('./pages/Projects'))
const Quotations = lazy(() => import('./pages/Quotations'))
const Clients    = lazy(() => import('./pages/Clients'))
const Sites      = lazy(() => import('./pages/Sites'))
const DailyLog   = lazy(() => import('./pages/DailyLog'))

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/inventory"  element={<Inventory />} />
    <Route path="/projects"   element={<Projects />} />
    <Route path="/quotations" element={<Quotations />} />
    <Route path="/clients"    element={<Clients />} />
    <Route path="/sites"      element={<Sites />} />
    <Route path="/daily-log"  element={<DailyLog />} />
  </Routes>
</Suspense>
```

### 2. TanStack Query global staleTime

```js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // cached for 5 min — revisits feel instant
      gcTime:    1000 * 60 * 10,
      retry: 1,
    },
  },
})
```

### 3. Skeleton loaders

```jsx
if (isLoading) return <TableSkeleton rows={10} />
if (isError)   return <ErrorState message={error.message} />
```

---

## Query Patterns by Module

### Inventory

```js
useQuery({
  queryKey: ['inventory', { page, search, category }],
  queryFn: () =>
    supabase
      .from('items')
      .select('*, category(*)', { count: 'exact' })
      .ilike('name', `%${search}%`)
      .eq('category_id', category)
      .order('name')
      .range(page * 20, page * 20 + 19),
  staleTime: 1000 * 60 * 5,
})
```

### Project Management

```js
useQuery({
  queryKey: ['projects', status],
  queryFn: () =>
    supabase
      .from('projects')
      .select(`
        id, name, status, due_date,
        client:clients(id, name),
        tasks(id, title, status, due_date,
          assignee:profiles(id, full_name, avatar_url)
        )
      `)
      .eq('status', status)
      .order('due_date'),
})
```

### Quotations

```js
useQuery({
  queryKey: ['quotes', { status, clientId }],
  queryFn: () =>
    supabase
      .from('quotes')
      .select('id, ref_no, status, total, created_at, client:clients(id, name, email)')
      .eq('status', status)
      .order('created_at', { ascending: false }),
})

useQuery({
  queryKey: ['quote', quoteId],
  queryFn: () =>
    supabase
      .from('quotes')
      .select(`
        *,
        client:clients(name, email, address),
        line_items(id, qty, unit_price, discount,
          item:items(id, name, sku, unit)
        )
      `)
      .eq('id', quoteId)
      .single(),
})
```

### Client Management

```js
useQuery({
  queryKey: ['clients', search],
  queryFn: () =>
    supabase
      .from('clients')
      .select('*, projects(count), quotes(count)')
      .ilike('name', `%${search}%`)
      .order('name'),
})
```

### Site Management

```js
useQuery({
  queryKey: ['sites', projectId],
  queryFn: () =>
    supabase
      .from('sites')
      .select('*, project:projects(name), manager:profiles(full_name)')
      .eq('project_id', projectId),
})
```

### Daily Updates

```js
useQuery({
  queryKey: ['daily-updates', siteId],
  queryFn: () =>
    supabase
      .from('daily_updates')
      .select('*, author:profiles(full_name, avatar_url), site:sites(name)')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(50),
})

useEffect(() => {
  const channel = supabase
    .channel('daily-updates-live')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'daily_updates' },
      () => queryClient.invalidateQueries({ queryKey: ['daily-updates', siteId] })
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [siteId])
```

---

## Mutation Pattern (Optimistic Update)

```js
const mutation = useMutation({
  mutationFn: (item) =>
    supabase.from('items').update(item).eq('id', item.id),
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: ['inventory'] })
    const prev = queryClient.getQueryData(['inventory'])
    queryClient.setQueryData(['inventory'], (old) =>
      old?.map((i) => (i.id === newItem.id ? { ...i, ...newItem } : i))
    )
    return { prev }
  },
  onError: (_, __, ctx) => queryClient.setQueryData(['inventory'], ctx.prev),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
})
```

---

## Infinite Scroll

```js
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['items'],
  queryFn: ({ pageParam = 0 }) =>
    supabase.from('items').select('*').range(pageParam, pageParam + 19),
  getNextPageParam: (lastPage, allPages) =>
    lastPage.data?.length === 20 ? allPages.length * 20 : undefined,
})
```

---

## RLS Policy Pattern

```sql
create policy "org_isolation" on items
  for all using (org_id = auth.jwt() ->> 'org_id');
```

---

## Supabase Client (singleton)

```js
// lib/supabase.js — import this everywhere, never instantiate twice
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## File & Folder Structure

```
src/
├── lib/
│   └── supabase.js
├── hooks/
│   ├── useInventory.js
│   ├── useProjects.js
│   ├── useQuotations.js
│   └── ...
├── pages/
│   ├── Inventory/
│   ├── Projects/
│   ├── Quotations/
│   └── ...
├── components/
│   ├── ui/                # shadcn components
│   ├── pdf/               # QuotePDF, InvoicePDF, ReportPDF
│   └── shared/            # PageWrapper, BottomNav, TableSkeleton, ErrorState
├── types/
│   └── supabase.ts        # generated — do not edit manually
└── router.jsx             # lazy routes + Suspense
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| `useEffect` + raw supabase fetch | Use TanStack Query |
| No `staleTime` | Set globally in `QueryClient` |
| Eager import of all pages | `lazy()` per route |
| `supabase` created inside component | Singleton in `lib/supabase.js` |
| No skeleton on load | `<TableSkeleton />` while `isLoading` |
| Realtime without cleanup | Return `supabase.removeChannel(channel)` |
| **Table font below 12px** | Minimum `text-xs` (`font-sans`) in all table cells |
| **Wrong font on headings** | Always `font-heading` (Raleway) for h1–h4 |
| **Hardcoded hex colors** | Use shadcn CSS variables only |
| **`window.print()` for PDFs** | Use `@react-pdf/renderer` |
| **New field without schema check** | Run `information_schema.columns` check first |
| **No mobile layout** | Always include `BottomNav` + card stack for `md:hidden` |
| **Touch targets too small** | Minimum `min-h-[44px]` on all buttons/inputs on mobile |