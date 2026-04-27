import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import UsersPage from '@/pages/UsersPage'
import SettingsPage from '@/pages/SettingsPage'
import ErrorBoundary from '@/components/ErrorBoundary'

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
                element: (
                    <ErrorBoundary>
                        <DashboardPage />
                    </ErrorBoundary>
                ),
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                        <ErrorBoundary>
                            <UsersPage />
                        </ErrorBoundary>
                    </ProtectedRoute>
                ),
            },
            {
                path: 'settings',
                element: (
                    <ErrorBoundary>
                        <SettingsPage />
                    </ErrorBoundary>
                ),
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
])

export default router