<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use Carbon\Carbon;
use App\Election;
use App\Elector;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use PivotLibre\Tideman\BffElectionRunner;

class BffElectionController extends BaseController
{
    /**
     * Run a Ranked Pairs election via BFF ballots.
     *
     * @SWG\Post(
     *     tags={"BFF Election Result"},
     *     path="/open/calculateResult",
     *     summary="Run an election using BFF ballots",
     *     operationId="calculateResult",
     *     consumes={"application/x-www-form-urlencoded"},
     *     produces={"text/plain"},
     *     @SWG\Parameter(
     *         name="ballots",
     *         in="formData",
     *         description="One or more BFF ballots, one on each line",
     *         required=true,
     *         type="string"
     *     ),
     *     @SWG\Parameter(
     *         name="tieBreaker",
     *         in="formData",
     *         description="One BFF Ballot for resolving intermediate ties",
     *         required=true,
     *         type="string"
     *     ),
     *     @SWG\Response(response="200", description="Success", @SWG\Schema(
     *             type="string",
     *             description="JSON with a key `result` whose value is a BFF election result"
     *         )),
     *     @SWG\Response(response="400", description="Bad Request")
     * )
     *
     * @return \Illuminate\Http\Response
     */
    public function calculateResult(Request $request, Response $response)
    {
        if (!$request->has('tieBreaker')) {
            abort(400, "tieBreaker is a required parameter");
        } else {
            $tieBreaker = $request->input('tieBreaker');
        }
        if (!$request->has('ballots')) {
            abort(400, "ballots is a required parameter");
        } else {
            $ballots = $request->input('ballots');
        }

        $runner = new BffElectionRunner();
        $runner->setTieBreaker($tieBreaker);
        $result = $runner->run($ballots);
        return $result;
    }

    public function form()
    {
        return view('bff_form');
    }
}
