<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get user profile
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
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
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'email', 'phone', 'birth_date']));

        // Log profile update
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'profile_updated',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => ['updated_fields' => array_keys($request->only(['name', 'email', 'phone', 'birth_date']))]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil başarıyla güncellendi',
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
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check current password
        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mevcut şifre yanlış',
                'errors' => ['currentPassword' => ['Mevcut şifre yanlış']]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->newPassword),
            'password_changed_at' => now(),
        ]);

        // Log password change
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'status' => 'success',
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Şifre başarıyla değiştirildi'
        ]);
    }

    /**
     * Get activity logs
     */
    public function activityLogs(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|max:255',
            'status' => 'in:all,success,error,warning,info',
            'dateFrom' => 'date',
            'dateTo' => 'date|after_or_equal:dateFrom',
            'sort_by' => 'in:created_at,action,status',
            'sort_order' => 'in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $dateFrom = $request->get('dateFrom');
        $dateTo = $request->get('dateTo');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $query = $user->activityLogs();

        // Apply filters
        if ($search) {
            $query->where('action', 'like', "%{$search}%");
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    }
}
