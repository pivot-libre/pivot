<?php

use Illuminate\Http\Request;

Route::post('calculateResult', 'BffElectionController@calculateResult')->name('calculateResult');
Route::get('bffUI', 'BffElectionController@form')->name('bffUI');
Route::post('/send_verify_email', 'VerifyController@send_verify_email');
