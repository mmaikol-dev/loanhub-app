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
    User,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Calendar,
    Download,
    Eye,
    CreditCard,
    Percent,
    Target,
    Clock,
    Plus,
    Save,
    Loader2,
    Users,
    Building,
    CalendarDays,
    FileCheck
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
    { title: 'Loans', href: '/loans' },
];

interface LoanSummary {
    id: number;
    member_id: number;
    meeting_id?: number;
    loan_amount: number;
    interest_rate: number;
    loan_date: string;
    due_date?: string;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
    purpose?: string;
    notes?: string;
    balance: number;
    total_paid: number;
    member?: {
        id: number;
        name: string;
        id_number: string;
    };
    meeting?: {
        id: number;
        meeting_date: string;
        venue: string;
    };
}

interface Member {
    id: number;
    name: string;
}

interface Meeting {
    id: number;
    meeting_date: string;
    venue: string;
}

interface DrawerState {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'show' | null;
    loan: LoanSummary | null;
    isLoading: boolean;
}

interface FormData {
    member_id: number | '';
    meeting_id: number | '';
    loan_amount: number | '';
    interest_rate: number | '';
    loan_date: string;
    due_date: string;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
    purpose: string;
    notes: string;
}

export default function Index() {
    const { props } = usePage();
    const { loans, members, meetings, filters } = props as unknown as {
        loans: LoanSummary[];
        members?: Member[];
        meetings?: Meeting[];
        filters: { search?: string; status?: string };
    };

    const [searchValue, setSearchValue] = React.useState(filters?.search || '');
    const [deletingLoan, setDeletingLoan] = React.useState<LoanSummary | null>(null);
    const [recordingPayment, setRecordingPayment] = React.useState<LoanSummary | null>(null);
    const [paymentAmount, setPaymentAmount] = React.useState('');
    const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'>('all');

    const [drawer, setDrawer] = React.useState<DrawerState>({
        isOpen: false,
        mode: null,
        loan: null,
        isLoading: false,
    });

    const [formData, setFormData] = React.useState<FormData>({
        member_id: '',
        meeting_id: '',
        loan_amount: '',
        interest_rate: '',
        loan_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
        purpose: '',
        notes: '',
    });

    const filteredLoans = loans.filter(loan => {
        if (activeTab !== 'all' && loan.status !== activeTab) return false;

        if (!searchValue) return true;

        const searchLower = searchValue.toLowerCase();
        return (
            loan.member?.name.toLowerCase().includes(searchLower) ||
            loan.purpose?.toLowerCase().includes(searchLower) ||
            loan.member?.id_number.toLowerCase().includes(searchLower) ||
            loan.id.toString().includes(searchValue)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'defaulted': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'approved': return <FileCheck className="h-4 w-4" />;
            case 'active': return <TrendingUp className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'defaulted': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const statusCounts = React.useMemo(() => ({
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => l.status === 'approved').length,
        active: loans.filter(l => l.status === 'active').length,
        completed: loans.filter(l => l.status === 'completed').length,
        defaulted: loans.filter(l => l.status === 'defaulted').length,
        total: loans.length,
    }), [loans]);

    const totalStats = React.useMemo(() => ({
        totalAmount: loans.reduce((sum, l) => sum + l.loan_amount, 0),
        totalBalance: loans.reduce((sum, l) => sum + l.balance, 0),
        totalPaid: loans.reduce((sum, l) => sum + l.total_paid, 0),
        activeLoans: loans.filter(l => ['approved', 'active'].includes(l.status)).length,
    }), [loans]);

    const calculateTotalRepayment = (loan: LoanSummary) => {
        const interest = loan.loan_amount * (loan.interest_rate / 100);
        return loan.loan_amount + interest;
    };

    const handleDelete = () => {
        if (!deletingLoan) return;
        router.delete(`/loans/${deletingLoan.id}`, {
            onSuccess: () => setDeletingLoan(null),
        });
    };

    const handlePayment = () => {
        if (!recordingPayment) return;

        router.post(`/loans/${recordingPayment.id}/payment`, {
            amount: parseFloat(paymentAmount),
            payment_date: paymentDate,
        }, {
            onSuccess: () => {
                setRecordingPayment(null);
                setPaymentAmount('');
            },
        });
    };

    const openDrawer = (mode: 'create' | 'edit' | 'show', loan?: LoanSummary) => {
        if (loan) {
            setDrawer({
                isOpen: true,
                mode,
                loan,
                isLoading: false,
            });

            if (mode === 'edit' || mode === 'show') {
                setFormData({
                    member_id: loan.member_id,
                    meeting_id: loan.meeting_id || '',
                    loan_amount: loan.loan_amount,
                    interest_rate: loan.interest_rate,
                    loan_date: loan.loan_date,
                    due_date: loan.due_date || '',
                    status: loan.status,
                    purpose: loan.purpose || '',
                    notes: loan.notes || '',
                });
            }
        } else {
            setDrawer({
                isOpen: true,
                mode: 'create',
                loan: null,
                isLoading: false,
            });
            setFormData({
                member_id: '',
                meeting_id: '',
                loan_amount: '',
                interest_rate: '',
                loan_date: new Date().toISOString().split('T')[0],
                due_date: '',
                status: 'pending',
                purpose: '',
                notes: '',
            });
        }
    };

    const closeDrawer = () => {
        setDrawer({
            isOpen: false,
            mode: null,
            loan: null,
            isLoading: false,
        });
    };

    const handleSubmit = () => {
        setDrawer(prev => ({ ...prev, isLoading: true }));

        if (drawer.mode === 'create') {
            router.post('/loans', formData, {
                onSuccess: () => {
                    closeDrawer();
                },
                onFinish: () => {
                    setDrawer(prev => ({ ...prev, isLoading: false }));
                },
            });
        } else if (drawer.mode === 'edit' && drawer.loan) {
            router.put(`/loans/${drawer.loan.id}`, formData, {
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
        const headers = ['ID', 'Member', 'Loan Amount', 'Interest Rate', 'Total Due', 'Balance', 'Status', 'Loan Date', 'Due Date', 'Purpose'];
        const csvContent = [
            headers.join(','),
            ...filteredLoans.map(loan => [
                loan.id,
                `"${loan.member?.name || 'N/A'}"`,
                loan.loan_amount,
                loan.interest_rate,
                calculateTotalRepayment(loan),
                loan.balance,
                loan.status,
                loan.loan_date,
                loan.due_date || 'N/A',
                `"${loan.purpose || 'N/A'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loans_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans Management" />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <CreditCard className="h-8 w-8" />
                                Loans Management
                            </h1>
                            <p className="text-muted-foreground">Manage and track all loan applications and disbursements</p>
                        </div>
                        <Button onClick={() => openDrawer('create')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Loan
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
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
                                    Pending: {statusCounts.pending}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.totalAmount.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total loan disbursements</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.totalBalance.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total amount due</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">KES {totalStats.totalPaid.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Amount recovered</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter Loans
                        </CardTitle>
                        <CardDescription>Find loans by member name, purpose, or ID number</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search loans..."
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
                                <Button
                                    onClick={() => router.get('/loans/active')}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Target className="h-4 w-4" />
                                    Active Loans
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
                                <CreditCard className="h-3.5 w-3.5" />
                                All ({statusCounts.total})
                            </Button>
                            <Button
                                variant={activeTab === 'pending' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('pending')}
                                className="gap-2"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Pending ({statusCounts.pending})
                            </Button>
                            <Button
                                variant={activeTab === 'approved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('approved')}
                                className="gap-2"
                            >
                                <FileCheck className="h-3.5 w-3.5" />
                                Approved ({statusCounts.approved})
                            </Button>
                            <Button
                                variant={activeTab === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('active')}
                                className="gap-2"
                            >
                                <TrendingUp className="h-3.5 w-3.5" />
                                Active ({statusCounts.active})
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
                                variant={activeTab === 'defaulted' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('defaulted')}
                                className="gap-2"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Defaulted ({statusCounts.defaulted})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Loans Grid */}
                {filteredLoans.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No loans found</h3>
                            <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
                            <Button onClick={() => openDrawer('create')} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create New Loan
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLoans.map(loan => (
                            <Card key={loan.id} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">Loan #{loan.id}</span>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{loan.member?.name}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className={`${getStatusColor(loan.status)} border flex-shrink-0 gap-1`}>
                                            {getStatusIcon(loan.status)}
                                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Loan Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Amount:
                                            </span>
                                            <span className="font-semibold">KES {loan.loan_amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Percent className="h-3.5 w-3.5" />
                                                Interest:
                                            </span>
                                            <span className="font-semibold">{loan.interest_rate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                Balance:
                                            </span>
                                            <span className="font-semibold">KES {loan.balance.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Date:
                                            </span>
                                            <span>{new Date(loan.loan_date).toLocaleDateString()}</span>
                                        </div>
                                        {loan.purpose && (
                                            <div className="text-sm pt-2 border-t">
                                                <p className="text-muted-foreground">Purpose:</p>
                                                <p className="truncate">{loan.purpose}</p>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            onClick={() => openDrawer('show', loan)}
                                            className="flex-1 gap-2"
                                            variant="outline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        {loan.balance > 0 && (
                                            <Button
                                                size="sm"
                                                onClick={() => setRecordingPayment(loan)}
                                                className="flex-1 gap-2"
                                                variant="default"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                                Payment
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openDrawer('edit', loan)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeletingLoan(loan)}
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
                {filteredLoans.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {filteredLoans.length} of {loans.length} loans</span>
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
            <Dialog open={!!deletingLoan} onOpenChange={open => !open && setDeletingLoan(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Delete Loan
                        </DialogTitle>
                        <DialogDescription>
                            This action will permanently delete the loan record.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingLoan && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <CreditCard className="h-10 w-10 text-red-600" />
                                <div>
                                    <p className="font-semibold">Loan #{deletingLoan.id}</p>
                                    <p className="text-sm text-muted-foreground">{deletingLoan.member?.name}</p>
                                    <p className="text-sm font-medium">KES {deletingLoan.loan_amount.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Warning
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                    This will delete all associated payment records. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeletingLoan(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Loan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Record Payment Modal */}
            <Dialog open={!!recordingPayment} onOpenChange={open => !open && setRecordingPayment(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Record Payment
                        </DialogTitle>
                        <DialogDescription>
                            Record a payment for {recordingPayment?.member?.name}'s loan
                        </DialogDescription>
                    </DialogHeader>
                    {recordingPayment && (
                        <div className="space-y-4 py-4">
                            {/* Loan Info */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">Loan #{recordingPayment.id}</h3>
                                            <p className="text-sm text-muted-foreground">{recordingPayment.member?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Balance</p>
                                            <p className="text-xl font-bold text-green-600">
                                                KES {recordingPayment.balance.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Form */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paymentAmount">Payment Amount (KES)</Label>
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                    {parseFloat(paymentAmount) > recordingPayment.balance && (
                                        <p className="text-sm text-red-500">
                                            Amount exceeds balance of KES {recordingPayment.balance.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentDate">Payment Date</Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setRecordingPayment(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > (recordingPayment?.balance || 0)}
                            className="gap-2"
                        >
                            <DollarSign className="h-4 w-4" />
                            Record Payment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Loan Drawer for Create/Edit/Show */}
            <Drawer open={drawer.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
                <DrawerContent className="max-w-2xl mx-auto">
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            {drawer.mode === 'create' && <Plus className="h-5 w-5" />}
                            {drawer.mode === 'edit' && <Edit className="h-5 w-5" />}
                            {drawer.mode === 'show' && <Eye className="h-5 w-5" />}
                            {drawer.mode === 'create' && 'Create New Loan'}
                            {drawer.mode === 'edit' && `Edit Loan #${drawer.loan?.id}`}
                            {drawer.mode === 'show' && `Loan Details #${drawer.loan?.id}`}
                        </DrawerTitle>
                        <DrawerDescription>
                            {drawer.mode === 'create' && 'Create a new loan application'}
                            {drawer.mode === 'edit' && 'Update loan information'}
                            {drawer.mode === 'show' && 'View loan details and payment history'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Loan Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Loan Information
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
                                                    {member.name}
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

                                    {/* Loan Amount */}
                                    <div className="space-y-2">
                                        <Label htmlFor="loan_amount">Loan Amount (KES) *</Label>
                                        <Input
                                            id="loan_amount"
                                            name="loan_amount"
                                            type="number"
                                            value={formData.loan_amount}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* Interest Rate */}
                                    <div className="space-y-2">
                                        <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
                                        <Input
                                            id="interest_rate"
                                            name="interest_rate"
                                            type="number"
                                            step="0.01"
                                            value={formData.interest_rate}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* Loan Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="loan_date">Loan Date *</Label>
                                        <Input
                                            id="loan_date"
                                            name="loan_date"
                                            type="date"
                                            value={formData.loan_date}
                                            onChange={handleInputChange}
                                            disabled={drawer.mode === 'show'}
                                            required
                                        />
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <Input
                                            id="due_date"
                                            name="due_date"
                                            type="date"
                                            value={formData.due_date}
                                            onChange={handleInputChange}
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
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="defaulted">Defaulted</option>
                                        </select>
                                    </div>

                                    {/* Purpose */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="purpose">Purpose</Label>
                                        <Input
                                            id="purpose"
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleInputChange}
                                            placeholder="Enter loan purpose"
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

                                {/* Show Mode - Display Loan Summary */}
                                {drawer.mode === 'show' && drawer.loan && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Loan Summary
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                    <div className="text-xl font-bold text-blue-600">
                                                        KES {drawer.loan.loan_amount.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Principal</p>
                                                </div>
                                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                                    <div className="text-xl font-bold text-green-600">
                                                        KES {calculateTotalRepayment(drawer.loan).toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Total Due</p>
                                                </div>
                                                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                    <div className="text-xl font-bold text-yellow-600">
                                                        KES {drawer.loan.balance.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Balance</p>
                                                </div>
                                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                    <div className="text-xl font-bold text-purple-600">
                                                        KES {drawer.loan.total_paid.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Paid</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Show Mode - Additional Actions */}
                        {drawer.mode === 'show' && drawer.loan && (
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
                                                setRecordingPayment(drawer.loan);
                                            }}
                                            disabled={drawer.loan.balance <= 0}
                                            className="gap-2"
                                        >
                                            <DollarSign className="h-4 w-4" />
                                            Record Payment
                                        </Button>
                                        <Button
                                            onClick={() => router.get(`/loans/${drawer.loan?.id}`)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => openDrawer('edit', drawer.loan)}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Loan
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
                                    disabled={drawer.isLoading || !formData.member_id || !formData.loan_amount || !formData.interest_rate}
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
                                            {drawer.mode === 'create' ? 'Create Loan' : 'Update Loan'}
                                        </>
                                    )}
                                </Button>
                            )}

                            {drawer.mode === 'show' && (
                                <Button
                                    onClick={() => openDrawer('edit', drawer.loan)}
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Loan
                                </Button>
                            )}
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </AppLayout>
    );
}