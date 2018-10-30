@extends('layouts.pivot')

@section('content')
<form class="w75" role="form" method="POST" action="{{ route('password.request') }}">

  @if (session('status'))
      <div class="w100">
          {{ session('status') }}
      </div>
  @endif

  {{ csrf_field() }}

  <div class="table row-spacing1 w100">
    <input type="hidden" name="token" value="{{ $token }}">

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

    @if ($errors->has('password'))
    <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
          <div class="w67 text2">{{ $errors->first('password') }}</div>
        </div>
    </div>
    @endif
    <div class="w100{{ $errors->has('email') ? ' has-error' : '' }}">
        <label for="password" class="w33 label0 textRight">Password</label>

        <div class="w67 textLeft">
            <input id="password" class="w67" type="password" name="password" required>
        </div>
    </div>

    @if ($errors->has('password_confirmation'))
    <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
          <div class="w67 text2">{{ $errors->first('password_confirmation') }}</div>
        </div>
    </div>
    @endif
    <div class="w100{{ $errors->has('password_confirmation') ? ' has-error' : '' }}">
        <label for="password_confirm" class="w33 label0 textRight">Confirm Password</label>

        <div class="w67 textLeft">
            <input id="password_confirm" class="w67" type="password" name="password_confirmation" required>
        </div>
    </div>

    <div class="w100">
      <div></div>
      <div class="textLeft">
        <button type="submit" class="">
          Reset Password
        </button>
      </div>
    </div>
  </div>
</form>
@endsection
