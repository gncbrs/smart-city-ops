# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 24 Ağustos 2026
**Kapsam:** Level 3 — Advanced Operations, uçtan uca tamamlandı: Phase 0 (Task Assignment Rule
Pipeline, Concurrency Guard & Domain Exceptions, In-Memory Domain Event Dispatcher), Phase 1.1–1.2
(Task Reassignment), Phase 2.1–2.2 (Field-Unit Recommendation & ETA), Phase 3.1–3.2 (Restricted
Zones), Phase 4.1–4.2 (Operations Replay) — backend + frontend. Ayrıca, case study'nin resmî
kapsamı dışında isteğe bağlı bir UX iyileştirmesi olarak Phase 5 (Field Unit Travel Animation &
Dispatched Route Line) eklendi.

Bu doküman `DEVELOPMENT_LOG11.md`'nin devamı. İki refactoring turu (`DEVELOPMENT_LOG10.md`
frontend, `DEVELOPMENT_LOG11.md` backend) tamamlandıktan sonra Level 3'e — case study'nin
"Advanced Operations" bölümüne — geçildi. Bu oturumun çalışma yöntemi önceki iki refactoring
turundan farklı: iş, kullanıcı tarafından küçük, numaralandırılmış fazlara bölündü (Phase 0.1,
0.2, 0.3, 1.1, 1.2, ... 4.1, 4.2), her faz tek başına derlenip kullanıcı onayı alındıktan sonra
bir sonrakine geçildi. Önceki turların "sıfır davranış değişikliği" ilkesi burada geçerli değil —
her faz kasıtlı olarak yeni davranış ekliyor.

---

## 1. Phase 0.1 — Task Assignment Rule Pipeline Foundation

**Problem:** `OperationalTaskService.CreateAsync` içinde iki inline validasyon vardı (field
unit'in `Available` olması, incident'in `Resolved` olmaması). Level 3'ün kaynak-çakışması tespiti
ve gelecekte eklenecek diğer atama kurallarının (ETA, kısıtlı bölge vb.) bu servise organik olarak
eklenebilmesi için önce genişleyebilir, composable bir kural altyapısı gerekiyordu.

**Çözüm:**
- `Application/OperationalTasks/AssignmentRules/`: `ITaskAssignmentRule` (arayüz —
  `EvaluateAsync(TaskAssignmentContext, CancellationToken)`), `TaskAssignmentContext`
  (`Incident` + `FieldUnit` taşıyan record), `RuleEvaluationResult` (`IsSatisfied` +
  `FailureReason`, `Success()`/`Failure(reason)` factory metotları), `ITaskAssignmentRulePipeline`.
- `Infrastructure/OperationalTasks/AssignmentRules/`: `FieldUnitAvailabilityRule`,
  `IncidentNotResolvedRule` (eski inline check'lerin birebir taşınmış hâli),
  `TaskAssignmentRulePipeline` (DI'dan `IEnumerable<ITaskAssignmentRule>` alıp sırayla
  değerlendiren, ilk başarısızlıkta kısa devre yapan implementasyon).
- DI: iki kural + pipeline `Infrastructure/DependencyInjection.cs`'e kaydedildi — kayıt sırası
  değerlendirme sırasını belirliyor, eski if/if sırasıyla birebir aynı (önce field unit
  availability, sonra incident resolved).
- `OperationalTaskService.CreateAsync`, iki inline `if` yerine artık
  `_rulePipeline.EvaluateAsync(new TaskAssignmentContext(incident, fieldUnit), ct)` çağırıyor.

**Neden arayüz Application'da, implementasyon Infrastructure'da:** projenin `I*Service`/
`*Service` konvansiyonuyla birebir aynı desen. `FieldUnitAvailabilityRule` ve
`IncidentNotResolvedRule` aslında DB'ye hiç dokunmuyor (context zaten yüklenmiş entity'leri
taşıyor), yani saf iş kuralı olarak Application'da da yaşayabilirlerdi — ama gelecekteki kurallar
(örn. kaynak çakışması tespiti) muhtemelen DbContext sorgusu gerektirecek. Tüm kural
implementasyonlarını baştan tek katmanda (Infrastructure) toplamak, "bazı kurallar Application'da
bazıları Infrastructure'da" tutarsızlığına düşmeyi önlüyor.

`dotnet build`: 0 hata.

---

## 2. Phase 0.2 — Concurrency Guard & Domain Exceptions

**Problem:** `CLAUDE.md`'de belgelenmiş, bilinen bir tasarım riskiydi —
`OperationalTaskService.CreateAsync`'te check-then-act yarış durumu: iki operatör aynı field
unit'i eş zamanlı atamaya çalışırsa, ikisi de "Available" kontrolünü geçip ikisi de görev
oluşturabiliyordu.

**Domain exceptions:** `Domain/Exceptions/` altında `DomainException` (abstract base),
`ValidationException` (400'e haritalanacak), `ResourceConflictException` (409'a haritalanacak).
`Api/ExceptionHandling/DomainExceptionHandler.cs` bu ikisini haritaladı; henüz taşınmamış diğer
çağrı yerleri (örn. `IncidentService.ResolveAsync`'teki "zaten resolved" kontrolü) için eski
`InvalidOperationException → 409` fallback'i bilinçli olarak korundu — bu faz sadece
`OperationalTaskService`'i kapsıyordu.

**DB seviyesinde koruma — partial unique index:** `OperationalTaskConfiguration.cs`'te
`FieldUnitId` üzerindeki düz index, `.IsUnique().HasFilter("\"Status\" = 'Assigned'")` ile partial
unique index'e çevrildi (`IX_OperationalTasks_FieldUnitId_ActiveAssignment`) — bir field unit'in
aynı anda birden fazla `Assigned` task'ta bulunması artık PostgreSQL seviyesinde imkânsız. EF Core,
aynı property üzerindeki iki `HasIndex(t => t.FieldUnitId)` çağrısını (eski düz + yeni partial
unique) otomatik olarak tek index'e birleştirdiği için kod tek `HasIndex` çağrısına sadeleştirildi.

**Servis tarafı:** `OperationalTaskService.CreateAsync`'te `SaveChangesAsync`, artık
`try/catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState:
PostgresErrorCodes.UniqueViolation })` ile sarılı; yakalanan constraint ihlali
`ResourceConflictException`'a çevriliyor. Uygulama kodundaki kontrol yarışa açık kalsa da (check
hâlâ check-then-act), DB artık son sözü söylüyor — riski gerçekten kapatan adım bu.

**Migration:** `20260824080243_AddOperationalTaskActiveAssignmentUniqueIndex`. Doğrulama için
ardından ikinci bir migration üretilip (`dotnet ef migrations add` hiçbir fark bulamadı — model
config ile birebir örtüşüyor) sonra `migrations remove` ile silindi.

`dotnet build`: 0 hata.

---

## 3. Phase 0.3 — In-Memory Domain Event Dispatcher

**Problem:** `OperationalTaskService` ve `IncidentService`, her mutasyondan sonra doğrudan
`_hubContext.Clients.All.SendAsync("OperationsUpdated", ct)` çağırıyordu — servisler SignalR'ın
varlığını biliyordu, bu da servis katmanını transport detayına bağımlı kılıyordu.

**Minimal event sistemi (MediatR yok, 3'üncü parti kütüphane yok):**
- `Application/Common/DomainEvents/`: `IDomainEvent` (marker arayüz), `IDomainEventHandler<in
  TEvent>` (`HandleAsync`), `IDomainEventDispatcher` (`DispatchAsync<TEvent>` — generic metot,
  reflection kullanmıyor).
- `Infrastructure/Common/DomainEvents/DomainEventDispatcher.cs`:
  `IServiceProvider.GetServices<IDomainEventHandler<TEvent>>()` ile handler'ları çözüp sırayla
  `await` ediyor.
- Concrete event'ler feature klasörlerinde: `OperationalTasks/Events/TaskAssignedEvent.cs`,
  `TaskCompletedEvent.cs`; `Incidents/Events/IncidentCreatedEvent.cs`, `IncidentResolvedEvent.cs`
  (`IncidentCreatedEvent`, orijinal istek listesinde yoktu, ama `IncidentService.CreateAsync`'in
  de hub çağrısı vardı — kapsam tam olsun diye eklendi).
- `Infrastructure/Hubs/SignalROperationsNotificationHandler.cs`: tek sınıf, dört farklı
  `IDomainEventHandler<T>`'ı implemente ediyor, hepsi aynı `NotifyAsync` yardımcı metodu
  üzerinden tek coarse-grained `OperationsUpdated` broadcast'ine yönleniyor — `CLAUDE.md`'de
  belgelenen "tek event, per-entity payload yok" mimari kararı korunuyor.
- DI: dispatcher + dört handler kaydı `Infrastructure/DependencyInjection.cs`'e eklendi.

`dotnet build`: 0 hata; davranış aynı (hâlâ tek `OperationsUpdated` broadcast'i), ama servisler
artık SignalR'ın var olduğunu bilmiyor.

---

## 4. Phase 1.1 — Backend: Task Reassignment & Enriched Events

**Model:** `OperationalTaskStatus` enum'ına `Reassigned = 2` eklendi.
`ReassignOperationalTaskDto(Guid NewFieldUnitId)`.

**`OperationalTaskService.ReassignAsync` iş kuralları:**
1. Eski task `Assigned` durumda olmalı (değilse `ValidationException`).
2. Yeni field unit, aynı `ITaskAssignmentRulePipeline`'dan geçiyor (incident + yeni field unit
   context'iyle) — Phase 0.1'de kurulan altyapı burada ilk gerçek yeniden kullanımını buldu.
3. Eski task → `Reassigned`, eski field unit → `Available`.
4. Yeni bir `OperationalTask` (`Status: Assigned`) oluşturuluyor; yeni field unit → `Dispatched` +
   incident koordinatlarına taşınıyor; yeni bir `FieldUnitLocationHistory` kaydı ekleniyor —
   `CreateAsync`'teki atama akışıyla birebir aynı, sadece "eski field unit'i serbest bırak" adımı
   eklenmiş hâli.
5. `SaveChangesAsync`, Phase 0.2'deki aynı unique-violation → `ResourceConflictException`
   guard'ıyla sarılı (yeni field unit de aynı partial unique index'e tabi).

**Domain event:** `TaskReassignedEvent(OldTaskId, NewTaskId, IncidentId, OldFieldUnitId,
NewFieldUnitId)`. `SignalROperationsNotificationHandler`'a beşinci `IDomainEventHandler<T>` olarak
eklendi.

**API:** `POST /api/operational-tasks/{id}/reassign` → `OperationalTasksController.Reassign`.

**Migration gerekmedi:** `Reassigned`, mevcut `HasConversion<string>().HasMaxLength(20)` üzerinden
saklanıyor (yeni kolon değil), ve partial unique index'in filtresi zaten yalnızca `'Assigned'`
değerini kapsıyor.

`dotnet build`: 0 hata.

---

## 5. Phase 1.2 — Frontend: Task Reassignment & Conflict Error Handling

**Tipler/API:** `OperationalTaskStatus` union'ına `"Reassigned"` eklendi — projede bu tip üzerinde
exhaustive switch yok, sadece `===` karşılaştırmaları var, bu yüzden değişiklik derlemeyi
bozmadı. `operationalTasksApi.ts`'e `reassignTask(taskId, newFieldUnitId)` eklendi.
`hooks/useReassignTask.ts`, `useCreateTask` ile aynı 4 query key'i invalidate ediyor
(`incidents`, `field-units`, `operational-tasks`, `field-unit-location-histories`).

**Conflict handling:** `shared/lib/getErrorMessage.ts` — backend'in `DomainExceptionHandler`'ının
döndürdüğü `{ message }` gövdesini Axios error'undan çekiyor, yoksa fallback string'e düşüyor. Hem
`AssignTaskButton` hem yeni `ReassignTaskButton`, artık jenerik "Failed to ... Please try again."
yerine sunucunun gerçek mesajını gösteriyor (örn. 409'da "Bu field unit için zaten aktif bir görev
atanmış. Başka bir operatör az önce bu unit'i atamış olabilir.").

**UI:** `ReassignTaskButton.tsx` — `Available` durumundaki field unit'lerden oluşan bir `<select>`
+ "Reassign Task" butonu. `FieldUnitPanel`, seçili field unit `Dispatched` ve aktif task varsa bu
butonu "Complete Task" ile yan yana gösteriyor. `App.tsx`, `fieldUnits.filter(status ===
"Available")`'i hesaplayıp `FieldUnitColumn` üzerinden aşağı geçiriyor; `onReassigned`,
`onCompleted`/`onAssigned` ile aynı şekilde `clearSelection`'a bağlandı — `CLAUDE.md`'de
belgelenen "seçim state'i SignalR invalidation sonrası bayatlayabiliyor" riskini bu üç akış da
aynı (geçici) çözümle bertaraf ediyor: seçimi tamamen temizle.

`npx tsc -b`: 0 hata. `npm run build`: başarılı (mevcut >500kB chunk-size uyarısı hariç, bu
değişiklikle ilgisiz — MapLibre/ana bundle). `npm run lint`: temiz.

---

## 6. Phase 2.1 — Backend: Field-Unit Recommendation Service & Scoring Rules

**Problem:** Level 3 case study kapsamında henüz ele alınmamış bir madde — bir incident için hangi
field unit'in atanmasının en mantıklı olduğuna operatörün karar vermesine yardımcı olacak bir
öneri/skorlama mekanizması yoktu.

**ETA tahmini:** `Application/FieldUnitRecommendations/IEtaEstimator.cs` (`EstimateEta(fromLat,
fromLng, toLat, toLng) : TimeSpan`), `Infrastructure/FieldUnitRecommendations/
HaversineEtaEstimator.cs` — Haversine formülüyle hesaplanan mesafeyi sabit bir ortalama şehir içi
hıza (40 km/h) bölerek `TimeSpan` döndürüyor. Haversine hesaplaması, hem bu estimator'ın hem de
servisin `DistanceKm` alanı için ihtiyaç duyduğu ortak bir hesap olduğundan
`Application/Common/GeoCalculator.cs`'e (statik, framework bağımsız) çıkarıldı — tek kaynaktan
hesaplanıyor, Infrastructure bu yardımcıyı Application'dan kullanıyor.

**Pluggable skorlama kuralları:** `Application/FieldUnitRecommendations/IFieldUnitScoringRule.cs`
(arayüz — `Weight` + senkron `Evaluate(FieldUnitScoringContext) : ScoringRuleResult`,
`ITaskAssignmentRule`'dan farklı olarak async değil çünkü hiçbir kural DB'ye dokunmuyor, sadece
zaten yüklenmiş `Incident`/`FieldUnit`/ETA/mesafe üzerinde saf hesap yapıyor).
`Infrastructure/FieldUnitRecommendations/ScoringRules/`:
- `AvailabilityScoreRule` (weight 0.40): `Available` → 100, `Dispatched` → 10 (meşgul ama sıfır
  değil, öneri listesinde görünmeye devam etsin diye), `OutOfService` → 0.
- `DistanceScoreRule` (weight 0.35): 0–20 km aralığında lineer düşen skor, 20 km ve üzeri 0;
  ≤5 km'de "Olay yerine yakın" `MatchReason`'ı ekleniyor.
- `UnitTypeMatchScoreRule` (weight 0.25): `IncidentType → FieldUnitType[]` eşleşme tablosu
  (örn. `FireAlert → Fire`, `RoadClosure → TrafficControl`, `TrafficAccident → Medical/Police/
  TrafficControl`) — case study'nin örnek isimlendirmesi (`FireBrigade`, `Ambulance`,
  `Municipality`) projenin gerçek enum'larıyla (`FieldUnitType`: Police/Medical/Fire/UtilityCrew/
  TrafficControl) örtüşmediğinden, eşleştirme gerçek enum değerlerine göre kuruldu.

Toplam skor, servis tarafında `Σ(rule.Weight × result.Score) / Σ(rule.Weight)` ağırlıklı
ortalamasıyla hesaplanıyor (üç kuralın ağırlığı 0.40+0.35+0.25=1.0 topladığından sonuç doğrudan
0–100 aralığında kalıyor); yeni bir kural eklendiğinde ağırlıklar yeniden dengelenmeli.

**Servis & DTO:** `FieldUnitRecommendationDto(FieldUnitId, UnitCode, UnitType, Status, DistanceKm,
EstimatedEtaMinutes, TotalScore, MatchReasons)`. `IFieldUnitRecommendationService` /
`FieldUnitRecommendationService` (Infrastructure) — incident'i yükler (yoksa `KeyNotFoundException`
→ mevcut `DomainExceptionHandler` üzerinden 404), tüm field unit'leri çeker, her biri için
DI'dan `IEnumerable<IFieldUnitScoringRule>` olarak enjekte edilen kuralları çalıştırır, sonucu
`TotalScore`'a göre azalan sırada döndürür.

**API:** `GET /api/incidents/{id}/recommendations` → `IncidentsController.GetRecommendations`.

**DI:** ETA estimator, üç skorlama kuralı ve recommendation servisi
`Infrastructure/DependencyInjection.cs`'e eklendi — kayıt deseni `ITaskAssignmentRule` ile birebir
aynı (`IEnumerable<T>` üzerinden çözülen çoklu kayıt).

`dotnet build`: 0 hata, 0 uyarı.

---

## 7. Phase 2.2 — Frontend: Field-Unit Recommendations & ETA Display

**Yeni feature klasörü:** `frontend/src/features/field-unit-recommendations/` —
`types.ts` (`FieldUnitRecommendation`, backend'in `FieldUnitRecommendationDto`'suyla camelCase
üzerinden birebir örtüşüyor, ASP.NET Core'un varsayılan `System.Text.Json` serileştirmesi zaten
camelCase), `api/fieldUnitRecommendationsApi.ts` (`GET /incidents/{id}/recommendations`),
`hooks/useFieldUnitRecommendations.ts` (`staleTime: 15_000`, `enabled: incidentId !== undefined`),
`components/RecommendedUnitsSection.tsx`, `styles/RecommendedUnitsSection.css`.

**Canlı kalma:** öneriler field unit müsaitliğine/konumuna bağlı olduğundan, `CLAUDE.md`'de
belgelenen "yeni bir query key canlı kalmalıysa SignalR invalidation'a ekle" kuralı gereği
`shared/hooks/useSignalR.ts`'teki `OperationsUpdated` handler'ına beşinci invalidation olarak
`["field-unit-recommendations"]` eklendi (kısmi key eşleşmesi sayesinde `incidentId` son eki fark
etmeksizin tüm önerileri geçersiz kılıyor).

**UI:** `RecommendedUnitsSection`, `IncidentPanel`'in içine, incident seçili ve `Resolved` değilken
gömülü. En yüksek skorlu 5 unit'i kart listesi olarak gösteriyor — her kartta unit tipi/kodu, yüzde
skor rozeti, mesafe/ETA/durum satırı ve `MatchReasons` pill'leri. Bir karta tıklamak field unit'i
seçili hale getiriyor (`onSelectFieldUnit` → `App.tsx`'teki `setSelectedFieldUnit`) — ayrı bir
"assign" butonu eklenmedi, çünkü seçim zaten `FieldUnitColumn`'daki mevcut `AssignTaskButton`'ı
(incident + field unit ikisi de seçiliyken) tetikliyor; öneri kartı sadece seçimi yapıyor, atama
akışı Phase 1'den olduğu gibi yeniden kullanılıyor.

**Prop zinciri:** `IncidentPanel`, `fieldUnits` ve `selectedFieldUnitId`/`onSelectFieldUnit` almak
üzere genişletildi (öneri DTO'sundaki `fieldUnitId`'den tam `FieldUnit` nesnesine dönmek ve seçili
kartı vurgulamak için); `App.tsx` bu üç prop'u `useOperationsData`/`useSelection`'dan geçiyor.

**Stil:** proje genelinde CSS değişkenli bir açık/koyu tema sistemi yok — sabit koyu palet
(`#0F172A`/`#1E293B` arkaplan, `#F8FAFC` metin, `#334155` kenarlık, `#3b82f6` vurgu) zaten tüm
panellerde sabit kodlanmış durumda; yeni bileşen de aynı paleti birebir kullanıyor.

`npx tsc -b` + `vite build`: 0 hata (mevcut >500 kB chunk uyarısı hariç, MapLibre bundle'ı — bu
değişiklikle ilgisiz). `npm run lint`: temiz.

---

## 8. Phase 3.1 — Backend: Restricted Zones & Assignment Rule

**Problem:** Level 3 case study'nin kapsamında olan bir başka madde — bazı bölgelerin (hasar
görmüş/tehlikeli alan, güvenlik kilitlemesi, yol çalışması vb.) genel amaçlı field unit atamasına
kapalı olması, sadece o bölgeye uygun uzmanlaşmış unit tiplerinin atanabilmesi gerekiyordu.

**Domain modeli:** `Domain/Entities/RestrictedZone.cs` (`Name`, `Description`, `Latitude`,
`Longitude`, `RadiusMeters`, `ZoneType`, `CreatedAt`, `IsActive`) — projenin diğer entity'leriyle
aynı `EntityBase`/`Guid Id` konvansiyonu. `Domain/Enums/RestrictedZoneType.cs`: `Hazard`,
`SecurityLockdown`, `RoadConstruction`.

**EF Core:** `Persistence/Configurations/RestrictedZoneConfiguration.cs` (`ZoneType` diğer
enum'larla aynı `HasConversion<string>()` deseni, `IsActive` üzerinde index — aktif bölgeleri
filtrelemek assignment rule'un her çağrısında oluyor). `ApplicationDbContext`'e
`DbSet<RestrictedZone> RestrictedZones` eklendi. Migration:
`20260824101220_AddRestrictedZone` (`dotnet ef migrations add` — tek `RestrictedZones` tablosu,
başka fark yok).

**DTO'lar & servis:** `Application/RestrictedZones/`: `RestrictedZoneDto`,
`CreateRestrictedZoneDto`, `IRestrictedZoneService` (`GetAllAsync`, `CreateAsync`,
`GetActiveZonesAsync` — sonuncusu DTO değil doğrudan `RestrictedZone` entity listesi döndürüyor;
`ITaskAssignmentRule.EvaluateAsync(TaskAssignmentContext)`'in zaten `Incident`/`FieldUnit`
entity'lerini taşıdığı presedentle aynı doğrultuda, iç kullanım için Application katmanından
entity döndürmek bu projede yeni değil). `Infrastructure/RestrictedZones/RestrictedZoneService.cs`
implementasyonu standart DbContext CRUD deseni.

**Assignment rule & politika kararı:** Prompt, "uyar ya da uzmanlaşmış unit tipi zorunlu kıl"
seçeneklerinden birini serbest bırakmıştı. Mevcut `ITaskAssignmentRule` sözleşmesi ikili
(`IsSatisfied`/`FailureReason`) — kısmi "uyarı ama engelleme" için ayrı bir kanal
(`RuleEvaluationResult`'a üçüncü bir durum eklemek, pipeline'ı ve `ValidationException`
haritalamasını değiştirmek) gerektirirdi ki bu, mevcut mimariyi genişletmeden tek bir kural için
yapılacak orantısız bir değişiklik olurdu. Bunun yerine "uzmanlaşmış unit tipi zorunlu kıl" seçeneği
uygulandı — mevcut ikili sözleşmeyle birebir örtüşüyor: `Infrastructure/OperationalTasks/
AssignmentRules/RestrictedZoneAssignmentRule.cs`, `IRestrictedZoneService.GetActiveZonesAsync`'i
enjekte ediyor, incident konumunu her aktif bölgenin merkezine `Application/Common/
GeoCalculator.CalculateDistanceKm`'le (Phase 2.1'de zaten var olan Haversine yardımcısı, km→metre
çevrimiyle) ölçüp `RadiusMeters` içine düşüyor mu bakıyor. Düşüyorsa, bölge tipine göre sabit bir
`RestrictedZoneType → FieldUnitType[]` eşleme tablosuyla (`Hazard → Fire/Medical`,
`SecurityLockdown → Police`, `RoadConstruction → TrafficControl/UtilityCrew`) atanan field unit
tipi kontrol ediliyor; uymuyorsa `RuleEvaluationResult.Failure(...)` ile `ValidationException` →
400'e düşüyor (mevcut `FieldUnitAvailabilityRule`/`IncidentNotResolvedRule` ile bire bir aynı hata
akışı).

**API:** `GET /api/restricted-zones`, `POST /api/restricted-zones` →
`RestrictedZonesController` — `IncidentsController.Create` ile aynı `ArgumentException → 400`
deseni (geçersiz `ZoneType` string'i `Enum.Parse` içinde patlıyor).

**DI:** `IRestrictedZoneService` ve üçüncü `ITaskAssignmentRule` kaydı (`RestrictedZoneAssignmentRule`)
`Infrastructure/DependencyInjection.cs`'e eklendi; kayıt sırası bilinçli olarak son — ucuz/pure
kontroller (availability, resolved) önce, DB sorgusu gerektiren bölge kontrolü en son çalışıyor.

`dotnet build`: 0 hata, 0 uyarı. Migration `dotnet ef migrations add` ile üretildi, ikinci bir
`migrations add` denemesi yapılmadı (Phase 0.2'nin aksine, tabloyu ilk kez oluşturan bir migration
için model/config uyuşmazlığı riski zaten manuel gözle doğrulandı).

---

## 9. Phase 3.2 — Frontend: Restricted Zones Map Visualization & Management

**Kapsam öncesi küçük bir backend eki:** Phase 3.1'de `RestrictedZoneService.CreateAsync`
hiçbir domain event dispatch etmiyordu — `CLAUDE.md`'de belgelenen "her mutasyon
`OperationsUpdated` yayınlamalı" kuralı gözden kaçmıştı. Bu fazda "query cache canlı kalsın"
gereksinimini gerçekten karşılayabilmek için `Application/RestrictedZones/Events/
RestrictedZoneCreatedEvent.cs` eklendi, `RestrictedZoneService.CreateAsync`
`SaveChangesAsync`'ten sonra bunu dispatch ediyor, `SignalROperationsNotificationHandler`
altıncı `IDomainEventHandler<T>` implementasyonu olarak bunu da `OperationsUpdated`'e
yönlendiriyor, DI'a eklendi. Bu olmadan yeni bir bölge oluşturulduğunda diğer operatörlerin
ekranı canlı güncellenmeyecekti — dar kapsamlı, geriye dönük bir tamamlama.

**Yeni feature klasörü:** `frontend/src/features/restricted-zones/` — `types.ts`
(`RestrictedZoneType`, `RestrictedZone`, `CreateRestrictedZoneDto`, backend DTO'larıyla camelCase
üzerinden örtüşüyor), `api/restrictedZonesApi.ts` (`fetchRestrictedZones`, `createRestrictedZone`),
`hooks/useRestrictedZones.ts` (`GET`, varsayılan React Query ayarları),
`hooks/useCreateRestrictedZone.ts` (mutation, `onSuccess`'te `["restricted-zones"]`
invalidation — `useReassignTask` ile aynı desen).

**Canlı kalma:** `shared/hooks/useSignalR.ts`'teki `OperationsUpdated` handler'ına altıncı
invalidation olarak `["restricted-zones"]` eklendi (yukarıdaki backend ekiyle birlikte artık
gerçekten tetikleniyor).

**Harita görselleştirmesi:** `lib/buildRestrictedZoneGeoJson.ts`, `operational-zones/lib/
buildZoneGeoJson.ts`'teki dairesel çokgen üretme yaklaşımını (açı üzerinde döngü, `Polygon`
GeoJSON feature) yeniden kullanıyor — ama `OperationalZone.spread`'in aksine `RestrictedZone.
radiusMeters` gerçek bir metre cinsinden yarıçap olduğundan, dereceye çevrim enlem düzeltmeli
yapıldı (`longitudeDelta`, enlemin kosinüsüyle bölünüyor — yüksek enlemlerde boylam derecesinin
sıkışmasını telafi etmek için). Sadece `isActive` bölgeler render ediliyor. `hooks/
useRestrictedZoneLayers.ts`, `useOperationalZoneLayers.ts` ile birebir aynı
kaynak/katman ekleme-temizleme iskeletini (style `load` event'i, cleanup'ta kaynak/katman
kaldırma) izliyor; kırmızı/tehlike temalı üç katman: yarı saydam `fill` (`#dc2626`, opacity 0.15),
kesikli `line` (`line-dasharray`, MapLibre'de kesikli kenarlık `fill` katmanında değil ayrı bir
`line` katmanında yapılıyor), ve isim `symbol` etiketi.

**UI & navigasyon:** `RestrictedZonesSection.tsx` — mevcut bölgeleri `HistoryTable` ile listeliyor
(Name/Type/Center/Radius/Status), altında yeni bölge tanımlamak için düz `input`/`select`/`button`
(projede hiçbir yerde `<form>` elemanı kullanılmadığından, aynı imperatif buton-tetikli mutation
deseni izlendi — `ReassignTaskButton` gibi). `MenuView` union'ına `"restricted-zones"` eklendi,
`MenuSectionRouter`'ın `SECTIONS` listesine bir giriş ve yeni bir `view === "restricted-zones"`
case'i eklendi. Diğer tüm section'lar gibi veri üstten (`useOperationsData` → `App.tsx` →
`Menu` → `MenuSectionRouter`) prop olarak akıyor; sadece create-mutation'ı barındıran component
kendi `useCreateRestrictedZone` hook'unu çağırıyor — bu da `AssignTaskButton`/`ReassignTaskButton`
ile aynı "sorgu üstten prop, mutation yerelde" ayrımı.

**Prop zinciri:** `useOperationsData` → `restrictedZones`; `App.tsx` bunu hem
`OperationsMap`'e (harita katmanları için) hem `Menu`'ye (liste/form için) geçiyor;
`OperationsMap`/`Menu`/`MenuSectionRouter` imzaları buna göre genişledi.

`npx tsc -b` + `vite build`: 0 hata (mevcut >500 kB chunk uyarısı hariç). `npm run lint`: temiz.
`dotnet build` (backend eki dahil): 0 hata, 0 uyarı.

---

## 10. Phase 4.1 — Backend: Operations Replay Snapshot / Event History API

**Problem:** Level 3 case study'nin son maddesi — geçmiş bir zaman noktasındaki operasyon
durumunun ("o an hangi incident'lar açıktı, field unit'ler neredeydi, hangi task'lar aktifti")
yeniden kurulabilmesi. Sistemde ayrı bir event-sourcing/audit-log tablosu yok; mevcut tablolardaki
zaman damgalarından (`ReportedAt`/`ResolvedAt`, `AssignedAt`/`CompletedAt`, `RecordedAt`) geriye
dönük olarak durum türetiliyor.

**DTO'lar:** `Application/OperationsReplay/`: `OperationsSnapshotDto` (`Timestamp`,
`IReadOnlyList<IncidentDto> Incidents`, `IReadOnlyList<FieldUnitReplayDto> FieldUnits`,
`IReadOnlyList<OperationalTaskDto> ActiveTasks`), `FieldUnitReplayDto` (mevcut `FieldUnitDto` ile
aynı alan seti — ayrı tip olarak tanımlandı çünkü replay'deki durum canlı `FieldUnitDto`'dan farklı
bir türetme mantığıyla hesaplanıyor), `ReplayTimeRangeDto` (`MinTimestamp`/`MaxTimestamp`, ikisi de
nullable — DB boşken `null` dönebiliyor), `IOperationsReplayService`.

**Türetme mantığı (`Infrastructure/OperationsReplay/OperationsReplayService.cs`):**
- **Incident durumu:** `ResolvedAt.HasValue && ResolvedAt <= timestamp` → `Resolved`; değilse, o
  incident için `AssignedAt <= timestamp` olan en az bir task varsa → `InProgress`; yoksa → `Open`
  (bu, `OperationalTaskService.CreateAsync`'in incident'i `Open`'dan `InProgress`'e geçirdiği anı
  birebir yansıtıyor).
- **Field unit konumu:** o unit için `RecordedAt <= timestamp` olan en güncel
  `FieldUnitLocationHistory` kaydı; hiç yoksa unit'in şu anki konumuna düşülüyor (daha iyi bir veri
  kaynağı yok).
- **Field unit durumu:** o unit için `AssignedAt <= timestamp` olan en güncel `OperationalTask`
  bulunuyor; task yoksa → `Available`; `Completed` ve `CompletedAt <= timestamp` ise → `Available`;
  `Reassigned` ise → `Available`; aksi halde → `Dispatched`. **İki bilinçli yaklaşıklık, kodda
  satır içi yorumla belgelendi:** (1) `OutOfService`, sadece seed data'da var ve onu değiştiren
  hiçbir endpoint yok, bu yüzden zamandan bağımsız (invariant) kabul ediliyor; (2) `Reassign`
  akışında eski task'ın `CompletedAt`'i hiç set edilmiyor (Phase 1.1), yani devir teslim anının
  kesin zaman damgası DB'de yok — eski field unit, kendi son task'ının `AssignedAt`'inden itibaren
  serbest kabul ediliyor.
- **Aktif task'lar:** `AssignedAt <= timestamp && Status != Reassigned && (CompletedAt == null ||
  CompletedAt > timestamp)`. Reassigned task'lar tamamen dışlanıyor (yukarıdaki aynı devir-teslim
  belirsizliği); sonuçta dönen her satırın `Status`'u, o anki gerçek durumdan bağımsız olarak
  `Assigned`'a sabitleniyor (çünkü bu liste zaten "o an aktif olanlar" tanımıyla filtrelendi —
  ileride `Completed` olacak bir task'ı geçmiş snapshot'ta `Completed` göstermek yanıltıcı olurdu).

**Zaman aralığı:** `GetReplayTimeRangeAsync`, `Incidents.ReportedAt`/`ResolvedAt`,
`FieldUnitLocationHistories.RecordedAt`, `OperationalTasks.AssignedAt`/`CompletedAt` üzerinde
ayrı `MinAsync`/`MaxAsync` sorguları çalıştırıp sonuçları bellekte birleştiriyor (tüm satırları
çekmek yerine) — `List<DateTimeOffset?>.Min()`/`Max()`'ın null'ları otomatik atlayıp hepsi null/boş
ise null döndüren davranışından yararlanılıyor.

**API:** `OperationsReplayController` — `GET /api/operations/replay?timestamp={isoDateTime}`,
`GET /api/operations/replay/range`. Migration gerekmedi (sadece mevcut tabloları okuyor).

**DI:** `IOperationsReplayService` → `OperationsReplayService`,
`Infrastructure/DependencyInjection.cs`'e eklendi.

`dotnet build`: 0 hata, 0 uyarı.

---

## 11. Phase 4.2 — Frontend: Operations Replay Scrubber & Snapshot Visualization

**Yeni feature klasörü:** `frontend/src/features/operations-replay/` — `types.ts`
(`OperationsSnapshot`, `FieldUnitReplay`, `ReplayTimeRange`, `ReplayMode`, `ReplaySpeed`; backend
DTO'larıyla camelCase üzerinden örtüşüyor — `Incident`/`OperationalTask` ve
`FieldUnitType`/`FieldUnitStatus` tipleri mevcut feature'lardan yeniden kullanıldı, tekrar
tanımlanmadı), `api/operationsReplayApi.ts` (`fetchReplayTimeRange`, `fetchOperationsSnapshot`),
`hooks/useReplayTimeRange.ts`/`useOperationsSnapshot.ts` (standart React Query sarmalayıcılar,
ikincisi `enabled` parametresiyle sadece replay modundayken ve bir timestamp seçiliyken
tetikleniyor).

**Playback state — `app/hooks/useReplayController.ts`:** `useSelection`/`useMapFilters` ile aynı
"state hook App'te, component saf/presentational" ayrımı izlendi. Oynatma adımı, sabit
"simülasyon saniyesi/tick" yerine **aralığın yüzdesi** üzerinden hesaplanıyor
(`stepMs = (max - min) / 200 * speed`, 300ms'lik tick) — böylece toplam geçmiş aralığı bir dakika
mı yoksa birkaç saat mi fark etmeksizin, 1x hızında tam taramanın gerçek zamanda ~60 saniye sürmesi
garanti ediliyor; sabit bir "dakika/tick" yaklaşımı küçük veri setlerinde çok hızlı, büyük veri
setlerinde çok yavaş kalırdı. Sona ulaşınca otomatik duruyor (`isPlaying = false`); replay moduna
girildiğinde `timestamp` otomatik olarak `minTimestamp`'e set ediliyor.

**`ReplayControlBar.tsx` + `styles/ReplayControlBar.css`:** haritanın üstünde ortalanmış, yüzen bir
"pill" — Live/Historical Replay mod anahtarı, `<input type="range">` scrubber (`min`/`max`
milisaniye epoch, `step=1000`), Play/Pause butonu, 1x/2x/5x hız `<select>`'i, güncel timestamp
gösterimi (`toLocaleString()`), ve replay modundayken "Historical snapshot — actions disabled"
notu. Konumlandırma `menu-button`/mobil "Filters & Stats" toggle'ıyla aynı absolute-positioning
deseni izliyor ama üst-orta köşede (`left: 50%; transform: translateX(-50%)`) — sol/sağ üst
köşelerdeki diğer yüzen butonlarla çakışmıyor.

**`App.tsx` entegrasyonu:** replay modundayken `snapshot.incidents`/`fieldUnits`/`activeTasks`,
`OperationsMap`, `OperationsSidebar`, `FieldUnitColumn`/`IncidentPanel` ve `ActiveTasksPanel`'e
besleniyor (`liveData` yerine). **`Menu` bilinçli olarak her zaman canlı/tam veriyle besleniyor** —
`Menu`'nin bölümleri (Completed Tasks, Statistics, Timeline, Movement History) zaten tam geçmişi
gösteren listeler, "belirli bir andaki durum" değil; replay toggle'ının bunları etkilemesi kapsam
dışı bırakıldı. Mod değiştirildiğinde (`handleEnterReplay`/`handleExitReplay`) `clearSelection()`
çağrılıyor — aksi halde bir moddan diğerine geçerken seçili incident/field unit nesnesi diğer
moddaki veri kümesinde bulunmayabilirdi (`DEVELOPMENT_LOG12.md` §11'de zaten belgelenen "seçim
state'i bayatlayabiliyor" riskinin bir başka örneği, aynı geçici çözümle — seçimi temizle —
bertaraf edildi).

**Salt-okunur mod:** `FieldUnitColumn`/`FieldUnitPanel`/`IncidentPanel`'e `readOnly?: boolean`
prop'u eklendi; `true` iken Assign/Complete/Reassign/Resolve butonları ve
`RecommendedUnitsSection` render edilmiyor, yerine "Historical snapshot — actions disabled." notu
gösteriliyor. Mutasyon hook'ları (`useCreateTask` vb.) React hook kurallarına uymak için hâlâ
çağrılıyor, sadece ilgili buton/JSX koşullu olarak gizleniyor — hook'un kendisi hiç
tetiklenmiyor.

`npx tsc -b` + `vite build`: 0 hata (mevcut >500 kB chunk uyarısı hariç). `npm run lint`: temiz.

---

## 12. Operasyonel not: uygulanmamış migration'lar 500 hatasına yol açtı

Phase 4.1/4.2 tamamlandıktan sonra kullanıcı, `GET /api/restricted-zones`'un yerel ortamda 500
döndüğünü bildirdi. Kök neden kod değil, ortamdı: `dotnet ef migrations list` ile kontrol
edildiğinde, Phase 0.2'de üretilen `20260824080243_AddOperationalTaskActiveAssignmentUniqueIndex`
ve Phase 3.1'de üretilen `20260824101220_AddRestrictedZone` migration'larının ikisi de yerel
Postgres'e hiç uygulanmamış (`Pending`) olduğu görüldü — yani `RestrictedZones` tablosu fiilen
yoktu. Npgsql'in "relation does not exist" hatası `DomainExceptionHandler`'ın haritaladığı
tiplerden hiçbirine uymadığından (bkz. §2), çıplak bir 500'e düşüyordu. `dotnet ef database update`
çalıştırılarak düzeltildi. **Alınan ders:** bu oturumda migration dosyası üreten her faz
(`dotnet ef migrations add`) sonrasında `dotnet ef database update`'in ayrıca ve açıkça
çalıştırılıp çalıştırılmadığı doğrulanmalı — `CLAUDE.md`'nin Commands bölümü komutu zaten
belgeliyor ama hiçbir otomasyon bunu zorunlu kılmıyor, migration eklenen bir fazın sonunda
`dotnet build`'in yeşil olması DB'nin güncel olduğu anlamına gelmiyor.

---

## 13. Bu chat oturumunun kapsamı dışında yapılan iş — responsive tasarım

`responsive tasarım tamamlandı` commit'inde (`b57220b`), bu chat oturumunun dışında, frontend'e
responsive layout desteği eklendi — `OperationsCenterLayout.tsx` ve yeni
`OperationsCenterLayout.css` başta olmak üzere, `FieldUnitPanel.css`/`IncidentPanel.css`/
`MenuOverlay.css`'te küçük düzenlemeler yapıldı. Bu doküman bu işi detaylandırmıyor, sadece kayıt
altına alıyor.

---

## 14. Phase 5 — Field Unit Travel Animation & Dispatched Route Line

**Kapsam ve bağlam:** case study'nin brief'te listelenen dört "Advanced Operations" maddesi (§11
sonunda not edildiği gibi) Phase 4.2 ile zaten tamamlanmıştı. Bu faz brief'in kapsamı dışında,
kullanıcının isteği üzerine eklenen bir UX iyileştirmesi: `OperationalTaskService.CreateAsync`/
`ReassignAsync`'in field unit koordinatlarını incident konumuna anlık olarak "ışınlaması" yerine,
Phase 2.1'de zaten var olan `IEtaEstimator`'ı kullanarak orijin→hedef arası düz bir çizgi (kuş
uçuşu) üzerinde, hesaplanan ETA süresince yumuşak bir animasyon göstermek.

**Önce mimari değerlendirme yapıldı (kod değişikliği olmadan):** kullanıcı ilk isteğinde açıkça
"dosya değiştirme, sadece fizibilite değerlendirmesi" istedi. Bu değerlendirmede iki tasarım
seçeneği karşılaştırıldı — backend'in bir background worker üzerinden periyodik GPS-tick'i SignalR
ile yayınlaması vs. frontend'in var olan `AssignedAt` + ETA'dan saf bir fonksiyonla interpolasyon
hesaplaması. İkincisi seçildi, çünkü:
- Projenin tek SignalR event'i (`OperationsUpdated`, bkz. §3) coarse-grained bir invalidation
  sinyali — beş React Query key'ini birden geçersiz kılıyor. Periyodik tick'leri bu event
  üzerinden yaymak, her tick'te tüm istemcilerde beş REST refetch'i tetiklerdi.
- Orijin + hedef + `AssignedAt` + ETA süresi durağan (post-atama hiç değişmeyen) veriler olduğundan,
  konum herhangi bir "an"ın saf bir fonksiyonu — hiçbir operatörün ekranının bir diğeriyle senkron
  tutulması için canlı bir stream'e ihtiyaç yok, her istemci kendi saatiyle bağımsız olarak aynı
  noktayı hesaplıyor.
- Yeni bir background service, yeni bir domain event/hub yüzeyi ve (tick'ler kalıcı hale
  getirilirse) `FieldUnitLocationHistory`'ye saniyede bir yazım — sadece görsel bir özellik için
  orantısız bir mimari ek olurdu.

**Backend — orijin/ETA yakalama (`OperationalTask` entity + DTO):**
- `Domain/Entities/OperationalTask.cs`'e üç nullable alan eklendi: `OriginLatitude`,
  `OriginLongitude` (atama anından hemen önceki field unit konumu), `EstimatedEtaSeconds`
  (`IEtaEstimator.EstimateEta(...).TotalSeconds`, yuvarlanmış `int`). Nullable, çünkü mevcut
  (migration öncesi oluşturulmuş) task satırlarında bu veri hiç yok.
- `OperationalTaskService.CreateAsync`/`ReassignAsync`: field unit'in `Latitude`/`Longitude`'u
  incident koordinatlarına üzerine yazılmadan **hemen önce** mevcut değerleri yerel değişkenlere
  alınıyor (`originLatitude`/`originLongitude`), aynı anda `_etaEstimator.EstimateEta(...)`
  çağrılıp yeni `OperationalTask`'a set ediliyor. Servise dördüncü bir bağımlılık olarak
  `IEtaEstimator` enjekte edildi (zaten `Infrastructure/DependencyInjection.cs`'de kayıtlıydı,
  Phase 2.1'den beri — yeni bir DI kaydı gerekmedi). Bu, önceki fizibilite değerlendirmesinde
  tespit edilen gerçek bir boşluğu kapatıyor: sistemde daha önce orijin konumu **hiçbir yerde**
  kalıcı tutulmuyordu, sadece hedef (`FieldUnitLocationHistory`'ye eklenen tek satır) kaydediliyordu.
- `OperationalTaskDto` üç alanı da taşıyacak şekilde genişletildi; `ToDto` ve `GetAllAsync`'teki
  projeksiyon güncellendi.
- `OperationsReplayService.GetSnapshotAtAsync`'teki `activeTaskDtos` projeksiyonu da yeni
  `OperationalTaskDto` imzasına uyacak şekilde `t.OriginLatitude`/`OriginLongitude`/
  `EstimatedEtaSeconds`'i geçiriyor — bilinçli bir yan fayda: replay snapshot'ları da artık aynı
  interpolasyon girdilerini taşıyor, ileride replay'de de düz-çizgi animasyonu göstermek istenirse
  (bu fazın kapsamında değil) frontend tarafında ek bir backend değişikliği gerekmeyecek.

**Migration:** `20260824125110_AddOperationalTaskOriginAndEta` (`dotnet ef migrations add`).
**Yerel Postgres bu oturumda kapalıydı (Docker Desktop çalışmıyordu)** — migration dosyası
üretildi ama `dotnet ef database update` ile uygulanamadı. §12'de belgelenen "migration üretmek
DB'nin güncel olduğu anlamına gelmez" dersi burada da geçerli: bu özelliği canlı test etmeden önce
`docker compose up -d` + `dotnet ef database update --project SmartCityOps.Infrastructure
--startup-project SmartCityOps.Api` çalıştırılmalı.

**Frontend — saf interpolasyon matematiği (`features/operational-tasks/lib/geoInterpolation.ts`):**
`getTravelProgress(assignedAtMs, etaSeconds, nowMs)` — `(now - assignedAt) / (etaSeconds * 1000)`,
`[0, 1]` aralığına clamp'lenmiş; `etaSeconds <= 0` ise doğrudan `1` (edge-case: sıfır mesafe/aynı
konum). `interpolatePosition(origin, destination, assignedAtMs, etaSeconds, nowMs)`, bu ilerlemeyi
kullanarak enlem/boylamı ayrı ayrı lineer olarak (`origin + t * (destination - origin)`)
interpole ediyor — kısa şehir-içi mesafeler için gerçek bir great-circle slerp yerine düz lineer
interpolasyon yeterli kabul edildi (kullanıcının orijinal isteği zaten "kuş uçuşu" düz çizgiydi).

**Frontend — rota çizgisi katmanı (`operations-map/hooks/useDispatchedRouteLayers.ts`):** aktif
(`Status === "Assigned"`, orijin+ETA verisi dolu) her task için orijinden incident konumuna kesikli
bir `LineString` katmanı çiziyor. `operational-zones/hooks/useOperationalZoneLayers.ts`'teki
kaynak/katman ekleme iskeletiyle aynı desen (style `load` event'i, cleanup'ta kaynak/katman
kaldırma) kullanılıyor, ama statik bölge katmanlarından farklı olarak veri sık sık değişmesi
gerektiğinden (ilerleme zamanla artıp rota süresi dolunca kaybolmalı) `setInterval` ile 1 saniyede
bir `GeoJSONSource.setData(...)` çağrılıyor — katman/kaynak her tick'te silinip yeniden
eklenmiyor, sadece veri güncelleniyor (yanıp sönmeyi önlemek için). Route, `getTravelProgress`
`>= 1` döndüğü anda `FeatureCollection`'dan düşüyor.

**Frontend — marker animasyon refaktörü (`operations-map/hooks/useFieldUnitMarkers.ts`):** en
büyük değişiklik burada. Eskiden bu hook, `fieldUnits` prop'u her değiştiğinde (yani her
`OperationsUpdated` invalidation'ında) **tüm** `Marker` nesnelerini yok edip yeniden
oluşturuyordu — animasyon için bu kabul edilemezdi, çünkü herhangi bir alakasız güncelleme (örn.
şehrin başka bir yerinde yeni bir incident oluşması) o an hareket hâlindeki bir marker'ı sıfırdan
yeniden çizip animasyonu kesintiye uğratırdı. Hook üç ayrı `useEffect`'e bölündü:
1. **Mount/unmount:** sadece `[map]`'e bağlı, `map` instance'ı değiştiğinde/component unmount
   olduğunda tüm marker'ları temizliyor.
2. **Incremental diff:** `[map, fieldUnits, selectedFieldUnitId]`'a bağlı — yeni field unit'ler
   için marker oluşturuyor, artık listede olmayanları kaldırıyor, seçili stilini güncelliyor;
   var olan marker nesnelerine **dokunmuyor**, böylece animasyon durumu korunuyor.
3. **`requestAnimationFrame` döngüsü:** `[map, fieldUnits, operationalTasks]`'a bağlı — her frame'de
   her field unit için `findInFlightTask` ile aktif bir task arıyor; varsa
   `interpolatePosition(...)` ile hesaplanan konumu, yoksa (veya ilerleme `>= 1` ise) field unit'in
   kendi (backend'in "gerçek" — zaten hedefe atlamış) `latitude`/`longitude`'unu `marker.setLngLat`
   ile uyguluyor.

Marker artık `fieldUnit.id`'ye göre `Map<string, Marker>` ref'inde kalıcı tutulduğundan, orijinal
tıklama handler'ının kapanışında (closure) tuttuğu `fieldUnit` referansı marker yeniden
oluşturulmadığı için bayatlayabilirdi (örn. durum değişse de tıklamada eski veriyle
`onSelectFieldUnit` çağrılırdı) — bu, `fieldUnitsByIdRef` adlı ayrı bir ref ile en güncel
`FieldUnit` nesnesinin `id` üzerinden her tıklamada taze okunmasıyla önlendi.

**Prop zinciri:** `OperationsMap`'e `operationalTasks` prop'u eklendi (hem `useFieldUnitMarkers`'a
hem `useDispatchedRouteLayers`'a geçiliyor); `App.tsx`'teki mevcut `operationalTasks` değişkeni
(zaten canlı/replay ayrımını yapan, §11'de tanımlanan) doğrudan bu prop'a bağlandı — yeni bir veri
kaynağı veya query key eklenmedi.

**Doğrulama:** `dotnet build` — `SmartCityOps.Api.csproj` üzerinden (Domain/Application/
Infrastructure'ı transitif olarak derliyor), 0 hata. Çözüm (`.sln`) seviyesinde `dotnet build`'in
bu oturumda anlamlı bir derleme yapmadığı fark edildi (restore bulunamadı uyarısıyla &lt;1 saniyede
bitiyor) — bu yüzden doğrulama proje seviyesinde yapıldı. `npx tsc -b` + `vite build`: 0 hata
(mevcut >500 kB chunk uyarısı hariç). `npm run lint`: temiz.

**Bilinen sınırlar / test edilmeyenler:**
- Migration yukarıda belirtildiği gibi yerel DB'ye henüz uygulanmadı; tarayıcıda canlı bir duman
  testi (smoke test) bu oturumda yapılmadı.
- Reassignment sırasında "gerçek" (backend) konum hâlâ anlık olarak yeni hedefe atlıyor
  (davranış Phase 1.1'den beri değişmedi) — bir unit yeniden atandığında, bir operatörün ekranında
  görsel olarak hâlâ eski rotada hareket ederken backend zaten yeni task'ı oluşturmuş olabilir. Bu,
  §10'da replay için belgelenen devir-teslim yaklaşıklığıyla aynı kategoride, kozmetik bir
  yaklaşıklık olarak kabul edildi.
- `FieldUnitStatus`'a yeni bir durum (örn. "EnRoute") eklenmedi — hareket tamamen harita
  katmanında, domain modelinden bağımsız bir görsel kavram; task hâlâ atama süresince sadece
  `Dispatched`.

---

## 15. Sonuç ve sıradaki adım

| Faz | Durum |
|---|---|
| Phase 0.1 — Task Assignment Rule Pipeline Foundation | Tamamlandı |
| Phase 0.2 — Concurrency Guard & Domain Exceptions | Tamamlandı |
| Phase 0.3 — In-Memory Domain Event Dispatcher | Tamamlandı |
| Phase 1.1 — Backend Task Reassignment & Enriched Events | Tamamlandı |
| Phase 1.2 — Frontend Reassignment Flow & Conflict Handling | Tamamlandı |
| Phase 2.1 — Backend Field-Unit Recommendation Service & Scoring Rules | Tamamlandı |
| Phase 2.2 — Frontend Field-Unit Recommendations & ETA Display | Tamamlandı |
| Phase 3.1 — Backend Restricted Zones & Assignment Rule | Tamamlandı |
| Phase 3.2 — Frontend Restricted Zones Map Visualization & Management | Tamamlandı |
| Phase 4.1 — Backend Operations Replay Snapshot / Event History API | Tamamlandı |
| Phase 4.2 — Frontend Operations Replay Scrubber & Snapshot Visualization | Tamamlandı |
| Phase 5 — Field Unit Travel Animation & Dispatched Route Line | Tamamlandı (migration yerel DB'ye henüz uygulanmadı, tarayıcıda doğrulanmadı) |

`DEVELOPMENT_LOG11.md` §9'da flag'lenen iki riskten biri — `OperationalTaskService.CreateAsync`
check-then-act yarış durumu — Phase 0.2 ile kapatıldı. İkincisi — seçim state'inin SignalR
invalidation sonrası bayatlayabilmesi — hâlâ genel bir çözüme kavuşmadı; şu ana kadar sadece
`clearSelection` çağıran üç akış (assign, complete, reassign) için örtük olarak bertaraf edildi.
Öneri kartına tıklamak da seçimi değiştiriyor ama `clearSelection` çağırmıyor (seçimi temizlemek
değil, tam tersi bir field unit seçmek amacı taşıyor) — bu akış mevcut riskin kapsamı dışında.

Restricted zone oluşturma formunda koordinat/yarıçap girişi serbest metin/sayı kutularıyla
yapılıyor — haritaya tıklayarak merkez seçme gibi bir UX henüz yok; operatör lat/lng'yi elle
giriyor (projede zaten başka hiçbir koordinat girişi de bundan farklı değil). Ayrıca sistemde
hâlâ hiç restricted zone kaydı yok (seed data eklenmedi) — kural şimdilik hep `Success()`
dönüyor, canlı olarak gözlemlemek için önce `POST /api/restricted-zones` ile en az bir bölge
oluşturulmalı.

Phase 4.1/4.2 ile Level 3 case study'sinin son maddesi de ("geçmiş operasyonların tekrar
oynatılması") kapatıldı — bu doküman itibarıyla case study'nin brief'te listelenen dört
"Advanced Operations" maddesinin (kaynak çakışması/reassignment, ETA/öneri, kısıtlı bölge,
replay) hepsi tamamlandı. Replay'in kendi bilinen sınırları var (§10'da belgelendi): `Reassigned`
task'ların devir-teslim anı ve `OutOfService` geçişleri DB'de zaman damgalı olarak tutulmadığından
yaklaşık olarak reconstruct ediliyor; gerçek bir event-sourcing/audit-log tablosu olmadan bu
tam olarak çözülemez. Ayrıca replay snapshot'ı sadece incident/field-unit/task üçlüsünü kapsıyor
— restricted zone'lar ve operational zone'lar zaman-değişmez kabul edilip replay'de her zaman
güncel haliyle gösteriliyor (bunlar zaten çok nadiren değişen referans veriler).

Phase 5, case study brief'inin resmî kapsamının dışında ama Level 3'ün üzerine kullanıcı isteğiyle
eklendi: field unit'ler artık atama anında incident konumuna anlık ışınlanmak yerine, orijin-hedef
arası düz bir çizgi üzerinde ETA süresince yumuşak şekilde hareket ediyor (§14). Bu fazın en
acil açık işi teknik değil operasyonel: `20260824125110_AddOperationalTaskOriginAndEta` migration'ı
üretildi ama bu oturumda yerel Postgres'e (Docker kapalıydı) uygulanamadı, ve özellik hiç
tarayıcıda çalıştırılıp gözlemlenmedi — bir sonraki oturumun ilk adımı `docker compose up -d` →
`dotnet ef database update` → `npm run dev`/`dotnet run` ile gerçek bir duman testi olmalı.

Sıradaki adım kullanıcı tarafından henüz belirtilmedi — muhtemel adaylar: Phase 5'in yukarıdaki
duman testiyle doğrulanması, backend test projesi eklenmesi (`CLAUDE.md`'de hâlâ "test yok, manuel
doğrulama" notu duruyor), seçim state'inin bayatlaması riskinin genel bir çözüme kavuşturulması, ya
da bundle boyutu uyarısının (>500 kB,
MapLibre kaynaklı) code-splitting ile ele alınması.
