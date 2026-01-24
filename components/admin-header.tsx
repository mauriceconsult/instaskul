// components/admin-header.tsx
import { InstaSkulLogo } from '@/components/instaskul-logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LayoutDashboard, Ticket, Globe, ArrowLeft, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AdminHeader() {
  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* Logo + Admin label */}
        <div className="flex items-center gap-4">
          <InstaSkulLogo 
            size="sm" 
            showTagline={false}
            linkTo="/dashboard"
          />
          <div className="h-6 w-px bg-border hidden md:block" />
          <span className="text-sm font-semibold text-muted-foreground hidden md:block">
            Admin Panel
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </Button>
          </Link>
          
          <Link href="/admin/invitations">
            <Button variant="ghost" size="sm">
              <Ticket className="h-4 w-4 mr-2" />
              Invitations
            </Button>
          </Link>
          
          <Link href="/admin/markets">
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Markets
            </Button>
          </Link>

          <div className="h-6 w-px bg-border mx-2" />

          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Overview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/invitations" className="flex items-center">
                  <Ticket className="h-4 w-4 mr-2" />
                  Invitations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/markets" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Markets
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}