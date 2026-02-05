<?php
  

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Member;
use App\Models\Loan;
use App\Models\Share;
use App\Models\Welfare;
use App\Models\Meeting;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Features;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\WelfareController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {


Route::get('dashboard', function () {
    // Get total members count
    $totalMembers = Member::where('status', 'active')->count();
    
    // Get total shares collected
    $totalShares = Share::sum('amount') ?? 0;
    
    // Get total welfare contributions
    $totalWelfare = Welfare::where('type', 'contribution')->sum('amount') ?? 0;
    
    // Get total loans issued
    $totalLoansIssued = Loan::whereIn('status', ['approved', 'active', 'completed'])->sum('loan_amount') ?? 0;
    
    // Get active loans balance
    $activeLoansBalance = Loan::whereIn('status', ['approved', 'active'])->sum('balance') ?? 0;
    
    // Get total loan payments collected
    $totalLoanPayments = Loan::sum('amount_paid') ?? 0;
    
    // Get latest meeting financial summary
    $latestMeeting = Meeting::orderBy('meeting_date', 'desc')->first();
    $bankBalance = $latestMeeting->bank_balance ?? 0;
    $cashInHand = $latestMeeting->cash_in_hand ?? 0;
    
    // Recent loans (last 5)
    $recentLoans = Loan::with(['member', 'meeting'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($loan) {
            return [
                'id' => $loan->id,
                'member_name' => $loan->member->name,
                'loan_amount' => (float) $loan->loan_amount,
                'balance' => (float) $loan->balance,
                'status' => $loan->status,
                'loan_date' => $loan->loan_date->format('Y-m-d'),
                'due_date' => $loan->due_date->format('Y-m-d'),
            ];
        });
    
    // Top members by shares (top 5)
    $topMembersByShares = Member::where('status', 'active')
        ->withSum('shares', 'amount')
        ->orderBy('shares_sum_amount', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'total_shares' => (float) ($member->shares_sum_amount ?? 0),
            ];
        });
    
    // Monthly shares trend (last 6 months)
    $monthlyShares = Share::select(
            DB::raw('DATE_FORMAT(transaction_date, "%Y-%m") as month'),
            DB::raw('SUM(amount) as total')
        )
        ->where('transaction_date', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->get()
        ->map(function ($item) {
            return [
                'month' => $item->month,
                'total' => (float) $item->total,
            ];
        });
    
    // Loan status distribution
    $loanStatusDistribution = Loan::select('status', DB::raw('count(*) as count'))
        ->groupBy('status')
        ->get()
        ->map(function ($item) {
            return [
                'status' => $item->status,
                'count' => $item->count,
            ];
        });
    
    // Recent meetings (last 5)
    $recentMeetings = Meeting::orderBy('meeting_date', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($meeting) {
            return [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue,
                'status' => $meeting->status,
                'total_shares_collected' => (float) ($meeting->total_shares_collected ?? 0),
                'total_welfare_collected' => (float) ($meeting->total_welfare_collected ?? 0),
                'total_loans_issued' => (float) ($meeting->total_loans_issued ?? 0),
            ];
        });

    return Inertia::render('dashboard', [
        'stats' => [
            'totalMembers' => $totalMembers,
            'totalShares' => (float) $totalShares,
            'totalWelfare' => (float) $totalWelfare,
            'totalLoansIssued' => (float) $totalLoansIssued,
            'activeLoansBalance' => (float) $activeLoansBalance,
            'totalLoanPayments' => (float) $totalLoanPayments,
            'bankBalance' => (float) $bankBalance,
            'cashInHand' => (float) $cashInHand,
            'totalCash' => (float) ($bankBalance + $cashInHand),
        ],
        'recentLoans' => $recentLoans,
        'topMembersByShares' => $topMembersByShares,
        'monthlyShares' => $monthlyShares,
        'loanStatusDistribution' => $loanStatusDistribution,
        'recentMeetings' => $recentMeetings,
    ]);
})->name('dashboard');

    Route::resource('members', MemberController::class);
Route::get('members/{member}/statement', [MemberController::class, 'statement'])
    ->name('members.statement');

// Shares Routes
Route::resource('shares', ShareController::class);

  
// Complete resource routes for welfare
    Route::resource('welfare', WelfareController::class);


    // Loans Routes
Route::resource('loans', LoanController::class);
  
    // Additional custom routes
    Route::get('/loans/create', [LoanController::class, 'create'])->name('loans.create');
    Route::get('/loans/{loan}/edit', [LoanController::class, 'edit'])->name('loans.edit');
    Route::post('/loans/{loan}/payments', [LoanController::class, 'recordPayment'])->name('loans.record-payment');
    Route::get('/loans/active', [LoanController::class, 'activeLoans'])->name('loans.active');

 // Meeting resource routes (CRUD)
    Route::resource('meetings', MeetingController::class);
    
    // Additional custom routes for meetings
    Route::get('/meetings/{meeting}/summary', [MeetingController::class, 'summary'])
        ->name('meetings.summary');
    
    Route::get('/meetings/{meeting}/collection-sheet', [MeetingController::class, 'collectionSheet'])
    ->name('meetings.collection-sheet');

// Option 2: If you want to keep 'collectionsheet', make sure it's defined
Route::get('/meetings/{meeting}/collectionsheet', [MeetingController::class, 'collectionSheet'])
    ->name('meetings.collectionsheet');

});

require __DIR__.'/settings.php';
