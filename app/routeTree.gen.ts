// This file is manually configured for TanStack Router
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import RootLayout from './routes/__root'
import Index from './routes/index'
import Dashboard from './routes/dashboard'
import { SiteVisits } from './routes/SiteVisits'
import { SiteReport } from './routes/SiteReport'
import { Clients } from './routes/Clients'
import { Projects } from './routes/Projects'
import { Materials } from './routes/Materials'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
})

const siteVisitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/site-visits',
  component: SiteVisits,
})

const siteReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/site-report',
  component: SiteReport,
})

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: Clients,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: Projects,
})

const materialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/materials',
  component: Materials,
})

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, siteVisitsRoute, siteReportRoute, clientsRoute, projectsRoute, materialsRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
