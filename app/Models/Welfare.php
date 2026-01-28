<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Welfare extends Model
{
    use HasFactory;

    protected $table = 'welfare';

    protected $fillable = [
        'member_id',
        'meeting_id',
        'amount',
        'cumulative_amount',
        'transaction_date',
        'type',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'cumulative_amount' => 'decimal:2',
        'transaction_date' => 'date',
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

    // Boot method to auto-calculate cumulative amount
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($welfare) {
            if ($welfare->type === 'contribution') {
                $previousTotal = Welfare::where('member_id', $welfare->member_id)
                    ->where('type', 'contribution')
                    ->sum('amount');
                $welfare->cumulative_amount = $previousTotal + $welfare->amount;
            }
        });
    }
}