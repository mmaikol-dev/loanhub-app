import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Member = { id: number; name: string };
type StatementItem = {
    id: number;
    amount?: number;
    transaction_date?: string;
    loan_date?: string;
    type?: string;
    status?: string;
    balance?: number;
};

type Summary = {
    total_shares: number;
    active_loans: number;
    total_welfare: number;
};

export default function MemberStatement({
    member,
    shares,
    loans,
    welfare,
    summary,
}: {
    member: Member;
    shares: StatementItem[];
    loans: StatementItem[];
    welfare: StatementItem[];
    summary: Summary;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Members', href: '/members' },
        { title: 'Statement', href: `/members/${member.id}/statement` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Statement - ${member.name}`} />
            <div className="space-y-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{member.name} - Statement Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 md:grid-cols-3">
                        <p><strong>Shares:</strong> {Number(summary.total_shares ?? 0).toFixed(2)}</p>
                        <p><strong>Active Loans:</strong> {Number(summary.active_loans ?? 0).toFixed(2)}</p>
                        <p><strong>Welfare:</strong> {Number(summary.total_welfare ?? 0).toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Shares</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {shares.length === 0 ? <p>No share records.</p> : shares.map((item) => (
                            <p key={item.id}>#{item.id} - {Number(item.amount ?? 0).toFixed(2)} - {(item.transaction_date ?? '').slice(0, 10)}</p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Loans</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {loans.length === 0 ? <p>No loan records.</p> : loans.map((item) => (
                            <p key={item.id}>#{item.id} - {Number(item.amount ?? 0).toFixed(2)} - {item.status ?? 'N/A'} - Balance {Number(item.balance ?? 0).toFixed(2)}</p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Welfare</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {welfare.length === 0 ? <p>No welfare records.</p> : welfare.map((item) => (
                            <p key={item.id}>#{item.id} - {Number(item.amount ?? 0).toFixed(2)} - {item.type ?? 'N/A'} - {(item.transaction_date ?? '').slice(0, 10)}</p>
                        ))}
                    </CardContent>
                </Card>

                <Button variant="outline" asChild>
                    <Link href={`/members/${member.id}`}>Back</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
