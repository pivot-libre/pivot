<?php

namespace App\Http\Controllers;

use DummyFullModelClass;
use App\Election;
use Illuminate\Http\Request;

class ElectorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \App\Election  $election
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        return $election->electors;
    }

    /**
     * Show the form for creating a new resource.
     *
     * @param  \App\Election  $election
     * @return \Illuminate\Http\Response
     */
    public function create(Election $election)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Election  $election
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Election $election)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Election  $election
     * @param  \App\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(Election $election, User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Election  $election
     * @param  \App\User  $user
     * @return \Illuminate\Http\Response
     */
    public function edit(Election $election, DummyModelClass $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Election  $election
     * @param  \App\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Election $election, DummyModelClass $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Election  $election
     * @param  \App\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(Election $election, DummyModelClass $user)
    {
        //
    }
}
