@extends('layouts.pivot')
@section('content')
<form class="w100 textLeft" method="post" action=
"{{ route('register') }}" onkeypress="return event.keyCode != 13; //prevent form from being submitted on 'Enter' to prevent complicated bugs">
  {{ csrf_field() }}
  <div class="table row-spacing1 w100" id="emailRegistrationGroup">
    @if ($errors->has('email'))
    <div class="w100 textLeft text2">
          {{ $errors->first('email') }}
    </div>
    @endif
    <div class=
    "w100{{ $errors->has('email') ? ' has-error' : '' }}">
      <label for="email" class="w33 label0 textRight">E-Mail
      Address</label>
      <div class="w67 textLeft">
        <input id="email" class="w67" type="email" name="email"
        value="{{ $email }}" required="" autofocus=""
        @if ($isConfirmation)
        readonly
        @endif
        >
      </div>
    </div>
  </div><!-- /email div -->
  <div class="registration_confirmation w100" id="tokenRequestGroup">
    <input id="token" type="hidden" name="token"
    value="{{ $token }}">
    <div class="w100" id="registerStep1">
        <div id="getTokenButton" class="centeredRegistrationButton clickable1 textCenter">
            Begin Registration
        </div>
    </div>
  </div>
  <div id="getTokenInstructions" class="w100 text2 textLeft"></div>
  @if ($isConfirmation)
    @if ($errors->has('name'))
    <div class="w100">
      <div class="w67 textLeft">
        <div class="w67 text2">
          {{ $errors->first('name') }}
        </div>
      </div>
    </div>
    @endif
  <div class="table row-spacing1 w100">
    <div class=
    "w100{{ $errors->has('name') ? ' has-error' : '' }}">
      <label for="name" class="w33 label0 textRight">Name</label>
      <div class="w67 textLeft">
        <input id="name" type="text" class="w67" name="name"
        value="{{ old('name') }}" required="">
      </div>
    </div>
    @if ($errors->has('password'))
    <div class="w100">
      <div class="w67 textLeft">
        <div class="w67 text2">
          {{ $errors->first('password') }}
        </div>
      </div>
    </div>
    @endif
    <div class=
    "w100{{ $errors->has('password') ? ' has-error' : '' }}">
      <label for="password" class=
      "w33 label0 textRight">Password</label>
      <div class="w67 textLeft">
        <input id="password" type="password" class="w67" name=
        "password" required="">
      </div>
    </div>
    <div class="w100">
      <label for="password-confirm" class=
      "w33 label0 textRight">Confirm Password</label>
      <div class="w67 textLeft">
        <input id="password-confirm" type="password" class="w67"
        name="password_confirmation" required="">
      </div>
    </div>
    </div>
    <div class="w100">
        <button type="submit" class="centeredRegistrationButton" >Register</button>
    </div>
    @endif
</form>
@endsection
@section('scripts') 
<!-- <script src="{{ asset('js/dragula/dragula.js') }}"></script> -->
<script src="{{ asset('js/pivotlib.js') }}"></script> 
<!-- <script src="{{ asset('js/pivotWorkspace.js') }}"></script> -->
<script src="{{ asset('js/register.js') }}"></script>
@endsection
