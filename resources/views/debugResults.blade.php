@extends('layouts.pivot')

@section('scripts')

<script>var election = "{{$election}}"</script>
<script src="{{ asset('js/pivotlib.js') }}"></script>
<script src="{{ asset('js/debugResults.js') }}"></script>

@endsection
