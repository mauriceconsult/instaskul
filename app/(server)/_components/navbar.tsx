// app/(dashboard)/_components/navbar.tsx
import { InstaSkulLogo } from '@/components/instaskul-logo'
import { MobileSidebar } from './mobile-sidebar'
import NavbarRoutes from '@/components/navbar-routes'

export const Navbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      {/* Mobile sidebar + Logo for mobile */}
      <div className="flex items-center gap-4">
        <MobileSidebar />
        
        {/* Logo visible on mobile (when sidebar is hidden) */}
        <div className="md:hidden">
          <InstaSkulLogo size="sm" showTagline={false} />
        </div>
      </div>

      {/* Right side navbar routes/actions */}
      <NavbarRoutes />
    </div>
  )
}