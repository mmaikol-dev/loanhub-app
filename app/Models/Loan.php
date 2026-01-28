<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'member_id',
        'meeting_id',
        'loan_amount',
        'interest_rate',
        'interest_amount',
        'total_amount',
        'amount_paid',
        'balance',
        'loan_date',
        'due_date',
        'status',
        'purpose',
        'notes',
    ];

    protected $casts = [
        'loan_amount' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'interest_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'loan_date' => 'date',
        'due_date' => 'date',
    ];

    // Set default attributes
    protected $attributes = [
        'amount_paid' => 0,
        'status' => 'pending',
    ];

    // Relationships
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }

    // Accessor for total_paid (to match your controller)
    public function getTotalPaidAttribute(): float
    {
        return $this->amount_paid ?? 0;
    }

    // Boot method to calculate interest and totals
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($loan) {
            // Ensure amount_paid has a default value
            if (!isset($loan->amount_paid) || $loan->amount_paid === null) {
                $loan->amount_paid = 0;
            }

            // Calculate interest amount
            if (!isset($loan->interest_amount) || $loan->interest_amount === null) {
                $loan->interest_amount = ($loan->loan_amount * $loan->interest_rate) / 100;
            }

            // Calculate total amount
            if (!isset($loan->total_amount) || $loan->total_amount === null) {
                $loan->total_amount = $loan->loan_amount + $loan->interest_amount;
            }

            // Calculate balance
            $loan->balance = $loan->total_amount - $loan->amount_paid;

            // Set default status if not provided
            if (!isset($loan->status) || $loan->status === null) {
                $loan->status = 'pending';
            }
        });

        static::updating(function ($loan) {
            // Recalculate interest and total if loan amount or rate changed
            if ($loan->isDirty(['loan_amount', 'interest_rate'])) {
                $loan->interest_amount = ($loan->loan_amount * $loan->interest_rate) / 100;
                $loan->total_amount = $loan->loan_amount + $loan->interest_amount;
            }

            // Recalculate balance
            $loan->balance = $loan->total_amount - ($loan->amount_paid ?? 0);
            
            // Update status based on balance
            if ($loan->balance <= 0 && $loan->status !== 'completed') {
                $loan->status = 'completed';
            } elseif ($loan->balance > 0 && $loan->status === 'completed') {
                $loan->status = 'active';
            }
        });
    }

    // Helper method to record payment
    public function recordPayment(float $amount): void
    {
        $this->amount_paid = ($this->amount_paid ?? 0) + $amount;
        $this->balance = $this->total_amount - $this->amount_paid;
        
        if ($this->balance <= 0) {
            $this->status = 'completed';
            $this->balance = 0; // Don't allow negative balance
        }
        
        $this->save();
    }
}