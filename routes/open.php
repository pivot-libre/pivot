<?php

use Illuminate\Http\Request;

Route::post('try', 'BffElectionController@calculateResult')->name('calculateResult');
Route::get('try', 'BffElectionController@form')->name('try');
Route::post('/send_verify_email', 'VerifyController@send_verify_email');
