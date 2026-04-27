import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface User {
    id: string
    name: string
    email: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER'
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
}

interface UsersResponse {
    users: User[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    SUPER_ADMIN: 'default',
    ADMIN: 'secondary',
    VIEWER: 'outline',
}

const UsersPage = () => {
    const { user: currentUser } = useAuthStore()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState('')

    const { data, isLoading } = useQuery<UsersResponse>({
        queryKey: ['users', page, search],
        queryFn: async () => {
            const res = await api.get('/users', {
                params: { page, limit: 10, search: search || undefined },
            })
            return res.data
        },
    })

    const deactivateMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/users/${id}/deactivate`),
        onSuccess: () => {
            toast.success('User deactivated')
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to deactivate user')
        },
    })

    const activateMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/users/${id}/activate`),
        onSuccess: () => {
            toast.success('User activated')
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to activate user')
        },
    })

    const handleSearch = () => {
        setSearch(searchInput)
        setPage(1)
    }

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your workspace members
                </p>
            </div>

            {/* Search */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} variant="outline">
                    Search
                </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : data?.users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={roleBadgeVariant[user.role]}>
                                            {user.role.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}
                                        >
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {user.id !== currentUser?.id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {user.status === 'ACTIVE' ? (
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => deactivateMutation.mutate(user.id)}
                                                        >
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => activateMutation.mutate(user.id)}
                                                        >
                                                            Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {data.users.length} of {data.pagination.total} users
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === data.pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage