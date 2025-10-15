<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    /**
     * Send password reset code
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // Generate 6-digit code
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Store new token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Send email
        try {
            Mail::to($request->email)->send(new PasswordResetMail($token));
            
            // Log password reset request
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'password_reset_requested',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => ['email' => $request->email]
            ]);

            return response()->json([
                'success' => true,
                'message' => '6 haneli kod e-posta adresinize gönderildi (60 saniye geçerli)'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'E-posta gönderilirken hata oluştu'
            ], 500);
        }
    }

    /**
     * Reset password with token
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if token exists and is valid (60 seconds)
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->where('created_at', '>', now()->subMinutes(1))
            ->first();

        if (!$passwordReset) {
            return response()->json([
                'success' => false,
                'message' => 'Geçersiz veya süresi dolmuş kod'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
        ]);

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Log password reset
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_completed',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => ['email' => $request->email]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Şifreniz başarıyla sıfırlandı'
        ]);
    }
}
