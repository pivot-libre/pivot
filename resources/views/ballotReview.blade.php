@extends('layouts.pivot')

@section('scripts')

<script>var election = "{{$election}}"</script>
<!-- <script src="{{ asset('js/dragula/dragula.js') }}"></script> -->
<script src="{{ asset('js/pivotlib.js') }}"></script>
<!-- <script src="{{ asset('js/pivotWorkspace.js') }}"></script> -->
<script src="{{ asset('js/ballotReview.js') }}"></script>

@endsection
