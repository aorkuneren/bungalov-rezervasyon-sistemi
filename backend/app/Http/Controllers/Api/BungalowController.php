<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Bungalow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BungalowController extends Controller
{
    /**
     * Display a listing of bungalows.
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:all,active,inactive,maintenance',
            'sort_by' => 'nullable|in:id,name,capacity,price_per_night,status,created_at',
            'sort_order' => 'nullable|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $perPage = $request->get('per_page', 15);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $query = Bungalow::query();

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        $bungalows = $query->paginate($perPage);

        // Transform data for frontend
        $transformedBungalows = $bungalows->map(function ($bungalow) {
            return [
                'id' => $bungalow->id,
                'name' => $bungalow->name,
                'capacity' => $bungalow->capacity,
                'description' => $bungalow->description,
                'price_per_night' => (int) $bungalow->price_per_night,
                'status' => $bungalow->status,
                'status_display' => $bungalow->status_display,
                'status_badge_variant' => $bungalow->status_badge_variant,
                'reservations_count' => $bungalow->reservations_count,
                'created_at' => $bungalow->created_at,
                'updated_at' => $bungalow->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedBungalows,
            'pagination' => [
                'current_page' => $bungalows->currentPage(),
                'last_page' => $bungalows->lastPage(),
                'per_page' => $bungalows->perPage(),
                'total' => $bungalows->total(),
                'from' => $bungalows->firstItem(),
                'to' => $bungalows->lastItem(),
            ]
        ]);
    }

    /**
     * Store a newly created bungalow.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:bungalows,name',
            'capacity' => 'required|integer|min:1|max:20',
            'description' => 'nullable|string|max:1000',
            'price_per_night' => 'required|numeric|min:0|max:999999.99',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $bungalow = Bungalow::create($request->only([
            'name', 'capacity', 'description', 'price_per_night', 'status'
        ]));

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'bungalow_created',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => [
                'bungalow_id' => $bungalow->id,
                'bungalow_name' => $bungalow->name
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bungalov başarıyla oluşturuldu',
            'bungalow' => [
                'id' => $bungalow->id,
                'name' => $bungalow->name,
                'capacity' => $bungalow->capacity,
                'description' => $bungalow->description,
                'price_per_night' => (int) $bungalow->price_per_night,
                'status' => $bungalow->status,
                'status_display' => $bungalow->status_display,
                'status_badge_variant' => $bungalow->status_badge_variant,
                'created_at' => $bungalow->created_at,
                'updated_at' => $bungalow->updated_at,
            ]
        ], 201);
    }

    /**
     * Display the specified bungalow.
     */
    public function show($id)
    {
        $bungalow = Bungalow::find($id);

        if (!$bungalow) {
            return response()->json([
                'success' => false,
                'message' => 'Bungalov bulunamadı'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'bungalow' => [
                'id' => $bungalow->id,
                'name' => $bungalow->name,
                'capacity' => $bungalow->capacity,
                'description' => $bungalow->description,
                'price_per_night' => (int) $bungalow->price_per_night,
                'status' => $bungalow->status,
                'status_display' => $bungalow->status_display,
                'status_badge_variant' => $bungalow->status_badge_variant,
                'reservations_count' => $bungalow->reservations_count,
                'created_at' => $bungalow->created_at,
                'updated_at' => $bungalow->updated_at,
            ]
        ]);
    }

    /**
     * Update the specified bungalow.
     */
    public function update(Request $request, $id)
    {
        $bungalow = Bungalow::find($id);

        if (!$bungalow) {
            return response()->json([
                'success' => false,
                'message' => 'Bungalov bulunamadı'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:bungalows,name,' . $id,
            'capacity' => 'required|integer|min:1|max:20',
            'description' => 'nullable|string|max:1000',
            'price_per_night' => 'required|numeric|min:0|max:999999.99',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $bungalow->toArray();
        $bungalow->update($request->only([
            'name', 'capacity', 'description', 'price_per_night', 'status'
        ]));

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'bungalow_updated',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => [
                'bungalow_id' => $bungalow->id,
                'bungalow_name' => $bungalow->name,
                'changes' => array_diff_assoc($bungalow->toArray(), $oldData)
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bungalov başarıyla güncellendi',
            'bungalow' => [
                'id' => $bungalow->id,
                'name' => $bungalow->name,
                'capacity' => $bungalow->capacity,
                'description' => $bungalow->description,
                'price_per_night' => (int) $bungalow->price_per_night,
                'status' => $bungalow->status,
                'status_display' => $bungalow->status_display,
                'status_badge_variant' => $bungalow->status_badge_variant,
                'created_at' => $bungalow->created_at,
                'updated_at' => $bungalow->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified bungalow.
     */
    public function destroy(Request $request, $id)
    {
        $bungalow = Bungalow::find($id);

        if (!$bungalow) {
            return response()->json([
                'success' => false,
                'message' => 'Bungalov bulunamadı'
            ], 404);
        }


        $bungalowName = $bungalow->name;
        $bungalow->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'bungalow_deleted',
            'status' => 'success',
            'ip' => $request->ip(),
            'metadata' => [
                'bungalow_name' => $bungalowName
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bungalov başarıyla silindi'
        ]);
    }
}
