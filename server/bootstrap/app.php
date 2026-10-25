<?php

use App\Http\Middleware\EnsureRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($exception instanceof ValidationException) {
                return null;
            }

            $status = 500;
            $message = 'An unexpected error occurred.';
            $source = 'serverError';

            if ($exception instanceof AuthenticationException) {
                $status = 401;
                $message = 'You are not authenticated.';
                $source = 'unauthenticated';
            } elseif (
                $exception instanceof AuthorizationException
                || $exception instanceof AccessDeniedHttpException
            ) {
                $status = 403;
                $message = 'You are not authorized to perform this action.';
                $source = 'forbidden';
            } elseif (
                $exception instanceof ModelNotFoundException
                || $exception instanceof NotFoundHttpException
            ) {
                $status = 404;
                $message = 'The requested resource was not found.';
                $source = 'notFound';
            } elseif ($exception instanceof HttpExceptionInterface) {
                $status = max(400, min(599, $exception->getStatusCode()));

                [$message, $source] = match ($status) {
                    401 => ['You are not authenticated.', 'unauthenticated'],
                    403 => ['You are not authorized to perform this action.', 'forbidden'],
                    429 => ['Too many requests. Please try again later.', 'rateLimited'],
                    default => ['The request could not be completed.', 'requestFailed'],
                };
            }

            return response()->json([
                'status' => 'error',
                'message' => $message,
                'source' => $source,
            ], $status);
        });
    })->create();
