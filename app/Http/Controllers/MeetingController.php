<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Share;
use App\Models\Welfare;
use App\Models\Loan;
use App\Models\LoanPayment;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;

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

    /**
     * Display the collection sheet for a specific meeting
     */
 public function collectionSheet(Meeting $meeting, Request $request)
    {
        $collectionSheetData = $this->getCollectionData($meeting)->getData(true);
        
        // If this is an AJAX request for the drawer, return JSON
        if ($request->expectsJson() || $request->header('X-Inertia-Partial-Data') === 'collectionSheetData') {
            return response()->json($collectionSheetData);
        }
        
        // For regular Inertia requests, return to index with the data
        return Inertia::render('Meetings/Index', [
            'meetings' => $this->getMeetingsList($request),
            'filters' => $request->only(['search', 'status']),
            'collectionData' => $collectionSheetData['collectionData'] ?? [],
            'collectionSheetData' => $collectionSheetData,
        ]);
    }

    /**
     * Helper to get meetings list
     */
    private function getMeetingsList(Request $request)
    {
        $query = Meeting::query()
            ->withCount(['shares', 'loans', 'welfare'])
            ->withSum('shares', 'amount')
            ->withSum('welfare', 'amount')
            ->withSum('loans', 'loan_amount')
            ->withSum('loans', 'interest_amount')
            ->withSum(['welfare as fines_total' => function ($query) {
                $query->where('type', 'fine');
            }], 'amount');

        // Apply filters
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('venue', 'like', '%' . $request->search . '%')
                  ->orWhere('agenda', 'like', '%' . $request->search . '%')
                  ->orWhere('meeting_date', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        return $query->orderBy('meeting_date', 'desc')->get()
            ->map(function ($meeting) {
                $totalCash = ($meeting->bank_balance ?? 0) + ($meeting->cash_in_hand ?? 0);
                $totalLoansIssued = ($meeting->loans_sum_loan_amount ?? 0) + ($meeting->loans_sum_interest_amount ?? 0);
                
                return [
                    'id' => $meeting->id,
                    'meeting_date' => $meeting->meeting_date,
                    'venue' => $meeting->venue,
                    'start_time' => $meeting->start_time,
                    'end_time' => $meeting->end_time,
                    'total_shares_collected' => $meeting->shares_sum_amount ?? 0,
                    'total_welfare_collected' => $meeting->welfare_sum_amount ?? 0,
                    'total_loan_paid' => 0,
                    'total_loans_issued' => $totalLoansIssued,
                    'total_fines' => $meeting->fines_total ?? 0,
                    'bank_balance' => $meeting->bank_balance,
                    'cash_in_hand' => $meeting->cash_in_hand,
                    'members_present' => $meeting->members_present,
                    'agenda' => $meeting->agenda,
                    'minutes' => $meeting->minutes,
                    'status' => $meeting->status,
                    'shares_count' => $meeting->shares_count,
                    'loans_count' => $meeting->loans_count,
                    'welfare_count' => $meeting->welfare_count,
                    'total_cash' => $totalCash,
                ];
            });
    }
    /**
     * Alternative: JSON API endpoint for collection data
     */
    public function getCollectionData(Meeting $meeting)
    {
        $members = Member::orderBy('name')->get();

        $collectionData = $members->map(function ($member) use ($meeting) {
            $welfareContribution = Welfare::where('meeting_id', $meeting->id)
                ->where('member_id', $member->id)
                ->where('type', 'contribution')
                ->sum('amount') ?? 0;

            $fines = Welfare::where('meeting_id', $meeting->id)
                ->where('member_id', $member->id)
                ->where('type', 'fine')
                ->sum('amount') ?? 0;

            $shareContribution = Share::where('meeting_id', $meeting->id)
                ->where('member_id', $member->id)
                ->sum('amount') ?? 0;

            $cumulativeShares = Share::where('member_id', $member->id)
                ->whereHas('meeting', function ($query) use ($meeting) {
                    $query->where('meeting_date', '<=', $meeting->meeting_date);
                })
                ->sum('amount') ?? 0;

            $loansTaken = Loan::where('meeting_id', $meeting->id)
                ->where('member_id', $member->id)
                ->whereIn('status', ['approved', 'active'])
                ->get();

            $loanAmount = $loansTaken->sum('loan_amount') ?? 0;
            $interestAmount = $loansTaken->sum('interest_amount') ?? 0;

            // Get loan payments
            $loanPayments = 0;
            
            if (Schema::hasTable('loan_payments')) {
                $loanPayments = LoanPayment::where('member_id', $member->id)
                    ->where('meeting_id', $meeting->id)
                    ->sum('amount') ?? 0;
            } else {
                $loanPayments = Loan::where('member_id', $member->id)
                    ->where('meeting_id', $meeting->id)
                    ->sum('amount_paid') ?? 0;
            }

            $rolledOverAmount = Loan::where('member_id', $member->id)
                ->where('status', 'active')
                ->whereDate('loan_date', '<', $meeting->meeting_date)
                ->sum('balance') ?? 0;

            $newLoanAmount = Loan::where('meeting_id', $meeting->id)
                ->where('member_id', $member->id)
                ->where('status', 'approved')
                ->sum('total_amount') ?? 0;

            return [
                'member' => [
                    'id' => $member->id,
                    'name' => $member->name,
                ],
                'welfare' => (float) $welfareContribution,
                'share' => (float) $shareContribution,
                'loan_paid' => (float) $loanPayments,
                'loan_taken' => (float) $loanAmount,
                'interest' => (float) $interestAmount,
                'rolled_over' => (float) $rolledOverAmount,
                'fines' => (float) $fines,
                'cumulative_shares' => (float) $cumulativeShares,
                'new_loan' => (float) $newLoanAmount,
            ];
        });

        return response()->json([
            'meeting' => $meeting,
            'collectionData' => $collectionData,
            'totals' => [
                'welfare' => $collectionData->sum('welfare'),
                'share' => $collectionData->sum('share'),
                'loan_paid' => $collectionData->sum('loan_paid'),
                'loan_taken' => $collectionData->sum('loan_taken'),
                'interest' => $collectionData->sum('interest'),
                'rolled_over' => $collectionData->sum('rolled_over'),
                'fines' => $collectionData->sum('fines'),
                'new_loan' => $collectionData->sum('new_loan'),
            ]
        ]);
    }
}
