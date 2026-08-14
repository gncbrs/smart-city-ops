# Smart City Operations Center — Teknik Dokümantasyon

**Son güncelleme:** 13 Ağustos 2026 (akşam oturumu)
**Kapsam:** Level 1 — Basic Operations Center (devam ediyor)

Bu doküman, projede o ana kadar yapılan işleri, alınan mimari kararları ve bu kararların
gerekçelerini kayıt altına alır. Amaç: ilerledikçe "neden böyle yaptık" sorusuna
sohbet geçmişine bakmadan cevap bulabilmek.

---

## 1. Mimari Genel Bakış

| Katman | Teknoloji | Rol |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Harita merkezli operasyon arayüzü |
| Backend | ASP.NET Core 8 (Web API) | Clean Architecture, 4 katman |
| Veritabanı | PostgreSQL 16 | EF Core Code-First ile yönetiliyor |
| Konteynerleştirme | Docker Compose | Ev ortamı için; iş ortamında portable Postgres kullanılıyor (bkz. 4.3) |
| Harita kütüphanesi | MapLibre GL JS | API key/billing gerektirmiyor |
| Gerçek zamanlı iletişim | SignalR (planlandı, henüz backend'de yok) | Harita canlı güncellemesi için |
| Incident kaynağı | Incident Generator (Worker Service) | Dış sistemi simüle eden, periyodik olarak sahte incident üreten ayrı bir process |

Backend bağımlılık yönü (Clean Architecture):

```
Api ──► Infrastructure ──► Application ──► Domain
 │                                            ▲
 └────────────────────────────────────────────┘
```

Domain hiçbir katmana bağımlı değil; framework'süz saf C#.

**Önemli:** 13 Ağustos'ta proje köküne tüm backend projelerini toplayan bir **yeniden
yapılandırma** yapıldı (bkz. bölüm 2.6). Aşağıdaki yollar artık `backend/src/...` değil,
**`Src/...`** (repo kökünde, düz/flat yapı).

---

## 2. Backend — Solution Yapısı

### 2.1 Proje iskeleti (12 Ağustos — ilk kurulum)

İlk kurulumda `backend/SmartCityOps.sln` altında 4 proje açıldı (Domain, Application,
Infrastructure, Api). Şablonların ürettiği örnek dosyalar (`Class1.cs`, `WeatherForecast*.cs`)
silindi. **Bu yapı 13 Ağustos'ta `Src/` altına taşındı — güncel yol için bölüm 2.6'ya bakın.**

### 2.2 Domain katmanı — Incident

```
Domain/
├── Common/
│   └── EntityBase.cs          — tüm entity'lerin ortak Id (Guid) alanı (eski adı: BaseEntity)
├── Enums/
│   ├── IncidentType.cs        — TrafficAccident, RoadClosure, FireAlert,
│   │                             InfrastructureFailure, FloodAlert,
│   │                             PublicSafetyAlert, UtilityFailure
│   ├── IncidentPriority.cs    — Low, Medium, High
│   └── IncidentStatus.cs      — Open, InProgress, Resolved
└── Entities/
    └── Incident.cs
```

**`Incident` entity alanları:**

```
Incident : EntityBase
├── Id            : Guid                (EntityBase'den miras)
├── IncidentCode  : string               (örn. "INC-2026001")
├── Type          : IncidentType         (enum, byte backing + açık değerler)
├── Priority      : IncidentPriority     (enum, byte backing + açık değerler)
├── Status        : IncidentStatus       (enum, byte backing + açık değerler)
├── ReportedAt    : DateTimeOffset       (UTC)
├── Latitude      : double
├── Longitude     : double
└── Description   : string
```

### 2.3 Bu entity üzerine alınan tasarım kararları

**Karar — Guid PK + ayrı `IncidentCode`:**
Veritabanı PK'i olarak `Guid Id` kullanılıyor (dağıtık kaynaklardan — Incident Generator gibi —
veri geldiğinde int auto-increment çakışma riski taşır, Guid'de bu risk yok). Kağıttaki örnek
JSON'daki insan-okunur `"incidentId": "INC-2026001"` ise ayrı bir `IncidentCode` string alanı
olarak tutuluyor; bu alan sadece görüntüleme/referans amaçlı, PK değil.

**Karar — Type/Priority/Status enum, string değil:**
Yazım hatalarının derleme zamanında yakalanması için. EF Core Postgres'te bunları `string`
olarak saklıyor (bkz. Karar B, 2.4).

**Karar — `enum : byte` + açık sayısal değerler (13 Ağustos, mentör talimatı):**
Tüm enum'lar (`IncidentType`, `IncidentPriority`, `IncidentStatus`, `FieldUnitType`,
`FieldUnitStatus`) `: byte` backing type ile ve her üyeye açık değer (`= 0, = 1, ...`) verilerek
tanımlanıyor. İki ayrı fayda:
- **`: byte`** → varsayılan `int` (4 byte) yerine 1 byte kullanır; büyük koleksiyonlarda
  (ör. Level 2/3'teki hareket geçmişi) bellek tasarrufu sağlar, ayrıca "bu küçük/sınırlı bir
  küme" niyetini kodda görünür kılar.
- **Açık değerler** → enum'un ortasına yeni bir üye eklendiğinde sonrakilerin numarası
  kaymasın diye. Eğer bu değer bir yerde int olarak saklansaydı, kayma eski kayıtların anlamını
  sessizce değiştirirdi. (DB'de zaten string sakladığımız için bu risk orada yok — bu, C#
  tarafında ayrı bir güvenlik katmanı.)

Bu iki konu (byte + DB'de string saklama) birbirini **tamamlıyor**, çelişmiyor: biri C#
bellek/derleme tarafını, diğeri veritabanı tarafını koruma altına alıyor.

**Karar — Latitude/Longitude düz alan, ayrı Value Object değil:**
Level 1'de PostGIS kullanılmıyor, basitlik tercih edildi (YAGNI).

**Karar — `recommendedUnits` alanı entity'ye eklenmedi:**
Case study'de bu açıkça **Level 3 gereksinimi** ("Recommend suitable field units for new
tasks"). Entity'ye statik bir liste olarak koymak bayatlama ve gelecekteki öneri motoruyla
çakışma riski taşırdı — bu, ileride bir **servisin dönüş değeri** olacak, entity alanı değil.

**Karar — Entity'ler "anemic" (davranışsız) kalacak:**
Level 1'de constructor/validasyon/iş kuralı metodu yok; entity'ler sade veri taşıyıcılar. İş
kuralları Application/Infrastructure katmanında yaşıyor (örn. "yeni incident her zaman Open
başlar" kuralı `IncidentService.CreateAsync`'te, entity'nin kendisinde değil — bkz. 2.8).

### 2.4 Infrastructure katmanı — EF Core + Npgsql kurulumu

**Kurulan NuGet paketleri (8.0.10, EF Core 8 / net8.0 ile uyumlu sürüme sabitlendi):**
- `SmartCityOps.Infrastructure.csproj` → `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Design`
- `SmartCityOps.Api.csproj` → `Microsoft.EntityFrameworkCore.Design` (migration komutu, startup
  project'in de bu paketi referanslamasını zorunlu kılıyor — hata mesajıyla keşfedildi)

**`dotnet-ef` CLI aracı** global olarak kuruldu: `dotnet tool install --global dotnet-ef --version 8.0.10`.

**`IncidentConfiguration.cs` içindeki kararlar:**
- **Karar A — `IncidentCode` üzerinde unique index.** Aynı incident kodu iki kez kaydedilemesin
  diye veritabanı seviyesinde garanti.
- **Karar B — `Type`/`Priority`/`Status` enum'ları Postgres'te `string` olarak saklanıyor**
  (`int` değil). Gerekçe: (1) tabloya bakınca `"Resolved"` okunabiliyor, `2` değil; (2) enum'a
  yeni değer eklenip sıra değişirse eski kayıtların anlamı kaymıyor; (3) bu ölçekte string'in
  ek yer kaplaması önemsiz.

**İlk migration (`InitialCreate`, 12 Ağustos):** `Incidents` tablosunu oluşturdu — `Id` (uuid PK),
`IncidentCode` (unique index), `Type`/`Priority`/`Status` (string), `ReportedAt`, `Latitude`,
`Longitude`, `Description`.

**13 Ağustos'ta gerçek Postgres'e uygulandı** (`dotnet ef database update`) — bkz. bölüm 4.3
(portable Postgres kurulumu) ve bölüm 2.7 (FieldUnit migration'ı).

### 2.5 FieldUnit entity'si (13 Ağustos)

```
Domain/
├── Enums/
│   ├── FieldUnitType.cs    — Police, Medical, Fire, UtilityCrew, TrafficControl
│   └── FieldUnitStatus.cs  — Available, Dispatched, OutOfService
└── Entities/
    └── FieldUnit.cs
```

```
FieldUnit : EntityBase
├── Id         : Guid
├── UnitCode   : string           (örn. "MED-04", "POL-12")
├── Type       : FieldUnitType
├── Status     : FieldUnitStatus
├── Latitude   : double
└── Longitude  : double
```

**Tasarım kararları:**
- `Incident`'la aynı desen (Domain → Infrastructure config → migration), tutarlılık için.
- `Type` için case study'deki incident tiplerini karşılayacak 5 kategori seçildi (Police,
  Medical, Fire, UtilityCrew, TrafficControl) — hepsi örnek incident tiplerine (kaza, yangın,
  sel, altyapı arızası vb.) müdahale edebilecek şekilde.
- `Status` için 3 basit durum (`IncidentStatus`'un sadeliğiyle tutarlı) — `EnRoute`, `OnScene`
  gibi ince durumlar bilinçli olarak eklenmedi, bunlar Level 2/3'e ait (movement history, ETA).
- `Description`/`Priority`/`ReportedAt` gibi incident'a özgü alanlar **eklenmedi** — bir field
  unit'in "bilgisi" ile bir incident'ın "bilgisi" farklı kavramlar.
- Case study'de field unit'ler için ayrı bir "generator" tanımlanmamış (sadece Incident
  Generator var) — bu yüzden field unit verisi **elle/seed data** olarak eklendi, ayrı bir
  generator yazılmadı.

**`FieldUnitConfiguration.cs`:** `IncidentConfiguration` ile aynı desen — `UnitCode` üzerinde
unique index, `Type`/`Status` string olarak saklanıyor.

**Migration:** `AddFieldUnit` (`20260813081610_AddFieldUnit`) — `FieldUnits` tablosunu oluşturdu,
Postgres'e uygulandı.

**Seed data:** `psql` üzerinden elle 5 örnek kayıt eklendi (Ankara koordinatları civarında,
her tipten bir örnek: `POL-01`, `MED-01`, `FIR-01`, `UTL-01`, `TRF-01`).

### 2.6 Proje yeniden yapılandırması — `backend/src/` → `Src/` (13 Ağustos)

Mentör, tüm backend projelerini `backend/src/SmartCityOps.*` yapısından repo kökündeki düz
(flat) bir `Src/SmartCityOps.*` yapısına taşıdı, tek bir `Src/SmartCityOps.sln` altında
birleştirdi:

```
Src/
├── SmartCityOps.sln
├── SmartCityOps.Api/
├── SmartCityOps.Application/
├── SmartCityOps.Domain/
├── SmartCityOps.Infrastructure/
└── incident-generator/            (bkz. 2.9)
```

Visual Studio'nun Solution Explorer'ında görülen `Common` / `Emulator` / `Managers` /
`SmartCityOps` grupları, **diskte karşılığı olmayan, sadece `.sln` içindeki mantıksal
klasörler** (Solution Folders) — fiziksel yapı yukarıdaki gibi düz.

**Bu taşıma sırasında oluşan küçük isim değişiklikleri (bilerek not düşülüyor, ileride
tutarlılık için gözden geçirilebilir):**
- `BaseEntity.cs` → `EntityBase.cs` olarak yeniden adlandırıldı.
- `Infrastructure/Incidents/IncidentService.cs` yerine `Infrastructure/Incident/IncidentService.cs`
  (tekil klasör) oluştu — Application katmanındaki `Incidents/` (çoğul) ile küçük bir
  tutarsızlık, işlevi etkilemiyor.
- `Controllers/IncidentsControllers.cs` — dosya adının sonunda fazladan bir "s" var
  (`Controllers`, çoğul), sınıfın kendisi hâlâ `IncidentsController` (tekil). C#'ta dosya adı
  ile sınıf adı eşleşmek zorunda olmadığı için derlemeyi etkilemiyor.
- `appsettings.json`'daki backend portu `5159`'dan **`5080`**'e düzeltildi (frontend'in
  `.env.example`'da beklediği port buydu, eşleşmiyordu — bkz. bölüm 7).

**Eski `backend/` klasörü commit'ten temizlendi**, artık repoda yok.

### 2.7 Application + Api katmanı — Incident için minimal implementasyon (13 Ağustos)

Field Unit ve Incident Generator hedeflerine ulaşmak için (Generator'ın veri gönderebileceği
bir uç nokta gerektiği için), Incident için **minimal** bir Application+Api katmanı kuruldu —
tam CRUD değil, sadece "listele" ve "oluştur" ihtiyacı karşılandı (YAGNI: `GetById` gibi henüz
kullanılmayan uçlar eklenmedi).

**Application katmanı (`Src/SmartCityOps.Application/Incidents/`):**
- `IncidentDto.cs` — API'nin dışarıya verdiği şekil (`record`, immutable). Entity'nin kendisi
  değil, ayrı bir DTO kullanılıyor — sebep: entity DB şemasına bağlı, DTO dış sözleşmeye bağlı;
  ikisi birbirinden bağımsız değişebilmeli.
- `CreateIncidentDto.cs` — Generator'ın POST edeceği şekil. **`Id` ve `Status` alanları
  bilinçli olarak yok**: `Id`'yi sunucu üretir, `Status`'u sunucu her zaman `Open` olarak
  sabitler (dış sistemin incident'ın yaşam döngüsünü dikte etmesini istemiyoruz).
- `IIncidentService.cs` — arayüz, Application'da; implementasyon Infrastructure'da (Clean
  Architecture'ın Dependency Inversion prensibi — Application, EF Core'u tanımıyor).

**Infrastructure katmanı (`Src/SmartCityOps.Infrastructure/Incident/IncidentService.cs`):**
- `GetAllAsync` → `AsNoTracking()` + doğrudan `.Select()` ile DTO'ya projeksiyon (performans:
  sadece ihtiyaç duyulan kolonlar SQL'e yansıyor).
- `CreateAsync` → `Enum.Parse<IncidentType>(dto.Type)` ile string'i enum'a çeviriyor,
  `Status = IncidentStatus.Open` sabit atanıyor.
- `DependencyInjection.cs`'e `services.AddScoped<IIncidentService, IncidentService>();` eklendi
  — `AddScoped`, çünkü `ApplicationDbContext` de Scoped; DbContext'e bağımlı bir servis en az
  DbContext kadar kısa ömürlü olmalı (Singleton olursa eşzamanlı isteklerde çökme riski).

**Api katmanı (`Src/SmartCityOps.Api/Controllers/IncidentsControllers.cs`):**
- Controller-based Web API (Minimal API değil) — Clean Architecture'la daha uyumlu, büyüdükçe
  organize kalması daha kolay.
- `[Route("api/incidents")]` — elle, açıkça yazıldı (otomatik `[controller]` token'ına
  güvenilmedi — API sözleşmesi bu kadar kritikken açık olmak daha güvenli).
- `POST` içinde `try/catch (ArgumentException)` — `Enum.Parse` geçersiz bir string'le
  karşılaşırsa (Generator hatalı veri gönderirse) 500 yerine anlamlı bir 400 dönüyor.
- **Bilinçli eksik:** 201 cevabında `Location` header'ı yok (`CreatedAtAction` kullanılmadı) —
  bunun için bir `GetById` endpoint'i gerekirdi, henüz yazılmadı (YAGNI).

**CORS + port düzeltmesi (`Program.cs`):**
- `AddCors` ile sadece `http://localhost:5173` (Vite dev server) origin'ine izin veriliyor —
  `AllowAnyOrigin()` kullanılmadı (güvenlik + ileride SignalR'ın `AllowCredentials()` ihtiyacıyla
  çakışmaması için).
- **Bulunan hata:** `launchSettings.json`'daki backend portu (`5159`, şablon varsayılanı)
  frontend'in `.env.example`'da beklediği portla (`5080`) uyuşmuyordu — düzeltildi.

### 2.8 Incident Generator — Worker Service (13 Ağustos)

Case study'nin "dış sistem" tanımını (incident'ları periyodik üretip Operations Center'a
gönderen kaynak) karşılamak için ayrı bir proje: `Src/incident-generator/`
(`SmartCityOps.IncidentGenerator`, .NET Worker Service, `net9.0`).

**Neden ayrı proje, backend'e bağımlı değil (ProjectReference yok):**
Case study'nin Scope bölümü: *"The Operations Center assumes that incidents are produced by an
external system."* Gerçek hayattaki bir dış sistem gibi davranması için, backend'in DTO
sınıflarını paylaşmıyor — kendi `IncidentPayload` record'unu tanımlıyor, sadece **JSON
sözleşmesi** üzerinden konuşuyor (loose coupling).

**Bileşenler:**
- `IncidentGeneratorOptions.cs` — içindeki sınıfın adı mentör tarafından `IncidentGenerator`
  olarak değiştirildi (dosya adıyla artık birebir örtüşmüyor, C#'ta buna izin var). `appsettings.json`'daki
  `ApiBaseUrl` ve `IntervalSeconds` ayarlarını bağlıyor (Options Pattern).
- `Worker.cs` (`BackgroundService`) — her `IntervalSeconds` saniyede bir rastgele bir incident
  üretip `POST {ApiBaseUrl}incidents`'e gönderiyor. `HttpRequestException` yakalanıyor (backend
  ayakta değilse servis çökmüyor, sadece loglayıp devam ediyor).
- `Program.cs` — `AddHttpClient<Worker>(...)` (typed client deseni) + `AddHostedService(sp =>
  sp.GetRequiredService<Worker>())` — bu ikili desen, `HttpClient` gerektiren
  `BackgroundService`'ler için .NET'in önerdiği yol.

**Kritik teknik ders — JSON camelCase uyumu:**
ASP.NET Core'un `[ApiController]`'ı varsayılan olarak **camelCase** JSON bekliyor
(`incidentCode`, `type`...), ama C# property isimleri PascalCase (`IncidentCode`, `Type`).
Worker.cs'te `JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)` kullanılarak
giden JSON otomatik camelCase'e çevriliyor — bu satır unutulsaydı backend tüm alanları `null`
okurdu, sessizce yanlış veri kaydedilirdi.

**Kritik teknik ders — `HttpClient.BaseAddress` ve göreli URL birleştirme (RFC 3986):**
`BaseAddress` **sonunda `/` olmadan** ayarlanırsa (`http://localhost:5080/api`), göreli bir
yol (`"incidents"`) eklenirken son path segmenti **değiştirilir**, eklenmez:
```
http://localhost:5080/api  +  incidents  →  http://localhost:5080/incidents   (yanlış, "api" kayboldu)
http://localhost:5080/api/ +  incidents  →  http://localhost:5080/api/incidents  (doğru)
```
Bu hatayı canlı olarak yaşadık (Generator 404 alıyordu) — `appsettings.json`'daki `ApiBaseUrl`
sonuna `/` eklenerek düzeltildi.

**Doğrulama — uçtan uca test (13 Ağustos, başarılı):**
Postgres + Backend (`Src/SmartCityOps.Api`) + Generator (`Src/incident-generator`) aynı anda
ayakta iken, Generator'ın gönderdiği incident'lar `GET http://localhost:5080/api/incidents`
üzerinden gerçek veri olarak görüldü (`201 Created` yanıtları, `status: "Open"` her zaman sabit,
`type`/`priority` rastgele ama geçerli enum değerleri, koordinatlar Ankara civarında).

---

## 3. Frontend — Klasör Yapısı ve Durum

Vite + React + TypeScript ile kuruldu, feature-based (özellik bazlı) klasörleme kullanılıyor.

```
frontend/src/
├── app/
│   ├── App.tsx              ✅ dolu
│   └── providers.tsx         ✅ dolu — QueryClientProvider
├── features/
│   ├── incidents/            ✅ Level 1 için dolu (henüz gerçek API'ye bağlanmadı)
│   │   ├── api/incidentsApi.ts
│   │   ├── hooks/useIncidents.ts
│   │   ├── components/IncidentPanel.tsx
│   │   └── types.ts
│   ├── field-units/           ⏳ iskelet (backend hazır, frontend henüz bağlanmadı)
│   ├── tasks/                 ⏳ iskelet
│   ├── operations-map/        ✅ MapLibre kurulumu çalışıyor (henüz marker yok)
│   └── dashboard/              ⏳ iskelet
├── shared/
│   ├── lib/httpClient.ts       ✅ axios, VITE_API_BASE_URL'den okuyor (http://localhost:5080/api)
│   ├── lib/signalRConnection.ts ✅ (backend'de SignalR henüz yok)
│   ├── hooks/useSignalR.ts      ✅
│   └── types/common.ts          ✅
├── layouts/OperationsCenterLayout.tsx  ✅
└── main.tsx                    ✅
```

**Not:** Backend artık `http://localhost:5080/api/incidents`'te gerçek veri sunuyor —
frontend'in `httpClient.ts`'teki varsayılan adres bununla zaten uyumlu, bağlama işi bir sonraki
oturumda yapılacak.

### 3.1 Kurulu paketler ve amaçları

| Paket | Amaç |
|---|---|
| `@tanstack/react-query` | Backend verisini cache'leyip yönetmek |
| `axios` | HTTP istekleri |
| `zustand` | İstemci tarafı UI state |
| `maplibre-gl` | Harita |
| `@microsoft/signalr` | Gerçek zamanlı güncellemeler |
| `react-router-dom` | Kurulu, henüz kullanılmıyor |

### 3.2 Karşılaşılan ve çözülen hata

`maplibre-gl` v6'da default export kaldırılmış. Çözüm: named export'a geçildi —
`import { Map as MapLibreMap } from "maplibre-gl"`.

---

## 4. Altyapı

### 4.1 `.gitignore`

**13 Ağustos'ta bulunan ve düzeltilen hata:** Kurallar eski klasör isimlerine sabitlenmişti
(`backend/**/bin/`, `incident-generator/**/bin/`) — proje `Src/` altına taşınınca bu kurallar
hiçbir şeyi yakalamaz oldu, `git add` derleme çıktılarını (`bin/`, `obj/`, yüzlerce dosya) stage
etmeye başladı. **Düzeltme:** anchor'lı (belirli klasöre bağlı) kurallar yerine genel kurallara
geçildi:
```
bin/
obj/
```
(Başında/ortasında `/` olmayan desenler her derinlikte eşleşir — klasör yapısı tekrar değişse
bile kırılmaz.)

Diğer kapsamlar: Node (`node_modules/`, `dist/`), ortam/sırlar (`.env`, `.env.*` —
`.env.example` hariç), Docker (`docker-compose.override.yml`), IDE/OS dosyaları.

Bilinçli istisna: `appsettings.Development.json` **ignore edilmiyor** — içinde gerçek bir sır
yok, repo'da izlenmesi gerekiyor.

### 4.2 `docker-compose.yml`

Ev ortamı için `postgres` servisi tanımlı (`postgres:16-alpine`, port `5432:5432`, healthcheck,
kalıcı volume). Backend/frontend `Dockerfile`'ları henüz yazılmadı.

### 4.3 İş ortamı — Portable PostgreSQL kurulumu (13 Ağustos, admin yetkisi olmadan)

Stajdaki PC'de Docker kurulamıyor (admin yetkisi yok). Bu yüzden Postgres'in **kurulum
gerektirmeyen zip/binary dağıtımı** kullanıldı — sadece dosya kopyalama, kayıt defterine/servis
listesine dokunmuyor.

**Adımlar (tekrar kurulum gerekirse referans):**

1. **İndirme:** EnterpriseDB'nin "Binaries" (installer değil) sürümü indirildi, kullanıcı
   klasörü altına açıldı (`C:\Users\<kullanıcı>\dev-tools\pgsql`).
2. **Port kontrolü:** `Get-NetTCPConnection -LocalPort 5432` ile 5432'nin boş olduğu teyit
   edildi (IT'nin ayrıca kurduğu bir Postgres varsa çakışma olabilirdi).
3. **`initdb` — cluster oluşturma:**
   ```powershell
   .\initdb.exe -D "...\pgsql\data" -U smartcityops -W -E UTF8 --locale=C -A scram-sha-256
   ```
   - **Karşılaşılan hata:** Windows'un Türkçe locale'i (`Turkish_Türkiye.1254`) ASCII-olmayan
     karakter içerdiği için `initdb`'yi kırdı → `--locale=C` ile açıkça belirtilerek çözüldü.
   - `C` locale bilinçli tercih: Postgres'te Türkçe locale (`tr_TR`) kullanmak "Turkish I
     problem" olarak bilinen, `I`/`ı`/`İ`/`i` büyük-küçük harf dönüşümünde öngörülemeyen
     davranışlara yol açabilen bilinen bir sorun kaynağı — `C` locale (byte-sırasıyla
     karşılaştırma) production'da yaygın tercih.
   - Süper kullanıcı doğrudan `smartcityops` adıyla oluşturuldu (appsettings'teki bağlantı
     dizesiyle birebir eşleşsin, ayrı bir `postgres` kullanıcısı + sonradan rol ekleme adımı
     atlanmış oldu).
4. **`pg_ctl start` — sunucuyu başlatma:**
   ```powershell
   .\pg_ctl.exe -D "...\pgsql\data" -l "...\pgsql\data\server.log" -o "-p 5432" start
   ```
5. **`createdb` — uygulama veritabanını oluşturma:**
   ```powershell
   .\createdb.exe -h localhost -p 5432 -U smartcityops smartcityops
   ```
   (`initdb` sadece `postgres`/`template0`/`template1` oluşturur, `smartcityops` adlı DB ayrıca
   oluşturulmalı.)
6. **Doğrulama:** `psql -h localhost -p 5432 -U smartcityops -d smartcityops -c "\conninfo"`

**Önemli işletim notu:** Postgres process'i, başlatıldığı terminal penceresi kapanınca (veya
bilgisayar uyku moduna girince) duruyor — her yeni oturumda `pg_isready` ile kontrol edilip
gerekirse adım 4 tekrar çalıştırılmalı.

**Sonuç:** connection string (`Host=localhost;Port=5432;Database=smartcityops;
Username=smartcityops;Password=smartcityops`) hiçbir makinede değişmiyor — ev ortamında
(Docker) ve iş ortamında (portable binary) aynı.

---

## 5. Şu Anki Tam Proje Ağacı

```
smart-city-ops/
├── .gitignore
├── docker-compose.yml
├── docs/
│   └── DEVELOPMENT_LOG.md   (bu dosya)
├── Src/
│   ├── SmartCityOps.sln
│   ├── SmartCityOps.Domain/
│   │   ├── Common/EntityBase.cs
│   │   ├── Enums/ (IncidentType, IncidentPriority, IncidentStatus, FieldUnitType, FieldUnitStatus)
│   │   └── Entities/ (Incident.cs, FieldUnit.cs)
│   ├── SmartCityOps.Application/
│   │   └── Incidents/ (IncidentDto.cs, CreateIncidentDto.cs, IIncidentService.cs)
│   ├── SmartCityOps.Infrastructure/
│   │   ├── DependencyInjection.cs
│   │   ├── Incident/IncidentService.cs
│   │   └── Persistence/
│   │       ├── ApplicationDbContext.cs
│   │       ├── Configurations/ (IncidentConfiguration.cs, FieldUnitConfiguration.cs)
│   │       └── Migrations/ (InitialCreate, AddFieldUnit)
│   ├── SmartCityOps.Api/
│   │   ├── Controllers/IncidentsControllers.cs
│   │   ├── Program.cs             (CORS + port 5080 + Infrastructure DI)
│   │   ├── appsettings.json / appsettings.Development.json
│   │   └── Properties/launchSettings.json
│   └── incident-generator/
│       ├── SmartCityOps.IncidentGenerator.csproj
│       ├── Program.cs
│       ├── Worker.cs
│       ├── IncidentGeneratorOptions.cs   (içindeki sınıf adı: IncidentGenerator)
│       └── appsettings.json / appsettings.Development.json
├── frontend/
│   ├── .env / .env.example
│   └── src/ (bkz. bölüm 3)
```

`backend/` klasörü artık yok (13 Ağustos'ta `Src/`'e taşındı, eski hâli commit'ten temizlendi).

---

## 6. Sıradaki Adım

**Tamamlananlar (13 Ağustos itibarıyla):** FieldUnit entity + seed data, Incident için minimal
Application+Api katmanı, CORS, Incident Generator — uçtan uca doğrulandı (Generator → Api →
Postgres → GET ile görüntülenebiliyor).

**Hemen sıradaki:** Frontend'i gerçek API'ye bağlamak —
1. `features/incidents` zaten yazılmış `fetchIncidents`/`useIncidents`'i gerçek backend'e
   bağlayıp haritada incident marker'larını göstermek.
2. `features/field-units` için aynı deseni (api/hooks/components) sıfırdan kurup FieldUnit
   verisini de haritada göstermek.
3. Ardından: `OperationalTask` entity'si (Incident + FieldUnit'i birbirine bağlayan ilişki) →
   task oluşturma/atama/durum güncelleme UI akışı → Level 1'in deliverable'ı tamamlanmış olur.

**Küçük temizlik kalemleri (bloklayıcı değil):**
- `Infrastructure/Incident` klasör adını `Infrastructure/Incidents` (çoğul) yaparak Application
  katmanıyla tutarlı hale getirmek.
- `Controllers/IncidentsControllers.cs` dosya adındaki fazladan "s"yi düzeltmek.
- `Program.cs` ve `Worker.cs`'te mentörün bıraktığı `// TODO` yorumlarını (CORS ayarlarının
  config'e taşınması, solution'ların birleştirilmesi, ortak kodun paylaşılan bir projeye
  çıkarılması gibi) değerlendirmek.

---

## 7. Sürüm Notları / Düzeltmeler

- **12 Ağustos 2026:** `Npgsql.EntityFrameworkCore.PostgreSQL`'in en güncel sürümü (10.0.3)
  `net10.0` istiyor, `net8.0` ile uyumsuz çıktı → 8.0.10'a sabitlendi.
- **12 Ağustos 2026:** `Microsoft.EntityFrameworkCore.Design` paketinin yalnızca
  Infrastructure'da değil, startup project'te (Api) de referanslı olması gerektiği migration
  komutu çalıştırılırken ortaya çıktı → Api projesine de eklendi.
- **13 Ağustos 2026:** Windows'un Türkçe locale'i `initdb`'yi kırdı (ASCII-olmayan karakter
  içeren locale adı) → `--locale=C` ile açıkça belirtilerek çözüldü.
- **13 Ağustos 2026:** Backend portu `launchSettings.json`'da `5159` (şablon varsayılanı),
  frontend'in beklediği port `5080` — uyuşmuyordu → `launchSettings.json` düzeltildi.
- **13 Ağustos 2026:** `Microsoft.Extensions.Http` paketi Generator projesinde `10.0.11` olarak
  kuruldu, `Microsoft.Extensions.Hosting` ise `9.0.19` — major versiyon uyuşmazlığı, tutarlılık
  için `9.0.19`'a sabitlendi.
- **13 Ağustos 2026:** Generator, backend'e `POST http://localhost:5080/incidents` atıyordu
  (`/api` eksik) — sebep: `appsettings.json`'daki `ApiBaseUrl` sonunda `/` yoktu, göreli URL
  birleştirmesi son path segmentini değiştirdi → sonuna `/` eklenerek düzeltildi.
- **13 Ağustos 2026:** `.gitignore`'daki `bin/`/`obj/` kuralları eski klasör isimlerine
  (`backend/`, `incident-generator/`) sabitlenmişti, `Src/` taşımasından sonra hiçbir şeyi
  yakalamaz oldu → genel (anchor'sız) `bin/`/`obj/` kurallarına geçildi.
- **13 Ağustos 2026:** Proje `backend/src/` yapısından repo-kökü `Src/` düz yapısına taşındı,
  tek bir `Src/SmartCityOps.sln` altında birleştirildi (bkz. bölüm 2.6).

---

## 8. Frontend — API Bağlantısı ve Harita Marker Entegrasyonu (13 Ağustos, akşam oturumu)

### 8.1 Tespit — veri çekme katmanı zaten hazırmış

Oturuma başlarken yapılan incelemede `incidentsApi.ts` ve `useIncidents.ts`'in **zaten doğru**
yazılmış olduğu görüldü: `httpClient.ts`'teki `baseURL` (`http://localhost:5080/api`) backend'in
gerçek portuyla uyumlu, `fetchIncidents()` → `GET /incidents` backend'deki
`IncidentsController.GetAll` ile birebir eşleşiyor, ve `IncidentDto` (backend) ile `Incident`
(frontend `types.ts`) alan alan örtüşüyor (`id, type, priority, status, reportedAt, latitude,
longitude, description`) — ASP.NET Core'un varsayılan camelCase serileştirmesi sayesinde ayrı bir
mapping katmanına gerek kalmadı.

Eksik olan, bu verinin haritaya ve panele taşınmasını sağlayan **bağlantı telleriydi**:
`OperationsMap` hiç prop almıyordu (marker yoktu), `App.tsx`'teki `selectedIncident` state'inin
setter'ı hiç kullanılmıyordu, ve `OperationsCenterLayout` haritayı kendi içinde hardcode ettiği
için `App.tsx`'teki state haritaya hiç ulaşamıyordu.

### 8.2 Karar — CSS, `.tsx` dosyalarından tamamen ayrılacak

Mentör, inline `style={{...}}` kullanımının okunurluğu düşürdüğünü belirterek yeni bir proje
kuralı koydu: **hiçbir `.tsx` dosyasında satır içi stil objesi bulunmayacak.** Component'i
barındıran her klasörün (`components/` olan her yerde, ve `layouts/`) yanında bir **kardeş
`styles/` klasörü** olacak, dosya adı component adıyla birebir eşleşecek:

```
layouts/
├── OperationsCenterLayout.tsx
└── styles/
    └── OperationsCenterLayout.css
features/operations-map/
├── components/OperationsMap.tsx
└── styles/OperationsMap.css
```

**CSS Modules vs. düz CSS + BEM tartışıldı** — CSS Modules (Vite'ta kurulumsuz çalışıyor,
class isimlerini otomatik benzersizleştiriyor) önerildi ama mentör **düz CSS + BEM**'i tercih
etti. BEM deseni: kök class component adının kebab-case hâli (`operations-center-layout`), alt
elemanlar `__` ile (`operations-center-layout__map`, `operations-center-layout__side-panel`).
Bu proje ölçeğinde çakışma riski düşük görüldüğü için manuel disiplin yeterli kabul edildi.

### 8.3 Yapılan değişiklikler

**`layouts/OperationsCenterLayout.tsx` + yeni `layouts/styles/OperationsCenterLayout.css`:**
- Kendi içinde hardcode ettiği `<OperationsMap />` çağrısı ve import'u kaldırıldı.
- `sidePanel` gibi bir de `map: ReactNode` prop'u eklendi — layout artık haritanın hangi
  component olduğunu bilmiyor, sadece yerleşimden (sol büyük alan / sağ 360px panel) sorumlu.
  Gerekçe: layout'un `operations-map` feature'ına doğrudan bağımlılığı olmamalı.
- Tüm `style={{}}` kullanımları `className` + BEM class'larına taşındı.

**`features/operations-map/` — yeni `styles/OperationsMap.css`, yeni `hooks/useIncidentMarkers.ts`:**
- `OperationsMap.tsx` artık `incidents: Incident[]` ve `onSelectIncident: (incident: Incident) =>
  void` prop'larını alıyor.
- Marker yaşam döngüsü (incidents değişince eskilerini silip yenilerini eklemek) bilinçli olarak
  `OperationsMap.tsx`'in içine değil, ayrı bir `useIncidentMarkers` hook'una yazıldı — component
  "haritayı kur" sorumluluğunda kalsın, marker yönetimi ayrı bir kaygı (concern) olarak kalsın diye.
- **Teknik detay — `mapRef` yerine `useState`:** Harita `mapRef.current`'e senkron olmayan bir
  zamanda (mount sonrası) atanıyor; bir `ref`'in içeriği değiştiğinde React otomatik re-render/
  effect tetiklemiyor. Bu yüzden `OperationsMap` haritayı hem `ref`'te hem `useState`'te tutuyor —
  state değiştiğinde `useIncidentMarkers`'ın `useEffect`'i doğru zamanda tetikleniyor.
- **Bilinçli eksik — `selectedIncidentId` prop'u eklenmedi:** Seçili marker'ı görsel olarak
  vurgulamak case study'de Level 2 kapsamı ("Highlight high-priority incidents"). Şu an
  kullanılmayacak bir prop eklemek YAGNI'ye aykırı olurdu — ihtiyaç çıkınca eklenecek.

**`app/App.tsx`:**
- `selectedIncident` state'inin setter'ı (`setSelectedIncident`) artık gerçekten kullanılıyor.
- `OperationsMap`, `OperationsCenterLayout`'un `map` slotuna `incidents={incidents ?? []}` ve
  `onSelectIncident={setSelectedIncident}` ile veriliyor. `incidents ?? []`: react-query veri
  gelene kadar `undefined` döndürüyor, `OperationsMap`'in `Incident[]` (non-nullable) prop
  tipiyle uyuşsun diye boş diziye düşürülüyor.

**`features/incidents/components/IncidentPanel.tsx`:** Mantık zaten doğruydu (incident'ı
gösteriyor, `null` durumunu ele alıyordu), sadece bayatlamış bir yorum satırı temizlendi.

**Sonuç — veri akışı zinciri:**
```
useIncidents (react-query)
  → App.tsx (incidents, selectedIncident state)
    → OperationsMap (marker'ları çizer, tıklamayı onSelectIncident'a bağlar)
      → useIncidentMarkers (marker yaşam döngüsü)
    → IncidentPanel (selectedIncident'ı gösterir)
```

### 8.4 Doğrulama

Bu makinede PostgreSQL kurulu olmadığı için backend çalıştırılamadı — uçtan uca canlı test
**yapılamadı**, iş bilgisayarında (Postgres kurulu) ertesi gün yapılacak. Bu oturumda sadece
statik doğrulama yapıldı:
- `npx tsc --noEmit` → temiz, tip hatası yok.
- `npm run build` → başarılı (`dist/assets/index-*.js` ~1.27MB, gzip ~347KB). Çıkan "chunk size
  500KB'ı geçti" uyarısı bir hata değil, `maplibre-gl`'in büyüklüğünden kaynaklanan standart bir
  bilgilendirme — Level 1 kapsamında code-splitting'e girilmedi, bilinçli olarak ertelendi.

**Yarın (iş bilgisayarında) yapılacak:** `dotnet run` (backend) + `npm run dev` (frontend) aynı
anda ayakta iken haritada Ankara civarında marker'ların göründüğünü, birine tıklayınca sağdaki
panelde detayların geldiğini doğrulamak. Çalışmazsa ilk bakılacak yerler: CORS origin'i
(`5173`), backend portu (`5080`), tarayıcı console'undaki network hataları.

---

## 9. Mac'te Uçtan Uca Doğrulama — İki Gerçek Bug Bulundu ve Düzeltildi (13 Ağustos, gece)

Aynı akşam, kişisel Mac'e Postgres kurulup backend + generator + frontend aynı anda ayağa
kaldırılınca harita hiç görünmedi (boş/düz renkli bir dikdörtgen). İki ayrı, birbirinden
bağımsız kök nedene sahip gerçek bug tespit edildi ve düzeltildi — ikisi de tarayıcı üzerinden
canlı DOM/network incelemesiyle (okuma amaçlı, kod değiştirmeden) kanıtlandı, sonra çözüldü.

### 9.1 Bug #1 — MapLibre canvas'ı container'ın boyutunu hiç öğrenemiyordu

**Belirti:** `.operations-map` container'ı doğru boyuttaydı (887×720px, sol paneli tam
dolduruyordu) ama içindeki `<canvas>` sabit **400×300px**'de kalıyordu — harita küçük bir kutuya
sıkışmış görünüyordu.

**Kök neden:** `main.tsx`'te `<StrictMode>` aktif. React 18, dev modda her component'in
`useEffect`'ini bilerek **mount → cleanup → tekrar mount** şeklinde iki kere çalıştırıyor (bug
yakalamaya yardımcı olsun diye). `OperationsMap`'in harita kurulum effect'i bu çifte
çalıştırmadan geçince: ilk `Map` örneği oluşturuluyor, hemen StrictMode onu söküyor, aynı
container'a ikinci bir `Map` örneği kuruluyor. MapLibre'nin container boyutunu otomatik takip
eden dahili `ResizeObserver` mekanizması bu hızlı kur-yık-kur döngüsünde container'ın gerçek
boyutunu hiç öğrenemiyor — bilinen bir React 18 StrictMode + MapLibre/Mapbox GL etkileşim sorunu.

**Çözüm:** MapLibre'nin dahili boyut takibine güvenmek yerine, `OperationsMap.tsx`'teki kurulum
`useEffect`'ine kendi `ResizeObserver`'ımız eklendi — container boyutu her değiştiğinde açıkça
`instance.resize()` çağrılıyor. Bu, StrictMode'dan bağımsız çalışır ve flex/responsive layout
içine harita gömme senaryosunda zaten standart bir pratik. `resizeObserver.disconnect()` effect
cleanup'ına eklendi (sızıntı olmasın diye).

**Doğrulama:** Değişiklik sonrası `.operations-map` ve içindeki `canvas` ikisi de **887×720**
olarak ölçüldü — birebir eşleşiyor.

### 9.2 Bug #2 — Vite dev server, MapLibre'nin Web Worker dosyasını 404 veriyordu

Stil değişse bile (bkz. 9.3) harita hâlâ boş kalıyordu. Derin teşhis (`map.isStyleLoaded()`,
`map.queryRenderedFeatures()`, doğrudan `fetch()` ile tile/style/worker isteklerinin tek tek
kontrolü) şunu ortaya çıkardı:
- Stil JSON'u (200 OK), sprite/glyph adresleri, hatta gerçek vektör tile verisi (`.pbf`, Ankara
  için 71KB) sorunsuz iniyordu — veri/ağ tarafında hiçbir sorun yoktu.
- Ama `GET http://localhost:5173/node_modules/.vite/deps/maplibre-gl-worker.mjs` → **404**.

**Kök neden:** MapLibre GL JS, indirdiği ham vektör tile verisini ekrana basılabilir hale
getirmek (decode etmek) için ayrı bir Web Worker thread'i kullanıyor; worker'ın script adresini
çalışma zamanında dinamik olarak hesaplıyor. Projenin `vite` sürümü çok yeni (Rolldown tabanlı,
`^8.2.0`) — Vite'ın bağımlılık ön-derleme ("dependency pre-bundling") mekanizması bu dinamik
adresi statik olarak analiz edemiyor, worker dosyasının önbellekteki gerçek adresiyle
MapLibre'nin istediği adres uyuşmuyor → 404. Worker hiç başlayamadığı için indirilen veri asla
decode edilip çizilemiyordu; bu bir "worker yüklenemedi" durumu olduğu için MapLibre'nin `error`
event'i olarak da yakalanmıyordu (konsolda sessiz kalıyordu) — bu yüzden teşhisi zaman aldı.

**Çözüm:** `frontend/vite.config.ts`'e `optimizeDeps: { exclude: ['maplibre-gl'] }` eklendi.
Bu ayarla Vite, `maplibre-gl`'i ön-derlemeden, `node_modules` içindeki orijinal haliyle native
ES module olarak servis ediyor — kütüphane kendi worker adresini artık kendi gerçek konumuna
göre hesaplıyor, önbellek yol uyuşmazlığı ortadan kalkıyor. MapLibre/Mapbox GL + Vite
kombinasyonunda topluluğun bilinen standart çözümü.

**Teşhis sırasında** `OperationsMap.tsx`'e geçici olarak `window.__debugMap = instance` ve bir
`error` event dinleyicisi eklenmişti — kalıcı koda dahil edilmeden, çözüm uygulanırken kaldırıldı.

### 9.3 Harita stili değişikliği — `demotiles` yerine OpenFreeMap, Ankara'ya kilitleme

İki bug'dan bağımsız, üçüncü bir gözlem: `demotiles.maplibre.org` stili MapLibre'nin kendi
**demo/test amaçlı**, çok düşük detaylı (sadece kaba ülke sınırları) stili — şehir/mahalle
ölçeğinde (`zoom: 12`, Ankara) hiçbir ayrıntı içermiyor, o yüzden zumlanınca tek düz renk
görünüyordu.

**Çözüm:**
- Stil kaynağı **OpenFreeMap**'in ücretsiz, API key/billing gerektirmeyen vektör stiline
  çevrildi: `https://tiles.openfreemap.org/styles/liberty`. Bu, projenin başındaki "API
  key/billing gerektirmiyor" mimari kararına (bkz. `DEVELOPMENT_LOG.md` bölüm 1) uyumlu, gerçek
  sokak/şehir detayı sağlıyor.
- Harita, case study'nin "Operations Center bir şehre özel" varsayımıyla tutarlı olsun diye
  Ankara'ya kilitlendi: `minZoom: 10` ve `maxBounds` (enlem 39.6–40.2, boylam 32.4–33.3'ü
  kapsayan bir kutu) eklendi — operatör haritayı dünyanın başka bir yerine kaydıramıyor/
  uzaklaştıramıyor.

### 9.4 `incident-generator` — `net9.0` → `net8.0` (bu Mac'te SDK uyumsuzluğu nedeniyle)

Daha önce (bölüm 6/7'de not düşülen) bilinen bir tutarsızlık vardı: `incident-generator`
`net9.0`'ı hedefliyordu, diğer 4 backend projesi `net8.0`. Karar, "sorun çıkarmadığı sürece
dokunulmasın" şeklindeydi (proje `ProjectReference` içermediği için derleme zamanı riski yoktu).

Bu Mac'te sadece **.NET SDK 8.0.423** kurulu olduğu için (`.NET 9.0` SDK'sı yok), `dotnet run`
`NETSDK1045` hatasıyla çöktü — "sorun çıkarsa düzeltiriz" koşulu gerçekleşti. Çözüm:
- `SmartCityOps.IncidentGenerator.csproj`'da `<TargetFramework>` `net9.0`'dan `net8.0`'a indirildi.
- `Microsoft.Extensions.Hosting`/`Microsoft.Extensions.Http` paket sürümleri `9.0.19`'dan
  `8.0.1`'e indirildi. **Not:** İlk denemede `8.0.10` yazıldı (diğer projelerdeki
  `Npgsql`/`EFCore.Design` paketleriyle görsel tutarlılık için) ama NuGet'te bu paketler için
  `8.0.10` diye bir sürüm **yayınlanmamış** — restore sessizce en yakın sürüm olan `9.0.0`'ı
  çözümledi (bu, `net8.0` hedeflerken gizlice `net9` paketlerini çekmek anlamına geliyordu,
  amacın tam tersi). NuGet API'sinden gerçek mevcut sürümler sorgulanıp (`8.0.0`, `8.0.1`)
  doğru sürüm (`8.0.1`) yazılınca `dotnet build` 0 uyarı/0 hata ile geçti. **Ders:** Farklı NuGet
  paket ailelerinin sürüm numaralandırması birbirinden bağımsız — "diğer paket şu sürümde, bu da
  öyle olsun" varsayımı yanlış olabilir, gerçek mevcut sürüm her zaman doğrulanmalı.

### 9.5 Sonuç — ilk başarılı uçtan uca test

Bu Mac'e (EnterpriseDB "Binaries", macOS, PostgreSQL 18.6 — mimari kararda "16" yazsa da
işlevsel fark yaratmadı) portable Postgres kuruldu, `dotnet ef database update` ile migration'lar
uygulandı. Ardından backend (`SmartCityOps.Api`, `dotnet run`), generator (`incident-generator`,
`dotnet run`, artık `net8.0`) ve frontend (`npm run dev`) aynı anda ayağa kaldırıldı.

**Doğrulanan tam zincir:** Generator → `POST /api/incidents` → Postgres → `GET /api/incidents`
(gerçek veri, `curl` ile teyit edildi) → frontend `useIncidents` → `OperationsMap` → haritada
Ankara civarında marker'lar (gerçek sokak detaylarıyla) → marker'a tıklama → `IncidentPanel`'de
doğru detaylar. **İlk kez gerçek, canlı, uçtan uca test başarılı.**
