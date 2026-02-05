import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Loan = {
    id: number;
    member?: { name?: string } | null;
    loan_amount: number;
    balance: number;
    status: string;
    loan_date?: string;
    due_date?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Loans', href: '/loans' },
    { title: 'Active Loans', href: '/loans/active' },
];

export default function ActiveLoans({ loans }: { loans: Loan[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Active Loans" />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Active Loans</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {loans.length === 0 ? (
                            <p>No active loans found.</p>
                        ) : (
                            loans.map((loan) => (
                                <div key={loan.id} className="rounded border p-3">
                                    <p><strong>Member:</strong> {loan.member?.name ?? 'N/A'}</p>
                                    <p><strong>Amount:</strong> {Number(loan.loan_amount ?? 0).toFixed(2)}</p>
                                    <p><strong>Balance:</strong> {Number(loan.balance ?? 0).toFixed(2)}</p>
                                    <p><strong>Status:</strong> {loan.status}</p>
                                    <p><strong>Date:</strong> {(loan.loan_date ?? '').slice(0, 10)}</p>
                                    <p><strong>Due:</strong> {(loan.due_date ?? '').slice(0, 10) || 'N/A'}</p>
                                    <div className="mt-2 flex gap-2">
                                        <Button size="sm" asChild><Link href={`/loans/${loan.id}`}>View</Link></Button>
                                        <Button size="sm" variant="outline" asChild><Link href={`/loans/${loan.id}/edit`}>Edit</Link></Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
                <Button variant="outline" asChild><Link href="/loans">Back to Loans</Link></Button>
            </div>
        </AppLayout>
    );
}
