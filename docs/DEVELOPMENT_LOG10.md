
**Content changes** (beyond the markdown fixes): Level 2's status line now says "✅ Complete" — it was frozen at "mostly complete... temporary polling workaround" from before `DEVELOPMENT_LOG9.md` shipped real SignalR. Added one line noting today's refactor pass, pointing at the new log entry below.

## 2. Create `docs/DEVELOPMENT_LOG10.md`

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 21 Ağustos 2026
**Kapsam:** Frontend kod kalitesi temizliği — ölü kod, tekrar eden kod ve büyük dosyaların
modülerleştirilmesi. Backend tarafı henüz ele alınmadı.

Bu doküman `DEVELOPMENT_LOG9.md`'nin devamı. Level 2 tamamlandıktan sonra, Level 3'e geçmeden
önce, kullanıcının açık talimatıyla bu oturum tamamen **davranış değişikliği içermeyen** bir
frontend refactoring turuna ayrıldı.

---

## 1. Çalışma yöntemi ve kapsam

- **Kontrat:** sıfır davranış değişikliği, sıfır görsel değişiklik. Her adımdan sonra
  `tsc --noEmit` + `oxlint` + tarayıcıda elle test — projede hâlâ hiç otomatik test yok, bu yüzden
  bu üçlü tek güvenlik ağı.
- Kullanıcının verdiği 3 karar: `OperationalStatistics.tsx` silinmedi (kullanılmıyor ama
  korunuyor, ileride geri bağlanabilir); `react-router-dom`/`zustand` `package.json`'da kaldı
  (kullanılmıyor ama korunuyor); `App.tsx` tam parçalama uygulandı (planlanan 6 adımın hepsi);
  test runner (vitest) eklenmedi.

---

## 2. Faz 1 — Ölü kod ve isimlendirme

- 5 kullanılmayan dosya `git rm` ile silindi: kök `package-lock.json` (yanlış dizinden çalıştırılmış
  bir `npm` komutunun kalıntısı, `{"packages": {}}` içeriyordu), `frontend/src/assets/vite.svg`,
  `frontend/public/icons.svg`, `frontend/src/shared/components/.gitkeep` (klasör artık iki gerçek
  dosya içeriyor). **`OperationalStatistics.tsx` kullanıcı talebiyle silinmedi** — bkz. §3.1.
- `FieldUnitMovmentHistorySection.tsx` → `FieldUnitMovementHistorySection.tsx` yeniden adlandırıldı
  (dosya adındaki eksik "e" düzeltmesi — component/interface adları zaten doğru yazılmıştı, sadece
  dosya adı yanlıştı). Tek referans (`Menu.tsx`) güncellendi.
- `Menu.tsx`'teki tek Türkçe UI string'i ("Kapat") → "Close" (proje kararı: UI dili İngilizce, kod
  yorumları Türkçe kalıyor).

---

## 3. Faz 2 — Tekrar eden kod

### 3.1 `buildTaskCells` ve türevleri — üç dosyada birebir aynıydı

`OperationalStatistics.tsx`'in gerçekte `CompletedTasksSection.tsx` + `StatisticsSection.tsx`'in
birebir kopyası olduğu satır satır diff ile doğrulandı (`DEVELOPMENT_LOG7.md` §Aşama 7'de anlatılan
bölünmenin orijinal, silinmemiş hâli). Bu yüzden planlanan tek adımlık bir "iki dosyayı ortak
fonksiyona bağla" işi, üç dosyayı da kapsayan bir işe dönüştü:

- `features/operational-tasks/lib/buildTaskRow.ts` — `buildActiveTaskRows`/
  `buildCompletedHistoryRows`; `ActiveTasksPanel`, `CompletedTasksSection` ve
  `OperationalStatistics` üçü de kullanıyor.
- `features/dashboard/lib/buildOperationalStatistics.ts` — `buildIncidentsByTypeRows`/
  `computeAverageResolutionMs`/`buildFieldUnitWorkloadRows`; `StatisticsSection` ve
  `OperationalStatistics` kullanıyor.

**Sonuç:** `OperationalStatistics.tsx` 153 satırdan ~50 satıra indi, artık kendi mantığı yok —
diğer iki dosyanın çağırdığı aynı fonksiyonları çağırıyor. Kullanılmıyor olsa bile artık koddan
sapamaz; ileride tekrar bağlanırsa, o an diğer iki dosyada geçerli olan davranışın aynısını
otomatik olarak alır.

### 3.2 Buton CSS'i — 8 tekrar eden kural → tek `.app-button`

`shared/styles/buttons.css` — `.app-button` (temel stil) + `.app-button--outlined` (Menu'nün
bölüm listesi butonları için, gerçek bir görsel varyant). `.menu-button` (floating buton)
bilinçli olarak ayrı bırakıldı — `position: absolute`, `box-shadow`, farklı metin rengi, ekstra
`opacity` hover'ı gibi gerçek farkları var. `AssignTaskButton.css` tamamen silinmedi, sadece
kendine özgü `margin-top` kuralına indirildi — bu buton diğerlerinden farklı olarak bir
`__actions` flex sarmalayıcısı içinde değil.

---

## 4. Faz 3 — `App.tsx` parçalanması (163 → 114 satır)

Altı ayrı çıkarma, her biri kendi başına test edildi:

| Adım | Çıkarılan | Yeni dosya |
|---|---|---|
| 3.1 | Harita filtre state'i (3 `useState` + 3 toggle) | `features/operations-map/hooks/useMapFilters.ts` |
| 3.2 | `mapIncidents`/`mapFieldUnits` filtreleme — saf fonksiyon | `features/operations-map/lib/applyMapFilters.ts` |
| 3.3 | Seçim state'i (`selectedIncident`/`selectedFieldUnit`/`clearSelection`) | `app/hooks/useSelection.ts` |
| 3.4 | 5 `useQuery` çağrısı + `?? []` fallback'leri (JSX'te 11 kez tekrarlanıyordu) | `app/hooks/useOperationsData.ts` |
| 3.5 | Sidebar (`FilterPanel` + `IncidentsSummary` + `Dashboard`) | `app/components/OperationsSidebar.tsx` |
| 3.6 | Bottom bar'ın field unit sütunu (`FieldUnitPanel` + koşullu `AssignTaskButton`) | `app/components/FieldUnitColumn.tsx` |

**Karar — state (`useMapFilters`) ile mantık (`applyMapFilters`) ayrı dosyalarda:** filtreleme
mantığı React'tan tamamen bağımsız, saf bir fonksiyon (`(incidents, priorities) → incidents`) —
hook'un incident'ın ne olduğunu bilmesine gerek yok, sadece state'i yönetiyor.

**Karar — `onCompleted`/`onAssigned`, `FieldUnitColumn`'da tek bir prop'a birleştirilmedi:**
ikisi şu an `App.tsx`'te aynı fonksiyona (`clearSelection`) bağlansa da, kavramsal olarak farklı
olaylar. Birleştirmek "bunlar her zaman aynı şeyi yapar" varsayımını component'in içine gömerdi
— bu sadece bugünkü bir tercih, kalıcı bir gerçek değil.

**Sonuç:** 163 → 114 satır. İlk tahmin edilen ~72'den yüksek çıktı — gerçek sayı, `App.tsx`'in
zaten sahip olması gereken `<OperationsCenterLayout>` composition'ının (yaklaşık 85 satır) dürüst
boyutunu yansıtıyor; geri kalan ~30 satır 6 küçük `const` bildirimi.

---

## 5. Faz 4 — `Menu.tsx` parçalanması (144 → 52 satır)

| Adım | Çıkarılan |
|---|---|
| 4.1 | `MenuButton.tsx` — floating buton |
| 4.2 | `MenuOverlay.tsx` — backdrop + content shell + Back/Close chrome (`children` alıyor) |
| 4.3 | `MenuSectionRouter.tsx` — 4 view branch'i + section-list |

**Bulunan ve düzeltilen küçük bir yapısal detay:** Orijinal JSX'te Back butonunu section
içeriğiyle aynı `<div>` içinde sarmalayan bir wrapper vardı; bu wrapper'ın hiç `className`'i
yoktu ve ebeveyni (`.menu-overlay__content`) hiçbir CSS kuralında doğrudan child'lara bağlı
değildi. Back, `MenuOverlay`'e taşınırken bu gereksiz wrapper'lar kaldırıldı — DOM'da bir
elemanlık fark yaratıyor ama görsel olarak hiçbir etkisi yok (stilsiz `<div>`).

**Teknik not — tip-only circular import:** `MenuSectionRouter.tsx`, `MenuView` tipini
`Menu.tsx`'ten `import type` ile alıyor; `Menu.tsx` da `MenuSectionRouter` component'ini gerçek
bir import ile alıyor. İki dosya birbirine döngüsel bağlıymış gibi görünüyor ama `import type`,
`tsconfig.app.json`'daki `verbatimModuleSyntax: true` sayesinde derleme çıktısından tamamen
siliniyor — runtime'da gerçek bir döngü hiç oluşmuyor, sadece TypeScript'in tip kontrolü
seviyesinde var.

`Menu.css` bu fazın sonunda tamamen boşaldığı için silindi — `OperationalStatistics.tsx`'in
aksine, boş bir CSS dosyasının hiçbir gelecekteki kullanımı olamaz.

---

## 6. Faz 5 — Harita ve filtre temizliği

- **`useMapInstance.ts`** — MapLibre kurulum/resize/cleanup mantığı (StrictMode + ResizeObserver
  bug fix'i dahil, bkz. `DEVELOPMENT_LOG2.md` §9.1) `OperationsMap.tsx`'ten birebir korunarak
  çıkarıldı. `lib/mapConfig.ts` — `ANKARA_CENTER`/`ANKARA_BOUNDS`/harita stil URL'i isimlendirilmiş
  sabitlere çıkarıldı (`ANKARA_BOUNDS`, `DEVELOPMENT_LOG8.md` §1.6'da zone kapsamı genişletilirse
  değişmesi gerektiği not edilen sabit — artık ayrı, bulunabilir bir dosyada). Aynı adımda:
  bayatlamış `// YENİ` yorumları silindi, destructuring parametre sırası interface ile hizalandı
  — ayrı bir adım olarak değil, zaten değiştirilen aynı satırlara dahil edilerek (gereksiz ikinci
  bir diff yerine).
- **`FilterCheckboxGroup.tsx`** — projenin ilk generic component'i (`<T extends string>`).
  `FilterPanel.tsx`'teki 3 kopyalanmış checkbox bloğu tek component'e indirildi. Enjekte edilebilir
  bir `formatOption` prop'u yerine (fazla esneklik, henüz hiçbir ihtiyaç karşılamıyor) `formatEnumLabel`
  doğrudan import edilip çağrıldı — günün diğer tüm extraction'larıyla (`getFieldUnitLabel`,
  `getIncidentLabel` gibi) tutarlı bir tercih, YAGNI.

---

## 7. Sonuç — bugün yapılanların toplamı

| Dosya | Önce | Sonra |
|---|---|---|
| `App.tsx` | 163 satır | 114 satır |
| `Menu.tsx` | 144 satır | 52 satır |
| `OperationsMap.tsx` | 75 satır | 32 satır |
| `FilterPanel.tsx` | 73 satır | 40 satır |
| `OperationalStatistics.tsx` | 153 satır (3 dosyaya kopyalanmış mantık) | ~50 satır (0 kopya mantık) |

**Yeni dosyalar:** `useMapFilters.ts`, `applyMapFilters.ts`, `useSelection.ts`,
`useOperationsData.ts`, `OperationsSidebar.tsx`, `FieldUnitColumn.tsx`, `buildTaskRow.ts`,
`buildOperationalStatistics.ts`, `shared/styles/buttons.css`, `MenuButton.tsx` (+ css),
`MenuOverlay.tsx` (+ css), `MenuSectionRouter.tsx` (+ css), `useMapInstance.ts`, `mapConfig.ts`,
`FilterCheckboxGroup.tsx` (+ css).

**Silinen dosyalar:** kök `package-lock.json`, `vite.svg`, `icons.svg`, `.gitkeep`, `Menu.css`.

Hiçbir adımda davranış veya görsel değişiklik olmadı — her adım `tsc --noEmit` + `oxlint` +
tarayıcıda elle test ile tek tek doğrulandı, kullanıcı onayı olmadan bir sonrakine geçilmedi.

---

## 8. Sıradaki adım

Frontend refactoring turu tamamlandı. Sıradaki oturum: **backend temizliği** — bilinen kalemler:

- `Infrastructure/DependencyInjection.cs`'teki `IOperationalTaskService` çift kaydı.
- Servislerdeki `_dbContext` (`IncidentService`/`OperationalTaskService`) vs. `dbContext`
  (`FieldUnitService`/`FieldUnitLocationHistoryService`) isimlendirme tutarsızlığı.
- `IOperationalZoneService`'in kendi dosyası yerine `OperationalZoneService.cs` içinde tanımlı
  olması (diğer tüm feature'larda arayüz ayrı bir dosyada); `OperationalZone.Dto.cs` dosya
  adındaki fazladan nokta.
- Controller dosya adlarındaki fazladan "s" (`IncidentsControllers.cs`, `FieldUnitsControllers.cs`).
- `SmartCityOps.Api.http` dosyasının hâlâ Visual Studio şablonundan kalma `/weatherforecast`
  içermesi.

**Level 3'e geçmeden önce ele alınması önerilen, bu oturumda dokunulmayan iki gerçek tasarım
riski** (sadece not düşülüyor): `OperationalTaskService.CreateAsync`'teki check-then-act yarış
durumu — aynı field unit'in iki operatör tarafından aynı anda atanmaya çalışılması senaryosunda
bir koruma yok; ve `App.tsx`'teki seçim state'inin (`selectedIncident`/`selectedFieldUnit`) bir
SignalR invalidation sonrası bayatlayabilmesi — ikisi de Level 3'ün "resource conflict detection"
ve çoklu operatör senaryolarıyla doğrudan ilişkili.

Kullanıcının bu oturumda not aldığı, henüz paylaşılmamış iki küçük madde de hâlâ bekliyor.