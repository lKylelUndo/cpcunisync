<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Services\Auth\DeleteAuthService;
use App\Http\Services\Auth\PostAuthService;
use App\Http\Services\Auth\RegisterUserService;
use App\Http\Services\Auth\ViewAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for authentication endpoints. */
class AuthController extends Controller
{
    public static function login(LoginRequest $request): JsonResponse
    {
        return PostAuthService::PostAuth($request);
    }

    public static function register(RegisterRequest $request): JsonResponse
    {
        return RegisterUserService::RegisterUser($request);
    }

    public static function logout(Request $request): JsonResponse
    {
        return DeleteAuthService::DeleteAuth($request);
    }

    public static function me(Request $request): JsonResponse
    {
        return ViewAuthService::ViewAuth($request);
    }
}
