<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Customer::query();

            // Arama
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('id_number', 'like', "%{$search}%");
                });
            }

            // Durum filtresi
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $customers = $query->with(['reservations' => function($query) {
                $query->where('status', '!=', 'cancelled');
            }])->orderBy('created_at', 'desc')->get();

            // Her müşteri için toplam harcama ve rezervasyon sayısını hesapla
            $customers->each(function($customer) {
                $customer->total_spending = $customer->reservations->sum('total_price');
                $customer->reservations_count = $customer->reservations->count();
            });

            return response()->json([
                'success' => true,
                'data' => $customers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Müşteriler alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'id_number' => 'nullable|string|max:20',
            'id_type' => 'required|in:tc,passport',
            'status' => 'in:active,inactive,banned'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customer = Customer::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'id_number' => $request->id_number,
                'id_type' => $request->id_type,
                'status' => $request->status ?? 'active'
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Müşteri Ekleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => ['customer_id' => $customer->id, 'customer_name' => $customer->name],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Müşteri başarıyla eklendi',
                'data' => $customer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Müşteri eklenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $customer = Customer::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $customer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Müşteri bulunamadı: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email,' . $id,
            'phone' => 'required|string|max:20',
            'id_number' => 'required|string|max:20',
            'id_type' => 'required|in:tc,passport',
            'status' => 'in:active,inactive,banned'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customer = Customer::findOrFail($id);
            $oldData = $customer->toArray();
            
            $customer->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'id_number' => $request->id_number,
                'id_type' => $request->id_type,
                'status' => $request->status ?? $customer->status
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Müşteri Güncelleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'changes' => array_diff_assoc($customer->toArray(), $oldData)
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Müşteri başarıyla güncellendi',
                'data' => $customer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Müşteri güncellenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $customer = Customer::findOrFail($id);
            $customerName = $customer->name;
            
            $customer->delete();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Müşteri Silme',
                'status' => 'success',
                'ip' => request()->ip(),
                'metadata' => ['customer_id' => $id, 'customer_name' => $customerName],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Müşteri başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Müşteri silinirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
}
