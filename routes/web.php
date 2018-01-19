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
    // return view('welcome');
});

Auth::routes();

Route::get('/profile', 'ProfileController@index');
Route::get('/profile/accept', 'ProfileController@accept');
Route::get('test', function () {
  return "Hello";
  // return view('new_account');
});
Route::get('/ballot/{election}', function ($election) {
  return redirectIfNotAuthenticated('ballot', 'login', ['election' => $election]);
    // return view('ballot', ['election' => $election]);
});
Route::get('/ballotReview/{election}', function ($election) {
  return redirectIfNotAuthenticated('ballotReview', 'login', ['election' => $election]);
    // return view('ballotReview', ['election' => $election]);
});
Route::get('/elections', function () {
  return redirectIfNotAuthenticated('elections', 'login');
    // return view('elections');
});
Route::get('/create', function () {
  return redirectIfNotAuthenticated('create', 'login');
    // return view('create');
});
Route::get('/myElections', function () {
  return redirectIfNotAuthenticated('myElections', 'login');
});
Route::get('/administer/{election}', function ($election) {
  return redirectIfNotAuthenticated('administer', 'login', ['election' => $election]);
    // return view('administer', ['election' => $election]);
});
Route::get('/candidates/{election}', function ($election) {
  return redirectIfNotAuthenticated('candidates', 'login', ['election' => $election]);
    // return view('candidates', ['election' => $election]);
});
Route::get('/electorate/{election}', function ($election) {
  return redirectIfNotAuthenticated('electorate', 'login', ['election' => $election]);
    // return view('electorate', ['election' => $election]);
});
Route::get('/results/{election}', function ($election) {
  return redirectIfNotAuthenticated('results', 'login', ['election' => $election]);
    // return view('results', ['election' => $election]);
});

function redirectIfNotAuthenticated($requestedView, $noAuthView, $params = null) {
      $user = Auth::user();
      if (empty($user)) {
          // Session::set('invite', $invite);
          return redirect()->route($noAuthView);
          // return view('login');
      }
      if (null == $params) { return view($requestedView); }
      return view($requestedView, $params);
}
