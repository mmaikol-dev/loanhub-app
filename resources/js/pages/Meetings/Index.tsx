"use client";

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Edit,
    Trash2,
    Search,
    X,
    Calendar,
    Clock,
    Building,
    Users,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Download,
    Eye,
    Plus,
    Save,
    Loader2,
    FileSpreadsheet,
    PieChart,
    Wallet,
    CreditCard,
    Receipt
} from 'lucide-react';
import * as React from 'react';

// Fallback drawer components if imports fail
const FallbackDrawer = ({ children, open, onOpenChange, ...props }: any) => (
    open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" {...props}>
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                {children}
            </div>
        </div>
    ) : null
);

const FallbackDrawerContent = ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
);

const FallbackDrawerHeader = ({ children, className, ...props }: any) => (
    <div className={`mb-4 ${className}`} {...props}>{children}</div>
);

const FallbackDrawerTitle = ({ children, className, ...props }: any) => (
    <h2 className={`text-lg font-semibold ${className}`} {...props}>{children}</h2>
);

const FallbackDrawerDescription = ({ children, className, ...props }: any) => (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>{children}</p>
);

const FallbackDrawerFooter = ({ children, className, ...props }: any) => (
    <div className={`mt-6 flex justify-end gap-3 ${className}`} {...props}>{children}</div>
);

// Use fallback components
const Drawer = FallbackDrawer;
const DrawerContent = FallbackDrawerContent;
const DrawerHeader = FallbackDrawerHeader;
const DrawerTitle = FallbackDrawerTitle;
const DrawerDescription = FallbackDrawerDescription;
const DrawerFooter = FallbackDrawerFooter;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Meetings', href: '/meetings' },
];

interface MeetingSummary {
    id: number;
    meeting_date: string;
    venue: string;
    start_time?: string;
    end_time?: string;
    total_shares_collected: number;
    total_welfare_collected: number;
    total_loan_paid: number;
    total_loans_issued: number;
    total_fines: number;
    bank_balance: number;
    cash_in_hand: number;
    members_present: number;
    agenda?: string;
    minutes?: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    shares_count: number;
    loans_count: number;
    welfare_count: number;
    total_cash: number;
}

interface DrawerState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'show' | null;
    meeting: MeetingSummary | null;
    isLoading: boolean;
}

interface FormData {
    meeting_date: string;
    venue: string;
    start_time: string;
    end_time: string;
    bank_balance: number | '';
    cash_in_hand: number | '';
    members_present: number | '';
    agenda: string;
    minutes: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export default function Index() {
    const { props } = usePage();
    const { meetings, filters } = props as unknown as {
        meetings: MeetingSummary[];
        filters: { search?: string; status?: string };
    };

    const [searchValue, setSearchValue] = React.useState(filters?.search || '');
    const [deletingMeeting, setDeletingMeeting] = React.useState<MeetingSummary | null>(null);
    const [activeTab, setActiveTab] = React.useState<'all' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'>('all');

    const [drawer, setDrawer] = React.useState<DrawerState>({
        isOpen: false,
        mode: null,
        meeting: null,
        isLoading: false,
    });

    const [formData, setFormData] = React.useState<FormData>({
        meeting_date: new Date().toISOString().split('T')[0],
        venue: '',
        start_time: '',
        end_time: '',
        bank_balance: '',
        cash_in_hand: '',
        members_present: '',
        agenda: '',
        minutes: '',
        status: 'scheduled',
    });

    const filteredMeetings = meetings.filter(meeting => {
        if (activeTab !== 'all' && meeting.status !== activeTab) return false;

        if (!searchValue) return true;

        const searchLower = searchValue.toLowerCase();
        return (
            meeting.venue.toLowerCase().includes(searchLower) ||
            meeting.agenda?.toLowerCase().includes(searchLower) ||
            meeting.meeting_date.includes(searchValue)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ongoing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled': return <Calendar className="h-4 w-4" />;
            case 'ongoing': return <Clock className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const statusCounts = React.useMemo(() => ({
        scheduled: meetings.filter(m => m.status === 'scheduled').length,
        ongoing: meetings.filter(m => m.status === 'ongoing').length,
        completed: meetings.filter(m => m.status === 'completed').length,
        cancelled: meetings.filter(m => m.status === 'cancelled').length,
        total: meetings.length,
    }), [meetings]);

    const totalStats = React.useMemo(() => ({
        totalShares: meetings.reduce((sum, m) => sum + m.total_shares_collected, 0),
        totalWelfare: meetings.reduce((sum, m) => sum + m.total_welfare_collected, 0),
        totalLoans: meetings.reduce((sum, m) => sum + m.total_loans_issued, 0),
        totalFines: meetings.reduce((sum, m) => sum + m.total_fines, 0),
        totalCash: meetings.reduce((sum, m) => sum + m.total_cash, 0),
        totalTransactions: meetings.reduce((sum, m) => sum + m.shares_count + m.loans_count + m.welfare_count, 0),
    }), [meetings]);

    const formatTime = (time?: string) => {
        if (!time) return 'N/A';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleDelete = () => {
        if (!deletingMeeting) return;
        router.delete(`/meetings/${deletingMeeting.id}`, {
            onSuccess: () => setDeletingMeeting(null),
        });
    };

    const openDrawer = (mode: 'create' | 'edit' | 'show', meeting?: MeetingSummary) => {
        if (meeting) {
            setDrawer({
                isOpen: true,
                mode,
                meeting,
                isLoading: false,
            });

            if (mode === 'edit' || mode === 'show') {
                setFormData({
                    meeting_date: meeting.meeting_date,
                    venue: meeting.venue,
                    start_time: meeting.start_time || '',
                    end_time: meeting.end_time || '',
                    bank_balance: meeting.bank_balance,
                    cash_in_hand: meeting.cash_in_hand,
                    members_present: meeting.members_present,
                    agenda: meeting.agenda || '',
                    minutes: meeting.minutes || '',
                    status: meeting.status,
                });
            }
        } else {
            setDrawer({
                isOpen: true,
                mode: 'create',
                meeting: null,
                isLoading: false,
            });
            setFormData({
                meeting_date: new Date().toISOString().split('T')[0],
                venue: '',
                start_time: '',
                end_time: '',
                bank_balance: '',
                cash_in_hand: '',
                members_present: '',
                agenda: '',
                minutes: '',
                status: 'scheduled',
            });
        }
    };

    const closeDrawer = () => {
        setDrawer({
            isOpen: false,
            mode: null,
            meeting: null,
            isLoading: false,
        });
    };

    const handleSubmit = () => {
        setDrawer(prev => ({ ...prev, isLoading: true }));

        if (drawer.mode === 'create') {
            router.post('/meetings', formData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        } else if (drawer.mode === 'edit' && drawer.meeting) {
            router.put(`/meetings/${drawer.meeting.id}`, formData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : parseFloat(value),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Venue', 'Status', 'Shares Collected', 'Welfare', 'Loans Issued', 'Fines', 'Members Present', 'Total Cash'];
        const csvContent = [
            headers.join(','),
            ...filteredMeetings.map(meeting => [
                meeting.meeting_date,
                `"${meeting.venue}"`,
                meeting.status,
                meeting.total_shares_collected,
                meeting.total_welfare_collected,
                meeting.total_loans_issued,
                meeting.total_fines,
                meeting.members_present,
                meeting.total_cash
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meetings_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meetings Management" />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Calendar className="h-8 w-8" />
                                Meetings Management
                            </h1>
                            <p className="text-muted-foreground">Manage and track all group meetings and transactions</p>
                        </div>
                        <Button onClick={() => openDrawer('create')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Meeting
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.total}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    Scheduled: {statusCounts.scheduled}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Completed: {statusCounts.completed}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.totalShares.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Shares collected across all meetings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Welfare & Fines</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {(totalStats.totalWelfare + totalStats.totalFines).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Welfare: KES {totalStats.totalWelfare.toLocaleString()} |
                                Fines: KES {totalStats.totalFines.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Loans Issued</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.totalLoans.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Loans disbursed in meetings</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter Meetings
                        </CardTitle>
                        <CardDescription>Find meetings by venue, agenda, or date</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search meetings..."
                                    value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={exportToCSV}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={activeTab === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('all')}
                                className="gap-2"
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                All ({statusCounts.total})
                            </Button>
                            <Button
                                variant={activeTab === 'scheduled' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('scheduled')}
                                className="gap-2"
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Scheduled ({statusCounts.scheduled})
                            </Button>
                            <Button
                                variant={activeTab === 'ongoing' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('ongoing')}
                                className="gap-2"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Ongoing ({statusCounts.ongoing})
                            </Button>
                            <Button
                                variant={activeTab === 'completed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('completed')}
                                className="gap-2"
                            >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Completed ({statusCounts.completed})
                            </Button>
                            <Button
                                variant={activeTab === 'cancelled' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('cancelled')}
                                className="gap-2"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancelled ({statusCounts.cancelled})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Meetings Grid */}
                {filteredMeetings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
                            <Button onClick={() => openDrawer('create')} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Schedule New Meeting
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredMeetings.map(meeting => (
                            <Card key={meeting.id} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">
                                                    {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{meeting.venue}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className={`${getStatusColor(meeting.status)} border flex-shrink-0 gap-1`}>
                                            {getStatusIcon(meeting.status)}
                                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Time Info */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>Time:</span>
                                        </div>
                                        <span>
                                            {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                                        </span>
                                    </div>

                                    {/* Attendance */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>Attendance:</span>
                                        </div>
                                        <span>{meeting.members_present} members</span>
                                    </div>

                                    <Separator />

                                    {/* Financial Summary */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <PieChart className="h-3.5 w-3.5" />
                                                Shares:
                                            </span>
                                            <span className="font-semibold">KES {meeting.total_shares_collected.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Wallet className="h-3.5 w-3.5" />
                                                Welfare:
                                            </span>
                                            <span className="font-semibold">KES {meeting.total_welfare_collected.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                Loans:
                                            </span>
                                            <span className="font-semibold">KES {meeting.total_loans_issued.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Receipt className="h-3.5 w-3.5" />
                                                Total Cash:
                                            </span>
                                            <span className="font-semibold">KES {meeting.total_cash.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Transactions Count */}
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="p-2 bg-blue-50 rounded">
                                            <div className="font-semibold">{meeting.shares_count}</div>
                                            <div className="text-xs text-muted-foreground">Shares</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded">
                                            <div className="font-semibold">{meeting.loans_count}</div>
                                            <div className="text-xs text-muted-foreground">Loans</div>
                                        </div>
                                        <div className="p-2 bg-purple-50 rounded">
                                            <div className="font-semibold">{meeting.welfare_count}</div>
                                            <div className="text-xs text-muted-foreground">Welfare</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            onClick={() => openDrawer('show', meeting)}
                                            className="flex-1 gap-2"
                                            variant="outline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => router.get(`/meetings/${meeting.id}/collection-sheet`)}
                                            className="flex-1 gap-2"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Collection
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.get(`/meetings/${meeting.id}/summary`)}
                                        >
                                            <PieChart className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDrawer('edit', meeting)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeletingMeeting(meeting)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination or Count Display */}
                {filteredMeetings.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {filteredMeetings.length} of {meetings.length} meetings</span>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-3.5 w-3.5" />
                                Export All Data
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingMeeting} onOpenChange={open => !open && setDeletingMeeting(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Meeting
                        </DialogTitle>
                        <DialogDescription>
                            This action will permanently delete the meeting record.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingMeeting && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <Calendar className="h-10 w-10 text-red-600" />
                                <div>
                                    <p className="font-semibold">
                                        {new Date(deletingMeeting.meeting_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{deletingMeeting.venue}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Warning
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    This meeting has {deletingMeeting.shares_count} shares, {deletingMeeting.loans_count} loans,
                                    and {deletingMeeting.welfare_count} welfare records. Deleting will remove all associated transactions.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeletingMeeting(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Meeting
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Meeting Drawer for Create/Edit/Show */}
            <Drawer open={drawer.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <DrawerContent className="max-w-2xl mx-auto">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            {drawer.mode === 'create' && <Plus className="h-5 w-5" />}
                            {drawer.mode === 'edit' && <Edit className="h-5 w-5" />}
                            {drawer.mode === 'show' && <Eye className="h-5 w-5" />}
                            {drawer.mode === 'create' && 'Schedule New Meeting'}
                            {drawer.mode === 'edit' && `Edit Meeting - ${drawer.meeting?.venue}`}
                            {drawer.mode === 'show' && `Meeting Details - ${drawer.meeting?.venue}`}
                        </DrawerTitle>
                        <DrawerDescription>
                            {drawer.mode === 'create' && 'Schedule a new group meeting'}
                            {drawer.mode === 'edit' && 'Update meeting information'}
                            {drawer.mode === 'show' && 'View meeting details and transactions'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Meeting Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Meeting Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Meeting Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="meeting_date">Meeting Date *</Label>
                                        <Input
                                            id="meeting_date"
                                            name="meeting_date"
                                            type="date"
                                            value={formData.meeting_date}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* Venue */}
                                    <div className="space-y-2">
                                        <Label htmlFor="venue">Venue</Label>
                                        <Input
                                            id="venue"
                                            name="venue"
                                            value={formData.venue}
                                            onChange={handleInputChange}
                                            placeholder="Enter venue"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Start Time</Label>
                                        <Input
                                            id="start_time"
                                            name="start_time"
                                            type="time"
                                            value={formData.start_time}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">End Time</Label>
                                        <Input
                                            id="end_time"
                                            name="end_time"
                                            type="time"
                                            value={formData.end_time}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Bank Balance */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bank_balance">Bank Balance (KES)</Label>
                                        <Input
                                            id="bank_balance"
                                            name="bank_balance"
                                            type="number"
                                            value={formData.bank_balance}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Cash in Hand */}
                                    <div className="space-y-2">
                                        <Label htmlFor="cash_in_hand">Cash in Hand (KES)</Label>
                                        <Input
                                            id="cash_in_hand"
                                            name="cash_in_hand"
                                            type="number"
                                            value={formData.cash_in_hand}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Members Present */}
                                    <div className="space-y-2">
                                        <Label htmlFor="members_present">Members Present</Label>
                                        <Input
                                            id="members_present"
                                            name="members_present"
                                            type="number"
                                            value={formData.members_present}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    {/* Agenda */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="agenda">Agenda</Label>
                                        <textarea
                                            id="agenda"
                                            name="agenda"
                                            value={formData.agenda}
                                            onChange={handleInputChange}
                                            placeholder="Meeting agenda..."
                                            disabled={drawer.mode === 'show'}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Minutes */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="minutes">Minutes</Label>
                                        <textarea
                                            id="minutes"
                                            name="minutes"
                                            value={formData.minutes}
                                            onChange={handleInputChange}
                                            placeholder="Meeting minutes..."
                                            disabled={drawer.mode === 'show'}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Show Mode - Display Meeting Summary */}
                                {drawer.mode === 'show' && drawer.meeting && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <PieChart className="h-5 w-5" />
                                                Meeting Summary
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                    <div className="text-xl font-bold text-blue-600">
                                                        KES {drawer.meeting.total_shares_collected.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Shares</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <div className="text-xl font-bold text-green-600">
                                                        KES {drawer.meeting.total_welfare_collected.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Welfare</p>
                                                </div>
                                                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                    <div className="text-xl font-bold text-yellow-600">
                                                        KES {drawer.meeting.total_loans_issued.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Loans</p>
                                                </div>
                                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                    <div className="text-xl font-bold text-purple-600">
                                                        KES {drawer.meeting.total_cash.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Total Cash</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div className="p-2 bg-blue-50 rounded">
                                                    <div className="font-semibold">{drawer.meeting.shares_count}</div>
                                                    <div className="text-xs text-muted-foreground">Share Transactions</div>
                                                </div>
                                                <div className="p-2 bg-green-50 rounded">
                                                    <div className="font-semibold">{drawer.meeting.loans_count}</div>
                                                    <div className="text-xs text-muted-foreground">Loan Transactions</div>
                                                </div>
                                                <div className="p-2 bg-purple-50 rounded">
                                                    <div className="font-semibold">{drawer.meeting.welfare_count}</div>
                                                    <div className="text-xs text-muted-foreground">Welfare Transactions</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Show Mode - Additional Actions */}
                        {drawer.mode === 'show' && drawer.meeting && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button
                                            onClick={() => router.get(`/meetings/${drawer.meeting?.id}/collection-sheet`)}
                                            className="gap-2"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Collection Sheet
                                        </Button>
                                        <Button
                                            onClick={() => router.get(`/meetings/${drawer.meeting?.id}/summary`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <PieChart className="h-4 w-4" />
                                            Meeting Summary
                                        </Button>
                                        <Button
                                            onClick={() => openDrawer('edit', drawer.meeting)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Meeting
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <DrawerFooter className="border-t">
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={closeDrawer}
                                disabled={drawer.isLoading}
                            >
                                Cancel
                            </Button>

                            {drawer.mode !== 'show' && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={drawer.isLoading || !formData.meeting_date}
                                    className="gap-2"
                                >
                                    {drawer.isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {drawer.mode === 'create' ? 'Scheduling...' : 'Updating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {drawer.mode === 'create' ? 'Schedule Meeting' : 'Update Meeting'}
                                        </>
                                    )}
                                </Button>
                            )}

                            {drawer.mode === 'show' && (
                                <Button
                                    onClick={() => openDrawer('edit', drawer.meeting)}
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Meeting
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </AppLayout>
    );
}