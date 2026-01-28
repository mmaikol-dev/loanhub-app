import { Head } from '@inertiajs/react';
import { Users, DollarSign, TrendingUp, Wallet, PiggyBank, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    totalMembers: number;
    totalShares: number;
    totalWelfare: number;
    totalLoansIssued: number;
    activeLoansBalance: number;
    totalLoanPayments: number;
    bankBalance: number;
    cashInHand: number;
    totalCash: number;
}

interface Loan {
    id: number;
    member_name: string;
    loan_amount: number;
    balance: number;
    status: string;
    loan_date: string;
    due_date: string;
}

interface Member {
    id: number;
    name: string;
    total_shares: number;
}

interface MonthlyShare {
    month: string;
    total: number;
}

interface LoanStatus {
    status: string;
    count: number;
}

interface Meeting {
    id: number;
    meeting_date: string;
    venue: string;
    status: string;
    total_shares_collected: number;
    total_welfare_collected: number;
    total_loans_issued: number;
}

interface DashboardProps {
    stats: Stats;
    recentLoans: Loan[];
    topMembersByShares: Member[];
    monthlyShares: MonthlyShare[];
    loanStatusDistribution: LoanStatus[];
    recentMeetings: Meeting[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
    }).format(amount);
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        active: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
        completed: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
        approved: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
};

export default function Dashboard({
    stats,
    recentLoans,
    topMembersByShares,
    monthlyShares,
    loanStatusDistribution,
    recentMeetings,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMembers}</div>
                            <p className="text-xs text-muted-foreground">Active members</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalShares)}</div>
                            <p className="text-xs text-muted-foreground">Accumulated shares</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.activeLoansBalance)}</div>
                            <p className="text-xs text-muted-foreground">Outstanding balance</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalCash)}</div>
                            <p className="text-xs text-muted-foreground">
                                Bank: {formatCurrency(stats.bankBalance)} | Cash: {formatCurrency(stats.cashInHand)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Welfare</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalWelfare)}</div>
                            <p className="text-xs text-muted-foreground">Member contributions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loans Issued</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalLoansIssued)}</div>
                            <p className="text-xs text-muted-foreground">Total disbursed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loan Payments</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalLoanPayments)}</div>
                            <p className="text-xs text-muted-foreground">Total collected</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Loans */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Loans</CardTitle>
                            <CardDescription>Latest loan applications and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentLoans.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No recent loans</p>
                                ) : (
                                    recentLoans.map((loan) => (
                                        <div key={loan.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{loan.member_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Issued: {new Date(loan.loan_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{formatCurrency(loan.loan_amount)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Balance: {formatCurrency(loan.balance)}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Members by Shares */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Top Contributors</CardTitle>
                            <CardDescription>Members with highest share contributions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topMembersByShares.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No data available</p>
                                ) : (
                                    topMembersByShares.map((member, index) => (
                                        <div key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                    {index + 1}
                                                </div>
                                                <p className="text-sm font-medium">{member.name}</p>
                                            </div>
                                            <p className="text-sm font-bold">{formatCurrency(member.total_shares)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Meetings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Meetings</CardTitle>
                            <CardDescription>Latest meeting summaries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentMeetings.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No recent meetings</p>
                                ) : (
                                    recentMeetings.map((meeting) => (
                                        <div key={meeting.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm font-medium">
                                                        {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{meeting.venue}</p>
                                                <div className="flex gap-2 text-xs">
                                                    <span>Shares: {formatCurrency(meeting.total_shares_collected)}</span>
                                                    <span>•</span>
                                                    <span>Loans: {formatCurrency(meeting.total_loans_issued)}</span>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loan Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Status Overview</CardTitle>
                            <CardDescription>Distribution of loans by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loanStatusDistribution.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No loan data</p>
                                ) : (
                                    loanStatusDistribution.map((item) => (
                                        <div key={item.status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{
                                                            width: `${(item.count /
                                                                    loanStatusDistribution.reduce((sum, i) => sum + i.count, 0)) *
                                                                100
                                                                }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{item.count}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Shares Trend */}
                {monthlyShares.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Share Contributions Trend</CardTitle>
                            <CardDescription>Monthly share collections over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-[200px] items-end justify-between gap-2">
                                {monthlyShares.map((item, index) => {
                                    const maxValue = Math.max(...monthlyShares.map((i) => i.total));
                                    const height = (item.total / maxValue) * 100;
                                    return (
                                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                            <div className="flex w-full flex-1 items-end justify-center">
                                                <div
                                                    className="w-full rounded-t-md bg-primary transition-all hover:opacity-80"
                                                    style={{ height: `${height}%` }}
                                                    title={formatCurrency(item.total)}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-medium">
                                                    {new Date(item.month + '-01').toLocaleDateString('en-US', {
                                                        month: 'short',
                                                    })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{formatCurrency(item.total)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}