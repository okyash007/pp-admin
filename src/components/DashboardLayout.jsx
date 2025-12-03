import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { 
  LayoutDashboard, 
  CreditCard,
  LogOut, 
  Shield,
  MessageSquare,
  Bell,
  Menu,
  Users
} from 'lucide-react'

// Custom Sidebar Trigger with Hamburger Icon
function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 bg-gradient-to-br from-[#FEF18C] via-[#FEF18C] to-[#FEF18C]/90 border-[3px] border-black rounded-lg cursor-pointer flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:scale-105 transition-all duration-200 group relative overflow-hidden"
      aria-label="Toggle Sidebar"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
      <Menu 
        className="h-5 w-5 relative z-10 text-black group-hover:scale-110 transition-transform duration-300" 
        strokeWidth={3}
      />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    subtitle: 'View and manage creators'
  },
  // { 
  //   name: 'Creators', 
  //   href: '/dashboard', 
  //   icon: Users,
  //   subtitle: 'Manage all creators'
  // },
  { 
    name: 'Tickets', 
    href: '/dashboard/tickets', 
    icon: MessageSquare,
    subtitle: 'Support ticket management'
  },
  { 
    name: 'Notifications', 
    href: '/dashboard/notifications', 
    icon: Bell,
    subtitle: 'Send notifications to creators'
  },
]

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (href) => {
    navigate(href)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative bg-gradient-to-br from-[#FEF18C]/20 via-[#FEF18C]/10 to-[#828BF8]/15">
        <Sidebar className="bg-white border-r-[4px]! border-black shadow-2xl">
          <SidebarHeader className="h-34 px-5 py-10 bg-gradient-to-br from-[#828BF8] via-[#828BF8] to-[#5C66D4] border-b-[3px] border-black relative overflow-hidden flex items-center">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#FEF18C] rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FEF18C]/70 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="flex items-center relative z-10 w-full">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-white tracking-tight drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] leading-none uppercase">
                    POTATO<span className="text-[#FEF18C]">PAY.CO</span>
                  </span>
                </div>
                <span className="text-[11px] text-white/90 font-bold tracking-wide mt-1 uppercase leading-3.5">
                  ADMIN CONTROL CENTER
                </span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-2 space-y-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-3">
                  <p className="text-xs font-bold text-black/60 px-2">Navigate</p>
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex items-center gap-3 w-full px-4 py-2 transition-all duration-200 border-[2px] border-black ${
                            isActive
                              ? `bg-gradient-to-r from-[#828BF8] to-[#828BF8]/90 text-white shadow-[4px_3px_0px_0px_rgba(0,0,0,1)]`
                              : `bg-white text-slate-800 hover:bg-[#FEF18C] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                          }`}
                        >
                          <item.icon
                            className={`w-5 h-5 ${
                              isActive
                                ? "text-white"
                                : "text-[#828BF8] group-hover:text-black"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-black leading-tight ${
                                  isActive ? "text-white" : "text-black"
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-[#FEF18C] shadow-lg"></div>
                            </div>
                          )}
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-5 bg-gradient-to-br from-[#828BF8] via-[#5C66D4] to-[#828BF8]/90 border-t-[3px] border-black relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF18C] rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#5C66D4] rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-sm font-black text-black">
                  {user?.firstName?.[0] || user?.email?.[0] || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">
                  {user?.firstName || user?.email || 'Admin'}
                </p>
                <p className="text-[10px] font-bold text-[#FEF18C] truncate">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-10 w-10 bg-white hover:bg-[#FEF18C] border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 text-black" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-34 flex items-center justify-between gap-4 px-6 py-6 border-b-[3px] border-black sticky top-0 bg-white/60 z-20 backdrop-blur">
            <div className="flex items-center gap-4">
              <CustomSidebarTrigger />
              <div className="relative">
                <h1 className="text-2xl font-black text-black tracking-tight uppercase leading-none">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.name || "Dashboard"}
                </h1>
                <p className="text-[11px] font-bold text-black/60 mt-0.5">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.subtitle || "Admin control center"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-sm font-black text-black">
                  {user?.firstName?.[0] || user?.email?.[0] || 'A'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-black text-black">
                  {user?.firstName || user?.email || 'Admin'}
                </p>
                <p className="text-[10px] font-bold text-black/60">
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
