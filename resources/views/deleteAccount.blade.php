@extends('layouts.pivot')

@section('content')
<!-- <div class="container">
    <h1>Pivot: Preferential Voting Tool - My Elections</h1>
</div> -->

@endsection

@section('scripts')
<script>
    // axios.get('/api/election')
    //      .then(response => {
    //                console.log(response.data);
    //          });
</script>

<!-- <script src="{{ asset('js/dragula/dragula.js') }}"></script> -->
<script src="{{ asset('js/pivotlib.js') }}"></script>
<!-- <script src="{{ asset('js/pivotWorkspace.js') }}"></script> -->
<script src="{{ asset('js/deleteAccount.js') }}"></script>

@endsection
