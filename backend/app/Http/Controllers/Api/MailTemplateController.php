<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MailTemplateController extends Controller
{
    /**
     * Get mail templates
     */
    public function index()
    {
        try {
            $templates = MailTemplate::where('is_active', true)->get();
            
            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mail template\'leri alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific mail template
     */
    public function show($type)
    {
        try {
            $template = MailTemplate::where('type', $type)
                ->where('is_active', true)
                ->first();
            
            if (!$template) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mail template bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $template
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mail template alınırken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update mail template
     */
    public function update(Request $request, $type)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'body' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $template = MailTemplate::where('type', $type)->first();
            
            if (!$template) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mail template bulunamadı'
                ], 404);
            }

            $template->update([
                'subject' => $request->subject,
                'body' => $request->body
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mail template başarıyla güncellendi',
                'data' => $template
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mail template güncellenirken hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }
}
