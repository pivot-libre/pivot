@extends('layouts.pivot')

@section('content')


<form class="form-horizontal" role="form" method="POST" action="{{ route('password.email') }}">

  <div class="table row-spacing1 w100">
    @if (session('status'))
        <div class="w100">
            {{ session('status') }}
        </div>
    @endif

    {{ csrf_field() }}


        @if ($errors->has('email'))
        <div class="w100">
            <label class="w33 label0 textRight"></label>
            <div class="w67 textLeft">
              <div class="w67 text2">{{ $errors->first('email') }}</div>
            </div>
        </div>
        @endif

        <div class="w100{{ $errors->has('email') ? ' has-error' : '' }}">
            <label for="email" class="w33 label0 textRight">E-Mail Address</label>

            <div class="w67 textLeft">
                <input id="email" class="w67" type="email" name="email" value="{{ old('email') }}" required autofocus>
            </div>

        </div>

        <div class="w100">
          <div></div>
          <div class="textLeft">
              <button type="submit" class="">
                  Send Password Reset Link
              </button>
          </div>
        </div>

    </div>
</form>
@endsection
