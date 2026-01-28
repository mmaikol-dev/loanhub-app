<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meeting extends Model
{
    protected $fillable = [
        'meeting_date',
        'venue',
        'start_time',
        'end_time',
        'members_present',
        'agenda',
        'minutes',
        'status',
        'total_shares_collected',
        'total_welfare_collected',
        'total_loan_paid',
        'total_loans_issued',
        'total_fines',
        'bank_balance',
        'cash_in_hand',
    ];

    protected $casts = [
        'meeting_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'total_shares_collected' => 'decimal:2',
        'total_welfare_collected' => 'decimal:2',
        'total_loan_paid' => 'decimal:2',
        'total_loans_issued' => 'decimal:2',
        'total_fines' => 'decimal:2',
        'bank_balance' => 'decimal:2',
        'cash_in_hand' => 'decimal:2',
    ];

    // Relationships
    public function shares(): HasMany
    {
        return $this->hasMany(Share::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function welfare(): HasMany
    {
        return $this->hasMany(Welfare::class);
    }

    // Calculate meeting totals - FIXED VERSION
    public function calculateTotals(): void
    {
        // Use direct database queries instead of relationship methods
        $this->total_shares_collected = Share::where('meeting_id', $this->id)
            ->sum('amount') ?? 0;
        
        $this->total_welfare_collected = Welfare::where('meeting_id', $this->id)
            ->where('type', 'contribution')
            ->sum('amount') ?? 0;
        
        $this->total_fines = Welfare::where('meeting_id', $this->id)
            ->where('type', 'fine')
            ->sum('amount') ?? 0;
        
        $this->total_loans_issued = Loan::where('meeting_id', $this->id)
            ->whereIn('status', ['approved', 'active'])
            ->sum('loan_amount') ?? 0;
        
        $this->save();
    }

    public function getTotalCashAttribute(): float
    {
        return ($this->bank_balance ?? 0) + ($this->cash_in_hand ?? 0);
    }
}