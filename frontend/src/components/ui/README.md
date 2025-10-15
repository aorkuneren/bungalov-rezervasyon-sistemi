# UI Components Documentation

Bu dokümantasyon, uygulamada kullanılan tüm UI bileşenlerinin nasıl kullanılacağını açıklar.

## Form Bileşenleri

### Input

Temel input bileşeni. Farklı tipler, boyutlar ve varyantlar destekler.

```jsx
import { Input, EmailInput, PasswordInput, NumberInput, TelInput, DateInput } from '../components/ui';

// Temel kullanım
<Input 
  label="Ad"
  placeholder="Adınızı girin"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Email input
<EmailInput 
  label="E-posta"
  placeholder="ornek@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>

// Şifre input (göster/gizle özelliği ile)
<PasswordInput 
  label="Şifre"
  placeholder="Şifrenizi girin"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Telefon input
<TelInput 
  label="Telefon"
  placeholder="+90 555 123 45 67"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>

// Sayı input
<NumberInput 
  label="Yaş"
  placeholder="25"
  value={age}
  onChange={(e) => setAge(e.target.value)}
  min={0}
  max={120}
/>

// Tarih input
<DateInput 
  label="Doğum Tarihi"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
/>
```

**Props:**
- `type`: input tipi (text, email, password, tel, number, date, search)
- `label`: etiket metni
- `placeholder`: placeholder metni
- `value`: input değeri
- `onChange`: değişiklik handler'ı
- `onBlur`: blur handler'ı
- `disabled`: devre dışı bırakma
- `required`: zorunlu alan
- `error`: hata mesajı
- `helperText`: yardımcı metin
- `size`: boyut (sm, md, lg)
- `variant`: varyant (default, filled)
- `showPasswordToggle`: şifre göster/gizle (password tipi için)
- `leftIcon`: sol ikon
- `rightIcon`: sağ ikon

### Textarea

Çok satırlı metin girişi için bileşen.

```jsx
import { Textarea, LargeTextarea, SmallTextarea, AutoResizeTextarea } from '../components/ui';

// Temel kullanım
<Textarea 
  label="Açıklama"
  placeholder="Açıklamanızı yazın"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>

// Büyük textarea
<LargeTextarea 
  label="Detaylı Açıklama"
  value={details}
  onChange={(e) => setDetails(e.target.value)}
/>

// Küçük textarea
<SmallTextarea 
  label="Kısa Not"
  value={note}
  onChange={(e) => setNote(e.target.value)}
/>

// Otomatik boyutlandırma
<AutoResizeTextarea 
  label="Dinamik Açıklama"
  value={dynamicText}
  onChange={(e) => setDynamicText(e.target.value)}
/>

// Karakter sayısı ile
<Textarea 
  label="Yorum"
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  maxLength={500}
  showCharCount
/>
```

**Props:**
- `label`: etiket metni
- `placeholder`: placeholder metni
- `value`: textarea değeri
- `onChange`: değişiklik handler'ı
- `onBlur`: blur handler'ı
- `disabled`: devre dışı bırakma
- `required`: zorunlu alan
- `error`: hata mesajı
- `helperText`: yardımcı metin
- `size`: boyut (sm, md, lg)
- `variant`: varyant (default, filled)
- `rows`: satır sayısı
- `resize`: boyutlandırma (none, both, horizontal, vertical)
- `maxLength`: maksimum karakter sayısı
- `showCharCount`: karakter sayısını göster

### Checkbox

Onay kutusu bileşeni.

```jsx
import { Checkbox, Switch, CheckboxGroup } from '../components/ui';

// Temel kullanım
<Checkbox 
  label="Şartları kabul ediyorum"
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>

// Switch (toggle)
<Switch 
  label="Bildirimleri aç"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>

// Checkbox grubu
<CheckboxGroup 
  options={[
    { value: 'option1', label: 'Seçenek 1' },
    { value: 'option2', label: 'Seçenek 2' },
    { value: 'option3', label: 'Seçenek 3' }
  ]}
  value={selectedOptions}
  onChange={setSelectedOptions}
/>
```

**Props:**
- `label`: etiket metni
- `checked`: seçili durumu
- `onChange`: değişiklik handler'ı
- `disabled`: devre dışı bırakma
- `required`: zorunlu alan
- `error`: hata mesajı
- `helperText`: yardımcı metin
- `size`: boyut (sm, md, lg)
- `variant`: varyant (default, primary)
- `indeterminate`: belirsiz durum

### Radio

Radyo düğmesi bileşeni.

```jsx
import { Radio, RadioGroup, RadioCard, RadioCardGroup } from '../components/ui';

// Temel kullanım
<Radio 
  label="Seçenek 1"
  value="option1"
  checked={selectedValue === 'option1'}
  onChange={(e) => setSelectedValue(e.target.value)}
  name="options"
/>

// Radio grubu
<RadioGroup 
  options={[
    { value: 'option1', label: 'Seçenek 1' },
    { value: 'option2', label: 'Seçenek 2' },
    { value: 'option3', label: 'Seçenek 3' }
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
  name="options"
/>

// Yatay düzen
<RadioGroup 
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  orientation="horizontal"
/>

// Kart görünümü
<RadioCard 
  label="Premium Plan"
  description="Tüm özellikler dahil"
  value="premium"
  checked={selectedPlan === 'premium'}
  onChange={setSelectedPlan}
/>

// Kart grubu
<RadioCardGroup 
  options={[
    { 
      value: 'basic', 
      label: 'Temel Plan', 
      description: 'Temel özellikler' 
    },
    { 
      value: 'premium', 
      label: 'Premium Plan', 
      description: 'Tüm özellikler dahil' 
    }
  ]}
  value={selectedPlan}
  onChange={setSelectedPlan}
/>
```

**Props:**
- `label`: etiket metni
- `value`: değer
- `checked`: seçili durumu
- `onChange`: değişiklik handler'ı
- `disabled`: devre dışı bırakma
- `required`: zorunlu alan
- `error`: hata mesajı
- `helperText`: yardımcı metin
- `size`: boyut (sm, md, lg)
- `variant`: varyant (default, primary)
- `name`: grup adı

### Select

Açılır liste bileşeni.

```jsx
import { Select, MultiSelect, SearchableSelect, ClearableSelect } from '../components/ui';

// Temel kullanım
<Select 
  label="Şehir"
  placeholder="Şehir seçin"
  options={[
    { value: 'istanbul', label: 'İstanbul' },
    { value: 'ankara', label: 'Ankara' },
    { value: 'izmir', label: 'İzmir' }
  ]}
  value={selectedCity}
  onChange={setSelectedCity}
/>

// Çoklu seçim
<MultiSelect 
  label="Hobiler"
  placeholder="Hobilerinizi seçin"
  options={hobbyOptions}
  value={selectedHobbies}
  onChange={setSelectedHobbies}
/>

// Arama özellikli
<SearchableSelect 
  label="Müşteri"
  placeholder="Müşteri ara ve seç"
  options={customerOptions}
  value={selectedCustomer}
  onChange={setSelectedCustomer}
/>

// Temizlenebilir
<ClearableSelect 
  label="Durum"
  placeholder="Durum seçin"
  options={statusOptions}
  value={selectedStatus}
  onChange={setSelectedStatus}
  clearable
/>
```

**Props:**
- `options`: seçenekler dizisi [{ value, label }]
- `value`: seçili değer
- `onChange`: değişiklik handler'ı
- `placeholder`: placeholder metni
- `label`: etiket metni
- `disabled`: devre dışı bırakma
- `required`: zorunlu alan
- `error`: hata mesajı
- `helperText`: yardımcı metin
- `size`: boyut (sm, md, lg)
- `variant`: varyant (default, filled)
- `searchable`: arama özelliği
- `clearable`: temizleme özelliği
- `multiple`: çoklu seçim

### FormGroup

Form alanları için düzen bileşeni.

```jsx
import { FormGroup, FormRow, FormSection, FormActions, FormField, FormGrid } from '../components/ui';

// Temel kullanım
<FormGroup 
  label="Ad Soyad"
  required
  error={nameError}
  helperText="Tam adınızı girin"
>
  <Input 
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
  />
</FormGroup>

// Yatay düzen
<FormGroup 
  label="E-posta"
  orientation="horizontal"
  error={emailError}
>
  <EmailInput 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormGroup>

// Form satırı (2 sütun)
<FormRow>
  <FormField label="Ad" required>
    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
  </FormField>
  <FormField label="Soyad" required>
    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
  </FormField>
</FormRow>

// Form bölümü
<FormSection 
  title="Kişisel Bilgiler"
  description="Lütfen kişisel bilgilerinizi girin"
>
  <FormField label="Ad" required>
    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
  </FormField>
  <FormField label="Soyad" required>
    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
  </FormField>
</FormSection>

// Form aksiyonları
<FormActions align="right">
  <Button variant="outline" onClick={handleCancel}>
    İptal
  </Button>
  <Button onClick={handleSave}>
    Kaydet
  </Button>
</FormActions>

// Form grid (3 sütun)
<FormGrid columns={3}>
  <FormField label="Ad">
    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
  </FormField>
  <FormField label="Soyad">
    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
  </FormField>
  <FormField label="E-posta">
    <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />
  </FormField>
</FormGrid>
```

**Props:**
- `label`: etiket metni
- `required`: zorunlu alan
- `error`: hata mesajı
- `helperText`: yardımcı metin
- `size`: boyut (sm, md, lg)
- `orientation`: düzen (vertical, horizontal)
- `columns`: grid sütun sayısı (FormGrid için)
- `align`: hizalama (FormActions için: left, center, right, between)

## Mevcut Bileşenler

### Button

Mevcut Button bileşeni zaten güncel ve kullanıma hazır.

```jsx
import { Button, IconButton, LoadingButton } from '../components/ui';

<Button variant="primary" size="md">
  Kaydet
</Button>

<IconButton icon={<PlusIcon />}>
  Ekle
</IconButton>

<LoadingButton loading={isLoading}>
  Gönder
</LoadingButton>
```

### Modal

Mevcut Modal bileşeni zaten güncel ve kullanıma hazır.

```jsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui';

<Modal isOpen={isOpen} onClose={onClose} title="Başlık">
  <ModalBody>
    İçerik
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Kapat</Button>
  </ModalFooter>
</Modal>
```

### CustomDropdown

Mevcut CustomDropdown bileşeni zaten güncel ve kullanıma hazır.

```jsx
import { CustomDropdown } from '../components/ui';

<CustomDropdown 
  options={options}
  value={value}
  onChange={onChange}
  placeholder="Seçiniz"
  searchable
  clearable
/>
```

## Kullanım Örnekleri

### Basit Form

```jsx
import { FormSection, FormRow, FormActions, Input, EmailInput, Button } from '../components/ui';

const SimpleForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  return (
    <form>
      <FormSection title="Kişisel Bilgiler">
        <FormRow>
          <FormField label="Ad" required>
            <Input 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
          </FormField>
          <FormField label="Soyad" required>
            <Input 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
          </FormField>
        </FormRow>
        <FormField label="E-posta" required>
          <EmailInput 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </FormField>
      </FormSection>
      
      <FormActions>
        <Button variant="outline">İptal</Button>
        <Button>Kaydet</Button>
      </FormActions>
    </form>
  );
};
```

### Gelişmiş Form

```jsx
import { 
  FormSection, 
  FormGrid, 
  FormActions, 
  Input, 
  Select, 
  CheckboxGroup, 
  RadioGroup,
  Textarea,
  Button 
} from '../components/ui';

const AdvancedForm = () => {
  return (
    <form>
      <FormSection title="Temel Bilgiler">
        <FormGrid columns={2}>
          <FormField label="Ad" required>
            <Input />
          </FormField>
          <FormField label="Soyad" required>
            <Input />
          </FormField>
          <FormField label="E-posta" required>
            <EmailInput />
          </FormField>
          <FormField label="Telefon">
            <TelInput />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Tercihler">
        <FormField label="Şehir" required>
          <Select 
            options={cityOptions}
            placeholder="Şehir seçin"
          />
        </FormField>
        
        <FormField label="Hobiler">
          <CheckboxGroup 
            options={hobbyOptions}
            orientation="horizontal"
          />
        </FormField>
        
        <FormField label="Cinsiyet" required>
          <RadioGroup 
            options={genderOptions}
            orientation="horizontal"
          />
        </FormField>
      </FormSection>

      <FormSection title="Ek Bilgiler">
        <FormField label="Açıklama">
          <Textarea 
            rows={4}
            placeholder="Kendiniz hakkında bilgi verin"
          />
        </FormField>
      </FormSection>

      <FormActions>
        <Button variant="outline">İptal</Button>
        <Button>Kaydet</Button>
      </FormActions>
    </form>
  );
};
```

## Notlar

- Tüm bileşenler mevcut tasarım sisteminizle uyumlu olarak oluşturulmuştur
- Bileşenler responsive tasarım destekler
- Erişilebilirlik (accessibility) özellikleri dahil edilmiştir
- Tüm bileşenler TypeScript ile uyumludur
- Bileşenler mevcut Tailwind CSS sınıflarını kullanır
