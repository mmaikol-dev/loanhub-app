import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Meeting = { id: number; meeting_date?: string; venue?: string | null };
type MoneyItem = { id: number; amount?: number; member?: { name?: string } };
type Totals = {
    shares_collected: number;
    welfare_collected: number;
    loans_issued: number;
    loan_payments: number;
    fines: number;
    total_cash: number;
};

export default function MeetingsSummary({
    meeting,
    shares,
    loans,
    welfare,
    totals,
}: {
    meeting: Meeting;
    shares: MoneyItem[];
    loans: MoneyItem[];
    welfare: MoneyItem[];
    totals: Totals;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Meetings', href: '/meetings' },
        { title: 'Summary', href: `/meetings/${meeting.id}/summary` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Meeting Summary #${meeting.id}`} />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader><CardTitle>Meeting Summary - {(meeting.meeting_date ?? '').slice(0, 10)} {meeting.venue ? `(${meeting.venue})` : ''}</CardTitle></CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-3">
                        <p><strong>Shares:</strong> {Number(totals.shares_collected ?? 0).toFixed(2)}</p>
                        <p><strong>Welfare:</strong> {Number(totals.welfare_collected ?? 0).toFixed(2)}</p>
                        <p><strong>Loans Issued:</strong> {Number(totals.loans_issued ?? 0).toFixed(2)}</p>
                        <p><strong>Loan Payments:</strong> {Number(totals.loan_payments ?? 0).toFixed(2)}</p>
                        <p><strong>Fines:</strong> {Number(totals.fines ?? 0).toFixed(2)}</p>
                        <p><strong>Total Cash:</strong> {Number(totals.total_cash ?? 0).toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Shares ({shares.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {shares.length === 0 ? <p>No share records.</p> : shares.map((item) => (
                            <p key={item.id}>#{item.id} - {item.member?.name ?? 'N/A'} - {Number(item.amount ?? 0).toFixed(2)}</p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Loans ({loans.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {loans.length === 0 ? <p>No loan records.</p> : loans.map((item) => (
                            <p key={item.id}>#{item.id} - {item.member?.name ?? 'N/A'} - {Number(item.amount ?? 0).toFixed(2)}</p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Welfare ({welfare.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {welfare.length === 0 ? <p>No welfare records.</p> : welfare.map((item) => (
                            <p key={item.id}>#{item.id} - {item.member?.name ?? 'N/A'} - {Number(item.amount ?? 0).toFixed(2)}</p>
                        ))}
                    </CardContent>
                </Card>

                <Button variant="outline" asChild>
                    <Link href={`/meetings/${meeting.id}`}>Back</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
