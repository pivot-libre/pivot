<?php
namespace App\Http\Controllers;

use App\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PivotLibre\Tideman\Agenda;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate;
use PivotLibre\Tideman\CandidateList;
use PivotLibre\Tideman\NBallot;
use PivotLibre\Tideman\RankedPairsCalculator;

class ResultController extends Controller
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
        $this->authorize('update', $election);

        # index candidates (both our representation and tideman representation) by ID
        $pivotCandidates = array();
        $tidemanCandidates = array();
        foreach ($election->candidates as $c) {
            $id = $c["id"];
            $pivotCandidates[$id] = $c;
            $tidemanCandidates[$id] = new Candidate($id, $name = $c["name"]);
        }

        // construct an arbitrary tie-breaking ballot (TODO: do this in a non-arbitrary way)
        $candidateLists = array_map(
            function($c) {return new CandidateList($c);},
            array_values($tidemanCandidates)
        );
        $tieBreaker = new Ballot(...$candidateLists);

        // TODO: populate ballots with actual user rankings
        $ballot = new NBallot(1, ...$candidateLists);
        $ballots = [$ballot];

        // compute election results
        $instance = new RankedPairsCalculator($tieBreaker);
        $winnerOrder = $instance->calculate(sizeof($tidemanCandidates), ...$ballots);

        // format for return (i.e., convert tideman candidates back to pivot candidates)
        $rv = array("order" => array());
        foreach ($winnerOrder as $w) {
            $candidate = $pivotCandidates[$w->getId()];
            array_push($rv["order"], $candidate);
        }
        return $rv;
    }
}
