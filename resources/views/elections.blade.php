@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Pivot: Preferential Voting Tool</h1>
</div>
                 
@endsection

@section('scripts')
<script>
    axios.get('/api/election')
         .then(response => {
                   console.log(response.data);
             });
</script>
@endsection