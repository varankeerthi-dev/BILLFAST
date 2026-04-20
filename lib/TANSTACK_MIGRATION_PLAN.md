# TanStack Migration Plan
## ConstructFlow - Full Stack Framework Migration

**Target Scale:** 1000 concurrent users  
**Migration Duration:** 3-4 weeks  
**Current Stack:** Vite + React Router DOM + TanStack Query  
**Target Stack:** TanStack Start + TanStack Router + TanStack Query (SSR)

---

## Phase 1: Project Setup & Foundation (Week 1)

### Day 1-2: TanStack Start Project Initialization

**Tasks:**
1. Create new TanStack Start project
   ```bash
   npm create @tanstack/start@latest constructflow-tanstack
   ```
2. Install dependencies
   ```bash
   cd constructflow-tanstack
   npm install @tanstack/react-query @tanstack/react-router
   npm install @supabase/supabase-js zod react-hook-form
   npm install lucide-react sonner class-variance-authority clsx tailwind-merge
   ```
3. Configure Tailwind CSS
4. Set up TypeScript configuration
5. Copy UI components from `src/components/ui/` to new project
6. Copy lib utilities (`src/lib/utils.ts`, `src/lib/supabase.ts`)

**Deliverables:**
- New TanStack Start project structure
- All UI components migrated
- Supabase client configured

---

### Day 3-4: TanStack Router Configuration

**Tasks:**
1. Set up file-based routing structure
   ```
   app/
   ├── routes/
   │   ├── index.tsx          # Dashboard
   │   ├── site-visits.tsx    # SiteVisits page
   │   ├── site-report.tsx    # SiteReport page
   │   ├── clients.tsx        # Clients page
   │   ├── materials.tsx      # Materials page
   │   ├── invoices.tsx       # Invoices page
   │   ├── auth/
   │   │   ├── login.tsx
   │   │   ├── register.tsx
   │   │   └── forgot-password.tsx
   │   └── settings.tsx
   └── root.tsx              # Root layout
   ```

2. Create route configuration in `app/routes.tsx`
3. Set up route parameters and loaders
4. Configure error boundaries
5. Set up route guards for authentication

**Deliverables:**
- File-based routing structure
- Route configuration
- Authentication guards

---

### Day 5: TanStack Query SSR Configuration

**Tasks:**
1. Configure TanStack Query for SSR
   ```typescript
   // app/server-utils.ts
   import { createServerFn } from '@tanstack/start'
   import { dehydrate } from '@tanstack/react-query'
   
   export const createQueryFn = createServerFn('GET', async (url: string) => {
     // Server-side query implementation
   })
   ```

2. Set up query client for server
3. Configure hydration for client
4. Set up query cache for SSR
5. Configure staleTime and gcTime for scale

**Deliverables:**
- Server-side query functions
- Query client configuration
- Hydration setup

---

## Phase 2: Authentication Migration (Week 1, Day 6-7)

### Tasks:

1. **Server-side Authentication**
   ```typescript
   // app/routes/auth/login.tsx
   import { createServerFn } from '@tanstack/start'
   
   const loginFn = createServerFn('POST', async (data) => {
     const supabase = createClient()
     const { data, error } = await supabase.auth.signInWithPassword(data)
     return data
   })
   ```

2. **Update AuthContext for SSR**
   - Move auth logic to server functions
   - Use cookies for session management
   - Implement server-side session validation
   - Update context for hydration

3. **Protected Routes**
   - Implement route loaders for auth check
   - Redirect unauthenticated users
   - Handle session refresh on server

**Deliverables:**
- Server-side authentication
- Protected route loaders
- Cookie-based session management

---

## Phase 3: Core Pages Migration (Week 2)

### Day 8-9: Dashboard & Layout

**Tasks:**
1. Migrate `App.tsx` to `app/root.tsx`
   - Convert to server component
   - Set up layout structure
   - Implement navigation with TanStack Router

2. Migrate Dashboard (`app/routes/index.tsx`)
   ```typescript
   import { createFileRoute } from '@tanstack/react-router'
   
   export const Route = createFileRoute('/')({
     loader: async () => {
       const stats = await getDashboardStats()
       return stats
     },
     component: Dashboard
   })
   ```

3. Update navigation calls
   ```typescript
   // Old: navigate('/site-visits')
   // New: router.navigate({ to: '/site-visits' })
   ```

**Deliverables:**
- Root layout migrated
- Dashboard with server loader
- Navigation updated

---

### Day 10-12: SiteVisits Page

**Tasks:**
1. Create server loader for site visits
   ```typescript
   export const Route = createFileRoute('/site-visits')({
     loader: async () => {
       const [visits, projects, clients] = await Promise.all([
         getSiteVisits(),
         getProjects(),
         getClients()
       ])
       return { visits, projects, clients }
     },
     component: SiteVisits
   })
   ```

2. Implement streaming for large datasets
   ```typescript
   loader: async () => {
     const stream = new ReadableStream({
       async start(controller) {
         const visits = await getSiteVisits()
         for (const visit of visits) {
           controller.enqueue(visit)
         }
         controller.close()
       }
     })
     return stream
   }
   ```

3. Update mutations to server actions
   ```typescript
   const addVisitFn = createServerFn('POST', async (data) => {
     const supabase = createClient()
     const result = await supabase.from('site_visits').insert(data)
     return result
   })
   ```

4. Update all navigation calls in SiteVisits

**Deliverables:**
- SiteVisits with server loader
- Streaming for large lists
- Server actions for mutations

---

### Day 13-14: SiteReport Page

**Tasks:**
1. Create server loader for site reports
2. Implement form handling with server actions
3. Add streaming for report data
4. Update localStorage persistence for SSR compatibility
   - Use cookies for draft persistence
   - Or use TanStack Query with optimistic updates

5. Update all navigation calls

**Deliverables:**
- SiteReport with server loader
- Form handling with server actions
- SSR-compatible persistence

---

## Phase 4: Remaining Pages Migration (Week 3)

### Day 15-17: Clients, Materials, Invoices

**Tasks:**
1. Migrate Clients page
   - Server loader for clients list
   - Server actions for CRUD operations
   - Update navigation calls

2. Migrate Materials page
   - Server loader for materials
   - Implement search with server-side filtering
   - Server actions for materials management

3. Migrate Invoices page
   - Server loader for invoices
   - Streaming for invoice lists
   - Server actions for invoice operations

**Deliverables:**
- All pages migrated with server loaders
- Server actions for all mutations
- Navigation calls updated

---

### Day 18-19: Settings & Auth Pages

**Tasks:**
1. Migrate Settings page
2. Migrate Login, Register, Forgot Password
3. Update authentication flows
4. Test all auth scenarios

**Deliverables:**
- Settings page migrated
- Auth pages migrated
- Authentication flow tested

---

## Phase 5: Navigation & Components Update (Week 3, Day 20-21)

### Tasks:

1. **Global Navigation Update**
   ```typescript
   // Find and replace all instances:
   // navigate('/path') → router.navigate({ to: '/path' })
   // useParams() → Route.useParams()
   // useNavigate() → useRouter()
   ```

2. **Update Components**
   - Ensure no window/document access on server
   - Use `useEffect` for client-only code
   - Add `'use client'` directive where needed

3. **Fix Hydration Mismatches**
   - Check localStorage usage
   - Check date/time rendering
   - Ensure consistent server/client rendering

**Deliverables:**
- All navigation calls updated
- Components SSR-compatible
- No hydration errors

---

## Phase 6: Server Components & Optimization (Week 4)

### Day 22-23: Server Components

**Tasks:**
1. Identify heavy data components
   - Data tables
   - Charts
   - Large lists

2. Convert to server components
   ```typescript
   // app/routes/site-visits.tsx
   import { createServerFn } from '@tanstack/start'
   
   function SiteVisitsTable({ visits }: { visits: Visit[] }) {
     return (
       <table>
         {visits.map(visit => <VisitRow key={visit.id} visit={visit} />)}
       </table>
     )
   }
   ```

3. Implement streaming for server components
4. Reduce client bundle size

**Deliverables:**
- Server components for heavy data
- Reduced client bundle
- Streaming implementation

---

### Day 24-25: Performance Optimization

**Tasks:**
1. **Database Query Optimization**
   - Add indexes to frequently queried columns
   - Implement query batching
   - Use Supabase connection pooling

2. **Caching Strategy**
   ```typescript
   // Configure TanStack Query caching
   staleTime: 1 * 60 * 1000, // 1 minute
   gcTime: 5 * 60 * 1000,    // 5 minutes
   ```

3. **Implement Redis Caching** (optional for 1000 users)
   - Cache frequently accessed data
   - Cache query results
   - Implement cache invalidation

4. **Optimize Bundle Size**
   - Code splitting
   - Lazy loading routes
   - Tree shaking

**Deliverables:**
- Optimized database queries
- Caching strategy implemented
- Reduced bundle size

---

## Phase 7: Edge Deployment (Week 4, Day 26-27)

### Tasks:

1. **Configure for Edge Deployment**
   ```typescript
   // app/server.ts
   import { createStartHandler } from '@tanstack/start'
   
   export default createStartHandler({
     getRouter: () => router,
   })
   ```

2. **Deploy to Vercel/Cloudflare**
   - Configure environment variables
   - Set up edge functions
   - Configure CDN

3. **Test Edge Performance**
   - Measure latency from different regions
   - Test streaming performance
   - Verify SSR caching

**Deliverables:**
- Edge deployment configured
- Deployed to production
- Performance tested

---

## Phase 8: Testing & Load Testing (Week 4, Day 28-30)

### Tasks:

1. **Functional Testing**
   - Test all user flows
   - Test authentication
   - Test CRUD operations
   - Test navigation

2. **Load Testing**
   ```bash
   # Use k6 or similar tool
   k6 run --vus 1000 --duration 5m load-test.js
   ```

3. **Performance Testing**
   - Measure TTFB (Time to First Byte)
   - Measure LCP (Largest Contentful Paint)
   - Measure database query times
   - Test with 1000 concurrent users

4. **Bug Fixes & Optimization**
   - Fix any issues found
   - Optimize slow queries
   - Tune caching strategy

**Deliverables:**
- All tests passing
- Load tested with 1000 users
- Performance optimized

---

## Migration Checklist

### Pre-Migration
- [ ] Current codebase backed up
- [ ] Database backed up
- [ ] Environment variables documented
- [ ] Dependencies documented

### Phase 1: Foundation
- [ ] TanStack Start project created
- [ ] UI components migrated
- [ ] TanStack Router configured
- [ ] TanStack Query SSR configured
- [ ] Authentication migrated to server

### Phase 2: Core Pages
- [ ] Dashboard migrated
- [ ] SiteVisits migrated with loader
- [ ] SiteReport migrated with streaming
- [ ] Navigation calls updated

### Phase 3: Remaining Pages
- [ ] Clients page migrated
- [ ] Materials page migrated
- [ ] Invoices page migrated
- [ ] Settings page migrated
- [ ] Auth pages migrated

### Phase 4: Optimization
- [ ] Server components implemented
- [ ] Database queries optimized
- [ ] Caching strategy implemented
- [ ] Bundle size reduced

### Phase 5: Deployment
- [ ] Edge deployment configured
- [ ] Deployed to production
- [ ] Environment variables set
- [ ] CDN configured

### Phase 6: Testing
- [ ] Functional tests passing
- [ ] Load tested with 1000 users
- [ ] Performance benchmarks met
- [ ] All bugs fixed

---

## Key Changes Summary

### Navigation
```typescript
// Before (React Router DOM)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/site-visits')

// After (TanStack Router)
import { useRouter } from '@tanstack/react-router'
const router = useRouter()
router.navigate({ to: '/site-visits' })
```

### Route Parameters
```typescript
// Before
import { useParams } from 'react-router-dom'
const { id } = useParams()

// After
import { Route } from '@tanstack/react-router'
const { id } = Route.useParams()
```

### Data Fetching
```typescript
// Before (Client-side only)
const { data } = useQuery({
  queryKey: ['site-visits'],
  queryFn: async () => {
    const { data } = await supabase.from('site_visits').select()
    return data
  }
})

// After (Server-side with loader)
export const Route = createFileRoute('/site-visits')({
  loader: async () => {
    const supabase = createClient()
    const { data } = await supabase.from('site_visits').select()
    return data
  },
  component: SiteVisits
})
```

### Mutations
```typescript
// Before (Client-side)
const mutation = useMutation({
  mutationFn: async (data) => {
    return await supabase.from('site_visits').insert(data)
  }
})

// After (Server action)
const addVisitFn = createServerFn('POST', async (data) => {
  const supabase = createClient()
  const result = await supabase.from('site_visits').insert(data)
  return result
})
```

---

## Expected Performance Improvements

- **Initial Load Time:** 40-60% faster (SSR vs CSR)
- **Time to Interactive:** 50-70% faster
- **Database Load:** 60-80% reduction (server-side caching)
- **Bundle Size:** 30-50% reduction (server components)
- **Global Latency:** 50-200ms (edge deployment)
- **Concurrent Users:** Scalable to 1000+ users

---

## Risks & Mitigations

### Risk 1: Breaking Changes During Migration
**Mitigation:** Keep current codebase running, migrate incrementally, test each phase

### Risk 2: Authentication Issues
**Mitigation:** Test auth thoroughly, implement fallback to current system if needed

### Risk 3: Data Loss
**Mitigation:** Database backups, test with staging environment first

### Risk 4: Performance Regression
**Mitigation:** Benchmark before/after, load test at each phase

### Risk 5: Learning Curve
**Mitigation:** TanStack documentation is excellent, start with simple routes first

---

## Rollback Plan

If critical issues arise:
1. Keep current Vite app running on subdomain
2. Redirect users back to old app if needed
3. Fix issues in TanStack version
4. Gradually migrate users back

---

## Success Criteria

- [ ] All pages migrated and functional
- [ ] Authentication working correctly
- [ ] Load tested with 1000 concurrent users
- [ ] Initial load time < 2 seconds
- [ ] Database load reduced by 60%+
- [ ] No critical bugs in production
- [ ] Edge deployment working
- [ ] Team trained on new stack

---

## Next Steps

1. **Review this plan** with your team
2. **Set up staging environment** for testing
3. **Begin Phase 1** - Project Setup
4. **Daily standups** to track progress
5. **Weekly reviews** to adjust timeline if needed

---

**Estimated Completion:** 3-4 weeks  
**Team Required:** 1-2 developers  
**Risk Level:** Medium (with proper testing and rollback plan)
