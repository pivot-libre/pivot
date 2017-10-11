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
    return view('welcome');
});

Auth::routes();

Route::get('/profile', 'ProfileController@index');
Route::get('/profile/accept', 'ProfileController@accept');
Route::get('test', function () {
  return "Hello";
});
Route::get('/ballot', function () {
    return view('ballot');
});
Route::get('/ballotReview', function () {
    return view('ballotReview');
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
Route::get('/administer', function () {
    return view('administer');
});
Route::get('/candidates', function () {
    return view('candidates');
});
Route::get('/electorate', function () {
    return view('electorate');
});
Route::get('/results', function () {
    return view('results');
});
