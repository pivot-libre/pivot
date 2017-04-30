<?php

namespace App\Http\Controllers;

use App\Item;
use App\Election;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \App\Election  $election
     * @return \Illuminate\Http\Response
     */
    public function index(Election $election)
    {
        //
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
     * @param  \App\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function show(Election $election, Item $item)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Election  $election
     * @param  \App\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function edit(Election $election, Item $item)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Election  $election
     * @param  \App\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Election $election, Item $item)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Election  $election
     * @param  \App\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function destroy(Election $election, Item $item)
    {
        //
    }
}
