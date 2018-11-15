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
        <!-- <div class="">&#9747;</div> -->
        <div class=w15>
          <svg viewBox="52.88655090332031 17.921852111816406 240.51344299316406 228.0781478881836" width="240.51344299316406" height="228.0781478881836" xmlns="http://www.w3.org/2000/svg">
            <path d="M 174 19 C 186.687 23.941 190.78 18.09 199.4 20.63 C 207.67 22.75 215.28 26.56 221.29 32.7 C 225.04 36.94 226.07 42.19 225.83 47.71 C 225.48 55.56 228.23 61.52 226.2 69.14 C 224.13 77.01 220.92 85.72 220.07 94.03 C 219.55 99.74 221.22 104.52 221.78 110.12 C 222.82 119.81 221.58 129.13 219.66 138.61 C 218.67 143.56 216.06 148.88 211.95 151.96 C 207.81 154.22 203.54 154.4 200.18 158.18 C 196.85 161.86 192.35 165.95 191 170.84 C 191.68 171.14 192.34 171.49 192.97 171.9 C 198.77 169.67 203.37 165.29 208.85 162.81 C 211.79 161.25 215.02 162.97 217.67 164.33 C 221.9 166.64 224.26 170.22 227.03 173.98 C 231.65 180.24 237.78 183.42 243.22 188.78 C 249.25 194.8 256.01 199.91 261.75 206.24 C 274.09 217.8 284.57 231.62 293.4 246 L 69.2 246 C 68.68 240.79 67.52 236.25 65.66 231.38 C 63.58 225.9 63.37 218.86 59.51 214.48 C 57.42 211.81 54.67 209.45 53.93 205.99 C 52.67 200.55 52.99 194.57 52.97 189 C 53.07 183.68 52.66 178.3 53.08 173 C 53.62 165.91 57.41 160.3 57.01 152.99 C 56.84 148.11 54.76 142.92 56.16 138.25 C 57.46 133.48 59.97 129.15 61.34 124.36 C 63.32 117.51 64.22 110.87 67.3 104.29 C 71.41 95.64 77.35 88.12 81.29 79.31 C 83.07 75.28 85.55 71.78 88.56 68.59 C 94.78 61.93 99.36 54.21 105.22 47.21 C 110.98 39.47 118.84 33.52 127.65 29.67 C 136.9 25.58 145.55 21.57 155.56 19.58 C 161.44 18.45 168.381 16.811 174 19 Z M 136.142 86.201 C 135.984 87.811 135.998 89.406 136.201 90.984 C 138.986 93.885 143.066 95.078 146.972 94.116 C 152.458 90.137 145.824 82.541 140.753 83.359 C 138.958 83.919 137.58 85.025 136.142 86.201 Z M 193.008 102.173 C 188.426 104.751 182.29 107.616 179.579 112.3 C 177.014 116.353 178.964 121.415 181.651 124.852 C 185.089 128.806 189.948 131.572 193.947 134.978 C 198.853 139.111 204.88 142.525 211.419 142.716 C 215.721 142.235 216.144 138.495 216.974 135.023 C 218.845 124.449 219.292 112.41 215.506 102.217 C 214.42 99.564 212.863 95.904 209.705 95.32 C 203.937 95.624 198.068 99.598 193.008 102.173 Z" transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, 0)"/>
          </svg>
       </div>
      </div>
      <div>Home</div>
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
  </div>
  <div id="maincolumn">
    @if (!Auth::guest())
    <div class="w100 bg-color-7 hide-on-printable">
      <div id="statusbar" class="w50 textLeft font20">
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
    <div class="mainheader">Pivot - a better way to decide on things</div>
    <div class="workspace">
      @yield('content')

   </div>
  </div>


  <!-- Scripts -->
  <script src="{{ asset('js/app.js') }}"></script>
  @yield('scripts')

</body>
</html>
