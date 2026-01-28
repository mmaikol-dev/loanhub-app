<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->date('meeting_date');
            $table->string('venue')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->decimal('total_shares_collected', 10, 2)->default(0);
            $table->decimal('total_welfare_collected', 10, 2)->default(0);
            $table->decimal('total_loan_paid', 10, 2)->default(0);
            $table->decimal('total_loans_issued', 10, 2)->default(0);
            $table->decimal('total_fines', 10, 2)->default(0);
            $table->decimal('bank_balance', 10, 2)->default(0);
            $table->decimal('cash_in_hand', 10, 2)->default(0);
            $table->integer('members_present')->default(0);
            $table->text('agenda')->nullable();
            $table->text('minutes')->nullable();
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};