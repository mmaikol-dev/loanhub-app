<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MeetingController extends Controller
{
    public function index(): Response
    {
        $meetings = Meeting::with(['shares', 'loans', 'welfare'])
            ->withCount(['shares', 'loans', 'welfare'])
            ->orderBy('meeting_date', 'desc')
            ->get()
            ->map(function ($meeting) {
                // Calculate totals for each meeting
                $meeting->calculateTotals();
                
                return [
                    'id' => $meeting->id,
                    'meeting_date' => $meeting->meeting_date,
                    'venue' => $meeting->venue ?? '',
                    'start_time' => $meeting->start_time,
                    'end_time' => $meeting->end_time,
                    'bank_balance' => (float) ($meeting->bank_balance ?? 0),
                    'cash_in_hand' => (float) ($meeting->cash_in_hand ?? 0),
                    'members_present' => (int) ($meeting->members_present ?? 0),
                    'agenda' => $meeting->agenda,
                    'minutes' => $meeting->minutes,
                    'status' => $meeting->status ?? 'scheduled',
                    'shares_count' => (int) $meeting->shares_count,
                    'loans_count' => (int) $meeting->loans_count,
                    'welfare_count' => (int) $meeting->welfare_count,
                    'total_shares_collected' => (float) ($meeting->total_shares_collected ?? 0),
                    'total_welfare_collected' => (float) ($meeting->total_welfare_collected ?? 0),
                    'total_loans_issued' => (float) ($meeting->total_loans_issued ?? 0),
                    'total_loan_paid' => (float) ($meeting->total_loan_paid ?? 0),
                    'total_fines' => (float) ($meeting->total_fines ?? 0),
                    'total_cash' => (float) ($meeting->total_cash ?? 0),
                ];
            });

        return Inertia::render('Meetings/Index', [
            'meetings' => $meetings,
            'filters' => [
                'search' => request('search', ''),
                'status' => request('status', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Meetings/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'meeting_date' => 'required|date',
            'venue' => 'nullable|string|max:255',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'bank_balance' => 'nullable|numeric|min:0',
            'cash_in_hand' => 'nullable|numeric|min:0',
            'members_present' => 'nullable|integer|min:0',
            'agenda' => 'nullable|string',
            'minutes' => 'nullable|string',
            'status' => 'nullable|in:scheduled,ongoing,completed,cancelled',
        ]);

        // Set defaults for nullable fields
        $validated['venue'] = $validated['venue'] ?? '';
        $validated['bank_balance'] = $validated['bank_balance'] ?? 0;
        $validated['cash_in_hand'] = $validated['cash_in_hand'] ?? 0;
        $validated['members_present'] = $validated['members_present'] ?? 0;
        $validated['status'] = $validated['status'] ?? 'scheduled';

        $meeting = Meeting::create($validated);

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting created successfully');
    }

    public function show(Meeting $meeting): Response
    {
        $meeting->load(['shares.member', 'loans.member', 'welfare.member']);
        $meeting->calculateTotals();
        
        return Inertia::render('Meetings/Show', [
            'meeting' => [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date,
                'venue' => $meeting->venue ?? '',
                'start_time' => $meeting->start_time,
                'end_time' => $meeting->end_time,
                'bank_balance' => (float) ($meeting->bank_balance ?? 0),
                'cash_in_hand' => (float) ($meeting->cash_in_hand ?? 0),
                'members_present' => (int) ($meeting->members_present ?? 0),
                'agenda' => $meeting->agenda,
                'minutes' => $meeting->minutes,
                'status' => $meeting->status ?? 'scheduled',
                'total_shares_collected' => (float) ($meeting->total_shares_collected ?? 0),
                'total_welfare_collected' => (float) ($meeting->total_welfare_collected ?? 0),
                'total_loans_issued' => (float) ($meeting->total_loans_issued ?? 0),
                'total_loan_paid' => (float) ($meeting->total_loan_paid ?? 0),
                'total_fines' => (float) ($meeting->total_fines ?? 0),
                'total_cash' => (float) ($meeting->total_cash ?? 0),
                'shares_count' => $meeting->shares->count(),
                'loans_count' => $meeting->loans->count(),
                'welfare_count' => $meeting->welfare->count(),
            ]
        ]);
    }

    public function edit(Meeting $meeting): Response
    {
        return Inertia::render('Meetings/Edit', [
            'meeting' => $meeting
        ]);
    }

    public function update(Request $request, Meeting $meeting): RedirectResponse
    {
        $validated = $request->validate([
            'meeting_date' => 'sometimes|required|date',
            'venue' => 'nullable|string|max:255',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'bank_balance' => 'nullable|numeric|min:0',
            'cash_in_hand' => 'nullable|numeric|min:0',
            'members_present' => 'nullable|integer|min:0',
            'agenda' => 'nullable|string',
            'minutes' => 'nullable|string',
            'status' => 'nullable|in:scheduled,ongoing,completed,cancelled',
        ]);

        $meeting->update($validated);

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting updated successfully');
    }

    public function destroy(Meeting $meeting): RedirectResponse
    {
        // Delete associated records first
        $meeting->shares()->delete();
        $meeting->loans()->delete();
        $meeting->welfare()->delete();
        
        $meeting->delete();

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting deleted successfully');
    }

    public function summary(Meeting $meeting): Response
    {
        $meeting->calculateTotals();
        $meeting->load(['shares.member', 'loans.member', 'welfare.member']);

        return Inertia::render('Meetings/Summary', [
            'meeting' => $meeting,
            'shares' => $meeting->shares,
            'loans' => $meeting->loans,
            'welfare' => $meeting->welfare,
            'totals' => [
                'shares_collected' => (float) ($meeting->total_shares_collected ?? 0),
                'welfare_collected' => (float) ($meeting->total_welfare_collected ?? 0),
                'loans_issued' => (float) ($meeting->total_loans_issued ?? 0),
                'loan_payments' => (float) ($meeting->total_loan_paid ?? 0),
                'fines' => (float) ($meeting->total_fines ?? 0),
                'total_cash' => (float) ($meeting->total_cash ?? 0),
            ]
        ]);
    }

    public function collectionSheet(Meeting $meeting): Response
    {
        // Calculate meeting totals first
        $meeting->calculateTotals();
        
        // Get all active members with their transactions for this meeting
        $members = Member::where('status', 'active')
            ->with([
                'shares' => function ($query) use ($meeting) {
                    $query->where('meeting_id', $meeting->id);
                },
                'loans' => function ($query) use ($meeting) {
                    $query->where('meeting_id', $meeting->id);
                },
                'welfare' => function ($query) use ($meeting) {
                    $query->where('meeting_id', $meeting->id);
                }
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($member) {
                // Calculate shares for this meeting
                $sharesAmount = $member->shares->sum('amount') ?? 0;
                
                // Calculate welfare for this meeting
                $welfareAmount = $member->welfare->sum('amount') ?? 0;
                
                // Calculate loans for this meeting
                $loansTaken = $member->loans->sum('loan_amount') ?? 0;
                $loansPaid = $member->loans->sum('amount_paid') ?? 0;
                $interestAmount = $member->loans->sum('interest_amount') ?? 0;
                $loanBalance = $member->loans->sum('balance') ?? 0;
                
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'member_number' => $member->member_number ?? '',
                    'well_fare' => (float) $welfareAmount,
                    'share' => (float) $sharesAmount,
                    'cumulative_shares' => (float) ($member->total_shares ?? 0),
                    'loan_paid' => (float) $loansPaid,
                    'loan_taken' => (float) $loansTaken,
                    'interest' => (float) $interestAmount,
                    'balance' => (float) $loanBalance,
                ];
            });

        return Inertia::render('Meetings/CollectionSheet', [
            'meeting' => [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date,
                'venue' => $meeting->venue ?? '',
                'start_time' => $meeting->start_time,
                'end_time' => $meeting->end_time,
                'status' => $meeting->status ?? 'scheduled',
            ],
            'members' => $members,
            'summary' => [
                'total_shares' => (float) ($meeting->total_shares_collected ?? 0),
                'total_welfare' => (float) ($meeting->total_welfare_collected ?? 0),
                'total_loans' => (float) ($meeting->total_loans_issued ?? 0),
                'total_loan_paid' => (float) ($meeting->total_loan_paid ?? 0),
                'total_fines' => (float) ($meeting->total_fines ?? 0),
                'total_cash' => (float) ($meeting->total_cash ?? 0),
            ]
        ]);
    }
}