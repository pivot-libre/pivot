<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\ElectorController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\ResultSnapshotController;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['middleware' => 'auth:api'], function (Router $api) {

    $api->apiResource('elections', ElectionController::class);
    $api->group(['prefix' => 'elections/{election}'], function (Router $api) {
        $api->post('batchvote', [ElectionController::class, 'batchvote'])->name('election.batchvote');
        $api->post('batchvote_view', [ElectionController::class, 'batchvote_view'])->name('election.batchvote_view');
        $api->post('get_ready', [ElectionController::class, 'get_ready'])->name('election.get_ready');
        $api->post('set_ready', [ElectionController::class, 'set_ready'])->name('election.set_ready');
        $api->get('voter_stats', [ElectionController::class, 'voter_stats'])->name('election.voter_stats');
        $api->get('voter_details', [ElectionController::class, 'voter_details'])->name('election.voter_details');
        $api->post('batch_candidates', [ElectionController::class, 'batch_candidates'])->name('election.batch_candidates');
        $api->get('batch_candidates', [ElectionController::class, 'batch_candidates_view'])->name('election.batch_candidates_view');

        $api->apiResource('candidates', CandidateController::class);

        $api->resource('electors', ElectorController::class, ['only' => ['index', 'show', 'destroy']]);
        $api->get('electors_for_self', [ElectorController::class, 'electors_for_self'])->name('elector.electors_for_self');

        // TODO: get rid of result API, using only result-snapshot API
        $api->resource('result', ResultController::class, ['only' => ['index']]);
        $api->resource('result_snapshots', ResultSnapshotController::class, ['only' => ['index', 'store', 'show', 'destroy']]);

        $api->resource('invite', InviteController::class, ['only' => ['index', 'store']]);
    });

    $api->post('/invite/acceptable', [InviteController::class, 'acceptable'])->name('invite.acceptable.get'); // TODO: remove this (use GET instead)
    $api->get('/invite/acceptable', [InviteController::class, 'acceptable'])->name('invite.acceptable');
    $api->post('/invite/accept', [InviteController::class, 'accept'])->name('invite.accept');

    $api->post('/delete_account', [AccountController::class, 'delete_account'])->name('account.delete');
});
