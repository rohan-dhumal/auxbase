import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import UsersPage from '@/pages/UsersPage'
import SettingsPage from '@/pages/SettingsPage'

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                        <UsersPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
])

export default router