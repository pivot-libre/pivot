@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">
                <div class="panel-heading">Accept Invitation</div>
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="#">
                        {{ csrf_field() }}

                        <div class="alert alert-danger" role="alert">
                            This form does not currently submit. It needs to do an authenticated
                            POST to {{ route('invite.accept') }} with the code in the body.
                        </div>

                        <div class="form-group{{ $errors->has('invite') ? ' has-error' : '' }}">
                            <label for="name" class="col-md-4 control-label">Invite Code (optional)</label>

                            <div class="col-md-6">
                                <input id="name" type="text" class="form-control" name="invite" value="{{ $invite }}" required autofocus>

                                @if ($errors->has('invite'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('invite') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-4">
                                <button type="submit" class="btn btn-primary">
                                    Accept
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
