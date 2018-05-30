@extends('layouts.pivot')

@section('content')

<form class="w75 textLeft" role="form" method="POST" action="{{ route('register') }}">
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
            <input id="email" type="email" class="w67" name="email" value="{{ $email }}" required autofocus>

        </div>
    </div>

    @if ($errors->has('token'))
    <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
          <div class="w67 text2">{{ $errors->first('token') }}</div>
        </div>
    </div>
    @endif

    <div class="w100{{ $errors->has('token') ? ' has-error' : '' }}">
        <label for="name" class="w33 label0 textRight">Verification Token</label>

        <div class="w67 textLeft">
            <input id="token" type="text" class="w67" name="token" value="{{ $token }}">

        </div>
    </div>

    <div class="w100">
        <label class="w33 label0 textRight">~or~</label>
        <div class="w67 textLeft">
              <div class="w67 textLeft">
                <div id="getTokenButton" class="clickable1">Get Token</div>
                <!-- <div id="getTokenStatus" class="text3"></div> -->
              </div>
        </div>
    </div>

    <!-- <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
              <div id="getTokenStatus" class="w67 text2"></div>
        </div>
    </div> -->
    <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
              <div id="getTokenInstructions" class="w67 text2"></div>
        </div>
    </div>

    @if ($errors->has('name'))
    <div class="w100">
        <label class="w33 label0 textRight"></label>
        <div class="w67 textLeft">
          <div class="w67 text2">{{ $errors->first('name') }}</div>
        </div>
    </div>
    @endif

    <div class="w100{{ $errors->has('name') ? ' has-error' : '' }}">
        <label for="name" class="w33 label0 textRight">Name</label>

        <div class="w67 textLeft">
            <input id="name" type="text" class="w67" name="name" value="{{ old('name') }}" required>

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
            <input id="password" type="password" class="w67" name="password" required>
        </div>
    </div>

    <div class="w100">
        <label for="password-confirm" class="w33 label0 textRight">Confirm Password</label>

        <div class="w67 textLeft">
            <input id="password-confirm" type="password" class="w67" name="password_confirmation" required>
        </div>
    </div>

    <div class="w100">
      <div></div>
      <div>
          <button type="submit">
              Register
          </button>
      </div>
    </div>
  </div>
</form>

@endsection

@section('scripts')

<!-- <script src="{{ asset('js/dragula/dragula.js') }}"></script> -->
<script src="{{ asset('js/pivotlib.js') }}"></script>
<!-- <script src="{{ asset('js/pivotWorkspace.js') }}"></script> -->
<script src="{{ asset('js/register.js') }}"></script>

@endsection
