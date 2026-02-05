import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = { name?: string };
type Meeting = { meeting_date?: string; venue?: string };
type Loan = {
    id: number;
    loan_amount: number;
    interest_rate: number;
    loan_date?: string;
    due_date?: string | null;
    status: string;
    purpose?: string | null;
    notes?: string | null;
    balance: number;
    total_paid: number;
    member?: Member;
    meeting?: Meeting;
};

export default function LoansShow({ loan }: { loan: Loan }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Loans', href: '/loans' },
        { title: `Loan #${loan.id}`, href: `/loans/${loan.id}` },
    ];

    const paymentForm = useForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Loan #${loan.id}`} />
            <div className="space-y-4 p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Loan #{loan.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Member:</strong> {loan.member?.name ?? 'N/A'}</p>
                        <p><strong>Meeting:</strong> {(loan.meeting?.meeting_date ?? '').slice(0, 10)} {loan.meeting?.venue ? `- ${loan.meeting.venue}` : ''}</p>
                        <p><strong>Amount:</strong> {Number(loan.loan_amount ?? 0).toFixed(2)}</p>
                        <p><strong>Interest:</strong> {Number(loan.interest_rate ?? 0).toFixed(2)}%</p>
                        <p><strong>Status:</strong> {loan.status}</p>
                        <p><strong>Loan Date:</strong> {(loan.loan_date ?? '').slice(0, 10)}</p>
                        <p><strong>Due Date:</strong> {(loan.due_date ?? '').slice(0, 10) || 'N/A'}</p>
                        <p><strong>Total Paid:</strong> {Number(loan.total_paid ?? 0).toFixed(2)}</p>
                        <p><strong>Balance:</strong> {Number(loan.balance ?? 0).toFixed(2)}</p>
                        <p><strong>Purpose:</strong> {loan.purpose ?? 'N/A'}</p>
                        <p><strong>Notes:</strong> {loan.notes ?? 'N/A'}</p>
                        <div className="flex gap-2 pt-2">
                            <Button asChild><Link href={`/loans/${loan.id}/edit`}>Edit</Link></Button>
                            <Button variant="destructive" onClick={() => { if (confirm('Delete this loan?')) router.delete(`/loans/${loan.id}`); }}>Delete</Button>
                            <Button variant="outline" asChild><Link href="/loans">Back</Link></Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-3 md:grid-cols-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                paymentForm.post(`/loans/${loan.id}/payments`);
                            }}
                        >
                            <div className="grid gap-2">
                                <Label>Amount</Label>
                                <Input type="number" step="0.01" value={paymentForm.data.amount} onChange={(e) => paymentForm.setData('amount', e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Payment Date</Label>
                                <Input type="date" value={paymentForm.data.payment_date} onChange={(e) => paymentForm.setData('payment_date', e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Notes</Label>
                                <Input value={paymentForm.data.notes} onChange={(e) => paymentForm.setData('notes', e.target.value)} />
                            </div>
                            <Button type="submit" disabled={paymentForm.processing}>Save Payment</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
