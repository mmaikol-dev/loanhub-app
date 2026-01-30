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
        $meetings = Meeting::withCount(['shares', 'loans', 'welfare'])
            ->orderBy('meeting_date', 'desc')
            ->get();

        return Inertia::render('Meetings/Index', [
            'meetings' => $meetings
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

        $meeting = Meeting::create($validated);

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting created successfully');
    }

    public function show(Meeting $meeting): Response
    {
        $meeting->load(['shares.member', 'loans.member', 'welfare.member']);
        
        return Inertia::render('Meetings/Show', [
            'meeting' => $meeting
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

        return redirect()->route('meetings.show', $meeting)
            ->with('success', 'Meeting updated successfully');
    }

    public function destroy(Meeting $meeting): RedirectResponse
    {
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
                'shares_collected' => $meeting->total_shares_collected,
                'welfare_collected' => $meeting->total_welfare_collected,
                'loans_issued' => $meeting->total_loans_issued,
                'loan_payments' => $meeting->total_loan_paid,
                'fines' => $meeting->total_fines,
                'total_cash' => $meeting->total_cash,
            ]
        ]);
    }

    public function collectionSheet(Meeting $meeting): Response
    {
        $meeting->load([
            'shares' => function ($query) {
                $query->with('member')->orderBy('member_id');
            },
            'loans' => function ($query) {
                $query->with('member')->orderBy('member_id');
            },
            'welfare' => function ($query) {
                $query->with('member')->orderBy('member_id');
            }
        ]);

        // Get all members with their transactions for this meeting
        $members = Member::where('status', 'active')
            ->with([
                'shares' => function ($query) use ($meeting) {
                    $query->where('meeting_id', $meeting->id)
                        ->orderBy('transaction_date', 'desc')
                        ->limit(1);
                },
                'loans' => function ($query) use ($meeting) {
                    $query->where('meeting_id', $meeting->id)
                        ->orderBy('loan_date', 'desc');
                },
                'welfare' => function ($query) use ($meeting) {
                    $query->where('meeting_id', $meeting->id)
                        ->orderBy('transaction_date', 'desc')
                        ->limit(1);
                }
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'well_fare' => $member->welfare->first()?->amount ?? 0,
                    'share' => $member->shares->first()?->amount ?? 0,
                    'cumulative_shares' => $member->total_shares,
                    'loan_paid' => $member->loans->sum('amount_paid') ?? 0,
                    'loan_taken' => $member->loans->sum('loan_amount') ?? 0,
                    'interest' => $member->loans->sum('interest_amount') ?? 0,
                    'balance' => $member->loans->sum('balance') ?? 0,
                ];
            });

        return Inertia::render('Meetings/CollectionSheet', [
            'meeting' => $meeting,
            'members' => $members,
            'summary' => [
                'total_shares' => $meeting->total_shares_collected,
                'total_welfare' => $meeting->total_welfare_collected,
                'total_loans' => $meeting->total_loans_issued,
                'total_fines' => $meeting->total_fines,
            ]
        ]);
    }
}