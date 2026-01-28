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
            ->get()
            ->map(function ($meeting) {
                return [
                    'id' => $meeting->id,
                    'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                    'venue' => $meeting->venue,
                    'start_time' => $meeting->start_time ? $meeting->start_time->format('H:i') : null,
                    'end_time' => $meeting->end_time ? $meeting->end_time->format('H:i') : null,
                    'total_shares_collected' => (float) $meeting->total_shares_collected,
                    'total_welfare_collected' => (float) $meeting->total_welfare_collected,
                    'total_loan_paid' => (float) $meeting->total_loan_paid,
                    'total_loans_issued' => (float) $meeting->total_loans_issued,
                    'total_fines' => (float) $meeting->total_fines,
                    'bank_balance' => (float) $meeting->bank_balance,
                    'cash_in_hand' => (float) $meeting->cash_in_hand,
                    'members_present' => $meeting->members_present,
                    'agenda' => $meeting->agenda,
                    'minutes' => $meeting->minutes,
                    'status' => $meeting->status,
                    'shares_count' => $meeting->shares_count,
                    'loans_count' => $meeting->loans_count,
                    'welfare_count' => $meeting->welfare_count,
                    'total_cash' => (float) $meeting->total_cash,
                ];
            });

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

        return redirect()->route('meetings.show', $meeting)
            ->with('success', 'Meeting created successfully');
    }

    public function show(Meeting $meeting): Response
    {
        $meeting->load(['shares.member', 'loans.member', 'welfare.member']);
        
        return Inertia::render('Meetings/Show', [
            'meeting' => [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue,
                'start_time' => $meeting->start_time ? $meeting->start_time->format('H:i') : null,
                'end_time' => $meeting->end_time ? $meeting->end_time->format('H:i') : null,
                'total_shares_collected' => (float) $meeting->total_shares_collected,
                'total_welfare_collected' => (float) $meeting->total_welfare_collected,
                'total_loan_paid' => (float) $meeting->total_loan_paid,
                'total_loans_issued' => (float) $meeting->total_loans_issued,
                'total_fines' => (float) $meeting->total_fines,
                'bank_balance' => (float) $meeting->bank_balance,
                'cash_in_hand' => (float) $meeting->cash_in_hand,
                'members_present' => $meeting->members_present,
                'agenda' => $meeting->agenda,
                'minutes' => $meeting->minutes,
                'status' => $meeting->status,
                'shares' => $meeting->shares->map(function ($share) {
                    return [
                        'id' => $share->id,
                        'amount' => (float) $share->amount,
                        'transaction_date' => $share->transaction_date->format('Y-m-d'),
                        'notes' => $share->notes,
                        'member' => $share->member ? [
                            'id' => $share->member->id,
                            'name' => $share->member->name,
                        ] : null,
                    ];
                }),
                'loans' => $meeting->loans->map(function ($loan) {
                    return [
                        'id' => $loan->id,
                        'loan_amount' => (float) $loan->loan_amount,
                        'interest_rate' => (float) $loan->interest_rate,
                        'loan_date' => $loan->loan_date->format('Y-m-d'),
                        'status' => $loan->status,
                        'member' => $loan->member ? [
                            'id' => $loan->member->id,
                            'name' => $loan->member->name,
                        ] : null,
                    ];
                }),
                'welfare' => $meeting->welfare->map(function ($welfare) {
                    return [
                        'id' => $welfare->id,
                        'amount' => (float) $welfare->amount,
                        'type' => $welfare->type,
                        'transaction_date' => $welfare->transaction_date->format('Y-m-d'),
                        'notes' => $welfare->notes,
                        'member' => $welfare->member ? [
                            'id' => $welfare->member->id,
                            'name' => $welfare->member->name,
                        ] : null,
                    ];
                }),
                'total_cash' => (float) $meeting->total_cash,
            ]
        ]);
    }

    public function edit(Meeting $meeting): Response
    {
        return Inertia::render('Meetings/Edit', [
            'meeting' => [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue,
                'start_time' => $meeting->start_time ? $meeting->start_time->format('H:i') : '',
                'end_time' => $meeting->end_time ? $meeting->end_time->format('H:i') : '',
                'bank_balance' => (float) $meeting->bank_balance,
                'cash_in_hand' => (float) $meeting->cash_in_hand,
                'members_present' => $meeting->members_present,
                'agenda' => $meeting->agenda,
                'minutes' => $meeting->minutes,
                'status' => $meeting->status,
            ]
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
            'meeting' => [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue,
                'status' => $meeting->status,
            ],
            'shares' => $meeting->shares->map(function ($share) {
                return [
                    'id' => $share->id,
                    'amount' => (float) $share->amount,
                    'member' => $share->member ? [
                        'id' => $share->member->id,
                        'name' => $share->member->name,
                    ] : null,
                ];
            }),
            'loans' => $meeting->loans->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'loan_amount' => (float) $loan->loan_amount,
                    'interest_rate' => (float) $loan->interest_rate,
                    'status' => $loan->status,
                    'member' => $loan->member ? [
                        'id' => $loan->member->id,
                        'name' => $loan->member->name,
                    ] : null,
                ];
            }),
            'welfare' => $meeting->welfare->map(function ($welfare) {
                return [
                    'id' => $welfare->id,
                    'amount' => (float) $welfare->amount,
                    'type' => $welfare->type,
                    'member' => $welfare->member ? [
                        'id' => $welfare->member->id,
                        'name' => $welfare->member->name,
                    ] : null,
                ];
            }),
            'totals' => [
                'shares_collected' => (float) $meeting->total_shares_collected,
                'welfare_collected' => (float) $meeting->total_welfare_collected,
                'loans_issued' => (float) $meeting->total_loans_issued,
                'loan_payments' => (float) $meeting->total_loan_paid,
                'fines' => (float) $meeting->total_fines,
                'total_cash' => (float) $meeting->total_cash,
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

        // Get all active members with their transactions for this meeting
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
                    'well_fare' => $member->welfare->first() ? (float) $member->welfare->first()->amount : 0,
                    'share' => $member->shares->first() ? (float) $member->shares->first()->amount : 0,
                    'cumulative_shares' => (float) $member->total_shares,
                    'loan_paid' => (float) ($member->loans->sum('amount_paid') ?? 0),
                    'loan_taken' => (float) ($member->loans->sum('loan_amount') ?? 0),
                    'interest' => (float) ($member->loans->sum('interest_amount') ?? 0),
                    'balance' => (float) ($member->loans->sum('balance') ?? 0),
                ];
            });

        return Inertia::render('Meetings/CollectionSheet', [
            'meeting' => [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue,
            ],
            'members' => $members,
            'summary' => [
                'total_shares' => (float) $meeting->total_shares_collected,
                'total_welfare' => (float) $meeting->total_welfare_collected,
                'total_loans' => (float) $meeting->total_loans_issued,
                'total_fines' => (float) $meeting->total_fines,
            ]
        ]);
    }
}