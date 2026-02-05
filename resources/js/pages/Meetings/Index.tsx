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
    Calendar,
    Clock,
    Building,
    Users,
    FileSpreadsheet,
    PieChart,
    Wallet,
    CreditCard,
    Receipt,
    CheckCircle,
    XCircle,
    Plus,
    Save,
    Loader2,
    Download,
    Eye,
    AlertCircle,
    X,
    Check,
    Printer
} from 'lucide-react';
import * as React from 'react';

// Fallback drawer components
const FallbackDrawer = ({ children, open, onOpenChange, ...props }: any) => (
    open ? (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onOpenChange(false);
            }}
            {...props}
        >
            <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl max-h-[90vh] overflow-hidden">
                {children}
            </div>
        </div>
    ) : null
);

const FallbackDrawerContent = ({ children, className, ...props }: any) => (
    <div className={`flex flex-col h-full ${className}`} {...props}>{children}</div>
);

const FallbackDrawerHeader = ({ children, className, ...props }: any) => (
    <div className={`p-6 pb-4 ${className}`} {...props}>{children}</div>
);

const FallbackDrawerTitle = ({ children, className, ...props }: any) => (
    <h2 className={`text-xl font-semibold ${className}`} {...props}>{children}</h2>
);

const FallbackDrawerDescription = ({ children, className, ...props }: any) => (
    <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>{children}</p>
);

const FallbackDrawerFooter = ({ children, className, ...props }: any) => (
    <div className={`p-6 pt-4 border-t ${className}`} {...props}>{children}</div>
);

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

interface Member {
    id: number;
    name: string;
}

interface Share {
    id: number;
    member_id: number;
    amount: number;
    cumulative_amount: number;
}

interface Welfare {
    id: number;
    member_id: number;
    amount: number;
    cumulative_amount: number;
    type: 'contribution' | 'fine';
}

interface Loan {
    id: number;
    member_id: number;
    loan_amount: number;
    interest_amount: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
}

interface CollectionData {
    member: Member;
    welfare: number;
    share: number;
    loan_paid: number;
    loan_taken: number;
    interest: number;
    rolled_over: number;
    fines: number;
    cumulative_shares: number;
    new_loan: number;
}

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

interface CollectionSheetState {
    isOpen: boolean;
    meetingId: number | null;
    data: CollectionData[];
    isLoading: boolean;
    meeting: MeetingSummary | null;
}

// Helper function to safely format currency
const formatCurrency = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper function to safely format numbers
const formatNumber = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return value.toString();
};

export default function Index() {
    const { props } = usePage();
    const { meetings = [], filters = {} } = props as unknown as {
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

    const [collectionSheet, setCollectionSheet] = React.useState<CollectionSheetState>({
        isOpen: false,
        meetingId: null,
        data: [],
        isLoading: false,
        meeting: null,
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

    const filteredMeetings = React.useMemo(() => {
        return meetings.filter(meeting => {
            if (activeTab !== 'all' && meeting.status !== activeTab) return false;

            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();
            return (
                (meeting.venue || '').toLowerCase().includes(searchLower) ||
                (meeting.agenda || '').toLowerCase().includes(searchLower) ||
                meeting.meeting_date.includes(searchValue)
            );
        });
    }, [meetings, activeTab, searchValue]);

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
        totalShares: meetings.reduce((sum, m) => sum + (Number(m.total_shares_collected) || 0), 0),
        totalWelfare: meetings.reduce((sum, m) => sum + (Number(m.total_welfare_collected) || 0), 0),
        totalLoans: meetings.reduce((sum, m) => sum + (Number(m.total_loans_issued) || 0), 0),
        totalFines: meetings.reduce((sum, m) => sum + (Number(m.total_fines) || 0), 0),
        totalCash: meetings.reduce((sum, m) => sum + (Number(m.total_cash) || 0), 0),
        totalTransactions: meetings.reduce((sum, m) =>
            sum + (Number(m.shares_count) || 0) + (Number(m.loans_count) || 0) + (Number(m.welfare_count) || 0), 0
        ),
    }), [meetings]);

    const formatTime = (time?: string) => {
        if (!time) return 'N/A';
        try {
            return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return time;
        }
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
                    meeting_date: meeting.meeting_date || '',
                    venue: meeting.venue || '',
                    start_time: meeting.start_time || '',
                    end_time: meeting.end_time || '',
                    bank_balance: meeting.bank_balance || '',
                    cash_in_hand: meeting.cash_in_hand || '',
                    members_present: meeting.members_present || '',
                    agenda: meeting.agenda || '',
                    minutes: meeting.minutes || '',
                    status: meeting.status || 'scheduled',
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

        // Convert empty strings to null for numeric fields
        const submitData = {
            ...formData,
            bank_balance: formData.bank_balance === '' ? null : formData.bank_balance,
            cash_in_hand: formData.cash_in_hand === '' ? null : formData.cash_in_hand,
            members_present: formData.members_present === '' ? null : formData.members_present,
        };

        if (drawer.mode === 'create') {
            router.post('/meetings', submitData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        } else if (drawer.mode === 'edit' && drawer.meeting) {
            router.put(`/meetings/${drawer.meeting.id}`, submitData, {
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

    const openCollectionSheet = async (meeting: MeetingSummary) => {
        setCollectionSheet({
            isOpen: true,
            meetingId: meeting.id,
            data: [],
            isLoading: true,
            meeting,
        });

        try {
            // Fetch collection data via Inertia
            router.get(`/meetings/${meeting.id}/collectionsheet`, {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['collectionData'],
                onSuccess: (page: any) => {
                    setCollectionSheet(prev => ({
                        ...prev,
                        data: page.props.collectionData || [],
                        isLoading: false,
                    }));
                },
                onError: () => {
                    setCollectionSheet(prev => ({
                        ...prev,
                        isLoading: false,
                    }));
                }
            });
        } catch (error) {
            console.error('Error fetching collection data:', error);
            setCollectionSheet(prev => ({
                ...prev,
                isLoading: false,
            }));
        }
    };

    const closeCollectionSheet = () => {
        setCollectionSheet({
            isOpen: false,
            meetingId: null,
            data: [],
            isLoading: false,
            meeting: null,
        });
    };

    const printCollectionSheet = () => {
        window.print();
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Venue', 'Status', 'Shares Collected', 'Welfare', 'Loans Issued', 'Fines', 'Members Present', 'Total Cash'];
        const csvContent = [
            headers.join(','),
            ...filteredMeetings.map(meeting => [
                meeting.meeting_date,
                `"${meeting.venue || ''}"`,
                meeting.status,
                meeting.total_shares_collected || 0,
                meeting.total_welfare_collected || 0,
                meeting.total_loans_issued || 0,
                meeting.total_fines || 0,
                meeting.members_present || 0,
                meeting.total_cash || 0
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

    const exportCollectionToCSV = () => {
        if (!collectionSheet.data.length || !collectionSheet.meeting) return;

        const headers = ['No.', 'Name', 'Welfare', 'Share', 'Loan Paid', 'Loan Taken', 'Interest', 'Rolled Over', 'Fines', 'Cumulative Shares', 'New Loan'];
        const csvContent = [
            headers.join(','),
            ...collectionSheet.data.map((row, index) => [
                index + 1,
                `"${row.member.name}"`,
                row.welfare || 0,
                row.share || 0,
                row.loan_paid || 0,
                row.loan_taken || 0,
                row.interest || 0,
                row.rolled_over || 0,
                row.fines || 0,
                row.cumulative_shares || 0,
                row.new_loan || 0
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `collection_sheet_${collectionSheet.meeting.meeting_date}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Calculate totals for collection sheet
    const collectionTotals = React.useMemo(() => {
        if (!collectionSheet.data.length) return null;

        return {
            welfare: collectionSheet.data.reduce((sum, row) => sum + (row.welfare || 0), 0),
            share: collectionSheet.data.reduce((sum, row) => sum + (row.share || 0), 0),
            loanPaid: collectionSheet.data.reduce((sum, row) => sum + (row.loan_paid || 0), 0),
            loanTaken: collectionSheet.data.reduce((sum, row) => sum + (row.loan_taken || 0), 0),
            interest: collectionSheet.data.reduce((sum, row) => sum + (row.interest || 0), 0),
            rolledOver: collectionSheet.data.reduce((sum, row) => sum + (row.rolled_over || 0), 0),
            fines: collectionSheet.data.reduce((sum, row) => sum + (row.fines || 0), 0),
        };
    }, [collectionSheet.data]);

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
                            <div className="text-2xl font-bold">{formatNumber(statusCounts.total)}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    {formatNumber(statusCounts.scheduled)} Scheduled
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    {formatNumber(statusCounts.completed)} Done
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
                            <div className="text-2xl font-bold">KES {formatCurrency(totalStats.totalShares)}</div>
                            <p className="text-xs text-muted-foreground">Shares collected across all meetings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Welfare & Fines</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {formatCurrency(totalStats.totalWelfare + totalStats.totalFines)}</div>
                            <p className="text-xs text-muted-foreground">
                                Welfare: {formatCurrency(totalStats.totalWelfare)} | Fines: {formatCurrency(totalStats.totalFines)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {formatCurrency(totalStats.totalLoans)}</div>
                            <p className="text-xs text-muted-foreground">Loans disbursed in meetings</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter
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
                            <Button
                                onClick={exportToCSV}
                                variant="outline"
                                className="gap-2"
                                disabled={filteredMeetings.length === 0}
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'All', icon: Calendar, count: statusCounts.total },
                                { key: 'scheduled', label: 'Scheduled', icon: Calendar, count: statusCounts.scheduled },
                                { key: 'ongoing', label: 'Ongoing', icon: Clock, count: statusCounts.ongoing },
                                { key: 'completed', label: 'Completed', icon: CheckCircle, count: statusCounts.completed },
                                { key: 'cancelled', label: 'Cancelled', icon: XCircle, count: statusCounts.cancelled },
                            ].map(({ key, label, icon: Icon, count }) => (
                                <Button
                                    key={key}
                                    variant={activeTab === key ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab(key as any)}
                                    className="gap-2"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label} ({count})
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Meetings Grid */}
                {filteredMeetings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchValue ? 'Try adjusting your search filters' : 'Get started by scheduling your first meeting'}
                            </p>
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
                                                    {new Date(meeting.meeting_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{meeting.venue || 'No venue'}</span>
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
                                    {(meeting.start_time || meeting.end_time) && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>Time:</span>
                                            </div>
                                            <span>
                                                {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Attendance */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>Attendance:</span>
                                        </div>
                                        <span>{formatNumber(meeting.members_present)} members</span>
                                    </div>

                                    <Separator />

                                    {/* Financial Summary */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <PieChart className="h-3.5 w-3.5" />
                                                Shares:
                                            </span>
                                            <span className="font-semibold">KES {formatCurrency(meeting.total_shares_collected)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Wallet className="h-3.5 w-3.5" />
                                                Welfare:
                                            </span>
                                            <span className="font-semibold">KES {formatCurrency(meeting.total_welfare_collected)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                Loans:
                                            </span>
                                            <span className="font-semibold">KES {formatCurrency(meeting.total_loans_issued)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Receipt className="h-3.5 w-3.5" />
                                                Total Cash:
                                            </span>
                                            <span className="font-semibold text-green-600">KES {formatCurrency(meeting.total_cash)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Transactions Count */}
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="p-2 bg-blue-50 rounded">
                                            <div className="font-semibold">{formatNumber(meeting.shares_count)}</div>
                                            <div className="text-xs text-muted-foreground">Shares</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded">
                                            <div className="font-semibold">{formatNumber(meeting.loans_count)}</div>
                                            <div className="text-xs text-muted-foreground">Loans</div>
                                        </div>
                                        <div className="p-2 bg-purple-50 rounded">
                                            <div className="font-semibold">{formatNumber(meeting.welfare_count)}</div>
                                            <div className="text-xs text-muted-foreground">Welfare</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => openDrawer('show', meeting)}
                                            className="gap-2"
                                            variant="outline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => openCollectionSheet(meeting)}
                                            className="gap-2"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Collection
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDrawer('edit', meeting)}
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setDeletingMeeting(meeting)}
                                            className="gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                {filteredMeetings.length > 0 && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <span>Showing {formatNumber(filteredMeetings.length)} of {formatNumber(meetings.length)} meetings</span>
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
                            This action will permanently delete the meeting and all associated transactions.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingMeeting && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <Calendar className="h-10 w-10 text-red-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">
                                        {new Date(deletingMeeting.meeting_date + 'T00:00:00').toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">{deletingMeeting.venue || 'No venue'}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    Warning
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    This meeting has {formatNumber(deletingMeeting.shares_count)} shares, {formatNumber(deletingMeeting.loans_count)} loans,
                                    and {formatNumber(deletingMeeting.welfare_count)} welfare records. All will be permanently deleted.
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

            {/* Meeting Drawer */}
            <Drawer open={drawer.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            {drawer.mode === 'create' && <><Plus className="h-5 w-5" />Schedule New Meeting</>}
                            {drawer.mode === 'edit' && <><Edit className="h-5 w-5" />Edit Meeting</>}
                            {drawer.mode === 'show' && <><Eye className="h-5 w-5" />Meeting Details</>}
                        </DrawerTitle>
                        <DrawerDescription>
                            {drawer.mode === 'create' && 'Schedule a new group meeting'}
                            {drawer.mode === 'edit' && 'Update meeting information'}
                            {drawer.mode === 'show' && 'View meeting details and transactions'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="space-y-2">
                                <Label htmlFor="bank_balance">Bank Balance (KES)</Label>
                                <Input
                                    id="bank_balance"
                                    name="bank_balance"
                                    type="number"
                                    step="0.01"
                                    value={formData.bank_balance}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    disabled={drawer.mode === 'show'}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cash_in_hand">Cash in Hand (KES)</Label>
                                <Input
                                    id="cash_in_hand"
                                    name="cash_in_hand"
                                    type="number"
                                    step="0.01"
                                    value={formData.cash_in_hand}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    disabled={drawer.mode === 'show'}
                                />
                            </div>

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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                />
                            </div>

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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                                />
                            </div>
                        </div>

                        {/* Show Mode - Display Meeting Summary */}
                        {drawer.mode === 'show' && drawer.meeting && (
                            <>
                                <Separator className="my-6" />
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Meeting Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <div className="text-lg font-bold text-blue-600">
                                                KES {formatCurrency(drawer.meeting.total_shares_collected)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Shares</p>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-lg font-bold text-green-600">
                                                KES {formatCurrency(drawer.meeting.total_welfare_collected)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Welfare</p>
                                        </div>
                                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                            <div className="text-lg font-bold text-yellow-600">
                                                KES {formatCurrency(drawer.meeting.total_loans_issued)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Loans</p>
                                        </div>
                                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                                            <div className="text-lg font-bold text-purple-600">
                                                KES {formatCurrency(drawer.meeting.total_cash)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Total Cash</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={closeDrawer}
                                disabled={drawer.isLoading}
                            >
                                {drawer.mode === 'show' ? 'Close' : 'Cancel'}
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
                                            {drawer.mode === 'create' ? 'Creating...' : 'Updating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {drawer.mode === 'create' ? 'Create Meeting' : 'Update Meeting'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Collection Sheet Full-Screen Drawer */}
            {collectionSheet.isOpen && (
                <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="border-b bg-white shadow-sm print:shadow-none">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={closeCollectionSheet}
                                    className="print:hidden"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FileSpreadsheet className="h-6 w-6" />
                                        Collection Sheet
                                    </h2>
                                    {collectionSheet.meeting && (
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(collectionSheet.meeting.meeting_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })} - {collectionSheet.meeting.venue || 'No venue'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 print:hidden">
                                <Button
                                    variant="outline"
                                    onClick={exportCollectionToCSV}
                                    className="gap-2"
                                    disabled={!collectionSheet.data.length}
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={printCollectionSheet}
                                    className="gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {collectionSheet.isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                            </div>
                        ) : collectionSheet.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No collection data available</h3>
                                <p className="text-muted-foreground">
                                    There are no transactions recorded for this meeting.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Meeting Header Info */}
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <h3 className="font-bold text-lg mb-2 uppercase">TELE WOMEN INVESTMENT GROUP</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="font-semibold">DATE:</span> {collectionSheet.meeting?.meeting_date}</div>
                                        <div><span className="font-semibold">VENUE:</span> {collectionSheet.meeting?.venue || 'N/A'}</div>
                                    </div>
                                </div>

                                {/* Collection Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">No.</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">NAME</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">WELFARE</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">SHARE</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">LOAN PAID</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">LOAN TAKEN</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">INTEREST</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">ROLLED OVER</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">FINES</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">CUMULATIVE SHARES</th>
                                                    <th className="border border-gray-300 px-2 py-2 text-center text-xs font-bold">NEW LOAN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {collectionSheet.data.map((row, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">{index + 1}</td>
                                                        <td className="border border-gray-300 px-3 py-1.5 text-sm font-medium">{row.member.name}</td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.welfare > 0 ? formatCurrency(row.welfare) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.share > 0 ? formatCurrency(row.share) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.loan_paid > 0 ? formatCurrency(row.loan_paid) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.loan_taken > 0 ? formatCurrency(row.loan_taken) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.interest > 0 ? formatCurrency(row.interest) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.rolled_over > 0 ? formatCurrency(row.rolled_over) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.fines > 0 ? formatCurrency(row.fines) : '—'}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm font-semibold">
                                                            {formatCurrency(row.cumulative_shares)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-sm">
                                                            {row.new_loan > 0 ? formatCurrency(row.new_loan) : '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Totals Row */}
                                                {collectionTotals && (
                                                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                                                        <td colSpan={2} className="border border-gray-300 px-3 py-2 text-sm">TOTALS</td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.welfare)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.share)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.loanPaid)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.loanTaken)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.interest)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.rolledOver)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm">
                                                            {formatCurrency(collectionTotals.fines)}
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-2 text-center text-sm" colSpan={2}></td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Summary Section */}
                                {collectionSheet.meeting && collectionTotals && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <div className="text-xs text-muted-foreground font-semibold mb-1">BANK</div>
                                            <div className="text-lg font-bold">
                                                {formatCurrency(collectionSheet.meeting.bank_balance)}
                                            </div>
                                        </div>
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <div className="text-xs text-muted-foreground font-semibold mb-1">CASH</div>
                                            <div className="text-lg font-bold">
                                                {formatCurrency(collectionSheet.meeting.cash_in_hand)}
                                            </div>
                                        </div>
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <div className="text-xs text-muted-foreground font-semibold mb-1">LOAN</div>
                                            <div className="text-lg font-bold">
                                                {formatCurrency(collectionTotals.loanTaken)}
                                            </div>
                                        </div>
                                        <div className="border rounded-lg p-3 bg-gray-50">
                                            <div className="text-xs text-muted-foreground font-semibold mb-1">TOTAL COLLECTED</div>
                                            <div className="text-lg font-bold text-green-600">
                                                {formatCurrency(
                                                    collectionTotals.welfare +
                                                    collectionTotals.share +
                                                    collectionTotals.loanPaid +
                                                    collectionTotals.fines
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}