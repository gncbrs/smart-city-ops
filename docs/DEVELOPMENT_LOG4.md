# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 16 Ağustos 2026
**Kapsam:** Level 1 — Basic Operations Center **TAMAMLANDI**

Bu doküman, `DEVELOPMENT_LOG.md` / `DEVELOPMENT_LOG2.md` / `DEVELOPMENT_LOG3.md`'nin devamı —
16 Ağustos oturumunda Level 1'in frontend UI akışının tamamlanmasını ve ardından yapılan
kapsamlı bir temizlik/sağlamlaştırma turunu kayıt altına alır.

---

## 1. Frontend — Level 1'in kalan 4 adımı

DEVELOPMENT_LOG3.md §11'de bırakılan sıradaki adımlar sırayla tamamlandı.

### 1.1 Adım 1 — Field unit'e tıklayınca bilgi gösterme

- `useFieldUnitMarkers.ts` — `useIncidentMarkers`'daki desenin birebir aynısı: `onSelectFieldUnit`
  callback'i eklendi, her marker'ın DOM elementine `click` listener'ı takıldı.
- `OperationsMap.tsx` — `onSelectFieldUnit` prop'unu alıp hook'a geçiyor.
- Yeni `features/field-units/components/FieldUnitPanel.tsx` — `IncidentPanel`'den ayrı bir
  component (veri şekli farklı: `unitCode`/`type`/`status`). Seçili field unit yokken `return
  null` — `IncidentPanel`'in zaten var olan boş-durum lejant mesajıyla çakışmasın diye.

**Tasarım kararı — seçim state'i:** `selectedIncident` ve `selectedFieldUnit` **iki ayrı,
bağımsız** `useState` (A seçeneği; karşılıklı dışlayan tek bir `selection` state'i yerine).
Gerekçe: Adım 2'de ("incident + field unit seçip task oluşturma") ikisinin **aynı anda** seçili
olması gerekecekti — bu, tahmin değil, zaten bilinen bir sıradaki gereksinim olduğu için baştan
bu şekilde kurmak YAGNI ihlali sayılmadı.

### 1.2 Adım 2 — Task oluşturma/atama akışı

Yeni `features/operational-tasks/` feature'ı:
- `api/operationalTasksApi.ts` — `createOperationalTask()`.
- `hooks/useCreateTask.ts` — `useMutation`; başarı olunca `incidents`/`field-units` query'lerini
  invalidate ediyor (cache'i elle güncellemek yerine yeniden çektirme — YAGNI).
- `components/AssignTaskButton.tsx` — hem `selectedIncident` hem `selectedFieldUnit` doluyken
  `App.tsx`'te render ediliyor. `fieldUnit.status !== "Available"` iken buton `disabled` +
  açıklama metni (backend'deki kuralın frontend'de UX için tekrarı — tek gerçek kaynak hâlâ
  backend, bu sadece gereksiz bir isteği baştan engelliyor).

**Karar:** Task başarıyla oluşunca hem `selectedIncident` hem `selectedFieldUnit` temizleniyor
(`clearSelection`) — task oluşunca ikisinin de durumu değiştiği için (Dispatched/InProgress),
eski seçili veriyi panelde tutmaya devam etmek kafa karıştırıcı olurdu.

### 1.3 Adım 3 — Task tamamlama / incident resolve

- Yeni `hooks/useOperationalTasks.ts` (`GET /api/operational-tasks`), `hooks/useCompleteTask.ts`
  (`POST .../complete`) — üçlü invalidate (`incidents`, `field-units`, `operational-tasks`).
- `FieldUnitPanel` — `activeTask` prop'u alıyor (`App.tsx`'te `operationalTasks.find(...)` ile
  bulunuyor); field unit `Dispatched` + açık task varsa "Complete Task" butonu.
- `IncidentPanel` — `incident.status !== "Resolved"` iken "Resolve Incident" butonu, kendi
  `useResolveIncident()` hook'unu çağırıyor.
- Assign/Complete/Resolve'un **üçü de** başarı sonrası aynı `clearSelection`'ı çağırıyor —
  tutarlı "stale veri gösterme" davranışı.

### 1.4 Adım 4 — Genel operasyonel durum görünümü

Yeni `features/dashboard/components/Dashboard.tsx` — `App.tsx`'te her zaman görünen (seçime
bağlı olmayan) bir bölüm: field unit durum sayıları (`Available`/`Dispatched`/`OutOfService`),
aktif (`Assigned`) task listesi, tamamlanmış (`Completed`) task listesi. Yeni bir layout slotu
eklenmedi (`OperationsCenterLayout`'ın tek `sidePanel`'i zaten scroll edilebilir) — YAGNI.

`features/tasks/` (boş, `.gitkeep`'ten ibaret eski iskelet) temizlendi — `operational-tasks`
adı kullanıldığı için artık kalıntıydı.

**Sonuç:** Case study'nin Level 1 "Expected Capabilities" listesindeki 8 maddenin hepsi UI'dan
erişilebilir hale geldi, uçtan uca elle test edildi (generator → Open → task ata → InProgress/
Dispatched → complete/resolve → Resolved, hepsi haritadan).

---

## 2. Bulunan ve düzeltilen gerçek hatalar

### 2.1 `FieldUnits` boş görünüyordu — migration uygulanmamış

Yeni bir makinede field unit marker'ları hiç gelmiyordu. Network sekmesinde `field-units`
isteğinin `200` ama sadece `0.2 kB` (boş dizi `[]`) döndüğü görüldü. Kök neden: o makinede
`SeedFieldUnits` migration'ı hiç çalıştırılmamıştı. `dotnet ef database update --project
SmartCityOps.Infrastructure --startup-project SmartCityOps.Api` ile çözüldü — kod hatası değil,
ortam kurulum adımı eksikliğiydi.

### 2.2 `index.css`'teki Vite şablon artığı — metin taşması/ortalaması

Side panel'deki metinler (özellikle uzun `Description`) garip ortalanmış/bölünmüş görünüyordu.
Kök neden: proje ilk oluşturulduğunda gelen Vite şablonunun `index.css`'i hiç temizlenmemişti —
`#root { text-align: center; width: 1126px; margin: 0 auto; ... }` gibi kurallar, bizim kendi
`OperationsCenterLayout.css`'imizin hiç sıfırlamadığı bir `text-align` mirası bırakıyordu.
**Çözüm:** `index.css`, gerçek bir minimal reset'e indirildi (`box-sizing`, `body { margin: 0 }`,
temel font) — şablonun kullanılmayan `--accent`, `.counter`, `code`, `h1` stilleri kaldırıldı.

### 2.3 Enum değerlerinin ham gösterimi (`RoadClosure`, `UtilityCrew`)

Backend enum'ları PascalCase string olarak gönderiyor (bilinçli karar, bkz. DEVELOPMENT_LOG.md
§1) — ama bu ham hali doğrudan ekrana basılıyordu. Yeni `shared/lib/formatLabel.ts` →
`formatEnumLabel()`, sadece **gösterim anında** `"RoadClosure"` → `"Road Closure"` çeviriyor;
karşılaştırma mantığı (`fieldUnit.status === "Available"` gibi) ham veriyle çalışmaya devam
ediyor, hiç etkilenmedi. `IncidentPanel`, `FieldUnitPanel`, `Dashboard`'da kullanıldı.
`FieldUnitPanel`'in başlığı da `unitCode`'dan `formatEnumLabel(type)`'a çevrildi (örn. "Utility
Crew"), `unitCode` alt bilgi (`Unit Code: UTL-01`) olarak kaldı.

### 2.4 Incident Generator — process yeniden başlatılınca `IncidentCode` çakışması

**Belirti:** Generator ikinci kez çalıştırılınca art arda `500 (duplicate key value violates
unique constraint "IX_Incidents_IncidentCode")` almaya başladı, yeni incident hiç oluşmadı.

**Kök neden:** `Worker.cs`'teki `IncidentCode` üretimi `$"INC-{tarih}-{sequence:D4}"`
şeklindeydi; `sequence` process-local bir alan, her `dotnet run` ile **0'dan** başlıyor. İkinci
çalıştırma kendi `sequence`'ini 1'den saymaya başlayınca, ilk çalıştırmanın zaten ürettiği
kodlarla (`INC-20260816-0001`, `0002`, ...) çakışıyor — process'in kendi sayacı, o gün zaten
kullanılmış en yüksek numarayı geçene kadar (10 tane üretilmişse 11. denemeye kadar, yaklaşık
birkaç dakika) sürekli hata veriyordu.

**Çözüm:** `sequence` alanı tamamen kaldırıldı, `IncidentCode` artık milisaniyeye kadar zaman
damgasından üretiliyor: `$"INC-{DateTime.UtcNow:yyyyMMddHHmmssfff}"`. Process ne zaman
başlarsa başlasın çakışma riski yok (15 saniyelik üretim aralığında aynı milisaniyeye denk
gelme ihtimali yok denecek kadar az). `IncidentCode`'un frontend'e hiç gönderilmediği
(`IncidentDto`'da yok) ve backend'de hiçbir yerde parse/karşılaştırma yapılmadığı doğrulanıp
format değişikliğinin sıfır risk taşıdığı teyit edildi. Generator yeniden başlatılarak
doğrulandı — artık çakışma yok.

---

## 3. Backend/Frontend temizlik turu ("Level 1'den eksiksiz çıkmak")

Kullanıcının açık talimatıyla, önceki oturumlardan kalan bilinen teknik borç kalemleri tek tek
gözden geçirildi. Bazıları bu turda düzeltildi, bazıları bilinçli olarak ertelendi.

### 3.1 Düzeltilenler

- **CORS origin config'e taşındı** — `appsettings.Development.json`'a `Cors:AllowedOrigins`
  eklendi, `Program.cs`'teki hardcoded `"http://localhost:5173"` kaldırıldı.
- **`Program.cs` inceltildi** — yeni `Api/DependencyInjection.cs` (`AddApiServices()`), CORS/
  Controllers/Swagger kayıtlarını `Infrastructure/DependencyInjection.cs`'teki `AddInfrastructure()`
  deseniyle tutarlı bir şekilde topluyor. `Program.cs` artık sadece bootstrap.
  **Karşılaşılan hata:** `SmartCityOps.Api.DependencyInjection` ile
  `SmartCityOps.Infrastructure.DependencyInjection` aynı sınıf adını taşıdığı için `Program.cs`'te
  her iki namespace de `using` edilince `CS0104` (belirsiz referans) hatası alındı — tam nitelikli
  adla (`SmartCityOps.Api.DependencyInjection.FrontendCorsPolicy`) çözüldü.
- **`UseHttpsRedirection()` yorum satırına alındı** — proje sadece `http` profiliyle (`5080`)
  çalışıyor, https hiç kullanılmıyor, bu satır sadece başlangıçta gereksiz bir uyarı üretiyordu.
- **`IncidentGenerator` sınıfı → `IncidentGeneratorOptions`** — dosya adı
  (`IncidentGeneratorOptions.cs`), namespace (`SmartCityOps.IncidentGenerator`) ve sınıf adı
  arasındaki isim çakışması/karışıklığı gideren yeniden adlandırma; 3 dosyada (`IncidentGeneratorOptions.cs`,
  generator'ın `Program.cs`'i, `Worker.cs`) tutarlı güncellendi. `ApiBaseUrl` property'si tek
  satıra indirildi.
- **Merkezi exception handling** — yeni `Api/ExceptionHandling/DomainExceptionHandler.cs`
  (.NET 8'in `IExceptionHandler` arayüzü). `IncidentsController.Resolve` ve
  `OperationalTasksController.Create`/`Complete`'teki üç kez tekrarlanan
  `catch (KeyNotFoundException) → 404` / `catch (InvalidOperationException) → 409` bloğu kalktı,
  merkezi handler'a taşındı. `IncidentsController.Create`'deki `ArgumentException` yakalaması
  (kendine özgü, tekrarlanmayan bir durum olduğu için) bilinçli olarak dokunulmadan bırakıldı.
- **N+1 sorgu düzeltildi** — `IncidentService.ResolveAsync`'te her açık task için ayrı ayrı field
  unit sorgusu atan `foreach` içi `await`, tek bir `Dictionary` sorgusuna indirgendi.
- **Ölü kod yorum satırına alındı** — `fetchIncidentById` (frontend), karşılığı olan
  `GET /api/incidents/{id}` backend'de hiç yazılmadığı (bilinçli YAGNI, DEVELOPMENT_LOG2.md §2.7)
  ve hiçbir yerden çağrılmadığı için silinmek yerine yorum satırına alındı, notla birlikte.
- **`Incident Generator` — `IncidentCode` çakışması** (bkz. §2.4).
- **`useSignalRConnection()` çağrısı `App.tsx`'te yorum satırına alındı** (kullanıcı tarafından)
  — backend'de `OperationsHub` henüz yok, her sayfa yüklemesinde konsola 5 hata basıyordu, şu an
  hiçbir işlevi yok. Level 2'de SignalR gerçekten yazılınca geri açılacak.

### 3.2 Bilinçli olarak ertelenenler (bloklayıcı değil, dokunulmadı)

- Controller dosya adlarındaki fazladan "s" (`IncidentsControllers.cs`, `FieldUnitsControllers.cs`).
- `"Yanlış veye eksik argüman"` yazım hatası (`veya` olmalı).
- `launchSettings.json`'daki kullanılmayan/tutarsız `https` profili.
- `useIncidents.ts`'teki `refetchInterval` geçici çözüm yorumu.

---

## 4. Case study — Level 1 nihai denetim

| Madde | Durum |
|---|---|
| Display incidents / field units on a map | ✅ |
| View incident details / field unit information | ✅ |
| Create operational tasks | ✅ |
| Assign tasks to field units | ✅ (create+assign tek adımda birleşik, bilinçli karar — bkz. DEVELOPMENT_LOG3.md §10) |
| Update task status | ✅ |
| Display current operational state | ✅ (Dashboard) |
| "All operations may be performed manually" | ✅ |
| Deliverable: "creation to completion" | ✅ uçtan uca haritadan yönetilebiliyor |

**Sonuç: Level 1 — Basic Operations Center tamamlandı.** Backend + frontend + generator uçtan
uca test edildi, bilinen kod kalitesi sorunları (istisnalar hariç, §3.2) temizlendi, `dotnet
build` / `npx tsc --noEmit` / `npm run build` / `oxlint` hepsi temiz.

## 5. Sıradaki adım

Level 2 — Operational Awareness (bu oturumda başlanmadı, kullanıcının açık talimatıyla).
