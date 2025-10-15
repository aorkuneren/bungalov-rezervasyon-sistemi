<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\EkHizmet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EkHizmetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'nullable|in:all,active,inactive',
                'sort_by' => 'nullable|in:id,name,price,created_at',
                'sort_order' => 'nullable|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $query = EkHizmet::query();

            // Status filter
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->inactive();
            }

            // Sorting
            $sortBy = $request->sort_by ?? 'sort_order';
            $sortOrder = $request->sort_order ?? 'asc';
            $query->orderBy($sortBy, $sortOrder);

            $services = $query->get();

            // Transform data
            $transformedServices = $services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => (int) $service->price,
                    'pricing_type' => $service->pricing_type,
                    'pricing_type_display' => $service->pricing_type_display,
                    'is_active' => $service->is_active,
                    'status_display' => $service->status_display,
                    'status_badge_variant' => $service->status_badge_variant,
                    'sort_order' => $service->sort_order,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedServices
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmetler yüklenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0|max:999999',
                'pricing_type' => 'required|in:per_person,per_night,free',
                'is_active' => 'nullable|boolean',
                'sort_order' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $service = EkHizmet::create([
                'name' => $request->name,
                'price' => $request->price,
                'pricing_type' => $request->pricing_type,
                'is_active' => $request->is_active ?? true,
                'sort_order' => $request->sort_order ?? 0,
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'ek_hizmet_created',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'service_id' => $service->id,
                    'service_name' => $service->name
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ek hizmet başarıyla oluşturuldu',
                'data' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => (int) $service->price,
                    'pricing_type' => $service->pricing_type,
                    'pricing_type_display' => $service->pricing_type_display,
                    'is_active' => $service->is_active,
                    'status_display' => $service->status_display,
                    'status_badge_variant' => $service->status_badge_variant,
                    'sort_order' => $service->sort_order,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmet oluşturulurken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $service = EkHizmet::find($id);

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ek hizmet bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => (int) $service->price,
                    'pricing_type' => $service->pricing_type,
                    'pricing_type_display' => $service->pricing_type_display,
                    'is_active' => $service->is_active,
                    'status_display' => $service->status_display,
                    'status_badge_variant' => $service->status_badge_variant,
                    'sort_order' => $service->sort_order,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmet yüklenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0|max:999999',
                'pricing_type' => 'required|in:per_person,per_night,free',
                'is_active' => 'nullable|boolean',
                'sort_order' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $service = EkHizmet::find($id);

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ek hizmet bulunamadı'
                ], 404);
            }

            $service->update([
                'name' => $request->name,
                'price' => $request->price,
                'pricing_type' => $request->pricing_type,
                'is_active' => $request->is_active ?? $service->is_active,
                'sort_order' => $request->sort_order ?? $service->sort_order,
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'ek_hizmet_updated',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'service_id' => $service->id,
                    'service_name' => $service->name
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ek hizmet başarıyla güncellendi',
                'data' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => (int) $service->price,
                    'pricing_type' => $service->pricing_type,
                    'pricing_type_display' => $service->pricing_type_display,
                    'is_active' => $service->is_active,
                    'status_display' => $service->status_display,
                    'status_badge_variant' => $service->status_badge_variant,
                    'sort_order' => $service->sort_order,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmet güncellenirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $service = EkHizmet::find($id);

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ek hizmet bulunamadı'
                ], 404);
            }

            $serviceName = $service->name;
            $service->delete();

            // Log activity
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'ek_hizmet_deleted',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'service_id' => $id,
                    'service_name' => $serviceName
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ek hizmet başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmet silinirken hata oluştu',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
