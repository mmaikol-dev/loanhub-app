<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Member;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class LoanController extends Controller
{
  public function index(): Response
{
    $loans = Loan::with(['member', 'meeting'])
        ->orderBy('loan_date', 'desc')
        ->get()
        ->map(function ($loan) {
            return [
                'id' => $loan->id,
                'member_id' => $loan->member_id,
                'meeting_id' => $loan->meeting_id,
                'loan_amount' => (float) $loan->loan_amount,
                'interest_rate' => (float) $loan->interest_rate,
                'loan_date' => $loan->loan_date->format('Y-m-d'),
                'due_date' => $loan->due_date ? $loan->due_date->format('Y-m-d') : null,
                'status' => $loan->status,
                'purpose' => $loan->purpose,
                'notes' => $loan->notes,
                'balance' => (float) $loan->balance,
                'total_paid' => (float) $loan->total_paid,
                'member' => $loan->member ? [
                    'id' => $loan->member->id,
                    'name' => $loan->member->name,
                    'id_number' => $loan->member->id_number,
                ] : null,
                'meeting' => $loan->meeting ? [
                    'id' => $loan->meeting->id,
                    'meeting_date' => $loan->meeting->meeting_date->format('Y-m-d'),
                    'venue' => $loan->meeting->venue,
                ] : null,
            ];
        });

    // Get members for dropdown
    $members = Member::where('status', 'active')
        ->orderBy('name')
        ->get()
        ->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
            ];
        });

    // Get meetings for dropdown  
    $meetings = Meeting::where('status', '!=', 'cancelled') // Only show non-cancelled meetings
        ->orderBy('meeting_date', 'desc')
        ->get()
        ->map(function ($meeting) {
            return [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue ?? 'N/A',
            ];
        });

    return Inertia::render('Loans/Index', [
        'loans' => $loans,
        'members' => $members,
        'meetings' => $meetings,
        'filters' => [
            'search' => request('search'),
            'status' => request('status'),
        ],
    ]);
}

    public function create(): Response
    {
        $members = Member::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
            
        $meetings = Meeting::whereIn('status', ['scheduled', 'ongoing'])
            ->orderBy('meeting_date', 'desc')
            ->get(['id', 'meeting_date', 'venue']);

        return Inertia::render('Loans/Create', [
            'members' => $members,
            'meetings' => $meetings
        ]);
    }

    public function store(Request $request): RedirectResponse
{
    // Debug: See what's being sent
    \Log::info('Loan creation request data:', $request->all());

    $validated = $request->validate([
        'member_id' => 'required|exists:members,id',
        'meeting_id' => 'nullable|exists:meetings,id',
        'loan_amount' => 'required|numeric|min:0',
        'interest_rate' => 'required|numeric|min:0|max:100',
        'loan_date' => 'required|date',
        'due_date' => 'nullable|date|after:loan_date',
        'status' => 'nullable|in:pending,approved,active,completed,defaulted',
        'purpose' => 'nullable|string',
        'notes' => 'nullable|string',
    ]);

    \Log::info('Validated loan data:', $validated);

    // Remove empty meeting_id
    if (empty($validated['meeting_id'])) {
        unset($validated['meeting_id']);
    }

    // Create the loan
    $loan = Loan::create($validated);

    // Update meeting totals if meeting_id is provided
    if ($loan->meeting_id) {
        $loan->meeting->calculateTotals();
    }

    return redirect()->route('loans.index')
        ->with('success', 'Loan created successfully');
}

    public function show(Loan $loan): Response
    {
        $loan->load(['member', 'meeting']);
        
        return Inertia::render('Loans/Show', [
            'loan' => [
                'id' => $loan->id,
                'member_id' => $loan->member_id,
                'meeting_id' => $loan->meeting_id,
                'loan_amount' => (float) $loan->loan_amount,
                'interest_rate' => (float) $loan->interest_rate,
                'loan_date' => $loan->loan_date->format('Y-m-d'),
                'due_date' => $loan->due_date ? $loan->due_date->format('Y-m-d') : null,
                'status' => $loan->status,
                'purpose' => $loan->purpose,
                'notes' => $loan->notes,
                'balance' => (float) $loan->balance,
                'total_paid' => (float) $loan->total_paid,
                'member' => $loan->member ? [
                    'id' => $loan->member->id,
                    'name' => $loan->member->name,
                    'id_number' => $loan->member->id_number,
                ] : null,
                'meeting' => $loan->meeting ? [
                    'id' => $loan->meeting->id,
                    'meeting_date' => $loan->meeting->meeting_date->format('Y-m-d'),
                    'venue' => $loan->meeting->venue,
                ] : null,
            ]
        ]);
    }

    public function edit(Loan $loan): Response
    {
        $members = Member::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
            
        $meetings = Meeting::orderBy('meeting_date', 'desc')
            ->get(['id', 'meeting_date', 'venue']);

        return Inertia::render('Loans/Edit', [
            'loan' => [
                'id' => $loan->id,
                'member_id' => $loan->member_id,
                'meeting_id' => $loan->meeting_id,
                'loan_amount' => (float) $loan->loan_amount,
                'interest_rate' => (float) $loan->interest_rate,
                'loan_date' => $loan->loan_date->format('Y-m-d'),
                'due_date' => $loan->due_date ? $loan->due_date->format('Y-m-d') : null,
                'status' => $loan->status,
                'purpose' => $loan->purpose,
                'notes' => $loan->notes,
            ],
            'members' => $members,
            'meetings' => $meetings
        ]);
    }

    public function update(Request $request, Loan $loan): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => 'sometimes|required|exists:members,id',
            'meeting_id' => 'nullable|exists:meetings,id',
            'loan_amount' => 'sometimes|required|numeric|min:0',
            'interest_rate' => 'sometimes|required|numeric|min:0|max:100',
            'loan_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date|after:loan_date',
            'status' => 'nullable|in:pending,approved,active,completed,defaulted',
            'purpose' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $loan->update($validated);

        return redirect()->route('loans.show', $loan)
            ->with('success', 'Loan updated successfully');
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        $loan->delete();

        return redirect()->route('loans.index')
            ->with('success', 'Loan deleted successfully');
    }

    public function recordPayment(Request $request, Loan $loan): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if ($validated['amount'] > $loan->balance) {
            return back()->withErrors([
                'amount' => 'Payment amount exceeds loan balance of ' . number_format($loan->balance, 2)
            ]);
        }

        $loan->recordPayment($validated['amount']);

        return redirect()->route('loans.show', $loan)
            ->with('success', 'Payment recorded successfully');
    }

    public function activeLoans(): Response
    {
        $loans = Loan::with(['member', 'meeting'])
            ->whereIn('status', ['approved', 'active'])
            ->orderBy('loan_date', 'desc')
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'member_id' => $loan->member_id,
                    'meeting_id' => $loan->meeting_id,
                    'loan_amount' => (float) $loan->loan_amount,
                    'interest_rate' => (float) $loan->interest_rate,
                    'loan_date' => $loan->loan_date->format('Y-m-d'),
                    'due_date' => $loan->due_date ? $loan->due_date->format('Y-m-d') : null,
                    'status' => $loan->status,
                    'purpose' => $loan->purpose,
                    'notes' => $loan->notes,
                    'balance' => (float) $loan->balance,
                    'total_paid' => (float) $loan->total_paid,
                    'member' => $loan->member ? [
                        'id' => $loan->member->id,
                        'name' => $loan->member->name,
                        'id_number' => $loan->member->id_number,
                    ] : null,
                    'meeting' => $loan->meeting ? [
                        'id' => $loan->meeting->id,
                        'meeting_date' => $loan->meeting->meeting_date->format('Y-m-d'),
                        'venue' => $loan->meeting->venue,
                    ] : null,
                ];
            });

        return Inertia::render('Loans/Active', [
            'loans' => $loans
        ]);
    }
}