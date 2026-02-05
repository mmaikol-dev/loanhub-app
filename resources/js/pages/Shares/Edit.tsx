import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = { id: number; name: string };
type Meeting = { id: number; meeting_date: string; venue?: string | null };
type Share = {
    id: number;
    member_id: number;
    meeting_id?: number | null;
    amount: number;
    transaction_date: string;
    notes?: string | null;
};

export default function SharesEdit({ share, members, meetings }: { share: Share; members: Member[]; meetings: Meeting[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Shares', href: '/shares' },
        { title: 'Edit', href: `/shares/${share.id}/edit` },
    ];

    const { data, setData, put, processing } = useForm({
        member_id: String(share.member_id),
        meeting_id: share.meeting_id ? String(share.meeting_id) : '',
        amount: String(share.amount),
        transaction_date: (share.transaction_date ?? '').slice(0, 10),
        notes: share.notes ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Share" />
            <div className="p-4">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader><CardTitle>Edit Share</CardTitle></CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); put(`/shares/${share.id}`); }}>
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
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Notes</Label>
                                <textarea className="min-h-24 rounded-md border px-3 py-2" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>Update</Button>
                                <Button type="button" variant="outline" asChild><Link href={`/shares/${share.id}`}>Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
