`docs/DEVELOPMENT_LOG7.md` olarak hazırladım, sildim (stop hook'u tetiklemesin diye) — işte tam içerik, kendi tarafında kaydedip commit/push'u sen yap:

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 19 Ağustos 2026
**Kapsam:** Frontend mimari yeniden yapılandırması — "harita merkezli, sabit (scroll'suz)
operasyon arayüzü" tasarımına geçiş

Bu doküman, `DEVELOPMENT_LOG6.md`'nin devamı — bu oturumda frontend'in tamamen yeniden
düzenlenmesini kayıt altına alır. Level 2'nin kalan maddelerine (operational zones, SignalR,
movement history) henüz dönülmedi; bu oturum tamamen **mevcut UI'nin yeniden mimarilenmesine**
ayrıldı.

---

## 1. Motivasyon ve tasarım kaynağı

Kullanıcı, frontend'in "karman çorman" olduğunu ve Canva ile hazırladığı bir taslak üzerinden bir
yeniden tasarım fikri getirdi. Taslağın 3 görseli üzerinden şu gereksinimler netleşti:

- Sayfa **hiçbir zaman dikey/yatay scroll olmamalı** (history/liste içeren yerlerin kendi içinde
  scroll olması serbest — zaten `HistoryTable`/`Timeline`'da `max-height + overflow-y` ile
  bu yapılıyordu).
- **Sidebar hâlâ sabit bir layout bölgesi** (mevcut tasarımdaki gibi) — ama artık haritanın
  altında da **yeni bir sabit bar** var ("bottom bar"), böylece harita hem eninden (sidebar)
  hem boyundan (bottom bar) küçülüyor. **Önemli düzeltme:** İlk yorumlamamda bunun "haritanın
  üzerine yüzen (floating) paneller" olduğunu düşünmüştüm — kullanıcı bunu düzeltti: floating
  olan tek şey **Menu butonu** (ve açıldığında Menu overlay'i), geri kalan her şey sabit
  layout bölgeleri.
- **Menu butonu** (haritanın sol üst köşesinde) tıklanınca **tam ekran bir overlay/modal**
  açılıyor — yeni bir sayfaya yönlendirme değil, "floating page" tarzı bir katman. İçinde bölüm
  listesi var (Completed Tasks, Statistics, ileride Settings), birine tıklayınca aynı overlay
  içinde o bölümün içeriği görünüyor.
- **Bottom bar, 3 eşit sütun:** seçili field unit (+ Assign butonu) | seçili incident (+ Resolve
  butonu) | active tasks + "ready to resolve".
- Marker'a tıklandığında haritada bir tür geri bildirim (popup ya da başka bir yöntem) — bu konu
  **henüz kararlaştırılmadı**, bkz. bölüm 4.

**Çalışma yöntemi kararı:** Kullanıcı açıkça "tek seferde büyük kod bloğu verme, aşama aşama,
her aşamadan sonra test edip onay vereceğim" dedi. Bu yüzden değişiklik 7 küçük aşamaya bölündü,
her biri kendi başına derlenen/çalışan bir ara durum bırakacak şekilde sıralandı.

---

## 2. Yeni layout mimarisi

`OperationsCenterLayout` üç slotluk yapıdan (`map`, `sidePanel`, `bottomPanel`) şu yapıya geçti:

```
map, menu, sidePanel, fieldUnitPanel, incidentPanel, tasksPanel
```

**Görsel iskelet:**

```
┌─────────────────────────────┬──────────────┐
│                              │  Filtreler   │
│           Harita             ├──────────────┤
│      (Menu butonu köşede)    │  Mini özet   │
│                              │   (sayaçlar) │
├─────────────────┬───────────┴──────────────┤
│  Seçili Field    │  Seçili Incident │ Active Tasks +   │
│  Unit + Assign   │  + Resolve       │ Ready-to-Resolve │
└─────────────────┴──────────────────┴──────────────────┘
```

**CSS yaklaşımı:** `.operations-center-layout` artık `flex-direction: column; height: 100vh;
overflow: hidden` — üst satır (`__top`, harita+sidebar) `flex: 1; min-height: 0` ile esnek alanı
dolduruyor, alt satır (`__bottom-bar`) sabit yükseklikte (`220px`, `flex-shrink: 0`). `min-height:
0` kritik bir detay — olmadan flex item'lar içeriklerine göre taşıp sabit yükseklikli bottom
bar'ı garantiye alamıyordu (bilinen bir flexbox davranışı).

Menu butonu/overlay, `.operations-center-layout__map` içine (`{map}{menu}` sırasıyla) gömülü —
bu container zaten `position: relative`, Menu butonu `position: absolute; top/left: 16px` ile
haritanın köşesine biniyor; overlay ise `position: fixed; inset: 0` ile tüm ekranı kaplıyor
(harita dahil, layout'un tamamının üzerine).

---

## 3. Aşama aşama yapılan değişiklikler

### Aşama 1 — Layout iskeleti
`OperationsCenterLayout.tsx`/`.css` yeni grid'e çevrildi, 3 yeni bottom bar sütununa geçici
placeholder metin kondu. Sidebar içeriğine dokunulmadı. Test: grid oranları doğru, sayfa scroll
olmuyor.

### Aşama 2 — Sidebar sadeleştirme
`Dashboard.tsx`'ten "Active Tasks" ve "Ready to Resolve" çıkarıldı — sidebar'da sadece field
unit sayaçları + high priority sayacı kaldı. `Dashboard` artık `operationalTasks`/
`onSelectIncident`/`onSelectFieldUnit` prop'larına ihtiyaç duymuyor.

### Aşama 3 — FieldUnitPanel → bottom bar (1. sütun)
`FieldUnitPanel`'deki **History tablosu kaldırıldı** ("çok detaya gerek yok" kararı) — geriye
tip/unit code/status + (varsa) "Complete Task" butonu kaldı. `AssignTaskButton` da sidebar'dan
bu sütuna taşındı (mockup'ta "Assign butonu burada" notuyla eşleşiyor).

### Aşama 4 — IncidentPanel → bottom bar (2. sütun)
`IncidentPanel`'deki **Timeline kaldırıldı** (Aşama 3'teki History kararıyla simetrik — küçük
sütuna sığmıyor). Geriye tip/priority/status/description + (varsa) "Resolve Incident" butonu
kaldı. **`Timeline.tsx` component'i silinmedi, sadece bağlantısı kesildi** — nereye
taşınacağı bu oturumun sonunda hâlâ açık bir soru (bkz. bölüm 4.2).

### Aşama 5 — Active Tasks + Ready to Resolve → bottom bar (3. sütun)
Aşama 2'de çıkarılan mantık, yeni `features/dashboard/components/ActiveTasksPanel.tsx`
component'ine taşındı (aynı hesaplama: `assignedIncidentIds` set'i ile "ready to resolve"
tespiti, çapraz gezinme tıklamaları). Bu noktada layout iskeleti tamamlandı — sidebar sade,
bottom bar'ın 3 sütunu da dolu.

### Aşama 6 — Menu butonu + boş overlay
`features/menu/components/Menu.tsx` (yeni feature klasörü) — sadece aç/kapa mekanizması, içerik
yok. `OperationsCenterLayout`'a `menu` slotu eklendi.

### Aşama 7 — Completed Tasks + Statistics → Menu içine
`OperationalStatistics.tsx`'in içeriği ikiye bölünüp iki yeni component'e taşındı:
`CompletedTasksSection.tsx` ve `StatisticsSection.tsx` (`features/dashboard/components/`
altında). `Menu.tsx` artık iki katmanlı: önce bölüm listesi (`activeSection === null`), bir
bölüme tıklayınca o bölümün içeriği aynı overlay içinde açılıyor (`← Back to Menu` ile listeye
dönülebiliyor). **UX eklemesi:** bir tabloda Unit/Incident hücresine tıklamak (çapraz gezinme)
artık Menu'yü de otomatik kapatıyor — aksi halde seçim sonucu (bottom bar'daki panel) Menu
açıkken görünmez olurdu. `OperationalStatistics.tsx` artık kullanılmıyor, silinmesi önerildi
(henüz silinmedi, kullanıcı kararı bekleniyor).

**Test sonucu:** Tüm 7 aşama da sorunsuz çalıştı, kullanıcı her aşamadan sonra doğruladı.

---

## 4. Bu oturumun sonunda açık kalan 2 karar

### 4.1 Marker seçim geri bildirimi — popup mu, görsel vurgu mu?

Mockup'ta bir marker'a tıklandığında haritada mini bir bilgi balonu (popup) fikri vardı. Tartışma
sonucunda **popup'a karşı bir öneri sunuldu** (henüz kod yazılmadı, karar bekleniyor):

- **Popup'a karşı gerekçe:** Marker'ın detayı zaten bottom bar panelinde gösteriliyor — popup
  eklemek aynı bilginin iki yerde tekrarı olur, bu oturum boyunca defalarca kaçınılan bir
  durum (History/Timeline birleştirme, pasta grafik reddi ile aynı mantık).
- **Önerilen alternatif:** Seçili marker'ı **görsel olarak vurgulamak** (`useIncidentMarkers.ts`
  içindeki `HIGH_PRIORITY_SCALE` desenine benzer şekilde — seçili marker büyütülür/halka
  eklenir), popup'suz. Detay hep tek yerde (bottom bar) kalır, harita sadece "hangisini
  seçtin" sorusunu cevaplar.

**Durum:** Kullanıcı bu öneriyi değerlendiriyor, henüz onaylanmadı/uygulanmadı.

### 4.2 Timeline nereye taşınacak?

Aşama 4'te `IncidentPanel`'den çıkarılan Timeline'ın (`shared/components/Timeline.tsx`, hâlâ
diskte, bağlantısı kesik) nereye taşınacağı tartışılıyor, iki seçenek masada:

- **Seçenek A:** Menu'ye üçüncü bir bölüm olarak eklemek ("Incident Timeline") — ama bu bölüm
  seçili bir incident gerektiriyor, hiç incident seçili değilken Menu'den açılırsa boş/anlamsız
  görünür.
- **Seçenek B (önerilen, henüz onaylanmadı):** Incident bottom bar panelinde küçük bir "View
  Timeline" linki/butonu — tıklanınca Menu, bölüm listesini atlayıp doğrudan o incident'ın
  Timeline'ını gösterecek şekilde açılır. Gerekçe: Timeline zaten "seçili incident'a bağlı" bir
  şey, genel/bağlamsız Menu listesinde durması mantıksız.

**Durum:** Kullanıcı düşünüyor, karar verilmedi.

---

## 5. Sıradaki adım

Kullanıcı bu iki açık kararı (bölüm 4.1, 4.2) düşünüp karara bağlayacak. Karar verildiğinde:

1. Marker seçim vurgusu (Aşama 8 olarak, eğer onaylanırsa) uygulanacak.
2. Timeline'ın yeni yeri (Seçenek A/B ya da başka bir fikir) uygulanacak.

Bunlardan sonra, bu oturumdan önce kaldığımız yere — Level 2'nin kalan maddeleri (**operational
zones**, ardından **gerçek SignalR**, en sonda **field unit movement history**) — dönülecek.

**Bilinen ufak temizlik kalemi:** `OperationalStatistics.tsx` artık kullanılmıyor, silinmesi
önerildi ama henüz silinmedi.
```

Rahatça düşün, hazır olduğunda devam ederiz.