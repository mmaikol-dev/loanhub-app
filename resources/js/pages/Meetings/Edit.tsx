import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Meeting = {
    id: number;
    meeting_date: string;
    venue?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    bank_balance?: number | null;
    cash_in_hand?: number | null;
    members_present?: number | null;
    agenda?: string | null;
    minutes?: string | null;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
};

export default function MeetingsEdit({ meeting }: { meeting: Meeting }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Meetings', href: '/meetings' },
        { title: 'Edit', href: `/meetings/${meeting.id}/edit` },
    ];

    const { data, setData, put, processing } = useForm({
        meeting_date: (meeting.meeting_date ?? '').slice(0, 10),
        venue: meeting.venue ?? '',
        start_time: (meeting.start_time ?? '').slice(11, 16),
        end_time: (meeting.end_time ?? '').slice(11, 16),
        bank_balance: String(meeting.bank_balance ?? 0),
        cash_in_hand: String(meeting.cash_in_hand ?? 0),
        members_present: String(meeting.members_present ?? 0),
        agenda: meeting.agenda ?? '',
        minutes: meeting.minutes ?? '',
        status: meeting.status ?? 'scheduled',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Meeting" />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Edit Meeting</CardTitle></CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); put(`/meetings/${meeting.id}`); }}>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={data.meeting_date} onChange={(e) => setData('meeting_date', e.target.value)} required /></div>
                                <div className="grid gap-2"><Label>Venue</Label><Input value={data.venue} onChange={(e) => setData('venue', e.target.value)} /></div>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2"><Label>Start Time</Label><Input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} /></div>
                                <div className="grid gap-2"><Label>End Time</Label><Input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} /></div>
                            </div>
                            <div className="grid gap-2 md:grid-cols-4">
                                <div className="grid gap-2"><Label>Bank Balance</Label><Input type="number" step="0.01" value={data.bank_balance} onChange={(e) => setData('bank_balance', e.target.value)} /></div>
                                <div className="grid gap-2"><Label>Cash In Hand</Label><Input type="number" step="0.01" value={data.cash_in_hand} onChange={(e) => setData('cash_in_hand', e.target.value)} /></div>
                                <div className="grid gap-2"><Label>Members Present</Label><Input type="number" value={data.members_present} onChange={(e) => setData('members_present', e.target.value)} /></div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <select className="h-10 rounded-md border px-3" value={data.status} onChange={(e) => setData('status', e.target.value as Meeting['status'])}>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-2"><Label>Agenda</Label><textarea className="min-h-24 rounded-md border px-3 py-2" value={data.agenda} onChange={(e) => setData('agenda', e.target.value)} /></div>
                            <div className="grid gap-2"><Label>Minutes</Label><textarea className="min-h-24 rounded-md border px-3 py-2" value={data.minutes} onChange={(e) => setData('minutes', e.target.value)} /></div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>Update</Button>
                                <Button type="button" variant="outline" asChild><Link href={`/meetings/${meeting.id}`}>Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
