import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = { id: number; name: string };
type Meeting = { id: number; meeting_date: string; venue?: string | null };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Loans', href: '/loans' },
    { title: 'Create', href: '/loans/create' },
];

export default function LoansCreate({ members, meetings }: { members: Member[]; meetings: Meeting[] }) {
    const { data, setData, post, processing, errors } = useForm({
        member_id: '',
        meeting_id: '',
        loan_amount: '',
        interest_rate: '10',
        loan_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending',
        purpose: '',
        notes: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Loan" />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Create Loan</CardTitle></CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); post('/loans'); }}>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Member</Label>
                                    <select className="h-10 rounded-md border px-3" value={data.member_id} onChange={(e) => setData('member_id', e.target.value)} required>
                                        <option value="">Select member</option>
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
                                    {errors.loan_amount && <p className="text-sm text-red-500">{errors.loan_amount}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Interest Rate (%)</Label>
                                    <Input type="number" step="0.01" value={data.interest_rate} onChange={(e) => setData('interest_rate', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <select className="h-10 rounded-md border px-3" value={data.status} onChange={(e) => setData('status', e.target.value)}>
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
                                <Button type="submit" disabled={processing}>Save</Button>
                                <Button type="button" variant="outline" asChild><Link href="/loans">Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
