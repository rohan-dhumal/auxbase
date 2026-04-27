import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { label: 'Settings', href: '/settings', icon: Settings },
]

const AppLayout = () => {
    const { theme, toggleTheme } = useThemeStore();
    const { user, clearAuth } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch {
        }
        clearAuth()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const initials = user?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    const filteredNav = navItems.filter((item) => {
        if (!item.roles) return true
        return item.roles.includes(user?.role || '')
    })

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r flex flex-col">
                {/* Logo */}
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold tracking-tight">Auxbase</span>
                    </div>
                </div>

                <Separator />

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {filteredNav.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <Separator />

                {/* User */}
                <div className="p-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout