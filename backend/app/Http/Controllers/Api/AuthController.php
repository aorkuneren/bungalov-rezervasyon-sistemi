<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'remember_me' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            // Log failed login attempt
            $user = User::where('email', $request->email)->first();
            if ($user) {
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'failed_login',
                    'status' => 'error',
                    'ip' => $request->ip(),
                    'metadata' => ['email' => $request->email]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Geçersiz kimlik bilgileri'
            ], 401);
        }

        $user = Auth::user();
        
        // Update login info
        $user->update([
            'last_login_at' => now(),
            'login_count' => $user->login_count + 1,
        ]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Create remember token if requested
        $rememberToken = null;
        if ($request->remember_me) {
            $rememberToken = Str::random(60);
            $user->update(['remember_token' => $rememberToken]);
        }

        // Log successful login
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => ['remember_me' => $request->remember_me]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Giriş başarılı',
            'token' => $token,
            'remember_token' => $rememberToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'birth_date' => $user->birth_date,
                'last_login_at' => $user->last_login_at,
                'login_count' => $user->login_count,
                'password_changed_at' => $user->password_changed_at,
            ]
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Log logout
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'logout',
            'status' => 'success',
            'ip' => $request->ip(),
        ]);

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Çıkış başarılı'
        ]);
    }

    /**
     * Auto login with remember token
     */
    public function autoLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'remember_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('remember_token', $request->remember_token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Geçersiz remember token'
            ], 401);
        }

        // Update login info
        $user->update([
            'last_login_at' => now(),
            'login_count' => $user->login_count + 1,
        ]);

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log auto login
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => ['auto_login' => true]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Otomatik giriş başarılı',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'birth_date' => $user->birth_date,
                'last_login_at' => $user->last_login_at,
                'login_count' => $user->login_count,
                'password_changed_at' => $user->password_changed_at,
            ]
        ]);
    }

    /**
     * Revoke remember token
     */
    public function revokeRememberToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'remember_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        if ($user->remember_token === $request->remember_token) {
            $user->update(['remember_token' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Remember token iptal edildi'
        ]);
    }
}
