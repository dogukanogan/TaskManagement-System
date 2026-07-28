# Task Management System

Modern, responsive ve tam kapsamlı bir kişisel görev yönetimi uygulaması. Görevlerinizi oluşturabilir, kategorilere ayırabilir, liste veya Kanban görünümünde yönetebilir ve dashboard üzerinden çalışma durumunuzu takip edebilirsiniz.

**Geliştirici:** Doğukan Ogan

## Özellikler

### Görev yönetimi

- Görev oluşturma, düzenleme, görüntüleme ve silme
- Durum, öncelik, kategori ve tarih aralığına göre filtreleme
- Başlık ve açıklama içinde gecikmeli arama
- Farklı alanlara göre artan veya azalan sıralama
- Sayfalama ile büyük görev listelerini yönetme
- Liste ve Kanban görünümleri arasında geçiş
- Kanban üzerinde sürükle-bırak ile görev durumunu değiştirme
- Görevlere yorum ve dosya eki ekleme
- İşlem öncesi onay pencereleri, form doğrulamaları ve kullanıcı bildirimleri

### Dashboard

- Toplam, bekleyen, devam eden, tamamlanan, iptal edilen ve gecikmiş görev özetleri
- Haftalık, aylık veya tüm zamanlara göre istatistik filtresi
- Tamamlanma oranı
- Öncelik ve kategori dağılımları
- Yaklaşan, gecikmiş ve son eklenen görevler
- Oluşturulan ve tamamlanan görevleri karşılaştıran performans grafiği

### Kullanıcı deneyimi ve optimizasyon

- Mobil, tablet ve masaüstüne uyumlu responsive tasarım
- Dark/Light tema desteği ve tema tercihinin `localStorage` üzerinde saklanması
- Loading, hata, başarı ve boş durum gösterimleri
- JWT tabanlı kimlik doğrulama ve korumalı sayfalar
- API istekleri için süreli önbellekleme ve veri değişikliklerinde cache invalidation
- `OnPush` change detection ve güvenli subscription yönetimi
- API ve sayfa performansı ölçümü
- Profil bilgileri ve parola yönetimi

## Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| Frontend | Angular 21, Angular Material 21, Angular CDK, RxJS, TypeScript |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core 8, AutoMapper |
| Veritabanı | PostgreSQL (varsayılan), Oracle desteği |
| Güvenlik | JWT Bearer Authentication, BCrypt |
| Test | Vitest, Angular TestBed |
| API dokümantasyonu | Swagger / OpenAPI |

## Proje yapısı

```text
TaskManagement-System/
├── Backend/
│   └── TaskManagement.API/
│       ├── Controllers/     # API endpoint'leri
│       ├── DTOs/            # İstek ve yanıt modelleri
│       ├── Data/            # DbContext
│       ├── Middleware/      # Merkezi hata yönetimi
│       ├── Migrations/      # EF Core migration'ları
│       ├── Models/          # Veritabanı varlıkları
│       └── Services/        # İş kuralları ve servisler
├── Frontend/
│   └── TaskManagement.Client/
│       └── src/app/
│           ├── core/        # Guard, interceptor, model ve servisler
│           ├── features/    # Dashboard, görev, auth ve ayarlar
│           └── shared/      # Ortak component'ler
└── Database/                # SQL şema ve örnek veri dosyaları
```

## Gereksinimler

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Angular 21 ile uyumlu bir Node.js LTS sürümü
- npm
- PostgreSQL
- İsteğe bağlı: `dotnet-ef`

```bash
dotnet tool install --global dotnet-ef
```

## Kurulum

### 1. Veritabanını hazırlayın

PostgreSQL üzerinde bir veritabanı ve kullanıcı oluşturun. Ardından API dizinine geçin:

```bash
cd Backend/TaskManagement.API
```

Bağlantı bilgileri ile JWT anahtarını kaynak kod dışında tutmak için User Secrets kullanın:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=taskmanagementdb;Username=taskadmin;Password=YOUR_PASSWORD"
dotnet user-secrets set "Jwt:Secret" "YOUR_LONG_AND_SECURE_JWT_SECRET"
```

Migration'ları uygulayın:

```bash
dotnet ef database update
```

> API başlatılırken bekleyen migration'lar da otomatik olarak uygulanır.

### 2. Backend'i çalıştırın

```bash
dotnet restore
dotnet run
```

Geliştirme adresleri:

- API: `http://localhost:5233`
- Swagger: `http://localhost:5233/swagger`

### 3. Frontend'i çalıştırın

Yeni bir terminal açın:

```bash
cd Frontend/TaskManagement.Client
npm install
npm start
```

Uygulama `http://localhost:4200` adresinde açılır. Frontend API isteklerini varsayılan olarak `http://localhost:5233/api` adresine gönderir.

## Kullanılabilir komutlar

Frontend dizininde:

```bash
npm start                 # Geliştirme sunucusu
npm run build             # Production build
npm test -- --watch=false # Testleri bir kez çalıştır
```

Backend dizininde:

```bash
dotnet run
dotnet build
dotnet ef database update
```

## Demo hesabı

Veritabanında demo kullanıcısı bulunmuyorsa API ilk açılışta aşağıdaki hesabı oluşturur:

```text
E-posta: demo@taskmanagement.com
Parola: Demo123!
```

## Veritabanı sağlayıcısını değiştirme

Varsayılan sağlayıcı PostgreSQL'dir. Oracle kullanmak için yapılandırmada sağlayıcıyı ve bağlantı bilgisini değiştirin:

```json
{
  "DatabaseProvider": "Oracle",
  "ConnectionStrings": {
    "OracleConnection": "YOUR_ORACLE_CONNECTION_STRING"
  }
}
```

## Güvenlik notları

- Gerçek veritabanı parolalarını ve JWT anahtarını `appsettings.json` içine yazmayın.
- Geliştirme ortamında User Secrets, dağıtım ortamında environment variable veya güvenli bir secret manager kullanın.
- Production ortamına geçmeden önce demo hesabını kaldırın veya parolasını değiştirin.
