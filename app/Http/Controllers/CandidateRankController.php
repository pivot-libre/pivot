<?php

namespace App\Http\Controllers;

use App\Election;
use App\Elector;
use App\Candidate;
use App\CandidateRank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CandidateRankController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Election $election, Candidate $candidate)
    {
        // TODO: authorize

        return $candidate->ranks;
    }

    public function store(Request $request, Election $election, Candidate $candidate)
    {
        // TODO: send batch of ranks
        
        // TODO: need to authorize?  Or just let it fail when we can't
        // find an elector with the current election ID and user ID?

        $user = Auth::user();
        $elector = Elector::where('election_id', '=', $election->id)->where('user_id', '=', $user->id)->firstOrFail();

        $rank = CandidateRank::firstOrNew(['elector_id' => $elector->id, 'candidate_id' => $candidate->id]);
        $rank->elector_id = $elector->id;
        $rank->candidate_id = $candidate->id;
        $rank->rank = $request->json()->get('rank');
        $rank->save();

        return redirect()->route(
            'election.candidate.rank.show',
            [
                'election' => $election,
                'candidate' => $candidate,
                'rank' => $rank
            ]
        );
    }

    public function show(Election $election, Candidate $candidate, CandidateRank $rank)
    {
        // TODO: authorize

        return $rank;
    }
}
