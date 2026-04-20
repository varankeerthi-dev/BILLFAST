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
    <aside className="w-56 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">ConstructFlow</h1>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    "leading-none",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="leading-none">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-2 border-t border-gray-200">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors leading-none"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span className="leading-none">Settings</span>
        </Link>
      </div>
    </aside>
  )
}
