// app/(dashboard)/_components/sidebar.tsx
import { InstaSkulLogo } from '@/components/instaskul-logo'
import { SidebarRoutes } from './sidebar-routes'

export const Sidebar = () => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      {/* Logo at top of sidebar */}
      <div className="p-6 flex items-center justify-center border-b">
        <InstaSkulLogo size="md" showTagline={false} />
      </div>

      {/* Sidebar navigation */}
      <div className="flex flex-col w-full">
        <SidebarRoutes />
      </div>
    </div>
  )
}