<?php

namespace App\Http\Controllers;

use App\Models\Welfare;
use App\Models\Member;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class WelfareController extends Controller
{
    public function index(): Response
{
    $welfare = Welfare::with(['member', 'meeting'])
        ->orderBy('transaction_date', 'desc')
        ->get()
        ->map(function ($welfare) {
            return [
                'id' => $welfare->id,
                'member_id' => $welfare->member_id,
                'meeting_id' => $welfare->meeting_id,
                'amount' => (float) $welfare->amount,
                'cumulative_amount' => (float) $welfare->cumulative_amount,
                'transaction_date' => $welfare->transaction_date->format('Y-m-d'),
                'type' => $welfare->type,
                'description' => $welfare->description,
                'member' => $welfare->member ? [
                    'id' => $welfare->member->id,
                    'name' => $welfare->member->name,
                    'id_number' => $welfare->member->id_number,
                ] : null,
                'meeting' => $welfare->meeting ? [
                    'id' => $welfare->meeting->id,
                    'meeting_date' => $welfare->meeting->meeting_date->format('Y-m-d'),
                    'venue' => $welfare->meeting->venue,
                ] : null,
            ];
        });

    // Get members for dropdown
    $members = Member::where('status', 'active')
        ->orderBy('name')
        ->get(['id', 'name', 'id_number'])
        ->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'id_number' => $member->id_number,
            ];
        });

    // Get meetings for dropdown
    $meetings = Meeting::orderBy('meeting_date', 'desc')
        ->get(['id', 'meeting_date', 'venue'])
        ->map(function ($meeting) {
            return [
                'id' => $meeting->id,
                'meeting_date' => $meeting->meeting_date->format('Y-m-d'),
                'venue' => $meeting->venue,
            ];
        });

    return Inertia::render('Welfare/Index', [
        'welfare' => $welfare,
        'members' => $members,
        'meetings' => $meetings,
    ]);
}

    public function create(): Response
    {
        $members = Member::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
            
        $meetings = Meeting::whereIn('status', ['scheduled', 'ongoing'])
            ->orderBy('meeting_date', 'desc')
            ->get(['id', 'meeting_date', 'venue']);

        return Inertia::render('Welfare/Create', [
            'members' => $members,
            'meetings' => $meetings
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'meeting_id' => 'nullable|exists:meetings,id',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'type' => 'required|in:contribution,benefit,fine',
            'description' => 'nullable|string',
        ]);

        $welfare = Welfare::create($validated);

        // Update meeting totals if meeting_id is provided
        if ($welfare->meeting_id) {
            $welfare->meeting->calculateTotals();
        }

        return redirect()->route('welfare.index')
            ->with('success', 'Welfare transaction recorded successfully');
    }

    public function show(Welfare $welfare): Response
    {
        $welfare->load(['member', 'meeting']);
        
        return Inertia::render('Welfare/Show', [
            'welfare' => $welfare
        ]);
    }

    public function edit(Welfare $welfare): Response
    {
        $members = Member::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
            
        $meetings = Meeting::orderBy('meeting_date', 'desc')
            ->get(['id', 'meeting_date', 'venue']);

        return Inertia::render('Welfare/Edit', [
            'welfare' => $welfare->load(['member', 'meeting']),
            'members' => $members,
            'meetings' => $meetings
        ]);
    }

    public function update(Request $request, Welfare $welfare): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => 'sometimes|required|exists:members,id',
            'meeting_id' => 'nullable|exists:meetings,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'transaction_date' => 'sometimes|required|date',
            'type' => 'sometimes|required|in:contribution,benefit,fine',
            'description' => 'nullable|string',
        ]);

        $welfare->update($validated);

        return redirect()->route('welfare.index')
            ->with('success', 'Welfare transaction updated successfully');
    }

    public function destroy(Welfare $welfare): RedirectResponse
    {
        $meetingId = $welfare->meeting_id;
        $welfare->delete();

        // Recalculate meeting totals if applicable
        if ($meetingId) {
            $meeting = Meeting::find($meetingId);
            $meeting?->calculateTotals();
        }

        return redirect()->route('welfare.index')
            ->with('success', 'Welfare transaction deleted successfully');
    }
}