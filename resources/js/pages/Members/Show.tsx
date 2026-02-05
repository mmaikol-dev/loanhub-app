import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Member = {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    id_number?: string | null;
    address?: string | null;
    join_date?: string;
    status?: string;
    total_shares?: number;
    active_loan_balance?: number;
    total_welfare?: number;
};

export default function MembersShow({ member }: { member: Member }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Members', href: '/members' },
        { title: member.name, href: `/members/${member.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Member - ${member.name}`} />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle>{member.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p><strong>Status:</strong> {member.status ?? 'N/A'}</p>
                        <p><strong>Phone:</strong> {member.phone ?? 'N/A'}</p>
                        <p><strong>Email:</strong> {member.email ?? 'N/A'}</p>
                        <p><strong>ID Number:</strong> {member.id_number ?? 'N/A'}</p>
                        <p><strong>Join Date:</strong> {(member.join_date ?? '').slice(0, 10) || 'N/A'}</p>
                        <p><strong>Address:</strong> {member.address ?? 'N/A'}</p>
                        <hr />
                        <p><strong>Total Shares:</strong> {Number(member.total_shares ?? 0).toFixed(2)}</p>
                        <p><strong>Active Loan Balance:</strong> {Number(member.active_loan_balance ?? 0).toFixed(2)}</p>
                        <p><strong>Total Welfare:</strong> {Number(member.total_welfare ?? 0).toFixed(2)}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button asChild>
                                <Link href={`/members/${member.id}/edit`}>Edit</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/members/${member.id}/statement`}>Statement</Link>
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (confirm('Delete this member?')) {
                                        router.delete(`/members/${member.id}`);
                                    }
                                }}
                            >
                                Delete
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/members">Back</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
