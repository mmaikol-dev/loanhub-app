import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Member = { name?: string };
type Meeting = { meeting_date?: string; venue?: string };
type Welfare = {
    id: number;
    amount: number;
    transaction_date?: string;
    type?: string;
    description?: string | null;
    member?: Member;
    meeting?: Meeting;
};

export default function WelfareShow({ welfare }: { welfare: Welfare }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Welfare', href: '/welfare' },
        { title: `Transaction #${welfare.id}`, href: `/welfare/${welfare.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Welfare #${welfare.id}`} />
            <div className="p-4">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader><CardTitle>Welfare Transaction #{welfare.id}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <p><strong>Member:</strong> {welfare.member?.name ?? 'N/A'}</p>
                        <p><strong>Meeting:</strong> {(welfare.meeting?.meeting_date ?? '').slice(0, 10)} {welfare.meeting?.venue ? `- ${welfare.meeting.venue}` : ''}</p>
                        <p><strong>Amount:</strong> {Number(welfare.amount ?? 0).toFixed(2)}</p>
                        <p><strong>Date:</strong> {(welfare.transaction_date ?? '').slice(0, 10)}</p>
                        <p><strong>Type:</strong> {welfare.type ?? 'N/A'}</p>
                        <p><strong>Description:</strong> {welfare.description ?? 'N/A'}</p>
                        <div className="flex gap-2 pt-2">
                            <Button asChild><Link href={`/welfare/${welfare.id}/edit`}>Edit</Link></Button>
                            <Button variant="destructive" onClick={() => { if (confirm('Delete this transaction?')) router.delete(`/welfare/${welfare.id}`); }}>Delete</Button>
                            <Button variant="outline" asChild><Link href="/welfare">Back</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
