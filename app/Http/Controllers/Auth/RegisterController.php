<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailVerification;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Show the application registration form.
     */
    public function showRegistrationForm(Request $request)
    {
        $email = $request->input('email', '');
        $token = $request->input('token', '');

        $isConfirmation = !empty($token);
        return view('auth.register', ['email' => $email, 'token' => $token, 'isConfirmation' => $isConfirmation]);
    }

    protected function verify_token(array $data)
    {
        if (config('app.debug')) {
            if (empty($data['token'])) {
                // empty tokens are allowed in debug mode, for ease of testing
                return true;
            }
        }

        $verification = EmailVerification::where(['email' => $data['email']])->firstOrFail();
        if ($verification->token == $data['token'])
        {
            return true;
        }

        return false;
    }
    
    /**
     * Get a validator for an incoming registration request.
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     */
    protected function create(array $data)
    {
        if (!$this->verify_token($data))
        {
            redirect()->back()->withErrors('bad token');
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        return $user;
    }
}
