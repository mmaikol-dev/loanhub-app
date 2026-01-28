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
    UserPlus,
    Search,
    X,
    User,
    Phone,
    Mail,
    Hash,
    Calendar,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Wallet,
    Users,
    Download,
    Eye,
    MoreVertical,
    Building,
    MapPin,
    PieChart,
    Save,
    Plus,
    Loader2
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
    { title: 'Members', href: '/members' },
];

interface MemberSummary {
    id: number;
    name: string;
    phone: string;
    email: string;
    id_number: string;
    address?: string;
    join_date: string;
    status: 'active' | 'inactive' | 'suspended';
    total_shares: number;
    active_loan_balance: number;
    total_welfare: number;
    shares_count: number;
    loans_count: number;
}

interface DrawerState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'show' | null;
    member: MemberSummary | null;
    isLoading: boolean;
}

interface FormData {
    name: string;
    phone: string;
    email: string;
    id_number: string;
    address: string;
    join_date: string;
    status: 'active' | 'inactive' | 'suspended';
}

export default function Index() {
    const { props } = usePage();
    const { members, filters } = props as unknown as {
        members: MemberSummary[];
        filters: { search?: string; status?: string };
    };

    const [searchValue, setSearchValue] = React.useState(filters?.search || '');
    const [deletingMember, setDeletingMember] = React.useState<MemberSummary | null>(null);
    const [viewingStatement, setViewingStatement] = React.useState<MemberSummary | null>(null);
    const [activeTab, setActiveTab] = React.useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

    const [drawer, setDrawer] = React.useState<DrawerState>({
        isOpen: false,
        mode: null,
        member: null,
        isLoading: false,
    });

    const [formData, setFormData] = React.useState<FormData>({
        name: '',
        phone: '',
        email: '',
        id_number: '',
        address: '',
        join_date: new Date().toISOString().split('T')[0],
        status: 'active',
    });

    const filteredMembers = members.filter(member => {
        if (activeTab !== 'all' && member.status !== activeTab) return false;

        if (!searchValue) return true;

        const searchLower = searchValue.toLowerCase();
        return (
            member.name.toLowerCase().includes(searchLower) ||
            member.phone.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            member.id_number.toLowerCase().includes(searchLower)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'inactive': return <AlertCircle className="h-4 w-4" />;
            case 'suspended': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const statusCounts = React.useMemo(() => ({
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        suspended: members.filter(m => m.status === 'suspended').length,
        total: members.length,
    }), [members]);

    const totalStats = React.useMemo(() => ({
        shares: members.reduce((sum, m) => sum + m.total_shares, 0),
        loans: members.reduce((sum, m) => sum + m.active_loan_balance, 0),
        welfare: members.reduce((sum, m) => sum + m.total_welfare, 0),
    }), [members]);

    const handleDelete = () => {
        if (!deletingMember) return;
        router.delete(`/members/${deletingMember.id}`, {
            onSuccess: () => setDeletingMember(null),
        });
    };

    const openDrawer = (mode: 'create' | 'edit' | 'show', member?: MemberSummary) => {
        if (member) {
            setDrawer({
                isOpen: true,
                mode,
                member,
                isLoading: false,
            });

            if (mode === 'edit' || mode === 'show') {
                setFormData({
                    name: member.name,
                    phone: member.phone,
                    email: member.email,
                    id_number: member.id_number,
                    address: member.address || '',
                    join_date: member.join_date,
                    status: member.status,
                });
            }
        } else {
            setDrawer({
                isOpen: true,
                mode: 'create',
                member: null,
                isLoading: false,
            });
            setFormData({
                name: '',
                phone: '',
                email: '',
                id_number: '',
                address: '',
                join_date: new Date().toISOString().split('T')[0],
                status: 'active',
            });
        }
    };

    const closeDrawer = () => {
        setDrawer({
            isOpen: false,
            mode: null,
            member: null,
            isLoading: false,
        });
    };

    const handleSubmit = () => {
        setDrawer(prev => ({ ...prev, isLoading: true }));

        if (drawer.mode === 'create') {
            router.post('/members', formData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        } else if (drawer.mode === 'edit' && drawer.member) {
            router.put(`/members/${drawer.member.id}`, formData, {
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Phone', 'Email', 'ID Number', 'Join Date', 'Status', 'Total Shares', 'Active Loans', 'Total Welfare'];
        const csvContent = [
            headers.join(','),
            ...filteredMembers.map(member => [
                `"${member.name}"`,
                `"${member.phone}"`,
                `"${member.email}"`,
                `"${member.id_number}"`,
                member.join_date,
                member.status,
                member.total_shares,
                member.active_loan_balance,
                member.total_welfare
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members Management" />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Users className="h-8 w-8" />
                                Members Management
                            </h1>
                            <p className="text-muted-foreground">Manage and track all member information and financials</p>
                        </div>
                        <Button onClick={() => openDrawer('create')} className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add New Member
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.total}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Active: {statusCounts.active}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                    Inactive: {statusCounts.inactive}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                    Suspended: {statusCounts.suspended}
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
                            <div className="text-2xl font-bold">KES {totalStats.shares.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Combined member contributions</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.loans.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Outstanding loan balances</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Welfare Fund</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.welfare.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Welfare contributions & benefits</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter Members
                        </CardTitle>
                        <CardDescription>Find members by name, phone, email, or ID number</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search members..."
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
                                <Users className="h-3.5 w-3.5" />
                                All ({statusCounts.total})
                            </Button>
                            <Button
                                variant={activeTab === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('active')}
                                className="gap-2"
                            >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Active ({statusCounts.active})
                            </Button>
                            <Button
                                variant={activeTab === 'inactive' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('inactive')}
                                className="gap-2"
                            >
                                <AlertCircle className="h-3.5 w-3.5" />
                                Inactive ({statusCounts.inactive})
                            </Button>
                            <Button
                                variant={activeTab === 'suspended' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('suspended')}
                                className="gap-2"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Suspended ({statusCounts.suspended})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Members Grid */}
                {filteredMembers.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <User className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No members found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
                            <Button onClick={() => openDrawer('create')} className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add Your First Member
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMembers.map(member => (
                            <Card key={member.id} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">{member.name}</span>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1.5">
                                                <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{member.id_number}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className={`${getStatusColor(member.status)} border flex-shrink-0 gap-1`}>
                                            {getStatusIcon(member.status)}
                                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Contact Info */}
                                    <div className="space-y-2">
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">{member.phone}</span>
                                            </div>
                                        )}
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Join Date */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                        <span>Joined: {new Date(member.join_date).toLocaleDateString()}</span>
                                    </div>

                                    <Separator />

                                    {/* Financial Summary */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <PieChart className="h-3.5 w-3.5" />
                                                Shares:
                                            </span>
                                            <span className="font-semibold">KES {member.total_shares.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                Loans:
                                            </span>
                                            <span className="font-semibold">KES {member.active_loan_balance.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Wallet className="h-3.5 w-3.5" />
                                                Welfare:
                                            </span>
                                            <span className="font-semibold">KES {member.total_welfare.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            onClick={() => openDrawer('show', member)}
                                            className="flex-1 gap-2"
                                            variant="outline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => setViewingStatement(member)}
                                            className="flex-1 gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Statement
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDrawer('edit', member)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeletingMember(member)}
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
                {filteredMembers.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {filteredMembers.length} of {members.length} members</span>
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
            <Dialog open={!!deletingMember} onOpenChange={open => !open && setDeletingMember(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Member
                        </DialogTitle>
                        <DialogDescription>
                            This action will permanently delete the member and all associated records.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingMember && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <User className="h-10 w-10 text-red-600" />
                                <div>
                                    <p className="font-semibold">{deletingMember.name}</p>
                                    <p className="text-sm text-muted-foreground">{deletingMember.id_number}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Warning
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    This will also delete all associated shares, loans, and welfare records.
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeletingMember(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Member
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Statement Modal */}
            <Dialog open={!!viewingStatement} onOpenChange={open => !open && setViewingStatement(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Member Statement
                        </DialogTitle>
                        <DialogDescription>
                            Financial statement for {viewingStatement?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingStatement && (
                        <div className="space-y-4 py-4">
                            {/* Member Info */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{viewingStatement.name}</h3>
                                            <p className="text-sm text-muted-foreground">{viewingStatement.id_number}</p>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(viewingStatement.status)}>
                                            {viewingStatement.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Shares Count</p>
                                            <p className="text-xl font-bold">{viewingStatement.shares_count}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Loans Count</p>
                                            <p className="text-xl font-bold">{viewingStatement.loans_count}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            KES {viewingStatement.total_shares.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Total Shares</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            KES {viewingStatement.active_loan_balance.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Active Loans</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            KES {viewingStatement.total_welfare.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Welfare Fund</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(`/members/${viewingStatement.id}/statement`)}
                                    className="gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Full Statement
                                </Button>
                                <Button onClick={() => setViewingStatement(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Member Drawer for Create/Edit/Show */}
            <Drawer open={drawer.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <DrawerContent className="max-w-2xl mx-auto">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            {drawer.mode === 'create' && <UserPlus className="h-5 w-5" />}
                            {drawer.mode === 'edit' && <Edit className="h-5 w-5" />}
                            {drawer.mode === 'show' && <Eye className="h-5 w-5" />}
                            {drawer.mode === 'create' && 'Add New Member'}
                            {drawer.mode === 'edit' && `Edit ${drawer.member?.name}`}
                            {drawer.mode === 'show' && `Member Details - ${drawer.member?.name}`}
                        </DrawerTitle>
                        <DrawerDescription>
                            {drawer.mode === 'create' && 'Add a new member to the system'}
                            {drawer.mode === 'edit' && 'Update member information'}
                            {drawer.mode === 'show' && 'View member details and information'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Member Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* ID Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="id_number">ID Number</Label>
                                        <Input
                                            id="id_number"
                                            name="id_number"
                                            value={formData.id_number}
                                            onChange={handleInputChange}
                                            placeholder="12345678"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+254 700 000 000"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="123 Main Street, Nairobi"
                                            disabled={drawer.mode === 'show'}
                                        />
                                    </div>

                                    {/* Join Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="join_date">Join Date *</Label>
                                        <Input
                                            id="join_date"
                                            name="join_date"
                                            type="date"
                                            value={formData.join_date}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            required
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
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Show Mode - Display Financial Summary */}
                                {drawer.mode === 'show' && drawer.member && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <PieChart className="h-5 w-5" />
                                                Financial Summary
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                    <div className="text-xl font-bold text-blue-600">
                                                        KES {drawer.member.total_shares.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Shares</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <div className="text-xl font-bold text-green-600">
                                                        KES {drawer.member.active_loan_balance.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Loans</p>
                                                </div>
                                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                    <div className="text-xl font-bold text-purple-600">
                                                        KES {drawer.member.total_welfare.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Welfare</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Show Mode - Additional Actions */}
                        {drawer.mode === 'show' && drawer.member && (
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
                                            onClick={() => {
                                                closeDrawer();
                                                setViewingStatement(drawer.member);
                                            }}
                                            className="gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View Statement
                                        </Button>
                                        <Button
                                            onClick={() => router.get(`/members/${drawer.member?.id}/statement`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Full Statement
                                        </Button>
                                        <Button
                                            onClick={() => openDrawer('edit', drawer.member)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Member
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
                                    disabled={drawer.isLoading}
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
                                            {drawer.mode === 'create' ? 'Create Member' : 'Update Member'}
                                        </>
                                    )}
                                </Button>
                            )}

                            {drawer.mode === 'show' && (
                                <Button
                                    onClick={() => openDrawer('edit', drawer.member)}
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Member
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </AppLayout>
    );
}