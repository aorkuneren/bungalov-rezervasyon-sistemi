# Navigation Components Documentation

Bu dokümantasyon, uygulamada kullanılan tüm navigation bileşenlerinin nasıl kullanılacağını açıklar.

## Navigation Bileşenleri

### Navbar

Ana navigasyon çubuğu bileşeni. Logo, navigasyon menüsü ve kullanıcı dropdown'ı içerir.

```jsx
import { Navbar } from '../components/ui';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  UsersIcon, 
  ChartBarIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', name: 'Dashboard', icon: HomeIcon },
  { path: '/bungalows', name: 'Bungalovlar', icon: BuildingOfficeIcon },
  { path: '/reservations', name: 'Rezervasyonlar', icon: CalendarIcon },
  { path: '/customers', name: 'Müşteriler', icon: UsersIcon },
  { path: '/reports', name: 'Raporlar', icon: ChartBarIcon },
  { path: '/settings', name: 'Ayarlar', icon: CogIcon },
];

const user = {
  name: 'Ahmet Yılmaz',
  role: 'Yönetici',
  menuItems: [
    { name: 'Profil', path: '/profile', icon: UserIcon },
    { name: 'Ayarlar', path: '/settings', icon: CogIcon }
  ]
};

// Temel kullanım
<Navbar 
  navItems={navItems}
  user={user}
  onLogout={handleLogout}
  isAuthenticated={true}
/>

// Özel logo ile
<Navbar 
  logo={<img src="/logo.png" alt="Logo" className="h-8" />}
  brandName="MyApp"
  navItems={navItems}
  user={user}
  onLogout={handleLogout}
/>

// Dark tema
<Navbar 
  navItems={navItems}
  user={user}
  onLogout={handleLogout}
  variant="dark"
/>

// Farklı boyutlar
<Navbar 
  navItems={navItems}
  user={user}
  onLogout={handleLogout}
  size="lg"
/>
```

**Props:**
- `logo`: Logo bileşeni
- `brandName`: Marka adı
- `navItems`: Navigasyon öğeleri dizisi
- `user`: Kullanıcı bilgileri
- `onLogout`: Çıkış fonksiyonu
- `isAuthenticated`: Kimlik doğrulama durumu
- `variant`: Tema (default, dark, transparent, white)
- `size`: Boyut (sm, md, lg)

### Sidebar

Yan menü bileşeni. Tab navigasyonu için kullanılır.

```jsx
import { Sidebar, SidebarWithHeader, CollapsibleSidebar } from '../components/ui';
import { 
  UserIcon, 
  KeyIcon, 
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

const sidebarItems = [
  { id: 'genel', name: 'Genel Bilgiler', icon: UserIcon },
  { id: 'guvenlik', name: 'Güvenlik', icon: KeyIcon },
  { id: 'loglar', name: 'Sistem Logları', icon: ClipboardDocumentListIcon }
];

// Temel kullanım
<Sidebar 
  items={sidebarItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
/>

// Başlık ile
<SidebarWithHeader 
  title="Profil Ayarları"
  subtitle="Hesap bilgilerinizi yönetin"
  items={sidebarItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
/>

// Daraltılabilir
<CollapsibleSidebar 
  items={sidebarItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
  collapsed={collapsed}
  onToggleCollapse={setCollapsed}
/>

// Dark tema
<Sidebar 
  items={sidebarItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
  variant="dark"
/>

// Farklı boyutlar
<Sidebar 
  items={sidebarItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
  size="lg"
/>
```

**Props:**
- `items`: Sidebar öğeleri dizisi
- `activeItem`: Aktif öğe ID'si
- `onItemClick`: Öğe tıklama fonksiyonu
- `variant`: Tema (default, dark, minimal)
- `size`: Boyut (sm, md, lg)
- `collapsible`: Daraltılabilir mi
- `collapsed`: Daraltılmış durumu
- `onToggleCollapse`: Daraltma fonksiyonu
- `header`: Başlık bileşeni
- `footer`: Alt bilgi bileşeni

### Tabs

Sekme bileşeni. Farklı içerikleri organize etmek için kullanılır.

```jsx
import { 
  Tabs, 
  TabContent, 
  TabPanel, 
  PillsTabs, 
  UnderlineTabs,
  TabContainer 
} from '../components/ui';
import { UserIcon, KeyIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const tabItems = [
  { id: 'genel', name: 'Genel Bilgiler', icon: UserIcon },
  { id: 'guvenlik', name: 'Güvenlik', icon: KeyIcon },
  { id: 'loglar', name: 'Sistem Logları', icon: ClipboardDocumentListIcon }
];

// Temel kullanım
<Tabs 
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Pills stili
<PillsTabs 
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Alt çizgi stili
<UnderlineTabs 
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Tam genişlik
<FullWidthTabs 
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Dikey düzen
<VerticalTabs 
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Tab Container ile
<TabContainer 
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  <TabPanel tabId="genel" activeTab={activeTab}>
    <div>Genel bilgiler içeriği</div>
  </TabPanel>
  <TabPanel tabId="guvenlik" activeTab={activeTab}>
    <div>Güvenlik içeriği</div>
  </TabPanel>
  <TabPanel tabId="loglar" activeTab={activeTab}>
    <div>Sistem logları içeriği</div>
  </TabPanel>
</TabContainer>
```

**Props:**
- `items`: Tab öğeleri dizisi
- `activeTab`: Aktif tab ID'si
- `onTabChange`: Tab değişiklik fonksiyonu
- `variant`: Stil (default, pills, underline, minimal)
- `size`: Boyut (sm, md, lg)
- `orientation`: Düzen (horizontal, vertical)
- `fullWidth`: Tam genişlik

### Breadcrumb

Sayfa yolu navigasyonu bileşeni.

```jsx
import { 
  Breadcrumb, 
  BreadcrumbContainer, 
  createBreadcrumbItems 
} from '../components/ui';
import { HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const breadcrumbItems = [
  { path: '/bungalows', label: 'Bungalovlar', icon: BuildingOfficeIcon },
  { path: '/bungalows/1', label: 'Bungalov Detayı' }
];

// Temel kullanım
<Breadcrumb items={breadcrumbItems} />

// Ana sayfa ile
<Breadcrumb 
  items={breadcrumbItems}
  showHome={true}
  homePath="/"
  homeLabel="Ana Sayfa"
/>

// Farklı ayırıcılar
<Breadcrumb items={breadcrumbItems} separator="slash" />
<Breadcrumb items={breadcrumbItems} separator="arrow" />
<Breadcrumb items={breadcrumbItems} separator="dot" />

// Dark tema
<Breadcrumb items={breadcrumbItems} variant="dark" />

// Container ile başlık
<BreadcrumbContainer 
  title="Bungalov Detayı"
  subtitle="Bungalov bilgilerini görüntüleyin ve düzenleyin"
  breadcrumbItems={breadcrumbItems}
  actions={
    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
      Düzenle
    </button>
  }
/>

// Otomatik breadcrumb oluşturma
const autoBreadcrumb = createBreadcrumbItems('/bungalows/1/edit');
<Breadcrumb items={autoBreadcrumb} />
```

**Props:**
- `items`: Breadcrumb öğeleri dizisi
- `separator`: Ayırıcı (chevron, slash, arrow, dot)
- `size`: Boyut (sm, md, lg)
- `variant`: Tema (default, dark, minimal)
- `showHome`: Ana sayfa göster
- `homePath`: Ana sayfa yolu
- `homeLabel`: Ana sayfa etiketi

### Menu

Dropdown menü bileşeni.

```jsx
import { 
  Menu, 
  DropdownMenu, 
  UserMenu, 
  ActionMenu 
} from '../components/ui';
import { 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';

const menuItems = [
  { label: 'Düzenle', icon: PencilIcon, onClick: () => console.log('Edit') },
  { label: 'Sil', icon: TrashIcon, onClick: () => console.log('Delete') },
  { separator: true },
  { label: 'Detaylar', to: '/details' }
];

// Temel kullanım
<Menu 
  items={menuItems}
  trigger={
    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
      Menü
    </button>
  }
/>

// Dropdown menü
<DropdownMenu 
  items={menuItems}
  trigger={
    <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">
      <span>İşlemler</span>
      <ChevronDownIcon className="w-4 h-4" />
    </button>
  }
/>

// Kullanıcı menüsü
<UserMenu 
  user={{ name: 'Ahmet Yılmaz', role: 'Yönetici' }}
  items={menuItems}
  onLogout={() => console.log('Logout')}
/>

// Aksiyon menüsü (3 nokta)
<ActionMenu 
  items={menuItems}
/>

// Farklı yerleşimler
<Menu 
  items={menuItems}
  placement="top-start"
  trigger={<button>Menü</button>}
/>

// Dark tema
<Menu 
  items={menuItems}
  variant="dark"
  trigger={<button>Menü</button>}
/>
```

**Props:**
- `items`: Menü öğeleri dizisi
- `trigger`: Tetikleyici bileşen
- `placement`: Yerleşim (top-start, top-end, bottom-start, bottom-end, left-start, left-end, right-start, right-end)
- `size`: Boyut (sm, md, lg)
- `variant`: Tema (default, dark, minimal)

### NavItem

Navigasyon öğesi bileşeni.

```jsx
import { 
  NavItem, 
  NavItemList, 
  NavItemGroup 
} from '../components/ui';
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';

// Temel kullanım
<NavItem to="/dashboard" icon={<HomeIcon className="w-5 h-5" />}>
  Dashboard
</NavItem>

// Farklı varyantlar
<NavItem to="/profile" variant="outline">
  Profil
</NavItem>

<NavItem to="/settings" variant="ghost">
  Ayarlar
</NavItem>

// Badge ile
<NavItem to="/notifications" badge="3">
  Bildirimler
</NavItem>

// Tam genişlik
<NavItem to="/dashboard" fullWidth>
  Dashboard
</NavItem>

// NavItem List
const navItems = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { id: 'profile', label: 'Profil', to: '/profile', icon: UserIcon }
];

<NavItemList 
  items={navItems}
  activeItem={activeItem}
  onItemClick={setActiveItem}
/>

// NavItem Group
<NavItemGroup title="Ana Menü">
  <NavItem to="/dashboard" icon={<HomeIcon className="w-5 h-5" />}>
    Dashboard
  </NavItem>
  <NavItem to="/profile" icon={<UserIcon className="w-5 h-5" />}>
    Profil
  </NavItem>
</NavItemGroup>
```

**Props:**
- `to`: React Router yolu
- `href`: HTML href
- `icon`: İkon bileşeni
- `badge`: Badge metni
- `active`: Aktif durumu
- `disabled`: Devre dışı durumu
- `onClick`: Tıklama fonksiyonu
- `variant`: Stil (default, outline, ghost, minimal)
- `size`: Boyut (sm, md, lg)
- `fullWidth`: Tam genişlik

## Kullanım Örnekleri

### Profil Sayfası Layout

```jsx
import { 
  Sidebar, 
  Tabs, 
  TabPanel, 
  BreadcrumbContainer 
} from '../components/ui';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('genel');
  
  const sidebarItems = [
    { id: 'genel', name: 'Genel Bilgiler', icon: UserIcon },
    { id: 'guvenlik', name: 'Güvenlik', icon: KeyIcon },
    { id: 'loglar', name: 'Sistem Logları', icon: ClipboardDocumentListIcon }
  ];

  const breadcrumbItems = [
    { path: '/profile', label: 'Profil' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbContainer 
          title="Profil Ayarları"
          subtitle="Hesap bilgilerinizi yönetin"
          breadcrumbItems={breadcrumbItems}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar 
              items={sidebarItems}
              activeItem={activeTab}
              onItemClick={setActiveTab}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <TabPanel tabId="genel" activeTab={activeTab}>
                <div>Genel bilgiler içeriği</div>
              </TabPanel>
              <TabPanel tabId="guvenlik" activeTab={activeTab}>
                <div>Güvenlik içeriği</div>
              </TabPanel>
              <TabPanel tabId="loglar" activeTab={activeTab}>
                <div>Sistem logları içeriği</div>
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Ayarlar Sayfası Layout

```jsx
import { 
  SidebarWithHeader, 
  Tabs, 
  TabPanel, 
  BreadcrumbContainer 
} from '../components/ui';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('firma');
  
  const sidebarItems = [
    { id: 'firma', name: 'Firma Bilgileri', icon: BuildingOfficeIcon },
    { id: 'fiyatlandirma', name: 'Fiyatlandırma', icon: CurrencyDollarIcon },
    { id: 'bildirimler', name: 'Bildirimler', icon: BellIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbContainer 
          title="Sistem Ayarları"
          subtitle="Uygulama ayarlarını yönetin"
          breadcrumbItems={[{ path: '/settings', label: 'Ayarlar' }]}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-1">
            <SidebarWithHeader 
              title="Ayarlar"
              subtitle="Kategoriler"
              items={sidebarItems}
              activeItem={activeTab}
              onItemClick={setActiveTab}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <TabPanel tabId="firma" activeTab={activeTab}>
                <div>Firma bilgileri içeriği</div>
              </TabPanel>
              <TabPanel tabId="fiyatlandirma" activeTab={activeTab}>
                <div>Fiyatlandırma içeriği</div>
              </TabPanel>
              <TabPanel tabId="bildirimler" activeTab={activeTab}>
                <div>Bildirimler içeriği</div>
              </TabPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Detay Sayfası Layout

```jsx
import { 
  BreadcrumbContainer, 
  ActionMenu 
} from '../components/ui';

const DetailPage = () => {
  const menuItems = [
    { label: 'Düzenle', icon: PencilIcon, onClick: () => navigate('/edit') },
    { label: 'Sil', icon: TrashIcon, onClick: () => handleDelete() }
  ];

  const breadcrumbItems = [
    { path: '/bungalows', label: 'Bungalovlar' },
    { path: '/bungalows/1', label: 'Bungalov Detayı' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbContainer 
          title="Bungalov Detayı"
          subtitle="Bungalov bilgilerini görüntüleyin ve yönetin"
          breadcrumbItems={breadcrumbItems}
          actions={
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/edit')}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Düzenle
              </button>
              <ActionMenu items={menuItems} />
            </div>
          }
        />
        
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Sayfa içeriği */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Notlar

- Tüm navigation bileşenleri mevcut tasarım sisteminizle uyumlu
- Responsive tasarım destekler
- Erişilebilirlik özellikleri dahil
- TypeScript ile uyumlu
- Tailwind CSS sınıflarını kullanır
- React Router ile entegre
- Mevcut Navigation bileşeninizi değiştirmeden yeni bileşenler eklendi
