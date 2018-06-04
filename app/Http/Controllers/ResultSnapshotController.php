<?php

namespace App\Http\Controllers;

use App\Election;
use App\ResultSnapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResultSnapshotController extends Controller
{
    // bump this whenever we start storing something different in the result_blob
    const SNAPSHOT_FORMAT_VERSION = 2;

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
