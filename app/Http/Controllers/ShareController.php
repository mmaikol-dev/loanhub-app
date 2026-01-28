<?php

namespace App\Http\Controllers;

use App\Models\Share;
use App\Models\Member;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ShareController extends Controller
{
    public function index(): Response
{
    $shares = Share::with(['member', 'meeting'])
        ->orderBy('transaction_date', 'desc')
        ->get()
        ->map(function ($share) {
            return [
                'id' => $share->id,
                'member_id' => $share->member_id,
                'meeting_id' => $share->meeting_id,
                'amount' => (float) $share->amount,
                'transaction_date' => $share->transaction_date->format('Y-m-d'),
                'payment_method' => $share->payment_method,
                'reference_number' => $share->reference_number,
                'notes' => $share->notes,
                'member' => $share->member ? [
                    'id' => $share->member->id,
                    'name' => $share->member->name,
                    'id_number' => $share->member->id_number,
                ] : null,
                'meeting' => $share->meeting ? [
                    'id' => $share->meeting->id,
                    'meeting_date' => $share->meeting->meeting_date->format('Y-m-d'),
                    'venue' => $share->meeting->venue,
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

    return Inertia::render('Shares/Index', [
        'shares' => $shares,
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

        return Inertia::render('Shares/Create', [
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
            'notes' => 'nullable|string',
        ]);

        $share = Share::create($validated);

        // Update meeting totals if meeting_id is provided
        if ($share->meeting_id) {
            $share->meeting->calculateTotals();
        }

        return redirect()->route('shares.index')
            ->with('success', 'Share contribution recorded successfully');
    }

    public function show(Share $share): Response
    {
        $share->load(['member', 'meeting']);
        
        return Inertia::render('Shares/Show', [
            'share' => $share
        ]);
    }

    public function edit(Share $share): Response
    {
        $members = Member::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);
            
        $meetings = Meeting::orderBy('meeting_date', 'desc')
            ->get(['id', 'meeting_date', 'venue']);

        return Inertia::render('Shares/Edit', [
            'share' => $share->load(['member', 'meeting']),
            'members' => $members,
            'meetings' => $meetings
        ]);
    }

    public function update(Request $request, Share $share): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => 'sometimes|required|exists:members,id',
            'meeting_id' => 'nullable|exists:meetings,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'transaction_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
        ]);

        $share->update($validated);

        return redirect()->route('shares.index')
            ->with('success', 'Share updated successfully');
    }

    public function destroy(Share $share): RedirectResponse
    {
        $meetingId = $share->meeting_id;
        $share->delete();

        // Recalculate meeting totals if applicable
        if ($meetingId) {
            $meeting = Meeting::find($meetingId);
            $meeting?->calculateTotals();
        }

        return redirect()->route('shares.index')
            ->with('success', 'Share deleted successfully');
    }
}