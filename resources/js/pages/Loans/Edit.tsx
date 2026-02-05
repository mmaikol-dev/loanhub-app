import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = { id: number; name: string };
type Meeting = { id: number; meeting_date: string; venue?: string | null };
type Loan = {
    id: number;
    member_id: number;
    meeting_id?: number | null;
    loan_amount: number;
    interest_rate: number;
    loan_date: string;
    due_date?: string | null;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
    purpose?: string | null;
    notes?: string | null;
};

export default function LoansEdit({ loan, members, meetings }: { loan: Loan; members: Member[]; meetings: Meeting[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Loans', href: '/loans' },
        { title: 'Edit', href: `/loans/${loan.id}/edit` },
    ];

    const { data, setData, put, processing } = useForm({
        member_id: String(loan.member_id),
        meeting_id: loan.meeting_id ? String(loan.meeting_id) : '',
        loan_amount: String(loan.loan_amount),
        interest_rate: String(loan.interest_rate),
        loan_date: (loan.loan_date ?? '').slice(0, 10),
        due_date: (loan.due_date ?? '').slice(0, 10),
        status: loan.status,
        purpose: loan.purpose ?? '',
        notes: loan.notes ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Loan" />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Edit Loan</CardTitle></CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); put(`/loans/${loan.id}`); }}>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Member</Label>
                                    <select className="h-10 rounded-md border px-3" value={data.member_id} onChange={(e) => setData('member_id', e.target.value)} required>
                                        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Meeting</Label>
                                    <select className="h-10 rounded-md border px-3" value={data.meeting_id} onChange={(e) => setData('meeting_id', e.target.value)}>
                                        <option value="">No meeting</option>
                                        {meetings.map((m) => <option key={m.id} value={m.id}>{m.meeting_date} - {m.venue ?? 'N/A'}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label>Loan Amount</Label>
                                    <Input type="number" step="0.01" value={data.loan_amount} onChange={(e) => setData('loan_amount', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Interest Rate (%)</Label>
                                    <Input type="number" step="0.01" value={data.interest_rate} onChange={(e) => setData('interest_rate', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <select className="h-10 rounded-md border px-3" value={data.status} onChange={(e) => setData('status', e.target.value as Loan['status'])}>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="defaulted">Defaulted</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Loan Date</Label>
                                    <Input type="date" value={data.loan_date} onChange={(e) => setData('loan_date', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Purpose</Label>
                                <Input value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Notes</Label>
                                <textarea className="min-h-24 rounded-md border px-3 py-2" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>Update</Button>
                                <Button type="button" variant="outline" asChild><Link href={`/loans/${loan.id}`}>Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
