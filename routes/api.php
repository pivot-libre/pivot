<?php

use Illuminate\Http\Request;

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

Route::resource('election', 'ElectionController', ['only' => ['index', 'store', 'show', 'update', 'destroy']]);
Route::post('election/{election_id}/batchvote', 'ElectionController@batchvote')->name('election.batchvote');
Route::get('election/{election_id}/batchvote', 'ElectionController@batchvote_view')->name('election.batchvote_view');
Route::get('election/{election_id}/get_ready', 'ElectionController@get_ready')->name('election.get_ready');
Route::post('election/{election_id}/set_ready', 'ElectionController@set_ready')->name('election.set_ready');
Route::get('election/{election_id}/voter_stats', 'ElectionController@voter_stats')->name('election.voter_stats');

// TODO: allow update (e.g., to fix typos in candidate name?)
Route::resource('election.candidate', 'CandidateController', ['only' => ['index', 'show', 'store', 'destroy']]);

Route::resource('election.elector', 'ElectorController', ['only' => ['index', 'show', 'destroy'],
    'parameters' => ['elector' => 'user'],
]);

// TODO: get rid of election result, moving call to election controller
Route::resource('election.result', 'ResultController', ['only' => ['index']]);

Route::resource('election.invite', 'InviteController', ['only' => ['index', 'show', 'store', 'destroy']]);
Route::post('/invite/acceptable', 'InviteController@acceptable')->name('invite.acceptable'); // TODO: remove this (use GET instead)
Route::get('/invite/acceptable', 'InviteController@acceptable')->name('invite.acceptable');
Route::post('/invite/accept', 'InviteController@accept')->name('invite.accept');
