# E-İhracat Sipariş, Gümrük ve İade Takip Sistemi App

Modern glassmorphism admin panel + Node/Express API for the `EIhracat_3NF` SQL Server database.

## Bu pakette ne var?
- `backend/` → Express API
- `frontend/` → React + Vite arayüzü
- `start-dev.cmd` → Windows'ta backend ve frontend'i ayrı pencerelerde hızlı başlatır

## Özellikler
- Dashboard using `vw_SiparisTamOzet`
- Customers: list + create
- Addresses: list + create
- Products: list
- Orders: list + detail + create + add order item
- Payments: list + create
- Shipping: list + create
- Customs: list + create + update using `sp_GumrukDurumGuncelle`
- Returns: list + create using `sp_IadeTalebiOlustur`
- Uses parameterized SQL queries

## Gereksinimler
- Node.js 20+
- SQL Server instance that contains the `EIhracat_3NF` database
- ODBC Driver 17 or 18 for SQL Server
- Windows Authentication veya SQL Login

## En kritik nokta
Backend hangi SQL Server'a bağlanıyorsa, SSMS/Azure Data Studio'da veritabanını da aynı instance altında görmen gerekir.

Örnekler:
- `(localdb)\\mssqllocaldb`
- `RODINA\\SQLEXPRESS`

> Not: Kaydedilmiş bağlantı adının `RODINA\\SQLEXPRESS` olması tek başına yeterli değil. Asıl önemli olan **Server Name** kutusunda yazan değerdir.

## Backend ayarı
`backend/.env` dosyasını kontrol et:

```env
PORT=4000
DB_SERVER=(localdb)\mssqllocaldb
DB_DATABASE=EIhracat_3NF
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=true
DB_TRUST_SERVER_CERTIFICATE=true
```

Eğer veritabanın gerçekten `RODINA\\SQLEXPRESS` altında attached ise, sadece bunu değiştir:

```env
DB_SERVER=RODINA\SQLEXPRESS
```

## Çalıştırma
### Seçenek 1 — en kolay yol
Dosya gezgininde proje klasörünü aç ve `start-dev.cmd` dosyasına çift tıkla.

Bu iki ayrı terminal açar:
- backend → `http://localhost:4000`
- frontend → `http://localhost:5173`

### Seçenek 2 — manuel
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Test sırası
1. Tarayıcıda `http://localhost:4000/api/health`
2. Tarayıcıda `http://localhost:4000/api/health/db`
3. Sonra `http://localhost:5173`

## Beklenen sonuç
`/api/health/db` çalışıyorsa backend gerçekten SQL Server'a bağlanmıştır.
Örnek cevap:

```json
{
  "status": "ok",
  "ServerName": "(localdb)\\MSSQLLocalDB",
  "DatabaseName": "EIhracat_3NF",
  "ConnectedUser": "RODINA\\Rodina Amr Mukhtar"
}
```

## Eğer hata alırsan
En yaygın nedenler:
1. `DB_SERVER` yanlış
2. `EIhracat_3NF` o instance altında attached değil
3. ODBC Driver 17/18 yok
4. Backend'i proje kökünden değil yanlış klasörden çalıştırma

## Önerilen kontrol
SSMS / Azure Data Studio içinde şu sorguyu çalıştır:

```sql
SELECT @@SERVERNAME AS ServerName, DB_NAME() AS CurrentDb;
```

Sonra çıkan `ServerName` ile `backend/.env` içindeki `DB_SERVER` aynı olsun.
