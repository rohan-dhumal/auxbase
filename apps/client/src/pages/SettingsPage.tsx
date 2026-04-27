import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface ProfileForm {
    name: string
}

interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const SettingsPage = () => {
    const { user, setAuth } = useAuthStore()
    const [passwordLoading, setPasswordLoading] = useState(false)

    const initials = user?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { isSubmitting: profileSubmitting },
    } = useForm<ProfileForm>({
        defaultValues: { name: user?.name || '' },
    })

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
    } = useForm<PasswordForm>()

    const onProfileSubmit = async (data: ProfileForm) => {
        if (!data.name.trim() || data.name.trim().length < 2) {
            toast.error('Name must be at least 2 characters')
            return
        }

        try {
            const res = await api.patch(`/users/${user?.id}`, { name: data.name })
            setAuth(res.data.user, useAuthStore.getState().accessToken!)
            toast.success('Profile updated successfully')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile')
        }
    }

    const onPasswordSubmit = async (data: PasswordForm) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (data.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setPasswordLoading(true)
        try {
            await api.patch(`/users/${user?.id}/password`, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            })
            toast.success('Password changed successfully')
            resetPassword()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your account settings
                </p>
            </div>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                                {user?.role.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                {...registerProfile('name')}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={user?.email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed
                            </p>
                        </div>
                        <Button type="submit" disabled={profileSubmitting}>
                            {profileSubmitting ? 'Saving...' : 'Save changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your account password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                placeholder="••••••••"
                                {...registerPassword('currentPassword', { required: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                {...registerPassword('newPassword', { required: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                {...registerPassword('confirmPassword', { required: true })}
                            />
                        </div>
                        <Button type="submit" disabled={passwordLoading}>
                            {passwordLoading ? 'Changing...' : 'Change password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" disabled>
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SettingsPage
