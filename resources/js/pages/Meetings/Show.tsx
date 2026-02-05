import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Meeting = {
    id: number;
    meeting_date?: string;
    venue?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    bank_balance?: number;
    cash_in_hand?: number;
    members_present?: number;
    agenda?: string | null;
    minutes?: string | null;
    status?: string;
    total_shares_collected?: number;
    total_welfare_collected?: number;
    total_loans_issued?: number;
    total_loan_paid?: number;
    total_fines?: number;
    total_cash?: number;
    shares_count?: number;
    loans_count?: number;
    welfare_count?: number;
};

export default function MeetingsShow({ meeting }: { meeting: Meeting }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Meetings', href: '/meetings' },
        { title: `Meeting #${meeting.id}`, href: `/meetings/${meeting.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Meeting #${meeting.id}`} />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader><CardTitle>Meeting #{meeting.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Date:</strong> {(meeting.meeting_date ?? '').slice(0, 10)}</p>
                        <p><strong>Venue:</strong> {meeting.venue ?? 'N/A'}</p>
                        <p><strong>Status:</strong> {meeting.status ?? 'N/A'}</p>
                        <p><strong>Members Present:</strong> {meeting.members_present ?? 0}</p>
                        <p><strong>Shares:</strong> {Number(meeting.total_shares_collected ?? 0).toFixed(2)} ({meeting.shares_count ?? 0} items)</p>
                        <p><strong>Welfare:</strong> {Number(meeting.total_welfare_collected ?? 0).toFixed(2)} ({meeting.welfare_count ?? 0} items)</p>
                        <p><strong>Loans Issued:</strong> {Number(meeting.total_loans_issued ?? 0).toFixed(2)} ({meeting.loans_count ?? 0} items)</p>
                        <p><strong>Loan Paid:</strong> {Number(meeting.total_loan_paid ?? 0).toFixed(2)}</p>
                        <p><strong>Fines:</strong> {Number(meeting.total_fines ?? 0).toFixed(2)}</p>
                        <p><strong>Total Cash:</strong> {Number(meeting.total_cash ?? 0).toFixed(2)}</p>
                        <p><strong>Agenda:</strong> {meeting.agenda ?? 'N/A'}</p>
                        <p><strong>Minutes:</strong> {meeting.minutes ?? 'N/A'}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button asChild><Link href={`/meetings/${meeting.id}/edit`}>Edit</Link></Button>
                            <Button variant="outline" asChild><Link href={`/meetings/${meeting.id}/summary`}>Summary</Link></Button>
                            <Button variant="outline" asChild><Link href={`/meetings/${meeting.id}/collection-sheet`}>Collection Sheet</Link></Button>
                            <Button variant="destructive" onClick={() => { if (confirm('Delete this meeting?')) router.delete(`/meetings/${meeting.id}`); }}>Delete</Button>
                            <Button variant="outline" asChild><Link href="/meetings">Back</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
