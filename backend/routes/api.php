<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BungalowController;
use App\Http\Controllers\Api\CompanySettingsController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DatabaseBrowserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EkHizmetController;
use App\Http\Controllers\Api\MailConfigController;
use App\Http\Controllers\Api\MailTemplateController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ReservationSettingsController;
use App\Http\Controllers\Api\TermsConditionsController;
use App\Http\Controllers\Api\SystemSettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::get('/sanctum/csrf-cookie', function (Request $request) {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Database browser route (public for development)
Route::get('/database-browser', [DatabaseBrowserController::class, 'getDatabaseData']);

// Public reservation confirmation routes
Route::get('/reservations/confirm/{confirmationCode}', [ReservationController::class, 'getReservationByConfirmationCode']);
Route::post('/reservations/confirm/{confirmationCode}', [ReservationController::class, 'confirmReservation']);
Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

// Public terms and conditions routes
Route::get('/terms-conditions', [TermsConditionsController::class, 'index']);
Route::get('/terms-conditions/{type}', [TermsConditionsController::class, 'show']);

// Public company settings route
Route::get('/company-settings', [CompanySettingsController::class, 'index']);

// Public ek hizmetler route
Route::get('/ek-hizmetler', [EkHizmetController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auto-login', [AuthController::class, 'autoLogin']);
    Route::post('/revoke-remember-token', [AuthController::class, 'revokeRememberToken']);
    
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Reports routes
    Route::get('/reports/general', [ReportsController::class, 'general']);
    Route::get('/reports/yearly', [ReportsController::class, 'yearly']);
    Route::get('/reports/seasonal', [ReportsController::class, 'seasonal']);
    Route::get('/reports/monthly', [ReportsController::class, 'monthly']);
    Route::get('/reports/bungalow-based', [ReportsController::class, 'bungalowBased']);
    Route::get('/reports/customer-based', [ReportsController::class, 'customerBased']);
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'index']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
    Route::get('/profile/activity-logs', [ProfileController::class, 'activityLogs']);
    
    // User info route
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    });
    
    // Bungalow routes
    Route::apiResource('bungalows', BungalowController::class);
    
    // Customer routes
    Route::apiResource('customers', CustomerController::class);
    
    // Reservation routes
    Route::apiResource('reservations', ReservationController::class);
    Route::post('/reservations/{id}/payment', [ReservationController::class, 'addPayment']);
    Route::post('/reservations/{id}/service', [ReservationController::class, 'addService']);
    Route::delete('/reservations/{id}/service', [ReservationController::class, 'removeService']);
    Route::post('/reservations/{id}/delay', [ReservationController::class, 'delay']);
    
           // Company Settings routes
           Route::get('/settings/company', [CompanySettingsController::class, 'index']);
           Route::put('/settings/company', [CompanySettingsController::class, 'update']);
           Route::post('/settings/company/logo', [CompanySettingsController::class, 'uploadLogo']);
           Route::delete('/settings/company/logo', [CompanySettingsController::class, 'removeLogo']);
    
    // Reservation Settings routes
    Route::get('/settings/reservation', [ReservationSettingsController::class, 'index']);
    Route::put('/settings/reservation', [ReservationSettingsController::class, 'update']);
    
    // Ek Hizmetler routes (CRUD operations - protected)
    Route::post('/ek-hizmetler', [EkHizmetController::class, 'store']);
    Route::put('/ek-hizmetler/{ekHizmet}', [EkHizmetController::class, 'update']);
    Route::delete('/ek-hizmetler/{ekHizmet}', [EkHizmetController::class, 'destroy']);
    
    // Mail Config routes
    Route::get('/mail/config', [MailConfigController::class, 'index']);
    Route::put('/mail/config', [MailConfigController::class, 'update']);
    Route::post('/mail/test', [MailConfigController::class, 'sendTestEmail']);
    Route::post('/mail/send-reservation-confirmation', [MailConfigController::class, 'sendReservationConfirmation']);
    
    // Mail Template routes
    Route::get('/mail/templates', [MailTemplateController::class, 'index']);
    Route::get('/mail/templates/{type}', [MailTemplateController::class, 'show']);
    Route::put('/mail/templates/{type}', [MailTemplateController::class, 'update']);
    
    // Terms and Conditions management routes (admin only)
    Route::post('/terms-conditions', [TermsConditionsController::class, 'store']);
    Route::put('/terms-conditions/{type}', [TermsConditionsController::class, 'update']);
    Route::delete('/terms-conditions/{type}', [TermsConditionsController::class, 'destroy']);
    Route::post('/terms-conditions/preview', [TermsConditionsController::class, 'preview']);
    
    // System Settings routes
    Route::get('/system/settings', [SystemSettingsController::class, 'index']);
    Route::put('/system/settings', [SystemSettingsController::class, 'update']);
});
