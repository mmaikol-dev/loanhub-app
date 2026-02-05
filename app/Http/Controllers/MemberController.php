<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Share;
use App\Models\Loan;
use App\Models\Welfare;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MemberController extends Controller
{
    public function index(): Response
    {
        $members = Member::with(['shares', 'loans', 'welfare'])
            ->withCount(['shares', 'loans', 'welfare'])
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'phone' => $member->phone,
                    'email' => $member->email,
                    'id_number' => $member->id_number,
                    'join_date' => $member->join_date->format('Y-m-d'),
                    'status' => $member->status,
                    'total_shares' => $member->total_shares,
                    'active_loan_balance' => $member->active_loan_balance,
                    'total_welfare' => $member->total_welfare,
                    'shares_count' => $member->shares_count,
                    'loans_count' => $member->loans_count,
                ];
            });

        return Inertia::render('Members/Index', [
            'members' => $members
        ]);
    }

    public function create(): Response
    {
       return Inertia::render('Members/Create');
    }

    public function store(Request $request): RedirectResponse
{
    $data = $request->all();

    // Convert empty strings to null
    foreach (['email', 'id_number', 'phone', 'address'] as $field) {
        if (empty($data[$field])) {
            $data[$field] = null;
        }
    }

    $validated = validator($data, [
        'name' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'email' => 'nullable|email|unique:members,email',
        'id_number' => 'nullable|string|unique:members,id_number',
        'address' => 'nullable|string',
        'join_date' => 'required|date',
        'status' => 'nullable|in:active,inactive,suspended',
    ])->validate();

    Member::create($validated);

    return redirect()->route('members.index')
        ->with('success', 'Member created successfully');
}


    public function show(Member $member): Response
    {
        $member->load(['shares', 'loans', 'welfare']);
        
        return Inertia::render('Members/Show', [
            'member' => [
                ...$member->toArray(),
                'total_shares' => $member->total_shares,
                'active_loan_balance' => $member->active_loan_balance,
                'total_welfare' => $member->total_welfare,
            ]
        ]);
    }

    public function edit(Member $member): Response
    {
        return Inertia::render('Members/Edit', [
            'member' => $member
        ]);
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:members,email,' . $member->id,
            'id_number' => 'nullable|string|unique:members,id_number,' . $member->id,
            'address' => 'nullable|string',
            'join_date' => 'sometimes|required|date',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        $member->update($validated);

        return redirect()->route('members.show', $member)
            ->with('success', 'Member updated successfully');
    }

    public function destroy(Member $member): RedirectResponse
    {
        $member->delete();

        return redirect()->route('members.index')
            ->with('success', 'Member deleted successfully');
    }

    public function statement(Member $member): Response
    {
        $shares = $member->shares()
            ->with('meeting')
            ->orderBy('transaction_date', 'desc')
            ->get();
            
        $loans = $member->loans()
            ->with('meeting')
            ->orderBy('loan_date', 'desc')
            ->get();
            
        $welfare = $member->welfare()
            ->with('meeting')
            ->orderBy('transaction_date', 'desc')
            ->get();

        return Inertia::render('Members/Statement', [
            'member' => $member,
            'shares' => $shares,
            'loans' => $loans,
            'welfare' => $welfare,
            'summary' => [
                'total_shares' => $member->total_shares,
                'active_loans' => $member->active_loan_balance,
                'total_welfare' => $member->total_welfare,
            ]
        ]);
    }
}
