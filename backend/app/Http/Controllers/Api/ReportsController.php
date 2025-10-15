<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Customer;
use App\Models\Bungalow;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    /**
     * Genel raporlama
     */
    public function general(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfYear());
            $endDate = $request->get('end_date', Carbon::now()->endOfYear());

            // Toplam rezervasyon sayısı
            $totalReservations = Reservation::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            // Toplam gelir
            $totalRevenue = Reservation::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_price');

            // Toplam ödeme
            $totalPayments = Reservation::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('payment_amount');

            // Kalan borç
            $remainingDebt = $totalRevenue - $totalPayments;

            // Ortalama rezervasyon tutarı
            $averageReservationAmount = $totalReservations > 0 ? $totalRevenue / $totalReservations : 0;

            // En popüler bungalov
            $mostPopularBungalow = Reservation::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select('bungalow_id', DB::raw('count(*) as reservation_count'))
                ->with('bungalow')
                ->groupBy('bungalow_id')
                ->orderBy('reservation_count', 'desc')
                ->first();

            // En çok rezervasyon yapan müşteri
            $topCustomer = Reservation::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select('customer_id', DB::raw('count(*) as reservation_count'), DB::raw('sum(total_price) as total_spent'))
                ->with('customer')
                ->groupBy('customer_id')
                ->orderBy('reservation_count', 'desc')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ],
                    'summary' => [
                        'total_reservations' => $totalReservations,
                        'total_revenue' => $totalRevenue,
                        'total_payments' => $totalPayments,
                        'remaining_debt' => $remainingDebt,
                        'average_reservation_amount' => $averageReservationAmount
                    ],
                    'top_performers' => [
                        'most_popular_bungalow' => $mostPopularBungalow,
                        'top_customer' => $topCustomer
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Genel rapor oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Yıllık raporlama
     */
    public function yearly(Request $request)
    {
        try {
            $year = $request->get('year', Carbon::now()->year);
            $startDate = Carbon::create($year, 1, 1)->startOfDay();
            $endDate = Carbon::create($year, 12, 31)->endOfDay();

            // Aylık veriler
            $monthlyData = [];
            for ($month = 1; $month <= 12; $month++) {
                $monthStart = Carbon::create($year, $month, 1)->startOfDay();
                $monthEnd = Carbon::create($year, $month, 1)->endOfMonth()->endOfDay();

                $reservations = Reservation::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$monthStart, $monthEnd])
                    ->get();

                $monthlyData[] = [
                    'month' => $month,
                    'month_name' => Carbon::create($year, $month, 1)->format('F'),
                    'reservations_count' => $reservations->count(),
                    'revenue' => $reservations->sum('total_price'),
                    'payments' => $reservations->sum('payment_amount'),
                    'occupancy_rate' => $this->calculateOccupancyRate($monthStart, $monthEnd)
                ];
            }

            // Yıllık özet
            $yearlySummary = [
                'total_reservations' => array_sum(array_column($monthlyData, 'reservations_count')),
                'total_revenue' => array_sum(array_column($monthlyData, 'revenue')),
                'total_payments' => array_sum(array_column($monthlyData, 'payments')),
                'average_occupancy_rate' => array_sum(array_column($monthlyData, 'occupancy_rate')) / 12
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'year' => $year,
                    'monthly_data' => $monthlyData,
                    'yearly_summary' => $yearlySummary
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Yıllık rapor oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sezonluk raporlama
     */
    public function seasonal(Request $request)
    {
        try {
            $year = $request->get('year', Carbon::now()->year);
            
            $seasons = [
                'spring' => [
                    'name' => 'İlkbahar',
                    'start' => Carbon::create($year, 3, 1),
                    'end' => Carbon::create($year, 5, 31)
                ],
                'summer' => [
                    'name' => 'Yaz',
                    'start' => Carbon::create($year, 6, 1),
                    'end' => Carbon::create($year, 8, 31)
                ],
                'autumn' => [
                    'name' => 'Sonbahar',
                    'start' => Carbon::create($year, 9, 1),
                    'end' => Carbon::create($year, 11, 30)
                ],
                'winter' => [
                    'name' => 'Kış',
                    'start' => Carbon::create($year, 12, 1),
                    'end' => Carbon::create($year + 1, 2, 28)
                ]
            ];

            $seasonalData = [];
            foreach ($seasons as $key => $season) {
                $reservations = Reservation::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$season['start'], $season['end']])
                    ->get();

                $seasonalData[] = [
                    'season' => $key,
                    'season_name' => $season['name'],
                    'reservations_count' => $reservations->count(),
                    'revenue' => $reservations->sum('total_price'),
                    'payments' => $reservations->sum('payment_amount'),
                    'occupancy_rate' => $this->calculateOccupancyRate($season['start'], $season['end'])
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'year' => $year,
                    'seasonal_data' => $seasonalData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sezonluk rapor oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aylık raporlama
     */
    public function monthly(Request $request)
    {
        try {
            $year = $request->get('year', Carbon::now()->year);
            $month = $request->get('month', Carbon::now()->month);
            
            $startDate = Carbon::create($year, $month, 1)->startOfDay();
            $endDate = Carbon::create($year, $month, 1)->endOfMonth()->endOfDay();

            // Günlük veriler
            $dailyData = [];
            $daysInMonth = $startDate->daysInMonth;
            
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $dayStart = Carbon::create($year, $month, $day)->startOfDay();
                $dayEnd = Carbon::create($year, $month, $day)->endOfDay();

                $reservations = Reservation::where('status', '!=', 'cancelled')
                    ->whereBetween('created_at', [$dayStart, $dayEnd])
                    ->get();

                $dailyData[] = [
                    'day' => $day,
                    'date' => $dayStart->format('Y-m-d'),
                    'reservations_count' => $reservations->count(),
                    'revenue' => $reservations->sum('total_price'),
                    'payments' => $reservations->sum('payment_amount')
                ];
            }

            // Aylık özet
            $monthlySummary = [
                'month' => $month,
                'month_name' => $startDate->format('F'),
                'year' => $year,
                'total_reservations' => array_sum(array_column($dailyData, 'reservations_count')),
                'total_revenue' => array_sum(array_column($dailyData, 'revenue')),
                'total_payments' => array_sum(array_column($dailyData, 'payments')),
                'occupancy_rate' => $this->calculateOccupancyRate($startDate, $endDate)
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'monthly_summary' => $monthlySummary,
                    'daily_data' => $dailyData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Aylık rapor oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bungalov bazlı raporlama
     */
    public function bungalowBased(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfYear());
            $endDate = $request->get('end_date', Carbon::now()->endOfYear());
            $bungalowId = $request->get('bungalow_id');

            $query = Bungalow::with(['reservations' => function($q) use ($startDate, $endDate) {
                $q->where('status', '!=', 'cancelled')
                  ->whereBetween('created_at', [$startDate, $endDate]);
            }]);

            if ($bungalowId) {
                $query->where('id', $bungalowId);
            }

            $bungalows = $query->get();

            $bungalowData = $bungalows->map(function($bungalow) {
                $reservations = $bungalow->reservations;
                
                return [
                    'bungalow_id' => $bungalow->id,
                    'bungalow_name' => $bungalow->name,
                    'reservations_count' => $reservations->count(),
                    'total_revenue' => $reservations->sum('total_price'),
                    'total_payments' => $reservations->sum('payment_amount'),
                    'remaining_debt' => $reservations->sum('total_price') - $reservations->sum('payment_amount'),
                    'occupancy_rate' => $this->calculateBungalowOccupancyRate($bungalow, $reservations),
                    'average_stay_duration' => $this->calculateAverageStayDuration($reservations)
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ],
                    'bungalow_data' => $bungalowData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bungalov bazlı rapor oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Müşteri bazlı raporlama
     */
    public function customerBased(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfYear());
            $endDate = $request->get('end_date', Carbon::now()->endOfYear());
            $customerId = $request->get('customer_id');

            $query = Customer::with(['reservations' => function($q) use ($startDate, $endDate) {
                $q->where('status', '!=', 'cancelled')
                  ->whereBetween('created_at', [$startDate, $endDate]);
            }]);

            if ($customerId) {
                $query->where('id', $customerId);
            }

            $customers = $query->get();

            $customerData = $customers->map(function($customer) {
                $reservations = $customer->reservations;
                
                return [
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'reservations_count' => $reservations->count(),
                    'total_spent' => $reservations->sum('total_price'),
                    'total_paid' => $reservations->sum('payment_amount'),
                    'remaining_debt' => $reservations->sum('total_price') - $reservations->sum('payment_amount'),
                    'average_reservation_amount' => $reservations->count() > 0 ? $reservations->sum('total_price') / $reservations->count() : 0,
                    'last_reservation_date' => $reservations->max('created_at')
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => [
                        'start_date' => $startDate,
                        'end_date' => $endDate
                    ],
                    'customer_data' => $customerData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Müşteri bazlı rapor oluşturulurken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Doluluk oranını hesapla
     */
    private function calculateOccupancyRate($startDate, $endDate)
    {
        $totalDays = $startDate->diffInDays($endDate) + 1;
        $totalBungalows = Bungalow::count();
        $totalPossibleNights = $totalDays * $totalBungalows;

        if ($totalPossibleNights == 0) return 0;

        $occupiedNights = Reservation::where('status', '!=', 'cancelled')
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('check_in_date', [$startDate, $endDate])
                      ->orWhereBetween('check_out_date', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->where('check_in_date', '<=', $startDate)
                            ->where('check_out_date', '>=', $endDate);
                      });
            })
            ->get()
            ->sum(function($reservation) use ($startDate, $endDate) {
                $checkIn = Carbon::parse($reservation->check_in_date);
                $checkOut = Carbon::parse($reservation->check_out_date);
                
                $periodStart = $checkIn->greaterThan($startDate) ? $checkIn : $startDate;
                $periodEnd = $checkOut->lessThan($endDate) ? $checkOut : $endDate;
                
                return $periodStart->diffInDays($periodEnd);
            });

        return ($occupiedNights / $totalPossibleNights) * 100;
    }

    /**
     * Bungalov doluluk oranını hesapla
     */
    private function calculateBungalowOccupancyRate($bungalow, $reservations)
    {
        if ($reservations->isEmpty()) return 0;

        $totalNights = $reservations->sum(function($reservation) {
            $checkIn = Carbon::parse($reservation->check_in_date);
            $checkOut = Carbon::parse($reservation->check_out_date);
            return $checkIn->diffInDays($checkOut);
        });

        $periodDays = $reservations->min('created_at')->diffInDays($reservations->max('created_at')) + 1;
        
        return $periodDays > 0 ? ($totalNights / $periodDays) * 100 : 0;
    }

    /**
     * Ortalama kalış süresini hesapla
     */
    private function calculateAverageStayDuration($reservations)
    {
        if ($reservations->isEmpty()) return 0;

        $totalNights = $reservations->sum(function($reservation) {
            $checkIn = Carbon::parse($reservation->check_in_date);
            $checkOut = Carbon::parse($reservation->check_out_date);
            return $checkIn->diffInDays($checkOut);
        });

        return $totalNights / $reservations->count();
    }
}
