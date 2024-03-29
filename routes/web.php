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

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;


Auth::routes();

Route::get('/profile', [ProfileController::class, 'index']);
Route::get('/profile/accept', [ProfileController::class, 'accept']);


Route::get('/', function () {
  return view('welcome');
});
// Route::get('/verify_email', function () {
//   return view('auth/verifyEmail');
// })->name('verify_email');


// all routes that require authentication go in here, the user will be redirected to the login page,
// and will then be directed to their initial target once they log in
Route::group(['middleware' => 'auth'], function() {
  // Route::get('string', ['as' => 'user.add_event', 'uses' => 'UserController@addEvent']);
  // // maybe /myElections should be renamed to /elections. /elections is just a blank page currently
  // Route::get('/elections', function () {
  //     return view('elections');
  // });
  Route::get('/myElections', function () {
    return view('myElections');
  });
  Route::get('/ballot/{election}', function ($election) {
      return view('ballot', ['election' => $election]);
  })->name('ballot');
  Route::get('/create', function () {
      return view('create');
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
  Route::get('/ballotReview/{election}', function ($election) {
      return view('ballotReview', ['election' => $election]);
  });
  Route::get('/delete_account', function () {
      return view('deleteAccount');
  });
  Route::get('/debug/{election}', function ($election) {
      return view('debugResults', ['election' => $election]);
  });
});
