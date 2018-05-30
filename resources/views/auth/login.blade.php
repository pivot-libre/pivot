@extends('layouts.pivot')

@section('content')

<form class="w75" role="form" method="POST" action="{{ route('login') }}">
    {{ csrf_field() }}
  <div class="table row-spacing1 w100">

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

    <div class="w100{{ $errors->has('password') ? ' has-error' : '' }}">
        <label for="password" class="w33 label0 textRight">Password</label>

        <div class="w67 textLeft">
            <input id="password" class="w67" type="password" class="textinput1" name="password" required>
        </div>
    </div>

    <!-- <div class="w100">
        <div></div>
        <label class="label0 textLeft">
            <input type="checkbox" class="checkbox0" name="remember" {{ old('remember') ? 'checked' : '' }}>
            <div class="checkboxUI0"></div>
            <div>Remember Me</div>
        </label>
    </div> -->

    <div class="w100">
      <div></div>
      <div class="textLeft">
          <button type="submit" class="">
              Log in
          </button>

          <a class="a1" href="{{ route('password.request') }}">
              Forgot Your Password?
          </a>
      </div>
    </div>
  </div>
</form>

@endsection

@section('scripts')

<!-- <script src="{{ asset('js/dragula/dragula.js') }}"></script> -->
<script src="{{ asset('js/pivotlib.js') }}"></script>
<!-- <script src="{{ asset('js/pivotWorkspace.js') }}"></script> -->
<script src="{{ asset('js/login.js') }}"></script>

@endsection
