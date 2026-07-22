# Task Management System

Bu proje, kullanıcıların günlük işlerini, projelerini ve hedeflerini organize etmelerine yardımcı olan, modern UI/UX prensipleriyle geliştirilmiş **Kişisel Görev Yönetim Sistemi** web uygulamasıdır. 

**Geliştirici:** Doğukan Ogan

---

## 🌟 Öne Çıkan Özellikler

- **Modern ve Premium Arayüz:** Angular Material ile zenginleştirilmiş, akıcı animasyonlara sahip pürüzsüz kullanıcı deneyimi.
- **Karanlık Mod (Dark Mode):** Göz yormayan, kontrast ayarları özenle yapılmış entegre karanlık mod desteği. Tema tercihiniz tarayıcınızda hatırlanır.
- **Gelişmiş Görev Filtreleme:** Görevleri kategori, durum (Bekliyor, Tamamlandı vs.), öncelik (Kritik, Normal vs.) ve metin bazlı anlık olarak filtreleyebilme.
- **Dinamik Kategoriler:** Özelleştirilebilir "renk paleti" ile görev kategorilerini kişiselleştirme. Her kategori, seçilen renkte özel rozetler (badge) halinde tüm ekranlarda dinamik olarak gösterilir.
- **Detaylı Dashboard:** Görevlerin önceliklerine, kategorilerine ve durumlarına göre genel istatistiklerini anlık olarak takip edebileceğiniz özet ekranı.
- **Güvenli Kimlik Doğrulama:** JWT (JSON Web Token) altyapısı ile güvenli giriş, kayıt ve profil yönetimi işlemleri.

---

## 🛠 Kullanılan Teknolojiler

**Backend (API)**
- **Framework:** .NET 8 Web API
- **ORM:** Entity Framework Core
- **Ana Veritabanı:** PostgreSQL
- **Alternatif Veritabanı:** Oracle
- **Güvenlik:** JWT tabanlı Authentication ve Authorization

**Frontend (Client)**
- **Framework:** Angular 17+
- **UI Kütüphanesi:** Angular Material
- **Stil Yönetimi:** Saf CSS, Modern CSS Variable yapısı ve Responsive Tasarım

---

## 📂 Proje Yapısı

- `Backend/` - .NET 8 Web API projesini, servis katmanlarını, Repository modellerini ve Entity tanımlamalarını içerir.
- `Frontend/TaskManagement.Client/` - Standalone Component mimarisi kullanılarak geliştirilmiş, Angular 17 tabanlı modern kullanıcı arayüzü kodlarını barındırır.
- `Database/` - Referans amaçlı SQL şema ve örnek veri betiklerini barındırır (Proje EF Core Code-First yaklaşımı ile kendi veritabanını oluşturabilir).

---

## 🚀 Kurulum ve Çalıştırma

### Backend (.NET API)
1. `Backend/` dizinine gidin.
2. `appsettings.json` içerisindeki PostgreSQL veya Oracle bağlantı dizesini (Connection String) kendi veritabanınıza göre güncelleyin.
3. Terminalde EF Core ile veritabanını oluşturun: `dotnet ef database update`
4. Projeyi çalıştırın: `dotnet run` (API varsayılan olarak `https://localhost:7111` portunda ayağa kalkacaktır).

### Frontend (Angular)
1. `Frontend/TaskManagement.Client/` dizinine gidin.
2. Bağımlılıkları yükleyin: `npm install`
3. Geliştirici sunucusunu başlatın: `npm start` veya `npm run dev`
4. Tarayıcınızda `http://localhost:4200` adresine giderek uygulamayı kullanmaya başlayabilirsiniz!

---

