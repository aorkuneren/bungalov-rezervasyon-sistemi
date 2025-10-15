<?php

namespace Database\Seeders;

use App\Models\TermsConditions;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TermsConditionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'type' => 'kiralama_sartlari',
                'title' => 'Kiralama Şartları ve Sözleşmesi',
                'content' => '<h2>Kiralama Şartları ve Sözleşmesi</h2>

<p>Bu sözleşme, {{companyName}} (bundan sonra "İşletme" olarak anılacaktır) ile {{customerName}} (bundan sonra "Misafir" olarak anılacaktır) arasında aşağıdaki şartlar çerçevesinde düzenlenmiştir.</p>

<h3>1. Taraflar</h3>
<ul>
  <li><strong>İşletme:</strong> {{companyName}} – {{companyAddress}} – {{companyEmail}} – {{companyPhone}}</li>
  <li><strong>Misafir:</strong> {{customerName}}</li>
</ul>

<h3>2. Konaklama Bilgileri</h3>
<ul>
  <li><strong>Konaklama Tipi:</strong> {{roomType}}</li>
  <li><strong>Giriş Tarihi:</strong> {{checkInDate}}</li>
  <li><strong>Çıkış Tarihi:</strong> {{checkOutDate}}</li>
  <li><strong>Toplam Tutar:</strong> {{totalAmount}} TL</li>
</ul>

<h3>3. Rezervasyon ve Ödeme</h3>
<ul>
  <li>Rezervasyon, toplam bedelin belirli bir oranının (kapora) ödenmesiyle kesinleşir.</li>
  <li>Kapora ödemesi iade edilmez. Bu tutar, rezervasyonun garanti altına alınması amacıyla alınır.</li>
  <li>Kalan tutar, giriş tarihinde nakit veya işletme tarafından belirtilen diğer yöntemlerle ödenmelidir.</li>
</ul>

<h3>4. İptal ve Değişiklik Koşulları</h3>
<p>Misafir, rezervasyonu iptal etmek veya tarih değişikliği yapmak isterse, işletmenin <a href="{{companyWebsite}}/iptal-politikasi">İptal Politikası</a> sayfasında belirtilen şartlara tabidir. Kapora iadesi hiçbir koşulda yapılmaz.</p>

<h3>5. Konaklama ve Tesis Kullanımı</h3>
<ul>
  <li>Misafir, konaklama süresince tesisin tüm kurallarına uymayı kabul eder.</li>
  <li>Oda veya bungalovlar yalnızca belirtilen kişi sayısı kadar kullanılabilir.</li>
  <li>Sigara içilmesi, yüksek sesli müzik, çevreye rahatsızlık verilmesi yasaktır.</li>
  <li>Tesise ait eşyaların zarar görmesi durumunda, ilgili masraf misafire yansıtılır.</li>
</ul>

<h3>6. Sorumluluk</h3>
<ul>
  <li>İşletme, misafire ait değerli eşyaların kaybolmasından veya çalınmasından sorumlu değildir.</li>
  <li>Misafir, kendi ve beraberindekilerin güvenliğinden sorumludur.</li>
</ul>

<h3>7. Mücbir Sebepler</h3>
<p>Doğal afet, salgın hastalık, ulaşım engelleri veya diğer mücbir sebepler nedeniyle konaklamanın gerçekleşmemesi durumunda işletme, tarih değişikliği veya açık tarihli hak tanıma hakkına sahiptir.</p>

<h3>8. Kişisel Veriler</h3>
<p>İşletme, misafir bilgilerini yalnızca rezervasyon, konaklama ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanır. Detaylı bilgi için <a href="{{companyWebsite}}/kvkk">KVKK Aydınlatma Metni</a> sayfasını inceleyebilirsiniz.</p>

<h3>9. Yetkili Mahkeme</h3>
<p>Taraflar arasında doğabilecek uyuşmazlıklarda {{companyAddress}} yerleşim yerindeki mahkemeler ve icra daireleri yetkilidir.</p>

<p><em>{{customerName}}, bu sözleşmeyi okuyup anladığını ve koşulları kabul ettiğini beyan eder.</em></p>',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'type' => 'iptal_politikasi',
                'title' => 'Rezervasyon İptal Politikası',
                'content' => '<h2>Rezervasyon İptal Politikası</h2>
<p>{{companyName}} olarak misafirlerimizin plan değişikliklerinde adil ve şeffaf bir süreç yürütmeyi amaçlıyoruz. Aşağıdaki iptal koşulları tüm rezervasyonlar için geçerlidir.</p>

<h3>1. İptal Koşulları</h3>
<ul>
  <li>
    <strong>Giriş tarihinden 7 gün öncesine kadar yapılan iptallerde:</strong> Ödenen tutarın kapora hariç kalanı iade edilir.
  </li>
  <li>
    <strong>Giriş tarihine 7 günden az kala yapılan iptallerde veya konaklama gününde:</strong> Herhangi bir iade yapılmaz.
  </li>
  <li>
    <strong>Kapora ödemeleri:</strong> Kapora (ön ödeme) iadesi hiçbir koşulda yapılmaz. Kapora, rezervasyonun kesinleşmesi için alınır ve rezervasyonun iptal edilmesi durumunda {{companyName}} tarafından gelir olarak kaydedilir.
  </li>
</ul>

<h3>2. İptal İşlemi</h3>
<p>İptal talepleri yalnızca yazılı olarak <a href="mailto:{{companyEmail}}">{{companyEmail}}</a> adresine gönderilmelidir. Sözlü veya telefonla yapılan iptaller geçerli sayılmaz.</p>

<h3>3. İade Süreci</h3>
<p>İptal talebi onaylandıktan sonra, iade işlemleri 5–10 iş günü içerisinde, rezervasyon sırasında kullanılan ödeme yöntemi üzerinden gerçekleştirilir. Banka veya ödeme sağlayıcısına bağlı olarak bu süre değişiklik gösterebilir.</p>

<h3>4. Değişiklik ve Tarih Güncelleme</h3>
<p>Rezervasyon tarih değişikliği talepleri, giriş tarihinden en az 7 gün önce bildirilmek koşuluyla, müsaitlik durumuna göre değerlendirilebilir. Tarih değişikliklerinde fiyat farkı oluşması halinde yeni fiyat geçerli olur.</p>

<h3>5. Özel Durumlar</h3>
<p>Doğal afet, pandemi, sağlık sorunları veya diğer mücbir sebepler nedeniyle iptal edilmesi gereken rezervasyonlarda {{companyName}}, misafir lehine esnek yaklaşım sergileyebilir. Bu durumlarda iade veya tarih değişikliği tamamen işletme inisiyatifindedir.</p>

<h3>6. Giriş Yapılmaması Durumu</h3>
<p>Misafirin giriş yapmaması (no-show) durumunda rezervasyon iptal edilmiş sayılır ve herhangi bir iade yapılmaz.</p>

<h3>7. Politikada Değişiklik Hakkı</h3>
<p>{{companyName}}, iptal ve iade politikasında gerekli gördüğü değişiklikleri yapma hakkını saklı tutar. Güncel koşullar {{companyWebsite}} adresinde yayınlanır.</p>',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'type' => 'kullanim_kosullari',
                'title' => 'Kullanım Koşulları',
                'content' => '<h2>Kullanım Koşulları</h2>
<p>Bu kullanım koşulları ("Koşullar"), {{companyName}} tarafından sunulan rezervasyon hizmetlerinden yararlanan tüm kullanıcılar ("Kullanıcı") için geçerlidir. {{companyName}}\'in web sitesi, mobil uygulaması veya doğrudan iletişim kanalları üzerinden yapılan tüm rezervasyonlar bu koşullar çerçevesinde değerlendirilir.</p>

<h3>1. Tanımlar</h3>
<ul>
  <li><strong>İşletme:</strong> {{companyName}}, konaklama ve rezervasyon hizmetlerini sağlayan yerel turizm işletmesidir.</li>
  <li><strong>Kullanıcı:</strong> {{companyName}}\'in sunduğu rezervasyon hizmetlerinden yararlanan gerçek veya tüzel kişilerdir.</li>
  <li><strong>Rezervasyon:</strong> Kullanıcının belirli bir tarih aralığında konaklama hizmeti için yaptığı kayıt işlemidir.</li>
  <li><strong>Kapora:</strong> Rezervasyonun kesinleşmesi için Kullanıcı tarafından yapılan ön ödemedir.</li>
</ul>

<h3>2. Hizmetin Kapsamı</h3>
<p>{{companyName}}, konaklama tesislerine ait rezervasyon hizmetlerini doğrudan veya dijital kanallar aracılığıyla sunar. {{companyName}}, yalnızca kendi tesislerine ait rezervasyonlardan sorumludur.</p>

<h3>3. Rezervasyon ve Ödeme</h3>
<ul>
  <li>Rezervasyon işlemi, ödeme veya kapora tutarının işletme tarafından onaylanmasıyla kesinleşir.</li>
  <li>Kapora ödemesi, rezervasyonun garanti altına alınması için alınır ve iptal edilmesi halinde iade edilmez.</li>
  <li>Kalan ödeme, giriş tarihinde veya {{companyName}}\'in belirlediği şekilde tamamlanmalıdır.</li>
</ul>

<h3>4. İptal ve İade Politikası</h3>
<p>İptal ve iade koşulları <a href="/iptal-politikasi">İptal Politikası</a> sayfasında detaylı şekilde belirtilmiştir. Kullanıcı, rezervasyon yapmadan önce bu politikayı okuduğunu ve kabul ettiğini beyan eder.</p>

<h3>5. Konaklama Kuralları</h3>
<ul>
  <li>Konaklama tesisine giriş ve çıkış saatleri {{checkInTime}} – {{checkOutTime}} aralığındadır.</li>
  <li>Oda veya bungalovlarda sigara içilmemesi, evcil hayvan, gürültü veya çevreye zarar verilmemesi işletme politikası gereğidir.</li>
  <li>Misafir tarafından verilen zararlar, çıkış sırasında tespit edilerek ücretlendirilebilir.</li>
</ul>

<h3>6. Fiyatlandırma ve Vergiler</h3>
<p>Tüm fiyatlara KDV dahil edilmiştir (aksi belirtilmedikçe). Fiyatlar, dönemsel olarak değişiklik gösterebilir. {{companyName}} fiyat güncelleme hakkını saklı tutar.</p>

<h3>7. Sorumluluk Reddi</h3>
<p>{{companyName}}, web sitesinde veya iletişim kanallarında yer alan bilgi, fotoğraf ve fiyatlandırma hatalarından doğabilecek sorumlulukları en aza indirmek için azami özeni gösterir. Ancak, mücbir sebepler, teknik arızalar veya üçüncü taraf kaynaklı hatalardan dolayı oluşabilecek aksaklıklardan sorumlu tutulamaz.</p>

<h3>8. Kişisel Verilerin Korunması</h3>
<p>Kullanıcılara ait kişisel veriler, 6698 Sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında korunur. Detaylı bilgi için <a href="/gizlilik-politikasi">Gizlilik Politikası</a> sayfamızı inceleyebilirsiniz.</p>

<h3>9. Fikri Mülkiyet Hakları</h3>
<p>{{companyName}} web sitesinde yer alan tüm içerik, logo, görsel, metin ve materyallerin tüm hakları {{companyName}}\'e aittir. İzinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.</p>

<h3>10. Uygulanacak Hukuk ve Yetki</h3>
<p>Bu Koşullar, Türkiye Cumhuriyeti yasalarına tabidir. Taraflar arasında çıkabilecek uyuşmazlıklarda, {{companyLocation}} mahkemeleri ve icra daireleri yetkilidir.</p>

<h3>11. Koşullarda Değişiklik</h3>
<p>{{companyName}}, işbu kullanım koşullarını dilediği zaman değiştirme hakkını saklı tutar. Güncellenen koşullar web sitesinde yayımlandığı tarihte yürürlüğe girer.</p>

<h3>12. İletişim</h3>
<p>Her türlü soru, talep veya öneriniz için bizimle iletişime geçebilirsiniz:</p>
<ul>
  <li><strong>E-posta:</strong> <a href="mailto:{{companyEmail}}">{{companyEmail}}</a></li>
  <li><strong>Telefon:</strong> {{companyPhone}}</li>
  <li><strong>Adres:</strong> {{companyAddress}}</li>
</ul>

<p><em>Bu koşulları kabul eden kullanıcı, rezervasyon işlemini tamamlamakla birlikte {{companyName}} tarafından belirlenen tüm kural ve politikaları okuduğunu, anladığını ve kabul ettiğini beyan eder.</em></p>',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'type' => 'kvkk',
                'title' => 'Kişisel Verilerin Korunması Hakkında Aydınlatma Metni (KVKK)',
                'content' => '<h2>Kişisel Verilerin Korunması Hakkında Aydınlatma Metni (KVKK)</h2>

<p>{{companyName}} olarak, 6698 Sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin güvenliği ve gizliliğine büyük önem vermekteyiz. Bu metin, {{companyName}} tarafından toplanan kişisel verilerin işlenme amaçlarını, hukuki dayanaklarını ve haklarınızı açıklamaktadır.</p>

<h3>1. Veri Sorumlusu</h3>
<p>Veri sorumlusu sıfatıyla: {{companyName}} – {{companyAddress}} – {{companyEmail}} – {{companyPhone}}</p>

<h3>2. Toplanan Kişisel Veriler</h3>
<ul>
  <li>Ad, soyad, T.C. kimlik numarası</li>
  <li>Telefon numarası, e-posta adresi</li>
  <li>Rezervasyon ve konaklama bilgileri ({{reservationNumber}}, {{checkInDate}} – {{checkOutDate}})</li>
  <li>Ödeme bilgileri (kredi kartı, IBAN, fatura bilgisi vb.)</li>
</ul>

<h3>3. Verilerin İşlenme Amaçları</h3>
<ul>
  <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
  <li>Konaklama hizmetlerinin sunulması</li>
  <li>Faturalama ve muhasebe işlemleri</li>
  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
  <li>Müşteri memnuniyetinin artırılması ve hizmet kalitesinin geliştirilmesi</li>
</ul>

<h3>4. Verilerin Aktarımı</h3>
<p>Kişisel verileriniz, yalnızca kanunen yetkili kamu kurum ve kuruluşlarına, ödeme hizmeti sağlayıcılarına ve işletmeyle iş ilişkisi olan tedarikçilere aktarılabilir. Veriler, hiçbir şekilde üçüncü kişilerle izinsiz paylaşılmaz.</p>

<h3>5. Saklama Süresi</h3>
<p>Veriler, ilgili mevzuat gereği belirlenen süre boyunca saklanır ve yasal sürenin sonunda güvenli bir şekilde imha edilir.</p>

<h3>6. Haklarınız</h3>
<p>KVKK\'nın 11. maddesi uyarınca, kişisel verilerinize ilişkin olarak aşağıdaki haklara sahipsiniz:</p>
<ul>
  <li>Verilerinizin işlenip işlenmediğini öğrenme,</li>
  <li>Yanlış veya eksik işlenmiş verilerin düzeltilmesini isteme,</li>
  <li>Verilerinizin silinmesini veya anonim hale getirilmesini talep etme,</li>
  <li>İşlenen verilerin aktarımını öğrenme,</li>
  <li>Yasal haklarınızı veri sorumlusuna başvurarak kullanma.</li>
</ul>

<h3>7. İletişim</h3>
<p>KVKK kapsamındaki başvurularınızı <a href="mailto:{{companyEmail}}">{{companyEmail}}</a> adresine iletebilirsiniz.</p>

<p><em>{{companyName}}, bu aydınlatma metnini gerekli gördüğü durumlarda güncelleme hakkını saklı tutar.</em></p>',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'type' => 'gizlilik_politikasi',
                'title' => 'Gizlilik Politikası',
                'content' => '<h2>Gizlilik Politikası</h2>

<p>{{companyName}} olarak, kullanıcılarımızın gizliliğini korumayı ve kişisel verilerini güvenli şekilde işlemeyi taahhüt ederiz. Bu Gizlilik Politikası, {{companyWebsite}} ve diğer iletişim kanallarımız üzerinden elde edilen tüm bilgileri kapsar.</p>

<h3>1. Bilgi Toplama</h3>
<p>Rezervasyon işlemleri sırasında aşağıdaki bilgiler toplanabilir:</p>
<ul>
  <li>Ad, soyad, iletişim bilgileri</li>
  <li>Rezervasyon tarihleri, konaklama tipi, ödeme bilgileri</li>
  <li>IP adresi, cihaz bilgileri, site kullanımı verileri</li>
</ul>

<h3>2. Bilgilerin Kullanımı</h3>
<p>Toplanan bilgiler aşağıdaki amaçlarla kullanılabilir:</p>
<ul>
  <li>Rezervasyon ve konaklama sürecini yürütmek</li>
  <li>İletişim ve bilgilendirme yapmak</li>
  <li>Faturalama ve yasal yükümlülükleri yerine getirmek</li>
  <li>Hizmet kalitesini ölçmek ve geliştirmek</li>
</ul>

<h3>3. Bilgi Paylaşımı</h3>
<p>Kişisel veriler, yalnızca yasal zorunluluk halinde veya hizmetin gerektirdiği ölçüde üçüncü taraflarla (ör. ödeme altyapısı sağlayıcıları) paylaşılabilir. Veriler hiçbir şekilde ticari amaçlarla satılamaz veya izinsiz paylaşılmaz.</p>

<h3>4. Veri Güvenliği</h3>
<p>{{companyName}}, verilerin güvenliğini sağlamak için SSL şifreleme, erişim kontrolü ve güvenli sunucu altyapısı kullanır. Yetkisiz erişim, veri kaybı veya kötüye kullanımın önlenmesi için gerekli tüm teknik önlemler alınır.</p>

<h3>5. Çerez (Cookie) Kullanımı</h3>
<p>Web sitemizde kullanıcı deneyimini geliştirmek amacıyla çerezler kullanılmaktadır. Çerez tercihlerinizi tarayıcı ayarlarınız üzerinden yönetebilirsiniz.</p>

<h3>6. Dış Bağlantılar</h3>
<p>{{companyWebsite}} üzerinden üçüncü taraf sitelere yönlendirme yapılabilir. Bu sitelerin gizlilik politikalarından {{companyName}} sorumlu değildir.</p>

<h3>7. Politika Değişiklikleri</h3>
<p>{{companyName}}, gizlilik politikasını gerektiğinde güncelleyebilir. Güncel versiyon {{companyWebsite}} adresinde yayımlandığı anda yürürlüğe girer.</p>

<h3>8. İletişim</h3>
<p>Gizlilikle ilgili her türlü soru veya talebiniz için bizimle iletişime geçebilirsiniz:</p>
<ul>
  <li><strong>E-posta:</strong> <a href="mailto:{{companyEmail}}">{{companyEmail}}</a></li>
  <li><strong>Telefon:</strong> {{companyPhone}}</li>
  <li><strong>Adres:</strong> {{companyAddress}}</li>
</ul>

<p><em>{{companyName}} ile rezervasyon yaparak bu Gizlilik Politikası\'nı okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.</em></p>',
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($templates as $template) {
            TermsConditions::updateOrCreate(
                ['type' => $template['type']],
                $template
            );
        }
    }
}
