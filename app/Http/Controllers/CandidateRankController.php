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

    public function batchvote(Request $request, $election_id)
    {
        $election = Election::where('id', '=', $election_id)->firstOrFail();
        $this->authorize('vote', $election);
        
        $elector = Elector::where('election_id', '=', $election_id)->
                            where('user_id', '=', Auth::user()->id)->firstOrFail();

        $ranks = array();

        // iterate over list of rankings
        foreach($request->json()->get('votes') as $vote) {
            // TODO: check this is a valid candidate?
            $candidate_id = $vote['candidate_id'];
            $rank_num = $vote['rank'];

            $rank = CandidateRank::firstOrNew(['elector_id' => $elector->id, 'candidate_id' => $candidate_id]);
            $rank->elector_id = $elector->id;
            $rank->candidate_id = $candidate_id;
            $rank->rank = $rank_num;
            $rank->save();

            array_push($ranks, $rank);
        }

        return $ranks;
    }

    public function batchvote_view(Request $request, $election_id)
    {
        $election = Election::where('id', '=', $election_id)->firstOrFail();
        $this->authorize('vote', $election);

        $elector = Elector::where('election_id', '=', $election_id)->
                            where('user_id', '=', Auth::user()->id)->firstOrFail();
        return $elector->ranks;
    }
}
