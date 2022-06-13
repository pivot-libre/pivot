<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use OpenApi\Attributes\MediaType;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use PivotLibre\Tideman\BffElectionRunner;

class BffElectionController extends BaseController
{
    /**
     * Run a Ranked Pairs election via BFF ballots.
     */
    #[Post(
        path: "/open/try",
        operationId: "calculateResult",
        summary: "Run an election using BFF ballots",
        requestBody: new RequestBody(
            content: [
                new MediaType("application/x-www-form-urlencoded"),
            ],
        ),
        tags: ['BFF Election Result'],
        parameters: [
            new Parameter(
                name: "ballots",
                description: "One or more BFF ballots, one on each line",
                in: "query",
                required: true,
                ref: "string",
            ),
            new Parameter(
                name: "tieBreaker",
                description: "One BFF Ballot for resolving intermediate ties",
                in: "query",
                required: true,
                ref: "string",
            ),
        ],
        responses: [
            new Response(
                ref: "string",
                response: 200,
                description: "Success"
            ),
            new Response(
                response: 400,
                description: "Bad Request",
            )
        ]
    )]
    public function calculateResult(Request $request)
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
