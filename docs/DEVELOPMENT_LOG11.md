# `docs/DEVELOPMENT_LOG11.md`

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 21 Ağustos 2026
**Kapsam:** Backend kod kalitesi temizliği — DI, isimlendirme tutarlılığı, tekrar eden kod,
dosya adlandırma. `DEVELOPMENT_LOG10.md`'deki frontend temizliğinin backend karşılığı.

Bu doküman `DEVELOPMENT_LOG10.md`'nin devamı. Frontend refactoring turu tamamlandıktan sonra,
aynı prensiplerle (sıfır davranış değişikliği, küçük adımlar, her adımdan sonra elle doğrulama)
backend'e geçildi.

---

## 1. Çalışma yöntemi

- Frontend'teki kontrat aynen taşındı: sıfır davranış değişikliği, her adım kendi başına test
  edilebilir, kullanıcı onayı olmadan bir sonraki adıma geçilmiyor.
- Frontend'in `tsc`/`oxlint` ikilisinin backend karşılığı: her adımdan sonra `dotnet build` +
  ilgili endpoint'lerin Swagger veya çalışan frontend üzerinden elle kontrolü — projede hâlâ
  otomatik test yok.
- Kullanıcının verdiği tek karar: `_dbContext`/servis alanı isimlendirmesinde proje kendi içinde
  ikiye bölünmüş durumdaydı (5 dosya prefix'siz, 4 dosya `_` prefix'li, net bir çoğunluk yoktu)
  — ekosistemin standart konvansiyonu olan `_camelCase`'de karar kılındı.

---

## 2. B1 — DI çift kaydı

`Infrastructure/DependencyInjection.cs`'te `IOperationalTaskService` iki kez kaydedilmişti —
muhtemelen `DEVELOPMENT_LOG9.md`'deki SignalR entegrasyonu sırasında aynı türden bir copy-paste
hatası (o oturumda `Program.cs`'teki benzer bir çift kayıt zaten yakalanıp düzeltilmişti, bu biri
gözden kaçmış). Tek satır silindi.

**Neden hiç bug'a yol açmamıştı:** constructor injection ile tek instance istenirken DI container
son kaydı çözüyor, ikisi de aynı `OperationalTaskService`'i gösterdiği için sonuç değişmiyordu.
Risk, projede hiç kullanılmayan ama teorik olarak var olan `IEnumerable<T>` (collection injection)
senaryosundaydı — o kullanılsaydı aynı instance listede iki kez görünürdü.

---

## 3. B2 — Tekrar eden DTO mapping

`IncidentService.CreateAsync`/`ResolveAsync` ve `OperationalTaskService.CreateAsync`/
`CompleteAsync`, her ikisi de kendi dosyasında birebir aynı `return new XDto(...)` bloğunu iki
kez tekrarlıyordu — frontend'deki `buildTaskCells` bulgusunun backend karşılığı. Her iki serviste
de `private static ToDto(...)` metoduna çıkarıldı.

**Bilinçli olarak dokunulmayan yer — `GetAllAsync`'in `.Select()` projeksiyonu:** bu satırlar EF
Core tarafından SQL'e çevriliyor (`DEVELOPMENT_LOG2.md` §2.7'deki bilinçli performans kararı —
sadece ihtiyaç duyulan kolonlar sorguya yansısın diye). `ToDto`'yu oradan da çağırmak ya EF
Core'un LINQ sağlayıcısının ifadeyi SQL'e çeviremeyip hata vermesine ya da sessizce tüm entity'leri
belleğe çekip sonra map etmeye (performans regresyonu) yol açardı. Bu yüzden `GetAllAsync` hiç
değiştirilmedi, sadece `CreateAsync`/`ResolveAsync`/`CompleteAsync`'in dönüş satırları
(`SaveChangesAsync` sonrası, bellekte zaten yüklenmiş bir entity üzerinde çalışan sıradan C# kodu)
`ToDto`'ya bağlandı.

---

## 4. B3 — `_dbContext` / servis alanı isimlendirmesi standardize edildi

Proje genelinde 9 dosya (4 servis + 5 controller) taranınca gerçek durum ortaya çıktı: 5 dosya
prefix'siz (`dbContext`, `fieldUnitService` gibi), 4 dosya `_` prefix'li (`_dbContext`,
`_incidentService` gibi) — net bir çoğunluk yoktu. `_camelCase` (ekosistem standardı) seçildi,
5 dosya güncellendi (4 dosya zaten doğruydu, dokunulmadı):

- `FieldUnitService.cs`, `FieldUnitLocationHistoryService.cs` (Infrastructure)
- `FieldUnitsControllers.cs`, `FieldUnitLocationHistoriesController.cs`,
  `OperationalZonesController.cs` (Api)

**Netleştirilen konvansiyon detayı:** constructor parametresi hiçbir zaman `_` almıyor, sadece
alan (field) alıyor — ikisi de alsaydı "bu bir field mi yoksa kısa ömürlü bir parametre/local mi"
ayrımı koddan okunamaz hale gelirdi. Alan adı parametre adından farklılaştığı için (`_dbContext`
vs `dbContext`), önceden gerekli olan `this.dbContext = dbContext;`'teki `this.` niteleyicisi de
gereksizleşti, kaldırıldı.

---

## 5. B4 — `IOperationalZoneService` kendi dosyasına ayrıldı, DTO dosya adı düzeltildi

`SmartCityOps.Application/OperationalZones/OperationalZoneService.cs` adlı dosya, projedeki tek
örnek olarak, aslında sadece bir **arayüz** (`IOperationalZoneService`) içeriyordu — gerçek
implementasyon, adı `OperationalZoneService` olan başka bir dosyada, başka bir projede
(`Infrastructure`) yaşıyordu. Her feature'ın kendi `IXService.cs`/`XService.cs` ayrımını takip
ettiği projede bu, yanıltıcı bir istisnaydı.

```bash
git mv .../OperationalZoneService.cs .../IOperationalZoneService.cs
git mv .../OperationalZone.Dto.cs .../OperationalZoneDto.cs
```

İçerik hiç değişmedi, sadece dosya adları. **Teknik not:** C#'ta dosya adı ile namespace/tip adı
arasında TypeScript'teki gibi bir bağ yok — `using` ifadeleri namespace'e göre çözülüyor, dosya
yoluna göre değil. Bu yüzden bu iki yeniden adlandırma, projedeki hiçbir başka dosyada tek bir
satır bile değiştirmeyi gerektirmedi (frontend'deki `FieldUnitMovmentHistorySection.tsx`
yeniden adlandırmasının aksine — orada `Menu.tsx`'teki import satırının da güncellenmesi
gerekmişti, çünkü ES module'lerde dosya yolu = import yolu).

---

## 6. B5 — Controller dosya adlarındaki fazladan "s"

`IncidentsControllers.cs` → `IncidentsController.cs`, `FieldUnitsControllers.cs` →
`FieldUnitsController.cs`. Sınıf adları zaten doğruydu (`IncidentsController`,
`FieldUnitsController`), sadece dosya adları çoğuldu. B4'teki aynı gerekçeyle (namespace/tip
çözümü dosya yoluna bağlı değil) başka hiçbir dosyaya dokunulmadı.

---

## 7. B6 — `SmartCityOps.Api.http` gerçek isteklerle dolduruldu

Dosya hâlâ Visual Studio'nun `dotnet new webapi` şablonundan kalma haliyle duruyordu — yanlış
port (`5159`, gerçek port `DEVELOPMENT_LOG2.md` §2.6'dan beri `5080`) ve hiç var olmamış bir
`/weatherforecast` endpoint'i.

Yeni içerik: base URL `http://localhost:5080/api`'ye çekildi (frontend'in `httpClient.ts`'iyle
aynı desen), 5 `GET` endpoint'i + incident oluşturma tam çalışır halde eklendi. ID gerektiren 3
istek (resolve, task assign, task complete) bilinçli olarak yorum satırı halinde bırakıldı — VS
Code'un REST Client eklentisi ile Visual Studio'nun yerleşik HTTP client'ının
response-'den-değişken-yakalama sözdizimleri farklı, hangi araç kullanıldığı bilinmediği için
sessizce çalışmayan bir zincirleme yerine elle ID yapıştırma tercih edildi.

**Bu adımın diğerlerinden farkı:** `.http` dosyaları derlemenin parçası değil, hiçbir `.csproj`
bunu compile item olarak görmüyor — bu yüzden `dotnet build` bu adımı hiç doğrulayamıyor, tek
doğrulama yöntemi editörde elle "Send Request" denemek.

---

## 8. Sonuç — backend temizliğinin toplamı

| Kalem | Durum |
|---|---|
| DI çift kaydı | Düzeltildi (B1) |
| Tekrar eden DTO mapping (`IncidentService`, `OperationalTaskService`) | `ToDto` helper'larına çıkarıldı (B2) |
| `_dbContext`/servis alanı isimlendirmesi | 5 dosyada `_camelCase`'e standardize edildi (B3) |
| `IOperationalZoneService` / `OperationalZoneDto` dosya adları | Düzeltildi (B4) |
| Controller dosya adlarındaki fazla "s" | Düzeltildi (B5) |
| `SmartCityOps.Api.http` | Gerçek isteklerle güncellendi (B6) |

Hiçbir adımda davranış değişikliği olmadı — her adım `dotnet build` (temiz derleme) + ilgili
endpoint'in Swagger veya çalışan frontend üzerinden elle testiyle doğrulandı, kullanıcı onayı
olmadan bir sonrakine geçilmedi.

Frontend (`DEVELOPMENT_LOG10.md`) ve backend (bu doküman) refactoring turlarının ikisi de
tamamlandı — proje artık Level 3'e, hiçbir bilinen kod kalitesi/tutarlılık borcu taşımadan
giriyor.

---

## 9. Sıradaki adım

Kod kalitesi temizliği (frontend + backend) tamamen bitti. Sırada **Level 3 — Advanced
Operations** var. Bu iki refactoring oturumu sırasında not düşülen, Level 3'e başlamadan önce
göz önünde bulundurulması gereken iki gerçek tasarım riski hâlâ geçerli (bilinçli olarak bu
oturumlarda ele alınmadı, çünkü davranış değişikliği gerektiriyorlar):

- **`OperationalTaskService.CreateAsync`'teki check-then-act yarış durumu** — aynı field unit'in
  iki operatör tarafından aynı anda atanmaya çalışılması senaryosunda hiçbir koruma yok. Level
  3'ün "Detect resource conflicts (e.g., multiple operators assigning the same field unit)"
  maddesiyle doğrudan örtüşüyor.
- **`App.tsx`'teki (artık `useSelection.ts`) seçim state'inin bir SignalR invalidation sonrası
  bayatlayabilmesi** — çoklu operatör senaryosunda bir operatörün ekranı, başka bir operatörün
  az önce değiştirdiği bir kaydı hâlâ eski haliyle gösterebiliyor.

Level 3'ün case study'deki 5 maddesi (field unit önerisi, kaynak çakışması tespiti, tahmini
varış süresi, kısıtlı/operasyonel bölge tanımı, geçmiş operasyonların tekrar oynatılması) henüz
hiç ele alınmadı — sıradaki oturumun konusu bu.
```

---

That's `DEVELOPMENT_LOG11.md`. Save it, and both refactoring passes — frontend and backend — are fully documented and closed out. `README.md`'s status section already reflects this from Phase 6, so no further doc changes needed.

Whenever you're ready, Level 3 is next — and given the two risks flagged in §9 above (the assignment race condition and the stale-selection issue) sit right at the heart of what Level 3 asks for, that's probably the natural place to start that conversation when you get to it.