# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 18 Ağustos 2026
**Kapsam:** Level 2 — Operational Awareness (devam ediyor)

Bu doküman, `DEVELOPMENT_LOG5.md`'nin devamı — bu oturumda yapılan işleri ve alınan kararları
kayıt altına alır. Bu oturumun konusu ağırlıklı olarak **UI/UX iyileştirmeleri** (sidebar
karmaşıklığını azaltma, filtreleme, timeline) ve **incident generator'ın coğrafi dağılımı**.

---

## 1. Sidebar reorganizasyonu — Completed Tasks + Statistics alt bölüme taşındı

**Sorun:** `Dashboard.tsx` sidebar'da hem "Operational State" (field unit sayıları, active/
completed task tabloları) hem de "Statistics" (incident type dağılımı, ortalama çözüm süresi,
field unit workload) bölümlerini basıyordu — sidebar aşırı kalabalıklaşmıştı.

**Karar — component ikiye bölündü, layout'a yeni bir slot eklendi:**
- `Dashboard.tsx` (sidebar'da kalıyor): High Priority sayacı, field unit durum sayıları, **Active
  Tasks** tablosu — "şu an ne oluyor" bilgisi, kompakt kalması gereken anlık veriler.
- Yeni `OperationalStatistics.tsx` (sayfanın altında, yeni bir bölümde): **Completed Tasks**
  tablosu + tüm **Statistics** bölümü — geçmişe dönük/analitik veriler, anlık karar için gerekli
  değil.
- `OperationsCenterLayout`'a üçüncü bir prop eklendi: `bottomPanel`. CSS, tek satır flex'ten
  (`map` + `sidePanel`, `100vh` sabit) `flex-direction: column`'a çevrildi — üstte harita+sidebar
  satırı kendi `100vh`'ında sabit kalıyor, altta tam genişlik yeni bir bölüm var, sayfa artık
  dikey scroll edilebilir.

İkisi de aynı prop'ları (`incidents`, `fieldUnits`, `operationalTasks`, `onSelectIncident`,
`onSelectFieldUnit`) alıyor — tıklanabilir satırların (Unit/Incident) haritadaki seçimi
tetikleme davranışı (çapraz gezinme) her iki component'te de korunuyor.

**Reddedilen alternatif:** CSS ile "gizle/aşağı taşı" hilesi değil, layout'un kendisine yeni bir
slot eklendi — `OperationsCenterLayout`'ın "haritanın hangi component olduğunu bilmiyor"
prensibini bozmadan.

---

## 2. Brainstorm — ek tablo ihtiyacı değerlendirildi, şimdilik ertelendi

Kullanıcı "active incident listesi", "completed incident type dağılımı", "field unit tipi
envanteri" gibi ek tabloların gerekip gerekmediğini sordu. Değerlendirme:

- **Field unit tipi envanteri:** Değeri düşük, statik seed data, değişmiyor — eklenmedi.
- **Completed incident type dağılımı:** Mevcut "Incidents by Type" tablosunun (tüm zamanlar)
  neredeyse aynısı, marjinal fayda düşük — eklenmedi.
- **Active incident listesi:** Asıl eksik olan buydu ama tek başına eklemek yerine, aşağıda
  (bölüm 4) ele alınan **filtering** maddesiyle birleştirilmesine karar verildi — filtrelenebilir
  bir liste zaten bu ihtiyacı karşılayacak.

**Sonuç:** Şimdilik hiçbir yeni tablo eklenmedi, sidebar/bottom panel sade kaldı.

---

## 3. "Ready to Resolve" hint — sidebar

**Tespit edilen boşluk:** Bir incident'a birden fazla field unit atanıp hepsi `Complete Task`
ile tamamlandığında, incident hâlâ `InProgress` kalıyor ve hiçbir yerde "bu incident'ı resolve
edebilirsin" bilgisi görünmüyordu — operatör bunu ancak incident'ları tek tek kontrol ederek
fark edebilirdi.

**Tartışılan ve reddedilen çözüm — otomatik resolve:** Case study'nin Level 1 Key Expectations
maddesi *"all operations may be performed manually"* gereği, incident'ın gerçekten bitip
bitmediği kararı operatöre ait olmalı — sistem otomatik karar vermemeli.

**Uygulanan çözüm — görünürlük (hint), otomatik aksiyon değil:**
`Dashboard.tsx`'e yeni bir bölüm eklendi — `incident.status === "InProgress"` ve o incident'a
bağlı hiçbir `Assigned` task kalmamışsa (`assignedIncidentIds` set'i ile hesaplanıyor), incident
"Ready to Resolve" listesinde görünüyor. Satıra tıklamak (`HistoryTable`'ın mevcut tıklanabilir
hücre deseni üzerinden) incident'ı seçip `IncidentPanel`'i açıyor, oradaki var olan "Resolve
Incident" butonu son adımı operatöre bırakıyor. Liste boşken (`readyToResolveRows.length > 0`
şartı) hiç render edilmiyor — sidebar'da boş yer kaplamasın diye.

---

## 4. Filtering — incidents ve field units (Level 2 case study maddesi)

**Tasarım kararları:**
- **Filtre sadece haritayı etkiliyor**, Dashboard/Statistics/panelleri etkilemiyor — "map primary
  interface" ilkesiyle tutarlı, filtre bir görsel odaklama aracı, veri gizleme aracı değil.
  Filtrelenmiş bir field unit haritada gizlense bile, tablo/panel üzerinden hâlâ seçilip
  yönetilebiliyor.
- **Incident filtresi sadece Priority (Low/Medium/High).** Status filtresine gerek yok çünkü
  `useIncidentMarkers.ts` zaten `Resolved` incident'ları haritadan eliyor — haritada zaten sadece
  `Open`/`InProgress` görünüyor, ek bir Status filtresi anlamsız olurdu.
- **Field unit filtresi Status (Available/Dispatched/OutOfService) + Type (5 kategori)** — ikisi
  de anlamlı, field unit'lerin tamamı (resolved gibi bir eleme olmadan) haritada gösteriliyor.
- **Kontroller sidebar'ın en üstünde** (yeni `FilterPanel.tsx`, `features/operations-map/`
  altında) — MapLibre canvas'ı üzerine floating bir panel koymak yerine (z-index/tıklama
  çakışma riski, DEVELOPMENT_LOG2.md §9'daki harita sürprizlerinden ders alınarak) düşük riskli
  sidebar konumu tercih edildi.
- **Boş seçim = "hepsini göster"** (checkbox'lardan hiçbiri işaretli değilken filtre
  uygulanmıyor) — sayfa ilk açıldığında haritanın bomboş görünmesi kötü bir varsayılan olurdu.
- **State yönetimi:** `App.tsx`'te düz `useState` (mevcut `selectedIncident`/`selectedFieldUnit`
  deseniyle birebir aynı) — kurulu ama hiç kullanılmamış `zustand`'a geçmeye gerek görülmedi.

`App.tsx`, `mapIncidents`/`mapFieldUnits` adında filtrelenmiş türetilmiş diziler hesaplayıp
sadece `OperationsMap`'e geçiyor; `Dashboard`/`IncidentPanel`/`FieldUnitPanel`/
`OperationalStatistics` hâlâ ham (`incidents ?? []`, `fieldUnits ?? []`) veriyle besleniyor.

---

## 5. Field unit seed data genişletildi (5 → 15)

**Bulunan gerçek hata:** `FieldUnitConfiguration.cs`'teki seed data'da `FIR-01`, hiçbir
`OperationalTask`'a bağlı olmadan `Status = FieldUnitStatus.Dispatched` olarak tanımlıydı — "1
field unit = 1 aktif iş" modelini (DEVELOPMENT_LOG3.md §6) sessizce bozan, kaynağı belirsiz bir
"meşgul" durumu. `Available`'a çevrilerek düzeltildi.

**Genişletme:** Her tipten (Police/Medical/Fire/UtilityCrew/TrafficControl) 2 unit daha eklendi
(`POL-02`, `POL-03`, ... deseniyle, DEVELOPMENT_LOG3.md §6'daki numaralandırma konvansiyonuna
uygun) — toplam 5 → 15. `OutOfService` sayısı 1'den 3'e çıkarıldı (`TRF-01` zaten mevcut, `FIR-03`
ve `TRF-03` yeni eklendi), geri kalan 12 unit `Available`.

**Migration akışı üzerine bir not:** Seed data ikinci kez elle düzeltilirken (`OutOfService`
alanlarından biri yanlışlıkla `Available` yazılmıştı) aynı migration ismiyle tekrar
`migrations add` denendi, EF yeni bir dosya üretmedi, `database update` de "already up to date"
dedi. **Sebep:** migration dosyaları birer anlık fotoğraf; kaynak koddaki `HasData` değişikliği
otomatik olarak eski migration'a yansımıyor, **yeni bir isimle yeni bir migration** gerekiyor
(`FixFieldUnitOutOfServiceStatus`). Bu, ileride benzer bir seed data düzeltmesi yapılırsa
akılda tutulması gereken bir EF Core davranışı.

---

## 6. Incident Timeline (Level 2 case study maddesi)

**Ayrım netleştirildi:** Var olan "History" tablosu (`IncidentPanel`'de, task-merkezli, en yeni
en üstte) ile "Timeline" (olay-merkezli, kronolojik anlatı) farklı kavramlar. History tablosunda
incident'ın kendi `reportedAt`/`resolvedAt` zaman damgaları hiç görünmüyordu — sadece task
zamanları vardı.

**Karar — History'nin yerini Timeline aldı, yan yana konmadı** (aynı ham veriden türeyen iki
görünüm kafa karıştırır, Statistics'teki pasta grafik kararıyla aynı gerekçe).

**Yeni paylaşılan component — `shared/components/Timeline.tsx`:** `HistoryTable` gibi jenerik
kuruldu (sadece `IncidentPanel`'e özel yazılmadı) — ileride field unit movement history'nin de
aynı "zaman sıralı olay listesi" desenini kullanması bekleniyor. Olaylar **eskiden yeniye
(ascending)** sıralanıyor (History'nin "en yeni en üstte" log mantığının tersi — bir "hikaye"
doğal okuma yönünde akmalı). Her olay opsiyonel `onClick` taşıyabiliyor (History'deki tıklanabilir
Unit hücresi davranışı korundu).

`IncidentPanel.tsx`, seçili incident için şu olayları birleştirip Timeline'a veriyor: "Incident
reported" (`reportedAt`) → her task için "[Unit] assigned" (`assignedAt`) → varsa "[Unit]
completed task" (`completedAt`) → varsa "Incident resolved" (`resolvedAt`, task'lardan bağımsız
tek satır — manuel/otomatik resolve ayrımı timeline'da anlamını yitirdiği için
`MANUAL_RESOLVE_UNIT_LABEL` kullanımı kaldırıldı).

---

## 7. Incident Generator — bölge tabanlı (zone-based) coğrafi dağılım

**Tespit edilen sorun (kullanıcının ChatGPT ile yaptığı bir teknik tartışmadan gelen, doğrulanmış
bir tespit):** `Worker.cs`'teki `CoordinateSpread = 0.05` sabiti, tüm incident'ları tek bir
merkez etrafında (`39.925, 32.836` ± `0.05`) dar bir kutuya sıkıştırıyordu — enlem `39.875–
39.975`, boylam `32.786–32.886`. Sincan gibi merkeze uzak ilçeler (`32.584` boylam) bu kutunun
tamamen dışında kalıyordu, hiçbir zaman incident üretilmiyordu.

**Değerlendirilen ve reddedilen kısım:** ChatGPT'nin önerisinin bir parçası, aynı bölge
tanımlarını field unit'lere ve bir "mesafe bazlı otomatik atama" akışına bağlamayı da
içeriyordu. Bu **reddedildi** — iki sebep: (1) "Recommend suitable field units for new tasks"
case study'de açıkça **Level 3** kapsamı, `DEVELOPMENT_LOG.md`'de zaten bilinçli olarak Level 1
entity'sinden çıkarılmış bir konu (bayatlama + gerçek öneri motoruyla çakışma riski); (2) case
study'de field unit'ler için ayrı bir generator hiç tanımlanmamış (DEVELOPMENT_LOG2.md §2.5),
"field unit generator" diye yeni bir bileşen icat etmek plan dışı bir genişleme olurdu.

**Uygulanan çözüm — sadece incident tarafında ağırlıklı (weighted) bölge seçimi:**

```csharp
private record OperationZone(string Name, double Latitude, double Longitude, double Spread, int Weight);

private static readonly OperationZone[] AnkaraZones =
{
    new("Merkez (Çankaya)", 39.925, 32.836, 0.05, 30),
    new("Keçiören",         39.995, 32.865, 0.03, 12),
    new("Mamak",            39.930, 32.920, 0.03, 12),
    new("Etimesgut",        39.950, 32.670, 0.03, 12),
    new("Sincan",           39.970, 32.575, 0.03, 12),
    new("Gölbaşı",          39.790, 32.810, 0.03, 10),
    new("Pursaklar",        40.040, 32.895, 0.03, 8),
};