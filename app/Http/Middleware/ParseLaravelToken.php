<?php

namespace App\Http\Middleware;

use Closure;
use \Firebase\JWT\JWT;
use Illuminate\Encryption\Encrypter;

class ParseLaravelToken
{
    private $encrypter;

    public function __construct(Encrypter $encrypter) {
        $this->encrypter = $encrypter;
    }

    public function handle($request, Closure $next, $guard = null)
    {
        $encryptedToken = $request->cookie('laravel_token');

        if (!empty($encryptedToken)) {
            $key = $this->encrypter->getKey();
            $token = $this->encrypter->decrypt($encryptedToken);
            $data = JWT::decode($token, $key, ['HS256']);
            if (false === $request->headers->get('x-csrf-token', false)) {
                $request->headers->add([
                    'X-CSRF-TOKEN' => $data->csrf,
                    'X-Requested-With' => 'XMLHttpRequest',
                    'X-XSRF-TOKEN' => $request->cookie('laravel_token'),
                ]);
            }
        }

        return $next($request);
    }
}
