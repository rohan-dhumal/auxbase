import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts'

interface KpiStats {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    newUsersThisMonth: number
}

interface ChartDataPoint {
    date: string
    count: number
}

const kpiCards = (stats: KpiStats) => [
    {
        label: 'Total Users',
        value: stats.totalUsers,
        icon: Users,
        description: 'All registered users',
    },
    {
        label: 'Active Users',
        value: stats.activeUsers,
        icon: UserCheck,
        description: 'Currently active accounts',
    },
    {
        label: 'Inactive Users',
        value: stats.inactiveUsers,
        icon: UserX,
        description: 'Deactivated accounts',
    },
    {
        label: 'New This Month',
        value: stats.newUsersThisMonth,
        icon: TrendingUp,
        description: 'Joined this month',
    },
]

const DashboardPage = () => {
    const { data: stats, isLoading: statsLoading } = useQuery<KpiStats>({
        queryKey: ['analytics', 'stats'],
        queryFn: async () => {
            const res = await api.get('/analytics/stats')
            return res.data
        },
    })

    const { data: growth, isLoading: growthLoading } = useQuery<ChartDataPoint[]>({
        queryKey: ['analytics', 'growth'],
        queryFn: async () => {
            const res = await api.get('/analytics/growth')
            return res.data
        },
    })

    const { data: activity, isLoading: activityLoading } = useQuery<ChartDataPoint[]>({
        queryKey: ['analytics', 'activity'],
        queryFn: async () => {
            const res = await api.get('/analytics/activity')
            return res.data
        },
    })

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Overview of your workspace
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))
                    : stats &&
                    kpiCards(stats).map((card) => (
                        <Card key={card.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.label}
                                </CardTitle>
                                <card.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">User Growth</CardTitle>
                        <p className="text-sm text-muted-foreground">New users over the last 30 days</p>
                    </CardHeader>
                    <CardContent>
                        {growthLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={growth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(val) => val.slice(5)}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11 }}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Activity by Day</CardTitle>
                        <p className="text-sm text-muted-foreground">Audit log entries over the last 7 days</p>
                    </CardHeader>
                    <CardContent>
                        {activityLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={activity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(val) => val.slice(5)}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11 }}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardPage