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
    Wallet,
    TrendingUp,
    Building,
    Clock,
    FileText,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Heart,
    Scale,
    Gift
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
    { title: 'Welfare', href: '/welfare' },
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

interface WelfareSummary {
    id: number;
    member_id: number;
    meeting_id?: number;
    amount: number;
    cumulative_amount?: number;
    transaction_date: string;
    type: 'contribution' | 'benefit' | 'fine';
    description?: string;
    member?: Member;
    meeting?: Meeting;
}

interface DrawerState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'show' | null;
    welfare: WelfareSummary | null;
    isLoading: boolean;
}

interface FormData {
    member_id: number | '';
    meeting_id: number | '';
    amount: number | '';
    transaction_date: string;
    type: 'contribution' | 'benefit' | 'fine';
    description: string;
}

export default function Index() {
    const { props } = usePage();
    const { welfare, members, meetings, filters } = props as unknown as {
        welfare: WelfareSummary[];
        members: Member[];
        meetings: Meeting[];
        filters: { search?: string };
    };

    const [searchValue, setSearchValue] = React.useState(filters?.search || '');
    const [deletingWelfare, setDeletingWelfare] = React.useState<WelfareSummary | null>(null);
    const [activeTab, setActiveTab] = React.useState<'all' | 'contribution' | 'benefit' | 'fine'>('all');

    const [drawer, setDrawer] = React.useState<DrawerState>({
        isOpen: false,
        mode: null,
        welfare: null,
        isLoading: false,
    });

    const [formData, setFormData] = React.useState<FormData>({
        member_id: '',
        meeting_id: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'contribution',
        description: '',
    });

    const filteredWelfare = welfare.filter(item => {
        if (activeTab !== 'all' && item.type !== activeTab) return false;

        if (!searchValue) return true;

        const searchLower = searchValue.toLowerCase();
        return (
            item.member?.name.toLowerCase().includes(searchLower) ||
            item.member?.id_number.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.id.toString().includes(searchValue)
        );
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'contribution': return 'bg-green-100 text-green-800 border-green-200';
            case 'benefit': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'fine': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'contribution': return <Heart className="h-4 w-4" />;
            case 'benefit': return <Gift className="h-4 w-4" />;
            case 'fine': return <Scale className="h-4 w-4" />;
            default: return null;
        }
    };

    const getAmountDisplay = (item: WelfareSummary) => {
        const prefix = item.type === 'contribution' ? '+' : item.type === 'fine' ? '-' : '-';
        const color = item.type === 'contribution' ? 'text-green-600' : item.type === 'benefit' ? 'text-blue-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{prefix}KES {item.amount.toLocaleString()}</span>;
    };

    const statusCounts = React.useMemo(() => ({
        contributions: welfare.filter(w => w.type === 'contribution').length,
        benefits: welfare.filter(w => w.type === 'benefit').length,
        fines: welfare.filter(w => w.type === 'fine').length,
        total: welfare.length,
    }), [welfare]);

    const totalStats = React.useMemo(() => ({
        totalContributions: welfare.filter(w => w.type === 'contribution').reduce((sum, w) => sum + w.amount, 0),
        totalBenefits: welfare.filter(w => w.type === 'benefit').reduce((sum, w) => sum + w.amount, 0),
        totalFines: welfare.filter(w => w.type === 'fine').reduce((sum, w) => sum + w.amount, 0),
        netBalance: welfare.filter(w => w.type === 'contribution').reduce((sum, w) => sum + w.amount, 0) -
            welfare.filter(w => w.type === 'benefit').reduce((sum, w) => sum + w.amount, 0) -
            welfare.filter(w => w.type === 'fine').reduce((sum, w) => sum + w.amount, 0),
    }), [welfare]);

    const handleDelete = () => {
        if (!deletingWelfare) return;
        router.delete(`/welfare/${deletingWelfare.id}`, {
            onSuccess: () => setDeletingWelfare(null),
        });
    };

    const openDrawer = (mode: 'create' | 'edit' | 'show', welfareItem?: WelfareSummary) => {
        if (welfareItem) {
            setDrawer({
                isOpen: true,
                mode,
                welfare: welfareItem,
                isLoading: false,
            });

            if (mode === 'edit' || mode === 'show') {
                setFormData({
                    member_id: welfareItem.member_id,
                    meeting_id: welfareItem.meeting_id || '',
                    amount: welfareItem.amount,
                    transaction_date: welfareItem.transaction_date,
                    type: welfareItem.type,
                    description: welfareItem.description || '',
                });
            }
        } else {
            setDrawer({
                isOpen: true,
                mode: 'create',
                welfare: null,
                isLoading: false,
            });
            setFormData({
                member_id: '',
                meeting_id: '',
                amount: '',
                transaction_date: new Date().toISOString().split('T')[0],
                type: 'contribution',
                description: '',
            });
        }
    };

    const closeDrawer = () => {
        setDrawer({
            isOpen: false,
            mode: null,
            welfare: null,
            isLoading: false,
        });
    };

    const handleSubmit = () => {
        setDrawer(prev => ({ ...prev, isLoading: true }));

        if (drawer.mode === 'create') {
            router.post('/welfare', formData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        } else if (drawer.mode === 'edit' && drawer.welfare) {
            router.put(`/welfare/${drawer.welfare.id}`, formData, {
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
        const headers = ['ID', 'Member', 'Type', 'Amount', 'Cumulative', 'Transaction Date', 'Description', 'Meeting'];
        const csvContent = [
            headers.join(','),
            ...filteredWelfare.map(item => [
                item.id,
                `"${item.member?.name || 'N/A'}"`,
                item.type,
                item.type === 'contribution' ? item.amount : -item.amount,
                item.cumulative_amount || 0,
                item.transaction_date,
                `"${item.description || 'N/A'}"`,
                item.meeting ? `"${item.meeting.meeting_date} - ${item.meeting.venue}"` : 'N/A'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `welfare_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Welfare Fund Management" />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Wallet className="h-8 w-8" />
                                Welfare Fund Management
                            </h1>
                            <p className="text-muted-foreground">Manage contributions, benefits, and fines for member welfare</p>
                        </div>
                        <Button onClick={() => openDrawer('create')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Transaction
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${totalStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                KES {Math.abs(totalStats.netBalance).toLocaleString()} {totalStats.netBalance >= 0 ? '' : '-'}
                            </div>
                            <p className="text-xs text-muted-foreground">Net welfare fund balance</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                            <Heart className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">KES {totalStats.totalContributions.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Member contributions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
                            <Gift className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">KES {totalStats.totalBenefits.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Paid to members</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
                            <Scale className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">KES {totalStats.totalFines.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Collected fines</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter Welfare Transactions
                        </CardTitle>
                        <CardDescription>Find transactions by member name, ID number, or description</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search welfare transactions..."
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

                        {/* Type Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={activeTab === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('all')}
                                className="gap-2"
                            >
                                <Wallet className="h-3.5 w-3.5" />
                                All ({statusCounts.total})
                            </Button>
                            <Button
                                variant={activeTab === 'contribution' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('contribution')}
                                className="gap-2"
                            >
                                <Heart className="h-3.5 w-3.5" />
                                Contributions ({statusCounts.contributions})
                            </Button>
                            <Button
                                variant={activeTab === 'benefit' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('benefit')}
                                className="gap-2"
                            >
                                <Gift className="h-3.5 w-3.5" />
                                Benefits ({statusCounts.benefits})
                            </Button>
                            <Button
                                variant={activeTab === 'fine' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('fine')}
                                className="gap-2"
                            >
                                <Scale className="h-3.5 w-3.5" />
                                Fines ({statusCounts.fines})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Welfare Transactions Table */}
                {filteredWelfare.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No welfare transactions found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
                            <Button onClick={() => openDrawer('create')} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Record First Transaction
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
                                <div className="col-span-2 font-medium">Member</div>
                                <div className="col-span-1 font-medium">Type</div>
                                <div className="col-span-2 font-medium">Amount</div>
                                <div className="col-span-2 font-medium">Cumulative</div>
                                <div className="col-span-2 font-medium">Date</div>
                                <div className="col-span-2 font-medium">Description</div>
                                <div className="col-span-1 font-medium text-right">Actions</div>
                            </div>
                            <div className="divide-y">
                                {filteredWelfare.map(item => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                                        <div className="col-span-2">
                                            <div className="font-medium">{item.member?.name}</div>
                                            <div className="text-sm text-muted-foreground">{item.member?.id_number}</div>
                                        </div>
                                        <div className="col-span-1">
                                            <Badge variant="outline" className={`${getTypeColor(item.type)} border gap-1`}>
                                                {getTypeIcon(item.type)}
                                                {item.type.charAt(0).toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="col-span-2">
                                            {getAmountDisplay(item)}
                                        </div>
                                        <div className="col-span-2">
                                            <div className="font-medium">
                                                KES {(item.cumulative_amount || 0).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(item.transaction_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-sm truncate">
                                                {item.description || 'No description'}
                                            </div>
                                            {item.meeting && (
                                                <div className="text-xs text-muted-foreground">
                                                    {item.meeting.venue}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDrawer('show', item)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDrawer('edit', item)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setDeletingWelfare(item)}
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
                                        <p className="text-sm text-muted-foreground">Showing {filteredWelfare.length} of {welfare.length} transactions</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Current Balance:</p>
                                        <p className={`text-xl font-bold ${totalStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            KES {Math.abs(totalStats.netBalance).toLocaleString()} {totalStats.netBalance >= 0 ? '' : '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingWelfare} onOpenChange={open => !open && setDeletingWelfare(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Welfare Transaction
                        </DialogTitle>
                        <DialogDescription>
                            This action will permanently delete the welfare transaction record.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingWelfare && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <Wallet className="h-10 w-10 text-red-600" />
                                <div>
                                    <p className="font-semibold">{deletingWelfare.type.toUpperCase()} #{deletingWelfare.id}</p>
                                    <p className="text-sm text-muted-foreground">{deletingWelfare.member?.name}</p>
                                    <p className="text-sm font-medium">{getAmountDisplay(deletingWelfare)}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Warning
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    This will affect the welfare fund balance and member's cumulative welfare.
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeletingWelfare(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Transaction
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Welfare Drawer for Create/Edit/Show */}
            <Drawer open={drawer.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <DrawerContent className="max-w-2xl mx-auto">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            {drawer.mode === 'create' && <Plus className="h-5 w-5" />}
                            {drawer.mode === 'edit' && <Edit className="h-5 w-5" />}
                            {drawer.mode === 'show' && <Eye className="h-5 w-5" />}
                            {drawer.mode === 'create' && 'New Welfare Transaction'}
                            {drawer.mode === 'edit' && `Edit ${drawer.welfare?.type} #${drawer.welfare?.id}`}
                            {drawer.mode === 'show' && `${drawer.welfare?.type?.toUpperCase()} Details #${drawer.welfare?.id}`}
                        </DrawerTitle>
                        <DrawerDescription>
                            {drawer.mode === 'create' && 'Record a new welfare fund transaction'}
                            {drawer.mode === 'edit' && 'Update welfare transaction information'}
                            {drawer.mode === 'show' && 'View welfare transaction details'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Welfare Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wallet className="h-5 w-5" />
                                    Welfare Transaction Information
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

                                    {/* Transaction Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Transaction Type *</Label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="contribution">Contribution</option>
                                            <option value="benefit">Benefit</option>
                                            <option value="fine">Fine</option>
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

                                    {/* Description */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Enter transaction description..."
                                            disabled={drawer.mode === 'show'}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Show Mode - Display Welfare Summary */}
                                {drawer.mode === 'show' && drawer.welfare && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Welfare Summary
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                    <div className="text-xl font-bold text-blue-600">
                                                        {drawer.welfare.type === 'contribution' ? '+' : '-'}KES {drawer.welfare.amount.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">This Transaction</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <div className="text-xl font-bold text-green-600">
                                                        KES {(drawer.welfare.cumulative_amount || 0).toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Cumulative</p>
                                                </div>
                                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                    <div className="text-xl font-bold text-purple-600">
                                                        KES {totalStats.totalContributions.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Total Contributions</p>
                                                </div>
                                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                                    <div className="text-xl font-bold text-red-600">
                                                        KES {totalStats.totalBenefits.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Total Benefits</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Show Mode - Additional Actions */}
                        {drawer.mode === 'show' && drawer.welfare && (
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
                                            onClick={() => router.get(`/welfare/${drawer.welfare?.id}`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => router.get(`/members/${drawer.welfare?.member_id}`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <User className="h-4 w-4" />
                                            View Member
                                        </Button>
                                        <Button
                                            onClick={() => openDrawer('edit', drawer.welfare)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Transaction
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
                                            {drawer.mode === 'create' ? 'Record Transaction' : 'Update Transaction'}
                                        </>
                                    )}
                                </Button>
                            )}

                            {drawer.mode === 'show' && (
                                <Button
                                    onClick={() => openDrawer('edit', drawer.welfare)}
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Transaction
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </AppLayout>
    );
}