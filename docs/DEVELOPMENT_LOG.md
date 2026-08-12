# Smart City Operations Center — Teknik Dokümantasyon

**Son güncelleme:** 12 Ağustos 2026
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
| Konteynerleştirme | Docker Compose | Şu an sadece Postgres servisi tanımlı |
| Harita kütüphanesi | MapLibre GL JS | API key/billing gerektirmiyor |
| Gerçek zamanlı iletişim | SignalR (planlandı, henüz backend'de yok) | Harita canlı güncellemesi için |

Backend bağımlılık yönü (Clean Architecture):

```
Api ──► Infrastructure ──► Application ──► Domain
 │                                            ▲
 └────────────────────────────────────────────┘
```

Domain hiçbir katmana bağımlı değil; framework'süz saf C#.

---

## 2. Backend — Solution Yapısı

### 2.1 Proje iskeleti
`backend/SmartCityOps.sln` altında 4 proje:

```
backend/
└── src/
    ├── SmartCityOps.Domain/          (classlib — framework'süz)
    ├── SmartCityOps.Application/      (classlib — use case'ler, henüz boş)
    ├── SmartCityOps.Infrastructure/   (classlib — EF Core burada kurulacak)
    └── SmartCityOps.Api/              (webapi — controller tabanlı)
```

Şablonların ürettiği örnek dosyalar (`Class1.cs`, `WeatherForecast*.cs`) silindi.

### 2.2 Domain katmanı — mevcut durum

```
Domain/
├── Common/
│   └── BaseEntity.cs          — tüm entity'lerin ortak Id (Guid) alanı
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
Incident : BaseEntity
├── Id            : Guid                (BaseEntity'den miras)
├── IncidentCode  : string               (örn. "INC-2026001")
├── Type          : IncidentType         (enum)
├── Priority      : IncidentPriority     (enum)
├── Status        : IncidentStatus       (enum)
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
olarak tutuluyor; bu alan sadece görüntüleme/referans amaçlı, PK değil (string PK, index/performans
açısından dezavantajlı).

**Karar — Type/Priority/Status enum, string değil:**
Yazım hatalarının derleme zamanında yakalanması için (`"Hgih"` gibi bir hata runtime'da patlamak
yerine derlemede engellenir). EF Core bunları Postgres'te saklarken tip seçimi (int/string)
Infrastructure katmanında `IEntityTypeConfiguration` ile ayrıca kararlaştırılacak.

**Karar — Latitude/Longitude düz alan, ayrı Value Object değil:**
Level 1'de PostGIS kullanılmıyor, basitlik tercih edildi (YAGNI). İleride mesafe hesabı ağırlaşırsa
(Level 3 — ETA, öneri motoru) bu alanların bir `Location` value object'ine veya PostGIS `Point`
tipine refactor edilmesi planlanıyor.

**Karar — `recommendedUnits` alanı entity'ye eklenmedi:**
Kağıttaki örnek JSON'da bu alan var, ancak case study'de bu açıkça **Level 3 gereksinimi**
olarak tanımlanıyor ("Recommend suitable field units for new tasks"). Bunu Incident'a generator'dan
gelen statik bir liste olarak koymak iki sorun yaratırdı:
  - **Bayatlama:** Incident oluşturulduğu anda hesaplanan öneri, unit durumları değiştikçe
    güncellenmeyip yanlış bilgi haline gelir.
  - **Level 3 ile çakışma:** İleride yazılacak gerçek öneri motoru (mesafe + müsaitlik + uygunluk
    hesaplayan bir servis) ile generator'ın verdiği statik liste çelişebilir.

  Karar: bu, entity'nin sabit bir alanı değil, ileride bir **servisin dönüş değeri** olmalı.
  Alternatif olarak nullable/bilgi-amaçlı bir `RecommendedUnitsHint` alanı tartışıldı ama
  YAGNI gerekçesiyle reddedildi.

**Karar — Entity'ler "anemic" (davranışsız) kalacak:**
Level 1'de constructor/validasyon/iş kuralı metodu yok; entity'ler sade veri taşıyıcılar.
İş kuralları Application katmanında yaşayacak. Bu, DDD'nin "rich domain model" yaklaşımının
tersi ama Level 1'in basitlik hedefiyle bilinçli olarak tercih edildi.

**Doğrulama:** `dotnet build` → 0 hata, 0 uyarı.

### 2.4 Infrastructure katmanı — EF Core + Npgsql kurulumu

**Kurulan NuGet paketleri (8.0.10, EF Core 8 / net8.0 ile uyumlu sürüme sabitlendi):**
- `SmartCityOps.Infrastructure.csproj` → `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Design`
- `SmartCityOps.Api.csproj` → `Microsoft.EntityFrameworkCore.Design`

Not: İlk planda `Design` paketinin sadece Infrastructure'da yeterli olacağı varsayılmıştı.
`dotnet ef migrations add` komutu çalıştırılırken **startup project'in de (Api) bu paketi
referanslamasının şart olduğu** ortaya çıktı — hata mesajı bunu net şekilde belirtti, paket
Api'ye de eklendi.

**`dotnet-ef` CLI aracı** global olarak kuruldu (`dotnet tool install --global dotnet-ef
--version 8.0.10`) — bu bir proje paketi değil, sistem genelinde çalışan bir komut satırı aracı,
migration komutlarını çalıştırmak için gerekli.

**Oluşturulan/değiştirilen dosyalar:**

| Dosya | İçerik |
|---|---|
| `Infrastructure/Persistence/ApplicationDbContext.cs` | `DbSet<Incident> Incidents`; `OnModelCreating` içinde `ApplyConfigurationsFromAssembly` çağrısı — ileride FieldUnit/Task eklenince bu dosyaya tekrar dokunmadan yeni `Configuration` sınıfları otomatik keşfedilecek |
| `Infrastructure/Persistence/Configurations/IncidentConfiguration.cs` | `IEntityTypeConfiguration<Incident>` — Fluent API ile şema kuralları (aşağıda detay) |
| `Infrastructure/DependencyInjection.cs` | `AddInfrastructure()` extension metodu — `Program.cs`'i ince tutmak için, DbContext DI kaydı burada |
| `Api/appsettings.Development.json` | `ConnectionStrings:DefaultConnection` eklendi (docker-compose'daki Postgres kimlik bilgileriyle birebir) |
| `Api/Program.cs` | `builder.Services.AddInfrastructure(builder.Configuration);` satırı eklendi |

**`IncidentConfiguration.cs` içindeki kararlar (onaylandı):**
- **Karar A — `IncidentCode` üzerinde unique index.** Aynı incident kodu iki kez kaydedilemesin
  diye veritabanı seviyesinde garanti. Uygulama kodunun her seferinde "acaba var mı" kontrolü
  yapmasına gerek bırakmıyor.
- **Karar B — `Type`/`Priority`/`Status` enum'ları Postgres'te `string` olarak saklanıyor**
  (`int` değil). Gerekçe: (1) tabloya doğrudan bakınca `"Resolved"` okunabiliyor, `2` değil —
  debug/demo kolaylığı; (2) enum'a yeni değer eklenip sıra değişirse eski kayıtların anlamı
  kaymıyor — `int` saklansaydı bu risk vardı; (3) bu ölçekte (staj projesi, yüksek trafik yok)
  string'in ek yer kaplaması önemsiz.

**Migration:**
```
dotnet ef migrations add InitialCreate \
  --project src/SmartCityOps.Infrastructure \
  --startup-project src/SmartCityOps.Api \
  --output-dir Persistence/Migrations
```
Üretilen dosyalar: `Persistence/Migrations/20260812205108_InitialCreate.cs` (+ `.Designer.cs`,
`ApplicationDbContextModelSnapshot.cs`).

Migration'ın `Up()` metodu şu tabloyu oluşturuyor (uygulanmadan önce elle incelendi):

```
CreateTable "Incidents"
  Id           uuid                     PK
  IncidentCode character varying(50)    NOT NULL, UNIQUE INDEX
  Type         character varying(50)    NOT NULL
  Priority     character varying(20)    NOT NULL
  Status       character varying(20)    NOT NULL
  ReportedAt   timestamp with time zone NOT NULL
  Latitude     double precision         NOT NULL
  Longitude    double precision         NOT NULL
  Description  text                     NOT NULL
```

**Durum: Migration oluşturuldu, Postgres'e HENÜZ UYGULANMADI.** `dotnet ef database update`
komutu, kullanıcı onayı bekleniyor — veritabanına ilk kez dokunulacağı için önce migration
dosyası birlikte incelendi.

**Doğrulama:** `dotnet build` → 0 hata, 0 uyarı (paket kurulumları ve yeni dosyalardan sonra).

### 2.5 Henüz yapılmayanlar (backend)

- **`dotnet ef database update`** — migration'ı gerçek Postgres container'ına uygulamak (bir sonraki adım, onay bekleniyor)
- Application: `IncidentDto`, `IIncidentService`/`IncidentService`
- Api: `IncidentsController` (GET/POST/PATCH endpoint'leri)
- SignalR: `OperationsHub`
- `incident-generator/`: Worker Service implementasyonu (proje bile henüz oluşturulmadı)
- FieldUnit, OperationalTask entity'leri

---

## 3. Frontend — Klasör Yapısı ve Durum

Vite + React + TypeScript ile kuruldu, feature-based (özellik bazlı) klasörleme kullanılıyor —
React'te Clean Architecture'ın eşdeğeri budur; component-type bazlı (`components/`, `pages/`)
klasörleme yerine tercih edildi çünkü haritanın "ana arayüz" olması gereksinimi her feature'ın
kendi map-layer'ını izole yönetmesini gerektiriyor.

```
frontend/src/
├── app/
│   ├── App.tsx              ✅ dolu
│   └── providers.tsx         ✅ dolu — QueryClientProvider
├── features/
│   ├── incidents/            ✅ Level 1 için dolu
│   │   ├── api/incidentsApi.ts
│   │   ├── hooks/useIncidents.ts
│   │   ├── components/IncidentPanel.tsx
│   │   └── types.ts
│   ├── field-units/           ⏳ iskelet (Aşama 4)
│   ├── tasks/                 ⏳ iskelet (Aşama 5)
│   ├── operations-map/        ✅ MapLibre kurulumu çalışıyor
│   └── dashboard/              ⏳ iskelet (Aşama 2/6)
├── shared/
│   ├── lib/httpClient.ts       ✅ axios, VITE_API_BASE_URL'den okuyor
│   ├── lib/signalRConnection.ts ✅
│   ├── hooks/useSignalR.ts      ✅
│   └── types/common.ts          ✅
├── layouts/OperationsCenterLayout.tsx  ✅
└── main.tsx                    ✅
```

**`features/incidents/types.ts` içindeki `Incident` tipi**, backend'deki `Incident` entity'sinin
alan isimlerinin camelCase karşılığıdır (`incidentCode` hariç — henüz frontend tipine eklenmedi,
backend Aşama 1 tamamlanınca senkronize edilecek).

### 3.1 Kurulu paketler ve amaçları

| Paket | Amaç |
|---|---|
| `@tanstack/react-query` | Backend verisini cache'leyip yönetmek |
| `axios` | HTTP istekleri |
| `zustand` | İstemci tarafı UI state |
| `maplibre-gl` | Harita |
| `@microsoft/signalr` | Gerçek zamanlı güncellemeler |
| `react-router-dom` | Kurulu, henüz kullanılmıyor (ileride sayfa yönlendirme için) |

### 3.2 Karşılaşılan ve çözülen hata

`maplibre-gl` v6'da default export kaldırılmış. `import maplibregl from "maplibre-gl"`
tarayıcıda `SyntaxError: does not provide an export named 'default'` hatası verdi.
Çözüm: named export'a geçildi — `import { Map as MapLibreMap } from "maplibre-gl"`.
(Dosya: `features/operations-map/components/OperationsMap.tsx`)

### 3.3 Doğrulama

- `npx tsc --noEmit` → tip hatası yok
- Dev server → tarayıcıda açıldı, harita render oluyor, sağ panel görünüyor
- `npm run build` → production build temiz (Dockerfile'ın temeli olacak)
- Kalan konsol hataları (SignalR negotiation, `ERR_CONNECTION_REFUSED`) backend henüz
  ayakta olmadığı için **beklenen**, Aşama 1 tamamlanınca kaybolacak

---

## 4. Altyapı

### 4.1 `.gitignore`
Proje kökünde, üç ekosistemi kapsıyor: .NET (`bin/`, `obj/`, `.vs/`), Node (`node_modules/`,
`dist/`), ortam/sırlar (`.env`, `.env.*` — `.env.example` hariç — `appsettings.Local.json`),
Docker (`docker-compose.override.yml`), IDE/OS dosyaları.

Bilinçli istisna: `appsettings.Development.json` **ignore edilmiyor** — içinde gerçek bir sır yok
(local Postgres bağlantı bilgisi), repo'da izlenmesi gerekiyor.

### 4.2 `docker-compose.yml`
Şu an sadece `postgres` servisi tanımlı (`postgres:16-alpine`, port `5432:5432`, healthcheck,
kalıcı volume). Backend/frontend `Dockerfile`'ları henüz yazılmadı — kod olgunlaştıkça eklenecek.

**Doğrulandı:** `docker compose up -d` → `smartcityops-postgres` container'ı `healthy` durumda.

### 4.3 Docker bağımlılığı kararı — kurumsal PC kısıtı

Stajdaki PC'de Docker kurulamıyor (admin yetkisi yok, Hyper-V/WSL2 sanallaştırma sürücüsü
elevation gerektiriyor). Bu yüzden:

- Docker Compose, **günlük geliştirme bağımlılığı değil, teslimat paketi** olarak konumlandırıldı.
- Ev ortamı: Docker container'daki Postgres → `localhost:5432`
- İş ortamı: Portable (kurulum gerektirmeyen, admin istemeyen) PostgreSQL binary → aynı şekilde
  `localhost:5432`'yi dinleyecek
- Sonuç: connection string **hiçbir makinede değişmiyor**, iki ortam arasında kod/config farkı yok.
- Yedek plan: Eğer .exe çalıştırmak da politika ile engelliyse, ücretsiz bulut Postgres
  (Neon.tech, Supabase) — sadece connection string değişir, kod etkilenmez.

---

## 5. Şu Anki Tam Proje Ağacı

```
smart-city-ops/
├── .gitignore
├── docker-compose.yml
├── docs/
│   └── DEVELOPMENT_LOG.md   (bu dosya)
├── backend/
│   ├── SmartCityOps.sln
│   └── src/
│       ├── SmartCityOps.Domain/
│       │   ├── Common/BaseEntity.cs
│       │   ├── Enums/ (IncidentType, IncidentPriority, IncidentStatus)
│       │   └── Entities/Incident.cs
│       ├── SmartCityOps.Application/      (boş, Incidents/ klasörü hazır)
│       ├── SmartCityOps.Infrastructure/   (boş, Persistence/ klasörü hazır)
│       └── SmartCityOps.Api/              (boş Controllers/, Program.cs)
├── frontend/
│   ├── .env / .env.example
│   └── src/ (bkz. bölüm 3)
└── incident-generator/    (boş — Aşama 2)
```

---

## 6. Sıradaki Adım

**Hemen sıradaki:** `dotnet ef database update` ile `InitialCreate` migration'ını gerçek
Postgres container'ına uygulamak — onay bekleniyor. Bu adımdan sonra `Incidents` tablosu
pgAdmin/psql ile gözle görülebilir olacak.

Ardından: Application katmanı (`IncidentDto`, `IncidentService`) → Api katmanı
(`IncidentsController`, GET/POST/PATCH endpoint'leri) → frontend'de gerçek veri gösterimi.

---

## 7. Sürüm Notları / Düzeltmeler

- **12 Ağustos 2026:** `Npgsql.EntityFrameworkCore.PostgreSQL`'in en güncel sürümü (10.0.3)
  `net10.0` istiyor, `net8.0` ile uyumsuz çıktı → 8.0.10'a sabitlendi.
- **12 Ağustos 2026:** `Microsoft.EntityFrameworkCore.Design` paketinin yalnızca Infrastructure'da
  değil, **startup project'te (Api) de** referanslı olması gerektiği migration komutu çalıştırılırken
  ortaya çıktı → Api projesine de eklendi.
