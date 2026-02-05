import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Meetings', href: '/meetings' },
    { title: 'Create', href: '/meetings/create' },
];

export default function MeetingsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        meeting_date: new Date().toISOString().split('T')[0],
        venue: '',
        start_time: '',
        end_time: '',
        bank_balance: '0',
        cash_in_hand: '0',
        members_present: '0',
        agenda: '',
        minutes: '',
        status: 'scheduled',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Meeting" />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Create Meeting</CardTitle></CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); post('/meetings'); }}>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={data.meeting_date} onChange={(e) => setData('meeting_date', e.target.value)} required />{errors.meeting_date && <p className="text-sm text-red-500">{errors.meeting_date}</p>}</div>
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
                                    <select className="h-10 rounded-md border px-3" value={data.status} onChange={(e) => setData('status', e.target.value)}>
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
                                <Button type="submit" disabled={processing}>Save</Button>
                                <Button type="button" variant="outline" asChild><Link href="/meetings">Cancel</Link></Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
