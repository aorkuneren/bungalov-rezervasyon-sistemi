<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Customer;
use App\Models\Bungalow;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dashboard istatistiklerini getir
     */
    public function index(Request $request)
    {
        try {
            $today = Carbon::today();
            $tomorrow = Carbon::tomorrow();
            $nextWeek = Carbon::today()->addWeek();

            // Bugünün rezervasyonları (giriş yapanlar)
            $todayCheckIns = Reservation::with(['customer', 'bungalow'])
                ->whereDate('check_in_date', $today)
                ->where('status', '!=', 'cancelled')
                ->orderBy('check_in_date')
                ->get();

            // Bugünün rezervasyonları (çıkış yapanlar)
            $todayCheckOuts = Reservation::with(['customer', 'bungalow'])
                ->whereDate('check_out_date', $today)
                ->where('status', '!=', 'cancelled')
                ->orderBy('check_out_date')
                ->get();

            // Yaklaşan rezervasyonlar (gelecek 7 gün)
            $upcomingReservations = Reservation::with(['customer', 'bungalow'])
                ->whereBetween('check_in_date', [$tomorrow, $nextWeek])
                ->where('status', '!=', 'cancelled')
                ->orderBy('check_in_date')
                ->get();

            // Genel istatistikler
            $totalReservations = Reservation::where('status', '!=', 'cancelled')->count();
            $activeReservations = Reservation::whereIn('status', ['confirmed', 'checked_in'])->count();
            $totalCustomers = Customer::where('status', 'active')->count();
            $totalBungalows = Bungalow::count();
            $occupiedBungalows = Reservation::whereIn('status', ['confirmed', 'checked_in'])
                ->where('check_in_date', '<=', $today)
                ->where('check_out_date', '>', $today)
                ->distinct('bungalow_id')
                ->count('bungalow_id');

            // Bu ayın geliri
            $monthlyRevenue = Reservation::where('status', '!=', 'cancelled')
                ->whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->sum('total_price');

            // Bu ayın ödemeleri
            $monthlyPayments = Reservation::where('status', '!=', 'cancelled')
                ->whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->sum('payment_amount');

            return response()->json([
                'success' => true,
                'data' => [
                    'today_check_ins' => $todayCheckIns,
                    'today_check_outs' => $todayCheckOuts,
                    'upcoming_reservations' => $upcomingReservations,
                    'statistics' => [
                        'total_reservations' => $totalReservations,
                        'active_reservations' => $activeReservations,
                        'total_customers' => $totalCustomers,
                        'total_bungalows' => $totalBungalows,
                        'occupied_bungalows' => $occupiedBungalows,
                        'available_bungalows' => $totalBungalows - $occupiedBungalows,
                        'monthly_revenue' => $monthlyRevenue,
                        'monthly_payments' => $monthlyPayments,
                        'monthly_remaining' => $monthlyRevenue - $monthlyPayments,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dashboard verileri alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
}
