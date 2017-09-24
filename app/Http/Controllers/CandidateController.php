<?php

namespace App\Http\Controllers;

use App\Election;
use App\Candidate;
use Illuminate\Http\Request;

class CandidateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        $this->authorize('view', $election);

        return $election->candidates;
    }

    public function store(Request $request, Election $election)
    {
        $this->authorize('update', $election);

        $candidate = new Candidate();
        $candidate->name = $request->json()->get('name');
        $candidate->election_id = $election->id;
        $candidate->save();

        return redirect()->route(
            'election.candidate.show',
            [
                'election' => $election,
                'candidate' => $candidate,
            ]
        );
    }

    public function show(Election $election, Candidate $candidate)
    {
        $this->authorize('view', $election);

        return $candidate;
    }

    public function destroy(Election $election, Candidate $candidate)
    {
        $this->authorize('update', $election);

        $candidate->delete();

        return response()->json(new \stdClass());
    }
}
