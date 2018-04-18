<?php

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

    $api->apiResource('elections', 'ElectionController');
    $api->group(['prefix' => 'elections/{election}'], function (Router $api) {
        $api->post('batchvote', 'ElectionController@batchvote')->name('election.batchvote');
        $api->get('batchvote', 'ElectionController@batchvote_view')->name('election.batchvote_view');
        $api->get('get_ready', 'ElectionController@get_ready')->name('election.get_ready');
        $api->post('set_ready', 'ElectionController@set_ready')->name('election.set_ready');
        $api->get('voter_stats', 'ElectionController@voter_stats')->name('election.voter_stats');
        $api->get('voter_details', 'ElectionController@voter_details')->name('election.voter_details');
        $api->post('batch_candidates', 'ElectionController@batch_candidates')->name('election.batch_candidates');
        $api->get('batch_candidates', 'ElectionController@batch_candidates_view')->name('election.batch_candidates_view');

        $api->apiResource('candidates', 'CandidateController');

        $api->resource('electors', 'ElectorController', ['only' => ['index', 'show', 'destroy']]);

        // TODO: get rid of election result, moving call to election controller
        $api->resource('result', 'ResultController', ['only' => ['index']]);

        $api->resource('invite', 'InviteController', ['only' => ['index', 'store']]);
    });

    $api->post('/invite/acceptable', 'InviteController@acceptable')->name('invite.acceptable'); // TODO: remove this (use GET instead)
    $api->get('/invite/acceptable', 'InviteController@acceptable')->name('invite.acceptable');
    $api->post('/invite/accept', 'InviteController@accept')->name('invite.accept');

    $api->post('/delete_account', 'AccountController@delete_account')->name('account.delete');
});
