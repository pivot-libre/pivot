@extends('layouts.pivot')

@section('scripts')

<script>var election = "{{$election}}"</script>
<script src="{{ asset('js/alchemy/0.4.2/scripts/vendor.js') }}"></script>
<script src="{{ asset('js/alchemy/0.4.2/alchemy.js') }}"></script>
<script src="{{ asset('js/pivotlib.js') }}"></script>
<script src="{{ asset('js/results1.js') }}"></script>

@endsection
