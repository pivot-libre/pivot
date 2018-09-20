<?php

namespace App\Http\Controllers;

use App\Election;
use App\ResultSnapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PivotLibre\Tideman\BallotParser;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate;
use PivotLibre\Tideman\CandidateList;
use App\Util\ResultSnapshotViewConverter;

class ResultSnapshotController extends Controller
{
    // introduce another version whenever the contents of the result blob change
    const VERSION_TEST = 1;
    const VERSION_ADD_RESULTS = 2;
    const VERSION_ADD_DEBUG = 3;
    const VERSION_ADD_ERROR_INFO = 4;
    const VERSION_ADD_ELECTOR_INFO = 5;
    const VERSION_SURFACE_CANDIDATE_TIES = 6;

    // should be the latest version (of above constants)
    const SNAPSHOT_FORMAT_VERSION = self::VERSION_SURFACE_CANDIDATE_TIES;

    public function index(Election $election)
    {
        $this->authorize('view_results', $election);
        $snaps = DB::table('result_snapshots')
               ->select('format_version', 'created_at', 'id')
               ->where('election_id', '=', $election->id)->get();
        return $snaps;
    }

    public function show(Election $election, $snapshot_id)
    {
        $this->authorize('view_results', $election);

        $snapshot = $election->result_snapshots()->whereKey($snapshot_id)->firstOrFail();
        return $snapshot;
    }

    public function print($electionId, $snapshotId)
    {
	$election = Election::where('elections.id', '=', $electionId)->firstOrFail();	
	$this->authorize('view_results', $election);

	$snapshot = $this->show($election, $snapshotId);
        $snapshotTime = $snapshot->getAttribute($snapshot->getCreatedAtColumn());

        $snapshotBlob = $snapshot['result_blob'];
        $partiallyOrderedTieBreakerString = $snapshotBlob['debug']['tie_breaker'];
        $totallyOrderedTieBreakerString = $snapshotBlob['debug']['tie_breaker_total'];
        $candidateIdPairs = $snapshotBlob['debug_private']['candidates'];
	$result = $snapshotBlob['order'];
        
        $converter = new ResultSnapshotViewConverter();
        $electorsAndBallots = $converter->getElectorsAndBallots($snapshotBlob);
        $electorNames = array_map(
            function($pair){
                return $pair['elector']['name'];
            },
            $electorsAndBallots
        );

        $partiallyOrderedTieBreaker = $converter->convertTieBreaker($partiallyOrderedTieBreakerString, $candidateIdPairs);
        $totallyOrderedTieBreaker = $converter->convertTieBreaker($totallyOrderedTieBreakerString, $candidateIdPairs);

        $view = view('printableResults', [
		'election' => $election,
                'snapshotTime' => $snapshotTime,
                'electorNames' => $electorNames,
		'electorsAndBallots' => $electorsAndBallots,
                'partiallyOrderedTieBreaker' => $partiallyOrderedTieBreaker,
                'totallyOrderedTieBreaker' => $totallyOrderedTieBreaker,
                'result' => $result
	]);
	return $view;
    }

    public function store(Request $request, Election $election)
    {
        $this->authorize('update', $election);

        $result = $election->calculateResult();

        # snapshot result
        $snapshot = new ResultSnapshot();
        $snapshot->election_id = $election->id;
        $snapshot->format_version = self::SNAPSHOT_FORMAT_VERSION;
        $snapshot->result_blob = $result;
        $snapshot->save();

        return $snapshot;
    }

    public function destroy(Election $election, $snapshot_id)
    {
        $this->authorize('update', $election);

        $elector = ResultSnapshot::where([
            'election_id' => $election->id,
            'id' => $snapshot_id,
        ])->firstOrFail();

        $elector->delete();
        return response()->json(new \stdClass());
    }
}
