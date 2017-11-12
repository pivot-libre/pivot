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

Route::resource('election', 'ElectionController', ['except' => ['create', 'edit']]);
Route::post('election/{election_id}/batchvote', 'CandidateRankController@batchvote')->name('election.batchvote');
Route::resource('election.elector', 'ElectorController', [
    'except' => ['create', 'store', 'edit', 'update'],
    'parameters' => ['elector' => 'user'],
]);
Route::resource('election.candidate', 'CandidateController', ['only' => ['index', 'show', 'store', 'destroy']]);
Route::resource('election.candidate.rank', 'CandidateRankController', ['only' => ['index', 'show', 'store']]);
Route::resource('election.result', 'ResultController', ['only' => ['index']]);
Route::resource('election.invite', 'InviteController', ['only' => ['index', 'show', 'store', 'destroy']]);
Route::post('/invite/accept', 'InviteController@accept')->name('invite.accept');
