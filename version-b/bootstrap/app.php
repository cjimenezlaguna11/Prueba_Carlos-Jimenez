<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        if (env('RAILWAY_ENVIRONMENT_ID')) {
            $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_PROTO);
        }
    })
    ->create();
