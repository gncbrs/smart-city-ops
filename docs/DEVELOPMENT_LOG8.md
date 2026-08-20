# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 20 Ağustos 2026
**Kapsam:** Level 2'nin kalan üç maddesinden ikisi tamamlandı — **operational zones (harita
görselleştirmesi)** ve **field unit movement history**. Gerçek SignalR hâlâ bekliyor.

Bu doküman `DEVELOPMENT_LOG7.md`'nin devamı. Önceki oturum tamamen UI yeniden yapılandırmasına
ayrılmıştı; bu oturumda LOG7'nin "Sıradaki adım" bölümünde bırakılan yere dönüldü.

**Çalışma yöntemi** (önceki oturumdan devam): mentor/intern akışı — önce tasarım kararı ve
gerekçesi (reddedilen alternatifler dahil) tartışılıyor, onay sonrası küçük, tek başına test
edilebilir adımlara bölünüyor, her satırın ne işe yaradığı açıklanıyor. Kod hiçbir zaman
doğrudan repoya yazılmıyor — kullanıcı kopyala/yapıştır yapıp kendi commit/push'unu yapıyor.

---

## 1. Operational Zones (harita görselleştirmesi)

### 1.1 Zone verisinin kaynağı — tasarım kararı

Başlangıç durumu: `AnkaraZones` verisi (7 bölge — isim, merkez koordinat, `Spread` jitter
yarıçapı, `Weight` ağırlık) sadece `Src/incident-generator/Worker.cs` içinde `private static
readonly` bir dizi olarak yaşıyordu (bkz. `DEVELOPMENT_LOG6.md` §7). Generator projesi hiçbir
başka projeye referans vermiyor (bilinçli decoupling — "external system" simülasyonu), bu yüzden
bu veri backend'e veya frontend'e hiçbir şekilde ulaşmıyordu.

**Üç seçenek değerlendirildi:**
1. Generator ile backend arasında paylaşılan bir class library — **reddedildi**, generator'ın
   bilinçli bağımsızlığını (sadece HTTP üzerinden konuşması) 7 statik kayıt için bozmaya değmez.
2. Zone verisini bir DB tablosuna taşımak — **reddedildi**, zonlar operatörün oluşturup
   düzenlediği bir şey değil, sabit referans veri; `RecommendedUnits` için daha önce uygulanan
   YAGNI mantığıyla aynı gerekçe (Level 3'te "restricted/operational zones" operatör tarafından
   düzenlenebilir hale gelirse o zaman tabloya taşınır).
3. **Seçilen:** Backend içinde statik, elle senkron tutulan bir kopya, yeni bir read-only
   endpoint üzerinden expose edilecek. Maliyeti: iki dizi elle senkronize tutulmalı (kod
   içinde her iki dosyada da birbirine işaret eden yorum satırları eklendi).

### 1.2 Backend — `GET /api/operational-zones`

`FieldUnitService`/`IFieldUnitService` ile birebir aynı 4 katmanlı vertical slice pattern'i
izlendi:

- `SmartCityOps.Application/OperationalZones/OperationalZoneDto.cs` — `record`, alanlar:
  `Name, Latitude, Longitude, Spread, Weight` (generator'daki `OperationZone` ile birebir aynı
  şekil).
- `SmartCityOps.Application/OperationalZones/IOperationalZoneService.cs` — tek metot,
  `GetAllAsync`.
- `SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs` — `ApplicationDbContext`
  enjekte etmiyor (DB'ye hiç gitmiyor), sadece `AnkaraZones`'un birebir kopyası olan statik bir
  listeyi `Task.FromResult` ile döndürüyor.
- `SmartCityOps.Api/Controllers/OperationalZonesController.cs` — `GET` only, `api/operational-zones`.
- `DependencyInjection.cs`'e `AddScoped<IOperationalZoneService, OperationalZoneService>` eklendi.

DB tablosu yok, migration yok — bu özellik tamamen sabit, in-memory veri üzerinden çalışıyor.

### 1.3 Frontend — fetch stratejisi: `staleTime: Infinity`

`features/operational-zones/` (types/api/hooks) klasörü, `field-units` ile aynı pattern.
`useOperationalZones` hook'unda `staleTime: Infinity` kullanıldı — bu oturumda ortaya çıkan üç
farklı refetch stratejisinden biri (bkz. §3.6, movement history'nin event-driven invalidation
yaklaşımıyla karşılaştırma): zone verisi runtime'da hiç değişmediği için polling ya da
invalidation'a hiç gerek yok, tek seferlik fetch + sonsuz cache yeterli.

### 1.4 Haritada gösterim — `useOperationalZoneLayers`

Zonlar `Marker` (nokta) değil, MapLibre GeoJSON source + `fill` layer (alan) olarak render
ediliyor — bir marker'ın piksel boyutu zoom ile ölçeklenmez, bir alanı temsil etmek için yanlış
araç.

- `lib/buildZoneGeoJson.ts` — her zone için merkez etrafında 48 noktalı bir çember poligonu
  üretiyor, yarıçap olarak `Spread`'i **doğrudan derece cinsinden** kullanıyor (gerçek metre
  bazlı, enlem-düzeltmeli bir çember değil). Bilinçli tercih: backend'in incident jitter'ı da
  aynı basitleştirmeyi kullanıyor (`± Spread` derece, enlem düzeltmesiz), zone sınırı bu matematik
  ile tutarlı olmalı — aksi halde görselleştirme, incident'ların gerçekte nereye düşebileceğini
  yanlış temsil eder.
- `hooks/useOperationalZoneLayers.ts` — MapLibre'nin GL layer'ları (marker'ların aksine) sadece
  style yüklendikten sonra eklenebiliyor. `map.isStyleLoaded()` kontrolü + değilse
  `map.once("load", ...)` ile bu race condition'a karşı korunuldu. StrictMode'un development'ta
  effect'leri iki kez çalıştırma davranışına karşı `if (currentMap.getSource(...)) return;` guard'ı
  eklendi (aynı kategori sorun, LOG2'deki `ResizeObserver` StrictMode bug'ıyla aynı köken).
- Fill opacity, `weight`'e göre interpolate ediliyor (Çankaya gibi yüksek ağırlıklı zonlar daha
  belirgin) — dekoratif değil, gerçek veriyi kodluyor.
- Renk: mor (`#7c3aed`) — haritadaki hiçbir mevcut renkle (priority kırmızı/turuncu/yeşil, field
  unit mavisi, seçim glow'ları mavi/amber) çakışmayan tek boş renk.

### 1.5 Bulunan ve düzeltilen hata — font glyph 404 spam

Zone isim etiketleri için eklenen `symbol` layer'da `text-font` belirtilmemişti; MapLibre'nin
spec-wide default'u (`["Open Sans Regular", "Arial Unicode MS Regular"]`) OpenFreeMap `liberty`
style'ının font sunucusunda mevcut değil — konsolda her karakter için ayrı 404 (onlarca satır).
**Çözüm:** `text-font: ["Noto Sans Regular"]` eklendi (style'ın kendi place-name label'larının
kullandığı font). Kullanıcı tarafından test edilip doğrulandı — 404'ler tamamen kayboldu.

### 1.6 Ertelendi — zone sayısının azlığı / kapsama boşlukları

Kullanıcı haritada 7 zonun Ankara'nın büyük kısmını kapsamadığını fark etti (bu, tasarım gereği
doğru davranış — generator sadece bu 7 bölgede incident üretiyor). İki seçenek not edildi, karar
ertelendi ("acele yok"):
1. Mevcut 7 zonun `Spread`'ini büyütmek (hızlı ama zonlar birbirine karışabilir).
2. Yeni ilçeler eklemek (Yenimahalle, Çubuk, Polatlı, Elmadağ, Akyurt, Beypazarı vb.) — bazıları
   mevcut `ANKARA_BOUNDS` sınırının (`OperationsMap.tsx`) dışında kaldığı için o sabiti de
   genişletmek gerekecek. Ayrıca bu, generator'ın gerçek incident dağılımını da değiştirir —
   kozmetik değil, davranışsal bir değişiklik.

**Sıradaki oturumda ele alınacak.**

---

## 2. Field Unit Movement History

### 2.1 Temel tespit — field unit'ler hiç hareket etmiyordu

Tasarım tartışmasının başlangıcında ortaya çıktı: backend'de `FieldUnit.Latitude/Longitude`'u
seed'den sonra değiştiren **hiçbir mekanizma yoktu** (`FieldUnitService` sadece `GetAllAsync`
içeriyordu). Bu yüzden "movement history" aslında "önce field unit'lere hareket etme yeteneği
kazandırmak, sonra bunu loglamak" demekti.

### 2.2 Tasarım kararı — Seçenek A: hareketi assignment'a bağlamak

**Seçenek A (seçildi):** Bir field unit bir incident'a atandığında (`OperationalTaskService.
CreateAsync`, zaten var olan ve zaten unit'i `Dispatched`'e çeviren metot), unit'in koordinatları
da incident'ın koordinatlarına güncellensin — "ekip olay yerine gitti" simülasyonu — ve bu bir
history satırına kaydedilsin.

**Seçenek B (reddedildi):** Generator'a benzer, bağımsız bir arka plan "GPS simulator" servisi,
unit koordinatlarını periyodik rastgele oynatan. Reddedilme gerekçesi: case study'nin "Level 1'de
tüm operasyonlar manuel yapılabilmeli" ilkesiyle doğrudan çelişiyor — operatörün hiçbir eyleminden
bağımsız olarak kendi kendine gezinen bir unit, manuel bir operasyon değil, tanımlanmamış bir arka
plan sürecidir. Seçenek A hiçbir yeni alt sistem gerektirmiyor, zaten var olan bir mutation'a
bağlanıyor, her history satırı gerçek bir operasyonel olaya (şu atamaya) bağlı anlamlı bir kayıt.

**Task tamamlandığında ("eve dönüş" yok):** Unit'in koordinatları olduğu yerde kalıyor — domain'de
"home base/depot" kavramı hiç yok, sadece bunu haklı çıkarmak için icat etmek kapsam dışı (Level 2
için scope creep). Bu, "movement" kavramını temiz tutuyor: sadece atama sırasında oluşuyor, statü
değişiklikleri (`Dispatched → Available`) zaten `OperationalTask` audit trail'inin işi.

### 2.3 Backend Adım 1 — saf ekleme (`FieldUnitLocationHistory`)

Yeni entity + configuration + migration + DTO + read-only service + `GET
/api/field-unit-location-histories` — mevcut hiçbir dosyaya dokunulmadan, `OperationalZones` ile
aynı 4 katmanlı pattern.

**Namespace tuzağı:** Klasör/namespace `FieldUnitLocationHistories` (çoğul) seçildi, entity class
`FieldUnitLocationHistory` (tekil) — `OperationalTask`/`OperationalTasks` konvansiyonuyla aynı.
Gerekçe: LOG4'te `IncidentGenerator` class'ı ile aynı isimli bir kapsamın çakışıp derleme hatasına
yol açması (sonradan `IncidentGeneratorOptions`'a yeniden adlandırıldı) — bu projede zaten bir kez
yaşanmış bir hata kategorisi, tekrarlanmaması için bilinçli önlem.

**Karşılaşılan gerçek hata:** İlk `dotnet run` denemesinde Swagger `500 Internal Server Error`
döndü — `relation "FieldUnitLocationHistories" does not exist` (Postgres). Kök neden: `dotnet ef
migrations add` çalıştırılmış ama `dotnet ef database update` unutulmuştu. `dotnet ef migrations
list` ile migration'ın `(Pending)` olduğu doğrulandı, `database update` ile çözüldü.

### 2.4 Backend Adım 2 — `OperationalTaskService.CreateAsync` değişikliği (riskli adım)

Mevcut, test edilmiş kodun değiştirildiği tek adım. Değişiklikler:
- `var now = DateTimeOffset.UtcNow;` — hem `task.AssignedAt` hem yeni history satırının
  `RecordedAt`'i için **aynı** değişken kullanıldı (iki ayrı `UtcNow` çağrısının birkaç
  mikrosaniye farklı zaman damgası üretme riskine karşı — kavramsal olarak "aynı an" olan iki
  olayın timestamp'lerinin de birebir eşit olması garanti edildi).
- `fieldUnit.Latitude/Longitude = incident.Latitude/Longitude` — EF Core'un zaten mevcut change
  tracking mekanizması (aynı metotta `fieldUnit.Status = Dispatched` satırı zaten bu mekanizmaya
  güveniyordu) sayesinde ek bir `Update()` çağrısına gerek yok.
- Yeni `FieldUnitLocationHistory` satırı oluşturulup `_dbContext.Add(...)` ile eklendi, tek bir
  `SaveChangesAsync` çağrısı hem task'ı hem location history'yi hem field unit/incident
  güncellemelerini atomik olarak commit ediyor (mevcut atomicity garantisi genişletildi, bozulmadı).
- `CompleteAsync` **dokunulmadı** — tasarım kararı gereği tamamlama hareket üretmiyor.

Kullanıcı tarafından Swagger üzerinden test edildi: atama sonrası field unit koordinatları
incident'ınkiyle eşleşti, yeni history satırı doğru `recordedAt` ile göründü, regresyon testleri
(unavailable unit reddi, resolved incident reddi, complete sonrası `Available`'a dönüş, konum
sabit kalması) hepsi geçti.

### 2.5 Bulunan tasarım eksiği — `IncidentId` yokluğu

Adım 2 sonrası fark edildi: `FieldUnitLocationHistory`'de hangi incident'a gidildiğini tutan bir
alan yoktu — sadece kopyalanmış koordinatlar. UI'de "Dispatched to [Incident Type]" gibi anlamlı
bir etiket ya da tıklanabilir çapraz gezinme için bu bilgi gerekliydi.

**Reddedilen workaround:** `OperationalTask.AssignedAt` ile history satırının `RecordedAt`'ini
timestamp eşleştirmesiyle (string equality) ilişkilendirmek — kırılgan, örtük bir bağ; gelecekte
hareketi tetikleyen başka bir yol eklenirse (örn. gerçek GPS) sessizce bozulur.

**Çözüm:** `Guid? IncidentId` alanı entity'ye, configuration'a (opsiyonel FK,
`OnDelete(Restrict)`), DTO'ya ve `CreateAsync`'e (`IncidentId = incident.Id`) eklendi — ikinci,
küçük bir migration (`AddIncidentIdToFieldUnitLocationHistory`). Mevcut eski satır (adım 1
testinden kalan) `incidentId: null` olarak kaldı — geriye dönük veri düzeltmesi yapılmadı,
projenin genelindeki "eski veriyi retrofit etme" tutarlı yaklaşımıyla aynı.

### 2.6 Frontend — event-driven invalidation

`useFieldUnitLocationHistories` hook'unda ne polling ne `staleTime: Infinity` kullanıldı — üçüncü
bir refetch stratejisi: bu veri sadece bilinen bir mutation'da (task assignment) değişiyor, bu
yüzden `useCreateTask`'ın `onSuccess` callback'ine `queryClient.invalidateQueries({ queryKey:
["field-unit-location-histories"] })` eklendi (mevcut `incidents`/`field-units`/
`operational-tasks` invalidation'larıyla aynı satırda). `useCompleteTask`'a **eklenmedi** —
tamamlama konum değiştirmiyor.

### 2.7 Frontend UI

- `features/field-units/components/FieldUnitMovementHistorySection.tsx` —
  `IncidentTimelineSection`'ın ayna görüntüsü (bir incident yerine bir field unit alıyor, ilişkili
  incident'ları gösteriyor). Aynı `Timeline` shared component'i, aynı `getIncidentLabel` helper'ı
  (bilinmeyen/`null` incidentId durumunda "Unknown incident" fallback'i, eski test satırı için).
- `FieldUnitPanel.tsx`'e "View Movement History" butonu eklendi — `IncidentPanel`'in "View
  Timeline" butonuyla birebir aynı yapı: `.field-unit-panel__actions` flex container (LOG7 §4'te
  bulunan buton-hizalama hatasının aynısını burada baştan önlemek için).
- `MenuView` tipine `"movement-history"` eklendi, `Menu.tsx`'e yeni bir render branch'i eklendi.
  **`SECTIONS` listesine bilinçli olarak eklenmedi** — LOG7 §3 Aşama 9'daki "timeline sadece
  incident panelinden erişilebilir, genel menü listesinden değil" kararıyla aynı gerekçe: belirli
  bir field unit seçili olmadan bu görünüm anlamsız.

### 2.8 Bu adımda kullanıcının yaşadığı ve düzeltilen hatalar

- `Menu.tsx` güncellemesinde: `MenuProps` interface'ine yeni prop'lar eklenmişti ama fonksiyonun
  destructuring parametre listesine eklenmemişti (`movementHistoryFieldUnit`, `locationHistory`) —
  TypeScript "cannot find name" hatası. Ayrıca import path'inde yazım hatası (`FieldUnitMovment
  HistorySection` → `FieldUnitMovementHistorySection`).
- `App.tsx`'te `fieldUnitPanel` prop'unun yeni içeriği, mevcut içeriğin **yerine değil içine**
  yapıştırılmıştı — sonuç: iç içe geçmiş ikinci bir `fieldUnitPanel={...}` bloğu, ekranda literal
  `"fieldUnitPanel="` metni render oluyordu, `AssignTaskButton` ikilenmişti. Tüm prop bloğu tek,
  düz bir yapıyla değiştirilerek çözüldü.

---

## 3. Level 2 durumu (bu oturum sonu itibarıyla)

- Filtering ✅ (LOG6)
- Incident timeline ✅ (LOG7'de yeniden konumlandırıldı)
- Operational statistics / task history ✅ (LOG6)
- **Operational zones ✅ (bu oturum)** — harita üzerinde ağırlığa göre opaklık değişen 7 bölge,
  backend'de statik endpoint, generator ile elle senkronize.
- **Field unit movement history ✅ (bu oturum)** — assignment'a bağlı hareket simülasyonu, ayrı
  audit trail tablosu, Menu üzerinden erişilebilen görünüm.
- **Gerçek SignalR (`OperationsHub`) — hâlâ bekliyor.** `useIncidents.ts`'teki 15 saniyelik
  `refetchInterval` hâlâ yerinde; frontend'de `shared/lib/signalRConnection.ts` ve
  `shared/hooks/useSignalR.ts` hâlâ pasif (import ve çağrı `App.tsx`'te comment'li).

**Diğer bekleyen küçük madde (LOG7'den, hâlâ çözülmedi):** `OperationalStatistics.tsx` hâlâ
kullanılmıyor, silinmesi öneriliyor.

**Yeni bekleyen küçük madde (bu oturumdan):** Operational zones'un kapsama alanı azlığı — §1.6'da
not edilen iki seçenekten biri seçilip uygulanmayı bekliyor.

---

## 4. Sıradaki adım

Gerçek SignalR entegrasyonu: backend'de `OperationsHub` (yeni `Microsoft.AspNetCore.SignalR`
paketi, hub sınıfı, `Program.cs`'te `MapHub`), `IncidentService`/`OperationalTaskService`/
`FieldUnitService` mutation'larından `IHubContext` üzerinden broadcast; frontend'de zaten var olan
ama pasif `useSignalR.ts`'in aktif hale getirilip `useIncidents.ts`'teki `refetchInterval`
workaround'unun kaldırılması.