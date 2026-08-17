`docs/DEVELOPMENT_LOG5.md` adıyla yeni bir dosya oluşturup aşağıdaki içeriği yapıştırabilirsin:

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 17 Ağustos 2026
**Kapsam:** Level 1 sonrası bug fix — Level 2 (Operational Awareness) başlıyor

Bu doküman, `DEVELOPMENT_LOG4.md`'nin devamı — Level 2'ye geçmeden önce elle test sırasında
bulunan bir mantık hatasının düzeltilmesini kayıt altına alır.

---

## 1. Bug — Resolved bir incident'a yeni task atanabiliyordu

**Tespit:** Level 2'ye başlamadan önce yapılan elle denetimde, `Resolved` durumundaki bir
incident'a hâlâ `Available` bir field unit atanabildiği görüldü. Bu, incident'ın "kapanmış"
anlamına mantıksal olarak aykırı — `IncidentService.ResolveAsync` zaten resolve anında açık
tüm task'ları kapatıp field unit'leri serbest bırakıyor (bkz. DEVELOPMENT_LOG3.md §9); resolve
edilmiş bir incident'a yeni bir task eklenmesi bu invariantı sessizce bozuyordu.

**Kök neden:** `OperationalTaskService.CreateAsync`, task oluşturma öncesi yalnızca
`fieldUnit.Status == Available` kontrolü yapıyordu, `incident.Status` hiç kontrol edilmiyordu.
Aynı eksiklik frontend'de de vardı — `AssignTaskButton.tsx`'teki `disabled` mantığı da sadece
field unit durumuna bakıyordu.

### 1.1 Backend düzeltmesi

`Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs` →
`CreateAsync`'e, field unit kontrolünün hemen altına yeni bir iş kuralı kontrolü eklendi:

```csharp
if (incident.Status == IncidentStatus.Resolved)
{
    throw new InvalidOperationException("Resolved durumundaki bir incident'a task atanamaz.");
}
```

**Karar — `InvalidOperationException`, `KeyNotFoundException` değil:** Incident zaten bulunmuş
durumda (satırın üstünde `?? throw new KeyNotFoundException` zaten geçildi); burada "kaynak
yok" değil "kaynak var ama şu anki durumla işlem çelişiyor" durumu var. `DomainExceptionHandler`
bu exception'ı 409 Conflict'e çeviriyor — field unit'in `Available` olmama durumuyla birebir
aynı desen.

**Doğrulama:** `Resolved` bir incident'a `Available` field unit ile `POST
/api/operational-tasks` denendi → `409 Conflict`, doğru mesajla.

### 1.2 Frontend düzeltmesi

`frontend/src/features/operational-tasks/components/AssignTaskButton.tsx` — `isAvailable`
tek koşulu, field unit uygunluğu + incident'ın resolve edilmemiş olması koşullarının
birleşimine (`canAssign`) çevrildi. `isIncidentResolved` ayrı bir uyarı metniyle
("This incident is already resolved.") kullanıcıya gösteriliyor.

**Not:** Bu, projenin zaten benimsediği "backend tek gerçek kaynak, frontend sadece gereksiz
isteği baştan engelliyor" prensibiyle tutarlı — asıl koruma backend'de (§1.1), frontend
değişikliği yalnızca UX katmanı.

**Doğrulama:** `Resolved` incident + `Available` field unit seçiminde buton `disabled`,
doğru uyarı mesajıyla; `Open`/`InProgress` incident'larda davranış değişmedi (regresyon yok).
`npx tsc --noEmit` temiz.

---

## 2. Sıradaki adım

Level 2 — Operational Awareness'a başlanıyor. Case study'deki 8 maddelik "Expected
Capabilities" listesi, karmaşıklık/bağımlılık sırasına göre 4 aşamaya bölündü (Aşama A:
filtering + high-priority vurgulama + task listesi iyileştirmesi; Aşama B: operational
statistics + task history; Aşama C: incident timeline + operational zones; Aşama D: field
unit movement history + gerçek SignalR). İlk adım olarak **Aşama A, madde 1 — incident ve
field unit filtreleme** ile başlanacak.
```

Kaydettikten sonra haber ver, Level 2'nin ilk maddesi olan **filtreleme** özelliğine geçelim — orada da aynı şekilde önce tasarım kararını konuşup sonra dosya dosya adım vereceğim.

---

## 3. Level 1 sonrası elle denetim — incident resolve → task complete zinciri

Level 2'ye geçmeden önce, incident resolve edildiğinde bağlı task'ların gerçekten complete
olup olmadığı elle test edildi.

**Doğrulanan davranış (bug değil, tasarım gereği):**
- **"Resolve Incident" (yukarıdan aşağıya):** İncident resolve edilince bağlı `Assigned`
  task'lar otomatik `Completed`'e çekiliyor, field unit'ler otomatik `Available`'a dönüyor —
  `IncidentService.ResolveAsync` beklendiği gibi çalışıyor.
- **"Complete Task" (aşağıdan yukarıya):** Field unit üzerinden bir task complete edildiğinde
  incident'ın status'u **otomatik değişmiyor** — bu bilinçli bir tasarım kararı. Gerekçe: "bir
  incident'ın gerçekten bitip bitmediği" operatörün kararı olmalı (case study, Level 1 Key
  Expectations: *"all operations may be performed manually"*), özellikle birden fazla field
  unit atanmış bir incident'ta son task'ın bitmesi otomatik olarak "olay kapandı" anlamına
  gelmemeli.

**Tartışılan iyileştirme (Level 2'ye bırakıldı):** Multi field unit senaryosunda operatöre
"tüm atanan ekipler işini bitirdi, resolve edebilirsiniz" gibi bir ipucu göstermek — otomatik
resolve değil, sadece bilgilendirme. Level 2'nin "Operational Awareness" kapsamına uygun,
Level 1'e eklenmedi.

**İncelenen ikinci konu — Dashboard'daki "Completed Tasks" listesinin sıralaması:**
Liste, backend'den geldiği sırada (en eski en üstte) render ediliyor, en son tamamlanan task
listenin **sonuna** ekleniyor — `Dashboard.tsx`'te herhangi bir `.sort()` yok. Veri doğru,
sadece "en yeni en üstte" beklentisiyle uyuşmuyor; ilk bakışta "kayıp kayıt" izlenimi verdi.
**Karar:** Bug değil, bilinçli olarak düzeltilmedi — Level 2'nin "Show task history" maddesinde
bu görünüm zaten yeniden ele alınacak, şimdi yama yapıp orada tekrar dokunmak gereksiz olurdu.

**Sonuç:** İncident → task → field unit yaşam döngüsü Level 1 kapsamında baştan sona doğru
çalışıyor. Level 2'ye geçiliyor.

# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 17 Ağustos 2026
**Kapsam:** Level 2 — Operational Awareness (madde 2 ve 3 tamamlandı)

Bu doküman, `DEVELOPMENT_LOG5.md`'nin devamı — Level 2'nin case study'den alınan 3 maddesinin
("Display active and completed tasks", "Highlight high-priority incidents", "Show task history")
ele alınmasını kayıt altına alır.

---

## 1. Madde 1 — Display active and completed tasks

Zaten Level 1'den beri `Dashboard.tsx`'te karşılanıyordu (Active/Completed task listeleri) —
ek iş yapılmadı, kapalı sayıldı.

## 2. Madde 2 — Highlight high-priority incidents

- `useIncidentMarkers.ts`: `High` öncelikli **ve hâlâ açık** (`status !== "Resolved"`) incident
  marker'ları, MapLibre'nin hazır `scale` parametresiyle büyütülüyor (`HIGH_PRIORITY_SCALE = 1.4`).
- `Dashboard.tsx`'e "High Priority Active Incidents" sayacı eklendi — aynı koşulla (`priority
  === "High" && status !== "Resolved"`) hesaplanıyor, haritadaki mantıkla tutarlı.
- Bulunan ve düzeltilen kozmetik hata: `priorityColors` sözlüğündeki yorumlar rengi yanlış
  tarif ediyordu (`Low` yeşil rengin yanında `// Mavi` yazıyordu, fallback rengin yanında
  `#6b7280 (gri)` yazıyordu ama kod farklı bir hex kullanıyordu) — yorumlar koda uyacak şekilde
  düzeltildi, fallback rengi de isimlendirilmiş bir sabite (`DEFAULT_MARKER_COLOR`) çıkarıldı.

## 3. Madde 3 — Show task history (genişletilmiş kapsam)

Elle test sırasında iki gerçek boşluk bulundu, ikisi de bu maddenin kapsamına dahil edildi:

- **Resolved incident'lara yeni task atanabiliyordu** (backend: `OperationalTaskService.
  CreateAsync`'e incident status kontrolü eklendi, 409 Conflict) — bkz. `DEVELOPMENT_LOG5.md`.
- **Field unit'siz (task'sız) resolve edilen incident'lar hiçbir yerde görünmüyordu.** Backend'e
  `Incident.ResolvedAt` (`DateTimeOffset?`) eklendi (yeni migration: `AddIncidentResolvedAt`),
  `ResolveAsync` bu alanı set ediyor. Frontend'de bu incident'lar artık "Operator → [Incident
  Type]" olarak history'de gösteriliyor.

**Yeni mimari:**
- `Src/SmartCityOps.Domain/Entities/Incident.cs` → `ResolvedAt` alanı.
- `Src/SmartCityOps.Application/Incidents/IncidentDto.cs` ve `IncidentService.cs` → `ResolvedAt`
  taşınıyor/set ediliyor.
- `frontend/src/features/operational-tasks/lib/describeTask.ts` (yeni) — `getFieldUnitLabel`,
  `getIncidentLabel`, `MANUAL_RESOLVE_UNIT_LABEL` — 3 component arasında paylaşılan formatlama.
- `frontend/src/shared/components/HistoryTable.tsx` (yeni) — jenerik, kaydırılabilir (`max-height
  + overflow-y`) tablo component'i; hücreler opsiyonel olarak tıklanabilir (`onClick`).
- `IncidentPanel`, `FieldUnitPanel`, `Dashboard` — artık kendi ilgili geçmişlerini (`operationalTasks`
  filtrelenerek) `HistoryTable` ile tablo halinde gösteriyor, en yeni en üstte sıralı.
- **Çapraz gezinme:** Herhangi bir tablodaki Unit/Incident hücresine tıklamak, o varlığı seçili
  hale getiriyor (`setSelectedIncident`/`setSelectedFieldUnit` — haritadaki marker tıklamasıyla
  birebir aynı mekanizma) — operatör artık haritada hangi marker'ın hangi kayıt olduğunu tahmin
  etmek zorunda kalmıyor.

## 4. Ek düzeltmeler (bu oturumda bulunan, madde 3'e dahil edilmeyen)

- `IncidentsSummary`'nin gösterdiği sayı, tüm zamanların incident sayısından (`incidents.length`)
  haritadakiyle tutarlı **aktif** incident sayısına çevrildi (`status !== "Resolved"` filtresi),
  başlık "Total Count of Incidents" → "Active Incidents" olarak güncellendi. Gerekçe: iki farklı
  sayı (tüm zamanlar vs. şu an aktif) aynı ekranda karışınca kafa karıştırıyordu.
- **Netleştirilen kavram (kod değişikliği değil):** "Completed Tasks" sayısı ile "toplam incident"
  sayısının birbirini tutmaması bug değil — biri **task** sayısı (bir incident birden fazla task
  üretebilir, resolve hiç çağrılmadan), diğeri **incident** sayısı; iki farklı metrik.
- **Netleştirilen kavram (kod değişikliği değil):** `Complete Task` (field unit üzerinden, aşağıdan
  yukarı) incident'ı otomatik resolve etmiyor — bilinçli tasarım, "incident bitti mi" kararı
  operatöre ait kalmalı (case study: "all operations may be performed manually").

---

## 5. Sıradaki adım

Level 2'nin kalan maddeleri: filtering (incidents/field units), operational statistics, incident
timeline, operational zones, field unit movement history + gerçek SignalR.

# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 17 Ağustos 2026
**Kapsam:** Level 2 — Operational Awareness (madde "Provide operational statistics" tamamlandı)

Bu doküman, `DEVELOPMENT_LOG6.md`'nin devamı.

---

## 1. Madde — Provide operational statistics

`Dashboard.tsx`'e backend'e dokunmadan (`incidents`/`fieldUnits`/`operationalTasks` zaten
hafızada) yeni bir "Statistics" bölümü eklendi:

- **Incidents by Type** — tüm zamanlar boyunca (resolved dahil) incident'ların tipe göre
  dağılımı, en çok görülen en üstte. `HistoryTable` ile tablo halinde.
- **Average Resolution Time** — `ResolvedAt - ReportedAt` farkının, resolve edilmiş
  incident'lar üzerinden ortalaması. Hiç resolved incident yoksa `"N/A"`. Yeni yardımcı:
  `shared/lib/formatDuration.ts` (ms → `"14 min"` / `"1h 5min"` gibi okunabilir metin).
- **Field Unit Workload** — her field unit'in tamamladığı task sayısı, en çok çalışan en
  üstte; unit adı tıklanabilir (mevcut `onSelectFieldUnit` mekanizması, çapraz gezinme
  deseniyle tutarlı).

**Tartışılan ve reddedilen fikir — pasta grafik:** `IncidentType` enum'ında 7 kategori olması
(pasta grafiklerin >4-5 dilimde okunabilirliğinin düşmesi), yeni bir charting kütüphanesi
gerektirmesi (proje şu ana kadar hiç kullanmadı) ve veri setinin küçük olması (~28 incident)
nedeniyle reddedildi. Tablo formatı tercih edildi — hem tam sayıyı net gösteriyor hem de
`HistoryTable` component'iyle tutarlı.

---

## 2. Sıradaki adım

Level 2'nin kalan maddeleri: filtering (incidents/field units), incident timeline, operational
zones, field unit movement history + gerçek SignalR.