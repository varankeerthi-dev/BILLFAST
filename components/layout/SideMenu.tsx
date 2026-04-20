import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Calendar,
  Settings 
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/projects', icon: FileText, label: 'Projects' },
  { path: '/materials', icon: Package, label: 'Materials' },
  { path: '/site-visits', icon: Calendar, label: 'Site Visits' },
  { path: '/site-reports', icon: FileText, label: 'Site Reports' },
]

export function SideMenu() {
  const location = useLocation()

  return (
    <aside style={{ width: '224px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', lineHeight: '1.25' }}>ConstructFlow</h1>
      </div>
      
      <nav style={{ flex: 1, padding: '8px' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#374151',
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div style={{ padding: '8px', borderTop: '1px solid #e5e7eb' }}>
        <Link
          to="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            color: '#374151',
          }}
        >
          <Settings style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  )
}
