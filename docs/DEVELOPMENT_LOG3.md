Tabii, aynı formatta (`DEVELOPMENT_LOG3.md` olarak, `docs/` altına) hazırlayayım. Kuralımız gereği dosyayı ben oluşturmuyorum — içeriği aşağıya yazıyorum, sen `docs/DEVELOPMENT_LOG3.md` olarak kaydedersin.

---

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 14 Ağustos 2026
**Kapsam:** Level 1 — Basic Operations Center (backend tamamlandı, frontend UI akışı devam ediyor)

Bu doküman, `DEVELOPMENT_LOG.md` ve `DEVELOPMENT_LOG2.md`'nin devamı niteliğinde — 14 Ağustos
oturumunda yapılan işleri ve alınan kararları kayıt altına alır.

---

## 1. Frontend — küçük düzeltmeler ve netleştirmeler

### 1.1 `httpClient.ts` / `signalRConnection.ts` — "hardcode API" yanlış anlaşılması netleştirildi

İlk bakışta `"http://localhost:5080/api"` gibi fallback string'lerin güvenlik açığı olduğu
düşünüldü. İncelemede görüldü ki bu değerler zaten `import.meta.env.VITE_API_BASE_URL ?? fallback`
deseniyle env'den okunuyor; fallback sadece `.env` yoksa devreye giren bir yedek.

**Netleştirilen kavram:** Frontend'e giden hiçbir şey "gizli" olamaz — `npm run build` sonrası
üretilen JS, kullanıcının tarayıcısına iniyor, DevTools'tan her zaman okunabilir. Env değişkenleri
güvenlik için değil, ortamlar arası (dev/prod) esneklik/konfigürasyon için var. Gizlenmesi gereken
şeyler (API key, secret) ile bir API'nin adresi birbirinden farklı kavramlar — proje zaten bir
API key gerektirmeyen servisler (MapLibre + OpenFreeMap) kullandığı için bu risk hiç yok.

Sonuç: kod değişikliği gerekmedi, sadece `.env` dosyasının (`.env.example`'dan kopyalanarak)
gerçekten oluşturulması gerektiği teyit edildi.

### 1.2 `App.tsx` içindeki UI parçası component'e taşındı

`<p>Toplam incident: {incidents?.length ?? 0}</p>` satırı `App.tsx`'in orkestrasyon
sorumluluğuna sızmış bir UI parçasıydı. Yeni bir component'e taşındı:

**Yeni dosya:** `frontend/src/features/incidents/components/IncidentsSummary.tsx`
```tsx
interface IncidentsSummaryProps {
  count: number;
}

export function IncidentsSummary({ count }: IncidentsSummaryProps) {
  return <p>Total Count of Incidents: {count}</p>;
}
```
`App.tsx`'te `<IncidentsSummary count={incidents?.length ?? 0} />` olarak kullanılıyor.
`?? 0` mantığı bilinçli olarak orkestrasyon katmanında (`App.tsx`) bırakıldı — component'e ham
veri + fallback hesabı değil, hazır bir sayı gönderiliyor.

**Karar — UI dili İngilizce:** `IncidentPanel.tsx`'teki metinler de bu oturumda Türkçe'den
İngilizce'ye çevrildi (`"Select an incident point to show details of it."` gibi) — bilinçli bir
tercih, UI dili İngilizce olacak; kod yorumları öğrenme amaçlı Türkçe kalmaya devam ediyor.

---

## 2. Gerçek zamanlı güncelleme — geçici polling çözümü

**Sorun:** Incident Generator arka planda periyodik olarak yeni incident üretiyor ama frontend
`useQuery`'nin varsayılan davranışı gereği (sadece mount/focus/manuel refetch'te veri çekiyor)
bunları otomatik göstermiyordu — sayfa manuel yenilenmeden yeni incident'lar görünmüyordu.

**Kalıcı çözüm (SignalR) ile geçici çözüm (polling) arasında tartışıldı:**
- SignalR: backend push eder, anlık, gereksiz istek yok — ama backend'de `OperationsHub` henüz yok.
- Polling (`refetchInterval`): tek satır, hemen çalışır — ama periyodik gereksiz istek + gecikmeli.

**Karar:** Kısa vadede `useIncidents.ts`'e `refetchInterval` eklendi (geçici çözüm olarak
işaretlendi). SignalR, mimari hedef olarak kalmaya devam ediyor, backend'de `OperationsHub`
yazılınca bu geçici çözüm kaldırılacak.

---

## 3. FieldUnit — Backend API (Application + Infrastructure + Api)

Incident'ta kurulan 3 katmanlı desenin birebir uyarlaması, tek fark: **`CreateAsync` yok** — field
unit'ler dış bir kaynaktan POST edilmiyor, sadece seed data'dan geliyor (YAGNI).

**Application katmanı** — `Src/SmartCityOps.Application/FieldUnits/`:
- `FieldUnitDto.cs` — `record`, entity'den ayrı (DB şeması ile API sözleşmesi bağımsız kalsın diye).
- `IFieldUnitService.cs` — sadece `GetAllAsync`.

**Infrastructure katmanı** — `Src/SmartCityOps.Infrastructure/FieldUnits/FieldUnitService.cs`:
- `AsNoTracking()` + `.Select()` projeksiyonu (Incident'takiyle aynı performans gerekçesi — SQL'e
  sadece ihtiyaç duyulan kolonlar yansısın).

**Api katmanı** — `Src/SmartCityOps.Api/Controllers/FieldUnitsController.cs`:
- `[Route("api/field-units")]`, sadece `GET`.

**Karar — namespace/klasör tutarlılığı:** `IncidentService`'in klasörü (`Infrastructure/Incident`,
tekil) ile namespace'i (`SmartCityOps.Infrastructure.Incidents`, çoğul) arasındaki bilinen
tutarsızlık (bkz. `DEVELOPMENT_LOG2.md` bölüm 2.6) burada **tekrarlanmadı** — `FieldUnits` hem
klasör hem namespace'te çoğul, tutarlı. `Incident` tarafındaki eski tutarsızlık bilinçli olarak
şimdilik dokunulmadan bırakıldı (ayrı bir "toplu temizlik" görevi olarak not düşüldü).

**DI kaydı:** `DependencyInjection.cs`'e `services.AddScoped<IFieldUnitService, FieldUnitService>();`
eklendi.

**Doğrulama:** `GET /api/field-units` → 5 kayıt (o an local DB'de elle girilmiş veri), doğru
camelCase JSON.

---

## 4. FieldUnit — Frontend

`features/field-units/` iskeleti dolduruldu, Incident'ın frontend deseninin birebir kopyası:

- `types.ts` — `FieldUnit` interface, backend `FieldUnitDto` ile alan alan örtüşüyor.
- `api/fieldUnitsApi.ts` — `fetchFieldUnits()`.
- `hooks/useFieldUnits.ts` — `useQuery`, `queryKey: ["field-units"]` (Incident'tan farklı key,
  cache karışmasın diye). `refetchInterval` **yok** — field unit'ler generator'dan gelmiyor,
  periyodik olarak değişmiyorlar, polling anlamsız.
- `hooks/useFieldUnitMarkers.ts` (`features/operations-map/hooks/`) — `useIncidentMarkers`'ın
  aynı deseni, ama tıklama/seçim yok (henüz bir ihtiyaç yok, YAGNI). Marker rengi `#2563eb`
  (mavi) — incident'ların varsayılan kırmızısından görsel olarak ayrışsın diye.
- `OperationsMap.tsx` — `fieldUnits` prop'u ve `useFieldUnitMarkers` çağrısı eklendi, harita
  kurulum mantığına dokunulmadı (sorumluluklar zaten ayrıydı, yeni marker türü eklemek düşük
  riskli oldu).
- `App.tsx` — `useFieldUnits()` çağrısı + `OperationsMap`'e `fieldUnits={fieldUnits ?? []}` geçildi.

**Doğrulama:** Haritada hem kırmızı (incident) hem mavi (field unit) marker'lar birlikte görünüyor.

---

## 5. FieldUnit seed data — kalıcı hale getirme (`HasData` migration)

**Tespit edilen sorun:** Field unit seed data'sı (`POL-01`, `MED-01`, vb.) sadece bir
geliştiricinin local Postgres'ine `psql` ile elle girilmişti — repoda hiçbir kaydı yoktu, repo
sıfırdan klonlanınca `FieldUnits` tablosu boş kalıyordu (reproducible değildi).

**Çözüm — EF Core `HasData`:** `FieldUnitConfiguration.cs`'e sabit GUID'lerle 5 kayıt `HasData`
ile eklendi:
```csharp
builder.HasData(
    new FieldUnit { Id = Guid.Parse("b9599661-..."), UnitCode = "POL-01", Type = FieldUnitType.Police, Status = FieldUnitStatus.Available, Latitude = 39.925, Longitude = 32.836 },
    // ... MED-01, FIR-01, UTL-01, TRF-01
);
```

**Neden sabit (elle yazılmış) GUID, `Guid.NewGuid()` değil:** `HasData`, migration oluşturulduğu
anda kod ne üretmişse onu migration dosyasına gömüyor. Rastgele GUID kullanılsaydı her
`migrations add` çalıştırmasında farklı bir değer üretilir, EF Core bunu "farklı satır" sanıp
anlamsız migration'lar üretirdi.

**Migration:** `SeedFieldUnits` (`20260814083349_SeedFieldUnits`) — `InsertData` (5 satır) +
`DeleteData` (rollback için, otomatik üretildi).

**Karşılaşılan hata — `dotnet ef database update` ilk denemede patladı:**
```
23505: duplicate key value violates unique constraint "IX_FieldUnits_UnitCode"
```
**Kök neden:** Local DB'de zaten elle girilmiş aynı `UnitCode`'lu (farklı `Id`'li) kayıtlar vardı,
migration'ın `InsertData`'sı `UnitCode` unique index'iyle çakıştı — beklenen davranış, veri
bütünlüğü koruması doğru çalıştı.

**Çözüm:** `psql` ile eski kayıtlar temizlendi (`DELETE FROM "FieldUnits";`), migration tekrar
uygulandı, bu sefer sorunsuz geçti. **Not:** portable Postgres kurulumunda `psql.exe` `PATH`'e
ekli değil, tam yolla (`& "...\pgsql\bin\psql.exe" ...`) çağırılması gerekiyor.

**Doğrulama:** `GET /api/field-units`'teki `id` değerleri artık migration'daki sabit GUID'lerle
eşleşiyor (eski rastgele GUID'ler değil) — seed data artık kalıcı ve tekrar üretilebilir.

---

## 6. `OperationalTask` — tasarım kararları (Incident ↔ FieldUnit ilişkisi)

Level 1'in "assign tasks to field units" / "update task status" gereksinimlerini karşılayan
entity. Aşağıdaki kurallar sohbet yoluyla netleştirildi, entity tasarımını doğrudan şekillendirdi:

- **Sadece `Available` field unit'ler bir task'a atanabilir.** Atanınca `Available → Dispatched`.
- **Bir field unit aynı anda sadece bir task'a atanabilir** (tek satır = tek fiziksel kaynak).
  Kapasite artırma ihtiyacı, aynı `Type`'tan yeni satırlar eklenerek (`POL-02`, `POL-03`...)
  çözülüyor — zaten seed data'nın kendi numaralandırma deseni buna uygun. Bunun teknik gerekçesi:
  `FieldUnit.Status` tek bir enum değeri taşıyabilir, "aynı anda hem meşgul hem müsait" durumu
  ifade edilemez — model zaten "1 unit = 1 aktif iş" varsayımı üzerine kurulu.
- **Incident `Open` iken bir task atanırsa, incident otomatik `InProgress`'e geçer.**
- **Bir task tamamlanınca, o task'ın field unit'i otomatik `Available`'a döner** — incident'ın
  tamamen `Resolved` olup olmamasından bağımsız (başka field unit'ler hâlâ görevde olabilir).
- **`OperationalTask`'ın kendi `Status`'u var** (`Assigned`, `Completed`) — Incident/FieldUnit
  status'larından türetilmiyor, çünkü "hangi task ne zaman tamamlandı" bilgisi (audit trail)
  ayrı bir kayıt gerektiriyor.
- **`OutOfService`**, task akışından bağımsız üçüncü bir field unit durumu — manuel olarak
  değiştirilecek (bakım/vardiya dışı), otomatik bir tetikleyicisi yok.

---

## 7. `OperationalTask` — Domain + Infrastructure

### 7.1 Entity ve enum

```csharp
public enum OperationalTaskStatus : byte { Assigned = 0, Completed = 1 }

public class OperationalTask : EntityBase
{
    public Guid IncidentId { get; set; }
    public Guid FieldUnitId { get; set; }
    public OperationalTaskStatus Status { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
```

**Karar — navigation property yok, sadece FK id'ler.** Projenin "anemic entity" felsefesiyle
tutarlı — `Incident`/`FieldUnit` de birbirine referans vermiyor. İlişkili veri gerektiğinde
servis katmanında join ile çözülüyor.

### 7.2 `OperationalTaskConfiguration.cs`

```csharp
builder.HasIndex(t => t.IncidentId);   // unique DEĞİL — sorgu performansı için
builder.HasIndex(t => t.FieldUnitId);  // unique DEĞİL — aynı field unit zamanla birden fazla
                                        // task'ta (geçmiş kayıt olarak) görünecek

builder.HasOne<Incident>().WithMany().HasForeignKey(t => t.IncidentId).OnDelete(DeleteBehavior.Restrict);
builder.HasOne<FieldUnit>().WithMany().HasForeignKey(t => t.FieldUnitId).OnDelete(DeleteBehavior.Restrict);
```

**Teknik detay — navigation property olmadan gerçek FK constraint:** `HasOne<T>()` (generic tip
parametresi, navigation property değil) + `WithMany()` (parametresiz) deseni, C# tarafında hiçbir
navigation olmadan veritabanı seviyesinde gerçek bir foreign key constraint kuruyor — anemic
entity tercihinden ödün vermeden referans bütünlüğü kazanılıyor.

**`OnDelete(DeleteBehavior.Restrict)` — varsayılan `Cascade` yerine:** Task kayıtları bir
audit/tarihsel kayıt niteliğinde — bağlı bir incident/field unit silinirse bu geçmişin sessizce
yok olmaması için "önce bağlı task varsa silmeye izin verme" kuralı tercih edildi.

`ApplicationDbContext.cs`'e `DbSet<OperationalTask> OperationalTasks` eklendi (LINQ sorguları
için gerekli).

**Migration:** `AddOperationalTask` (`20260814105847_AddOperationalTask`) — `CreateTable` + 2 FK
constraint + 2 index. Sorunsuz uygulandı.

---

## 8. `OperationalTask` — Application + Api (asıl iş mantığı)

### 8.1 DTO'lar

```csharp
public record OperationalTaskDto(Guid Id, Guid IncidentId, Guid FieldUnitId, string Status, DateTimeOffset AssignedAt, DateTimeOffset? CompletedAt);
public record CreateOperationalTaskDto(Guid IncidentId, Guid FieldUnitId);
```
`CreateOperationalTaskDto`'da `Status`/`AssignedAt` yok — sunucu tarafında sabitleniyor
(`CreateIncidentDto`'daki "dış girdiye güvenme" prensibiyle aynı).

### 8.2 `OperationalTaskService.cs` — iş mantığı

- **`CreateAsync`:** Incident + FieldUnit'i **tracked** olarak çeker (AsNoTracking değil — ikisini
  de güncelleyeceğiz). `FieldUnitStatus.Available` değilse `InvalidOperationException`. Yeni task
  oluşturulur, `fieldUnit.Status = Dispatched`, `incident.Status` `Open` ise `InProgress`. **Tek
  bir `SaveChangesAsync()` çağrısı** — task ekleme + iki entity güncellemesi **atomik** (hepsi
  birden ya da hiçbiri, tek transaction).
- **`CompleteAsync`:** Task zaten `Completed` ise `InvalidOperationException` (idempotency
  koruması). Task `Completed`'e çekilir, `CompletedAt` set edilir, bağlı field unit `Available`'a
  döner — tek `SaveChangesAsync()`.
- **Exception stratejisi:** Özel exception sınıfları yazılmadı (YAGNI) — .NET'in hazır
  `KeyNotFoundException` ("bulunamadı" → Controller'da 404) ve `InvalidOperationException`
  ("iş kuralına aykırı" → Controller'da 409 Conflict) kullanıldı.

### 8.3 `OperationalTasksController.cs`

```
GET  /api/operational-tasks              → listele
POST /api/operational-tasks              → oluştur/ata (body: CreateOperationalTaskDto)
POST /api/operational-tasks/{id}/complete → tamamla (body yok)
```

**Karar — `/complete` action-based endpoint, genel `PATCH` değil:** Task için tek anlamlı geçiş
olduğundan (`Assigned → Completed`), genel amaçlı "herhangi bir alanı güncelle" endpoint'i
yazmak (hangi alanların değiştirilebileceğini ayrıca düşünmek gerektirirdi) gereksiz bir
genelleme olurdu.

**Bilinen teknik borç:** `Create` ve `Complete` action'larında birebir aynı iki `catch` bloğu
tekrarlanıyor (`KeyNotFoundException → NotFound`, `InvalidOperationException → Conflict`).
Action sayısı arttıkça bu, merkezi bir exception handling middleware'ine taşınmalı — şimdilik
(2 action için) erken optimizasyon olur diye ertelendi.

**DI kaydı:** `services.AddScoped<IOperationalTaskService, OperationalTaskService>();`

### 8.4 Uçtan uca test (PowerShell, `Invoke-RestMethod`)

1. `POST /api/operational-tasks` (Available bir field unit + Open bir incident) → `201`,
   `status: "Assigned"`. Field unit `Dispatched`'e, incident `InProgress`'e geçti. ✅
2. Aynı field unit'i tekrar atamayı deneme → `409 Conflict` (iş kuralı doğru çalıştı). ✅
3. `POST /api/operational-tasks/{id}/complete` → `status: "Completed"`, `completedAt` dolu, field
   unit tekrar `Available`. ✅

---

## 9. `Incident.Resolve` — otomatik temizlikle

Case study'de açık bir madde olarak yazmasa da, "creation to completion" deliverable'ı ve
"Review completed operations" (Scope) ifadesiyle gerekli olduğu çıkarıldı.

**Tasarım kararları (sohbetle netleştirildi):**
- Resolve edilirken hâlâ `Assigned` durumda bağlı task'lar varsa **otomatik `Completed`'e
  çekilip** bağlı field unit'ler **otomatik `Available`'a** serbest bırakılıyor (operatörün
  "olay bitti" demesi, orada görünen ekiplerin sonsuza kadar meşgul kalmasına sebep olmamalı).
- Hem `Open` hem `InProgress`'ten `Resolved`'e geçilebiliyor (yanlış alarm senaryosu da geçerli).
- Endpoint deseni `Complete` ile tutarlı: `POST /api/incidents/{id}/resolve` (action-based).

**`IncidentService.ResolveAsync`:** Incident'ı `Resolved`'e çekmeden önce, o incident'a bağlı tüm
`Assigned` task'ları bulup (`Where(t => t.IncidentId == id && t.Status == Assigned)`) her birini
`Completed`'e çekiyor ve bağlı field unit'i `Available`'a döndürüyor — hepsi tek
`SaveChangesAsync()` içinde atomik.

**Bilinçli tasarım tercihi:** Bu mantık `IncidentService` içinde yaşıyor (`OperationalTaskService`
içinde değil) — aksiyonun kavramsal sahibi incident, task'ları kapatmak bir yan etki. İki servisi
birbirine bağımlı yapmak yerine (`IncidentService`'in `IOperationalTaskService`'i inject etmesi),
zaten paylaşılan `ApplicationDbContext` üzerinden doğrudan erişim tercih edildi — projenin genel
mimari tarzıyla tutarlı.

**Bilinen performans notu (henüz optimize edilmedi):** `foreach` içinde her task için ayrı bir
field unit sorgusu atılıyor (N+1 query). Bir incident'a gerçekçi olarak az sayıda field unit
bağlanacağı için şu an sorun yaratmıyor, ölçek büyürse tek sorguya (`Contains`) indirgenebilir.

**Doğrulama:** Yeni bir task oluşturulup **`/complete` hiç çağrılmadan** doğrudan
`/resolve` çağrıldı — task otomatik `Completed`'e geçti, field unit otomatik `Available`'a
döndü, incident `Resolved` oldu. ✅

---

## 10. Case study ile karşılaştırma — Level 1 backend denetimi

Orijinal case study kağıdı (`Level 1 — Basic Operations Center`, "Expected Capabilities") ile
mevcut backend karşılaştırıldı:

| Madde | Durum |
|---|---|
| Display incidents / field units on a map | Frontend işi, backend veri sağlıyor ✅ |
| View incident details / field unit information | Backend DTO'ları zaten tüm alanları dönüyor ✅ |
| Create operational tasks / Assign tasks to field units | Tek atomik aksiyonda birleştirildi (bkz. karar aşağıda) |
| Update task status | `/complete` aksiyonu ✅ |
| Display current operational state | Veri hazır (3 `GET` endpoint), frontend gösterimi eksik |

**Tartışılan nokta:** Case study'de "Create operational tasks" ve "Assign tasks to field units"
**iki ayrı madde**. Mevcut tasarımda bunlar **tek bir adımda** (`POST /api/operational-tasks`,
hem oluşturma hem atama) birleşik. Alternatif olarak "field unit'siz task oluşturma + sonradan
ayrı atama" adımlara bölünebilirdi.

**Karar:** Basitlik tercih edildi, mevcut birleşik akış korunuyor — case study'nin kendi son
ilkesiyle de tutarlı ("design decisions should balance simplicity with future extensibility").

**Genel sonuç:** Backend, Level 1'in iş mantığı gereksinimlerini karşılıyor. Deliverable'ın
("a working Operations Center... capable of managing incidents from creation to completion")
tam anlamıyla karşılanması için **frontend'de** haritadan task oluşturma/atama/tamamlama akışının
kurulması gerekiyor — sıradaki iş bu.

---

## 11. Sıradaki adım

1. Field unit'e tıklayınca bilgi gösterme (ertelenen tıklama özelliği, task atama akışının
   doğal bir parçası olarak).
2. Bir incident + field unit seçip task oluşturma/atama UI akışı.
3. Task tamamlama / incident resolve aksiyonlarının UI karşılığı.
4. Genel operasyonel durumu (aktif task listesi, field unit durumları) gösteren bir görünüm.

## 12. Sürüm Notları / Düzeltmeler (bu oturum)

- **14 Ağustos 2026:** Field unit seed data'sı local DB'de elle girilmiş haldeydi, reproducible
  değildi → `HasData` migration'ına taşındı, eski elle-girilmiş kayıtlar temizlenip migration
  yeniden uygulandı.
- **14 Ağustos 2026:** `dotnet run --project Src/SmartCityOps.Api` komutu `Src` klasörü
  içindeyken çift `Src/Src` yol hatası verdi → zaten içindeyken sadece `--project SmartCityOps.Api`
  kullanılması gerektiği netleşti.
- **14 Ağustos 2026:** Windows'ta portable Postgres kurulumunda `psql` `PATH`'e ekli değil →
  tam yol (`...\pgsql\bin\psql.exe`) ile çağrılması gerektiği doğrulandı.
- **14 Ağustos 2026:** `useSignalR.ts`'e eklenen yorumda yazım hatası (`Singelton` →
  `Singleton` olmalı) tespit edildi, düzeltilecek.
```

---

Kaydettikten sonra haber ver, frontend'e geçelim.