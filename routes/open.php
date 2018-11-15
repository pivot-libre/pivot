<?php

use Illuminate\Http\Request;

Route::post('calculateResult', 'BffElectionController@calculateResult')->name('calculateResult');
Route::post('/send_verify_email', 'VerifyController@send_verify_email');
