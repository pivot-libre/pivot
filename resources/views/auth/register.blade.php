@extends('layouts.pivot')

@section('content')

<form class="w75 textLeft" role="form" method="POST" action="{{ route('register') }}">
    {{ csrf_field() }}

    <div class="row1{{ $errors->has('email') ? ' has-error' : '' }}">
        <label for="email" class="w33">E-Mail Address</label>

        <div class="w67">
            <input id="email" type="email" class="w67" name="email" value="{{ $email }}" required>

        </div>
        @if ($errors->has('email'))
          <div class="w33"></div>
          <div class="text2"> {{ $errors->first('email') }} </div>
        @endif
    </div>

    <div class="row1{{ $errors->has('token') ? ' has-error' : '' }}">
        <label for="name" class="w33">Verification Token</label>

        <div class="w67">
            <input id="name" type="text" class="w67" name="token" value="{{ $token }}" autofocus>

        </div>
        @if ($errors->has('token'))
          <div class="w33"></div>
          <div class="text2"> {{ $errors->first('token') }} </div>
        @endif
    </div>
    <div class="row1">
        <label class="w33">~or~</label>
        <div class="w67">
              <div class="w67">
                <div id="getTokenButton" class="button1Item">Get Token</div>
                <div id="getTokenStatus" class="text3"></div>
              </div>
        </div>
    </div>
    <div class="row1">
        <label class="w33"></label>
        <div class="w67">
              <div id="getTokenInstructions" class="w67 text2"></div>
        </div>
    </div>
    <!-- <div class="row1">
        <label class="w33">~or~</label>
        <div class="w67">
              <div class="w67">
                <a class="a1" href="">Get token</a>
              </div>
        </div>
    </div> -->

    <div class="row1{{ $errors->has('name') ? ' has-error' : '' }}">
        <label for="name" class="w33">Name</label>

        <div class="w67">
            <input id="name" type="text" class="w67" name="name" value="{{ old('name') }}" required autofocus>

        </div>
        @if ($errors->has('name'))
          <div class="w33"></div>
          <div class="text2"> {{ $errors->first('name') }} </div>
        @endif
    </div>

    <div class="row1{{ $errors->has('password') ? ' has-error' : '' }}">
        <label for="password" class="w33">Password</label>

        <div class="w67">
            <input id="password" type="password" class="w67" name="password" required>
        </div>
        @if ($errors->has('password'))
          <div class="w33"></div>
          <div class="text2"> {{ $errors->first('password') }} </div>
        @endif
    </div>

    <div class="row1">
        <label for="password-confirm" class="w33">Confirm Password</label>

        <div class="w67">
            <input id="password-confirm" type="password" class="w67" name="password_confirmation" required>
        </div>
    </div>

    <div class="row1">
      <div class="w33"></div>
      <div>
          <button type="submit">
              Register
          </button>
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
