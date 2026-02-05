import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    id_number?: string | null;
    address?: string | null;
    join_date: string;
    status: 'active' | 'inactive' | 'suspended';
};

export default function MembersEdit({ member }: { member: Member }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Members', href: '/members' },
        { title: 'Edit', href: `/members/${member.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: member.name ?? '',
        phone: member.phone ?? '',
        email: member.email ?? '',
        id_number: member.id_number ?? '',
        address: member.address ?? '',
        join_date: (member.join_date ?? '').slice(0, 10),
        status: member.status ?? 'active',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Member" />
            <div className="p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle>Edit Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                put(`/members/${member.id}`);
                            }}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="id_number">ID Number</Label>
                                    <Input id="id_number" value={data.id_number} onChange={(e) => setData('id_number', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="join_date">Join Date</Label>
                                    <Input id="join_date" type="date" value={data.join_date} onChange={(e) => setData('join_date', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="h-10 rounded-md border px-3"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as Member['status'])}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <textarea
                                    id="address"
                                    className="min-h-24 rounded-md border px-3 py-2"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>Update Member</Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/members/${member.id}`}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
