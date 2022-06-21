<?php

use App\Http\Controllers\BffElectionController;
use App\Http\Controllers\VerifyController;
use Illuminate\Support\Facades\Route;

Route::post('try', [BffElectionController::class, 'calculateResult'])->name('calculateResult');
Route::get('try', [BffElectionController::class, 'form'])->name('try');
Route::post('/send_verify_email', [VerifyController::class, 'send_verify_email']);
