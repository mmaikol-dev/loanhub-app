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
    Plus,
    Save,
    Loader2,
    User,
    DollarSign,
    Calendar,
    Download,
    Eye,
    PieChart,
    TrendingUp,
    Building,
    Clock,
    FileText,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle
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
    { title: 'Shares', href: '/shares' },
];

interface Member {
    id: number;
    name: string;
    id_number: string;
}

interface Meeting {
    id: number;
    meeting_date: string;
    venue: string;
}

interface ShareSummary {
    id: number;
    member_id: number;
    meeting_id?: number;
    amount: number;
    transaction_date: string;
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    member?: Member;
    meeting?: Meeting;
}

interface DrawerState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'show' | null;
    share: ShareSummary | null;
    isLoading: boolean;
}

interface FormData {
    member_id: number | '';
    meeting_id: number | '';
    amount: number | '';
    transaction_date: string;
    payment_method: string;
    reference_number: string;
    notes: string;
}

export default function Index() {
    const { props } = usePage();
    const { shares, members, meetings, filters } = props as unknown as {
        shares: ShareSummary[];
        members: Member[];
        meetings: Meeting[];
        filters: { search?: string };
    };

    const [searchValue, setSearchValue] = React.useState(filters?.search || '');
    const [deletingShare, setDeletingShare] = React.useState<ShareSummary | null>(null);
    const [activeFilter, setActiveFilter] = React.useState<'all' | 'recent' | 'high' | 'low'>('all');

    const [drawer, setDrawer] = React.useState<DrawerState>({
        isOpen: false,
        mode: null,
        share: null,
        isLoading: false,
    });

    const [formData, setFormData] = React.useState<FormData>({
        member_id: '',
        meeting_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        reference_number: '',
        notes: '',
    });

    const filteredShares = shares.filter(share => {
        if (!searchValue) return true;

        const searchLower = searchValue.toLowerCase();
        return (
            share.member?.name.toLowerCase().includes(searchLower) ||
            share.member?.id_number.toLowerCase().includes(searchLower) ||
            share.reference_number?.toLowerCase().includes(searchLower) ||
            share.id.toString().includes(searchValue)
        );
    }).filter(share => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'recent') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(share.transaction_date) >= oneWeekAgo;
        }
        if (activeFilter === 'high') return share.amount >= 1000;
        if (activeFilter === 'low') return share.amount < 1000;
        return true;
    });

    const statusCounts = React.useMemo(() => ({
        total: shares.length,
        recent: shares.filter(s => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(s.transaction_date) >= oneWeekAgo;
        }).length,
        highValue: shares.filter(s => s.amount >= 1000).length,
        lowValue: shares.filter(s => s.amount < 1000).length,
    }), [shares]);

    const totalStats = React.useMemo(() => ({
        totalAmount: shares.reduce((sum, s) => sum + s.amount, 0),
        averageAmount: shares.length > 0 ? shares.reduce((sum, s) => sum + s.amount, 0) / shares.length : 0,
        thisMonth: shares.filter(s => {
            const now = new Date();
            const shareDate = new Date(s.transaction_date);
            return shareDate.getMonth() === now.getMonth() &&
                shareDate.getFullYear() === now.getFullYear();
        }).reduce((sum, s) => sum + s.amount, 0),
        lastMonth: shares.filter(s => {
            const now = new Date();
            const shareDate = new Date(s.transaction_date);
            const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            return shareDate.getMonth() === lastMonth &&
                shareDate.getFullYear() === year;
        }).reduce((sum, s) => sum + s.amount, 0),
    }), [shares]);

    const handleDelete = () => {
        if (!deletingShare) return;
        router.delete(`/shares/${deletingShare.id}`, {
            onSuccess: () => setDeletingShare(null),
        });
    };

    const openDrawer = (mode: 'create' | 'edit' | 'show', share?: ShareSummary) => {
        if (share) {
            setDrawer({
                isOpen: true,
                mode,
                share,
                isLoading: false,
            });

            if (mode === 'edit' || mode === 'show') {
                setFormData({
                    member_id: share.member_id,
                    meeting_id: share.meeting_id || '',
                    amount: share.amount,
                    transaction_date: share.transaction_date,
                    payment_method: share.payment_method || '',
                    reference_number: share.reference_number || '',
                    notes: share.notes || '',
                });
            }
        } else {
            setDrawer({
                isOpen: true,
                mode: 'create',
                share: null,
                isLoading: false,
            });
            setFormData({
                member_id: '',
                meeting_id: '',
                amount: '',
                transaction_date: new Date().toISOString().split('T')[0],
                payment_method: '',
                reference_number: '',
                notes: '',
            });
        }
    };

    const closeDrawer = () => {
        setDrawer({
            isOpen: false,
            mode: null,
            share: null,
            isLoading: false,
        });
    };

    const handleSubmit = () => {
        setDrawer(prev => ({ ...prev, isLoading: true }));

        if (drawer.mode === 'create') {
            router.post('/shares', formData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        } else if (drawer.mode === 'edit' && drawer.share) {
            router.put(`/shares/${drawer.share.id}`, formData, {
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
        const headers = ['ID', 'Member', 'Amount', 'Transaction Date', 'Payment Method', 'Reference', 'Meeting', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...filteredShares.map(share => [
                share.id,
                `"${share.member?.name || 'N/A'}"`,
                share.amount,
                share.transaction_date,
                share.payment_method || 'N/A',
                share.reference_number || 'N/A',
                share.meeting ? `"${share.meeting.meeting_date} - ${share.meeting.venue}"` : 'N/A',
                `"${share.notes || 'N/A'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shares_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shares Management" />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <PieChart className="h-8 w-8" />
                                Shares Management
                            </h1>
                            <p className="text-muted-foreground">Manage and track all member share contributions</p>
                        </div>
                        <Button onClick={() => openDrawer('create')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Share
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.total}</div>
                            <p className="text-xs text-muted-foreground">Total share contributions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.totalAmount.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Combined share capital</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.thisMonth.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Shares collected this month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Share</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {Math.round(totalStats.averageAmount).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Average per contribution</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter Shares
                        </CardTitle>
                        <CardDescription>Find shares by member name, ID number, or reference</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search shares..."
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

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={activeFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('all')}
                                className="gap-2"
                            >
                                <PieChart className="h-3.5 w-3.5" />
                                All ({statusCounts.total})
                            </Button>
                            <Button
                                variant={activeFilter === 'recent' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('recent')}
                                className="gap-2"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Recent ({statusCounts.recent})
                            </Button>
                            <Button
                                variant={activeFilter === 'high' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('high')}
                                className="gap-2"
                            >
                                <DollarSign className="h-3.5 w-3.5" />
                                High Value ({statusCounts.highValue})
                            </Button>
                            <Button
                                variant={activeFilter === 'low' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter('low')}
                                className="gap-2"
                            >
                                <PieChart className="h-3.5 w-3.5" />
                                Low Value ({statusCounts.lowValue})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Shares Table */}
                {filteredShares.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No shares found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
                            <Button onClick={() => openDrawer('create')} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Record First Share
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
                                <div className="col-span-2 font-medium">Member</div>
                                <div className="col-span-2 font-medium">Amount</div>
                                <div className="col-span-2 font-medium">Date</div>
                                <div className="col-span-2 font-medium">Payment Method</div>
                                <div className="col-span-2 font-medium">Meeting</div>
                                <div className="col-span-2 font-medium text-right">Actions</div>
                            </div>
                            <div className="divide-y">
                                {filteredShares.map(share => (
                                    <div key={share.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                                        <div className="col-span-2">
                                            <div className="font-medium">{share.member?.name}</div>
                                            <div className="text-sm text-muted-foreground">{share.member?.id_number}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="font-semibold text-green-600">
                                                KES {share.amount.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(share.transaction_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant="outline" className="capitalize">
                                                {share.payment_method || 'Cash'}
                                            </Badge>
                                            {share.reference_number && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Ref: {share.reference_number}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            {share.meeting ? (
                                                <div>
                                                    <div className="text-sm">
                                                        {new Date(share.meeting.meeting_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {share.meeting.venue}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No meeting</span>
                                            )}
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDrawer('show', share)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDrawer('edit', share)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setDeletingShare(share)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Showing {filteredShares.length} of {shares.length} shares</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total in view:</p>
                                        <p className="text-xl font-bold text-green-600">
                                            KES {filteredShares.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingShare} onOpenChange={open => !open && setDeletingShare(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Share Contribution
                        </DialogTitle>
                        <DialogDescription>
                            This action will permanently delete the share contribution record.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingShare && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <PieChart className="h-10 w-10 text-red-600" />
                                <div>
                                    <p className="font-semibold">Share #{deletingShare.id}</p>
                                    <p className="text-sm text-muted-foreground">{deletingShare.member?.name}</p>
                                    <p className="text-sm font-medium">KES {deletingShare.amount.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Warning
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    This will affect the member's total shares and meeting totals if associated with a meeting.
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeletingShare(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Share
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Share Drawer for Create/Edit/Show */}
            <Drawer open={drawer.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <DrawerContent className="max-w-2xl mx-auto">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            {drawer.mode === 'create' && <Plus className="h-5 w-5" />}
                            {drawer.mode === 'edit' && <Edit className="h-5 w-5" />}
                            {drawer.mode === 'show' && <Eye className="h-5 w-5" />}
                            {drawer.mode === 'create' && 'Record New Share'}
                            {drawer.mode === 'edit' && `Edit Share #${drawer.share?.id}`}
                            {drawer.mode === 'show' && `Share Details #${drawer.share?.id}`}
                        </DrawerTitle>
                        <DrawerDescription>
                            {drawer.mode === 'create' && 'Record a new share contribution'}
                            {drawer.mode === 'edit' && 'Update share contribution information'}
                            {drawer.mode === 'show' && 'View share contribution details'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Share Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Share Contribution Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Member Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="member_id">Member *</Label>
                                        <select
                                            id="member_id"
                                            name="member_id"
                                            value={formData.member_id}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Member</option>
                                            {members?.map(member => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name} - {member.id_number}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Meeting Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="meeting_id">Meeting</Label>
                                        <select
                                            id="meeting_id"
                                            name="meeting_id"
                                            value={formData.meeting_id}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Meeting</option>
                                            {meetings?.map(meeting => (
                                                <option key={meeting.id} value={meeting.id}>
                                                    {new Date(meeting.meeting_date).toLocaleDateString()} - {meeting.venue}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Amount */}
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (KES) *</Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* Transaction Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="transaction_date">Transaction Date *</Label>
                                        <Input
                                            id="transaction_date"
                                            name="transaction_date"
                                            type="date"
                                            value={formData.transaction_date}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <select
                                            id="payment_method"
                                            name="payment_method"
                                            value={formData.payment_method}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="cash">Cash</option>
                                            <option value="mpesa">M-Pesa</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="check">Check</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Reference Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">Reference Number</Label>
                                        <Input
                                            id="reference_number"
                                            name="reference_number"
                                            value={formData.reference_number}
                                            onChange={handleInputChange}
                                            placeholder="Transaction reference"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Additional notes..."
                                            disabled={drawer.mode === 'show'}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Show Mode - Display Share Summary */}
                                {drawer.mode === 'show' && drawer.share && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Member's Total Shares
                                            </h3>
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-blue-600">
                                                        KES {drawer.share.amount.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">This Contribution</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Show Mode - Additional Actions */}
                        {drawer.mode === 'show' && drawer.share && (
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
                                            onClick={() => router.get(`/shares/${drawer.share?.id}`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => router.get(`/members/${drawer.share?.member_id}`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <User className="h-4 w-4" />
                                            View Member
                                        </Button>
                                        <Button
                                            onClick={() => openDrawer('edit', drawer.share)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Share
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
                                    disabled={drawer.isLoading || !formData.member_id || !formData.amount || !formData.transaction_date}
                                    className="gap-2"
                                >
                                    {drawer.isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {drawer.mode === 'create' ? 'Recording...' : 'Updating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {drawer.mode === 'create' ? 'Record Share' : 'Update Share'}
                                        </>
                                    )}
                                </Button>
                            )}

                            {drawer.mode === 'show' && (
                                <Button
                                    onClick={() => openDrawer('edit', drawer.share)}
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Share
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </AppLayout>
    );
}