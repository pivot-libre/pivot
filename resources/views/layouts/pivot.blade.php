<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Pivot') }}</title>

    <!-- Styles -->
    <link href="{{ asset('css/pivot.css') }}" rel="stylesheet">
    <link href="{{ asset('css/dragula.css') }}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Alegreya+Sans" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Raleway" rel="stylesheet">

    <!-- Scripts -->
    <!-- Automatically provides/replaces `Promise` if missing or broken. -->
    <script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.js"></script> 

    <script>
        window.Laravel = {!! json_encode([
            'csrfToken' => csrf_token(),
        ]) !!};
    </script>
</head>
<body>
  <div id="leftcolumn" class="hide-on-printable">
    @if (Auth::guest())
    <a href="{{ route('login') }}" class="clickable4">Log in</a>
    <a href="{{ route('register') }}" class="clickable4">Register</a>
    @else

   <a href="/myElections" class="clickable4">
      <div class="w100 textCenter">
        <div class=w15>
          <img src="{{ asset('img/pivot-parrot-dark.svg') }}" alt="Pivot Parrot Logo"/>
        </div>
      </div>
      <div>My Elections</div>
    </a>
    <a href="/create" class="clickable4">
      <div class="w100 textCenter">
        <!-- <div class="">&#9747;</div> -->
        <div class=w15>
          <svg viewBox="1.040000081062317 0 78.76999747753143 102.72999572753906" width="78.76999747753143" height="102.72999572753906" xmlns="http://www.w3.org/2000/svg">
            <path d="M 57.46 0.00 L 58.04 0.00 C 57.51 4.07 60.24 9.16 62.64 12.36 C 66.33 17.11 72.37 21.38 78.56 21.49 C 78.96 22.05 79.38 22.42 79.81 22.59 C 68.24 23.70 58.71 33.27 57.59 44.82 C 57.02 43.60 56.17 43.94 56.38 42.01 C 54.81 31.91 45.25 23.82 35.27 22.59 C 37.93 21.00 42.07 20.89 44.78 18.68 C 48.03 17.00 50.94 14.02 52.99 11.00 C 55.48 7.49 56.11 3.95 57.46 0.00 Z" transform="matrix(1, 0, 0, 1, 0, 0)"/>
            <path d="M 15.44 23.38 L 16.54 23.41 C 17.21 29.61 22.15 35.11 27.98 37.13 C 28.73 37.50 30.77 37.78 30.99 38.68 C 23.79 39.77 17.04 46.14 16.52 53.58 C 14.73 53.90 15.55 52.16 15.02 50.99 C 13.26 44.76 7.41 39.70 1.04 38.68 C 1.23 38.19 1.76 37.81 2.64 37.56 C 9.11 35.91 14.70 30.08 15.44 23.38 Z" transform="matrix(1, 0, 0, 1, 0, 0)"/>
            <path d="M 40.43 36.31 L 40.56 36.57 C 42.05 45.48 45.65 53.47 52.33 59.67 C 58.08 65.02 65.93 68.72 73.80 69.39 C 72.70 70.11 72.73 70.79 71.01 70.67 C 61.33 71.86 52.53 78.08 47.01 86.00 C 43.41 90.98 41.81 96.72 40.61 102.73 C 39.88 101.87 39.85 100.47 39.49 99.41 C 36.79 84.70 23.49 71.76 8.44 70.48 C 8.03 69.94 7.62 69.58 7.19 69.41 C 17.23 68.31 26.83 63.10 32.80 54.89 C 37.23 49.46 38.97 43.05 40.43 36.31 Z" transform="matrix(1, 0, 0, 1, 0, 0)"/>
          </svg>
       </div>
      </div>
      <div>Create Election</div>
    </a>
    @endif
    <div class="reporting">
        <a href="https://github.com/pivot-libre/pivot/issues/new?template=bug_report.md">Report A Bug</a>
        <a href="https://github.com/pivot-libre/pivot/issues/new?template=feature_request.md">Request A Feature</a>
        <a href="https://github.com/pivot-libre/pivot">Contribute To The Code</a>
    </div>
  </div>
  <div id="maincolumn">
    @if (!Auth::guest())
    <div class="w100 bg-color-7 hide-on-printable">
      <div id="statusbar" class="textLeft font20">
        Hi {{ Auth::user()->name }}, welcome to Pivot!
      </div>
      <div class="w25 textRight font20">{{ Auth::user()->name }}</div>
      <div class="w25 textRight">
        <a href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" class="clickable2">Sign Out</a>
        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
            {{ csrf_field() }}
        </form>
      </div>
    </div>
    @endif
    <div class="mainheader" style="font-weight:bold;">Pivot - a better way to decide</div>
    <div class="workspace">
      @yield('content')

   </div>
  </div>


  <!-- Scripts -->
  <script src="{{ asset('js/app.js') }}"></script>
  @yield('scripts')

</body>
</html>
