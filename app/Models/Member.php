<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'id_number',
        'address',
        'join_date',
        'status',
    ];

    protected $casts = [
        'join_date' => 'date',
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

    // Computed attributes
    public function getTotalSharesAttribute(): float
    {
        return $this->shares()->sum('amount');
    }

    public function getTotalLoansAttribute(): float
    {
        return $this->loans()->where('status', '!=', 'completed')->sum('balance');
    }

    public function getTotalWelfareAttribute(): float
    {
        return $this->welfare()->where('type', 'contribution')->sum('amount');
    }

    public function getActiveLoanBalanceAttribute(): float
    {
        return $this->loans()
            ->whereIn('status', ['approved', 'active'])
            ->sum('balance');
    }
}