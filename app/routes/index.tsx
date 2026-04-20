import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function Index() {
  const navigate = useNavigate({ from: '/' })

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold mb-4">ConstructFlow - TanStack Router Migration</h1>
      <p className="text-slate-600">Basic setup complete. All pages migrated to TanStack Router.</p>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <Button onClick={() => navigate({ to: '/dashboard' })}>
          Dashboard
        </Button>
        <Button onClick={() => navigate({ to: '/site-visits' })} variant="outline">
          Site Visits
        </Button>
        <Button onClick={() => navigate({ to: '/site-report' })} variant="outline">
          Site Report
        </Button>
        <Button onClick={() => navigate({ to: '/clients' })} variant="outline">
          Clients
        </Button>
        <Button onClick={() => navigate({ to: '/projects' })} variant="outline">
          Projects
        </Button>
        <Button onClick={() => navigate({ to: '/materials' })} variant="outline">
          Materials
        </Button>
      </div>
    </div>
  )
}
