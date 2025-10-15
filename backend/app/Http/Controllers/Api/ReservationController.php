<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Reservation::with(['customer', 'bungalow']);

            // Arama
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('reservation_code', 'like', "%{$search}%")
                      ->orWhereHas('customer', function ($customerQuery) use ($search) {
                          $customerQuery->where('name', 'like', "%{$search}%")
                                       ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('bungalow', function ($bungalowQuery) use ($search) {
                          $bungalowQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }

            // Durum filtresi
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Bungalov filtresi
            if ($request->has('bungalow_id') && $request->bungalow_id !== 'all') {
                $query->where('bungalow_id', $request->bungalow_id);
            }

            // Müşteri filtresi
            if ($request->has('customer_id') && $request->customer_id) {
                $query->where('customer_id', $request->customer_id);
            }

            $reservations = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $reservations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyonlar alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'bungalow_id' => 'required|exists:bungalows,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'number_of_guests' => 'required|integer|min:1|max:20',
            'total_price' => 'required|numeric|min:0',
            'status' => 'in:pending,confirmed,checked_in,completed,cancelled',
            'payment_status' => 'in:unpaid,partial,paid,refunded',
            'payment_amount' => 'numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reservation = Reservation::create([
                'reservation_code' => Reservation::generateReservationCode(),
                'customer_id' => $request->customer_id,
                'bungalow_id' => $request->bungalow_id,
                'check_in_date' => $request->check_in_date,
                'check_out_date' => $request->check_out_date,
                'number_of_guests' => $request->number_of_guests,
                'total_price' => $request->total_price,
                'status' => $request->status ?? 'pending',
                'payment_status' => $request->payment_status ?? 'unpaid',
                'payment_amount' => $request->payment_amount ?? 0,
                'remaining_amount' => $request->total_price - ($request->payment_amount ?? 0),
                'notes' => $request->notes,
                'confirmation_code' => Reservation::generateConfirmationCode(),
                'confirmation_expires_at' => now()->addHours($request->confirmation_hours ?? 24)
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Rezervasyon Ekleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'reservation_id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'customer_id' => $reservation->customer_id
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon başarıyla eklendi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon eklenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $reservation = Reservation::with(['customer', 'bungalow'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $reservation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon bulunamadı: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'nullable|exists:customers,id',
            'bungalow_id' => 'nullable|exists:bungalows,id',
            'check_in_date' => 'nullable|date',
            'check_out_date' => 'nullable|date|after:check_in_date',
            'number_of_guests' => 'nullable|integer|min:1|max:20',
            'total_price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,confirmed,checked_in,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,partial,paid,refunded',
            'payment_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reservation = Reservation::findOrFail($id);
            $oldData = $reservation->toArray();
            
            // Sadece gönderilen alanları güncelle
            $updateData = [];
            
            if ($request->has('customer_id')) {
                $updateData['customer_id'] = $request->customer_id;
            }
            if ($request->has('bungalow_id')) {
                $updateData['bungalow_id'] = $request->bungalow_id;
            }
            if ($request->has('check_in_date')) {
                $updateData['check_in_date'] = $request->check_in_date;
            }
            if ($request->has('check_out_date')) {
                $updateData['check_out_date'] = $request->check_out_date;
            }
            if ($request->has('number_of_guests')) {
                $updateData['number_of_guests'] = $request->number_of_guests;
            }
            if ($request->has('total_price')) {
                $updateData['total_price'] = $request->total_price;
            }
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            if ($request->has('payment_status')) {
                $updateData['payment_status'] = $request->payment_status;
            }
            if ($request->has('payment_amount')) {
                $updateData['payment_amount'] = $request->payment_amount;
            }
            if ($request->has('notes')) {
                $updateData['notes'] = $request->notes;
            }
            
            // Remaining amount'u hesapla
            if (isset($updateData['total_price']) || isset($updateData['payment_amount'])) {
                $totalPrice = $updateData['total_price'] ?? $reservation->total_price;
                $paymentAmount = $updateData['payment_amount'] ?? $reservation->payment_amount;
                $updateData['remaining_amount'] = $totalPrice - $paymentAmount;
            }
            
            $reservation->update($updateData);

            // Değişiklikleri hesapla
            $changes = [];
            foreach ($updateData as $key => $value) {
                if (isset($oldData[$key]) && $oldData[$key] != $value) {
                    $changes[$key] = [
                        'old' => $oldData[$key],
                        'new' => $value
                    ];
                }
            }

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Rezervasyon Güncelleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'reservation_id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'changes' => $changes
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon başarıyla güncellendi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon güncellenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $reservationCode = $reservation->reservation_code;
            $customerId = $reservation->customer_id;
            
            $reservation->delete();

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Rezervasyon Silme',
                'status' => 'success',
                'ip' => request()->ip(),
                'metadata' => [
                    'reservation_id' => $id,
                    'reservation_code' => $reservationCode,
                    'customer_id' => $customerId
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon silinirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add payment to reservation
     */
    public function addPayment(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,transfer,other',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reservation = Reservation::findOrFail($id);
            
            // Mevcut ödeme tutarını al
            $currentPaymentAmount = $reservation->payment_amount ?? 0;
            $newPaymentAmount = $currentPaymentAmount + $request->amount;
            
            // Yeni ödeme tutarı toplam tutardan fazla olamaz
            if ($newPaymentAmount > $reservation->total_price) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ödeme tutarı toplam tutardan fazla olamaz'
                ], 400);
            }

            // Payment history'ye ekle (eğer payment_history alanı varsa)
            $paymentHistory = $reservation->payment_history ?? [];
            $paymentHistory[] = [
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes,
                'created_by' => auth()->user()->name ?? 'Sistem',
                'created_at' => now()->toISOString()
            ];

            // Rezervasyonu güncelle
            $reservation->update([
                'payment_amount' => $newPaymentAmount,
                'payment_history' => $paymentHistory,
                'remaining_amount' => $reservation->total_price - $newPaymentAmount,
                'payment_status' => $newPaymentAmount >= $reservation->total_price ? 'paid' : 
                                  ($newPaymentAmount > 0 ? 'partial' : 'unpaid')
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Rezervasyona Ödeme Ekleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'reservation_id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'payment_amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'total_payment' => $newPaymentAmount
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ödeme başarıyla eklendi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ödeme eklenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add service to reservation
     */
    public function addService(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:ek_hizmets,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reservation = Reservation::findOrFail($id);
            $service = \App\Models\EkHizmet::findOrFail($request->service_id);
            
            // Hizmet fiyatını hesapla
            $servicePrice = $service->pricing_type === 'per_person' 
                ? $service->price * $request->quantity 
                : $service->price;
            
            // Mevcut ek hizmetleri al
            $extraServices = $reservation->extra_services ?? [];
            
            // Yeni hizmeti ekle
            $extraServices[] = [
                'service_id' => $service->id,
                'service_name' => $service->name,
                'service_type' => $service->pricing_type,
                'quantity' => $request->quantity,
                'unit_price' => $service->price,
                'total_amount' => $servicePrice,
                'notes' => $request->notes,
                'added_by' => auth()->user()->name ?? 'Sistem',
                'added_at' => now()->toISOString()
            ];
            
            // Toplam tutarı hesapla
            $newTotalPrice = $reservation->total_price + $servicePrice;
            $newRemainingAmount = $newTotalPrice - ($reservation->payment_amount ?? 0);
            
            // Rezervasyonu güncelle
            $reservation->update([
                'extra_services' => $extraServices,
                'total_price' => $newTotalPrice,
                'remaining_amount' => $newRemainingAmount
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Rezervasyona Ek Hizmet Ekleme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'reservation_id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'service_id' => $service->id,
                    'service_name' => $service->name,
                    'quantity' => $request->quantity,
                    'service_price' => $servicePrice,
                    'new_total_price' => $newTotalPrice
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ek hizmet başarıyla eklendi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmet eklenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove service from reservation
     */
    public function removeService(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'service_index' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reservation = Reservation::findOrFail($id);
            $extraServices = $reservation->extra_services ?? [];
            
            // Hizmet index'ini kontrol et
            if (!isset($extraServices[$request->service_index])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hizmet bulunamadı'
                ], 404);
            }
            
            // Silinecek hizmetin tutarını al
            $removedService = $extraServices[$request->service_index];
            $removedAmount = $removedService['total_amount'];
            
            // Hizmeti diziden çıkar
            array_splice($extraServices, $request->service_index, 1);
            
            // Toplam tutarı hesapla
            $newTotalPrice = $reservation->total_price - $removedAmount;
            $newRemainingAmount = $newTotalPrice - ($reservation->payment_amount ?? 0);
            
            // Rezervasyonu güncelle
            $reservation->update([
                'extra_services' => $extraServices,
                'total_price' => $newTotalPrice,
                'remaining_amount' => $newRemainingAmount
            ]);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Ek Hizmet Silme',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'reservation_id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'removed_service' => $removedService,
                    'removed_amount' => $removedAmount
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ek hizmet başarıyla silindi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ek hizmet silinirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reservation by confirmation code (public)
     */
    public function getReservationByConfirmationCode(string $confirmationCode)
    {
        try {
            $reservation = Reservation::with(['customer', 'bungalow'])
                ->where('confirmation_code', $confirmationCode)
                ->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rezervasyon bulunamadı veya onay kodu geçersiz'
                ], 404);
            }

            // Onay süresi kontrolü
            if ($reservation->confirmation_expires_at && now()->isAfter($reservation->confirmation_expires_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Onay süresi dolmuş'
                ], 410);
            }

            return response()->json([
                'success' => true,
                'data' => $reservation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm reservation by confirmation code (public)
     */
    public function confirmReservation(Request $request, string $confirmationCode)
    {
        try {
            $reservation = Reservation::where('confirmation_code', $confirmationCode)->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rezervasyon bulunamadı veya onay kodu geçersiz'
                ], 404);
            }

            // Onay süresi kontrolü
            if ($reservation->confirmation_expires_at && now()->isAfter($reservation->confirmation_expires_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Onay süresi dolmuş'
                ], 410);
            }

            // Zaten onaylanmış mı kontrol et
            if ($reservation->status === 'confirmed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bu rezervasyon zaten onaylanmış'
                ], 400);
            }

            // Terms acceptance kontrolü
            if (!$request->terms_accepted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kurallar ve şartları kabul etmelisiniz'
                ], 400);
            }

            // Rezervasyonu onayla
            $reservation->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'terms_accepted' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon başarıyla onaylandı',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon onaylanırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delay a reservation
     */
    public function delay(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'new_check_in_date' => 'required|date|after_or_equal:today',
            'new_check_out_date' => 'required|date|after:new_check_in_date',
            'delay_reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reservation = Reservation::findOrFail($id);
            
            // Check if reservation can be delayed
            if ($reservation->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'İptal edilmiş rezervasyonlar ertelenemez'
                ], 400);
            }

            if ($reservation->status === 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tamamlanmış rezervasyonlar ertelenemez'
                ], 400);
            }

            // Check for date conflicts with other reservations
            $conflictingReservation = Reservation::where('bungalow_id', $reservation->bungalow_id)
                ->where('id', '!=', $reservation->id)
                ->where('status', '!=', 'cancelled')
                ->where(function ($query) use ($request) {
                    $query->whereBetween('check_in_date', [$request->new_check_in_date, $request->new_check_out_date])
                          ->orWhereBetween('check_out_date', [$request->new_check_in_date, $request->new_check_out_date])
                          ->orWhere(function ($q) use ($request) {
                              $q->where('check_in_date', '<=', $request->new_check_in_date)
                                ->where('check_out_date', '>=', $request->new_check_out_date);
                          });
                })
                ->first();

            if ($conflictingReservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seçilen tarihlerde bu bungalov için başka bir rezervasyon bulunmaktadır'
                ], 400);
            }

            // Calculate new total price based on new dates
            $checkInDate = new \DateTime($request->new_check_in_date);
            $checkOutDate = new \DateTime($request->new_check_out_date);
            $nights = $checkInDate->diff($checkOutDate)->days;
            $newTotalPrice = $nights * $reservation->bungalow->price_per_night;

            // Eski tarihleri notlara ekle
            $oldCheckIn = $reservation->check_in_date;
            $oldCheckOut = $reservation->check_out_date;
            $oldCheckInFormatted = \Carbon\Carbon::parse($oldCheckIn)->format('d.m.Y');
            $oldCheckOutFormatted = \Carbon\Carbon::parse($oldCheckOut)->format('d.m.Y');
            
            $delayNote = "\n[ERTELEME] Eski tarihler: {$oldCheckInFormatted} - {$oldCheckOutFormatted}";
            if ($request->delay_reason) {
                $delayNote .= " | Sebep: {$request->delay_reason}";
            }
            $delayNote .= " | Tarih: " . now()->format('d.m.Y H:i');
            
            $existingNotes = $reservation->notes ?? '';
            $newNotes = $existingNotes . $delayNote;

            // Update reservation
            $reservation->update([
                'check_in_date' => $request->new_check_in_date,
                'check_out_date' => $request->new_check_out_date,
                'total_price' => $newTotalPrice,
                'remaining_amount' => $newTotalPrice - ($reservation->payment_amount ?? 0),
                'delay_reason' => $request->delay_reason,
                'delayed_at' => now(),
                'notes' => $newNotes
            ]);

            // Log the activity
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Rezervasyon Ertelendi',
                'status' => 'success',
                'ip' => $request->ip(),
                'metadata' => [
                    'reservation_id' => $reservation->id,
                    'reservation_code' => $reservation->reservation_code,
                    'old_check_in_date' => $reservation->getOriginal('check_in_date'),
                    'old_check_out_date' => $reservation->getOriginal('check_out_date'),
                    'new_check_in_date' => $request->new_check_in_date,
                    'new_check_out_date' => $request->new_check_out_date,
                    'reason' => $request->delay_reason
                ],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon başarıyla ertelendi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon ertelenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a reservation
     */
    public function cancel(Request $request, $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            
            // Check if reservation can be cancelled
            if ($reservation->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bu rezervasyon zaten iptal edilmiş'
                ], 400);
            }

            if ($reservation->status === 'confirmed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Onaylanmış rezervasyonlar iptal edilemez'
                ], 400);
            }

            // Update reservation status
            $reservation->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $request->reason ?? 'Onay süresi doldu'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezervasyon başarıyla iptal edildi',
                'data' => $reservation->load(['customer', 'bungalow'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rezervasyon iptal edilirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
}
