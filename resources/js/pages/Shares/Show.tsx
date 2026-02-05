import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Member = { name?: string };
type Meeting = { meeting_date?: string; venue?: string };
type Share = {
    id: number;
    amount: number;
    transaction_date?: string;
    notes?: string | null;
    member?: Member;
    meeting?: Meeting;
};

export default function SharesShow({ share }: { share: Share }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Shares', href: '/shares' },
        { title: `Share #${share.id}`, href: `/shares/${share.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Share #${share.id}`} />
            <div className="p-4">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader><CardTitle>Share #{share.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <p><strong>Member:</strong> {share.member?.name ?? 'N/A'}</p>
                        <p><strong>Meeting:</strong> {(share.meeting?.meeting_date ?? '').slice(0, 10)} {share.meeting?.venue ? `- ${share.meeting.venue}` : ''}</p>
                        <p><strong>Amount:</strong> {Number(share.amount ?? 0).toFixed(2)}</p>
                        <p><strong>Date:</strong> {(share.transaction_date ?? '').slice(0, 10)}</p>
                        <p><strong>Notes:</strong> {share.notes ?? 'N/A'}</p>
                        <div className="flex gap-2 pt-2">
                            <Button asChild><Link href={`/shares/${share.id}/edit`}>Edit</Link></Button>
                            <Button variant="destructive" onClick={() => { if (confirm('Delete this share?')) router.delete(`/shares/${share.id}`); }}>Delete</Button>
                            <Button variant="outline" asChild><Link href="/shares">Back</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
