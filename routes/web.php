<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
  return view('myElections');
});

Auth::routes();

Route::get('/profile', 'ProfileController@index');
Route::get('/profile/accept', 'ProfileController@accept');
Route::get('/ballot/{election}', function ($election) {
    return view('ballot', ['election' => $election]);
});
Route::get('/ballotReview/{election}', function ($election) {
    return view('ballotReview', ['election' => $election]);
});
Route::get('/elections', function () {
    return view('elections');
});
Route::get('/create', function () {
    return view('create');
});
Route::get('/myElections', function () {
  return view('myElections');
});
Route::get('/administer/{election}', function ($election) {
    return view('administer', ['election' => $election]);
});
Route::get('/candidates/{election}', function ($election) {
    return view('candidates', ['election' => $election]);
});
Route::get('/electorate/{election}', function ($election) {
    return view('electorate', ['election' => $election]);
});
Route::get('/results/{election}', function ($election) {
    return view('results', ['election' => $election]);
});
Route::get('/verify_email', function () {
  return view('auth/verifyEmail');
})->name('verify_email');
