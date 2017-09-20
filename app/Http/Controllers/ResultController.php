<?php
namespace App\Http\Controllers;

use App\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PivotLibre\Tideman\Agenda;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate;
use PivotLibre\Tideman\CandidateList;

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

        // TODO: use real votes, not dummy values

        $alice = new Candidate("A", "alice");
        $bob = new Candidate("B", "bob");
        $claire = new Candidate("C", "claire", "hah");

        $ballot1 = new Ballot(
            new CandidateList($alice),
            new CandidateList($bob),
            new CandidateList($claire)
        );
        $ballot2 = new Ballot(
            new CandidateList($bob),
            new CandidateList($alice),
            new CandidateList($claire)
        );

        $instance = new Agenda($ballot1, $ballot2);
        return $instance->getCandidates();
    }
}
