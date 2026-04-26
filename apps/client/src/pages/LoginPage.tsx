import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { loginSchema, type LoginInput } from '@auxbase/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

const LoginPage = () => {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>()

    const onSubmit = async (data: LoginInput) => {
        const result = loginSchema.safeParse(data)

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors
            if (fieldErrors.email) setError('email', { message: fieldErrors.email[0] })
            if (fieldErrors.password) setError('password', { message: fieldErrors.password[0] })
            return
        }

        try {
            const res = await api.post('/auth/login', result.data)
            setAuth(res.data.user, res.data.accessToken)
            toast.success('Welcome back!')
            navigate('/dashboard')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
            <div className="w-full max-w-md px-4">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-semibold tracking-tight">Auxbase</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>Sign in to your account to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default LoginPage