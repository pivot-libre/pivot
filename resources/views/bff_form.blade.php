@extends('layouts.pivot')
@section('content')
<div class="tryBff container w100">
    <h1>
        TRY IT!
    </h1>
    <p>This page lets you try out elections on your own without logging in. Since this page is for experts, ballots are entered in a textual format - Ballot File Format. Details on the Ballot File Format are <a href="https://pivot-libre.github.io/bff/">here</a>.
    <p>Want a more user-friendly experience? <a class="clickable1" href="{{ route('login') }}">LOG IN</a></p>
    <form id="tryForm" class="w100">
        <p>Enter ballots, one per line.</label>
        <div class="block">
            <textarea 
                id="ballots"
                name="ballots"
                class="block w100"
                rows="3"
                required
                placeholder="A &gt; B &gt; C&#10;A &gt; B = C&#10;A &gt; C = B"></textarea>
        </div>
        
        <div class="block">
            <p>Enter one tie-breaking ballot.</p>
            <input
                id="tieBreaker"
                name="tieBreaker"
                type="text"
                class="w100"
                required
                placeholder="A &gt; B &gt; C"></input>
        </div>
        
        <div class="block w100">
            <button id="submit" class="centered" type="submit">Submit</button>
        </div>
    </form>
    <div id="result" class="block hidden">
        <p>Result</p>
        <textarea
            id="resultText"
            class="block w100"
            rows="1"
            disabled
            ></textarea>
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ asset('js/try.js') }}"></script>
@endsection
