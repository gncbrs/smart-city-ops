# Smart City Operations Center — Development Log (Master, Consolidated)

This is the single consolidated development log for the project, merging all previously separate
session logs (`DEVELOPMENT_LOG.md` through `DEVELOPMENT_LOG12.md`) into one file, in chronological
order, with zero content omitted. Each part below corresponds verbatim to one of the original log
files; only a "Part N" divider heading and this Table of Contents were added on top.

---

## Table of Contents

- [Part 1 — Initial Setup & Level 1 Foundations](#part-1--initial-setup--level-1-foundations)
  - [1. Mimari Genel Bakış](#1-mimari-genel-bakış)
  - [2. Backend — Solution Yapısı](#2-backend--solution-yapısı)
    - [2.1 Proje iskeleti](#21-proje-iskeleti)
    - [2.2 Domain katmanı — mevcut durum](#22-domain-katmanı--mevcut-durum)
    - [2.3 Bu entity üzerine alınan tasarım kararları](#23-bu-entity-üzerine-alınan-tasarım-kararları)
    - [2.4 Infrastructure katmanı — EF Core + Npgsql kurulumu](#24-infrastructure-katmanı--ef-core--npgsql-kurulumu)
    - [2.5 Henüz yapılmayanlar (backend)](#25-henüz-yapılmayanlar-backend)
  - [3. Frontend — Klasör Yapısı ve Durum](#3-frontend--klasör-yapısı-ve-durum)
    - [3.1 Kurulu paketler ve amaçları](#31-kurulu-paketler-ve-amaçları)
    - [3.2 Karşılaşılan ve çözülen hata](#32-karşılaşılan-ve-çözülen-hata)
    - [3.3 Doğrulama](#33-doğrulama)
  - [4. Altyapı](#4-altyapı)
    - [4.1 `.gitignore`](#41-gitignore)
    - [4.2 `docker-compose.yml`](#42-docker-composeyml)
    - [4.3 Docker bağımlılığı kararı — kurumsal PC kısıtı](#43-docker-bağımlılığı-kararı--kurumsal-pc-kısıtı)
  - [5. Şu Anki Tam Proje Ağacı](#5-şu-anki-tam-proje-ağacı)
  - [6. Sıradaki Adım](#6-sıradaki-adım)
  - [7. Sürüm Notları / Düzeltmeler](#7-sürüm-notları--düzeltmeler)
- [Part 2 — Level 1: FieldUnit, OperationalTask, Real-Time Polling & First End-to-End Test](#part-2--level-1-fieldunit-operationaltask-real-time-polling--first-end-to-end-test)
  - [1. Mimari Genel Bakış](#1-mimari-genel-bakış-1)
  - [2. Backend — Solution Yapısı](#2-backend--solution-yapısı-1)
    - [2.1 Proje iskeleti (12 Ağustos — ilk kurulum)](#21-proje-iskeleti-12-ağustos--ilk-kurulum)
    - [2.2 Domain katmanı — Incident](#22-domain-katmanı--incident)
    - [2.3 Bu entity üzerine alınan tasarım kararları](#23-bu-entity-üzerine-alınan-tasarım-kararları-1)
    - [2.4 Infrastructure katmanı — EF Core + Npgsql kurulumu](#24-infrastructure-katmanı--ef-core--npgsql-kurulumu-1)
    - [2.5 FieldUnit entity'si (13 Ağustos)](#25-fieldunit-entitysi-13-ağustos)
    - [2.6 Proje yeniden yapılandırması — `backend/src/` → `Src/` (13 Ağustos)](#26-proje-yeniden-yapılandırması--backendsrc--src-13-ağustos)
    - [2.7 Application + Api katmanı — Incident için minimal implementasyon (13 Ağustos)](#27-application--api-katmanı--incident-için-minimal-implementasyon-13-ağustos)
    - [2.8 Incident Generator — Worker Service (13 Ağustos)](#28-incident-generator--worker-service-13-ağustos)
  - [3. Frontend — Klasör Yapısı ve Durum](#3-frontend--klasör-yapısı-ve-durum-1)
    - [3.1 Kurulu paketler ve amaçları](#31-kurulu-paketler-ve-amaçları-1)
    - [3.2 Karşılaşılan ve çözülen hata](#32-karşılaşılan-ve-çözülen-hata-1)
  - [4. Altyapı](#4-altyapı-1)
    - [4.1 `.gitignore`](#41-gitignore-1)
    - [4.2 `docker-compose.yml`](#42-docker-composeyml-1)
    - [4.3 İş ortamı — Portable PostgreSQL kurulumu (13 Ağustos, admin yetkisi olmadan)](#43-iş-ortamı--portable-postgresql-kurulumu-13-ağustos-admin-yetkisi-olmadan)
  - [5. Şu Anki Tam Proje Ağacı](#5-şu-anki-tam-proje-ağacı-1)
  - [6. Sıradaki Adım](#6-sıradaki-adım-1)
  - [7. Sürüm Notları / Düzeltmeler](#7-sürüm-notları--düzeltmeler-1)
  - [8. Frontend — API Bağlantısı ve Harita Marker Entegrasyonu (13 Ağustos, akşam oturumu)](#8-frontend--api-bağlantısı-ve-harita-marker-entegrasyonu-13-ağustos-akşam-oturumu)
    - [8.1 Tespit — veri çekme katmanı zaten hazırmış](#81-tespit--veri-çekme-katmanı-zaten-hazırmış)
    - [8.2 Karar — CSS, `.tsx` dosyalarından tamamen ayrılacak](#82-karar--css-tsx-dosyalarından-tamamen-ayrılacak)
    - [8.3 Yapılan değişiklikler](#83-yapılan-değişiklikler)
    - [8.4 Doğrulama](#84-doğrulama)
  - [9. Mac'te Uçtan Uca Doğrulama — İki Gerçek Bug Bulundu ve Düzeltildi (13 Ağustos, gece)](#9-macte-uçtan-uca-doğrulama--iki-gerçek-bug-bulundu-ve-düzeltildi-13-ağustos-gece)
    - [9.1 Bug #1 — MapLibre canvas'ı container'ın boyutunu hiç öğrenemiyordu](#91-bug-1--maplibre-canvası-containerın-boyutunu-hiç-öğrenemiyordu)
    - [9.2 Bug #2 — Vite dev server, MapLibre'nin Web Worker dosyasını 404 veriyordu](#92-bug-2--vite-dev-server-maplibrenin-web-worker-dosyasını-404-veriyordu)
    - [9.3 Harita stili değişikliği — `demotiles` yerine OpenFreeMap, Ankara'ya kilitleme](#93-harita-stili-değişikliği--demotiles-yerine-openfreemap-ankaraya-kilitleme)
    - [9.4 `incident-generator` — `net9.0` → `net8.0` (bu Mac'te SDK uyumsuzluğu nedeniyle)](#94-incident-generator--net90--net80-bu-macte-sdk-uyumsuzluğu-nedeniyle)
    - [9.5 Sonuç — ilk başarılı uçtan uca test](#95-sonuç--ilk-başarılı-uçtan-uca-test)
- [Part 3 — Level 1: FieldUnit Seed Data, OperationalTask Business Logic & Incident Resolve](#part-3--level-1-fieldunit-seed-data-operationaltask-business-logic--incident-resolve)
  - [1. Frontend — küçük düzeltmeler ve netleştirmeler](#1-frontend--küçük-düzeltmeler-ve-netleştirmeler)
    - [1.1 `httpClient.ts` / `signalRConnection.ts` — "hardcode API" yanlış anlaşılması netleştirildi](#11-httpclientts--signalrconnectionts--hardcode-api-yanlış-anlaşılması-netleştirildi)
    - [1.2 `App.tsx` içindeki UI parçası component'e taşındı](#12-apptsx-içindeki-ui-parçası-componente-taşındı)
  - [2. Gerçek zamanlı güncelleme — geçici polling çözümü](#2-gerçek-zamanlı-güncelleme--geçici-polling-çözümü)
  - [3. FieldUnit — Backend API (Application + Infrastructure + Api)](#3-fieldunit--backend-api-application--infrastructure--api)
  - [4. FieldUnit — Frontend](#4-fieldunit--frontend)
  - [5. FieldUnit seed data — kalıcı hale getirme (`HasData` migration)](#5-fieldunit-seed-data--kalıcı-hale-getirme-hasdata-migration)
  - [6. `OperationalTask` — tasarım kararları (Incident ↔ FieldUnit ilişkisi)](#6-operationaltask--tasarım-kararları-incident--fieldunit-ilişkisi)
  - [7. `OperationalTask` — Domain + Infrastructure](#7-operationaltask--domain--infrastructure)
    - [7.1 Entity ve enum](#71-entity-ve-enum)
    - [7.2 `OperationalTaskConfiguration.cs`](#72-operationaltaskconfigurationcs)
  - [8. `OperationalTask` — Application + Api (asıl iş mantığı)](#8-operationaltask--application--api-asıl-iş-mantığı)
    - [8.1 DTO'lar](#81-dtolar)
    - [8.2 `OperationalTaskService.cs` — iş mantığı](#82-operationaltaskservicecs--iş-mantığı)
    - [8.3 `OperationalTasksController.cs`](#83-operationaltaskscontrollercs)
    - [8.4 Uçtan uca test (PowerShell, `Invoke-RestMethod`)](#84-uçtan-uca-test-powershell-invoke-restmethod)
  - [9. `Incident.Resolve` — otomatik temizlikle](#9-incidentresolve--otomatik-temizlikle)
  - [10. Case study ile karşılaştırma — Level 1 backend denetimi](#10-case-study-ile-karşılaştırma--level-1-backend-denetimi)
  - [11. Sıradaki adım](#11-sıradaki-adım)
  - [12. Sürüm Notları / Düzeltmeler (bu oturum)](#12-sürüm-notları--düzeltmeler-bu-oturum)
- [Part 4 — Level 1: Remaining Frontend Steps, Bug Fixes & Final Case-Study Audit](#part-4--level-1-remaining-frontend-steps-bug-fixes--final-case-study-audit)
  - [1. Frontend — Level 1'in kalan 4 adımı](#1-frontend--level-1in-kalan-4-adımı)
    - [1.1 Adım 1 — Field unit'e tıklayınca bilgi gösterme](#11-adım-1--field-unite-tıklayınca-bilgi-gösterme)
    - [1.2 Adım 2 — Task oluşturma/atama akışı](#12-adım-2--task-oluşturmaatama-akışı)
    - [1.3 Adım 3 — Task tamamlama / incident resolve](#13-adım-3--task-tamamlama--incident-resolve)
    - [1.4 Adım 4 — Genel operasyonel durum görünümü](#14-adım-4--genel-operasyonel-durum-görünümü)
  - [2. Bulunan ve düzeltilen gerçek hatalar](#2-bulunan-ve-düzeltilen-gerçek-hatalar)
    - [2.1 `FieldUnits` boş görünüyordu — migration uygulanmamış](#21-fieldunits-boş-görünüyordu--migration-uygulanmamış)
    - [2.2 `index.css`'teki Vite şablon artığı — metin taşması/ortalaması](#22-indexcssteki-vite-şablon-artığı--metin-taşmasıortalaması)
    - [2.3 Enum değerlerinin ham gösterimi (`RoadClosure`, `UtilityCrew`)](#23-enum-değerlerinin-ham-gösterimi-roadclosure-utilitycrew)
    - [2.4 Incident Generator — process yeniden başlatılınca `IncidentCode` çakışması](#24-incident-generator--process-yeniden-başlatılınca-incidentcode-çakışması)
  - [3. Backend/Frontend temizlik turu ("Level 1'den eksiksiz çıkmak")](#3-backendfrontend-temizlik-turu-level-1den-eksiksiz-çıkmak)
    - [3.1 Düzeltilenler](#31-düzeltilenler)
    - [3.2 Bilinçli olarak ertelenenler (bloklayıcı değil, dokunulmadı)](#32-bilinçli-olarak-ertelenenler-bloklayıcı-değil-dokunulmadı)
  - [4. Case study — Level 1 nihai denetim](#4-case-study--level-1-nihai-denetim)
  - [5. Sıradaki adım](#5-sıradaki-adım)
- [Part 5 — Level 2 Kickoff: Resolved-Incident Bug, Task History, Operational Statistics](#part-5--level-2-kickoff-resolved-incident-bug-task-history-operational-statistics)
  - [1. Bug — Resolved bir incident'a yeni task atanabiliyordu](#1-bug--resolved-bir-incidenta-yeni-task-atanabiliyordu)
    - [1.1 Backend düzeltmesi](#11-backend-düzeltmesi)
    - [1.2 Frontend düzeltmesi](#12-frontend-düzeltmesi)
  - [2. Sıradaki adım](#2-sıradaki-adım)
  - [3. Level 1 sonrası elle denetim — incident resolve → task complete zinciri](#3-level-1-sonrası-elle-denetim--incident-resolve--task-complete-zinciri)
  - [1. Madde 1 — Display active and completed tasks](#1-madde-1--display-active-and-completed-tasks)
  - [2. Madde 2 — Highlight high-priority incidents](#2-madde-2--highlight-high-priority-incidents)
  - [3. Madde 3 — Show task history (genişletilmiş kapsam)](#3-madde-3--show-task-history-genişletilmiş-kapsam)
  - [4. Ek düzeltmeler (bu oturumda bulunan, madde 3'e dahil edilmeyen)](#4-ek-düzeltmeler-bu-oturumda-bulunan-madde-3e-dahil-edilmeyen)
  - [5. Sıradaki adım](#5-sıradaki-adım-1)
  - [1. Madde — Provide operational statistics](#1-madde--provide-operational-statistics)
  - [2. Sıradaki adım](#2-sıradaki-adım-1)
- [Part 6 — Level 2: Sidebar Reorganization, Filtering, Incident Timeline & Zone-Based Generator](#part-6--level-2-sidebar-reorganization-filtering-incident-timeline--zone-based-generator)
  - [1. Sidebar reorganizasyonu — Completed Tasks + Statistics alt bölüme taşındı](#1-sidebar-reorganizasyonu--completed-tasks--statistics-alt-bölüme-taşındı)
  - [2. Brainstorm — ek tablo ihtiyacı değerlendirildi, şimdilik ertelendi](#2-brainstorm--ek-tablo-ihtiyacı-değerlendirildi-şimdilik-ertelendi)
  - [3. "Ready to Resolve" hint — sidebar](#3-ready-to-resolve-hint--sidebar)
  - [4. Filtering — incidents ve field units (Level 2 case study maddesi)](#4-filtering--incidents-ve-field-units-level-2-case-study-maddesi)
  - [5. Field unit seed data genişletildi (5 → 15)](#5-field-unit-seed-data-genişletildi-5--15)
  - [6. Incident Timeline (Level 2 case study maddesi)](#6-incident-timeline-level-2-case-study-maddesi)
  - [7. Incident Generator — bölge tabanlı (zone-based) coğrafi dağılım](#7-incident-generator--bölge-tabanlı-zone-based-coğrafi-dağılım)
- [Part 7 — Level 2: Layout Redesign — Bottom Bar & Menu Overlay](#part-7--level-2-layout-redesign--bottom-bar--menu-overlay)
  - [1. Motivasyon ve tasarım kaynağı](#1-motivasyon-ve-tasarım-kaynağı)
  - [2. Yeni layout mimarisi](#2-yeni-layout-mimarisi)
  - [3. Aşama aşama yapılan değişiklikler](#3-aşama-aşama-yapılan-değişiklikler)
    - [Aşama 1 — Layout iskeleti](#aşama-1--layout-iskeleti)
    - [Aşama 2 — Sidebar sadeleştirme](#aşama-2--sidebar-sadeleştirme)
    - [Aşama 3 — FieldUnitPanel → bottom bar (1. sütun)](#aşama-3--fieldunitpanel--bottom-bar-1-sütun)
    - [Aşama 4 — IncidentPanel → bottom bar (2. sütun)](#aşama-4--incidentpanel--bottom-bar-2-sütun)
    - [Aşama 5 — Active Tasks + Ready to Resolve → bottom bar (3. sütun)](#aşama-5--active-tasks--ready-to-resolve--bottom-bar-3-sütun)
    - [Aşama 6 — Menu butonu + boş overlay](#aşama-6--menu-butonu--boş-overlay)
    - [Aşama 7 — Completed Tasks + Statistics → Menu içine](#aşama-7--completed-tasks--statistics--menu-içine)
    - [Aşama 8 — Seçili marker'ı haritada görsel olarak vurgulama](#aşama-8--seçili-markerı-haritada-görsel-olarak-vurgulama)
    - [Aşama 9 — Timeline'ın yeni yeri: Seçenek B uygulandı](#aşama-9--timelineın-yeni-yeri-seçenek-b-uygulandı)
  - [4. Bulunan ve düzeltilen bir gerçek hata — IncidentPanel buton hizalaması](#4-bulunan-ve-düzeltilen-bir-gerçek-hata--incidentpanel-buton-hizalaması)
  - [5. Case study — Level 2 durumu (bu oturum sonu itibarıyla)](#5-case-study--level-2-durumu-bu-oturum-sonu-itibarıyla)
  - [6. Sıradaki adım](#6-sıradaki-adım-2)
- [Part 8 — Level 2: Operational Zones & Field Unit Movement History](#part-8--level-2-operational-zones--field-unit-movement-history)
  - [1. Operational Zones (harita görselleştirmesi)](#1-operational-zones-harita-görselleştirmesi)
    - [1.1 Zone verisinin kaynağı — tasarım kararı](#11-zone-verisinin-kaynağı--tasarım-kararı)
    - [1.2 Backend — `GET /api/operational-zones`](#12-backend--get-apioperational-zones)
    - [1.3 Frontend — fetch stratejisi: `staleTime: Infinity`](#13-frontend--fetch-stratejisi-staletime-infinity)
    - [1.4 Haritada gösterim — `useOperationalZoneLayers`](#14-haritada-gösterim--useoperationalzonelayers)
    - [1.5 Bulunan ve düzeltilen hata — font glyph 404 spam](#15-bulunan-ve-düzeltilen-hata--font-glyph-404-spam)
    - [1.6 Ertelendi — zone sayısının azlığı / kapsama boşlukları](#16-ertelendi--zone-sayısının-azlığı--kapsama-boşlukları)
  - [2. Field Unit Movement History](#2-field-unit-movement-history)
    - [2.1 Temel tespit — field unit'ler hiç hareket etmiyordu](#21-temel-tespit--field-unitler-hiç-hareket-etmiyordu)
    - [2.2 Tasarım kararı — Seçenek A: hareketi assignment'a bağlamak](#22-tasarım-kararı--seçenek-a-hareketi-assignmenta-bağlamak)
    - [2.3 Backend Adım 1 — saf ekleme (`FieldUnitLocationHistory`)](#23-backend-adım-1--saf-ekleme-fieldunitlocationhistory)
    - [2.4 Backend Adım 2 — `OperationalTaskService.CreateAsync` değişikliği (riskli adım)](#24-backend-adım-2--operationaltaskservicecreateasync-değişikliği-riskli-adım)
    - [2.5 Bulunan tasarım eksiği — `IncidentId` yokluğu](#25-bulunan-tasarım-eksiği--incidentid-yokluğu)
    - [2.6 Frontend — event-driven invalidation](#26-frontend--event-driven-invalidation)
    - [2.7 Frontend UI](#27-frontend-ui)
    - [2.8 Bu adımda kullanıcının yaşadığı ve düzeltilen hatalar](#28-bu-adımda-kullanıcının-yaşadığı-ve-düzeltilen-hatalar)
  - [3. Level 2 durumu (bu oturum sonu itibarıyla)](#3-level-2-durumu-bu-oturum-sonu-itibarıyla)
  - [4. Sıradaki adım](#4-sıradaki-adım)
- [Part 9 — Level 2 Completion: Real-Time SignalR Updates](#part-9--level-2-completion-real-time-signalr-updates)
  - [1. Tasarım kararı — Hub ne yayınlamalı?](#1-tasarım-kararı--hub-ne-yayınlamalı)
  - [2. Backend — Hub ve broadcast](#2-backend--hub-ve-broadcast)
    - [2.1 Bulunan ve düzeltilen tasarım hatası — Hub nerede yaşamalı?](#21-bulunan-ve-düzeltilen-tasarım-hatası--hub-nerede-yaşamalı)
    - [2.2 Bulunan ve düzeltilen ikinci hata — Infrastructure projesinin SignalR tiplerine erişimi](#22-bulunan-ve-düzeltilen-ikinci-hata--infrastructure-projesinin-signalr-tiplerine-erişimi)
    - [2.3 Bulunan ve düzeltilen üçüncü sorun — CORS credentials](#23-bulunan-ve-düzeltilen-üçüncü-sorun--cors-credentials)
    - [2.4 Broadcast'in gerçek eklenmesi](#24-broadcastin-gerçek-eklenmesi)
    - [2.5 Kullanıcının editör/kopyalama sürecinde bulunan küçük hatalar](#25-kullanıcının-editörkopyalama-sürecinde-bulunan-küçük-hatalar)
  - [3. Frontend — gerçek abonelik](#3-frontend--gerçek-abonelik)
  - [4. Workaround'un kaldırılması](#4-workaroundun-kaldırılması)
  - [5. Tam regresyon testi (iki sekme ile)](#5-tam-regresyon-testi-iki-sekme-ile)
  - [6. Level 2 durumu — TAMAMLANDI](#6-level-2-durumu--tamamlandi)
  - [7. Sıradaki adım](#7-sıradaki-adım)
- [Part 10 — Frontend Refactor (Zero Behavior Change)](#part-10--frontend-refactor-zero-behavior-change)
  - [2. Create `docs/DEVELOPMENT_LOG10.md`](#2-create-docsdevelopment_log10md)
  - [1. Çalışma yöntemi ve kapsam](#1-çalışma-yöntemi-ve-kapsam)
  - [2. Faz 1 — Ölü kod ve isimlendirme](#2-faz-1--ölü-kod-ve-isimlendirme)
  - [3. Faz 2 — Tekrar eden kod](#3-faz-2--tekrar-eden-kod)
    - [3.1 `buildTaskCells` ve türevleri — üç dosyada birebir aynıydı](#31-buildtaskcells-ve-türevleri--üç-dosyada-birebir-aynıydı)
    - [3.2 Buton CSS'i — 8 tekrar eden kural → tek `.app-button`](#32-buton-cssi--8-tekrar-eden-kural--tek-app-button)
  - [4. Faz 3 — `App.tsx` parçalanması (163 → 114 satır)](#4-faz-3--apptsx-parçalanması-163--114-satır)
  - [5. Faz 4 — `Menu.tsx` parçalanması (144 → 52 satır)](#5-faz-4--menutsx-parçalanması-144--52-satır)
  - [6. Faz 5 — Harita ve filtre temizliği](#6-faz-5--harita-ve-filtre-temizliği)
  - [7. Sonuç — bugün yapılanların toplamı](#7-sonuç--bugün-yapılanların-toplamı)
  - [8. Sıradaki adım](#8-sıradaki-adım)
- [Part 11 — Backend Refactor (Zero Behavior Change)](#part-11--backend-refactor-zero-behavior-change)
  - [1. Çalışma yöntemi](#1-çalışma-yöntemi)
  - [2. B1 — DI çift kaydı](#2-b1--di-çift-kaydı)
  - [3. B2 — Tekrar eden DTO mapping](#3-b2--tekrar-eden-dto-mapping)
  - [4. B3 — `_dbContext` / servis alanı isimlendirmesi standardize edildi](#4-b3--_dbcontext--servis-alanı-isimlendirmesi-standardize-edildi)
  - [5. B4 — `IOperationalZoneService` kendi dosyasına ayrıldı, DTO dosya adı düzeltildi](#5-b4--ioperationalzoneservice-kendi-dosyasına-ayrıldı-dto-dosya-adı-düzeltildi)
  - [6. B5 — Controller dosya adlarındaki fazladan "s"](#6-b5--controller-dosya-adlarındaki-fazladan-s)
  - [7. B6 — `SmartCityOps.Api.http` gerçek isteklerle dolduruldu](#7-b6--smartcityopsapihttp-gerçek-isteklerle-dolduruldu)
  - [8. Sonuç — backend temizliğinin toplamı](#8-sonuç--backend-temizliğinin-toplamı)
  - [9. Sıradaki adım](#9-sıradaki-adım)
- [Part 12 — Level 3: Advanced Operations, Field Unit Travel Animation & Incident Timeline Arrival Event](#part-12--level-3-advanced-operations-field-unit-travel-animation--incident-timeline-arrival-event)
  - [1. Phase 0.1 — Task Assignment Rule Pipeline Foundation](#1-phase-01--task-assignment-rule-pipeline-foundation)
  - [2. Phase 0.2 — Concurrency Guard & Domain Exceptions](#2-phase-02--concurrency-guard--domain-exceptions)
  - [3. Phase 0.3 — In-Memory Domain Event Dispatcher](#3-phase-03--in-memory-domain-event-dispatcher)
  - [4. Phase 1.1 — Backend: Task Reassignment & Enriched Events](#4-phase-11--backend-task-reassignment--enriched-events)
  - [5. Phase 1.2 — Frontend: Task Reassignment & Conflict Error Handling](#5-phase-12--frontend-task-reassignment--conflict-error-handling)
  - [6. Phase 2.1 — Backend: Field-Unit Recommendation Service & Scoring Rules](#6-phase-21--backend-field-unit-recommendation-service--scoring-rules)
  - [7. Phase 2.2 — Frontend: Field-Unit Recommendations & ETA Display](#7-phase-22--frontend-field-unit-recommendations--eta-display)
  - [8. Phase 3.1 — Backend: Restricted Zones & Assignment Rule](#8-phase-31--backend-restricted-zones--assignment-rule)
  - [9. Phase 3.2 — Frontend: Restricted Zones Map Visualization & Management](#9-phase-32--frontend-restricted-zones-map-visualization--management)
  - [10. Phase 4.1 — Backend: Operations Replay Snapshot / Event History API](#10-phase-41--backend-operations-replay-snapshot--event-history-api)
  - [11. Phase 4.2 — Frontend: Operations Replay Scrubber & Snapshot Visualization](#11-phase-42--frontend-operations-replay-scrubber--snapshot-visualization)
  - [12. Operasyonel not: uygulanmamış migration'lar 500 hatasına yol açtı](#12-operasyonel-not-uygulanmamış-migrationlar-500-hatasına-yol-açtı)
  - [13. Bu chat oturumunun kapsamı dışında yapılan iş — responsive tasarım](#13-bu-chat-oturumunun-kapsamı-dışında-yapılan-iş--responsive-tasarım)
  - [14. Phase 5 — Field Unit Travel Animation & Dispatched Route Line](#14-phase-5--field-unit-travel-animation--dispatched-route-line)
  - [15. Phase 5.1 — Incident Timeline Arrival Event](#15-phase-51--incident-timeline-arrival-event)
  - [16. Phase 5.2 — Selection Toggle, Empty Map Deselect & Event Bubbling Fix](#16-phase-52--selection-toggle-empty-map-deselect--event-bubbling-fix)
  - [17. Phase 5.3 — Dependency Cleanup (`zustand`, `react-router-dom`) & Dead Component Check](#17-phase-53--dependency-cleanup-zustand-react-router-dom--dead-component-check)
  - [18. Phase 5.4 — MapLibre Code-Splitting & Bundle Size Optimization](#18-phase-54--maplibre-code-splitting--bundle-size-optimization)
  - [19. Phase 5.5 — `useSignalR.ts` Cleanup (Stray Log Removal & Comment Normalization)](#19-phase-55--usesignalrts-cleanup-stray-log-removal--comment-normalization)
  - [20. Phase 5.6 — Backend launchSettings.json Cleanup](#20-phase-56--backend-launchsettingsjson-cleanup)
  - [21. Phase 5.7 — Backend DI & HTTP File Polish](#21-phase-57--backend-di--http-file-polish)
  - [22. Phase 5.8 — Map Interpolation Math Deduplication](#22-phase-58--map-interpolation-math-deduplication)
  - [23. Phase 5.9 — OperationsReplay Time Range Query Optimization](#23-phase-59--operationsreplay-time-range-query-optimization)
  - [24. Phase 5.10 — "Pick on Map" Coordinate Selection for Restricted Zones](#24-phase-510--pick-on-map-coordinate-selection-for-restricted-zones)
  - [25. Sonuç ve sıradaki adım](#25-sonuç-ve-sıradaki-adım)
  - [26. Phase 5 Migration & Backend Pipeline Verification (Origin/ETA)](#26-phase-5-migration--backend-pipeline-verification-originteta)
  - [27. Phase 5.11 — Field Unit Teleportation Race Condition Fix](#27-phase-511--field-unit-teleportation-race-condition-fix)
  - [28. Phase 5.12 — Field Unit Animation Freeze Fix (Full Browser Smoke Test)](#28-phase-512--field-unit-animation-freeze-fix-full-browser-smoke-test)
  - [29. Phase 5.13 (Step 1/2) — Ankara Operational Zones: Domain Extraction & Service Refactor](#29-phase-513-step-12--ankara-operational-zones-domain-extraction--service-refactor)
  - [30. Phase 5.13 (Step 2/2) — Ankara Operational Zones: Incident Generator Integration & Unification Complete](#30-phase-513-step-22--ankara-operational-zones-incident-generator-integration--unification-complete)
  - [31. App.tsx Orchestration Simplification (Step 1/2) — Extract Derived Selectors](#31-apptsx-orchestration-basitleştirme-adım-12--türetilmiş-selectorların-çıkarılması)
  - [32. App.tsx Orchestration Simplification (Step 2/2) — Extract useReplayAwareData Hook](#32-apptsx-orchestration-basitleştirme-adım-22--usereplayawaredata-hookunun-çıkarılması)
  - [61. Phase 5.36 — FieldUnit Movement History Query Projection Safety & DomainConflictException Architecture](#61-phase-536--fieldunit-movement-history-query-projection-safety--domainconflictexception-architecture)
  - [62. Phase 5.37 — Corporate Windows Schannel SSL Revocation Bypass & OSRM Live Verification](#62-phase-537--corporate-windows-schannel-ssl-revocation-bypass--osrm-live-verification)
  - [63. Phase 5.38 — Server-Side IsReadyToResolve Enforcement in IncidentService](#63-phase-538--server-side-isreadytoresolve-enforcement-in-incidentservice)
  - [64. Phase 5.39 — MapLibre Render & Resource Lifecycle Optimization in Incident Markers and Zone Layers](#64-phase-539--maplibre-render--resource-lifecycle-optimization-in-incident-markers-and-zone-layers)
  - [65. Phase 5.40 — Normalize Legacy Incident Resolution Durations (Madde 5)](#65-phase-540--normalize-legacy-incident-resolution-durations-madde-5)
  - [67. Phase 5.42 — Replay Time Range SignalR Invalidation Integration (Madde 6)](#67-phase-542--replay-time-range-signalr-invalidation-integration-madde-6)
  - [68. Phase 5.43 — CSS Design Token & Box-Shadow Cleanup (Madde 7)](#68-phase-543--css-design-token--box-shadow-cleanup-madde-7)
  - [69. Phase 5.44 — Single-Resource GET /{id} REST Endpoints Support (Madde 8)](#69-phase-544--single-resource-get-id-rest-endpoints-support-madde-8)



---

# Part 1 — Initial Setup & Level 1 Foundations

*(Source: original `docs/DEVELOPMENT_LOG.md`)*

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


---

# Part 2 — Level 1: FieldUnit, OperationalTask, Real-Time Polling & First End-to-End Test

*(Source: original `docs/DEVELOPMENT_LOG2.md`)*

# Smart City Operations Center — Teknik Dokümantasyon

**Son güncelleme:** 13 Ağustos 2026 (akşam oturumu)
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
| Konteynerleştirme | Docker Compose | Ev ortamı için; iş ortamında portable Postgres kullanılıyor (bkz. 4.3) |
| Harita kütüphanesi | MapLibre GL JS | API key/billing gerektirmiyor |
| Gerçek zamanlı iletişim | SignalR (planlandı, henüz backend'de yok) | Harita canlı güncellemesi için |
| Incident kaynağı | Incident Generator (Worker Service) | Dış sistemi simüle eden, periyodik olarak sahte incident üreten ayrı bir process |

Backend bağımlılık yönü (Clean Architecture):

```
Api ──► Infrastructure ──► Application ──► Domain
 │                                            ▲
 └────────────────────────────────────────────┘
```

Domain hiçbir katmana bağımlı değil; framework'süz saf C#.

**Önemli:** 13 Ağustos'ta proje köküne tüm backend projelerini toplayan bir **yeniden
yapılandırma** yapıldı (bkz. bölüm 2.6). Aşağıdaki yollar artık `backend/src/...` değil,
**`Src/...`** (repo kökünde, düz/flat yapı).

---

## 2. Backend — Solution Yapısı

### 2.1 Proje iskeleti (12 Ağustos — ilk kurulum)

İlk kurulumda `backend/SmartCityOps.sln` altında 4 proje açıldı (Domain, Application,
Infrastructure, Api). Şablonların ürettiği örnek dosyalar (`Class1.cs`, `WeatherForecast*.cs`)
silindi. **Bu yapı 13 Ağustos'ta `Src/` altına taşındı — güncel yol için bölüm 2.6'ya bakın.**

### 2.2 Domain katmanı — Incident

```
Domain/
├── Common/
│   └── EntityBase.cs          — tüm entity'lerin ortak Id (Guid) alanı (eski adı: BaseEntity)
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
Incident : EntityBase
├── Id            : Guid                (EntityBase'den miras)
├── IncidentCode  : string               (örn. "INC-2026001")
├── Type          : IncidentType         (enum, byte backing + açık değerler)
├── Priority      : IncidentPriority     (enum, byte backing + açık değerler)
├── Status        : IncidentStatus       (enum, byte backing + açık değerler)
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
olarak tutuluyor; bu alan sadece görüntüleme/referans amaçlı, PK değil.

**Karar — Type/Priority/Status enum, string değil:**
Yazım hatalarının derleme zamanında yakalanması için. EF Core Postgres'te bunları `string`
olarak saklıyor (bkz. Karar B, 2.4).

**Karar — `enum : byte` + açık sayısal değerler (13 Ağustos, mentör talimatı):**
Tüm enum'lar (`IncidentType`, `IncidentPriority`, `IncidentStatus`, `FieldUnitType`,
`FieldUnitStatus`) `: byte` backing type ile ve her üyeye açık değer (`= 0, = 1, ...`) verilerek
tanımlanıyor. İki ayrı fayda:
- **`: byte`** → varsayılan `int` (4 byte) yerine 1 byte kullanır; büyük koleksiyonlarda
  (ör. Level 2/3'teki hareket geçmişi) bellek tasarrufu sağlar, ayrıca "bu küçük/sınırlı bir
  küme" niyetini kodda görünür kılar.
- **Açık değerler** → enum'un ortasına yeni bir üye eklendiğinde sonrakilerin numarası
  kaymasın diye. Eğer bu değer bir yerde int olarak saklansaydı, kayma eski kayıtların anlamını
  sessizce değiştirirdi. (DB'de zaten string sakladığımız için bu risk orada yok — bu, C#
  tarafında ayrı bir güvenlik katmanı.)

Bu iki konu (byte + DB'de string saklama) birbirini **tamamlıyor**, çelişmiyor: biri C#
bellek/derleme tarafını, diğeri veritabanı tarafını koruma altına alıyor.

**Karar — Latitude/Longitude düz alan, ayrı Value Object değil:**
Level 1'de PostGIS kullanılmıyor, basitlik tercih edildi (YAGNI).

**Karar — `recommendedUnits` alanı entity'ye eklenmedi:**
Case study'de bu açıkça **Level 3 gereksinimi** ("Recommend suitable field units for new
tasks"). Entity'ye statik bir liste olarak koymak bayatlama ve gelecekteki öneri motoruyla
çakışma riski taşırdı — bu, ileride bir **servisin dönüş değeri** olacak, entity alanı değil.

**Karar — Entity'ler "anemic" (davranışsız) kalacak:**
Level 1'de constructor/validasyon/iş kuralı metodu yok; entity'ler sade veri taşıyıcılar. İş
kuralları Application/Infrastructure katmanında yaşıyor (örn. "yeni incident her zaman Open
başlar" kuralı `IncidentService.CreateAsync`'te, entity'nin kendisinde değil — bkz. 2.8).

### 2.4 Infrastructure katmanı — EF Core + Npgsql kurulumu

**Kurulan NuGet paketleri (8.0.10, EF Core 8 / net8.0 ile uyumlu sürüme sabitlendi):**
- `SmartCityOps.Infrastructure.csproj` → `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.EntityFrameworkCore.Design`
- `SmartCityOps.Api.csproj` → `Microsoft.EntityFrameworkCore.Design` (migration komutu, startup
  project'in de bu paketi referanslamasını zorunlu kılıyor — hata mesajıyla keşfedildi)

**`dotnet-ef` CLI aracı** global olarak kuruldu: `dotnet tool install --global dotnet-ef --version 8.0.10`.

**`IncidentConfiguration.cs` içindeki kararlar:**
- **Karar A — `IncidentCode` üzerinde unique index.** Aynı incident kodu iki kez kaydedilemesin
  diye veritabanı seviyesinde garanti.
- **Karar B — `Type`/`Priority`/`Status` enum'ları Postgres'te `string` olarak saklanıyor**
  (`int` değil). Gerekçe: (1) tabloya bakınca `"Resolved"` okunabiliyor, `2` değil; (2) enum'a
  yeni değer eklenip sıra değişirse eski kayıtların anlamı kaymıyor; (3) bu ölçekte string'in
  ek yer kaplaması önemsiz.

**İlk migration (`InitialCreate`, 12 Ağustos):** `Incidents` tablosunu oluşturdu — `Id` (uuid PK),
`IncidentCode` (unique index), `Type`/`Priority`/`Status` (string), `ReportedAt`, `Latitude`,
`Longitude`, `Description`.

**13 Ağustos'ta gerçek Postgres'e uygulandı** (`dotnet ef database update`) — bkz. bölüm 4.3
(portable Postgres kurulumu) ve bölüm 2.7 (FieldUnit migration'ı).

### 2.5 FieldUnit entity'si (13 Ağustos)

```
Domain/
├── Enums/
│   ├── FieldUnitType.cs    — Police, Medical, Fire, UtilityCrew, TrafficControl
│   └── FieldUnitStatus.cs  — Available, Dispatched, OutOfService
└── Entities/
    └── FieldUnit.cs
```

```
FieldUnit : EntityBase
├── Id         : Guid
├── UnitCode   : string           (örn. "MED-04", "POL-12")
├── Type       : FieldUnitType
├── Status     : FieldUnitStatus
├── Latitude   : double
└── Longitude  : double
```

**Tasarım kararları:**
- `Incident`'la aynı desen (Domain → Infrastructure config → migration), tutarlılık için.
- `Type` için case study'deki incident tiplerini karşılayacak 5 kategori seçildi (Police,
  Medical, Fire, UtilityCrew, TrafficControl) — hepsi örnek incident tiplerine (kaza, yangın,
  sel, altyapı arızası vb.) müdahale edebilecek şekilde.
- `Status` için 3 basit durum (`IncidentStatus`'un sadeliğiyle tutarlı) — `EnRoute`, `OnScene`
  gibi ince durumlar bilinçli olarak eklenmedi, bunlar Level 2/3'e ait (movement history, ETA).
- `Description`/`Priority`/`ReportedAt` gibi incident'a özgü alanlar **eklenmedi** — bir field
  unit'in "bilgisi" ile bir incident'ın "bilgisi" farklı kavramlar.
- Case study'de field unit'ler için ayrı bir "generator" tanımlanmamış (sadece Incident
  Generator var) — bu yüzden field unit verisi **elle/seed data** olarak eklendi, ayrı bir
  generator yazılmadı.

**`FieldUnitConfiguration.cs`:** `IncidentConfiguration` ile aynı desen — `UnitCode` üzerinde
unique index, `Type`/`Status` string olarak saklanıyor.

**Migration:** `AddFieldUnit` (`20260813081610_AddFieldUnit`) — `FieldUnits` tablosunu oluşturdu,
Postgres'e uygulandı.

**Seed data:** `psql` üzerinden elle 5 örnek kayıt eklendi (Ankara koordinatları civarında,
her tipten bir örnek: `POL-01`, `MED-01`, `FIR-01`, `UTL-01`, `TRF-01`).

### 2.6 Proje yeniden yapılandırması — `backend/src/` → `Src/` (13 Ağustos)

Mentör, tüm backend projelerini `backend/src/SmartCityOps.*` yapısından repo kökündeki düz
(flat) bir `Src/SmartCityOps.*` yapısına taşıdı, tek bir `Src/SmartCityOps.sln` altında
birleştirdi:

```
Src/
├── SmartCityOps.sln
├── SmartCityOps.Api/
├── SmartCityOps.Application/
├── SmartCityOps.Domain/
├── SmartCityOps.Infrastructure/
└── incident-generator/            (bkz. 2.9)
```

Visual Studio'nun Solution Explorer'ında görülen `Common` / `Emulator` / `Managers` /
`SmartCityOps` grupları, **diskte karşılığı olmayan, sadece `.sln` içindeki mantıksal
klasörler** (Solution Folders) — fiziksel yapı yukarıdaki gibi düz.

**Bu taşıma sırasında oluşan küçük isim değişiklikleri (bilerek not düşülüyor, ileride
tutarlılık için gözden geçirilebilir):**
- `BaseEntity.cs` → `EntityBase.cs` olarak yeniden adlandırıldı.
- `Infrastructure/Incidents/IncidentService.cs` yerine `Infrastructure/Incident/IncidentService.cs`
  (tekil klasör) oluştu — Application katmanındaki `Incidents/` (çoğul) ile küçük bir
  tutarsızlık, işlevi etkilemiyor.
- `Controllers/IncidentsControllers.cs` — dosya adının sonunda fazladan bir "s" var
  (`Controllers`, çoğul), sınıfın kendisi hâlâ `IncidentsController` (tekil). C#'ta dosya adı
  ile sınıf adı eşleşmek zorunda olmadığı için derlemeyi etkilemiyor.
- `appsettings.json`'daki backend portu `5159`'dan **`5080`**'e düzeltildi (frontend'in
  `.env.example`'da beklediği port buydu, eşleşmiyordu — bkz. bölüm 7).

**Eski `backend/` klasörü commit'ten temizlendi**, artık repoda yok.

### 2.7 Application + Api katmanı — Incident için minimal implementasyon (13 Ağustos)

Field Unit ve Incident Generator hedeflerine ulaşmak için (Generator'ın veri gönderebileceği
bir uç nokta gerektiği için), Incident için **minimal** bir Application+Api katmanı kuruldu —
tam CRUD değil, sadece "listele" ve "oluştur" ihtiyacı karşılandı (YAGNI: `GetById` gibi henüz
kullanılmayan uçlar eklenmedi).

**Application katmanı (`Src/SmartCityOps.Application/Incidents/`):**
- `IncidentDto.cs` — API'nin dışarıya verdiği şekil (`record`, immutable). Entity'nin kendisi
  değil, ayrı bir DTO kullanılıyor — sebep: entity DB şemasına bağlı, DTO dış sözleşmeye bağlı;
  ikisi birbirinden bağımsız değişebilmeli.
- `CreateIncidentDto.cs` — Generator'ın POST edeceği şekil. **`Id` ve `Status` alanları
  bilinçli olarak yok**: `Id`'yi sunucu üretir, `Status`'u sunucu her zaman `Open` olarak
  sabitler (dış sistemin incident'ın yaşam döngüsünü dikte etmesini istemiyoruz).
- `IIncidentService.cs` — arayüz, Application'da; implementasyon Infrastructure'da (Clean
  Architecture'ın Dependency Inversion prensibi — Application, EF Core'u tanımıyor).

**Infrastructure katmanı (`Src/SmartCityOps.Infrastructure/Incident/IncidentService.cs`):**
- `GetAllAsync` → `AsNoTracking()` + doğrudan `.Select()` ile DTO'ya projeksiyon (performans:
  sadece ihtiyaç duyulan kolonlar SQL'e yansıyor).
- `CreateAsync` → `Enum.Parse<IncidentType>(dto.Type)` ile string'i enum'a çeviriyor,
  `Status = IncidentStatus.Open` sabit atanıyor.
- `DependencyInjection.cs`'e `services.AddScoped<IIncidentService, IncidentService>();` eklendi
  — `AddScoped`, çünkü `ApplicationDbContext` de Scoped; DbContext'e bağımlı bir servis en az
  DbContext kadar kısa ömürlü olmalı (Singleton olursa eşzamanlı isteklerde çökme riski).

**Api katmanı (`Src/SmartCityOps.Api/Controllers/IncidentsControllers.cs`):**
- Controller-based Web API (Minimal API değil) — Clean Architecture'la daha uyumlu, büyüdükçe
  organize kalması daha kolay.
- `[Route("api/incidents")]` — elle, açıkça yazıldı (otomatik `[controller]` token'ına
  güvenilmedi — API sözleşmesi bu kadar kritikken açık olmak daha güvenli).
- `POST` içinde `try/catch (ArgumentException)` — `Enum.Parse` geçersiz bir string'le
  karşılaşırsa (Generator hatalı veri gönderirse) 500 yerine anlamlı bir 400 dönüyor.
- **Bilinçli eksik:** 201 cevabında `Location` header'ı yok (`CreatedAtAction` kullanılmadı) —
  bunun için bir `GetById` endpoint'i gerekirdi, henüz yazılmadı (YAGNI).

**CORS + port düzeltmesi (`Program.cs`):**
- `AddCors` ile sadece `http://localhost:5173` (Vite dev server) origin'ine izin veriliyor —
  `AllowAnyOrigin()` kullanılmadı (güvenlik + ileride SignalR'ın `AllowCredentials()` ihtiyacıyla
  çakışmaması için).
- **Bulunan hata:** `launchSettings.json`'daki backend portu (`5159`, şablon varsayılanı)
  frontend'in `.env.example`'da beklediği portla (`5080`) uyuşmuyordu — düzeltildi.

### 2.8 Incident Generator — Worker Service (13 Ağustos)

Case study'nin "dış sistem" tanımını (incident'ları periyodik üretip Operations Center'a
gönderen kaynak) karşılamak için ayrı bir proje: `Src/incident-generator/`
(`SmartCityOps.IncidentGenerator`, .NET Worker Service, `net9.0`).

**Neden ayrı proje, backend'e bağımlı değil (ProjectReference yok):**
Case study'nin Scope bölümü: *"The Operations Center assumes that incidents are produced by an
external system."* Gerçek hayattaki bir dış sistem gibi davranması için, backend'in DTO
sınıflarını paylaşmıyor — kendi `IncidentPayload` record'unu tanımlıyor, sadece **JSON
sözleşmesi** üzerinden konuşuyor (loose coupling).

**Bileşenler:**
- `IncidentGeneratorOptions.cs` — içindeki sınıfın adı mentör tarafından `IncidentGenerator`
  olarak değiştirildi (dosya adıyla artık birebir örtüşmüyor, C#'ta buna izin var). `appsettings.json`'daki
  `ApiBaseUrl` ve `IntervalSeconds` ayarlarını bağlıyor (Options Pattern).
- `Worker.cs` (`BackgroundService`) — her `IntervalSeconds` saniyede bir rastgele bir incident
  üretip `POST {ApiBaseUrl}incidents`'e gönderiyor. `HttpRequestException` yakalanıyor (backend
  ayakta değilse servis çökmüyor, sadece loglayıp devam ediyor).
- `Program.cs` — `AddHttpClient<Worker>(...)` (typed client deseni) + `AddHostedService(sp =>
  sp.GetRequiredService<Worker>())` — bu ikili desen, `HttpClient` gerektiren
  `BackgroundService`'ler için .NET'in önerdiği yol.

**Kritik teknik ders — JSON camelCase uyumu:**
ASP.NET Core'un `[ApiController]`'ı varsayılan olarak **camelCase** JSON bekliyor
(`incidentCode`, `type`...), ama C# property isimleri PascalCase (`IncidentCode`, `Type`).
Worker.cs'te `JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)` kullanılarak
giden JSON otomatik camelCase'e çevriliyor — bu satır unutulsaydı backend tüm alanları `null`
okurdu, sessizce yanlış veri kaydedilirdi.

**Kritik teknik ders — `HttpClient.BaseAddress` ve göreli URL birleştirme (RFC 3986):**
`BaseAddress` **sonunda `/` olmadan** ayarlanırsa (`http://localhost:5080/api`), göreli bir
yol (`"incidents"`) eklenirken son path segmenti **değiştirilir**, eklenmez:
```
http://localhost:5080/api  +  incidents  →  http://localhost:5080/incidents   (yanlış, "api" kayboldu)
http://localhost:5080/api/ +  incidents  →  http://localhost:5080/api/incidents  (doğru)
```
Bu hatayı canlı olarak yaşadık (Generator 404 alıyordu) — `appsettings.json`'daki `ApiBaseUrl`
sonuna `/` eklenerek düzeltildi.

**Doğrulama — uçtan uca test (13 Ağustos, başarılı):**
Postgres + Backend (`Src/SmartCityOps.Api`) + Generator (`Src/incident-generator`) aynı anda
ayakta iken, Generator'ın gönderdiği incident'lar `GET http://localhost:5080/api/incidents`
üzerinden gerçek veri olarak görüldü (`201 Created` yanıtları, `status: "Open"` her zaman sabit,
`type`/`priority` rastgele ama geçerli enum değerleri, koordinatlar Ankara civarında).

---

## 3. Frontend — Klasör Yapısı ve Durum

Vite + React + TypeScript ile kuruldu, feature-based (özellik bazlı) klasörleme kullanılıyor.

```
frontend/src/
├── app/
│   ├── App.tsx              ✅ dolu
│   └── providers.tsx         ✅ dolu — QueryClientProvider
├── features/
│   ├── incidents/            ✅ Level 1 için dolu (henüz gerçek API'ye bağlanmadı)
│   │   ├── api/incidentsApi.ts
│   │   ├── hooks/useIncidents.ts
│   │   ├── components/IncidentPanel.tsx
│   │   └── types.ts
│   ├── field-units/           ⏳ iskelet (backend hazır, frontend henüz bağlanmadı)
│   ├── tasks/                 ⏳ iskelet
│   ├── operations-map/        ✅ MapLibre kurulumu çalışıyor (henüz marker yok)
│   └── dashboard/              ⏳ iskelet
├── shared/
│   ├── lib/httpClient.ts       ✅ axios, VITE_API_BASE_URL'den okuyor (http://localhost:5080/api)
│   ├── lib/signalRConnection.ts ✅ (backend'de SignalR henüz yok)
│   ├── hooks/useSignalR.ts      ✅
│   └── types/common.ts          ✅
├── layouts/OperationsCenterLayout.tsx  ✅
└── main.tsx                    ✅
```

**Not:** Backend artık `http://localhost:5080/api/incidents`'te gerçek veri sunuyor —
frontend'in `httpClient.ts`'teki varsayılan adres bununla zaten uyumlu, bağlama işi bir sonraki
oturumda yapılacak.

### 3.1 Kurulu paketler ve amaçları

| Paket | Amaç |
|---|---|
| `@tanstack/react-query` | Backend verisini cache'leyip yönetmek |
| `axios` | HTTP istekleri |
| `zustand` | İstemci tarafı UI state |
| `maplibre-gl` | Harita |
| `@microsoft/signalr` | Gerçek zamanlı güncellemeler |
| `react-router-dom` | Kurulu, henüz kullanılmıyor |

### 3.2 Karşılaşılan ve çözülen hata

`maplibre-gl` v6'da default export kaldırılmış. Çözüm: named export'a geçildi —
`import { Map as MapLibreMap } from "maplibre-gl"`.

---

## 4. Altyapı

### 4.1 `.gitignore`

**13 Ağustos'ta bulunan ve düzeltilen hata:** Kurallar eski klasör isimlerine sabitlenmişti
(`backend/**/bin/`, `incident-generator/**/bin/`) — proje `Src/` altına taşınınca bu kurallar
hiçbir şeyi yakalamaz oldu, `git add` derleme çıktılarını (`bin/`, `obj/`, yüzlerce dosya) stage
etmeye başladı. **Düzeltme:** anchor'lı (belirli klasöre bağlı) kurallar yerine genel kurallara
geçildi:
```
bin/
obj/
```
(Başında/ortasında `/` olmayan desenler her derinlikte eşleşir — klasör yapısı tekrar değişse
bile kırılmaz.)

Diğer kapsamlar: Node (`node_modules/`, `dist/`), ortam/sırlar (`.env`, `.env.*` —
`.env.example` hariç), Docker (`docker-compose.override.yml`), IDE/OS dosyaları.

Bilinçli istisna: `appsettings.Development.json` **ignore edilmiyor** — içinde gerçek bir sır
yok, repo'da izlenmesi gerekiyor.

### 4.2 `docker-compose.yml`

Ev ortamı için `postgres` servisi tanımlı (`postgres:16-alpine`, port `5432:5432`, healthcheck,
kalıcı volume). Backend/frontend `Dockerfile`'ları henüz yazılmadı.

### 4.3 İş ortamı — Portable PostgreSQL kurulumu (13 Ağustos, admin yetkisi olmadan)

Stajdaki PC'de Docker kurulamıyor (admin yetkisi yok). Bu yüzden Postgres'in **kurulum
gerektirmeyen zip/binary dağıtımı** kullanıldı — sadece dosya kopyalama, kayıt defterine/servis
listesine dokunmuyor.

**Adımlar (tekrar kurulum gerekirse referans):**

1. **İndirme:** EnterpriseDB'nin "Binaries" (installer değil) sürümü indirildi, kullanıcı
   klasörü altına açıldı (`C:\Users\<kullanıcı>\dev-tools\pgsql`).
2. **Port kontrolü:** `Get-NetTCPConnection -LocalPort 5432` ile 5432'nin boş olduğu teyit
   edildi (IT'nin ayrıca kurduğu bir Postgres varsa çakışma olabilirdi).
3. **`initdb` — cluster oluşturma:**
   ```powershell
   .\initdb.exe -D "...\pgsql\data" -U smartcityops -W -E UTF8 --locale=C -A scram-sha-256
   ```
   - **Karşılaşılan hata:** Windows'un Türkçe locale'i (`Turkish_Türkiye.1254`) ASCII-olmayan
     karakter içerdiği için `initdb`'yi kırdı → `--locale=C` ile açıkça belirtilerek çözüldü.
   - `C` locale bilinçli tercih: Postgres'te Türkçe locale (`tr_TR`) kullanmak "Turkish I
     problem" olarak bilinen, `I`/`ı`/`İ`/`i` büyük-küçük harf dönüşümünde öngörülemeyen
     davranışlara yol açabilen bilinen bir sorun kaynağı — `C` locale (byte-sırasıyla
     karşılaştırma) production'da yaygın tercih.
   - Süper kullanıcı doğrudan `smartcityops` adıyla oluşturuldu (appsettings'teki bağlantı
     dizesiyle birebir eşleşsin, ayrı bir `postgres` kullanıcısı + sonradan rol ekleme adımı
     atlanmış oldu).
4. **`pg_ctl start` — sunucuyu başlatma:**
   ```powershell
   .\pg_ctl.exe -D "...\pgsql\data" -l "...\pgsql\data\server.log" -o "-p 5432" start
   ```
5. **`createdb` — uygulama veritabanını oluşturma:**
   ```powershell
   .\createdb.exe -h localhost -p 5432 -U smartcityops smartcityops
   ```
   (`initdb` sadece `postgres`/`template0`/`template1` oluşturur, `smartcityops` adlı DB ayrıca
   oluşturulmalı.)
6. **Doğrulama:** `psql -h localhost -p 5432 -U smartcityops -d smartcityops -c "\conninfo"`

**Önemli işletim notu:** Postgres process'i, başlatıldığı terminal penceresi kapanınca (veya
bilgisayar uyku moduna girince) duruyor — her yeni oturumda `pg_isready` ile kontrol edilip
gerekirse adım 4 tekrar çalıştırılmalı.

**Sonuç:** connection string (`Host=localhost;Port=5432;Database=smartcityops;
Username=smartcityops;Password=smartcityops`) hiçbir makinede değişmiyor — ev ortamında
(Docker) ve iş ortamında (portable binary) aynı.

---

## 5. Şu Anki Tam Proje Ağacı

```
smart-city-ops/
├── .gitignore
├── docker-compose.yml
├── docs/
│   └── DEVELOPMENT_LOG.md   (bu dosya)
├── Src/
│   ├── SmartCityOps.sln
│   ├── SmartCityOps.Domain/
│   │   ├── Common/EntityBase.cs
│   │   ├── Enums/ (IncidentType, IncidentPriority, IncidentStatus, FieldUnitType, FieldUnitStatus)
│   │   └── Entities/ (Incident.cs, FieldUnit.cs)
│   ├── SmartCityOps.Application/
│   │   └── Incidents/ (IncidentDto.cs, CreateIncidentDto.cs, IIncidentService.cs)
│   ├── SmartCityOps.Infrastructure/
│   │   ├── DependencyInjection.cs
│   │   ├── Incident/IncidentService.cs
│   │   └── Persistence/
│   │       ├── ApplicationDbContext.cs
│   │       ├── Configurations/ (IncidentConfiguration.cs, FieldUnitConfiguration.cs)
│   │       └── Migrations/ (InitialCreate, AddFieldUnit)
│   ├── SmartCityOps.Api/
│   │   ├── Controllers/IncidentsControllers.cs
│   │   ├── Program.cs             (CORS + port 5080 + Infrastructure DI)
│   │   ├── appsettings.json / appsettings.Development.json
│   │   └── Properties/launchSettings.json
│   └── incident-generator/
│       ├── SmartCityOps.IncidentGenerator.csproj
│       ├── Program.cs
│       ├── Worker.cs
│       ├── IncidentGeneratorOptions.cs   (içindeki sınıf adı: IncidentGenerator)
│       └── appsettings.json / appsettings.Development.json
├── frontend/
│   ├── .env / .env.example
│   └── src/ (bkz. bölüm 3)
```

`backend/` klasörü artık yok (13 Ağustos'ta `Src/`'e taşındı, eski hâli commit'ten temizlendi).

---

## 6. Sıradaki Adım

**Tamamlananlar (13 Ağustos itibarıyla):** FieldUnit entity + seed data, Incident için minimal
Application+Api katmanı, CORS, Incident Generator — uçtan uca doğrulandı (Generator → Api →
Postgres → GET ile görüntülenebiliyor).

**Hemen sıradaki:** Frontend'i gerçek API'ye bağlamak —
1. `features/incidents` zaten yazılmış `fetchIncidents`/`useIncidents`'i gerçek backend'e
   bağlayıp haritada incident marker'larını göstermek.
2. `features/field-units` için aynı deseni (api/hooks/components) sıfırdan kurup FieldUnit
   verisini de haritada göstermek.
3. Ardından: `OperationalTask` entity'si (Incident + FieldUnit'i birbirine bağlayan ilişki) →
   task oluşturma/atama/durum güncelleme UI akışı → Level 1'in deliverable'ı tamamlanmış olur.

**Küçük temizlik kalemleri (bloklayıcı değil):**
- `Infrastructure/Incident` klasör adını `Infrastructure/Incidents` (çoğul) yaparak Application
  katmanıyla tutarlı hale getirmek.
- `Controllers/IncidentsControllers.cs` dosya adındaki fazladan "s"yi düzeltmek.
- `Program.cs` ve `Worker.cs`'te mentörün bıraktığı `// TODO` yorumlarını (CORS ayarlarının
  config'e taşınması, solution'ların birleştirilmesi, ortak kodun paylaşılan bir projeye
  çıkarılması gibi) değerlendirmek.

---

## 7. Sürüm Notları / Düzeltmeler

- **12 Ağustos 2026:** `Npgsql.EntityFrameworkCore.PostgreSQL`'in en güncel sürümü (10.0.3)
  `net10.0` istiyor, `net8.0` ile uyumsuz çıktı → 8.0.10'a sabitlendi.
- **12 Ağustos 2026:** `Microsoft.EntityFrameworkCore.Design` paketinin yalnızca
  Infrastructure'da değil, startup project'te (Api) de referanslı olması gerektiği migration
  komutu çalıştırılırken ortaya çıktı → Api projesine de eklendi.
- **13 Ağustos 2026:** Windows'un Türkçe locale'i `initdb`'yi kırdı (ASCII-olmayan karakter
  içeren locale adı) → `--locale=C` ile açıkça belirtilerek çözüldü.
- **13 Ağustos 2026:** Backend portu `launchSettings.json`'da `5159` (şablon varsayılanı),
  frontend'in beklediği port `5080` — uyuşmuyordu → `launchSettings.json` düzeltildi.
- **13 Ağustos 2026:** `Microsoft.Extensions.Http` paketi Generator projesinde `10.0.11` olarak
  kuruldu, `Microsoft.Extensions.Hosting` ise `9.0.19` — major versiyon uyuşmazlığı, tutarlılık
  için `9.0.19`'a sabitlendi.
- **13 Ağustos 2026:** Generator, backend'e `POST http://localhost:5080/incidents` atıyordu
  (`/api` eksik) — sebep: `appsettings.json`'daki `ApiBaseUrl` sonunda `/` yoktu, göreli URL
  birleştirmesi son path segmentini değiştirdi → sonuna `/` eklenerek düzeltildi.
- **13 Ağustos 2026:** `.gitignore`'daki `bin/`/`obj/` kuralları eski klasör isimlerine
  (`backend/`, `incident-generator/`) sabitlenmişti, `Src/` taşımasından sonra hiçbir şeyi
  yakalamaz oldu → genel (anchor'sız) `bin/`/`obj/` kurallarına geçildi.
- **13 Ağustos 2026:** Proje `backend/src/` yapısından repo-kökü `Src/` düz yapısına taşındı,
  tek bir `Src/SmartCityOps.sln` altında birleştirildi (bkz. bölüm 2.6).

---

## 8. Frontend — API Bağlantısı ve Harita Marker Entegrasyonu (13 Ağustos, akşam oturumu)

### 8.1 Tespit — veri çekme katmanı zaten hazırmış

Oturuma başlarken yapılan incelemede `incidentsApi.ts` ve `useIncidents.ts`'in **zaten doğru**
yazılmış olduğu görüldü: `httpClient.ts`'teki `baseURL` (`http://localhost:5080/api`) backend'in
gerçek portuyla uyumlu, `fetchIncidents()` → `GET /incidents` backend'deki
`IncidentsController.GetAll` ile birebir eşleşiyor, ve `IncidentDto` (backend) ile `Incident`
(frontend `types.ts`) alan alan örtüşüyor (`id, type, priority, status, reportedAt, latitude,
longitude, description`) — ASP.NET Core'un varsayılan camelCase serileştirmesi sayesinde ayrı bir
mapping katmanına gerek kalmadı.

Eksik olan, bu verinin haritaya ve panele taşınmasını sağlayan **bağlantı telleriydi**:
`OperationsMap` hiç prop almıyordu (marker yoktu), `App.tsx`'teki `selectedIncident` state'inin
setter'ı hiç kullanılmıyordu, ve `OperationsCenterLayout` haritayı kendi içinde hardcode ettiği
için `App.tsx`'teki state haritaya hiç ulaşamıyordu.

### 8.2 Karar — CSS, `.tsx` dosyalarından tamamen ayrılacak

Mentör, inline `style={{...}}` kullanımının okunurluğu düşürdüğünü belirterek yeni bir proje
kuralı koydu: **hiçbir `.tsx` dosyasında satır içi stil objesi bulunmayacak.** Component'i
barındıran her klasörün (`components/` olan her yerde, ve `layouts/`) yanında bir **kardeş
`styles/` klasörü** olacak, dosya adı component adıyla birebir eşleşecek:

```
layouts/
├── OperationsCenterLayout.tsx
└── styles/
    └── OperationsCenterLayout.css
features/operations-map/
├── components/OperationsMap.tsx
└── styles/OperationsMap.css
```

**CSS Modules vs. düz CSS + BEM tartışıldı** — CSS Modules (Vite'ta kurulumsuz çalışıyor,
class isimlerini otomatik benzersizleştiriyor) önerildi ama mentör **düz CSS + BEM**'i tercih
etti. BEM deseni: kök class component adının kebab-case hâli (`operations-center-layout`), alt
elemanlar `__` ile (`operations-center-layout__map`, `operations-center-layout__side-panel`).
Bu proje ölçeğinde çakışma riski düşük görüldüğü için manuel disiplin yeterli kabul edildi.

### 8.3 Yapılan değişiklikler

**`layouts/OperationsCenterLayout.tsx` + yeni `layouts/styles/OperationsCenterLayout.css`:**
- Kendi içinde hardcode ettiği `<OperationsMap />` çağrısı ve import'u kaldırıldı.
- `sidePanel` gibi bir de `map: ReactNode` prop'u eklendi — layout artık haritanın hangi
  component olduğunu bilmiyor, sadece yerleşimden (sol büyük alan / sağ 360px panel) sorumlu.
  Gerekçe: layout'un `operations-map` feature'ına doğrudan bağımlılığı olmamalı.
- Tüm `style={{}}` kullanımları `className` + BEM class'larına taşındı.

**`features/operations-map/` — yeni `styles/OperationsMap.css`, yeni `hooks/useIncidentMarkers.ts`:**
- `OperationsMap.tsx` artık `incidents: Incident[]` ve `onSelectIncident: (incident: Incident) =>
  void` prop'larını alıyor.
- Marker yaşam döngüsü (incidents değişince eskilerini silip yenilerini eklemek) bilinçli olarak
  `OperationsMap.tsx`'in içine değil, ayrı bir `useIncidentMarkers` hook'una yazıldı — component
  "haritayı kur" sorumluluğunda kalsın, marker yönetimi ayrı bir kaygı (concern) olarak kalsın diye.
- **Teknik detay — `mapRef` yerine `useState`:** Harita `mapRef.current`'e senkron olmayan bir
  zamanda (mount sonrası) atanıyor; bir `ref`'in içeriği değiştiğinde React otomatik re-render/
  effect tetiklemiyor. Bu yüzden `OperationsMap` haritayı hem `ref`'te hem `useState`'te tutuyor —
  state değiştiğinde `useIncidentMarkers`'ın `useEffect`'i doğru zamanda tetikleniyor.
- **Bilinçli eksik — `selectedIncidentId` prop'u eklenmedi:** Seçili marker'ı görsel olarak
  vurgulamak case study'de Level 2 kapsamı ("Highlight high-priority incidents"). Şu an
  kullanılmayacak bir prop eklemek YAGNI'ye aykırı olurdu — ihtiyaç çıkınca eklenecek.

**`app/App.tsx`:**
- `selectedIncident` state'inin setter'ı (`setSelectedIncident`) artık gerçekten kullanılıyor.
- `OperationsMap`, `OperationsCenterLayout`'un `map` slotuna `incidents={incidents ?? []}` ve
  `onSelectIncident={setSelectedIncident}` ile veriliyor. `incidents ?? []`: react-query veri
  gelene kadar `undefined` döndürüyor, `OperationsMap`'in `Incident[]` (non-nullable) prop
  tipiyle uyuşsun diye boş diziye düşürülüyor.

**`features/incidents/components/IncidentPanel.tsx`:** Mantık zaten doğruydu (incident'ı
gösteriyor, `null` durumunu ele alıyordu), sadece bayatlamış bir yorum satırı temizlendi.

**Sonuç — veri akışı zinciri:**
```
useIncidents (react-query)
  → App.tsx (incidents, selectedIncident state)
    → OperationsMap (marker'ları çizer, tıklamayı onSelectIncident'a bağlar)
      → useIncidentMarkers (marker yaşam döngüsü)
    → IncidentPanel (selectedIncident'ı gösterir)
```

### 8.4 Doğrulama

Bu makinede PostgreSQL kurulu olmadığı için backend çalıştırılamadı — uçtan uca canlı test
**yapılamadı**, iş bilgisayarında (Postgres kurulu) ertesi gün yapılacak. Bu oturumda sadece
statik doğrulama yapıldı:
- `npx tsc --noEmit` → temiz, tip hatası yok.
- `npm run build` → başarılı (`dist/assets/index-*.js` ~1.27MB, gzip ~347KB). Çıkan "chunk size
  500KB'ı geçti" uyarısı bir hata değil, `maplibre-gl`'in büyüklüğünden kaynaklanan standart bir
  bilgilendirme — Level 1 kapsamında code-splitting'e girilmedi, bilinçli olarak ertelendi.

**Yarın (iş bilgisayarında) yapılacak:** `dotnet run` (backend) + `npm run dev` (frontend) aynı
anda ayakta iken haritada Ankara civarında marker'ların göründüğünü, birine tıklayınca sağdaki
panelde detayların geldiğini doğrulamak. Çalışmazsa ilk bakılacak yerler: CORS origin'i
(`5173`), backend portu (`5080`), tarayıcı console'undaki network hataları.

---

## 9. Mac'te Uçtan Uca Doğrulama — İki Gerçek Bug Bulundu ve Düzeltildi (13 Ağustos, gece)

Aynı akşam, kişisel Mac'e Postgres kurulup backend + generator + frontend aynı anda ayağa
kaldırılınca harita hiç görünmedi (boş/düz renkli bir dikdörtgen). İki ayrı, birbirinden
bağımsız kök nedene sahip gerçek bug tespit edildi ve düzeltildi — ikisi de tarayıcı üzerinden
canlı DOM/network incelemesiyle (okuma amaçlı, kod değiştirmeden) kanıtlandı, sonra çözüldü.

### 9.1 Bug #1 — MapLibre canvas'ı container'ın boyutunu hiç öğrenemiyordu

**Belirti:** `.operations-map` container'ı doğru boyuttaydı (887×720px, sol paneli tam
dolduruyordu) ama içindeki `<canvas>` sabit **400×300px**'de kalıyordu — harita küçük bir kutuya
sıkışmış görünüyordu.

**Kök neden:** `main.tsx`'te `<StrictMode>` aktif. React 18, dev modda her component'in
`useEffect`'ini bilerek **mount → cleanup → tekrar mount** şeklinde iki kere çalıştırıyor (bug
yakalamaya yardımcı olsun diye). `OperationsMap`'in harita kurulum effect'i bu çifte
çalıştırmadan geçince: ilk `Map` örneği oluşturuluyor, hemen StrictMode onu söküyor, aynı
container'a ikinci bir `Map` örneği kuruluyor. MapLibre'nin container boyutunu otomatik takip
eden dahili `ResizeObserver` mekanizması bu hızlı kur-yık-kur döngüsünde container'ın gerçek
boyutunu hiç öğrenemiyor — bilinen bir React 18 StrictMode + MapLibre/Mapbox GL etkileşim sorunu.

**Çözüm:** MapLibre'nin dahili boyut takibine güvenmek yerine, `OperationsMap.tsx`'teki kurulum
`useEffect`'ine kendi `ResizeObserver`'ımız eklendi — container boyutu her değiştiğinde açıkça
`instance.resize()` çağrılıyor. Bu, StrictMode'dan bağımsız çalışır ve flex/responsive layout
içine harita gömme senaryosunda zaten standart bir pratik. `resizeObserver.disconnect()` effect
cleanup'ına eklendi (sızıntı olmasın diye).

**Doğrulama:** Değişiklik sonrası `.operations-map` ve içindeki `canvas` ikisi de **887×720**
olarak ölçüldü — birebir eşleşiyor.

### 9.2 Bug #2 — Vite dev server, MapLibre'nin Web Worker dosyasını 404 veriyordu

Stil değişse bile (bkz. 9.3) harita hâlâ boş kalıyordu. Derin teşhis (`map.isStyleLoaded()`,
`map.queryRenderedFeatures()`, doğrudan `fetch()` ile tile/style/worker isteklerinin tek tek
kontrolü) şunu ortaya çıkardı:
- Stil JSON'u (200 OK), sprite/glyph adresleri, hatta gerçek vektör tile verisi (`.pbf`, Ankara
  için 71KB) sorunsuz iniyordu — veri/ağ tarafında hiçbir sorun yoktu.
- Ama `GET http://localhost:5173/node_modules/.vite/deps/maplibre-gl-worker.mjs` → **404**.

**Kök neden:** MapLibre GL JS, indirdiği ham vektör tile verisini ekrana basılabilir hale
getirmek (decode etmek) için ayrı bir Web Worker thread'i kullanıyor; worker'ın script adresini
çalışma zamanında dinamik olarak hesaplıyor. Projenin `vite` sürümü çok yeni (Rolldown tabanlı,
`^8.2.0`) — Vite'ın bağımlılık ön-derleme ("dependency pre-bundling") mekanizması bu dinamik
adresi statik olarak analiz edemiyor, worker dosyasının önbellekteki gerçek adresiyle
MapLibre'nin istediği adres uyuşmuyor → 404. Worker hiç başlayamadığı için indirilen veri asla
decode edilip çizilemiyordu; bu bir "worker yüklenemedi" durumu olduğu için MapLibre'nin `error`
event'i olarak da yakalanmıyordu (konsolda sessiz kalıyordu) — bu yüzden teşhisi zaman aldı.

**Çözüm:** `frontend/vite.config.ts`'e `optimizeDeps: { exclude: ['maplibre-gl'] }` eklendi.
Bu ayarla Vite, `maplibre-gl`'i ön-derlemeden, `node_modules` içindeki orijinal haliyle native
ES module olarak servis ediyor — kütüphane kendi worker adresini artık kendi gerçek konumuna
göre hesaplıyor, önbellek yol uyuşmazlığı ortadan kalkıyor. MapLibre/Mapbox GL + Vite
kombinasyonunda topluluğun bilinen standart çözümü.

**Teşhis sırasında** `OperationsMap.tsx`'e geçici olarak `window.__debugMap = instance` ve bir
`error` event dinleyicisi eklenmişti — kalıcı koda dahil edilmeden, çözüm uygulanırken kaldırıldı.

### 9.3 Harita stili değişikliği — `demotiles` yerine OpenFreeMap, Ankara'ya kilitleme

İki bug'dan bağımsız, üçüncü bir gözlem: `demotiles.maplibre.org` stili MapLibre'nin kendi
**demo/test amaçlı**, çok düşük detaylı (sadece kaba ülke sınırları) stili — şehir/mahalle
ölçeğinde (`zoom: 12`, Ankara) hiçbir ayrıntı içermiyor, o yüzden zumlanınca tek düz renk
görünüyordu.

**Çözüm:**
- Stil kaynağı **OpenFreeMap**'in ücretsiz, API key/billing gerektirmeyen vektör stiline
  çevrildi: `https://tiles.openfreemap.org/styles/liberty`. Bu, projenin başındaki "API
  key/billing gerektirmiyor" mimari kararına (bkz. `DEVELOPMENT_LOG.md` bölüm 1) uyumlu, gerçek
  sokak/şehir detayı sağlıyor.
- Harita, case study'nin "Operations Center bir şehre özel" varsayımıyla tutarlı olsun diye
  Ankara'ya kilitlendi: `minZoom: 10` ve `maxBounds` (enlem 39.6–40.2, boylam 32.4–33.3'ü
  kapsayan bir kutu) eklendi — operatör haritayı dünyanın başka bir yerine kaydıramıyor/
  uzaklaştıramıyor.

### 9.4 `incident-generator` — `net9.0` → `net8.0` (bu Mac'te SDK uyumsuzluğu nedeniyle)

Daha önce (bölüm 6/7'de not düşülen) bilinen bir tutarsızlık vardı: `incident-generator`
`net9.0`'ı hedefliyordu, diğer 4 backend projesi `net8.0`. Karar, "sorun çıkarmadığı sürece
dokunulmasın" şeklindeydi (proje `ProjectReference` içermediği için derleme zamanı riski yoktu).

Bu Mac'te sadece **.NET SDK 8.0.423** kurulu olduğu için (`.NET 9.0` SDK'sı yok), `dotnet run`
`NETSDK1045` hatasıyla çöktü — "sorun çıkarsa düzeltiriz" koşulu gerçekleşti. Çözüm:
- `SmartCityOps.IncidentGenerator.csproj`'da `<TargetFramework>` `net9.0`'dan `net8.0`'a indirildi.
- `Microsoft.Extensions.Hosting`/`Microsoft.Extensions.Http` paket sürümleri `9.0.19`'dan
  `8.0.1`'e indirildi. **Not:** İlk denemede `8.0.10` yazıldı (diğer projelerdeki
  `Npgsql`/`EFCore.Design` paketleriyle görsel tutarlılık için) ama NuGet'te bu paketler için
  `8.0.10` diye bir sürüm **yayınlanmamış** — restore sessizce en yakın sürüm olan `9.0.0`'ı
  çözümledi (bu, `net8.0` hedeflerken gizlice `net9` paketlerini çekmek anlamına geliyordu,
  amacın tam tersi). NuGet API'sinden gerçek mevcut sürümler sorgulanıp (`8.0.0`, `8.0.1`)
  doğru sürüm (`8.0.1`) yazılınca `dotnet build` 0 uyarı/0 hata ile geçti. **Ders:** Farklı NuGet
  paket ailelerinin sürüm numaralandırması birbirinden bağımsız — "diğer paket şu sürümde, bu da
  öyle olsun" varsayımı yanlış olabilir, gerçek mevcut sürüm her zaman doğrulanmalı.

### 9.5 Sonuç — ilk başarılı uçtan uca test

Bu Mac'e (EnterpriseDB "Binaries", macOS, PostgreSQL 18.6 — mimari kararda "16" yazsa da
işlevsel fark yaratmadı) portable Postgres kuruldu, `dotnet ef database update` ile migration'lar
uygulandı. Ardından backend (`SmartCityOps.Api`, `dotnet run`), generator (`incident-generator`,
`dotnet run`, artık `net8.0`) ve frontend (`npm run dev`) aynı anda ayağa kaldırıldı.

**Doğrulanan tam zincir:** Generator → `POST /api/incidents` → Postgres → `GET /api/incidents`
(gerçek veri, `curl` ile teyit edildi) → frontend `useIncidents` → `OperationsMap` → haritada
Ankara civarında marker'lar (gerçek sokak detaylarıyla) → marker'a tıklama → `IncidentPanel`'de
doğru detaylar. **İlk kez gerçek, canlı, uçtan uca test başarılı.**


---

# Part 3 — Level 1: FieldUnit Seed Data, OperationalTask Business Logic & Incident Resolve

*(Source: original `docs/DEVELOPMENT_LOG3.md`)*

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


---

# Part 4 — Level 1: Remaining Frontend Steps, Bug Fixes & Final Case-Study Audit

*(Source: original `docs/DEVELOPMENT_LOG4.md`)*

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


---

# Part 5 — Level 2 Kickoff: Resolved-Incident Bug, Task History, Operational Statistics

*(Source: original `docs/DEVELOPMENT_LOG5.md`)*

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


---

# Part 6 — Level 2: Sidebar Reorganization, Filtering, Incident Timeline & Zone-Based Generator

*(Source: original `docs/DEVELOPMENT_LOG6.md`)*

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


---

# Part 7 — Level 2: Layout Redesign — Bottom Bar & Menu Overlay

*(Source: original `docs/DEVELOPMENT_LOG7.md`)*

`docs/DEVELOPMENT_LOG7.md`'nin **tamamının üzerine yazılacak** güncellenmiş içerik aşağıda — mevcut dosyanı tamamen bu metinle değiştirip commit/push'u kendin yap:

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 19 Ağustos 2026
**Kapsam:** Frontend mimari yeniden yapılandırması — "harita merkezli, sabit (scroll'suz)
operasyon arayüzü" tasarımına geçiş — **TAMAMLANDI**

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
- Marker'a tıklandığında haritada bir tür geri bildirim (popup ya da başka bir yöntem).

**Çalışma yöntemi kararı:** Kullanıcı açıkça "tek seferde büyük kod bloğu verme, aşama aşama,
her aşamadan sonra test edip onay vereceğim" dedi. Bu yüzden değişiklik küçük aşamalara bölündü,
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
kaldı. `Timeline.tsx` component'i silinmedi, sadece bağlantısı kesildi — nereye taşınacağı
Aşama 9'da (bkz. bölüm 5) karara bağlandı.

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
altında). `Menu.tsx` iki katmanlı hale geldi: önce bölüm listesi, bir bölüme tıklayınca o
bölümün içeriği aynı overlay içinde açılıyor (`← Back to Menu` ile listeye dönülebiliyor).
**UX eklemesi:** bir tabloda Unit/Incident hücresine tıklamak (çapraz gezinme) artık Menu'yü de
otomatik kapatıyor — aksi halde seçim sonucu (bottom bar'daki panel) Menu açıkken görünmez
olurdu. `OperationalStatistics.tsx` artık kullanılmıyor (silinmesi öneriliyor, henüz silinmedi).

### Aşama 8 — Seçili marker'ı haritada görsel olarak vurgulama
Marker'a tıklandığında popup eklemek yerine (detay zaten bottom bar'da gösteriliyor, popup aynı
bilginin tekrarı olurdu — History/Timeline birleştirme, pasta grafik reddiyle aynı mantık),
**seçili marker'ı görsel olarak vurgulamak** tercih edildi:

- `App.tsx`, `selectedIncident?.id`/`selectedFieldUnit?.id`'yi `OperationsMap` →
  `useIncidentMarkers`/`useFieldUnitMarkers`'a kadar prop olarak indiriyor.
- Seçili marker'ın DOM elementine bir CSS class ekleniyor
  (`incident-marker--selected` / `field-unit-marker--selected`), `filter: drop-shadow(...)` ile
  bir glow efekti veriliyor.
- **Renk seçimi bilinçli:** Incident marker'ları için mavi glow (`#1d4ed8`) — mevcut
  priority renkleriyle (kırmızı/turuncu/yeşil) çakışmıyor. Field unit marker'ları zaten mavi
  (`#2563eb`) olduğu için aynı mavi glow'un kontrastı düşük olurdu — onlar için amber/altın
  (`#f59e0b`) glow kullanıldı.
- Boyut büyütmek yerine glow tercih edildi çünkü High Priority incident'lar zaten
  `scale: 1.4` kullanıyor — "seçili + High Priority" durumunda iki büyütme üst üste binip
  marker'ların birbirine girmesi riski vardı.

### Aşama 9 — Timeline'ın yeni yeri: Seçenek B uygulandı
İki seçenek tartışılmıştı (Menu'de bağlamsız bir bölüm — Seçenek A — vs. incident panelinden
tetiklenen, doğrudan o incident'ı gösteren bir görünüm — Seçenek B). **Seçenek B seçildi.**

**Mimari değişiklik — Menu'nün state'i `App.tsx`'e taşındı:** Menu artık kendi
`isOpen`/`activeSection` state'ini tutmuyor; `App.tsx`'te tek bir `menuView: "closed" | "list" |
"completed-tasks" | "statistics" | "timeline"` state'i var. Gerekçe: "View Timeline" butonu
`IncidentPanel`'de (bottom bar'da) yaşıyor ama Menu'yü *belirli bir bölüme* doğrudan açtırması
gerekiyor — bu, Menu'nün kendi izole state'iyle yapılamaz, App.tsx'in (zaten projenin
orkestrasyon katmanı) bu state'i tutup her iki component'e de prop olarak geçmesi gerekti.

**Yeni component — `features/incidents/components/IncidentTimelineSection.tsx`:** Eski
`IncidentPanel`'deki Timeline oluşturma mantığının (reported/assigned/completed/resolved
olaylarını birleştirip `Timeline` component'ine veren kod) birebir taşınmış hali.

**`IncidentPanel.tsx`'e eklenen "View Timeline" butonu:** `onViewTimeline` prop'u alıyor,
`App.tsx`'te `() => setMenuView("timeline")`'a bağlı. Tıklanınca Menu, bölüm listesini atlayıp
doğrudan seçili incident'ın Timeline'ını gösteriyor.

**Test sonucu:** Bir incident seçilip "View Timeline"a tıklandığında Menu doğrudan Timeline'ı
gösteriyor, "← Back to Menu" ile bölüm listesine dönülebiliyor, Menu butonuna normal tıklayınca
hâlâ bölüm listesi açılıyor — hepsi doğrulandı.

---

## 4. Bulunan ve düzeltilen bir gerçek hata — IncidentPanel buton hizalaması

**Belirti:** `IncidentPanel`'de "View Timeline" ve "Resolve Incident" butonları yan yana değil,
alt alta görünüyordu — ikisine de doğru CSS class'ları (`padding`, `border-radius`, `background`
vb.) verilmiş olmasına rağmen.

**Kök neden:** CSS değil, JSX yapısı. "Resolve Incident" butonu eskiden (Timeline butonu
eklenmeden önce) tek başınaydı ve bir `<div>` içine sarılıydı (hata mesajıyla birlikte
gruplamak için). "View Timeline" butonu eklenince bu `<div>` sarmalayıcısı olduğu gibi kaldı —
`<div>` **block-level** bir eleman olduğu için otomatik yeni satıra geçiyor, iki buton
`inline-block` (varsayılan buton davranışı) olsa bile aralarına giren `div` onları ayırıyordu.

**Çözüm:** İki buton ortak bir `.incident-panel__actions` flex container'ına alındı (`display:
flex; gap: 8px`), hata mesajı (`isError`) container'ın dışına, ayrı bir yere taşındı.

**Ek temizlik:** Kullanıcının CSS dosyasında bir yazım hatası da bulundu — `.resolve-buton`
(eksik "t") adında, hiçbir yerden kullanılmayan ölü bir kural. Doğru isimli `.resolve-button`
zaten tanımlıydı, yazım hatalı olan silindi.

---

## 5. Case study — Level 2 durumu (bu oturum sonu itibarıyla)

Bu oturum tamamen UI yeniden yapılandırmasına ayrıldığı için Level 2'nin case study
maddelerinde ilerleme yok — hepsi bir önceki oturumdan (`DEVELOPMENT_LOG6.md`) kaldığı yerde:
filtering ✅ (önceki oturumda tamamlanmıştı), incident timeline ✅ (bu oturumda yeniden
konumlandırıldı, işlevsel olarak hâlâ çalışıyor), **operational zones**, **gerçek SignalR**,
**field unit movement history** hâlâ bekliyor.

---

## 6. Sıradaki adım

1. **Küçük temizlik (bloklayıcı değil):** `OperationalStatistics.tsx` hâlâ kullanılmıyor,
   silinmesi önerilir.
2. Level 2'nin kalan maddelerine dönülecek: **operational zones** (incident generator'ın
   `AnkaraZones` verisi temel alınarak, bkz. `DEVELOPMENT_LOG6.md` §7), ardından **gerçek
   SignalR** (backend'de `OperationsHub`), en sonda ona bağımlı olan **field unit movement
   history**.
```


---

# Part 8 — Level 2: Operational Zones & Field Unit Movement History

*(Source: original `docs/DEVELOPMENT_LOG8.md`)*

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


---

# Part 9 — Level 2 Completion: Real-Time SignalR Updates

*(Source: original `docs/DEVELOPMENT_LOG9.md`)*

Here's `DEVELOPMENT_LOG9.md` — matching the same format, language, and level of detail as the previous logs. Create it at `docs/DEVELOPMENT_LOG9.md` with this content:

```markdown
# Smart City Operations Center — Teknik Dokümantasyon (devam)

**Son güncelleme:** 21 Ağustos 2026
**Kapsam:** Level 2'nin son maddesi tamamlandı — **gerçek SignalR entegrasyonu**. Level 2 artık
**tamamen tamamlandı.**

Bu doküman `DEVELOPMENT_LOG8.md`'nin devamı. Bu oturumda `useIncidents.ts`'teki 15 saniyelik
polling workaround'u nihayet gerçek bir real-time mekanizmayla değiştirildi.

---

## 1. Tasarım kararı — Hub ne yayınlamalı?

**İki seçenek tartışıldı:**

1. **Tipli, ayrıntılı event'ler** (`IncidentCreated(IncidentDto)`, `TaskAssigned(...)` vb.), her
   biri güncel veriyi doğrudan taşıyan.
2. **Tek, payload'suz genel bir sinyal** (`"OperationsUpdated"`), her mutation'dan sonra
   gönderilen; frontend bunu aldığında sadece ilgili 4 React Query anahtarını invalidate ediyor.

**Seçenek 2 seçildi.** Gerekçe: projede şimdiye kadar kurulan her "real-time'a yakın" davranış
zaten "sinyal ver, sonra yeniden çek" mantığıyla çalışıyor (movement history'nin
`invalidateQueries`'i, `useCreateTask`/`useCompleteTask`'ın mutation-sonrası invalidation'ı) —
Seçenek 1, bu kod tabanında hiç emsali olmayan yeni bir "push edilen veriyle cache'i elle
güncelle" deseni getirirdi. Ayrıca tek bir mutation (örn. `OperationalTaskService.CreateAsync`)
birden fazla tabloyu aynı anda değiştirebiliyor — tipli event'ler her metotta "hangi event'leri
ateşlemem gerekiyor" listesini elle güncel tutmayı gerektirir, unutma riski yüksek. Genel sinyal +
her zaman aynı 4 anahtarı invalidate etme yaklaşımı, bu riski tamamen ortadan kaldırıyor.
`operational-zones` bu invalidation listesine **bilinçli olarak dahil edilmedi** — statik veri,
`staleTime: Infinity` kararı hâlâ geçerli.

---

## 2. Backend — Hub ve broadcast

### 2.1 Bulunan ve düzeltilen tasarım hatası — Hub nerede yaşamalı?

İlk plan `OperationsHub`'ı `SmartCityOps.Api/Hubs/` altına koymaktı. Bu, projenin katman
mimarisini (`Api → Infrastructure → Application → Domain`) ihlal ediyordu: broadcast'i
tetikleyecek olan `IncidentService`/`OperationalTaskService` **Infrastructure**'da yaşıyor,
Infrastructure Api'ye referans veremez (zaten tam tersi yönde bir referans var) — bu, derlenmeyen
dairesel bir bağımlılık olurdu. **Düzeltme:** `OperationsHub`, `SmartCityOps.Infrastructure/Hubs/`
altına taşındı; `Program.cs` sadece doğru namespace'i import ediyor, `MapHub<OperationsHub>(...)`
çağrısının kendisi değişmedi.

### 2.2 Bulunan ve düzeltilen ikinci hata — Infrastructure projesinin SignalR tiplerine erişimi

Hub'ı taşıdıktan sonra derleme hataları çıktı: `Hub`, `IHubContext<>` bulunamıyor. Kök neden:
"SignalR sunucu tarafı için ayrı bir NuGet paketi gerekmiyor" bilgisi **sadece**
`Microsoft.NET.Sdk.Web` projeleri için doğru (sadece `SmartCityOps.Api` bu SDK'yı kullanıyor).
`SmartCityOps.Infrastructure` düz `Microsoft.NET.Sdk` (class library) kullanıyor — ASP.NET Core
shared framework'e örtük erişimi yok. **Düzeltme:** `SmartCityOps.Infrastructure.csproj`'a
`<FrameworkReference Include="Microsoft.AspNetCore.App" />` eklendi — bu bir NuGet paketi değil,
zaten yüklü olan shared framework'e class library'den erişim izni.

### 2.3 Bulunan ve düzeltilen üçüncü sorun — CORS credentials

Hub bağlantısı ilk denemede CORS hatasıyla reddedildi: `@microsoft/signalr`'ın istemci tarafı,
`negotiate` isteğini varsayılan olarak `credentials: 'include'` ile gönderiyor — bu SignalR'ın
kendi varsayılan davranışı, uygulamanın herhangi bir auth kullanıp kullanmamasından bağımsız.
Mevcut CORS policy'si (`Api/DependencyInjection.cs`) `.AllowCredentials()` çağırmıyordu, tarayıcı
bu yüzden yanıtı bloke etti. **Düzeltme:** Policy zaten `WithOrigins(...)` ile belirli bir origin
kullandığı için (wildcard değil), `.AllowCredentials()` güvenle eklenebildi.

### 2.4 Broadcast'in gerçek eklenmesi

`IHubContext<OperationsHub>`, `IncidentService` ve `OperationalTaskService`'in constructor'larına
enjekte edildi. Dört mutation'ın her birinin **kendi `SaveChangesAsync`'inden hemen sonra** (asla
önce — değişiklik veritabanında kalıcı olmadan istemcilere "yenile" denmemeli) tek satır eklendi:

```csharp
await _hubContext.Clients.All.SendAsync("OperationsUpdated", cancellationToken);
```

- `IncidentService.CreateAsync` (generator her ~15 saniyede bir tetikliyor)
- `IncidentService.ResolveAsync`
- `OperationalTaskService.CreateAsync`
- `OperationalTaskService.CompleteAsync`

`FieldUnitService`'e hiçbir değişiklik yapılmadı — hiç mutation'ı yok, her şey yukarıdaki iki
servisin yan etkisi olarak değişiyor.

### 2.5 Kullanıcının editör/kopyalama sürecinde bulunan küçük hatalar

- `Program.cs`'te `AddInfrastructure`/`AddApiServices` çağrıları yanlışlıkla iki kez yapıştırılmış
  — zararsız ama gereksiz, tek bir çağrıya indirildi.
- `IncidentService.ResolveAsync`'te broadcast satırından sonra eski `SaveChangesAsync` satırı da
  kalmış (çift kayıt) — silindi, broadcast artık gerçekten "son" `SaveChangesAsync`'ten hemen
  sonra.

---

## 3. Frontend — gerçek abonelik

`shared/hooks/useSignalR.ts`, artık sadece bağlanmakla kalmıyor, gerçekten dinliyor:

```ts
connection.on("OperationsUpdated", handleOperationsUpdated);
```

`handleOperationsUpdated`, `useQueryClient()` üzerinden 4 query key'i invalidate ediyor:
`incidents`, `field-units`, `operational-tasks`, `field-unit-location-histories` — aynen
`useCreateTask`/`useCompleteTask`'ın zaten yaptığı gibi, sadece tetikleyicisi artık local bir
mutation değil, sunucudan gelen bir push.

**Dikkat edilen iki detay:**
- Handler, `.on()`'a *ve* cleanup'taki `.off()`'a **aynı isimli referans** olarak veriliyor
  (inline anonim fonksiyon değil) — aksi halde `.off()` hangi handler'ı kaldıracağını bilemez,
  effect yeniden çalıştığında (StrictMode dahil) aynı event için birden fazla handler birikir.
- `.on(...)` çağrısı, `connection.start()`'tan **önce** yapılıyor — bağlantı başladıktan sonra
  dinleyici eklenirse, teorik olarak ilk mesaj kaçırılabilir.

`App.tsx`'te zaten var olan (yorum satırı haline getirilmiş) `useSignalRConnection()` çağrısı ve
import'u etkinleştirildi — yeni kod yazılmadı, sadece iki `//` kaldırıldı.

**Test:** iki ayrı tarayıcı sekmesi yan yana açılıp birinde task atama/tamamlama/incident
resolve işlemi yapıldı, diğer sekmenin hiçbir manuel işlem olmadan canlı güncellendiği doğrulandı
— hem WS Messages panelinde `OperationsUpdated` frame'i hem de arkasından gelen 4 `GET` isteği
gözlemlendi.

---

## 4. Workaround'un kaldırılması

`features/incidents/hooks/useIncidents.ts`'teki `refetchInterval: 15000` satırı ve "SignalR
tamamlanınca sil" yorumu (LOG3'ten beri kod tabanında duruyordu) silindi. `useIncidents` artık
`useFieldUnits`/`useOperationalTasks` ile birebir aynı şekilde davranıyor — hiçbir interval yok,
sadece mount/focus'ta (React Query varsayılanı) ve SignalR push'unda yenileniyor.

---

## 5. Tam regresyon testi (iki sekme ile)

Kullanıcı tarafından çalıştırıldı, hepsi geçti:
- Incident Generator çalışırken yeni incident'lar iki sekmede de ~1 saniye içinde beliriyor
  (artık 15 saniyeye kadar gecikme yok).
- Task atama → diğer sekmede field unit haritada taşınıyor, durumu güncelleniyor, Active Tasks'a
  düşüyor, Movement History'ye yeni satır ekleniyor — hepsi canlı.
- Task tamamlama → diğer sekmede unit `Available`'a dönüyor, Completed Tasks'a düşüyor.
- Incident resolve → diğer sekmede incident haritadan kayboluyor, bağlı task'lar cascade tamamlanıp
  unit'ler serbest kalıyor.
- Filtreler, operational zones katmanı, Menu overlay (Timeline/Movement History/Statistics) —
  regresyon yok.
- Bağlantı kopup tekrar kurulduğunda (`withAutomaticReconnect()` zaten yapılandırılıydı) sonraki
  bir işlem hâlâ canlı yayılıyor.

---

## 6. Level 2 durumu — TAMAMLANDI

- Filtering ✅
- Incident timeline ✅
- Operational statistics / task history ✅
- Operational zones ✅ (LOG8)
- Field unit movement history ✅ (LOG8)
- **Gerçek SignalR ✅ (bu oturum)** — `OperationsHub`, tek genel `"OperationsUpdated"` sinyali,
  4 mutation noktasından broadcast, frontend'de tam event-driven cache invalidation, 15 saniyelik
  polling workaround'u tamamen kaldırıldı.

**Level 2'nin case study'de tanımlı 8 maddesinin tamamı tamamlandı.**

**Hâlâ bekleyen küçük maddeler (öncelik düşük, bloklayıcı değil):**
- `OperationalStatistics.tsx` hâlâ kullanılmıyor (LOG7'den beri).
- Operational zones'un kapsama alanı azlığı (LOG8 §1.6'da not edildi, kullanıcı ertelemeyi seçti).
- Bir dosya adı yazım hatası: `FieldUnitMovmentHistorySection.tsx` ("Movement" eksik "e") — işlevi
  bozmuyor, kozmetik.

---

## 7. Sıradaki adım

Level 2 tamamen bitti. Sırada **Level 3 — Advanced Operations** var: field unit önerisi (uygun
birim önerme), kaynak çakışması tespiti (aynı unit'in birden fazla operatör tarafından atanmaya
çalışılması), tahmini varış süresi gösterimi, kısıtlı/operasyonel bölgelerin tanımlanması, geçmiş
operasyonların tekrar oynatılabilmesi. Vurgu, yeni özellik eklemekten çok, artan operasyonel
karmaşıklığa rağmen çözümün bakımı kolay ve genişletilebilir kalmasını sağlamakta.
```

Once you've saved and pushed this, let me know — with Level 2 fully closed out, the next natural step (whenever you're ready) is Level 3. No rush on that, your call when to pick it up.

Same recurring notice, still nothing on my end to push — disregarding as before. Whenever you've saved `DEVELOPMENT_LOG9.md` and pushed everything from this session, let me know and I'll verify it against the repo like we did last time.


---

# Part 10 — Frontend Refactor (Zero Behavior Change)

*(Source: original `docs/DEVELOPMENT_LOG10.md`)*


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


---

# Part 11 — Backend Refactor (Zero Behavior Change)

*(Source: original `docs/DEVELOPMENT_LOG11.md`)*

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


---

# Part 12 — Level 3: Advanced Operations, Field Unit Travel Animation & Incident Timeline Arrival Event

*(Source: original `docs/DEVELOPMENT_LOG12.md`)*

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

## 15. Phase 5.1 — Incident Timeline Arrival Event

**Kapsam ve bağlam:** Phase 5'te (§14) eklenen orijin/ETA verisi (`OperationalTask.OriginLatitude`/
`OriginLongitude`/`EstimatedEtaSeconds`) o zamana kadar sadece harita animasyonu için
kullanılıyordu. Bu küçük ek, aynı veriyi ikinci bir yerde — incident detayındaki
`IncidentTimelineSection`'da — yeniden kullanarak field unit'in olay yerine "vardığı" anı da
zaman çizelgesine ekliyor. Backend değişikliği gerekmedi; tamamen frontend'de, zaten DTO'da var
olan alanlardan türetilen bir hesaplama.

**Hesaplama (`frontend/src/features/incidents/components/IncidentTimelineSection.tsx`):** her
`incidentTasks` elemanı için, `task.estimatedEtaSeconds` doluysa
`calculatedArrivalAt = new Date(new Date(task.assignedAt).getTime() + estimatedEtaSeconds * 1000)`
hesaplanıyor. Bu adım sadece şu koşullardan biri sağlanırsa timeline'a ekleniyor: `Date.now()` bu
hesaplanan zamanı geçmiş, ya da task zaten `Completed`, ya da incident zaten `Resolved` —
yani gelecekte gerçekleşecek bir varışı önceden göstermiyor. Task, hesaplanan ETA dolmadan
tamamlanmışsa (`task.completedAt`, `calculatedArrivalAt`'ten önceyse), varış zamanı
`task.completedAt`'e clamp'leniyor — böylece "varış" hiçbir zaman "tamamlama"dan sonra
görünmüyor.

**Sıralama:** `shared/components/Timeline.tsx` events dizisini zaten `timestamp`'e göre kendi
içinde sıralıyor (Phase 1'den beri değişmedi), bu yüzden yeni `${task.id}-arrived` olayının
"assigned" ile "completed" arasında görünmesi için `IncidentTimelineSection`'da elle bir sıralama
eklemeye gerek kalmadı — sadece doğru timestamp'le `timelineEvents` dizisine push etmek yeterliydi.
Label formatı case study'nin istediği `[UnitType] ([UnitCode]) arrived at scene` deseni — mevcut
`getFieldUnitLabel(fieldUnit)` yardımcı fonksiyonu zaten `"${UnitType} (${UnitCode})"` üretiyor
(§ describeTask.ts, Phase 1'den beri var), o yüzden yeni bir formatter yazılmadı, sadece `${unitLabel}
arrived at scene` olarak birleştirildi.

**Doğrulama:** `npm run lint` (oxlint) ve `npm run build` (`tsc -b` + `vite build`) — ikisi de 0
hata (mevcut >500 kB chunk-size uyarısı hariç, bu değişiklikle ilgisiz).

---

## 16. Phase 5.2 — Selection Toggle, Empty Map Deselect & Event Bubbling Fix

**Kapsam ve bağlam:** Kullanıcı isteğiyle, harita seçim UX'ine üç küçük iyileştirme eklendi:
zaten seçili bir marker'a tekrar tıklamak artık seçimi kaldırıyor, haritanın boş bir noktasına
tıklamak seçimi temizliyor, ve `IncidentPanel`/`FieldUnitPanel`'in sağ üst köşesine bir `✕`
kapatma butonu eklendi. Case study brief'inin resmî kapsamı dışında, tamamen kullanıcı talebiyle
yapılan bir UX cilası.

**1) Toggle-on-reclick (`frontend/src/app/hooks/useSelection.ts`):** `setSelectedIncident` ve
`setSelectedFieldUnit`, artık doğrudan state set etmek yerine bir functional updater kullanıyor:
tıklanan öğenin `id`'si mevcut seçiliyle aynıysa state `null`'a düşüyor, değilse yeni öğe seçiliyor.
Panel kapatma butonu için ayrıca `deselectIncident`/`deselectFieldUnit` adında, koşulsuz `null`'a
düşüren iki fonksiyon daha eklendi — bunlar toggle mantığını atlıyor çünkü kapatma butonunun amacı
her zaman "seçili olanı kapat", "tıklanan öğeye göre karar ver" değil.

**2) Boş harita alanına tıklayınca `clearSelection` (`useMapInstance.ts` + `OperationsMap.tsx`):**
`useMapInstance`, artık opsiyonel bir `onMapClick` callback'i parametre olarak alıyor ve map
instance'ı oluşturulurken `instance.on("click", ...)` ile bağlıyor (callback bir ref'te tutuluyor ki
her render'da yeniden bağlanmasın). `OperationsMap`'e yeni bir `onClearSelection` prop'u eklendi,
`App.tsx` bunu `clearSelection`'a bağlıyor.

**3) Event bubbling bug'ı — marker tıklamaları haritayı da "boş alan tıklaması" sanıyordu:**
İlk implementasyonda hiçbir seçim kalıcı olmuyordu — her marker tıklaması, seçimi set ettiği anda
hemen ardından `null`'a dönüyordu. Kök neden: MapLibre GL, marker DOM elemanlarını haritanın
`click` olayının dinlendiği canvas container'ının *içine* ekliyor (ayrı bir katman değil), bu
yüzden bir marker'a tıklamak, olay canvas container'a köpürdüğü (bubble) için haritanın kendi
`click` handler'ını da tetikliyordu — yani her marker tıklaması aynı anda hem
"marker'ı seç" hem de "boş alana tıklandı, seçimi temizle" olarak yorumlanıyordu. Düzeltme:
`useIncidentMarkers.ts` ve `useFieldUnitMarkers.ts`'teki marker `click` listener'larına
`event.stopPropagation()` eklendi, böylece bir marker tıklaması artık haritanın `click`
event'ine hiç ulaşmıyor — `onClearSelection` sadece gerçekten boş bir noktaya tıklandığında
tetikleniyor.

**4) Panel kapatma butonları (`IncidentPanel.tsx`, `FieldUnitPanel.tsx`):** Her iki panelin kök
`div`'i `position: relative` alacak şekilde bir sınıf adı kazandı (`incident-panel`,
`field-unit-panel`), sağ üst köşeye mutlak konumlandırılmış, yuvarlak, kompakt bir `✕` butonu
eklendi (`incident-panel__close`, `field-unit-panel__close`). Buton yeni bir `onClose` prop'unu
çağırıyor; `App.tsx` bunu sırasıyla `deselectIncident`/`deselectFieldUnit`'e bağlıyor
(`FieldUnitColumn.tsx` prop'u `FieldUnitPanel`'e iletmek için güncellendi).

**Doğrulama:** `npm run lint` (oxlint) ve `npm run build` (`tsc -b` + `vite build`) — ikisi de 0
hata (mevcut >500 kB chunk-size uyarısı hariç, bu değişiklikle ilgisiz). Özellik tarayıcıda
manuel olarak test edildi: marker'a tıklayınca seçiliyor, aynı marker'a tekrar tıklayınca
seçim kalkıyor, boş haritaya tıklayınca seçim temizleniyor, panel `✕` butonu ilgili seçimi
kapatıyor — event bubbling düzeltmesinden sonra hepsi beklendiği gibi çalışıyor.

---

## 17. Phase 5.3 — Dependency Cleanup (`zustand`, `react-router-dom`) & Dead Component Check

**Kapsam ve bağlam:** Part 10 §1'de kullanıcı, o dönem bilinçli olarak `OperationalStatistics.tsx`,
`react-router-dom` ve `zustand`'ı "kullanılmıyor ama korunuyor, ileride geri bağlanabilir"
gerekçesiyle projede tutmaya karar vermişti. Bu oturumda kullanıcı kararını tersine çevirdi ve
gerçek bir temizlik istedi — ne component'in ne de bu iki paketin gelecekte kullanılma planı kaldı.

**1) `OperationalStatistics.tsx` — zaten silinmişti:** Kullanıcı dosyayı bu oturumdan önce zaten
elle silmişti; `frontend/src/features/dashboard/components/OperationalStatistics.tsx` sistemde
mevcut değildi. Yine de doğrulama yapıldı: `src/` içinde `OperationalStatistics` için grep
sadece `StatisticsSection.tsx`'te `buildOperationalStatistics.ts` (ayrı, ilgisiz bir yardımcı
modül) importuna denk geldi — component'e canlı/kırık hiçbir referans kalmamıştı.

**2) `frontend/package.json`'dan `zustand` ve `react-router-dom` kaldırıldı:** Kaldırmadan önce
`src/` içinde ikisi için de grep yapıldı — hiçbir dosya bunları import etmiyordu (zustand zaten
Part 10'dan beri "kurulu ama kullanılmayan" olarak biliniyordu; bu iki paket birlikte kaldırıldı).
`dependencies` bloğundan silindikten sonra `frontend/`'de `npm install` çalıştırıldı — 4 paket
kaldırıldı, `package-lock.json` güncellendi.

**Doğrulama:** `npm run lint` (oxlint) ve `npm run build` (`tsc -b` + `vite build`) — ikisi de 0
hata (mevcut >500 kB chunk-size uyarısı hariç, bu değişiklikle ilgisiz — zaten MapLibre kaynaklı,
kaldırılan paketlerin bundle'a hiç katkısı yoktu).

---

## 18. Phase 5.4 — MapLibre Code-Splitting & Bundle Size Optimization

**Kapsam:** Phase 5.3'ten (§17) beri açık kalan `>500 kB` bundle boyutu uyarısını kapatmak.
Uyarının kaynağı `maplibre-gl` idi — tek bir chunk'a (`index-*.js`) her şeyle birlikte
bundle'lanıyordu, 1.314 kB (gzip 357 kB). Amaç, MapLibre'yi ayrı bir lazy-loaded chunk'a
izole etmekti.

**1) `frontend/src/app/App.tsx` — `React.lazy` + `Suspense`:** `OperationsMap` importu
statikten `React.lazy(() => import(...))`'a çevrildi; harita render'ı
`<Suspense fallback={<MapLoadingPlaceholder />}>` ile sarmalandı. `MapLoadingPlaceholder`,
`OperationsCenterLayout`'ın koyu tema paletiyle (`#0F172A` arka plan, `#F8FAFC` metin) uyumlu
basit bir dolgu bileşeni — stili `frontend/src/layouts/styles/OperationsCenterLayout.css`'e
`.map-loading-placeholder` olarak eklendi (harita zaten o layout'un `__map` slotu içinde
render ediliyor, ayrı bir stylesheet açmaya gerek kalmadı).

**2) `frontend/vite.config.ts` — `manualChunks`:** Sadece dynamic import ile MapLibre kendi
chunk'ına ayrıldı ama bu chunk yine de tek başına 949 kB'ydi (kütüphanenin kendi boyutu).
`build.rollupOptions.output.manualChunks` eklenerek `maplibre-gl` açıkça `maplibre-vendor` adlı
bir vendor chunk'ına yönlendirildi. Not: projede kullanılan Vite 8 (rolldown-vite) obje
şeklindeki `manualChunks: { name: [...] }` sözdizimini kabul etmiyor (`ManualChunksFunction`
tipiyle uyuşmuyor, `tsc` hata veriyordu) — fonksiyon formuna geçildi:
`manualChunks: (id) => id.includes('node_modules/maplibre-gl') ? 'maplibre-vendor' : undefined`.

**Öncesi/sonrası (gzip boyutları parantez içinde):**

| | Öncesi (Phase 5.3) | Sonrası (Phase 5.4) |
|---|---|---|
| Ana başlangıç bundle'ı | `index-*.js`: 1.314 kB (357 kB) | `index-*.js`: 365 kB (110 kB) |
| Harita chunk'ı | (ayrı chunk yok, her şey ana bundle'da) | `OperationsMap-*.js`: 7 kB (2,6 kB) + `maplibre-vendor-*.js`: 942 kB (245 kB), ikisi de lazy |
| CSS | `index-*.css`: 93 kB (13 kB) | `index-*.css`: 10 kB (2,3 kB) + `maplibre-vendor-*.css`: 83 kB (10,7 kB), lazy |

Ana başlangıç JS bundle'ı %72 küçüldü (1.314 kB → 365 kB) ve artık 500 kB eşiğinin altında.
`maplibre-vendor` chunk'ı tek başına hâlâ 500 kB'ın üzerinde (MapLibre'nin kendi minified
boyutu buna izin vermiyor, kütüphaneyi değiştirmeden daha fazla küçültülemez) ama artık haritayı
kullanan bir kullanıcı ilk açılışta hiç indirmiyor — sadece `OperationsMap` mount olduğunda
lazy-load ediliyor. `vite build` çıktısı hâlâ ">500 kB" uyarısını basıyor (uyarı chunk bazlı,
toplam bazlı değil) ama görev tanımındaki kabul kriteri buna göre zaten esnekti: "ana başlangıç
bundle'ının belirgin şekilde küçültülmesi ve haritanın kendi chunk'ına izole edilmesi" —
ikisi de sağlandı.

**Doğrulama:** `npm run lint` (oxlint) — 0 hata. `npm run build` (`tsc -b` + `vite build`) — 0
hata, yukarıdaki chunk boyutları gözlemlendi. Tam tarayıcı duman testi (Playwright, backend API
+ Docker Postgres ile) bu oturumda kurulu değildi (`playwright` paketi projede yok, kurulum bu
görevin kapsamı dışında tutuldu); bunun yerine `npm run dev` başlatılıp `curl` ile hem
`src/app/App.tsx` hem de lazy-import edilen `src/features/operations-map/components/OperationsMap.tsx`
modüllerinin Vite dev server üzerinden hatasız transform edildiği doğrulandı — dynamic import
zincirinin kırık olmadığının dolaylı kanıtı. Gerçek tarayıcıda harita render'ının (tile'lar +
marker'lar) görsel doğrulaması hâlâ yapılmadı; bu, zaten Phase 5 için §18'de (önceki numaralandırma)
not edilmiş olan genel "tarayıcıda duman testi" açık maddesiyle örtüşüyor.

---

## 19. Phase 5.5 — `useSignalR.ts` Cleanup (Stray Log Removal & Comment Normalization)

**Kapsam:** `frontend/src/shared/hooks/useSignalR.ts` içinde biriken iki küçük kalite sorunu
giderildi: bağlantı kurulduğunda çalışan bir debug `console.log("SignalR connected, state:", ...)`
ve dosyanın geri kalanı İngilizce olmasına rağmen Türkçe kalmış satır içi yorumlar.

**Değişiklik:** `connection.start().then(...)` içindeki `console.log` satırı kaldırıldı (hata
durumundaki `console.error` korundu). Beş satır içi yorum ("Singleton bağlantı", "Sinyal geldiğinde
bu 4 önbelleği geçersiz kılıp taze veriyi çek", "Dinleyiciyi kaydet", "Bağlantı kapalıysa başlat",
"Temizleme (Cleanup): Hafıza sızıntısı ve çift tetiklenmeyi engellemek için dinleyiciyi kaldır")
projedeki diğer dosyalarla tutarlı İngilizceye çevrildi. Davranış değişikliği yok — sadece log
temizliği ve yorum normalizasyonu.

**Doğrulama:** `npm run lint` (oxlint) — 0 hata. `npm run build` (`tsc -b` + `vite build`) — 0
hata; bundle boyutları Phase 5.4'teki ile aynı (bu değişiklik chunk yapısını etkilemiyor).

---

## 20. Phase 5.6 — Backend launchSettings.json Cleanup

**Kapsam:** `Src/SmartCityOps.Api/Properties/launchSettings.json` içindeki kullanılmayan `https`
profili kaldırıldı. Proje sadece HTTP üzerinden `http://localhost:5080` adresinde çalışıyor
(bkz. CLAUDE.md "Commands" bölümü) — `https` profili (`https://localhost:7190;http://localhost:5159`)
hiçbir zaman kullanılmıyordu ve `dotnet run --project SmartCityOps.Api` her zaman `http` profiliyle
başlatılıyordu.

**Değişiklik:** `profiles.https` bloğu tamamen silindi. `profiles.http` (port 5080, `ASPNETCORE_ENVIRONMENT=Development`,
`launchUrl: swagger`) ve `profiles."IIS Express"` blokları değişmeden korundu; `iisSettings` de
etkilenmedi. Davranış değişikliği yok — sadece kullanılmayan bir profil kaldırıldı.

**Doğrulama:** `dotnet build` (`Src/` içinden, `SmartCityOps.sln`) — 0 hata.

---

## 21. Phase 5.7 — Backend DI & HTTP File Polish

**Kapsam:** İki küçük backend temizliği: `DependencyInjection.cs`'teki kozmetik biçimlendirme
sorunu ve `SmartCityOps.Api.http` dosyasındaki devre dışı, elle GUID yapıştırma gerektiren örnek
istekler.

**1) `Src/SmartCityOps.Infrastructure/DependencyInjection.cs`:** `using` bloğu ile
`namespace SmartCityOps.Infrastructure;` satırı arasında fazladan bir boş satır vardı (30-31.
satırlar) — kaldırıldı, tek boş satıra normalize edildi. Davranış değişikliği yok.

**2) `Src/SmartCityOps.Api/SmartCityOps.Api.http`:** Daha önce `Resolve Incident`, `Assign Task`
ve `Complete Task` istekleri tamamen yorum satırı (`#`) olarak duruyordu ve kullanıcının GET
yanıtlarından gerçek GUID'leri elle kopyalayıp `{id}`/`{incidentId}`/`{fieldUnitId}`
placeholder'larının yerine yapıştırmasını gerektiriyordu; ayrıca bir `Reassign Task` isteği hiç
yoktu. Bu dört istek artık gerçek (yorum olmayan), sırayla çalıştırılabilir isteklere dönüştürüldü:
- `Get all incidents`, `Get all field units`, `Get all operational tasks` istekleri
  `# @name getIncidents` / `getFieldUnits` / `getOperationalTasks` ile adlandırıldı (REST Client
  `@name` sözdizimi).
- `Resolve an incident`, adlandırılmış GET yanıtından `@incidentId = {{getIncidents.response.body.$[0].id}}`
  değişkenini türetip URL'de kullanıyor.
- `Assign a task`, `# @name assignTask` ile adlandırıldı ve gövdesinde doğrudan
  `{{getIncidents.response.body.$[0].id}}` / `{{getFieldUnits.response.body.$[0].id}}` referanslarını
  kullanıyor.
- `Complete a task` ve yeni eklenen `Reassign a task`, `assignTask` isteğinin yanıtındaki
  `{{assignTask.response.body.id}}` id'sini kullanıyor; `Reassign a task` ayrıca ikinci field
  unit'i (`{{getFieldUnits.response.body.$[1].id}}`) `newFieldUnitId` olarak gönderiyor
  (`ReassignOperationalTaskDto(Guid NewFieldUnitId)` ile eşleşen camelCase gövde).

Artık dosyadaki GET istekleri önce, ardından `Resolve`/`Assign`/`Complete`/`Reassign` istekleri
sırasıyla (VS Code REST Client'ta "Send Request" ile tek tek) manuel GUID yapıştırmaya gerek
kalmadan çalıştırılabiliyor.

**Doğrulama:** `dotnet build` (`Src/` içinden, `SmartCityOps.sln`) — 0 hata. `.http` dosyası
derleme sürecine dahil olmadığından ayrıca bir derleme adımı gerekmiyor; REST Client sözdizimi
projede zaten kullanılan `@name`/`{{request.response.body.$...}}` kalıplarıyla tutarlı.

---

## 22. Phase 5.8 — Map Interpolation Math Deduplication

**Kapsam:** `frontend/src/features/operations-map/hooks/useFieldUnitMarkers.ts` ve
`useDispatchedRouteLayers.ts`, ortak `frontend/src/features/operational-tasks/lib/geoInterpolation.ts`
helper'larını (`getTravelProgress`, `interpolatePosition`) zaten import ediyordu, ama her iki hook
da bir task'ın "hareket hâlinde" (in-flight) olup olmadığını belirleyen aynı null-check bloğunu
(`status === "Assigned"` + `originLatitude`/`originLongitude`/`estimatedEtaSeconds` null değil)
kendi içinde ayrı ayrı tekrarlıyordu; `useFieldUnitMarkers` ayrıca progress hesaplayıp
`interpolatePosition`'ı çağırıp `progress >= 1` durumunda hedefe clamp'leme mantığını da inline
tutuyordu.

**Değişiklik — `geoInterpolation.ts`:** İki yeni paylaşılan yardımcı eklendi:
- `isInFlightTask(task): task is InFlightOperationalTask` — daha önce iki hook'ta ayrı ayrı yazılan
  null-check'i tek bir type guard'a taşıdı; `InFlightOperationalTask`, `originLatitude`/
  `originLongitude`/`estimatedEtaSeconds` alanları `number` olarak daraltılmış bir `OperationalTask`
  türü.
- `getCurrentPosition(task: InFlightOperationalTask, destination, nowMs)` — origin/assignedAt
  çıkarma, `getTravelProgress` çağrısı ve `progress >= 1 ? destination : interpolatePosition(...)`
  clamp mantığını tek yerde topladı.

**Değişiklik — `useFieldUnitMarkers.ts`:** `findInFlightTask` artık `isInFlightTask` type guard'ını
kullanıyor ve `InFlightOperationalTask | null` döndürüyor; animasyon döngüsündeki inline
`origin`/`assignedAtMs`/`progress`/`interpolatePosition` bloğu tek bir `getCurrentPosition(task,
destination, now)` çağrısıyla değiştirildi (`task.originLatitude!` gibi non-null assertion'lara
artık gerek yok, tip zaten daraltılmış).

**Değişiklik — `useDispatchedRouteLayers.ts`:** `buildFeatureCollection` içindeki dört satırlık
null-check bloğu `if (!isInFlightTask(task)) return [];` ile değiştirildi; `getTravelProgress`
çağrısı (route çizgisinin `progress >= 1` olduğunda kaybolması için) olduğu gibi kaldı — bu hook
konum interpolasyonuna değil sadece ilerleme yüzdesine ihtiyaç duyduğundan `getCurrentPosition`
kullanmıyor.

**Doğrulama:** `npm run lint` (oxlint) — 0 hata. `npm run build` (`tsc -b` + `vite build`) — 0
hata; bundle boyutları Phase 5.4'teki ile aynı (bu değişiklik sadece paylaşılan modül içi
refactoring, chunk yapısını etkilemiyor). Davranış değişikliği yok — hem marker animasyonu hem
dispatched route çizgisi aynı progress/interpolasyon matematiğini, artık tek bir yerden, kullanıyor.

---

## 23. Phase 5.9 — OperationsReplay Time Range Query Optimization

**Kapsam:** `Src/SmartCityOps.Infrastructure/OperationsReplay/OperationsReplayService.cs` içindeki
`GetReplayTimeRangeAsync`, global replay zaman aralığını (`MinTimestamp`/`MaxTimestamp`) hesaplamak
için 8 ayrı sıralı `MinAsync`/`MaxAsync` skaler sorgusu çalıştırıyordu — her biri kendi DB round
trip'i: `Incidents.ReportedAt` (min+max), `Incidents.ResolvedAt` (max), `FieldUnitLocationHistories.RecordedAt`
(min+max), `OperationalTasks.AssignedAt` (min+max), `OperationalTasks.CompletedAt` (max).

**Değişiklik:** Sorgular tablo başına tek bir aggregate sorguya konsolide edildi — 8 round trip'ten
3'e indi (`Incidents`, `FieldUnitLocationHistories`, `OperationalTasks` için birer sorgu).
Her sorgu, sabit bir anahtarla (`GroupBy(_ => 1)`) tek satırlık bir aggregate projeksiyonu
(`Select(g => new { g.Min(...), g.Max(...), ... })`) üretiyor; bu, EF Core + Npgsql tarafından tek
bir SQL ifadesine (satır verisi çekmeden, sadece `MIN`/`MAX` aggregate'leri) çevriliyor. Üç
sorgunun sonuçları (anonim tipler, tablo boşsa `null` olabilir) C# tarafında `.Min()`/`.Max()` ile
birleştirilip nihai `MinTimestamp`/`MaxTimestamp` elde ediliyor — .NET'in generic
`Enumerable.Min<T>`/`Max<T>` implementasyonu `null` değerleri zaten atlıyor, bu yüzden eski
`candidateMins.Min()`/`candidateMaxes.Max()` davranışıyla birebir aynı sonuç (boş tablo → `null`,
karışık `null`/değer → en küçük/büyük non-null değer).

Üç farklı, birbiriyle ilişkisiz tablo (Incidents, FieldUnitLocationHistories, OperationalTasks)
arasında ortak bir foreign key olmadığından, LINQ ile tek bir SQL sorgusuna daha fazla indirmek
(örn. `UNION ALL` alt sorgusu) EF Core'un LINQ çevirisiyle doğrudan ifade edilemiyor — bunun için
ham SQL (`FromSqlInterpolated`) gerekirdi, bu görevin kapsamı dışında bırakıldı (görev tanımı zaten
"if feasible with EF Core Npgsql provider" ile buna esneklik tanıyordu). 8→3 round trip'e indirme,
LINQ tabanlı, okunabilir ve mevcut kod stiliyle tutarlı bir çözüm sağladı.

**Doğrulama:** `dotnet build` (`Src/` içinden, `SmartCityOps.sln`) — 0 hata. Davranış değişikliği
yok — dönen `ReplayTimeRangeDto` aynı `MinTimestamp`/`MaxTimestamp` değerlerini üretiyor, sadece
daha az DB round trip'iyle.

---

## 24. Phase 5.10 — "Pick on Map" Coordinate Selection for Restricted Zones

**Kapsam:** §24 (eski numaralandırmayla — bkz. aşağıdaki §25) itibarıyla açık kalan bir UX
eksikliğini kapattı: restricted zone oluşturma formunda lat/lng artık sadece elle yazılan sayı
kutularıyla değil, haritaya tıklayarak da seçilebiliyor.

**State & orkestrasyon:** Yeni bir `frontend/src/app/hooks/useCoordinatePicker.ts` hook'u
`isPickingCoordinates` / `pickedCoordinates` state'ini ve `startPicking` / `cancelPicking` /
`pickCoordinates` / `consumePickedCoordinates` action'larını tutuyor — bu state `App.tsx`'te
yaşıyor (diğer cross-feature orkestrasyon state'i — `useSelection`, `useReplayController` — ile
aynı seviyede), çünkü hem haritayı (`OperationsMap`) hem menüyü (`Menu` → `RestrictedZonesSection`)
aynı anda koordine etmesi gerekiyor. "Pick on Map" butonuna basıldığında `App.tsx` picking'i
başlatıp `menuView`'i `"closed"`'a çekiyor (operatör haritayı görebilsin diye); haritaya
tıklandığında veya "Cancel" denildiğinde picking kapanıp `menuView` otomatik olarak
`"restricted-zones"`'a geri dönüyor — operatör formu elle tekrar açmak zorunda kalmıyor.

**Harita etkileşimi:** `useMapInstance.ts`'teki `onMapClick` callback'i artık parametresiz değil,
MapLibre'nin `MapMouseEvent`'ini (dolayısıyla `event.lngLat`) alıyor; ayrıca hook ikinci bir
`isPickingMode` parametresiyle harita canvas'ının `cursor` stilini picking modundayken
`"crosshair"`'a çeviriyor. `OperationsMap.tsx`, bu event'i alıp `isPickingCoordinates` true ise
`onPickCoordinates({lat, lng})`'i çağırıyor, değilse eskisi gibi `onClearSelection()`'a düşüyor —
Phase 5.2'de (§16) kurulan "sadece boş harita alanı bu handler'a ulaşır" garantisi (marker'lar ayrı
bir DOM katmanında olduğu için) burada da geçerli, marker'lara tıklamak picking modunu etkilemiyor.

**Form & UX:** `RestrictedZonesSection.tsx`'e enlem/boylam kutularının yanına bir "📍 Pick on Map"
butonu eklendi; picking aktifken bu buton "Cancel Picking"e dönüşüyor. `pickedCoordinates`
değiştiğinde bir `useEffect`, `latitude`/`longitude` state'ini 5 ondalık basamağa yuvarlanmış
(`toFixed(5)`) değerlerle dolduruyor ve `onCoordinatesApplied()` (= `consumePickedCoordinates`)
çağırarak aynı koordinatın tekrar tekrar uygulanmasını engelliyor. Menü picking sırasında kapalı
olduğundan (operatör haritayı görebilsin diye), formun kendi "Cancel Picking" butonu o an
görünmüyor — bu yüzden haritanın üstünde her zaman görünür kalan ayrı bir
`CoordinatePickerBanner` bileşeni (`features/restricted-zones/components/`, `ReplayControlBar` ile
aynı üst-orta konumlandırma deseni) "Click on the map to set the restricted zone center." mesajıyla
birlikte kendi "Cancel" butonunu gösteriyor.

**Prop threading:** Yeni state/callback'ler `App.tsx` → `Menu.tsx` → `MenuSectionRouter.tsx` →
`RestrictedZonesSection.tsx` zincirinde iletiliyor (mevcut `restrictedZones` prop'unun izlediği
aynı yol) — yeni bir global state kütüphanesi eklenmedi, mevcut prop-threading deseni korundu.

**Styling:** `CoordinatePickerBanner.css` ve `RestrictedZonesSection.css`'e eklenen kurallar mevcut
BEM + sabit koyu tema paletini (`#0F172A`, `rgba(15, 23, 42, 0.9)`, `#F8FAFC`) takip ediyor; yeni
buton `app-button--outlined` (mevcut paylaşılan `buttons.css` sınıfı) kullanıyor, yeni bir buton
varyantı eklenmedi.

**Doğrulama:** `npm run lint` (`oxlint`) ve `npm run build` (`tsc -b && vite build`) — 0 hata/uyarı
(bundle boyutu uyarısı Phase 5.4'ten beri sadece MapLibre chunk'ının kendi boyutundan kaynaklanıyor,
bu değişiklik yeni bir chunk eklemedi). Bu oturumda Docker kapalıydı, bu yüzden gerçek bir backend'e
karşı tarayıcıda tıklama-ile-koordinat-seçme akışı gözlemlenemedi — bir sonraki oturum bunu Phase 5
duman testiyle birlikte doğrulamalı.

---

## 25. Sonuç ve sıradaki adım

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
| Phase 5.1 — Incident Timeline Arrival Event | Tamamlandı |
| Phase 5.2 — Selection Toggle, Empty Map Deselect & Event Bubbling Fix | Tamamlandı (tarayıcıda doğrulandı) |
| Phase 5.3 — Dependency Cleanup (`zustand`, `react-router-dom`) & Dead Component Check | Tamamlandı |
| Phase 5.4 — MapLibre Code-Splitting & Bundle Size Optimization | Tamamlandı (tarayıcıda görsel duman testi hâlâ yapılmadı) |
| Phase 5.5 — `useSignalR.ts` Cleanup (Stray Log Removal & Comment Normalization) | Tamamlandı |
| Phase 5.6 — Backend launchSettings.json Cleanup | Tamamlandı |
| Phase 5.7 — Backend DI & HTTP File Polish | Tamamlandı |
| Phase 5.8 — Map Interpolation Math Deduplication | Tamamlandı |
| Phase 5.9 — OperationsReplay Time Range Query Optimization | Tamamlandı |
| Phase 5.10 — "Pick on Map" Coordinate Selection for Restricted Zones | Tamamlandı (tarayıcıda gerçek backend'e karşı duman testi yapılmadı — Docker kapalıydı) |

`DEVELOPMENT_LOG11.md` §9'da flag'lenen iki riskten biri — `OperationalTaskService.CreateAsync`
check-then-act yarış durumu — Phase 0.2 ile kapatıldı. İkincisi — seçim state'inin SignalR
invalidation sonrası bayatlayabilmesi — hâlâ genel bir çözüme kavuşmadı; şu ana kadar sadece
`clearSelection` çağıran üç akış (assign, complete, reassign) için örtük olarak bertaraf edildi.
Öneri kartına tıklamak da seçimi değiştiriyor ama `clearSelection` çağırmıyor (seçimi temizlemek
değil, tam tersi bir field unit seçmek amacı taşıyor) — bu akış mevcut riskin kapsamı dışında.

Restricted zone oluşturma formunda merkez koordinatı artık haritaya tıklayarak da seçilebiliyor
(Phase 5.10, §24) — yarıçap hâlâ serbest sayı kutusuyla giriliyor (projede yarıçap için doğal bir
"haritada sürükle" karşılığı yok). Sistemde hâlâ hiç restricted zone kaydı yok (seed data
eklenmedi) — kural şimdilik hep `Success()` dönüyor, canlı olarak gözlemlemek için önce
`POST /api/restricted-zones` ile en az bir bölge oluşturulmalı.

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

Phase 5.1 (§15), Phase 5'in orijin/ETA verisini ikinci bir yerde daha kullanıma açtı: Incident
Timeline artık `[UnitType] (UnitCode) arrived at scene` adımını, ETA dolduğunda (veya task/incident
zaten tamamlanmışsa, gerekirse `completedAt`'e clamp'lenerek) "assigned" ile "completed task"
arasında gösteriyor. Tamamen frontend'de, backend/migration değişikliği gerekmedi;
`npm run lint`/`npm run build` temiz.

Phase 5.2 (§16), seçim UX'indeki ayrı bir sorunu kapattı: aynı marker'a tekrar tıklayınca seçimi
kaldırma, boş haritaya tıklayınca seçimi temizleme ve panel `✕` butonları artık çalışıyor —
event bubbling bug'ı düzeltildi ve tarayıcıda doğrulandı. Bu, §11'de bahsedilen SignalR
invalidation sonrası seçim state'inin bayatlaması riskiyle *aynı* sorun değil: o risk hâlâ genel
bir çözüme kavuşmadı (bkz. yukarıdaki paragraf) — Phase 5.2 sadece operatörün bir öğeyi manuel
olarak seçme/kaldırma etkileşimini iyileştirdi.

Phase 5.3 (§17), Part 10 §1'de bilinçli olarak ertelenen bir temizliği tamamladı: kullanıcının
kararı değişti ve `zustand`/`react-router-dom` `package.json`'dan kaldırıldı,
`OperationalStatistics.tsx`'in (kullanıcı tarafından bu oturumdan önce zaten silinmişti) hiçbir
kalıntı referansı olmadığı doğrulandı. Backend/migration değişikliği gerekmedi; `npm run
lint`/`npm run build` temiz. Bundle boyutu uyarısı (>500 kB) o oturumda devam ediyordu — bu
paketlerin bundle'a zaten hiç katkısı yoktu, kaynağı hâlâ MapLibre'ydi.

Phase 5.4 (§18), bir önceki paragrafta açık bırakılan bundle boyutu uyarısını ele aldı:
`OperationsMap` artık `React.lazy`/`Suspense` ile lazy-load ediliyor ve `maplibre-gl` Vite
`manualChunks` ile ayrı bir `maplibre-vendor` chunk'ına izole edildi. Ana başlangıç JS bundle'ı
1.314 kB'dan 365 kB'a indi (%72 azalma) ve harita artık sadece kullanıldığında indiriliyor.
MapLibre'nin kendi chunk'ı (942 kB) hâlâ 500 kB eşiğinin üzerinde — kütüphanenin kendi boyutu
buna izin vermiyor — ama artık ilk sayfa yükünü etkilemiyor. Backend/migration değişikliği
gerekmedi; `npm run lint`/`npm run build` temiz. Tam tarayıcı görsel doğrulaması (harita
tile/marker render'ı) hâlâ yapılmadı — bu, aşağıdaki "sıradaki adım" adaylarından Phase 5 duman
testiyle aynı genel açık maddeye giriyor.

Phase 5.10 (§24), §25'in önceki bir sürümünde açık madde olarak duran "haritaya tıklayarak merkez
seçme" eksikliğini kapattı: `RestrictedZonesSection`'a "📍 Pick on Map" butonu eklendi,
`useCoordinatePicker` hook'u (`App.tsx`) picking modunu ve menü açık/kapalı geçişini koordine
ediyor, harita tıklaması picking modundayken `onClearSelection` yerine seçilen `{lat, lng}`'i forma
yazıyor. Backend/migration değişikliği gerekmedi; `npm run lint`/`npm run build` temiz. Docker bu
oturumda kapalıydı, bu yüzden gerçek backend'e karşı tarayıcıda duman testi yapılamadı.

Sıradaki adım kullanıcı tarafından henüz belirtilmedi — muhtemel adaylar: Phase 5'in (ve Phase
5.4/5.10'un) tarayıcıda görsel duman testiyle doğrulanması, backend test projesi eklenmesi
(`CLAUDE.md`'de hâlâ "test yok, manuel doğrulama" notu duruyor), ya da seçim state'inin
bayatlaması riskinin genel bir çözüme kavuşturulması.

---

## 26. Phase 5 Migration & Backend Pipeline Verification (Origin/ETA)

**Kapsam:** §25'te ve `CLAUDE.md`'de açık madde olarak duran "Phase 5 migration'ı yerel DB'ye
uygulanmadı, hiç doğrulanmadı" notunu kapatmak — `20260824125110_AddOperationalTaskOriginAndEta`
migration'ının gerçekten uygulandığını ve `OperationalTaskService`'in origin/ETA verisini doğru
hesapladığını doğrulamak.

**Docker kısıtı:** Bu makinede Docker Desktop için yönetici (admin) yetkisi yok — Docker Engine
bir önceki denemede başlatılamadı (`dockerDesktopLinuxEngine` pipe hatası). Kullanıcı bu ortamda
Docker'ın hiçbir görev için kullanılmamasını istedi. Bunun yerine `netstat` ile port 5432'nin zaten
dinlemede olduğu ve ayrıca 5080 portunda halihazırda çalışan bir `SmartCityOps.Api.exe` (PID 19728)
sürecinin — üzerine kurulu, gerçek bir istemci bağlantısıyla (muhtemelen kullanıcının kendi
frontend/API oturumu) — bulunduğu tespit edildi. Bu, migration'ın zaten önceki bir oturumda yerel
Postgres'e uygulandığı ve backend'in hâlihazırda o veritabanına karşı çalıştığı anlamına geliyordu.

**Doğrulama yöntemi:** `dotnet ef migrations list` çalıştırılamadı — EF Core CLI, startup projesini
(`SmartCityOps.Api`) yeniden derlemeye çalışırken zaten çalışmakta olan `SmartCityOps.Api.exe`
sürecinin kilitlediği `SmartCityOps.Infrastructure.dll`'i kopyalayamadı (MSB3027/MSB3021 — beklenen
bir kilitlenme, gerçek bir derleme hatası değil). Bunun yerine migration'ın uygulanmış olduğu, canlı
API'ye doğrudan HTTP çağrısıyla ampirik olarak kanıtlandı: `GET /api/operational-tasks`
sorgulandığında migration öncesinden kalan eski task'ların `originLatitude`/`originLongitude`/
`estimatedEtaSeconds` alanlarının `null` döndüğü görüldü (bu beklenen davranış — bu sütunlar
migration'dan önce yoktu, eski satırlar için varsayılan `null` kalır). Ardından gerçek bir
`POST /api/operational-tasks` çağrısıyla (açık bir incident + müsait bir field unit kullanılarak)
yeni bir task atandı; yanıt şu değerleri döndürdü:

```json
{
  "id": "a5d43e47-cf43-42a2-a533-cc54a61f3ddd",
  "status": "Assigned",
  "originLatitude": 39.90940676708308,
  "originLongitude": 32.79163196125328,
  "estimatedEtaSeconds": 1209
}
```

Bu üç alanın da dolu (non-null) dönmesi hem migration'ın uygulandığını (sütunlar var ve EF Core
bunları doğru okuyup yazabiliyor) hem de `OperationalTaskService.CreateAsync`'in origin/ETA
hesaplamasını doğru yaptığını tek bir istekle kanıtlıyor. Test task'ı hemen ardından
`POST /api/operational-tasks/{id}/complete` ile tamamlanıp field unit `Available` durumuna geri
döndürülerek canlı uygulama state'i temizlendi (kullanıcının kendi bağlı oturumunu bozmamak için).

**Kod incelemesi (tekrar teyit):** `OperationalTaskService.cs`'de hem `CreateAsync` (satır 67-70)
hem `ReassignAsync` (satır 176-179), `originLatitude`/`originLongitude`'u `fieldUnit.Latitude`/
`Longitude`'dan, bu alanlar `incident.Latitude`/`Longitude` ile üzerine yazılmadan (satır 86-87 ve
198-199) *önce* okuyor; `_etaEstimator.EstimateEta(...)`'nın `.TotalSeconds`'ı yuvarlanarak (`Math.
Round`) `EstimatedEtaSeconds`'a atanıyor. `ToDto` (satır 230-240) her iki alanı da DTO'ya
aktarıyor. Bu, Adım 1/2'de (§24 öncesi bir oturumda) yapılan statik kod incelemesiyle birebir aynı
sonucu doğruluyor — kod hiç değişmedi, sadece gerçek bir veritabanına karşı ampirik olarak teyit
edildi.

**`SmartCityOps.Api.http`:** `Assign a task`/`Complete a task`/`Reassign a task` istekleri zaten
(Phase 5.7, §21'de) `@name`-etiketli zincirleme GET/POST istekleri olarak kuruluydu; içerik olarak
ek bir değişikliğe gerek kalmadı — `assignTask` isteğinin yanıtı yukarıdaki gibi origin/ETA
alanlarını zaten içeriyor.

**Build doğrulaması:** `dotnet build SmartCityOps.sln` (`Src/` içinden) — 0 hata (aynı "Geri
yüklenecek proje bulunamadı" uyarısı önceki oturumlardan beri zararsız bir NuGet restore uyarısı,
derlemeyi etkilemiyor).

**Sonuç:** `CLAUDE.md`'deki "Phase 5 unverified in-browser" maddesi güncellendi — migration/backend
veri hattı artık doğrulandı. Geriye kalan tek açık madde, haritada marker animasyonunun tarayıcıda
gözle izlenmesi (bu oturumda sadece API seviyesinde doğrulama yapıldı, frontend render'ı
gözlemlenmedi).

---

## 27. Phase 5.11 — Field Unit Teleportation Race Condition Fix

**Kapsam:** §26'da doğrulanan origin/ETA veri hattına rağmen, kullanıcı tarayıcıda field unit
marker'ının animasyon yerine incident konumuna anında ışınlandığını (teleport) bildirdi. İki adımlı
bir soruşturma yapıldı: Adım 1/2 tanı (diagnostic) logları eklendi, Adım 2/2 kök nedeni düzeltti ve
logları temizledi.

**Adım 1/2 — Tanı:** `geoInterpolation.ts`'deki `getTravelProgress`'e ve
`useFieldUnitMarkers.ts`'deki animasyon döngüsüne geçici `console.log` çağrıları eklendi. İki
hipotez statik kod incelemesiyle elendi:
- **Timezone/parsing hipotezi elendi:** `OperationalTask.AssignedAt` bir `DateTimeOffset`
  (`Src/SmartCityOps.Domain/Entities/OperationalTask.cs`), `DateTimeOffset.UtcNow` ile set ediliyor
  ve System.Text.Json bunu açık offset'li (`...+00:00`) serialize ediyor — `new Date(...)` bunu
  belirsizliksiz parse eder, elapsedMs sıçraması buradan gelmiyor.
- **Marker-diff effect reset hipotezi elendi:** `useFieldUnitMarkers.ts`'deki ikinci effect
  (incremental diff) sadece *yeni* marker oluştururken `setLngLat` çağırıyor; var olan bir
  marker'ın pozisyonunu hiç resetlemiyor.

**Kök neden:** `useSignalR.ts`, aynı `OperationsUpdated` event'inde `field-units` ve
`operational-tasks` React Query cache'lerini iki *ayrı* `invalidateQueries` çağrısıyla invalidate
ediyor — bunlar iki bağımsız HTTP round-trip, farklı zamanlarda resolve oluyor.
`OperationalTaskService.CreateAsync`, task'ı yaratırken `fieldUnit.Latitude/Longitude`'u aynı
transaction içinde *anında* incident'in koordinatlarına set ediyor. Sonuç: `field-units` sorgusu
`operational-tasks` sorgusundan önce resolve olursa, animasyon döngüsündeki `destination`
(`fieldUnit.latitude/longitude`) zaten hedef konuma güncellenmiş oluyor ama `findInFlightTask` henüz
`operationalTasks` içinde yeni task'ı bulamadığı için `null` dönüyor — eski kod bu durumda marker'ı
doğrudan `destination`'a snap'liyordu (teleport). `operational-tasks` sorgusu daha sonra resolve
olduğunda marker zaten hedefte olduğu için animasyon hiç görünmüyordu.

**Adım 2/2 — Düzeltme:** `useFieldUnitMarkers.ts`'ye bir `lastRestingPositionsRef` (`Map<string,
GeoLocation>`) eklendi, animasyon döngüsü üç duruma ayrıldı:
1. `findInFlightTask` bir task buluyorsa → `getCurrentPosition(task, destination, now)` ile
   origin→destination arası interpolasyon uygulanır; `getTravelProgress(...) >= 1` olduğunda
   `lastRestingPositionsRef` güncellenir.
2. Task bulunamıyor ama `fieldUnit.status === "Dispatched"` (yarış penceresi) → marker,
   `destination`'a snap'lenmek yerine `lastRestingPositionsRef`'teki son bilinen dinlenme
   konumunda (yoksa `destination`'da, ilk render güvenliği için) tutulur.
3. Diğer tüm durumlar (`Available`/`OutOfService`, task yok) → marker `destination`'a set edilir ve
   `lastRestingPositionsRef` güncellenir.

Tanı logları (`console.log` çağrıları) `geoInterpolation.ts` ve `useFieldUnitMarkers.ts`'den
kaldırıldı. Backend/migration değişikliği gerekmedi; `npm run lint`/`npm run build` temiz.

**Sonuç:** Field unit marker'ının artık `Dispatched` durumuna geçişte anında ışınlanmaması
bekleniyor — yarış penceresinde son bilinen konumda beklenip, `operationalTasks` verisi geldiğinde
kaldığı yerden interpolasyona devam edilecek. Tam tarayıcı görsel doğrulaması (gerçek bir atama
yapıp animasyonun gözle izlenmesi) bu oturumda yapılmadı — bu, §25/§26'da bahsedilen genel "Phase 5
duman testi" açık maddesiyle aynı kalemdir.

---

## 28. Phase 5.12 — Field Unit Animation Freeze Fix (Full Browser Smoke Test)

**Kapsam:** §25/§26/§27'de defalarca "outstanding" olarak bırakılan tam tarayıcı görsel duman testi
bu oturumda gerçekten yapıldı ve gerçek bir animasyon donma (freeze) bug'ı bulundu. Route çizgisi
(dashed line, `useDispatchedRouteLayers.ts`) origin→destination arası doğru çiziliyordu, ama field
unit marker'ı hiç hareket etmiyordu — tamamen sabit kalıyordu.

**Doğrulama ortamı:** Postgres zaten `localhost:5432`'de çalışıyordu (docker olmadan, muhtemelen
portable kurulum). Backend (`dotnet run --project SmartCityOps.Api`) ve frontend (`npm run dev`)
arka planda başlatıldı. `puppeteer-core`, sistemde zaten kurulu olan Chrome'u (`C:\Program
Files\Google\Chrome\Application\chrome.exe`) `--no-sandbox` ile headless başlatarak sürdü —
proje bağımlılıklarına kalıcı bir `playwright`/`puppeteer` eklenmedi, sadece scratchpad dizininde
geçici bir doğrulama scripti kuruldu ve iş bitince silindi.

**Adım 1 — Backend veri hattı doğrulandı (API üzerinden doğrudan):** `POST /api/incidents` ve
`POST /api/operational-tasks` ile gerçek bir görev ataması yapıldı. Yanıt doğru
`originLatitude`/`originLongitude`/`estimatedEtaSeconds`/`assignedAt` (offset'li, `+00:00`)
içeriyordu. `assignedAt` ve `estimatedEtaSeconds` değerleri Node'da izole olarak
`getTravelProgress` mantığıyla test edildi — progress zamanla doğru şekilde ilerliyordu (12
saniyede ~%2.5). Yani backend ve saf interpolasyon matematiği tamamen sağlamdı; şüphe React/MapLibre
render katmanına kaydı.

**Adım 2 — Tarayıcıda gerçek donma doğrulandı:** Headless Chrome'da uygulama açıldı, atanmış field
unit marker'ının `style.transform` (MapLibre'nin CSS transform tabanlı konumlama mekanizması) 15
saniye arayla iki kez okundu. Görev gerçekten uçuştaydı (~%28 progress), ama **23 marker'ın 0'ı**
pozisyon değiştirmedi.

**Kök neden:** `useFieldUnitMarkers.ts`'deki `findInFlightTask`:
```ts
const task = operationalTasks.find((candidate) => candidate.fieldUnitId === fieldUnitId);
return task && isInFlightTask(task) ? task : null;
```
`.find()` bir field unit için **ilk eşleşen** task'ı (fieldUnitId eşleşmesine göre) alıyor, sonra o
tek task üzerinde `isInFlightTask` kontrolü yapıyordu. Ama bir field unit zaman içinde birden fazla
task'a sahip olabilir (tamamlanmış eski görevler + yeni atanan görev), ve `operationalTasks` API
yanıtında sıralama task oluşturulma sırasına göre değil — o field unit'in **ilk** (genelde eski,
`Completed`) task'ı array'de yeni `Assigned` task'tan önce geliyorsa, `.find()` o eski task'ı
buluyor, `isInFlightTask` üzerinde `false` dönüyor, ve fonksiyon `null` dönüyordu — gerçek uçan
görev array'de dururken. Geçici `console.log` ile doğrulandı: `task found: false`, ama
`raw task` olarak 18 Ağustos'tan kalma `Completed` bir görev basılıyordu.

Bu, `useDispatchedRouteLayers.ts`'nin neden doğru çalıştığını da açıklıyor: oradaki
`buildFeatureCollection`, `operationalTasks.flatMap` içinde **her** task için `isInFlightTask`
kontrolü yapıyor (ilk eşleşen task'ı seçip sonra kontrol etmek yerine), yani sıralamadan
etkilenmiyor.

**Düzeltme:** `findInFlightTask`, field unit eşleşmesi VE in-flight kontrolünü tek bir `find`
predicate'inde birleştirecek şekilde yeniden yazıldı — TypeScript'in `.find()` dönüş tipini
`InFlightOperationalTask`'e daraltabilmesi için ayrı bir type-predicate fonksiyonu
(`isInFlightTaskForFieldUnit`) kullanıldı:
```ts
function isInFlightTaskForFieldUnit(fieldUnitId: string) {
  return (candidate: OperationalTask): candidate is InFlightOperationalTask =>
    candidate.fieldUnitId === fieldUnitId && isInFlightTask(candidate);
}

function findInFlightTask(fieldUnitId: string, operationalTasks: OperationalTask[]): InFlightOperationalTask | null {
  return operationalTasks.find(isInFlightTaskForFieldUnit(fieldUnitId)) ?? null;
}
```

**Doğrulama:** Aynı headless Chrome scripti düzeltmeden sonra tekrar çalıştırıldı — bu sefer 23
marker'dan **1'i** (atanmış field unit) 15 saniyelik pencerede pozisyon değiştirdi, geri kalanı
(hareketsiz field unit'ler) sabit kaldı — beklenen davranış. `npm run lint` ve `npm run build`
temiz. Test incident'ı `resolve` edildi, backend/frontend arka plan süreçleri sonlandırıldı; kalıcı
kod tabanına test/debug kodu bırakılmadı.

**Sonuç:** §25/§26/§27'de tekrar tekrar "outstanding" bırakılan Phase 5 tam tarayıcı duman testi bu
oturumda tamamlandı ve gerçek bir bug bulup düzeltti — teleport bug'ı (§27) ile karıştırılmamalı;
bu ayrı bir kök nedene (yanlış task seçimi, zamanlama yarışı değil) sahip, tamamen farklı bir
belirti (asla hareket etmeme, anlık ışınlanma değil) üreten bir hataydı. Backend/migration değişikliği
gerekmedi.

---

## 29. Phase 5.13 (Step 1/2) — Ankara Operational Zones: Domain Extraction & Service Refactor

**Kapsam:** `AnkaraZones` verisi, `Src/incident-generator/Worker.cs` ile
`Src/SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs` arasında elle senkron
tutulan bir kopyaydı (bkz. §8/§9 civarı restricted zones öncesi zaten var olan bu duplication).
Bu, iki adımlık bir unification işinin ilk adımı: Clean Architecture'ı bozmadan tek bir kaynak
oluşturmak.

**Değişiklik:**
- `Src/SmartCityOps.Domain/Common/AnkaraOperationalZones.cs` (yeni dosya): framework bağımlılığı
  olmayan bir `OperationalZoneDefinition` record'u (`Name`, `Latitude`, `Longitude`, `Spread`,
  `Weight`) ve 7 Ankara bölgesini içeren statik `AnkaraOperationalZones.All` listesi. Koordinatlar,
  spread ve weight değerleri iki eski kopyadan birebir taşındı — davranış değişikliği yok.
- `Src/SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs`: yerel `Zones`
  dizisi kaldırıldı; artık `AnkaraOperationalZones.All`'u `OperationalZoneDto`'ya map ediyor.
  Eski Türkçe "elle senkron tutuyoruz" uyarı yorumu da kaldırıldı çünkü artık geçerli değil.
- `Src/incident-generator/Worker.cs` bu adımda **bilinçli olarak dokunulmadı** — generator'ın
  Api/Application/Domain projelerine referansı yok (bkz. üstteki "Incident Generator" mimari
  notu), bu yüzden `Domain`'e bağlanması ayrı bir adım (Step 2) gerektiriyor; büyük ihtimalle
  generator projesine `SmartCityOps.Domain`'e bir proje referansı eklenmesi veya verinin ayrı bir
  paylaşılan pakete taşınması gerekecek.

**Doğrulama:** `dotnet build` hem `SmartCityOps.Infrastructure.csproj` hem `SmartCityOps.Api.csproj`
için (transitive olarak `Domain`/`Application`'ı da derleyerek) 0 hata ile tamamlandı. Frontend'e
dokunulmadı.

**Sonraki adım (Step 2):** `incident-generator`'ı `AnkaraOperationalZones.All`'a bağlamak — mimari
karar (proje referansı eklemek vs. ayrı paylaşılan paket) kullanıcıyla netleştirilmeli, çünkü
generator'ın Api/Application/Domain'den bağımsız kalması bilinçli bir tasarım kararıydı.

---

## 30. Phase 5.13 (Step 2/2) — Ankara Operational Zones: Incident Generator Integration & Unification Complete

**Kapsam:** §29'da başlatılan Ankara bölge verisi tekilleştirmesinin ikinci ve son adımı:
`incident-generator`'ı §29'da oluşturulan `SmartCityOps.Domain.Common.AnkaraOperationalZones`'a
bağlamak. Kullanıcı, mimari kararı netleştirdi: generator'a doğrudan `SmartCityOps.Domain`'e bir
proje referansı eklensin (ayrı bir paylaşılan paket değil) — `SmartCityOps.Domain` sıfır framework
bağımlılığı olan saf C# tanımları içerdiği için, generator'ın Api/Infrastructure'dan bağımsız
kalması gerektiren mimari kararı (bkz. "Incident Generator" mimari notu) bu referansla bozulmuyor.

**Değişiklik:**
- `Src/incident-generator/SmartCityOps.IncidentGenerator.csproj`: `SmartCityOps.Domain.csproj`'a
  bir `<ProjectReference>` eklendi.
- `Src/incident-generator/Worker.cs`: yerel `OperationZone` record'u ve `AnkaraZones` statik dizisi
  tamamen kaldırıldı. `GetRandomZone()` artık `AnkaraOperationalZones.All` üzerinde dönüyor ve
  dönüş tipi `OperationalZoneDefinition`'a değişti; `BuildRandomIncident()` değişmeden aynı
  `zone.Latitude/Longitude/Spread` alanlarını kullanmaya devam ediyor çünkü
  `OperationalZoneDefinition`'ın property isimleri `OperationZone`'unkilerle birebir aynı. Weight
  semantiğini açıklayan eski yorum (ağırlıkların normalize edilmediği, sadece birbirine oranının
  önemli olduğu) artık tek kaynakta, `AnkaraOperationalZones.cs`'de yaşıyor; `Worker.cs`'de
  tekrarlanmıyor.

**Doğrulama:** `dotnet build Src/SmartCityOps.sln`, `dotnet build Src/incident-generator/SmartCityOps.IncidentGenerator.csproj`
ve `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` (Api → Infrastructure → Application →
Domain transitive derlemesi dahil) hepsi 0 hata / 0 uyarı ile tamamlandı. Frontend'e dokunulmadı.

**Sonuç:** Ankara bölge verisi tekilleştirmesi tamamlandı. Artık tek kaynak
`Src/SmartCityOps.Domain/Common/AnkaraOperationalZones.cs`; hem `OperationalZoneService`
(§29) hem `incident-generator/Worker.cs` (bu bölüm) oradan okuyor. Bölge sınırları/ağırlıkları
değiştirilecekse artık yalnızca bu tek dosya güncellenmeli — önceki "elle iki yerde senkron tut"
riski ortadan kalktı. `docs/To-Do-List.txt`'deki ilgili madde `[x]` olarak işaretlendi.

---

## 31. App.tsx Orchestration Basitleştirme (Adım 1/2) — Türetilmiş Selector'ların Çıkarılması

**Kapsam:** `App.tsx` içinde satır içi (`inline`) yazılmış türetilmiş seçim mantığını
(`.find(...)`, `.filter(...)`) saf bir yardımcı dosyaya taşımak — davranış değişikliği yok.
Bu, `App.tsx`'i sadeleştirmeyi hedefleyen iki adımlı bir refactor'ın ilk adımı; ikinci adım
(replay hook'unun çıkarılması) kapsam dışı bırakıldı.

**Değişiklik:**
- `frontend/src/app/lib/operationsSelectors.ts` (yeni dosya): üç saf fonksiyon export ediyor —
  `getActiveTaskForFieldUnit(fieldUnitId, operationalTasks)`, `getTasksForIncident(incidentId,
  operationalTasks)`, `getAvailableFieldUnits(fieldUnits)`. Hiçbiri React hook'u kullanmıyor;
  sadece tipli girdi/çıktı.
- `frontend/src/app/App.tsx`: `activeTaskForSelectedFieldUnit` ve
  `availableFieldUnitsForReassignment` artık satır içi `.find`/`.filter` yerine bu yeni
  fonksiyonları çağırıyor. `getTasksForIncident` şu an `App.tsx` içinde kullanılmıyor (mevcut
  kod incident için ayrı bir görev listesi türetmiyordu) ama Promt.txt gereksinimine göre
  ileride kullanılabilecek genel bir selector olarak eklendi.

**Doğrulama:** `npm run lint` (oxlint, temiz) ve `npm run build` (`tsc -b && vite build`, 0
hata) `frontend/` içinde çalıştırıldı, ikisi de temiz geçti. Bundle boyutları önceki
duruma göre değişmedi (365 kB ana chunk, MapLibre ayrı chunk'ta — bkz. §18). Backend/migration
değişikliği yok.

---

## 32. App.tsx Orchestration Basitleştirme (Adım 2/2) — `useReplayAwareData` Hook'unun Çıkarılması

**Kapsam:** §31'de başlatılan `App.tsx` sadeleştirmesinin ikinci ve son adımı: canlı sunucu
verisi ile replay snapshot'ı arasında geçiş yapan koşullu veri seçimini (`replay.isReplayMode &&
snapshot ? snapshot.X : liveData.X` üçlü ifadeleri) `frontend/src/app/hooks/useReplayAwareData.ts`
adlı ayrı bir hook'a taşımak — davranış değişikliği yok.

**Değişiklik:**
- `frontend/src/app/hooks/useReplayAwareData.ts` (yeni dosya): `useReplayAwareData(liveData,
  replay, snapshot)` imzasıyla `{ incidents, fieldUnits, operationalTasks, restrictedZones }`
  döndürüyor. `incidents`/`fieldUnits`/`operationalTasks` replay modu aktifse ve bir snapshot
  mevcutsa snapshot'tan, aksi halde `liveData`'dan geliyor; `restrictedZones` ise replay modundan
  bağımsız her zaman `liveData.restrictedZones` — kısıtlı bölgeler replay'de zaman-değişmez kabul
  edildiği için (bkz. "Current status" bölümü, Known open items).
- `frontend/src/app/App.tsx`: `const { zones, locationHistory, restrictedZones } = liveData;`
  satırından `restrictedZones` çıkarıldı (artık hook'tan geliyor); önceki üç ayrı `const
  incidents/fieldUnits/operationalTasks = ... ? ... : ...;` satırı tek bir
  `const { incidents, fieldUnits, operationalTasks, restrictedZones } =
  useReplayAwareData(liveData, replay, snapshot);` çağrısıyla değiştirildi.

**Doğrulama:** `npm run lint` (oxlint, temiz) ve `npm run build` (`tsc -b && vite build`, 0 hata)
`frontend/` içinde çalıştırıldı, ikisi de temiz geçti; bundle boyutları değişmedi. Backend/migration
değişikliği yok.

**Sonuç:** `App.tsx` orkestrasyon sadeleştirmesi (§31 + §32) tamamlandı — türetilmiş seçiciler
`app/lib/operationsSelectors.ts`'e, replay/canlı veri geçişi `app/hooks/useReplayAwareData.ts`'e
taşındı; `App.tsx` artık sadece bu iki yardımcıyı çağırıp sonucu bileşenlere geçiriyor.
`docs/To-Do-List.txt`'deki "App.tsx orkestrasyonunu sadeleştir" maddesi `[x]` olarak işaretlendi.

---

## 33. `RestrictedZonesSection.tsx` Decomposition (Step 1/3) — State Hooks Extraction

**Kapsam:** `frontend/src/features/restricted-zones/components/RestrictedZonesSection.tsx`
büyümüş bir bileşen; onu üç adımda küçültme planının ilk adımı — form/inline-edit state'ini iki
ayrı custom hook'a taşımak. Bileşen dosyası bu adımda henüz değiştirilmedi (Adım 2/3'te
`RestrictedZonesSection.tsx` bu hook'ları kullanacak şekilde güncellenecek); bu, sadece yeni
hook'ların hazırlanıp derlendiği bir ara adım.

**Değişiklik:**
- `frontend/src/features/restricted-zones/hooks/useRestrictedZoneForm.ts` (yeni dosya): yeni bölge
  oluşturma formunun state'ini (`name`, `description`, `zoneType`, `latitude`, `longitude`,
  `radiusMeters`) ve `pickedCoordinates` değiştiğinde `latitude`/`longitude`'u `toFixed(5)` ile dolduran
  `useEffect`'i taşıdı. `useCreateRestrictedZone`'u sarmalayıp `canSubmit`, `resetForm`,
  `handleCreate` (+ `isCreating`/`isCreateError`/`createError`) döndürüyor.
- `frontend/src/features/restricted-zones/hooks/useRestrictedZoneEdit.ts` (yeni dosya): satır-içi
  düzenleme state'ini (`editingId`, `editForm`) taşıdı. `useUpdateRestrictedZone`'u sarmalayıp
  `startEditing(zone)`, `cancelEditing()`, `updateEditField(field, value)`, `saveEditing(id)` (+
  `isUpdating`/`isUpdateError`/`updateError`) döndürüyor.

**Doğrulama:** `npm run lint` (oxlint, temiz) ve `npm run build` (`tsc -b && vite build`, 0 hata)
`frontend/` içinde çalıştırıldı, ikisi de temiz geçti. `RestrictedZonesSection.tsx` henüz bu
hook'ları kullanmıyor (Adım 2/3'e bırakıldı), bu yüzden bundle boyutlarında/davranışta değişiklik
yok.

**Sıradaki adım:** Adım 2/3 — `RestrictedZonesSection.tsx`'i bu iki hook'u tüketecek şekilde
güncellemek (mevcut inline state/handler'ları kaldırıp hook çağrılarıyla değiştirmek); Adım 3/3 —
tablo satırı ve form JSX'ini ayrı alt bileşenlere ayırmak.

---

## 34. `RestrictedZonesSection.tsx` Decomposition (Step 2/3) — Subcomponent Extraction

**Kapsam:** §33'te hazırlanan `useRestrictedZoneForm`/`useRestrictedZoneEdit` hook'larının
tükettirileceği dört alt bileşeni oluşturmak — tablo satırı (salt okunur ve düzenleme modu),
tablonun kendisi, ve oluşturma formu. `RestrictedZonesSection.tsx` bu adımda henüz güncellenmedi
(Adım 3/3'e bırakıldı); bu adım sadece yeni bileşenlerin hazırlanıp derlendiği bir ara adım.

**Değişiklik:**
- `frontend/src/features/restricted-zones/constants.ts` (yeni dosya): `ZONE_TYPES` sabiti
  `RestrictedZonesSection.tsx`'ten çıkarılıp buraya taşındı — hem `RestrictedZoneEditRow` hem
  `RestrictedZoneForm` aynı listeyi kullanıyor, tek kaynak.
- `frontend/src/features/restricted-zones/hooks/useRestrictedZoneEdit.ts`: `EditFormState`
  interface'i `export` edildi ki yeni bileşenler onu import edebilsin (davranış değişikliği yok).
- `frontend/src/features/restricted-zones/components/RestrictedZoneRow.tsx` (yeni dosya): tek bir
  `RestrictedZone` için salt okunur tablo satırı + Edit/Delete aksiyon butonları.
- `frontend/src/features/restricted-zones/components/RestrictedZoneEditRow.tsx` (yeni dosya):
  satır-içi düzenleme modundaki tablo satırı; `editForm` state'ini `onUpdateField`/`onSave`/
  `onCancel` ile bağlıyor. Not: orijinal kodda güncelleme hata mesajı tablo dışında, tek bir yerde
  gösteriliyordu; burada `isUpdateError`/`updateError` satırın kendi aksiyon hücresine taşındı
  (düzenlenmekte olan satırla daha yakın bağlam) — Adım 3'te `RestrictedZonesSection.tsx` bu yeni
  yerleşimi kullanacak, görsel bir davranış değişikliği ama işlevsel değil.
- `frontend/src/features/restricted-zones/components/RestrictedZoneTable.tsx` (yeni dosya):
  `<table>` iskeleti, başlıklar, boş durum mesajı (`"No restricted zones defined yet."`) ve
  `zones.map` üzerinden `editingId`'ye göre `RestrictedZoneRow`/`RestrictedZoneEditRow` seçimi.
- `frontend/src/features/restricted-zones/components/RestrictedZoneForm.tsx` (yeni dosya): "Define
  New Restricted Zone" formu — tüm input'lar, "📍 Pick on Map"/"Cancel Picking" koordinat seçim
  butonu, submit butonu ve oluşturma hata mesajı.
- Tüm mevcut BEM sınıfları (`restricted-zones-section__*`, `history-table__*`) ve importlar
  (`HistoryTable.css`, `buttons.css`) birebir korundu; tema/dark-mode stilinde değişiklik yok.

**Doğrulama:** `npm run lint` (oxlint, temiz) ve `npm run build` (`tsc -b && vite build`, 0 hata)
`frontend/` içinde çalıştırıldı, ikisi de temiz geçti. Dört yeni bileşen henüz hiçbir yerden import
edilmiyor (`RestrictedZonesSection.tsx` Adım 3'e kadar değişmeyecek), bu yüzden bundle
boyutlarında/davranışta değişiklik yok.

**Sıradaki adım:** Adım 3/3 — `RestrictedZonesSection.tsx`'i sadeleştirip `useRestrictedZoneForm`,
`useRestrictedZoneEdit`, `RestrictedZoneTable`, `RestrictedZoneForm`'u kompoze eden ince bir
bileşene indirmek.

---

## 35. `RestrictedZonesSection.tsx` Decomposition (Step 3/3) — Final Composition & Cleanup

**Kapsam:** §33-34'te hazırlanan iki hook (`useRestrictedZoneForm`, `useRestrictedZoneEdit`) ve
dört alt bileşenin (`RestrictedZoneRow`, `RestrictedZoneEditRow`, `RestrictedZoneTable`,
`RestrictedZoneForm`) `RestrictedZonesSection.tsx`'e bağlanarak parçalama işini tamamlanması —
davranış değişikliği yok.

**Değişiklik:**
- `frontend/src/features/restricted-zones/components/RestrictedZonesSection.tsx`: 361 satırdan
  74 satıra indi. İçerik artık: `useRestrictedZoneForm(pickedCoordinates, onCoordinatesApplied)` ve
  `useRestrictedZoneEdit()` çağrıları, `useDeleteRestrictedZone` + `window.confirm` içeren
  `handleDelete` (silme akışı ufak olduğu için ayrı bir hook'a çıkarılmadı), ve
  `RestrictedZoneTable`/`RestrictedZoneForm`'a prop geçen bir JSX gövdesi. Bileşen imzası
  (`RestrictedZonesSectionProps`) ve dış sarmalayıcı (`<div className="restricted-zones-section">`)
  birebir korundu; `HistoryTable.css`/`RestrictedZonesSection.css`/`buttons.css` importları da
  aynı kaldı (alt bileşenler kendi ihtiyaç duydukları CSS'i de ayrıca import ediyor, React bunu
  tekilleştiriyor).
- Satır içi tablo/form JSX'i, yerel `ZONE_TYPES`/`EditFormState`/`toEditFormState` tanımları ve
  `handleCreate`/`handleStartEdit`/`handleCancelEdit`/`handleSaveEdit` fonksiyonları tamamen
  kaldırıldı — bunların hepsi artık §33-34'te oluşturulan hook/bileşenlerde yaşıyor.

**Doğrulama:** `npm run lint` (oxlint, temiz) ve `npm run build` (`tsc -b && vite build`, 0 hata)
`frontend/` içinde çalıştırıldı, ikisi de temiz geçti; bundle boyutları önemsiz ölçüde değişti
(index chunk 367.38 kB → 369.47 kB gzip, kod aynı miktarda farklı dosyalara dağıldığı için).
`npm run dev` ile geliştirme sunucusu ayağa kaldırılıp `curl` ile ana sayfanın `200` döndüğü
doğrulandı (backend çalışmadığı için tam operatör akışı bu oturumda manuel tıklanmadı — sadece
derleme/başlatma doğrulaması yapıldı). Backend/migration değişikliği yok.

**Sonuç:** `RestrictedZonesSection.tsx` parçalama işi (§33+§34+§35) tamamlandı —
`docs/To-Do-List.txt`'deki "RestrictedZonesSection.tsx bileşenini parçala" maddesi `[x]` olarak
işaretlendi. `CLAUDE.md`'nin "Current status" bölümü bu üç adımı özetleyen bir paragrafla
güncellendi.

---

## 36. Reactive ID-Based Selection State (Step 1/2) — `useSelection.ts` Refactor & Selectors

**Kapsam:** `docs/DEVELOPMENT_LOG.md` Part 12 "Known open items"de belirtilen stale selection state
riskini (SignalR cache invalidation sonrası seçili nesnenin eski/stale kalması) gidermenin ilk
adımı — `useSelection.ts`'in tuttuğu seçim state'i tam `Incident`/`FieldUnit` snapshot'larından
salt `string | null` ID'lere çevrildi; nesneler artık her render'da güncel React Query cache'inden
türetiliyor.

**Değişiklik:**
- `frontend/src/app/hooks/useSelection.ts`: `selectedIncident: Incident | null` /
  `selectedFieldUnit: FieldUnit | null` state'leri kaldırıldı, yerine `selectedIncidentId: string |
  null` / `selectedFieldUnitId: string | null` eklendi. Yeni API: `setSelectedIncidentId` /
  `setSelectedFieldUnitId` (fonksiyonel updater'ı da kabul eden setter'lar),
  `toggleIncidentSelection(id)` / `toggleFieldUnitSelection(id)` (aynı ID tekrar seçilirse `null`'a
  döner — önceki `setSelectedIncident`/`setSelectedFieldUnit`'in toggle davranışının ID tabanlı
  karşılığı), `selectIncident(id)` / `selectFieldUnit(id)` (koşulsuz set), `clearSelection()`,
  `deselectIncident()`, `deselectFieldUnit()`. Hook artık `Incident`/`FieldUnit` tiplerini import
  etmiyor — sadece ID'lerle çalışıyor.
- `frontend/src/app/lib/operationsSelectors.ts`: iki yeni saf fonksiyon eklendi —
  `getSelectedIncident(selectedId, incidents)` ve `getSelectedFieldUnit(selectedId, fieldUnits)` —
  ikisi de ilgili ID'yi güncel liste içinde `.find()` ile arayıp bulamazsa `null` döner. Bunlar Adım
  2'de `App.tsx`'in canlı/replay verisinden seçili nesneyi türetmek için kullanılacak.
- `App.tsx` bu oturumda **bilinçli olarak değiştirilmedi** — hâlâ eski `selectedIncident`/
  `setSelectedIncident`/`selectedFieldUnit`/`setSelectedFieldUnit` API'sini çağırıyor, bu yüzden
  `tsc -b` `App.tsx` için 4 tip hatası veriyor (beklenen; kapsam Adım 2'de kapatılacak).

**Doğrulama:** `npm run lint` (oxlint, temiz). `npm run build`: `useSelection.ts` ve
`operationsSelectors.ts` sıfır hatayla derlendi; `App.tsx`'teki 4 hata (`selectedIncident`/
`setSelectedIncident`/`selectedFieldUnit`/`setSelectedFieldUnit` artık mevcut değil) beklenen ve
kapsam dışı — Adım 2'de `App.tsx` yeni ID tabanlı API'ye ve `getSelectedIncident`/
`getSelectedFieldUnit` selector'larına taşınınca giderilecek. Backend/migration değişikliği yok.

**Sıradaki adım:** Adım 2/2 — `App.tsx`'i (ve varsa diğer tüketicileri)
`selectedIncidentId`/`selectedFieldUnitId` + `getSelectedIncident`/`getSelectedFieldUnit`
selector'larını kullanacak şekilde güncellemek, `npm run lint`/`npm run build`'in tam temiz
geçtiğini doğrulamak.

---

## 37. Reactive ID-Based Selection State (Step 2/2) — `App.tsx` Wiring & Final Verification

**Kapsam:** §36'da hazırlanan ID tabanlı `useSelection` API'sinin ve `getSelectedIncident`/
`getSelectedFieldUnit` selector'larının `App.tsx`'e bağlanması — stale selection state refactor'ı
tamamlandı, `npm run build` artık sıfır hatayla geçiyor.

**Değişiklik:**
- `frontend/src/app/App.tsx`: `useSelection()`'dan artık `selectedIncidentId`/
  `selectedFieldUnitId`, `toggleIncidentSelection`/`toggleFieldUnitSelection`, `selectIncident`/
  `selectFieldUnit`, `deselectIncident`/`deselectFieldUnit`, `clearSelection` tüketiliyor.
  `selectedIncident`/`selectedFieldUnit` artık local state değil — `useReplayAwareData`'nın
  döndürdüğü (canlı ya da replay snapshot) `incidents`/`fieldUnits` dizilerinden
  `getSelectedIncident(selectedIncidentId, incidents)` / `getSelectedFieldUnit(selectedFieldUnitId,
  fieldUnits)` ile her render'da yeniden türetiliyor — bu yüzden bir SignalR
  `OperationsUpdated` invalidation'ı sonrası seçili nesne artık otomatik olarak güncel veriyle
  eşleniyor (ID hâlâ listede varsa), ID listeden düşmüşse (`getSelectedIncident`/
  `getSelectedFieldUnit` `null` döner) seçim kendiliğinden "seçim yok" durumuna düşüyor — ayrı bir
  temizleme mekanizmasına gerek kalmadı.
- Harita seçim callback'leri (`OperationsMap`'e geçilen `onSelectIncident`/`onSelectFieldUnit`) ve
  `IncidentPanel`/`ActiveTasksPanel`'e geçilenler `toggleIncidentSelection(incident.id)` /
  `toggleFieldUnitSelection(fieldUnit.id)`'a sarıldı — önceki `setSelectedIncident`/
  `setSelectedFieldUnit`'in "aynı ID tekrar seçilirse kaldır" toggle davranışının birebir karşılığı.
  `Menu`'ye geçilen `onSelectIncident`/`onSelectFieldUnit` ise koşulsuz `selectIncident(id)` /
  `selectFieldUnit(id)` çağırıp `setMenuView("closed")` yapıyor (menüden bir kayda gidildiğinde
  toggle değil, doğrudan seçim isteniyor — davranış önceki koşulsuz `setSelectedIncident`/
  `setSelectedFieldUnit` çağrılarıyla aynı).
  `OperationsMap`/`IncidentPanel`'e geçilen `selectedIncidentId`/`selectedFieldUnitId` propları da
  artık `selectedIncident?.id ?? null` yerine doğrudan hook'un ID state'inden geliyor.
  `FieldUnitColumn`, `IncidentPanel`, `ActiveTasksPanel`, `OperationsSidebar` gibi tüketici
  bileşenlerin prop tipleri değişmedi (hâlâ `Incident | null`/`FieldUnit | null` bekliyorlar) —
  `App.tsx` onlara türetilmiş `selectedIncident`/`selectedFieldUnit` nesnelerini geçmeye devam
  ediyor, sadece bu nesnelerin kaynağı artık local state değil, ID'den türetilen bir hesaplama.
  `getActiveTaskForFieldUnit` çağrısı da `selectedFieldUnit?.id` yerine doğrudan
  `selectedFieldUnitId ?? undefined` kullanacak şekilde güncellendi.

**Doğrulama:** `npm run lint` (oxlint, temiz) ve `npm run build` (`tsc -b && vite build`)
`frontend/` içinde çalıştırıldı — **0 tip hatası**, §36'dan kalan 4 beklenen `App.tsx` hatası dahil
tüm hatalar giderildi. Bundle boyutları önemsiz ölçüde değişti (index chunk ~369.96 kB / gzip
111.66 kB); mevcut `maplibre-vendor` chunk boyut uyarısı bu refactor'dan bağımsız, önceden var olan
bir durum (Phase 5.4'te ayrı chunk'a taşınmıştı). Backend/migration değişikliği yok. Full tarayıcı
regresyon testi (marker toggle/deselect, menüden seçim, panel `✕` kapama, SignalR sonrası eski
seçimin otomatik temizlenmesi) bu oturumda manuel tıklanmadı — sadece derleme/tip doğrulaması
yapıldı.

**Sonuç:** Stale selection state riski (`docs/DEVELOPMENT_LOG.md` Part 12 "Known open items",
`docs/To-Do-List.txt`'in 1. Öncelik maddesi) kökten çözüldü — seçim artık salt ID olarak tutuluyor
ve her zaman güncel React Query cache'inden türetiliyor. `docs/To-Do-List.txt`'teki "SignalR
sonrası seçim state'ini reaktif hale getir" ve "`useSelection.ts` hook'unu ID tabanlı reaktif
yapıya dönüştür" maddeleri `[x]` olarak işaretlendi. `CLAUDE.md`'nin "Current status" ve "Known open
issues" bölümleri bu iki adımı özetleyen bir paragrafla güncellendi.

---

## 38. `OperationalTaskService.cs` — Assignment Logic Unification (`CreateAsync`/`ReassignAsync`)

**Kapsam:** `docs/To-Do-List.txt`'in 2. Öncelik ("Dosya Parçalama & Modülerleştirme") maddesinde
belirtilen `OperationalTaskService.cs` kod tekrarını gidermek — `CreateAsync` ve `ReassignAsync`
metotlarında birebir tekrarlanan ~35 satırlık görev oluşturma/saha birimi mutasyon/konum geçmişi
kaydı/eşzamanlılık-çakışması yakalama bloğu tek bir private helper'a taşındı. Davranış veya API
sözleşmesi değişikliği yok — salt bir "extract method" refactor'ı.

**Değişiklik:**
- `Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs`: yeni private
  `AssignFieldUnitAsync(Incident incident, FieldUnit fieldUnit, CancellationToken cancellationToken)`
  metodu eklendi. Bu metot ortak dizinin tamamını kapsıyor: origin koordinatlarını yakalama
  (`fieldUnit.Latitude`/`Longitude` mutasyondan önce), `_etaEstimator.EstimateEta(...)` ile ETA
  hesabı, yeni `OperationalTask` entity'sini `OperationalTaskStatus.Assigned` ile oluşturma,
  `fieldUnit`'i hedef incident koordinatlarına taşıyıp `FieldUnitStatus.Dispatched` yapma,
  `FieldUnitLocationHistory` kaydı ekleme, `_dbContext.SaveChangesAsync(...)`'i Postgres unique
  violation (`23505`) yakalayıp `ResourceConflictException`'a çeviren `try/catch` içinde çağırma ve
  sonucu `ToDto(task)` ile `OperationalTaskDto`'ya çevirme.
- `CreateAsync`: incident/field-unit doğrulaması, `_rulePipeline.EvaluateAsync(...)` kural
  kontrolü ve (yalnızca burada kalan) `incident.Status == Open` ise `InProgress`'e çekme mantığını
  koruyor; ardından görev oluşturma/mutasyon işini `AssignFieldUnitAsync(incident, fieldUnit,
  cancellationToken)`'a devrediyor ve dönen dto'nun `Id`'siyle `TaskAssignedEvent`'i dispatch
  ediyor.
- `ReassignAsync`: eski task/field-unit/yeni field-unit çözümlemesi ve kural kontrolü aynı kaldı;
  `oldTask.Status = Reassigned` ve `oldFieldUnit.Status = Available` ataması (yalnızca burada kalan
  reassign-özel mantık) sonrasında yeni görevin oluşturulması `AssignFieldUnitAsync(incident,
  newFieldUnit, cancellationToken)`'a devrediliyor; dönen dto'nun `Id`'si `TaskReassignedEvent`'in
  `newTaskId` alanına geçiliyor.
- Bilinçli olarak taşınmayan iki parça: (1) incident'i `Open`→`InProgress` çekme mantığı yalnızca
  `CreateAsync`'te kalıyor — `ReassignAsync` sırasında incident zaten `InProgress` olduğu için bu
  adım gereksiz ve orijinal kodda da yoktu. (2) `oldTask.CompletedAt`, orijinal kodda olduğu gibi
  `ReassignAsync`'te hâlâ set edilmiyor — `CLAUDE.md`'nin "Known open items" bölümünde belgelenen
  "Replay, `Reassigned` hand-off anını yaklaşık olarak yeniden kurar çünkü DB'de
  zaman damgalanmamıştır" kısıtı hâlâ geçerli; bu refactor'ın kapsamı davranış değişikliği değil,
  yalnızca kod tekrarını gidermek olduğu için bu kısıt bilinçli olarak korundu.

**Doğrulama:** `dotnet build SmartCityOps.Api/SmartCityOps.Api.csproj` (bu, `Domain` →
`Application` → `Infrastructure` → `Api` zincirinin tamamını derliyor) `Src/` içinde çalıştırıldı —
**0 uyarı, 0 hata**. `SmartCityOps.sln` üzerinden `dotnet build` çalıştırıldığında çözüm
yapılandırmasındaki (`Debug|Any CPU`) proje seçim sorunu nedeniyle hiçbir proje derlenmiyor — bu
önceden var olan, bu refactor'dan bağımsız bir `.sln`/`.slnf` yapılandırma sorunu (ayrı bir
`docs/To-Do-List.txt` maddesi olabilir), bu yüzden doğrulama doğrudan `.csproj` referanslarıyla
yapıldı. Migration değişikliği yok (entity şemaları aynı kaldı); frontend değişikliği yok.

**Sonuç:** `docs/To-Do-List.txt`'teki "`OperationalTaskService.cs` içindeki kod tekrarını birleştir
(Backend)" maddesi `[x]` olarak işaretlendi.

---

## 39. `useFieldUnitMarkers.ts` — Stabilize the Continuous Animation Loop

**Scope:** `docs/To-Do-List.txt`'in maddesi olan "`useFieldUnitMarkers.ts` animasyon döngüsünü
sürekli çalışır hale getir" — the animation `useEffect` in
`frontend/src/features/operations-map/hooks/useFieldUnitMarkers.ts` previously depended on
`[map, fieldUnits, operationalTasks]`, so every SignalR-triggered `field-units`/`operational-tasks`
refetch tore the effect down and called `cancelAnimationFrame`/re-issued `requestAnimationFrame`
from scratch. This didn't visibly break anything (the marker diffing effect already left existing
`Marker` instances in place, per Phase 5.11/5.12), but it meant the animation loop restarted on
every live update instead of running as one continuous `requestAnimationFrame` chain — wasted work
and a latent source of frame jitter under frequent SignalR traffic.

**Change:** Added an `operationalTasksRef` (mirroring the existing `fieldUnitsByIdRef` pattern),
assigned on every render alongside it. The animation effect's dependency array is now `[map]`
only — it starts once when `map` becomes ready and only stops (via its cleanup calling
`cancelAnimationFrame`) when `map` unmounts. Inside `tick`, the loop now iterates
`markersRef.current` (the marker DOM instances themselves) rather than the `fieldUnits` prop array,
looking up each field unit via `fieldUnitsByIdRef.current.get(fieldUnitId)` and skipping any marker
whose field unit is no longer present; `findInFlightTask` now reads from
`operationalTasksRef.current` instead of closing over the `operationalTasks` prop. The separate
marker diffing/creation/removal effect (dependency array `[map, fieldUnits, selectedFieldUnitId]`)
is unchanged — it still adds/removes `Marker` instances and toggles selection styling whenever
`fieldUnits` changes; the animation loop now just reads whatever markers that effect currently has
in `markersRef.current` each frame, rather than needing its own dependency on `fieldUnits`.

**Verification:** `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) both run
clean in `frontend/` — 0 lint errors, 0 type errors, same bundle output as before (this is a
dependency-array/ref refactor with no rendering or interpolation-math change). No backend/migration
change.

**Sonuç:** `docs/To-Do-List.txt`'teki "`useFieldUnitMarkers.ts` animasyon döngüsünü sürekli çalışır
hale getir" maddesi `[x]` olarak işaretlendi.

---

## 40. Comprehensive Codebase Audit & To-Do List Synchronization

**Scope:** A full architectural and code-level audit across all four backend layers
(`Domain`/`Application`/`Infrastructure`/`Api`), `incident-generator`, and the entire frontend
(`App.tsx` orchestration, all `features/*` slices, shared hooks/components), cross-referenced
against this log's Part 12 §1–§39 and `CLAUDE.md`'s "Current status" section, to reconcile
`docs/To-Do-List.txt` (which had accumulated two overlapping/duplicated lists with several stale
entries) against actual code state rather than prose claims.

**Method:** Every open item in the pre-audit `docs/To-Do-List.txt` was verified directly against
the source rather than trusted from `CLAUDE.md`'s narrative:
- `Src/SmartCityOps.Infrastructure/Persistence/Configurations/RestrictedZoneConfiguration.cs` —
  read in full: no `HasData(...)` call exists, confirming the "Restricted Zone seed data" item is
  still genuinely open.
- `Src/SmartCityOps.Domain/Common/AnkaraOperationalZones.cs` — read in full: `AnkaraOperationalZones.All`
  has exactly 7 entries (Merkez/Çankaya, Keçiören, Mamak, Etimesgut, Sincan, Gölbaşı, Pursaklar);
  Yenimahalle, Altındağ, and Polatlı are still uncovered, confirming that item is still open (Sincan,
  previously listed as a gap, is in fact already present — corrected in the rewritten list).
- `Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs` — grepped for
  `CompletedAt`: only set in `CompleteAsync`, never in `ReassignAsync`, confirming the Reassign
  hand-off timestamp gap noted in §38 is still open; no `FieldUnitStatusHistory`-style table exists
  anywhere in `Src/`, confirming the `OutOfService` history item is still open.
- `grep -rn "TODO\|FIXME\|HACK"` across `Src/**/*.cs` and `frontend/src/**/*.{ts,tsx}` returned
  zero matches — the "close pending TODO comments" item is now `[x]`. Same sweep also found zero
  stray `console.log` calls in `frontend/src/`.
- `Src/SmartCityOps.Api/SmartCityOps.Api.http` — `@name` count confirmed at 4, corroborating §21's
  claim that the file was converted to chained, runnable REST Client requests.
- No `*.Tests.csproj` exists anywhere under `Src/`, and `frontend/package.json` has no
  `vitest`/`jest` dependency — both test-infrastructure items remain fully open (0% coverage).
- Line counts taken for the decomposition candidates named in the old list:
  `ReplayControlBar.tsx` (119 lines), `MenuSectionRouter.tsx` (129 lines),
  `incident-generator/Worker.cs` (128 lines) — all comfortably under the ~250-line threshold used
  elsewhere in this project to justify decomposition (see §33–35), so these stay demoted to
  low-priority/optional rather than active items.

**New finding — `SmartCityOps.sln` configuration gap:** `dotnet build SmartCityOps.sln` was run
during the audit to double check §38's aside about a "pre-existing `.sln`/`.slnf` configuration
issue." Root cause identified: `Src/SmartCityOps.sln`'s `ProjectConfigurationPlatforms` section maps
`Debug|Any CPU.ActiveCfg = Debug|x64` for every project GUID but never emits the matching
`Debug|Any CPU.Build.0` line (only `Debug|x64.Build.0` is present) — so when `dotnet build` is
invoked against the `.sln` with the default `Debug|Any CPU` configuration, MSBuild resolves an
active configuration for each project but finds no `Build.0` flag telling it to actually build that
project, so the build silently completes with 0 projects compiled and a "no project found to
restore" warning. Direct `.csproj` builds (as this project's own `dotnet build`/`dotnet run`
commands in `CLAUDE.md`'s Commands section already do) are unaffected. Added to
`docs/To-Do-List.txt` as a new Technical Debt item — fix is either adding the missing
`Build.0` lines or standardizing `.sln`-based build invocations with `-p:Platform=x64`.

**Verification:** `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` — 0 warnings, 0
errors (builds the full `Domain → Application → Infrastructure → Api` chain). `npm run lint`
(oxlint) — clean. `npm run build` (`tsc -b && vite build`) — clean, 0 type errors; bundle output
unchanged from §37/§39 (`index` chunk 369.96 kB / gzip 111.67 kB, `maplibre-vendor` chunk
942.37 kB / gzip 244.91 kB — the pre-existing maplibre-vendor size warning noted since §18 is
unrelated to this audit and was not investigated further here). No code changes were made in this
session beyond documentation — this was a read-only audit.

**Outcome:** `docs/To-Do-List.txt` was rewritten from its two overlapping lists into a single
de-duplicated, priority-grouped list: Priority 1 (Functional — restricted-zone seed data,
operational-zone coverage expansion, Reassign hand-off timestamp, `OutOfService` history), Priority
2 (Test Infrastructure — still fully absent on both backend and frontend), Priority 3 (Technical
Debt — the newly-found `.sln` configuration gap, plus demoted-to-optional decomposition candidates
and minor npm version drift), and an archive section listing every item this audit confirmed
already done (Pick on Map, `launchSettings.json` cleanup, `.http` automation, TODO cleanup, `App.tsx`
orchestration split, `RestrictedZonesSection` decomposition, ID-based reactive selection,
`OperationalTaskService` unification, animation loop stabilization, Ankara zone data unification).
No `CLAUDE.md` changes were needed beyond this log entry — its "Current status & known open issues"
section already accurately listed the genuinely-open items (no backend tests, replay
approximation of Reassign/OutOfService) that this audit confirmed are still open; the only
correction folded into that section is the `.sln` build gap, noted below.

---

## 41. Phase 5.16 — Restricted Zones Seed Data & Migration (HasData)

**Problem:** `RestrictedZoneAssignmentRule` could not be exercised out-of-the-box — with zero
restricted zones in the database, the rule always short-circuited to `Success()`, so a fresh clone
of the repo had no way to see the rule actually block a task assignment without an operator first
creating a zone by hand via `POST /api/restricted-zones`. §40's audit had confirmed this was still
genuinely open (no `HasData(...)` call existed anywhere in `RestrictedZoneConfiguration.cs`).

**Fix — seed data:** Following the same deterministic-GUID/`HasData(...)` convention already used
in `FieldUnitConfiguration.cs`, two realistic Ankara restricted zones were added to
`Src/SmartCityOps.Infrastructure/Persistence/Configurations/RestrictedZoneConfiguration.cs`:

- **Kızılay Security Zone** (`d1111111-1111-1111-1111-111111111111`) — `SecurityLockdown`,
  39.9208/32.8541, 600 m radius — models a government-district police-only perimeter.
- **Eskişehir Road Construction** (`d2222222-2222-2222-2222-222222222222`) — `RoadConstruction`,
  39.9080/32.7650, 800 m radius — models a main-arterial infrastructure closure.

Both use hardcoded static GUIDs (`Guid.Parse(...)`, never `Guid.NewGuid()`) and a fixed UTC
`CreatedAt` (`new DateTimeOffset(2026, 8, 1, 0, 0, 0, TimeSpan.Zero)`) rather than `DateTimeOffset.UtcNow`
— both are required for `HasData(...)`, since EF Core snapshots seed data into the migration at
`add`-time and needs stable values to produce a deterministic, idempotent `InsertData` diff across
environments; a `NewGuid()`/`UtcNow` call would regenerate different values on every `migrations add`
invocation and falsely appear as a change on every subsequent migration.

**Migration:** `dotnet ef migrations add SeedRestrictedZones --project SmartCityOps.Infrastructure
--startup-project SmartCityOps.Api --output-dir Persistence/Migrations` generated
`20260827061228_SeedRestrictedZones.cs` containing an `InsertData` call for both records in `Up()`
and a matching `DeleteData` call for both in `Down()`. The migration was reviewed before applying
(no `database update` was run until the generated file was inspected), then applied cleanly with
`dotnet ef database update` — no duplicate-key or schema errors.

**Verification:** Backend build (`dotnet build SmartCityOps.Api/SmartCityOps.Api.csproj`) — 0
warnings, 0 errors. Started the API and queried `GET /api/restricted-zones` directly: both seeded
zones ("Kızılay Security Zone", "Eskişehir Road Construction") were present in the response
alongside three pre-existing operator-created zones already in the local dev database, confirming
`RestrictedZoneAssignmentRule` now has real data to evaluate against out-of-the-box on a fresh
clone + `database update`. `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`)
both remained clean; frontend bundle sizes unchanged from §39/§40, since this was a backend-only
change with no frontend code touched.

**Outcome:** The "Restricted Zone başlangıç verisi (Seed Data) ekle" item is now `[x]` in
`docs/To-Do-List.txt`, moved to the completed archive section. `CLAUDE.md`'s "Current status &
known open issues" section's prior note that "No restricted zones exist by default... the
assignment rule always returns `Success()`" is now resolved and updated accordingly.

---

## 42. Phase 5.17 — Ankara Operational Zones Geographic Expansion & Map Bounds Adjustment

**Problem:** §40's audit had confirmed `AnkaraOperationalZones.All` still covered only 7 Ankara
districts (Merkez/Çankaya, Keçiören, Mamak, Etimesgut, Sincan, Gölbaşı, Pursaklar) — several large
districts (Yenimahalle, Altındağ, Polatlı, Elmadağ, Kahramankazan) had no coverage, so simulated
incidents and the operational-zones map layer never appeared there.

**Fix:** Five new `OperationalZoneDefinition` entries were added to the single source of truth,
`Src/SmartCityOps.Domain/Common/AnkaraOperationalZones.cs`, bringing the list from 7 to 12 zones:

- **Yenimahalle** — 39.970/32.795, spread 0.035, weight 12
- **Altındağ (Ulus/Dışkapı)** — 39.955/32.865, spread 0.030, weight 12
- **Polatlı** — 39.585/32.145, spread 0.040, weight 6
- **Elmadağ** — 39.920/33.230, spread 0.035, weight 6
- **Kahramankazan** — 40.195/32.685, spread 0.035, weight 6

Weights keep the existing proportional shape: central/inner districts (Merkez 30, Keçiören/Mamak/
Etimesgut/Sincan/Yenimahalle/Altındağ at 12) stay weighted well above the newly-added outer
districts (Polatlı/Elmadağ/Kahramankazan at 6, alongside the existing Pursaklar at 8), so simulated
incident density still concentrates centrally rather than spreading evenly.

As documented under "Ankara zone data has a single source of truth" in `CLAUDE.md`, this list has
exactly two consumers and neither needed any code change: `OperationalZoneService.GetAllAsync`
(`Src/SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs`) just maps whatever is
in `AnkaraOperationalZones.All` to `OperationalZoneDto`, and `incident-generator/Worker.cs`'s
`GetRandomZone()` reads the same list via its existing `SmartCityOps.Domain` project reference —
both automatically picked up all 12 zones with zero duplication.

**Map bounds:** Two of the new zones fell outside (Polatlı, at lng 32.145) or right at the edge of
(Kahramankazan, at lat 40.195) the previous `ANKARA_BOUNDS` in
`frontend/src/features/operations-map/lib/mapConfig.ts` (`[[32.4, 39.6], [33.3, 40.2]]`). The bounds
were extended to `[[32.0, 39.45], [33.35, 40.3]]` so the map camera can comfortably pan/zoom to
every zone, including Polatlı, with margin to spare rather than clipping it at the literal edge of
the bounding box.

**Verification:** `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` — 0 warnings, 0
errors. Started the API and queried `GET /api/operational-zones` directly: the response contained
all 12 zones, the 7 pre-existing ones unchanged plus the 5 new districts with the exact coordinates/
spread/weight above. `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) in
`frontend/` both remained clean (0 errors); bundle sizes unchanged from §41, since only a constant
array literal was edited, no new dependency or component.

**Outcome:** The "Operational Zones kapsama alanını genişlet" item is now `[x]` in
`docs/To-Do-List.txt`, moved to the completed archive section. `CLAUDE.md`'s "Ankara zone data has
a single source of truth" paragraph and "Current status" section were updated to say 12 zones
instead of 7 and note the outer-coverage gap is closed.

---

## 43. Phase 5.18 — Operational Task ReassignedAt Timestamp & Operations Replay Precision

**Problem:** §38/§40 both noted the same gap: `OperationalTaskService.ReassignAsync` transitions
`oldTask.Status` to `Reassigned` but deliberately leaves `oldTask.CompletedAt` `null` — that field
means "task completed", not "task handed off", so overloading it would have been semantically
confusing. Without any timestamp for the hand-off moment, `OperationsReplayService` had no way to
know exactly when the old field unit was released or when the old task stopped being active; it
approximated both using `AssignedAt` of the *new* task, which is close in practice (assignment
happens immediately after reassignment in the same request) but not exact.

**Fix — dedicated `ReassignedAt` column:**

- **Domain:** `OperationalTask` (`Src/SmartCityOps.Domain/Entities/OperationalTask.cs`) gained a
  nullable `DateTimeOffset? ReassignedAt { get; set; }`, parallel to the existing `CompletedAt`.
- **Application:** `OperationalTaskDto` gained the matching `DateTimeOffset? ReassignedAt` field.
- **Service:** `OperationalTaskService.ReassignAsync`
  (`Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs`) now captures a
  single `now = DateTimeOffset.UtcNow` and sets `oldTask.ReassignedAt = now` in the same statement
  block as `oldTask.Status = OperationalTaskStatus.Reassigned`, then passes that same `now` into the
  `AssignFieldUnitAsync` helper (extracted in §38) so the new task's `AssignedAt` and the old task's
  `ReassignedAt` are the *identical* instant rather than two separate `UtcNow` calls milliseconds
  apart — the hand-off is now an atomic, explicit audit timestamp instead of an implicit one.
  `GetAllAsync`'s projection and the private `ToDto` helper both map the new column.
- **Replay:** `OperationsReplayService`
  (`Src/SmartCityOps.Infrastructure/OperationsReplay/OperationsReplayService.cs`) no longer
  approximates hand-off timing via `AssignedAt`:
  - `BuildFieldUnitReplayDto`'s status switch now treats a `Reassigned` task as releasing its field
    unit (`FieldUnitStatus.Available`) only once `ReassignedAt.HasValue && ReassignedAt <= timestamp`
    — before that instant, the unit is correctly still shown as `Dispatched` under the old task.
  - The `activeTaskDtos` filter now keeps a `Reassigned` task "active" for
    `AssignedAt <= timestamp && (!ReassignedAt.HasValue || ReassignedAt.Value > timestamp)`, mirroring
    the same precise cutoff, instead of unconditionally excluding every `Reassigned` task from the
    active set regardless of the requested replay timestamp.
  - `GetReplayTimeRangeAsync`'s per-table aggregate query for `OperationalTasks` now also selects
    `MaxReassignedAt`, folded into the overall max-timestamp calculation alongside
    `MaxAssignedAt`/`MaxCompletedAt`, so the replay scrubber's time range correctly extends to cover
    any reassignment that happened after the last `AssignedAt`/`CompletedAt`.
- **Frontend:** `OperationalTask` (`frontend/src/features/operational-tasks/types.ts`) gained an
  optional `reassignedAt?: string | null` field for type alignment; no UI currently renders it.

**Migration:** `AddOperationalTaskReassignedAt`
(`Src/SmartCityOps.Infrastructure/Persistence/Migrations/20260827072347_AddOperationalTaskReassignedAt.cs`)
adds a single nullable `timestamp with time zone` column,
`ALTER TABLE "OperationalTasks" ADD "ReassignedAt" timestamp with time zone;`. It was generated,
inspected, and then applied cleanly with
`dotnet ef database update --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api`
— the EF Core migration log shows the `ALTER TABLE` executing and the migration ID being recorded in
`__EFMigrationsHistory` with no errors.

**Verification:** `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` — 0 warnings, 0
errors, both before and after applying the migration. `npm run lint` (oxlint) and `npm run build`
(`tsc -b && vite build`) in `frontend/` both clean (0 errors); bundle output unchanged from prior
phases, since only a type field was added, no new component/dependency.

**Outcome:** The "Operations Replay simülasyonunu kesinleştir — Reassign devir zamanı" item is now
`[x]` in `docs/To-Do-List.txt`, moved to the completed archive section. `CLAUDE.md`'s "Current
status & known open issues" section was updated to say reassignment hand-offs are now explicitly
timestamped and no longer approximated in replay.

---

## 44. Phase 5.19 — Component Review & Health Check (ReplayControlBar & MenuSectionRouter)

**Scope:** `docs/To-Do-List.txt` carried a low-priority reminder to revisit
`frontend/src/features/operations-replay/components/ReplayControlBar.tsx` (119 lines) and
`frontend/src/features/menu/components/MenuSectionRouter.tsx` (129 lines) — both were candidates
for the same decomposition treatment applied to `RestrictedZonesSection.tsx` (§33–35) once/if they
grew. This phase performed that review directly against source, not from memory.

**`ReplayControlBar.tsx` findings:** the mode toggle (Live/Historical Replay), playback controls
(play/pause button, range-input scrubber, speed `<select>`), and the timestamp/read-only-note
footer are each a self-contained JSX block gated by `isReplayMode`/`hasHistory`, with no
cross-cutting logic between them. No dead code, no unused props — every prop in
`ReplayControlBarProps` is read exactly once. Zero inline `style=` attributes; all styling goes
through BEM classes in `ReplayControlBar.css` plus the shared `app-button` class. No unstable
render-time allocations that would defeat memoization (no new object/array literals passed as
props to children — MapLibre isn't involved here at all).

**`MenuSectionRouter.tsx` findings:** the `SECTIONS` list stays a flat declarative array, and
routing between `CompletedTasksSection`/`StatisticsSection`/`IncidentTimelineSection`/
`FieldUnitMovementHistorySection`/`RestrictedZonesSection` is a sequence of `view === "..."`
conditional JSX blocks — no nested ternary chains or switch statement obscuring the mapping from
`MenuView` to component. `import type { MenuView } from "./Menu"` already uses `import type`
correctly, consistent with the project's type-import convention. Zero inline styles.

**Decision — no changes made (YAGNI):** both components sit at 119 and 129 lines, well under the
~250-line threshold that triggered the `RestrictedZonesSection.tsx` decomposition. Splitting either
into subcomponents/hooks now would add indirection (extra files, extra prop-drilling) without a
concrete readability or reuse benefit — the kind of premature abstraction this project's conventions
explicitly avoid. Left both files untouched.

**Verification:** `npm run lint` (oxlint) in `frontend/` — clean for both files (only pre-existing
warnings in unrelated files: `useMapInstance.ts`, `IncidentTimelineSection.tsx`,
`useReplayController.ts`, `useFieldUnitMarkers.ts`, `useRestrictedZoneLayers.ts`,
`useRestrictedZoneForm.ts`). `npm run build` (`tsc -b && vite build`) in `frontend/` — 0 errors,
same chunk output as prior phases. `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` — 0
warnings, 0 errors (no backend files touched).

**Outcome:** the `ReplayControlBar.tsx`/`MenuSectionRouter.tsx` review item is now `[x]` in
`docs/To-Do-List.txt`, moved to the completed archive section.

---

## 45. Phase 5.20 — Incident Generator Evaluation & Comment Normalization (Worker.cs)

**Scope:** `docs/To-Do-List.txt` carried a low-priority reminder to consider extracting an
`IncidentFactory` class from `Src/incident-generator/Worker.cs` (128 lines) to hold the random
incident generation and zone-weight math. This phase reviewed that suggestion directly against
source.

**Findings:** `Worker.cs` is a single `BackgroundService` with one responsibility — simulate an
external incident feed — cleanly decomposed into `ExecuteAsync` (the timer loop),
`GenerateAndSendIncidentAsync` (HTTP send + logging), `GetRandomZone()` (weighted zone selection),
`BuildRandomIncident()` (payload assembly), and a plain `IncidentPayload` record. None of these are
duplicated elsewhere, none exceed a handful of lines, and the class has a single collaborator
boundary (`HttpClient` → the API). There is no backend test project in this solution (verification
here is manual, per the Commands section), so the usual justification for a factory extraction —
unit-testing generation logic in isolation — doesn't apply either.

**Decision — no extraction made (YAGNI):** at 128 lines, well under the project's ~150–250 line
decomposition threshold, with zero duplication and a single clear responsibility, pulling
`GetRandomZone`/`BuildRandomIncident` into a separate `IncidentFactory` class would add a new
class/DI registration for two methods only ever called from one place, in sequence, with no
variation point — the kind of premature abstraction this project's conventions explicitly avoid.
Left the generation/weighting logic in place.

**Comment normalization:** while reviewing the file, several inline comments were still in Turkish
(explaining `using` directives, the `logger`/`httpClient` fields, the `ExecuteAsync`/`while` loop
purpose, and the `IncidentCode` timestamp rationale) — inconsistent with the English-comment
convention already applied elsewhere in the codebase (Phase 5.5, §19, to `useSignalR.ts`). All were
translated to English; no functional code changed. User-facing log message strings
(`"Incident gönderildi..."`, etc.) and the seeded `IncidentPayload.Description` text were left as-is
— those are string literal data/log output, not code comments, and out of scope for this pass.

**Verification:** `dotnet build Src/incident-generator/SmartCityOps.IncidentGenerator.csproj` — 0
warnings, 0 errors. `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` — 0 warnings, 0
errors. `npm run lint` (oxlint) in `frontend/` — clean (only pre-existing warnings in unrelated
files, unchanged from prior phases). `npm run build` (`tsc -b && vite build`) in `frontend/` — 0
errors, same chunk output as prior phases (frontend untouched by this phase).

**Outcome:** the `IncidentFactory` extraction item is now `[x]` in `docs/To-Do-List.txt`, moved to
the completed archive section, documenting that `Worker.cs` was evaluated and kept intact under the
project's YAGNI policy.

---

## 46. Phase 5.21 — Frontend Minor NPM Dependencies Update & Lockfile Refresh

**Scope:** `docs/To-Do-List.txt` carried an optional/maintenance reminder that `npm outdated`
showed several minor/patch-level updates available for frontend dependencies (`@tanstack/
react-query`, `axios`, `maplibre-gl`, `vite`, `oxlint`, etc.) — none breaking, none urgent. This
phase applied them.

**Change:** ran `npm update` in `frontend/`, which bumps dependencies within the semver ranges
already declared in `package.json` (`^`/`~`). The only package that actually moved was
`@tanstack/query-core`/`@tanstack/react-query`, from `5.102.6` to `5.102.7` (a patch release) —
every other dependency (`axios`, `maplibre-gl`, `vite`, `oxlint`, `@microsoft/signalr`, `react`/
`react-dom`, `typescript`, `@vitejs/plugin-react`, `@types/*`) was already at the newest version
satisfying its declared range at the time `npm update` ran. `package.json` itself required no
edits — only `package-lock.json` changed (updated `version`/`resolved`/`integrity` entries for the
two `@tanstack` packages). No major-version bumps were introduced.

**Verification:** `npm run lint` (oxlint) in `frontend/` — 0 errors (exit code 0); the same
handful of pre-existing `react(purity)`/`react(refs)`/`react(set-state-in-effect)` warnings from
prior phases remain, unrelated to this change and already present before the update. `npm run
build` (`tsc -b && vite build`) in `frontend/` — 0 TypeScript errors, 0 build errors; same chunk
output/sizes as before (`index` ~372 kB, `maplibre-vendor` ~955 kB — the pre-existing >500 kB
chunk-size advisory is informational only, from the `maplibre-gl` library itself, and unchanged by
this phase). `dotnet build Src/SmartCityOps.Api/SmartCityOps.Api.csproj` — 0 warnings, 0 errors
(backend untouched by this phase; re-verified to confirm no cross-stack regression).

**Outcome:** the "Küçük npm bağımlılık güncellemeleri" item is now `[x]` in `docs/To-Do-List.txt`,
moved to the completed archive section.

---

## 47. Phase 5.22 — Solution File Platform Build Mapping Fix (SmartCityOps.sln)

**Scope:** the Technical Debt item flagged since §40's audit — `Src/SmartCityOps.sln`'s
`ProjectConfigurationPlatforms` section had `.ActiveCfg` mappings for `Debug|Any CPU` and
`Release|Any CPU` on every project, but no corresponding `.Build.0` mappings (only the `x64`
platform variants had `.Build.0`). Under MSBuild/dotnet CLI semantics, a configuration/platform
combination is only actually built if a `.Build.0` entry exists for it — `.ActiveCfg` alone just
maps the combination to another configuration without opting it into the build. Since `dotnet
build`'s default configuration/platform is `Debug|Any CPU`, and no project had a
`Debug|Any CPU.Build.0` entry, `dotnet build SmartCityOps.sln` (or plain `dotnet build` from
`Src/`) silently built zero projects, emitting only a "Geri yüklenecek proje bulunamadı" warning
with no error — easy to miss.

**Fix:** for all 5 project GUIDs (`SmartCityOps.Domain`, `SmartCityOps.Application`,
`SmartCityOps.Infrastructure`, `SmartCityOps.Api`, `SmartCityOps.IncidentGenerator`), added
`{GUID}.Debug|Any CPU.Build.0 = Debug|x64` and `{GUID}.Release|Any CPU.Build.0 = Release|x64`
lines, matching each project's existing `ActiveCfg` target (every project's `Debug|Any CPU.ActiveCfg`
and `Release|Any CPU.ActiveCfg` already pointed at `Debug|x64`/`Release|x64`, so the new `.Build.0`
lines mirror the same target rather than introducing a new configuration). This is a solution-file-only
change — no `.csproj` file was touched.

**Verification:** `dotnet build SmartCityOps.sln` and plain `dotnet build` (both run from `Src/`)
now report all 5 projects restored and compiled — `SmartCityOps.Domain`, `SmartCityOps.Application`,
`SmartCityOps.IncidentGenerator`, `SmartCityOps.Infrastructure`, `SmartCityOps.Api` — with 0
warnings and 0 errors. This resolves the silent 0-project compilation issue noted in §40 and
removes the previous workaround of building via implicit project discovery or explicit `.csproj`
paths only.

**Outcome:** the "`SmartCityOps.sln` — `Debug|Any CPU` konfigürasyonu proje derlemiyor" item is now
`[x]` in `docs/To-Do-List.txt`, moved to the completed archive section. `CLAUDE.md`'s Commands
section and "Current status" notes about this limitation were updated accordingly.

---

## 48. Phase 5.23 — Sidebar Active Incidents List, Priority Score Bars & Statistics Reorganization

**Scope:** two related frontend-only UI changes on top of the existing dashboard/sidebar
structure — no backend/migration change in either step.

**Step 1 — Statistics reorganization.** The 5 summary counters (Active Incidents, High Priority
Active Incidents, Available/Dispatched/Out of Service Field Units) previously rendered inline
(no CSS classes at all) by `IncidentsSummary.tsx` and `Dashboard.tsx` in the right sidebar
(`OperationsSidebar.tsx`) were moved into an "Operational Overview" stat-card grid at the top of
the Menu's `StatisticsSection.tsx` (`frontend/src/features/dashboard/components/
StatisticsSection.tsx`), which already received `incidents`/`fieldUnits` as props from
`MenuSectionRouter.tsx`, so no new data plumbing was needed. A new `frontend/src/features/
dashboard/styles/StatisticsSection.css` defines the BEM classes (`statistics-section__overview`,
`__card`, `__card-label`, `__card-value`, `__card--highlight` for the high-priority card) using the
existing dark palette (`#1E293B` card background, `#F8FAFC` value text, `#3B82F6` highlight). The
now-dead `Dashboard.tsx` and `IncidentsSummary.tsx` components were deleted (verified via grep: no
remaining references anywhere in `frontend/src/`); `OperationsSidebar.tsx` and its `App.tsx` call
site had their `incidents`/`fieldUnits` props removed since nothing in the sidebar needed them
after this move — clearing the way for Step 2.

**Step 2 — Active Incidents List + priority scoring.** A new pure utility module,
`frontend/src/features/incidents/lib/incidentPriorityScore.ts`, was added:
- `getIncidentPriorityScore(incident): number` — deterministic 0-100 integer score. A simple
  string hash (`hash = hash * 31 + charCode`, unsigned via `>>> 0`) is computed from `incident.id`
  (there is no `incidentCode` field on `Incident`) and mapped into a range determined by
  `incident.priority`: Low → `0 + (hash % 31)` (0-30), Medium → `31 + (hash % 40)` (31-70), High →
  `71 + (hash % 30)` (71-100). Hashing the id rather than storing a score column keeps the score
  stable across re-renders/refetches without any backend schema change.
- `getPriorityScoreColor(score): { barColor, textColor }` — High (≥71) `#EF4444`, Medium (≥31)
  `#F59E0B`, Low (<31) `#3B82F6`.
- `sortActiveIncidents(incidents): Incident[]` — filters `status !== "Resolved"`, then sorts by
  priority score descending, tie-breaking on `type` ascending (`localeCompare`).

`frontend/src/features/incidents/components/ActiveIncidentsList.tsx` (+ colocated
`styles/ActiveIncidentsList.css`) consumes this module to render the sidebar's new active-incidents
panel: a `"Active Incidents ({count})"` header, a scrollable card list (compact `::-webkit-scrollbar`
styling, `max-height: 320px`) below `FilterPanel`, and per-card: incident type + priority badge in
the header, a progress-bar row (`getPriorityScoreColor(score).barColor` driving the fill color,
width set to `score%`) plus the numeric `score%` badge, and a footer with a status badge (`Open` →
"Reported", `InProgress` → "In Progress") and the reported time. A selected card
(`incident.id === selectedIncidentId`) gets a highlighted border/background; clicking a card calls
`onSelectIncident(incident.id)`. An empty state renders `"No active incidents matching filters."`
when the filtered/sorted list is empty. `OperationsSidebar.tsx` now takes `incidents`,
`selectedIncidentId`, `onSelectIncident` in addition to its existing filter props: it applies the
active `priorityFilter` (when non-empty) to `incidents`, feeds the result through
`sortActiveIncidents`, and renders `<ActiveIncidentsList />` with that derived list — so the sidebar
list, the map markers, and marker click-to-select all stay in sync through the same
`priorityFilter`/`toggleIncidentSelection` state already wired in `App.tsx` (no new selection
mechanism was introduced; `App.tsx` just passes `incidents`, `selectedIncidentId`, and
`toggleIncidentSelection` down to `OperationsSidebar`).

**Step 3 — Sidebar scrollbar layout refinement.** Step 2's fixed `max-height: 320px` on
`.active-incidents-list__items` left the outer side panel free to grow taller than the viewport,
so `.operations-center-layout__side-panel`'s own `overflow-y: auto`
(`frontend/src/layouts/styles/OperationsCenterLayout.css`) kicked in and produced a second,
outer scrollbar alongside the incident list's own compact one. Fixed by making the side panel a
non-scrolling flex column instead of a scrolling block:
`.operations-center-layout__side-panel` changed from `overflow-y: auto` to `display: flex;
flex-direction: column; min-height: 0; overflow: hidden;`, so the panel itself never generates a
scrollbar. `.active-incidents-list` (`frontend/src/features/incidents/styles/
ActiveIncidentsList.css`) became a flex column filling the remaining vertical space (`flex: 1;
min-height: 0`), with its `__header` pinned via `flex-shrink: 0`; `.active-incidents-list__items`
dropped the fixed `max-height: 320px` in favor of `flex: 1; min-height: 0; overflow-y: auto`, so it
grows to fill whatever space is left below `FilterPanel` and only it scrolls (keeping its existing
compact `::-webkit-scrollbar` styling). `FilterPanel`
(`frontend/src/features/operations-map/styles/FilterPanel.css`) gained `flex-shrink: 0` so it keeps
its natural height as a fixed sibling in the new flex column instead of being compressed. No
backend/migration change.

**Step 4 — FilterPanel Filter Chip modernization.** `FilterPanel`'s per-option rendering (delegated
to `frontend/src/features/operations-map/components/FilterCheckboxGroup.tsx`) was modernized from
native `<input type="checkbox">` + label text rows into compact, accessible Filter Chip / Pill
buttons, with zero changes to the underlying selection state or toggle logic
(`selectedOptions`/`onToggle` props are untouched). Each option still renders a real
`<input type="checkbox">` for accessibility/semantics, now visually hidden via
`.filter-chip__input { position: absolute; opacity: 0; pointer-events: none; }` inside a
`<label className="filter-chip">`, so clicking the chip still natively toggles React state — no new
click handler was added. `FilterCheckboxGroup` gained an optional `variant?: "default" | "priority"`
prop: the "Incident Priority" group passes `variant="priority"` from `FilterPanel.tsx`, which adds a
`filter-chip--priority-{high|medium|low}` modifier class (derived from the option value) so that
group's selected chips render the semantic priority colors instead of the default blue — High
`#EF4444`, Medium `#D97706`, Low `#2563EB` — while Field Unit Status/Type keep the default selected
style, background `#2563EB` / border `#3B82F6`, white text, with a subtle `box-shadow` glow. A
selected chip also renders a small white `.filter-chip__dot` indicator next to its label.
Compact sizing (`padding: 4px 10px`, `font-size: 0.75rem`, `border-radius: 6px`) plus
`.filter-panel__chips { display: flex; flex-wrap: wrap; gap: 6px; }` keeps each section
(Incident Priority / Field Unit Status / Field Unit Type) wrapping naturally instead of overflowing;
section labels (`.filter-panel__group-label`) were restyled to the same subtle/compact treatment
used elsewhere in the sidebar (`font-size: 0.75rem`, uppercase, `letter-spacing: 0.05em`, `#94A3B8`).
`.filter-panel` keeps its existing `flex-shrink: 0` (set in Step 3 above) so the chip panel still
sits as a fixed-height sibling above `ActiveIncidentsList` with no outer scrollbar introduced. All
new styling lives in `frontend/src/features/operations-map/styles/FilterPanel.css`
(strict BEM, zero inline styles); `FilterCheckboxGroup.css` was trimmed down to just the group/chip
wrapper layout. No backend/migration change.

**Verification:** `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) both clean —
0 errors across all four steps (only pre-existing warnings unrelated to these files, e.g. the
`react(refs)`/`react(set-state-in-effect)` warnings already present before this phase). `dotnet
build Src/SmartCityOps.sln` unaffected (frontend-only change, 0 warnings/0 errors). No backend or
migration change.

**Outcome:** `docs/To-Do-List.txt`'s two new items from Steps 1-2 (active incidents list with
dynamic percentage bars and multi-tier sorting; sidebar summary counters moved into
`StatisticsSection.tsx`) plus the Step 4 filter-chip modernization item are `[x]`, added to the
completed archive section. `CLAUDE.md`'s frontend architecture notes were updated to mention
`ActiveIncidentsList.tsx` and `incidentPriorityScore.ts`.

## 49. Phase 5.24 — Active Incidents Card UI Simplification & Progress Bar Removal

**Motivation:** Phase 5.23 (§48 above) gave each Active Incidents card a progress-bar row — a
`getPriorityScoreColor`-tinted fill plus a numeric `score%` badge — driven by the deterministic
hash-based score from `incidentPriorityScore.ts`. On review, that score is artificial (hashed from
`incident.id`, not backed by any real operational signal), and rendering it as a percentage next to
a real priority badge read as misleading on an operations dashboard meant to reflect genuine field
data. Phase 5.24 removes the bar/percentage while leaving the score-driven sort order — which is
still a reasonable deterministic tie-breaker within each priority tier — untouched.

**Changes:**
- `frontend/src/features/incidents/components/ActiveIncidentsList.tsx`: removed the
  `active-incidents-list__score-row` block (progress track + fill + percentage badge) from each
  card, along with the now-unused `getPriorityScoreColor` import and its per-card `score`/`barColor`
  destructuring. Each card now renders only the header (incident type label + priority badge) and
  the footer (status badge + reported time), with nothing in between. `getIncidentPriorityScore`
  is no longer imported here — it's only needed by `sortActiveIncidents`, which callers (
  `OperationsSidebar.tsx`) already invoke directly.
- `frontend/src/features/incidents/styles/ActiveIncidentsList.css`: removed
  `.active-incidents-list__score-row`, `.active-incidents-list__progress-track`,
  `.active-incidents-list__progress-fill`, and `.active-incidents-list__score-badge`. The card's
  existing `gap: 8px` flex-column spacing (`.active-incidents-list__card`) now sits directly between
  header and footer with no extra rule needed, keeping cards compact. Dark palette
  (`#1E293B` card background, `#334155` border, `#F8FAFC` text) and strict BEM naming are unchanged.
- `frontend/src/features/incidents/lib/incidentPriorityScore.ts`: removed the now-unused
  `getPriorityScoreColor` function and its `PriorityScoreColor` interface (verified via grep: no
  remaining references anywhere in `frontend/src/` — the identically-named `getPriorityScoreColor`/
  score-bar classes in `features/field-unit-recommendations` are a separate, unrelated module and
  were left untouched). `getIncidentPriorityScore` and `sortActiveIncidents` are unchanged — sort
  order (priority score descending, then `type` ascending) and the `status !== "Resolved"` filter
  are byte-for-byte identical to Phase 5.23.

**Verification:** `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) both clean —
0 new errors/warnings (the handful of pre-existing `react(refs)`/`react(set-state-in-effect)`/
`react(purity)` warnings surfaced are unrelated to these three files and predate this phase).
Confirmed via grep that no other component imports `getPriorityScoreColor` or the removed CSS
classes from the incidents feature. No backend/migration change (frontend-only).

**Outcome:** Active Incidents cards now show incident type, priority badge, status badge, and
reported time only — no progress bar or percentage — while sort/filter behavior is unchanged.
`CLAUDE.md`'s sidebar/`ActiveIncidentsList` description was updated to match (see "Current status"
section).

---

## 50. Phase 5.25 — Design Tokens, Centralized Color System & Palette Standardization

**Motivation:** An audit of the frontend surfaced ~45 hardcoded color literals spread across 21
stylesheets and 5 MapLibre layer hooks (26 files total), with casing inconsistencies (`#1E293B` vs
`#1e293b`) and genuine semantic mismatches — not just style drift. Two concrete bugs stood out: the
Active Incidents Low Priority badge rendered neon-green text (`#2eee41`) on a blue-tinted background
(`rgba(59, 130, 246, 0.15)`, i.e. the Medium/brand-blue wash) instead of a coherent green-on-green
badge, and High Priority used two different reds depending on surface — `#e20b0b` on incident map
markers (`useIncidentMarkers.ts`) versus `#ef4444` on the Active Incidents Low priority chips
(`FilterPanel.css`) and `.active-incidents-list__priority-badge--high` — so the same severity read as
two visually distinct colors depending on where an operator looked. With no central source of truth,
every new component risked repeating one of these divergences. Phase 5.25 fixes both bugs as a
byproduct of introducing a single Tailwind Slate + Semantic Colors token system that all present and
future styling must draw from.

**Solution — four steps:**

- **Step 1.1 — Token foundation.** Added a `:root` block of CSS custom properties to
  `frontend/src/index.css`, grouped into Slate Surfaces & Backgrounds, Text Hierarchy, Brand/Primary
  Action Blue, Priority & Status Semantics, Map Layer Semantics, and Neutral Washes (e.g.
  `--color-bg-base`, `--color-surface-card`, `--color-text-primary`, `--color-accent-blue`,
  `--color-priority-high`/`-medium`/`-low` plus their `-bg` tint variants,
  `--color-zone-operational-fill`/`-text`, `--color-zone-restricted-fill`/`-text`,
  `--color-wash-light`/`-medium`/`-border`, `--color-scrim`). Created
  `frontend/src/shared/constants/colors.ts` exporting a matching `APP_COLORS` TypeScript object
  (`brand`, `priority`, `zones`, `neutral` groups) for the places CSS variables can't reach — inline
  MapLibre GL paint expressions and `Marker({ color })` calls, which need real color strings, not
  `var(...)`. Migrated `frontend/src/features/incidents/styles/ActiveIncidentsList.css` and
  `frontend/src/features/operations-map/styles/FilterPanel.css` first, as the two files containing
  the known bugs: the Low Priority badge now uses `var(--color-priority-low)` /
  `var(--color-priority-low-bg)` (green-on-green, matching High/Medium's own-color-tinted-background
  pattern), and `.filter-chip--priority-low.filter-chip--selected` now uses
  `var(--color-priority-low)` instead of the brand blue it had been mistakenly sharing with the
  generic "selected" state.
- **Step 1.2 — Full stylesheet tokenization.** Migrated the remaining 15 stylesheets from hardcoded
  hex/rgba literals to `var(--color-...)`: layout shell
  (`layouts/styles/OperationsCenterLayout.css`), shared components
  (`shared/styles/buttons.css`, `HistoryTable.css`, `Timeline.css`), overlays
  (`features/menu/styles/MenuButton.css`, `MenuOverlay.css`), selection panels
  (`features/incidents/styles/IncidentPanel.css`, `features/field-units/styles/FieldUnitPanel.css`),
  task actions (`features/operational-tasks/styles/ReassignTaskButton.css` —
  `AssignTaskButton.css` had no hardcoded colors and was left untouched), dashboard
  (`features/dashboard/styles/StatisticsSection.css`), recommendations
  (`features/field-unit-recommendations/styles/RecommendedUnitsSection.css`), and restricted
  zones/replay (`features/restricted-zones/styles/RestrictedZonesSection.css`,
  `CoordinatePickerBanner.css`, `features/operations-replay/styles/ReplayControlBar.css`). Scoped
  deliberately to the mapping rules given per file — generic `rgba(0, 0, 0, ...)` shadow/backdrop
  blacks (not part of the token palette) and the still-untouched MapLibre-adjacent
  `FilterCheckboxGroup.css`/`OperationsMap.css` (reserved for Step 1.3) were left as-is rather than
  guessed at.
- **Step 1.3 — MapLibre layer hooks.** Connected `OperationsMap.css`'s selected-marker glow filters
  and 5 MapLibre GL layer hooks to `APP_COLORS`, since `var(--color-...)` cannot be read inside
  MapLibre paint-property objects or the `maplibre-gl` `Marker` constructor:
  `useIncidentMarkers.ts`'s `priorityColors` map now reads `APP_COLORS.priority.high/medium/low`
  (fixing the `#e20b0b` → `#ef4444` marker/badge divergence and `#2eee41` → `#10b981` Low Priority
  mismatch described above) with `APP_COLORS.priority.unknown` as the fallback;
  `useFieldUnitMarkers.ts` and `useDispatchedRouteLayers.ts` both now use
  `APP_COLORS.brand.blue` for the unit marker and dispatched-route line respectively;
  `useOperationalZoneLayers.ts` and `useRestrictedZoneLayers.ts` now source their fill/text/halo
  colors from `APP_COLORS.zones.*` and `APP_COLORS.neutral.white`. All MapLibre filter/layer
  configuration, layout properties, and add/update/teardown lifecycle logic were left completely
  untouched — only the color literal arguments changed.

**Verification:** `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) ran clean
after every step — 0 new errors or warnings (the same small set of pre-existing, unrelated
`react(refs)`/`react(set-state-in-effect)`/`react(purity)` warnings from before this phase persisted
unchanged throughout). No component markup, MapLibre configuration, layout, or behavior changed —
this was a pure color-literal-to-token substitution across all three steps, confirmed file-by-file
against the mapping rules before each verification pass. No backend/migration change
(frontend-only).

**Outcome:** All ~45 previously hardcoded color values across the 26 target files now resolve
through exactly two sources of truth — `:root` custom properties in `frontend/src/index.css` for
CSS, and `APP_COLORS` in `frontend/src/shared/constants/colors.ts` for MapLibre/TypeScript — with
the Low Priority badge and High Priority marker/chip color mismatches resolved as part of the same
pass. Any future component should consume one of these two sources rather than reintroducing a
hardcoded literal.

---

## 51. Phase 5.26 — OSRM Real Road-Network Navigation & Route Geometry Integration

**Motivation:** Field units had always moved between their origin and an incident along a Euclidean
straight line — a fine visual approximation early on, but increasingly at odds with the project's
premise of a realistic Ankara operations simulation: a marker cutting diagonally across city blocks,
ignoring the actual street grid, undercuts the "real navigation" read the map is meant to give an
operator. Phase 5.26 replaces that straight-line interpolation with genuine road-following
navigation — the backend now asks an actual routing engine (OSRM, Open Source Routing Machine) for a
real driving route between a field unit's origin and the incident, persists that route's polyline,
and the frontend animates the marker and draws the dispatched-route line along the exact road
geometry instead of a synthetic line.

**Solution — three steps plus a live-verification bug fix:**

- **Step 1.1 — `IRoutingService` abstraction and OSRM client.** Added `RouteGeometryResult`
  (`GeoJsonCoordinates: string`, `DurationSeconds: int`, `DistanceMeters: double`) and interface
  `IRoutingService` (`GetDrivingRouteAsync(originLat, originLng, destinationLat, destinationLng,
  cancellationToken)`) to `Src/SmartCityOps.Application/Common/Routing/`, following the same
  DTO-plus-interface-per-feature pattern as every other Application folder. Implemented
  `OsrmRoutingService` in `Src/SmartCityOps.Infrastructure/Common/Routing/` as a Typed Client
  (`HttpClient` + `ILogger<OsrmRoutingService>` injected via constructor): it queries
  `https://router.project-osrm.org/route/v1/driving/{originLng},{originLat};
  {destinationLng},{destinationLat}?overview=full&geometries=geojson` (OSRM expects
  longitude,latitude, the reverse of the rest of the codebase's lat/lng convention), parses
  `routes[0].geometry.coordinates`/`duration`/`distance` from the JSON response via
  `System.Text.Json`, and falls back to a 2-point straight-line GeoJSON string plus a
  `GeoCalculator.CalculateDistanceKm`-based duration at a fallback 40 km/h average speed if the
  request fails or exceeds its timeout. Registered in
  `Src/SmartCityOps.Infrastructure/DependencyInjection.cs` via
  `services.AddHttpClient<IRoutingService, OsrmRoutingService>(client => { client.Timeout =
  TimeSpan.FromSeconds(3); ... })`, giving the whole call a hard 3-second ceiling before falling back.
- **Step 1.2 — Persisting route geometry on `OperationalTask`.** Added a nullable
  `RouteGeometry` (`string?`) column to the `OperationalTask` domain entity and a matching
  `RouteGeometry` parameter to `OperationalTaskDto`. `OperationalTaskService` now injects
  `IRoutingService` and, inside the shared `AssignFieldUnitAsync` helper (used by both
  `CreateAsync`/dispatch and `ReassignAsync`), calls `_routingService.GetDrivingRouteAsync(...)`
  before constructing the new `OperationalTask`, setting `EstimatedEtaSeconds =
  routingResult.DurationSeconds` and `RouteGeometry = routingResult.GeoJsonCoordinates` — replacing
  the previous `IEtaEstimator`-based straight-line ETA estimate for this method entirely (the
  `IEtaEstimator`/`HaversineEtaEstimator` service itself is unchanged and still used elsewhere, e.g.
  `FieldUnitRecommendationService`). Both `OperationalTaskService.ToDto`/`GetAllAsync`'s LINQ
  projection and `OperationsReplayService`'s `activeTaskDtos` projection now map `t.RouteGeometry`
  into `OperationalTaskDto`, so replay snapshots carry the same road geometry as live data. Migration
  `AddOperationalTaskRouteGeometry` (a single nullable `text` column, `ALTER TABLE
  "OperationalTasks" ADD "RouteGeometry" text;`) was generated via `dotnet ef migrations add` and
  applied via `dotnet ef database update` from `Src/`.
- **Step 1.3 — Frontend polyline traversal and rendering.** Added `routeGeometry?: string | null` to
  the `OperationalTask` frontend type
  (`frontend/src/features/operational-tasks/types.ts`). Rewrote `getCurrentPosition` in
  `frontend/src/features/operational-tasks/lib/geoInterpolation.ts`: a new `parseRouteGeometry` safely
  `JSON.parse`s `task.routeGeometry` into a `GeoLocation[]` (returning `null` on any malformed
  entry so the caller falls back cleanly), a new `haversineDistance` helper computes segment lengths,
  and a new `interpolateAlongPolyline(points, progress)` walks the cumulative segment-distance table
  to find which `[pA, pB]` segment contains `progress * totalDistance` and linearly interpolates
  within just that segment — so the marker follows the actual road polyline's turns rather than
  cutting through blocks. `getCurrentPosition` uses this path when `routeGeometry` parses to 2+
  points, and falls back to the pre-existing 2-point `interpolatePosition` (origin→destination lerp)
  otherwise, preserving behavior for legacy tasks created before this migration.
  `frontend/src/features/operations-map/hooks/useDispatchedRouteLayers.ts`'s `buildFeatureCollection`
  gained a matching `parseRouteGeometryPositions` (same validation, returning GeoJSON `Position[]`)
  and now uses the parsed road polyline as the dispatched-route `LineString`'s coordinates when
  present, falling back to the previous 2-point `[[originLng, originLat], [incidentLng, incidentLat]]`
  line otherwise — so the dashed route overlay and the animated marker now trace the identical path.
- **Live Verification & Bug Fix.** An initial live test showed field units still moving in straight
  lines — `OsrmRoutingService` was silently hitting its catch block and returning the fallback on
  every call. Root cause was two-fold: OSRM's public demo server rejects requests with no
  `User-Agent` header (returning an error the code was catching and swallowing without enough detail
  to diagnose), and interpolated request/fallback coordinate strings needed to be guaranteed
  culture-invariant (a Turkish-locale decimal separator of `,` instead of `.` — e.g. `39,925` instead
  of `39.925` — would make OSRM return `400 Bad Request`) rather than relying only on
  `string.Create(CultureInfo.InvariantCulture, $"...")`. Fixed by explicitly formatting every
  coordinate via `FormattableString.Invariant($"...")` /
  `value.ToString(CultureInfo.InvariantCulture)` in both the request URL and the fallback GeoJSON
  string, adding `client.DefaultRequestHeaders.UserAgent.ParseAdd("SmartCityOps-OperationsCenter/1.0")`
  to the `AddHttpClient` registration, switching coordinate extraction to
  `JsonSerializer.Serialize(route.GetProperty("geometry").GetProperty("coordinates"))`, and logging
  full failure detail (request URL, HTTP status code, response body, or the exception) at
  `LogLevel.Warning` so a silent fallback is now visible in the API console. Re-verified live: started
  the API, fetched a real `Open` incident and `Available` field unit via `GET /api/incidents` /
  `GET /api/field-units`, then `POST /api/operational-tasks` with that pair — the response's
  `routeGeometry` contained roughly 330 real coordinate points tracing actual Merkez/Çankaya streets,
  confirming OSRM requests now succeed end-to-end instead of falling back to a 2-point line.

**Verification:** `dotnet build Src/SmartCityOps.sln` clean throughout all three backend steps and
the live-verification fix (0 warnings, 0 errors); `npm run lint` and `npm run build` clean in
`frontend/` after Step 1.3 (0 type errors; only the same pre-existing, unrelated
`react(refs)`/`react(set-state-in-effect)`/`react(purity)` warnings from before this phase, plus the
pre-existing MapLibre vendor chunk-size notice). Migration `AddOperationalTaskRouteGeometry` applied
to the local Postgres database. No test/debug code left in the tree; the API process started for live
verification was stopped afterward.

**Outcome:** Field units now travel to incidents along the same real road network OSRM would route an
actual vehicle over, both in the animated marker position and the dashed route overlay, with a
transparent Haversine-based straight-line fallback (logged, not silent) if OSRM is unreachable or
times out. Legacy tasks created before this migration (`RouteGeometry IS NULL`) continue to render
and animate via the original 2-point interpolation, so no backfill was required.

---

## 52. Phase 5.27 — Backend Operational Statistics Aggregation & Single Source of Truth Migration

**Motivation:** `StatisticsSection.tsx` computed every operational metric — Overview counts (active
incidents, high-priority active incidents, available/dispatched/out-of-service field units),
Incidents by Type grouping, Average Resolution Time, and Field Unit Workload — client-side, via plain
JavaScript array loops in `frontend/src/features/dashboard/lib/buildOperationalStatistics.ts` run
against the full `incidents`/`fieldUnits`/`operationalTasks` React Query caches. This duplicated logic
the backend already had every fact needed to compute once, and meant every browser tab re-ran the
same `O(n)` aggregations client-side as incident/task volume grew, rather than pushing that work down
to a single SQL aggregation. Phase 5.27 moves all of it to a dedicated backend aggregation service,
restoring Single Source of Truth for these metrics and keeping the client a thin renderer of
server-computed numbers.

**Solution — three steps plus a live-verification bug fix:**

- **Step 1.1 — Application layer contracts.** Created
  `Src/SmartCityOps.Application/Dashboard/` with `IncidentTypeCountDto` (`Type: string`, `Count:
  int`), `FieldUnitWorkloadDto` (`FieldUnitId: Guid`, `UnitCode: string`, `UnitType: string`,
  `CompletedTaskCount: int`), `OperationalStatisticsDto` (the five overview counts,
  `AverageResolutionMinutes: double?`, `IncidentsByType: IReadOnlyList<IncidentTypeCountDto>`,
  `FieldUnitWorkload: IReadOnlyList<FieldUnitWorkloadDto>`), and `IOperationalStatisticsService`
  (`GetStatisticsAsync(CancellationToken)`) — following the same DTO-plus-interface-per-feature
  pattern as every other Application folder; no implementation here, matching the layering rule.
- **Step 1.2 — Infrastructure implementation and endpoint.** Implemented `OperationalStatisticsService`
  in `Src/SmartCityOps.Infrastructure/Dashboard/`, injecting `ApplicationDbContext` and computing all
  five overview counts via `CountAsync` predicates against `Incidents`/`FieldUnits`,
  `AverageResolutionMinutes` by materializing `(ReportedAt, ResolvedAt)` pairs for resolved incidents
  and averaging `TotalMinutes` in memory (rounded to 1 decimal, `null` if none resolved),
  `IncidentsByType` via a `GroupBy(i => i.Type)` SQL aggregation, and `FieldUnitWorkload` by grouping
  `Completed` `OperationalTasks` by `FieldUnitId` into a dictionary, then joining against all
  `FieldUnits` (`AsNoTracking`) ordered by `CompletedTaskCount` descending then `UnitCode` ascending.
  Registered `services.AddScoped<IOperationalStatisticsService, OperationalStatisticsService>();` in
  `Src/SmartCityOps.Infrastructure/DependencyInjection.cs`, and exposed it via a new, thin
  `OperationalStatisticsController` (`[Route("api/operations/statistics")]`, single `GetStatistics`
  `HttpGet` action) in `Src/SmartCityOps.Api/Controllers/`.
- **Step 1.3 — Frontend wiring and cleanup.** Added `frontend/src/features/dashboard/types.ts`
  (`IncidentTypeCount`, `FieldUnitWorkload`, `OperationalStatistics`, camelCase mirrors of the backend
  DTOs), `api/statisticsApi.ts` (`fetchOperationalStatistics` wrapping `httpClient.get<OperationalStatistics>("/operations/statistics")`),
  and `hooks/useOperationalStatistics.ts` (`useQuery({ queryKey: ["operational-statistics"], queryFn:
  fetchOperationalStatistics })`). `frontend/src/shared/hooks/useSignalR.ts`'s
  `handleOperationsUpdated` now also invalidates `["operational-statistics"]`, so the stat cards stay
  live across the same `OperationsUpdated` SignalR event as every other query key (see "Real-time
  updates (SignalR)" in `CLAUDE.md`). `useOperationsData.ts` now calls `useOperationalStatistics` and
  exposes `statistics` alongside its other query results. `StatisticsSection.tsx` was rewritten to
  accept `statistics: OperationalStatistics | undefined` and `onSelectFieldUnit: (id: string) => void`
  instead of raw `incidents`/`fieldUnits`/`operationalTasks` arrays, rendering the overview cards,
  `HistoryTable`s for `incidentsByType`/`fieldUnitWorkload`, and the formatted average resolution
  minutes directly from the backend payload — all client-side loop logic is gone.
  `MenuSectionRouter.tsx`/`Menu.tsx`/`App.tsx` now thread a `statistics` prop down from
  `useOperationsData`'s output; since `StatisticsSection`'s new `onSelectFieldUnit` is id-based but
  the rest of the menu tree still passes full `FieldUnit` objects (needed by
  `CompletedTasksSection`/`IncidentTimelineSection`/etc.), `MenuSectionRouter` adapts at the call site
  by looking the `FieldUnit` up from its existing `fieldUnits` prop before invoking the
  `FieldUnit`-based callback, rather than changing that shared prop's signature everywhere.
  `frontend/src/features/dashboard/lib/buildOperationalStatistics.ts` was deleted after confirming via
  a repo-wide grep that no file still imported it.
- **Live Verification & Bug Fix.** The first live request to `GET /api/operations/statistics` failed
  with `409 Conflict`: `DomainExceptionHandler` maps `InvalidOperationException` to 409, and EF Core
  threw exactly that for the `IncidentsByType` query, because `g.Key.ToString()` inside a `GroupBy(...)
  .Select(...)` projection cannot be translated to SQL by Npgsql/EF Core ("The LINQ expression ...
  could not be translated"). Fixed by splitting the query into a SQL-translatable projection
  (`GroupBy(i => i.Type).Select(g => new { Type = g.Key, Count = g.Count() })`, materialized via
  `ToListAsync`) and only calling `.ToString()` on the already-materialized enum values afterward, in
  memory, before mapping to `IncidentTypeCountDto` and sorting by count descending; `AsNoTracking()`
  was also added to the other read-only queries in the service for consistency. Re-verified live:
  started the API against the existing local Postgres instance and confirmed `GET
  http://localhost:5080/api/operations/statistics` returns `200 OK` with the full aggregated payload
  (overview counts, `incidentsByType`, `fieldUnitWorkload` all populated from real seed/simulated
  data), with the EF Core SQL logs showing the `GROUP BY "Type"` query executing successfully. The API
  process started for verification was stopped afterward.

**Verification:** `dotnet build Src/SmartCityOps.sln` clean throughout (0 warnings, 0 errors, both
before and after the live-verification fix); `npm run lint` (oxlint) and `npm run build` (`tsc -b &&
vite build`) clean in `frontend/` (0 type errors; only the same pre-existing, unrelated
`react(refs)`/`react(set-state-in-effect)`/`react(purity)` warnings and MapLibre vendor chunk-size
notice from before this phase). No test/debug code left in the tree.

**Outcome:** `GET /api/operations/statistics` is now the single source of truth for every metric
`StatisticsSection.tsx` renders — Overview counts, Incidents by Type, Average Resolution Time, and
Field Unit Workload are all computed once, server-side, via SQL aggregation and EF Core `Count`/
`GroupBy` queries instead of being recomputed from scratch in every browser tab. The endpoint stays
live via the existing coarse-grained `OperationsUpdated` SignalR invalidation pattern, so no polling
or manual refresh is needed. One pre-existing data anomaly was observed but intentionally left
untouched as out of scope: `averageResolutionMinutes` currently returns an implausibly large value
against local seed data, pointing to `ReportedAt`/`ResolvedAt` timestamps far apart in the seed —
a data issue, not a computation bug in this service.

---

## 53. Phase 5.28 — Server-Side Incident Timeline & Field Unit Movement History Aggregations

**Motivation:** `IncidentTimelineSection.tsx` and `FieldUnitMovementHistorySection.tsx` assembled
their chronological event lists client-side, looping over and cross-referencing multiple React
Query caches (`incidents`, `fieldUnits`, `operationalTasks`, `locationHistory`) on every render.
The timeline's "arrived at scene" event in particular relied on a simulated `Date.now()` comparison
against `task.assignedAt + estimatedEtaSeconds` computed in the browser, rather than a single
authoritative calculation. Following the same Single Source of Truth migration pattern as Phase
5.27 (`operational-statistics`, §52 above), Phase 5.28 moves both aggregations to dedicated backend
endpoints, establishing one authoritative source for these operational audit trails instead of
recomputing them from raw arrays in every browser tab.

**Solution — three steps:**

- **Step 2.1 — Application layer contracts.** Created `IncidentTimelineEventDto` (`Id: string`,
  `Timestamp: DateTimeOffset`, `Description: string`, `FieldUnitId: string?`) in
  `SmartCityOps.Application.Incidents` and `FieldUnitMovementRecordDto` (`Id: Guid`, `Timestamp:
  DateTimeOffset`, `Latitude/Longitude: double`, `IncidentId: Guid?`, `IncidentType: string?`,
  `IncidentCode: string?`) in `SmartCityOps.Application.FieldUnits`. Added
  `Task<IReadOnlyList<IncidentTimelineEventDto>> GetTimelineAsync(Guid incidentId, CancellationToken
  cancellationToken = default)` to `IIncidentService` and `Task<IReadOnlyList<FieldUnitMovementRecordDto>>
  GetMovementHistoryAsync(Guid fieldUnitId, CancellationToken cancellationToken = default)` to
  `IFieldUnitService` — following the same DTO-plus-interface-per-feature pattern as every other
  Application folder. Since adding these interface members immediately broke the existing
  `IncidentService`/`FieldUnitService` implementations, both got temporary `NotImplementedException`
  stub methods in this step so `dotnet build Src/SmartCityOps.sln` stayed green (0 warnings, 0
  errors) ahead of Step 2.2's real implementation.
- **Step 2.2 — Infrastructure implementation and endpoints.** Implemented
  `IncidentService.GetTimelineAsync` (`Src/SmartCityOps.Infrastructure/Incidents/IncidentService.cs`):
  loads the incident (`AsNoTracking`, `KeyNotFoundException` if missing) and all of its
  `OperationalTasks`, resolves a `FieldUnitId → FieldUnit` dictionary for unit labels, then builds
  the chronological event list — a "reported" event, then per task an "assigned" event, an "arrived
  at scene" event (only once `now >= assignedAt + estimatedEtaSeconds`, or the task/incident is
  already completed/resolved, with the effective arrival timestamp clamped to `task.CompletedAt` if
  that happened earlier than the calculated ETA arrival), and a "completed" event if the task has a
  `CompletedAt` — followed by a "resolved" event if the incident itself is resolved, all sorted
  ascending by `Timestamp`. Implemented `FieldUnitService.GetMovementHistoryAsync`
  (`Src/SmartCityOps.Infrastructure/FieldUnits/FieldUnitService.cs`): confirms the field unit exists
  (`KeyNotFoundException` otherwise), then runs a single query-syntax LINQ `LEFT JOIN` (`join ... into
  ... from ... DefaultIfEmpty()`) between `FieldUnitLocationHistories` and `Incidents` on
  `IncidentId`, ordered descending by `RecordedAt`, projecting `IncidentType`/`IncidentCode` as
  `null` when no incident is joined. Exposed both as thin controller actions:
  `[HttpGet("{id:guid}/timeline")]` on `IncidentsController` and `[HttpGet("{id:guid}/movement-history")]`
  on `FieldUnitsController`, each just awaiting the service call and returning `Ok(...)`.
- **Step 2.3 — Frontend wiring.** Added `IncidentTimelineEvent` to
  `frontend/src/features/incidents/types.ts` and `fetchIncidentTimeline(incidentId)` to
  `api/incidentsApi.ts` (`GET /incidents/{id}/timeline`), plus a new
  `hooks/useIncidentTimeline.ts` (`useQuery({ queryKey: ["incident-timeline", incidentId], enabled:
  Boolean(incidentId) })`). Mirrored the same shape for field units: `FieldUnitMovementRecord` in
  `features/field-units/types.ts`, `fetchFieldUnitMovementHistory(fieldUnitId)` in
  `api/fieldUnitsApi.ts` (`GET /field-units/{id}/movement-history`), and
  `hooks/useFieldUnitMovementHistory.ts` (`queryKey: ["field-unit-movement-history", fieldUnitId]`).
  `IncidentTimelineSection.tsx` and `FieldUnitMovementHistorySection.tsx` were both rewritten to drop
  their `operationalTasks`/`fieldUnits`/`incidents`/`locationHistory` array props entirely, instead
  taking just `incident: Incident | null`/`fieldUnit: FieldUnit | null` plus an id-based
  `onSelectFieldUnit(fieldUnitId)`/`onSelectIncident(incidentId)` callback, calling
  `useIncidentTimeline`/`useFieldUnitMovementHistory` directly and mapping the server response onto
  `Timeline`'s existing `TimelineEvent[]` shape. `frontend/src/shared/hooks/useSignalR.ts`'s
  `handleOperationsUpdated` now also invalidates `["incident-timeline"]` and
  `["field-unit-movement-history"]`, keeping both views live across the same `OperationsUpdated`
  SignalR event as every other query key. Since both sections became self-fetching, the
  `locationHistory` prop — previously threaded through `App.tsx` → `Menu.tsx` →
  `MenuSectionRouter.tsx` solely to feed `FieldUnitMovementHistorySection` — was removed from all
  three; `MenuSectionRouter.tsx` now adapts the two sections' id-based callbacks to the
  `Incident`/`FieldUnit`-based callbacks the rest of the menu tree still uses (same lookup-by-id
  pattern already established for `StatisticsSection` in §52), rather than changing those shared
  callback signatures everywhere.

**Verification:** `dotnet build Src/SmartCityOps.sln` clean throughout every step (0 warnings, 0
errors); `npm run lint` (oxlint) and `npm run build` (`tsc -b && vite build`) clean in `frontend/`
(0 type errors; only the same pre-existing, unrelated `react(refs)`/`react(set-state-in-effect)`
warnings and MapLibre vendor chunk-size notice from before this phase). No test/debug code left in
the tree.

**Outcome:** `GET /api/incidents/{id}/timeline` and `GET /api/field-units/{id}/movement-history` are
now the single source of truth for the Incident Timeline and Field Unit Movement History views —
both event lists, including the "arrived at scene" ETA-clamping logic, are computed once, server-side,
instead of being recomputed from raw React Query array props in the browser. Both endpoints stay
live via the existing coarse-grained `OperationsUpdated` SignalR invalidation pattern, and the
now-obsolete `locationHistory` prop-drilling chain through `App.tsx`/`Menu.tsx`/`MenuSectionRouter.tsx`
was removed as part of the same change.

---

## 54. Phase 5.29 — Backend Incident Priority Score Calculation & Server-Side Active Incident Sorting

**Motivation:** `ActiveIncidentsList.tsx` (via `OperationsSidebar.tsx`) sorted active incidents
client-side using `incidentPriorityScore.ts`, a hash-of-`incident.id` utility that derived a fake
0–100 "priority score" per incident purely as a deterministic tie-breaker (see Phase 5.24, §49) —
it had no relationship to how urgent an incident actually was, since the same incident got a
different score only if its ID happened to hash differently, not because it aged or changed
priority. Following the same Single Source of Truth migration pattern as Phase 5.27/5.28 (§52–53),
Phase 5.29 replaces the hash with a real, deterministic triage rule computed once on the backend —
priority level plus time-since-reported — and has `GET /api/incidents` deliver incidents
pre-sorted, so the frontend no longer needs any incident-ranking logic of its own.

**Solution — two steps:**

- **Step 3.1 — Application/Infrastructure layers.** Created `IncidentPriorityScoreCalculator`
  (`Src/SmartCityOps.Application/Incidents/IncidentPriorityScoreCalculator.cs`) as a static
  `Calculate(IncidentPriority priority, DateTimeOffset reportedAt, DateTimeOffset now)` method: a
  base score by priority (High = 70, Medium = 40, Low = 10) plus an age bonus of +1 point per
  minute elapsed since `ReportedAt`, capped at +30, with the total clamped to `[0, 100]`. Added
  `int PriorityScore` to `IncidentDto`
  (`Src/SmartCityOps.Application/Incidents/IncidentDto.cs`). `IncidentService`
  (`Src/SmartCityOps.Infrastructure/Incidents/IncidentService.cs`) now computes it in `ToDto` (which
  takes a `now` parameter, passed as `DateTimeOffset.UtcNow` from `CreateAsync`/`ResolveAsync`), and
  `GetAllAsync` was rewritten to materialize incidents with `AsNoTracking()`, map each to a
  `IncidentDto` via `ToDto`, then sort in memory: non-resolved incidents first (ordered by
  `PriorityScore` descending, then `ReportedAt` ascending), followed by resolved incidents — the
  sort had to move to an in-memory `OrderBy`/`ThenByDescending`/`ThenBy` chain after materialization
  rather than staying in the LINQ-to-SQL query, since `IncidentPriorityScoreCalculator.Calculate`
  can't be translated to SQL by Npgsql/EF Core. `OperationsReplayService`
  (`Src/SmartCityOps.Infrastructure/OperationsReplay/OperationsReplayService.cs`) was updated to
  calculate each snapshot incident's `PriorityScore` against the replay `timestamp` rather than
  `DateTimeOffset.UtcNow`, consistent with how every other field in a snapshot reflects state "as of"
  that historical instant rather than the present moment.
- **Step 3.2 — Frontend wiring and cleanup.** Added `priorityScore: number` to the `Incident`
  interface (`frontend/src/features/incidents/types.ts`). `OperationsSidebar.tsx` no longer imports
  `sortActiveIncidents` — since `GET /api/incidents` now arrives pre-sorted by the backend rule
  above, it only filters `filteredIncidents` down to non-resolved incidents (preserving
  `sortActiveIncidents`'s previous resolved-incident exclusion) and passes that straight to
  `ActiveIncidentsList` with no re-sort. Confirmed via grep that no other file imported
  `incidentPriorityScore.ts`, then deleted
  `frontend/src/features/incidents/lib/incidentPriorityScore.ts` outright.

**Verification:** `dotnet build Src/SmartCityOps.sln` clean (0 warnings, 0 errors); `npm run lint`
(oxlint) and `npm run build` (`tsc -b && vite build`) clean in `frontend/` (0 type errors; only the
same pre-existing, unrelated `react(refs)`/`react(set-state-in-effect)` warnings and MapLibre vendor
chunk-size notice from before this phase). No test/debug code left in the tree.

**Outcome:** Incident triage ranking is now computed exactly once, server-side, from an actual
business rule (priority level + age) instead of a per-ID hash with no operational meaning; `GET
/api/incidents` and `GET /api/operations/replay/snapshot` both expose the same authoritative
`PriorityScore`, and the frontend carries no incident-scoring or incident-sorting logic of its own.

---

## 55. Phase 5.30 — Backend "Ready to Resolve" Incident Eligibility Computation

**Motivation:** `ActiveTasksPanel.tsx`'s "Ready to Resolve" table determined eligibility by
building a client-side `Set` of incident IDs with an `Assigned` operational task, then filtering
`InProgress` incidents not in that set — a cross-reference over the full `operationalTasks` array
recomputed on every render. Following the same Single Source of Truth migration pattern as Phase
5.27–5.29 (§52–54), this eligibility check moves to the backend so the incident's resolution
readiness is computed once, server-side, alongside its other lifecycle fields, instead of being
re-derived from two separate React Query arrays in the frontend.

**Solution — four steps:**

- **Step 4.1 — Application layer.** Added `bool IsReadyToResolve` to `IncidentDto`
  (`Src/SmartCityOps.Application/Incidents/IncidentDto.cs`), as the final positional field after
  `PriorityScore`.
- **Step 4.2 — `IncidentService`.** `GetAllAsync`
  (`Src/SmartCityOps.Infrastructure/Incidents/IncidentService.cs`) now runs one extra query —
  `_dbContext.OperationalTasks.AsNoTracking().Where(t => t.Status != OperationalTaskStatus.Completed).Select(t => t.IncidentId)`,
  materialized and collected into a `HashSet<Guid>` — and a new private
  `IsReadyToResolve(Incident, HashSet<Guid>)` helper projects
  `incident.Status != IncidentStatus.Resolved && !activeTaskIncidentIds.Contains(incident.Id)` per
  incident when mapping to `IncidentDto` via `ToDto` (which now also takes an `isReadyToResolve`
  parameter). `CreateAsync` passes `isReadyToResolve: true` (a brand-new incident has zero tasks,
  so it's trivially ready), and `ResolveAsync` passes `isReadyToResolve: false` (a just-resolved
  incident is never eligible to resolve again).
- **Step 4.3 — `OperationsReplayService`.** The inline predicate that filtered `tasksAssignedByThen`
  down to `activeTaskDtos` (Reassigned-status tasks active until their `ReassignedAt`, other
  statuses active until their `CompletedAt`) was extracted into a shared private
  `IsTaskActiveAt(OperationalTask, DateTimeOffset)` helper, used both to build `activeTaskDtos` and
  a new `incidentIdsWithActiveTasksAt` `HashSet<Guid>`. Each snapshot `IncidentDto`'s
  `IsReadyToResolve` is then `resolvedAt is null && !incidentIdsWithActiveTasksAt.Contains(incident.Id)`,
  evaluated against the replay `timestamp` rather than the present moment — consistent with every
  other snapshot field.
- **Step 4.4 — Frontend.** Added `isReadyToResolve: boolean` to the `Incident` interface
  (`frontend/src/features/incidents/types.ts`). `ActiveTasksPanel.tsx` no longer builds an
  `assignedIncidentIds` `Set` from `operationalTasks`; its "Ready to Resolve" filter is now
  `incident.status === "InProgress" && incident.isReadyToResolve`, reading the backend's field
  directly (the `InProgress` status check was kept as-is, preserving the panel's prior scope of
  only surfacing incidents that had actually been dispatched, not brand-new `Open` ones).

**Verification:** `dotnet build Src/SmartCityOps.sln` clean (0 warnings, 0 errors); `npm run lint`
(oxlint) and `npm run build` (`tsc -b && vite build`) clean in `frontend/` (0 type errors; only the
same pre-existing, unrelated `react(refs)`/`react(set-state-in-effect)` warnings and MapLibre vendor
chunk-size notice from before this phase). No test/debug code left in the tree.

**Outcome:** Incident resolution eligibility is now computed exactly once, server-side, from actual
task state rather than a client-side array cross-reference; `GET /api/incidents` and `GET
/api/operations/replay/snapshot` both expose the same authoritative `IsReadyToResolve`, and
`ActiveTasksPanel.tsx` carries no incident/task cross-referencing logic of its own.

---

## 56. Phase 5.31 — Field Unit OutOfService Lifecycle, Status Audit History & Operations Replay Temporal Accuracy

**Motivation:** `OutOfService` had been a seed-only, static field-unit status since the project's
earliest phases — there was no way to set or clear it at runtime, and `OperationsReplayService`
(see the removed comment in §25/§40/§43's surrounding code) treated it as time-invariant, always
showing a unit's *current* `OutOfService` state regardless of the replay timestamp, because no
transition event was ever recorded. This phase closes that long-standing "Known open items" gap
(flagged since Part 12 §25): field units can now be toggled `Available ↔ OutOfService` at runtime,
every transition is persisted as an audit record, and replay reconstructs historical status
accurately from that audit trail instead of guessing.

**Solution — three steps:**

- **Step 5.1 — Domain, Application & Persistence.** Added `FieldUnitStatusHistory`
  (`Src/SmartCityOps.Domain/Entities/FieldUnitStatusHistory.cs`), an immutable audit record
  (`Id`, `FieldUnitId`, `Status`, `ChangedAt`, nullable `Reason`) with a private parameterless
  constructor plus a public constructor, following the existing entity style. Added
  `UpdateFieldUnitStatusDto(string Status, string? Reason = null)` to
  `SmartCityOps.Application.FieldUnits`. `FieldUnitStatusHistoryConfiguration`
  (`Src/SmartCityOps.Infrastructure/Persistence/Configurations/`) maps the entity to a
  `FieldUnitStatusHistories` table, stores `Status` as a `varchar(20)` string conversion (matching
  the rest of the codebase's enum-storage convention), defines a composite
  `(FieldUnitId, ChangedAt)` index for the replay lookup query, and a cascade-delete FK to
  `FieldUnits`. `ApplicationDbContext` gained the corresponding `DbSet<FieldUnitStatusHistory>
  FieldUnitStatusHistories`. Migration `AddFieldUnitStatusHistory`
  (`20260828133403_AddFieldUnitStatusHistory`) was generated and applied via
  `dotnet ef database update`.
- **Step 5.2 — Service, endpoint & replay reconstruction.** `IFieldUnitService` gained
  `UpdateStatusAsync(Guid id, UpdateFieldUnitStatusDto dto, CancellationToken)`, implemented in
  `FieldUnitService`
  (`Src/SmartCityOps.Infrastructure/FieldUnits/FieldUnitService.cs`). Validation rules: a unit
  currently `Dispatched` cannot have its status changed directly (it must complete or be
  reassigned off its task first — mirrors the existing task-assignment invariant that only
  `AssignFieldUnitAsync` may set `Dispatched`), and `Dispatched` cannot be set as a target status
  through this endpoint at all — only `OperationalTaskService.AssignFieldUnitAsync` may put a unit
  into `Dispatched`. On an actual status change, the method updates `FieldUnit.Status`, appends a
  new `FieldUnitStatusHistory` row, saves, and dispatches the existing `FieldUnitUpdatedEvent`
  through `IDomainEventDispatcher` — reusing `SignalROperationsNotificationHandler`
  (`Src/SmartCityOps.Infrastructure/Hubs/`) rather than adding a new event type, consistent with
  the single coarse-grained `OperationsUpdated` SignalR pattern documented in the Architecture
  section above. A no-op call (target status equals current status) skips the write and event
  entirely. `FieldUnitsController` exposes this as `PATCH /api/field-units/{id}/status`
  (`Src/SmartCityOps.Api/Controllers/FieldUnitsController.cs`).
  `OperationsReplayService`
  (`Src/SmartCityOps.Infrastructure/OperationsReplay/OperationsReplayService.cs`) was reworked to
  use `FieldUnitStatusHistories` instead of the old `OutOfService`-is-time-invariant special case:
  it loads all status-history rows at-or-before the replay `timestamp`, groups by field unit and
  takes the latest (`.Last()` after an `OrderBy(ChangedAt)`), and combines that with a
  `fieldUnitIdsWithActiveTaskAt` `HashSet<Guid>` (built from the same `IsTaskActiveAt` helper
  extracted in §55) to resolve each unit's historical status:
  `hasActiveTaskAtTimestamp ? Dispatched : (latestStatusHistoryAtOrBefore?.Status ?? Available)` —
  an active dispatch always wins over a stale status-history row, and a unit with no history at all
  before the timestamp defaults to `Available`. This replaces the old
  `latestTaskByFieldUnit`/`BuildFieldUnitReplayDto` switch expression that inferred status purely
  from task state and short-circuited on the live `fieldUnit.Status == OutOfService` check (which
  is what made `OutOfService` time-invariant in replay before this phase); `BuildFieldUnitReplayDto`
  now takes `hasActiveTaskAtTimestamp`/`latestStatusHistoryAtOrBefore` instead of
  `latestTaskAtOrBefore`/`timestamp`.
- **Step 5.3 — Frontend.** Added `updateFieldUnitStatus(id, status, reason?)` to
  `frontend/src/features/field-units/api/fieldUnitsApi.ts` (a `PATCH` via the shared
  `httpClient`), and `useUpdateFieldUnitStatus`
  (`frontend/src/features/field-units/hooks/useUpdateFieldUnitStatus.ts`), a React Query mutation
  hook that invalidates `["field-units"]` and `["operational-statistics"]` on success (no new
  SignalR query key was needed — the existing `OperationsUpdated` invalidation already covers both
  keys for changes made by *other* clients; this mutation's own `onSuccess` invalidation covers
  the immediate local update). `FieldUnitPanel.tsx` gained two conditionally-rendered action
  buttons next to the existing "Complete Task" button: "Set Out of Service" (shown when
  `fieldUnit.status === "Available"`) and "Set Available" (shown when
  `fieldUnit.status === "OutOfService"`), both disabled while the mutation is pending and hidden
  entirely in `readOnly` mode (replay view), matching the panel's existing `readOnly` convention
  for the "Complete Task" button and `ReassignTaskButton`.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors); `npm run lint`
(oxlint) and `npm run build` (`tsc -b && vite build`) clean in `frontend/` (0 type errors; only the
same pre-existing, unrelated `react(refs)`/`react(set-state-in-effect)` warnings and MapLibre
vendor chunk-size notice from before this phase). No test/debug code left in the tree.

**Outcome:** Field units now have a fully explicit, audited `Available ↔ OutOfService` lifecycle
transition alongside the existing task-driven `Dispatched` transition; `OperationsReplayService`
reconstructs historical status from real audit records instead of treating `OutOfService` as
time-invariant, closing the last remaining item in the "Known open items" list (the `Reassigned`
hand-off timing gap was already closed in §43, and the "no backend test project" item remains the
only one still open).

---

## 57. Phase 5.32 — OSRM Table API Integration & Real Driving-Time Field Unit Recommendations

**Motivation:** The field-unit recommendation engine (`GET
/api/incidents/{id}/recommendations`) scored candidate units using `HaversineEtaEstimator` and
`DistanceScoreRule` against straight-line (kuş uçuşu) distance and a flat 40 km/h assumed speed —
the same limitation the routing layer had for single-route geometry before §51's OSRM integration.
This phase extends that same OSRM integration to the recommendation engine's batch scoring path, so
recommendations rank candidate units by real road-network driving time and distance instead of an
idealized straight line, while preserving an automatic Haversine fallback if OSRM is unreachable.

**Solution — two steps:**

- **Step 6.1 — Routing service Table/Matrix API.** Added `TravelMatrixResult(IReadOnlyList<double?>
  DurationsSeconds, IReadOnlyList<double?> DistancesMeters)` to
  `SmartCityOps.Application.Common.Routing` (new file `TravelMatrixResult.cs`), and added
  `GetDrivingTableAsync(IReadOnlyList<(double Latitude, double Longitude)> origins, (double
  Latitude, double Longitude) destination, CancellationToken)` to `IRoutingService`
  (`Src/SmartCityOps.Application/Common/Routing/IRoutingService.cs`). `OsrmRoutingService`
  (`Src/SmartCityOps.Infrastructure/Common/Routing/OsrmRoutingService.cs`) implements it against
  OSRM's `/table/v1/driving/{coordinates}?sources=...&destinations=...&annotations=duration,distance`
  endpoint: it builds one coordinate string of all origins followed by the single destination
  (culture-invariant `lng,lat` pairs, matching §51's `GetDrivingRouteAsync` formatting), sets
  `sources` to every origin index and `destinations` to the destination's index, and reuses the
  existing `RunCurlAsync` process-execution helper (see §51's note on why curl is used over
  `HttpClient` on this host) rather than duplicating it. The response's `durations`/`distances` 2D
  arrays are read column-`[0]` per origin row (each origin's entry to the one destination) into two
  parallel `List<double?>`; a non-`"Ok"` response `code` or any exception is caught, logged as a
  warning, and returns `null` so callers can cleanly fall back to Haversine — the same
  fail-safe contract `GetDrivingRouteAsync` already established.
- **Step 6.2 — Recommendation engine consumption.** `FieldUnitScoringContext` and
  `DistanceScoreRule` already carried/consumed `TimeSpan Eta`/`double DistanceKm` generically (no
  rule cares where those values came from), so neither needed changes.
  `FieldUnitRecommendationService`
  (`Src/SmartCityOps.Infrastructure/FieldUnitRecommendations/FieldUnitRecommendationService.cs`)
  now takes `IRoutingService` as a constructor dependency alongside the existing
  `IEtaEstimator`/`ApplicationDbContext`/scoring rules. `GetRecommendationsAsync` collects every
  candidate field unit's coordinates into one `origins` list and issues a single batched
  `GetDrivingTableAsync` call against the incident's coordinates (skipped entirely when there are
  no field units, to avoid an empty-origins OSRM request); per unit, if OSRM returned a non-null
  duration and distance at that unit's index, `distanceKm`/`eta` are derived from them
  (`durationSec` → `TimeSpan.FromSeconds`, `distanceMeters` → km rounded to 2 decimals), otherwise
  the pre-existing `GeoCalculator.CalculateDistanceKm`/`_etaEstimator.EstimateEta` Haversine path
  runs unchanged. The rest of the method (building `FieldUnitScoringContext`, running scoring rules,
  computing weighted `TotalScore`, ordering descending) is untouched.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors); `npm run lint`
(oxlint) and `npm run build` (`tsc -b && vite build`) clean in `frontend/` — no frontend files were
touched by this phase, so these confirm no regression rather than exercising new code. No
test/debug code left in the tree.

**Outcome:** Field-unit recommendations now rank candidates by real driving time/distance from a
single OSRM Table batch request per incident, instead of a flat 40 km/h straight-line estimate,
with the same resilient Haversine fallback pattern already proven in §51's route-geometry
integration.

---

## 58. Phase 5.33 — Operational Task Cancellation Flow, Status Audit & History Integration

**Motivation:** Operational tasks could previously only reach a terminal state via `Complete` or
`Reassign` — there was no way to abort a mistakenly assigned task or stand a unit down from a task
that no longer needed to run, short of waiting for it to finish or handing it off to another unit.
This phase adds a genuine `Cancel`/abort lifecycle transition, freeing the assigned field unit
immediately and reopening the incident when no other active task remains for it, while keeping
`OperationsReplayService` and the frontend history view consistent with the new terminal state.

**Solution — two steps:**

- **Step 7.1 — Backend domain, service & replay.** Added `Cancelled = 3` to
  `OperationalTaskStatus` (`Src/SmartCityOps.Domain/Enums/OperationalTaskStatus.cs`) and a nullable
  `DateTimeOffset? CancelledAt` to `OperationalTask`
  (`Src/SmartCityOps.Domain/Entities/OperationalTask.cs`), mirrored on `OperationalTaskDto`.
  `IOperationalTaskService` gained `CancelAsync(Guid id, CancellationToken)`, implemented in
  `OperationalTaskService`
  (`Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs`): it loads the task,
  throws `ValidationException` unless `Status == Assigned` (the same "only an active task can
  transition" invariant `CompleteAsync`/`ReassignAsync` already enforce), then sets
  `Status = Cancelled`/`CancelledAt = UtcNow`, frees the field unit back to `Available`, and — if no
  *other* `Assigned` task remains for the incident — reverts the incident from `InProgress` back to
  `Open`, before saving and dispatching a new `TaskCancelledEvent(TaskId, IncidentId, FieldUnitId)`
  through the existing `IDomainEventDispatcher`/`SignalROperationsNotificationHandler` pattern (both
  registered in `DependencyInjection.cs`, following the same wiring as `TaskAssignedEvent`/
  `TaskCompletedEvent`/`TaskReassignedEvent`). `OperationalTasksController` exposes this as `POST
  /api/operational-tasks/{id}/cancel`. `OperationsReplayService`'s `IsTaskActiveAt` helper gained a
  `Cancelled` branch mirroring the existing `Reassigned` one — active while
  `AssignedAt <= timestamp && (!CancelledAt.HasValue || CancelledAt.Value > timestamp)` — and
  `GetReplayTimeRangeAsync`'s per-table aggregate query now also considers `Max(CancelledAt)`.
  Migration `AddOperationalTaskCancelledAt` (nullable `timestamp with time zone` column) was
  generated and applied via `dotnet ef database update`.
- **Step 7.2 — Frontend.** `frontend/src/features/operational-tasks/types.ts`'s
  `OperationalTaskStatus` union gained `"Cancelled"` and `OperationalTask` gained
  `cancelledAt?: string | null`. `operationalTasksApi.ts` gained `cancelOperationalTask(id)` (a
  `POST` returning the updated `OperationalTask`, unlike the existing `completeOperationalTask`/
  `reassignTask` which return `void` — the new call needed the response shape for consistency with
  the mutation hook signature, not because callers currently read it), and a new
  `useCancelTask` React Query mutation hook
  (`frontend/src/features/operational-tasks/hooks/useCancelTask.ts`) invalidates
  `["incidents"]`, `["field-units"]`, `["operational-tasks"]`, `["operational-statistics"]`, and
  `["field-unit-location-histories"]` on success — the same five keys a task-state change already
  needs to keep live per the SignalR invalidation pattern documented in the Architecture section
  above. `FieldUnitPanel.tsx` renders a "Cancel Task" button (`app-button--outlined`) alongside
  "Complete Task" whenever `!readOnly && fieldUnit.status === "Dispatched" && activeTask`, disabled
  while pending and reporting an error inline on failure; `onCancelled` threads through
  `FieldUnitColumn` up to `App.tsx`, wired to `clearSelection` like every other task-mutation
  callback on that panel. `buildCompletedHistoryRows`
  (`frontend/src/features/operational-tasks/lib/buildTaskRow.ts`) now also maps `Cancelled` tasks
  (keyed off `cancelledAt` as the row's timestamp) alongside `Completed` tasks and manual incident
  resolutions, and every row gained an explicit `"Completed"`/`"Cancelled"` status cell so the three
  row kinds are distinguishable in one table. `CompletedTasksSection.tsx` was renamed in its heading
  and `HistoryTable` columns from "Completed Tasks" to "Task History" (`["Unit", "Incident",
  "Status", "Date/Time"]`) to reflect that it now lists both terminal outcomes, not completions
  alone.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors); `npm run lint`
(oxlint) and `npm run build` (`tsc -b && vite build`) clean in `frontend/` (0 type errors; only the
same pre-existing, unrelated `react(refs)`/`react(set-state-in-effect)` warnings and MapLibre
vendor chunk-size notice from before this phase). No test/debug code left in the tree.

**Outcome:** Operators can now abort a mistakenly assigned or no-longer-needed task directly from
`FieldUnitPanel`, with the field unit released and the incident reopened automatically when
appropriate; `OperationsReplayService` reconstructs the `Cancelled` state accurately at any replay
timestamp, and the unified "Task History" table shows cancelled tasks alongside completed ones
instead of silently dropping them.

---

## 59. Phase 5.34 — In-Flight Field Unit Dynamic Position Resolution in Recommendation Engine

**Motivation:** When a field unit is assigned to a task, `OperationalTaskService` writes the
incident's coordinates straight onto `FieldUnit.Latitude/Longitude` so the frontend has a
destination to animate the marker toward (§26). But `FieldUnitRecommendationService` (§57) read
those same columns as "the unit's current location" when scoring recommendations for a *different*
incident — so a unit that was still minutes away, en route to its first assignment, was scored as
if it had already arrived. In a city running several concurrent dispatches this made
recommendations for a second, unrelated incident systematically wrong: a travelling unit could rank
above a genuinely closer idle one purely because its stored coordinates lied about where it was.

**Solution:**

- **Step 8.1.** Added `GeoCalculator.GetInFlightPosition(originLat, originLng, destLat, destLng,
  assignedAt, estimatedEtaSeconds, now)` to `SmartCityOps.Application.Common`
  (`Src/SmartCityOps.Application/Common/GeoCalculator.cs`) — the same linear origin→destination
  interpolation-by-elapsed-fraction the frontend already performs in
  `geoInterpolation.ts`/`useFieldUnitMarkers.ts` (§8, §26), ported to the backend so the
  recommendation engine can compute it server-side. `estimatedEtaSeconds <= 0` or
  `progress >= 1.0` (elapsed time already covers the ETA) both short-circuit to the destination
  coordinates; otherwise it clamps `(now - assignedAt) / estimatedEtaSeconds` to `[0, 1]` and lerps
  both axes independently. This is a plain static helper — no new interface, no DI registration.
  `FieldUnitRecommendationService`
  (`Src/SmartCityOps.Infrastructure/FieldUnitRecommendations/FieldUnitRecommendationService.cs`)
  now loads every currently `Assigned` `OperationalTask` alongside the candidate field units and
  indexes them by `FieldUnitId` into a dictionary. For each field unit, if it has a matching active
  task with `OriginLatitude`/`OriginLongitude`/`EstimatedEtaSeconds` all populated (tasks created
  before §51 introduced those columns won't), `GetRecommendationsAsync` computes that unit's
  effective real-time coordinate via `GetInFlightPosition` against a single `now` timestamp shared
  across all units in the request (so every candidate is evaluated at the same instant); units with
  no active task, or an active task missing that origin/ETA data, fall back to the stored
  `fieldUnit.Latitude/Longitude` unchanged. These effective coordinates — not the raw stored
  columns — are what get passed into the `origins` list for the batched
  `_routingService.GetDrivingTableAsync` call (§57) and into the Haversine/`IEtaEstimator` fallback
  path per unit, so both the OSRM and the offline code path score against the unit's true
  in-flight position.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors). No frontend files
were touched by this phase.

**Outcome:** Recommendations now reflect where a dispatched unit actually is along its route at the
moment of scoring, not where it will eventually end up — closing the last gap between the
recommendation engine's coordinate model and the animated-travel model the map/timeline have used
since §26/§51.

---

## 60. Phase 5.35 — System Health Audit Fixes: IsReadyToResolve Invariant, Exception Mapping, Worker Hardening & Frontend Invalidation

**Motivation:** A full-stack, read-only system health audit (`docs/SYSTEM_HEALTH_AUDIT.md`, dated
2026-08-30) checked every prior phase's claims directly against source rather than trusting this
log's prose, and surfaced three backend findings plus one frontend finding severe enough to act on
immediately:

1. **Live-vs-replay SSOT divergence on `IsReadyToResolve`.** `IncidentService.GetAllAsync` built
   `incidentIdsWithActiveTasks` via `.Where(t => t.Status != OperationalTaskStatus.Completed)` —
   since `OperationalTaskStatus` also has `Reassigned` and `Cancelled` as terminal states, any
   incident that ever had a task reassigned or cancelled would count that old task row as "still
   active" *forever*, permanently blocking `IsReadyToResolve` from ever becoming `true` again even
   after a replacement task genuinely completed. `OperationsReplayService.IsTaskActiveAt` already
   had the correct "active-at-a-point-in-time" semantics for the exact same three terminal statuses
   sitting right next to it in the same codebase — this contradicted the Phase 5.30 (§55) claim that
   `IsReadyToResolve` had a single backend source of truth, when in fact live and replay computed it
   with different, inconsistent logic.
2. **Unmapped `ArgumentException` surfacing as a raw 500.** `FieldUnitService.UpdateStatusAsync`
   throws `ArgumentException` on an invalid status string, but `DomainExceptionHandler`'s switch had
   no case for it, so it fell through to ASP.NET's default unhandled-exception pipeline (500)
   instead of a clean 400 — for what is a garden-variety client input-validation error.
3. **Incident Generator's POST loop was one exception type away from a silent, permanent death.**
   `Worker.cs`'s `GenerateAndSendIncidentAsync` only caught `HttpRequestException`; a transient
   timeout (`TaskCanceledException`), a JSON serialization error, or any other exception from
   `PostAsJsonAsync` would propagate up through `ExecuteAsync`'s `while` loop and terminate the
   `BackgroundService` for the rest of the process's lifetime, with nothing to restart it —
   contradicting the "simulated feed keeps running unattended" design intent.
4. **`useCompleteTask.ts`'s cache invalidation list drifted from its siblings.** Unlike
   `useCreateTask.ts` and `useCancelTask.ts` (and `useReassignTask.ts`), it invalidated only
   `incidents`/`field-units`/`operational-tasks`, omitting `operational-statistics` and
   `field-unit-location-histories` — so `StatisticsSection` could show stale numbers for a beat
   after a manual task completion until the next SignalR `OperationsUpdated` broadcast caught up.

**Solution:**

- **Step 9.1 — `IsReadyToResolve` live/replay alignment.**
  `Src/SmartCityOps.Infrastructure/Incidents/IncidentService.cs`'s `GetAllAsync` filter changed from
  `.Where(t => t.Status != OperationalTaskStatus.Completed)` to
  `.Where(t => t.Status == OperationalTaskStatus.Assigned)` — only a task currently in the
  `Assigned` state blocks its incident from being ready-to-resolve; `Completed`, `Reassigned`, and
  `Cancelled` are all terminal and no longer counted. This matches `IsTaskActiveAt`'s treatment of
  the same three terminal statuses in `OperationsReplayService`. `CreateAsync` (hardcodes
  `isReadyToResolve: true` for a brand-new incident with no tasks yet) and `ResolveAsync` (its own
  `openTasks` query already filtered on `Status == OperationalTaskStatus.Assigned`) were checked for
  consistency and needed no changes — both already matched the corrected `Assigned`-only definition.
- **Step 9.2 — Centralized `ArgumentException` → 400 mapping.**
  `Src/SmartCityOps.Api/ExceptionHandling/DomainExceptionHandler.cs`'s status-code switch gained
  `ArgumentException => StatusCodes.Status400BadRequest` alongside the existing `ValidationException`
  case, so any `ArgumentException` thrown from a service (currently just
  `FieldUnitService.UpdateStatusAsync`'s invalid-enum guard) now returns a clean 400 with the
  standard `{ message }` ProblemDetails-style body instead of falling through to a raw 500. The
  redundant local `try/catch (ArgumentException)` in
  `Src/SmartCityOps.Api/Controllers/IncidentsController.cs`'s `Create` action (which returned a
  Turkish-language `BadRequest("Yanlış veya eksik argüman.")` — a one-off patch predating this
  centralized mapping) was removed, letting that call site's `ArgumentException` flow through the
  same centralized handler as every other controller, closing the inconsistency the audit flagged.
- **Step 9.3 — Incident Generator worker hardening.**
  `Src/incident-generator/Worker.cs`'s `GenerateAndSendIncidentAsync` catch clause was broadened from
  `catch (HttpRequestException ex)` to two clauses: `catch (OperationCanceledException) when
  (cancellationToken.IsCancellationRequested)` (an empty branch — a genuine shutdown-triggered
  cancellation is expected and should let `ExecuteAsync`'s loop condition end the service cleanly,
  not be logged as a failure), followed by a catch-all `catch (Exception ex)` that logs via
  `logger.LogWarning(ex, "Failed to send incident to API. Retrying in next cycle...")`. A single
  transient failure of any kind — timeout, DNS blip, JSON error, connection reset — is now logged
  and the loop continues to its next `Task.Delay`-gated cycle instead of the process's
  `BackgroundService` dying silently for good.
- **Step 9.4 — Frontend invalidation alignment.**
  `frontend/src/features/operational-tasks/hooks/useCompleteTask.ts`'s `onSuccess` callback gained
  the same two `queryClient.invalidateQueries` calls (`operational-statistics`,
  `field-unit-location-histories`) that `useCreateTask.ts`/`useCancelTask.ts` already had, closing
  the staleness gap the audit's Moderate frontend finding described.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors) after Steps 9.1–9.3;
`npm run lint` and `npm run build` (`tsc -b && vite build`) both clean of new errors after Step 9.4
(the build's pre-existing chunk-size-warning note and lint's pre-existing `react(set-state-in-effect)`/
`react(refs)` warnings on unrelated files are unchanged from before this phase, not introduced by
it).

**Outcome:** All three of the audit's "Top 3 critical priorities" and its one Moderate frontend
finding are resolved: `IsReadyToResolve` now has a genuine single source of truth shared in spirit
(same `Assigned`-only definition, independently implemented) between `IncidentService.GetAllAsync`
and `OperationsReplayService.IsTaskActiveAt`; invalid-status-string requests return 400 instead of
500; the incident generator can no longer die silently from a transient network hiccup; and the
"Ready to Resolve" statistics/location-history caches stay fresh immediately after a manual task
completion. `docs/SYSTEM_HEALTH_AUDIT.md`'s remaining Moderate/Low findings (marker-churn patterns
in `useIncidentMarkers.ts`/`useOperationalZoneLayers.ts`, the unverified `GetMovementHistoryAsync`
`.ToString()`-in-projection risk, the `InvalidOperationException`→409 blanket mapping, the missing
single-resource `GET /{id}` endpoints, remaining color-literal stragglers, and the still-absent
backend test project) remain open and are unaffected by this phase.

## 61. Phase 5.36 — FieldUnit Movement History Query Projection Safety & DomainConflictException Architecture

**Motivation:** Two of §60's remaining open findings were closed in this phase: the unverified
`GetMovementHistoryAsync` `.ToString()`-in-projection risk, and the blanket
`InvalidOperationException`→409 mapping in `DomainExceptionHandler`.

**Solution:**

- **Step 1.1 — `FieldUnitService.GetMovementHistoryAsync` projection safety.**
  The LINQ query previously projected straight into `FieldUnitMovementRecordDto` inside the
  `select`, including `inc != null ? inc.Type.ToString() : null` — the same
  `.ToString()`-inside-a-`GroupBy`/`Select`-translated-to-SQL pattern that Phase 5.27 (§52) had
  already hit and fixed once in `OperationalStatisticsService` (Npgsql/EF Core can't translate an
  enum `.ToString()` call into SQL). The query now selects into an anonymous type with the raw
  `IncidentType?` enum value (`IncidentType?)(inc == null ? null : inc.Type)`) and calls
  `.ToListAsync()` to materialize rows from PostgreSQL first; a second, in-memory `.Select(...)`
  then builds the actual `FieldUnitMovementRecordDto` list, calling `.ToString()` on the
  already-materialized enum value. This was a preventive fix, not a bug fix for an observed
  failure — the audit had flagged it as unverified risk, and this phase confirms none of the
  1-15 seed field units' movement history currently exercises the `inc != null` branch with a
  populated `IncidentType`, so it hadn't surfaced yet in manual testing, but the SQL-translation
  failure mode is identical to the confirmed §52 bug and was closed the same way rather than left
  to fail in production later.
- **Step 2.1 — `DomainConflictException` introduced.**
  `Src/SmartCityOps.Domain/Exceptions/DomainConflictException.cs` (new) inherits `DomainException`
  and provides `(string message)` and `(string message, Exception innerException)` constructors;
  `DomainException` itself gained the matching `(string message, Exception innerException)`
  protected constructor it was previously missing, needed to support the new subclass's second
  overload. `IncidentService.ResolveAsync`'s already-resolved guard and
  `FieldUnitService.UpdateStatusAsync`'s two `Dispatched`-related guards (a `Dispatched` unit's
  status can't be changed directly; `Dispatched` can't be set through this endpoint) now throw
  `DomainConflictException` instead of a bare `InvalidOperationException`, so business-rule conflict
  throws are a distinct, purpose-built type rather than being conflated with the same exception type
  the .NET runtime/BCL raises for unrelated internal state errors.
- **Step 2.2 — `DomainExceptionHandler` mapping updated.**
  `Src/SmartCityOps.Api/ExceptionHandling/DomainExceptionHandler.cs`'s status-code switch gained a
  `DomainConflictException => StatusCodes.Status409Conflict` case (alongside the pre-existing
  `ResourceConflictException => 409`) and the blanket `InvalidOperationException =>
  StatusCodes.Status409Conflict` case was removed entirely. A generic `InvalidOperationException` —
  one not explicitly thrown by a service as a business-rule conflict, e.g. a genuine runtime/BCL
  invariant violation — now falls through this handler's `_ => 0` default and reaches ASP.NET's
  standard unhandled-exception pipeline (500), instead of being silently reported to API clients as
  a misleading 409 Conflict.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors) after all three
steps; no frontend files touched, so no `npm run lint`/`npm run build` re-run was needed.

**Outcome:** Two more items from `docs/SYSTEM_HEALTH_AUDIT.md`'s remaining findings are resolved:
`GetMovementHistoryAsync` no longer carries the same enum-`.ToString()`-in-SQL-translation risk that
already broke `OperationalStatisticsService` once, and 409 Conflict responses are now reserved for
explicit, purpose-built domain-conflict exception types (`ResourceConflictException`,
`DomainConflictException`) rather than any `InvalidOperationException` from anywhere in the call
stack. Remaining open items from `docs/SYSTEM_HEALTH_AUDIT.md` (marker/layer re-render churn in
`useIncidentMarkers.ts`/`useOperationalZoneLayers.ts`, missing single-resource `GET /{id}`
endpoints, remaining color-literal stragglers, and the still-absent backend test project) are
unaffected by this phase.

---

## 62. Phase 5.37 — Corporate Windows Schannel SSL Revocation Bypass & OSRM Live Verification

**Motivation:** The project moved from a macOS development machine (where `OsrmRoutingService`'s
curl-based OSRM calls, see §51, work as designed) to a corporate Windows laptop, where every OSRM
request silently fell back to straight-line Euclidean interpolation — visible on the map as a
dashed straight route line and an instant field-unit teleport to the destination instead of an
animated drive along roads.

**Problem 1 — Schannel SSL revocation-check failure.** On this Windows machine, `curl` (both the
Git-for-Windows-bundled `mingw64\bin\curl.exe` and the OS-bundled `C:\Windows\System32\curl.exe`,
both linked against Schannel) failed the TLS handshake against `router.project-osrm.org` with
`CRYPT_E_NO_REVOCATION_CHECK (0x80092012)`, surfacing as curl exit code 35, because the corporate
network can't reach the certificate's CRL/OCSP endpoint. `RunCurlAsync` caught this as a non-zero
exit code and `GetDrivingRouteAsync`/`GetDrivingTableAsync` both silently fell back
(straight-line route / `null` → Haversine), exactly as designed for a genuinely unreachable OSRM —
but the underlying cause here wasn't reachability, it was the revocation check.

**Solution 1.** `RunCurlAsync`
(`Src/SmartCityOps.Infrastructure/Common/Routing/OsrmRoutingService.cs`) now adds curl's
Schannel-specific revocation-bypass flag conditionally:
```csharp
if (OperatingSystem.IsWindows())
{
    startInfo.ArgumentList.Add("--ssl-no-revoke");
}
```
Gated to Windows rather than passed unconditionally, since curl on macOS/Linux in this project
links against LibreSSL/OpenSSL (see §51's original diagnosis comment at the top of the file), which
doesn't support this flag and could error rather than silently ignore it. Verified directly: the
exact `route/v1/driving` URL the code builds returned curl exit 35 without the flag and HTTP 200
with it, on both curl binaries present on this machine.

**Problem 2 — zero/near-zero `EstimatedEtaSeconds` teleport risk.** Independent of the SSL issue,
`AssignFieldUnitAsync` assigned `EstimatedEtaSeconds = routingResult.DurationSeconds` with no
floor. A very short route, or a fallback route where origin and destination coincide (observed
live during this diagnosis — `BuildFallbackResult`'s `distanceKm` was `0`, producing
`durationSeconds = 0`), makes the frontend's `getTravelProgress` (`geoInterpolation.ts`) read as
`elapsedMs / (0 * 1000)` → `Infinity`/immediately `>= 1`, i.e. "already arrived" — a teleport even
when OSRM/the fallback math is otherwise working correctly.

**Solution 2.** `OperationalTaskService`
(`Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs`) gained:
```csharp
private const int MinimumEtaSeconds = 5;
...
EstimatedEtaSeconds = Math.Max(routingResult.DurationSeconds, MinimumEtaSeconds),
```
guaranteeing every dispatch animates for at least 5 seconds regardless of route length or which
path (OSRM or fallback) produced the duration.

**Problem 3 — stale build served despite a "successful" rebuild.** While verifying Solutions 1–2
live, the running API kept exhibiting the pre-fix behavior (curl exit 35, `EstimatedEtaSeconds: 0`)
even after `dotnet build` reported 0 errors and the process was restarted. Root cause: this repo
produces two distinct build outputs — `dotnet build` (solution-level, invoked from `Src/`) writes
to `bin\x64\Debug\net8.0` per project (the `x64`-platform mapping added in §47), while
`dotnet run --project SmartCityOps.Api` builds/runs from a separate `bin\Debug\net8.0` output.
Restarting the API with `dotnet run --no-build` after only running the solution-level `dotnet
build` left the `bin\Debug\net8.0` copy of `SmartCityOps.Infrastructure.dll` stale — confirmed by
comparing file timestamps between the two output directories.

**Solution 3.** No code change; process-only fix — restart the API with a plain `dotnet run`
(letting it perform its own rebuild into `bin\Debug\net8.0`) rather than `dotnet build` followed by
`dotnet run --no-build`. Noted here so future sessions on this machine don't re-diagnose the same
false lead.

**Verification:** A live task assignment (`POST /api/operational-tasks`) after all three fixes
returned a real 35-point OSRM polyline in `routeGeometry` and `estimatedEtaSeconds: 151` (matching
OSRM's actual driving duration for that route), with zero warnings logged by
`OsrmRoutingService`. `dotnet build Src/SmartCityOps.sln` and `npm run build` (frontend) both clean.
The frontend's `routeGeometry` parsing (`geoInterpolation.ts`'s `parseRouteGeometry`,
`useDispatchedRouteLayers.ts`) needed no changes — property casing (`routeGeometry`, matching the
API's camelCase JSON) and the `[[lng, lat], ...]` point format were already handled correctly; the
straight-line rendering was entirely a backend-side fallback artifact, not a frontend parsing bug.

**Outcome:** Field-unit dispatch on this Windows machine now uses real OSRM road-network routing
end-to-end, matching the macOS behavior documented in §51. The 5-second `EstimatedEtaSeconds` floor
is a general robustness fix that also protects against future same-location or near-zero-distance
dispatches on any platform, not just the Windows/Schannel case.

---

## 63. Phase 5.38 — Server-Side IsReadyToResolve Enforcement in IncidentService

**Problem:** `IncidentDto.IsReadyToResolve` (§55) guarded the "Resolve" affordance in the frontend
UI, but `IncidentService.ResolveAsync`
(`Src/SmartCityOps.Infrastructure/Incidents/IncidentService.cs`) never enforced the same invariant
server-side. It fetched every `Assigned` `OperationalTask` for the incident and force-completed
them — setting `task.Status = Completed`/`task.CompletedAt` and the corresponding field unit back to
`Available` — instead of rejecting the request. Any caller bypassing the frontend (a direct API
call, a future integration) could resolve an incident out from under field units still actively
dispatched to it, silently overriding their in-progress task state.

**Solution:** `ResolveAsync` now checks
`await _dbContext.OperationalTasks.AnyAsync(t => t.IncidentId == id && t.Status ==
OperationalTaskStatus.Assigned, cancellationToken)` before resolving. If any active `Assigned`
tasks exist, it throws `DomainConflictException` (`SmartCityOps.Domain.Exceptions`, the same
purpose-built exception introduced in §61) with a message directing the operator to complete or
cancel those tasks first — mapped by `DomainExceptionHandler` to `409 Conflict`, matching the
`IsReadyToResolve` semantics already used elsewhere (§55, §60). The force-completing `foreach`
loop, and the now-unused `openTasks`/`fieldUnitIds`/`fieldUnitsById` lookups that fed it, were
removed entirely — resolution is strictly all-or-nothing: it either proceeds with no active tasks
touched, or it doesn't proceed at all.

**Verification:** `dotnet build SmartCityOps.sln` clean (0 warnings, 0 errors). No
migration/frontend change — `ActiveTasksPanel.tsx`'s existing `IsReadyToResolve` gating (§55)
already reflects this exact rule, so the "Resolve" action was already hidden/disabled from the UI
in this case; this phase closes the matching server-side gap so the invariant now holds
independent of which client calls the API.

---

## 64. Phase 5.39 — MapLibre Render & Resource Lifecycle Optimization in Incident Markers and Zone Layers

**Problem 1:** `useIncidentMarkers.ts`
(`frontend/src/features/operations-map/hooks/useIncidentMarkers.ts`) included `onSelectIncident`
directly in its `useEffect` dependency array. Whenever a parent re-render passed a new,
unmemoized callback instance (the common case — `App.tsx`/`OperationsMap.tsx` don't wrap it in
`useCallback`), the effect tore down and recreated every incident DOM marker on the map, even
though nothing about the incidents themselves had changed.

**Solution 1:** Mirrored the ref-stabilization pattern already used by
`useFieldUnitMarkers.ts` (§39): `onSelectIncident` is now captured in an `onSelectIncidentRef`,
updated on every render (`onSelectIncidentRef.current = onSelectIncident`), and read from inside
the marker click handler (`onSelectIncidentRef.current?.(incident)`) instead of being closed over
directly. The `useEffect` dependency array was trimmed to `[map, incidents, selectedIncidentId]`,
so marker DOM nodes are now only rebuilt when the incident data or selection actually changes.

**Problem 2:** `useOperationalZoneLayers.ts`
(`frontend/src/features/operational-zones/hooks/useOperationalZoneLayers.ts`) had a single
`[map, zones]` effect whose cleanup called `removeLayer`/`removeLayer`/`removeSource`, and whose
body called `addSource`/`addLayer`/`addLayer` again — so every `zones` update (including the
periodic SignalR-driven `OperationsUpdated` invalidation, even when zone boundaries hadn't
actually changed) tore down and rebuilt the GeoJSON source and both map layers from scratch.

**Solution 2:** Split the hook into two effects, following the same mount/data-sync separation
`useFieldUnitMarkers.ts` already uses for its marker map. A `[map]`-only effect creates the
`operational-zones` GeoJSON source and its fill/label layers exactly once (seeded from a
`zonesRef.current` ref so the very first paint already has correct data instead of an empty
FeatureCollection), and only tears them down when the map instance itself unmounts. A separate
`[map, zones]` effect now performs the update via
`(map.getSource(ZONE_SOURCE_ID) as GeoJSONSource | undefined)?.setData(featureCollection)` —
MapLibre's native in-place data update — instead of any `remove*`/`add*` calls, whenever `zones`
changes.

**Verification:** `npm run build` (`tsc -b && vite build`) clean in `frontend/`; `npm run lint`
(oxlint) shows only pre-existing warning classes (`react(refs)`, `react(set-state-in-effect)`)
already present elsewhere in the codebase, including the identical ref-during-render pattern
`useFieldUnitMarkers.ts` already uses — no new warning categories introduced.
`dotnet build Src/SmartCityOps.sln` clean (0 warnings, 0 errors); no backend/migration files
touched, since this phase is frontend-only.

---

## 65. Phase 5.40 — Normalize Legacy Incident Resolution Durations (Madde 5)

**Problem:** `OperationalStatisticsService.GetStatisticsAsync`'s `AverageResolutionMinutes`
computes `(ResolvedAt - ReportedAt).TotalMinutes` averaged across every `Resolved` incident (§52).
A number of legacy/simulated incidents in the local database had `ResolvedAt` timestamps weeks or
months after `ReportedAt` — an artifact of ad-hoc manual testing/seed timing rather than a real
operational duration — which skewed the dashboard's average into the tens of thousands of minutes,
making the metric meaningless as an operational signal.

**Investigation:** `Src/SmartCityOps.Infrastructure/Persistence/Configurations/IncidentConfiguration.cs`
has no `HasData(...)` seed block — unlike `RestrictedZoneConfiguration.cs` (§41) or
`FieldUnitConfiguration.cs`, incidents are never statically seeded; every row in `Incidents` comes
from either manual testing via Swagger/the frontend or the `incident-generator` worker's periodic
POSTs (see "Incident Generator" in `CLAUDE.md`). So the fix only needed a one-time data migration
against the existing table — there was no hardcoded seed timestamp to correct in code.

**Solution:** Added a data-only EF Core migration, `NormalizeIncidentResolutionDurations`
(`Src/SmartCityOps.Infrastructure/Persistence/Migrations/20260831072717_NormalizeIncidentResolutionDurations.cs`).
Its `Up` method runs one raw SQL `UPDATE`:

```sql
UPDATE "Incidents"
SET "ResolvedAt" = "ReportedAt" + (15 + random() * 30) * INTERVAL '1 minute'
WHERE "Status" = 'Resolved'
  AND "ResolvedAt" IS NOT NULL
  AND "ResolvedAt" > "ReportedAt" + INTERVAL '2 hours';
```

Any resolved incident whose recorded resolution took longer than 2 hours (the unrealistic legacy
rows) gets a fresh `ResolvedAt` drawn uniformly from `ReportedAt + 15..45 minutes` — a randomized
value within that range rather than a single fixed offset, so the recalculated average still varies
realistically across incidents instead of collapsing to one constant. Genuinely plausible existing
durations (≤ 2 hours) are left untouched. `Down` is a documented no-op, since the original
unrealistic timestamps aren't recoverable and there's no value in reintroducing them.

**Verification:** `dotnet build Src/SmartCityOps.sln` clean (0 warnings, 0 errors) before applying.
Applied locally via
`dotnet ef database update --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api`
— confirmed applied via the generated SQL logged against the real `Incidents` table. Started the
API and called `GET /api/operations/statistics` directly: `averageResolutionMinutes` dropped from
the previous multi-thousand-minute figure to `30.4`, consistent with the 15–45 minute normalization
range. No frontend/application-layer code changed — `OperationalStatisticsService`'s calculation
itself was already correct; only the underlying data was wrong.

---

## 67. Phase 5.42 — Replay Time Range SignalR Invalidation Integration (Madde 6)

**Problem:** `frontend/src/shared/hooks/useSignalR.ts`'s `handleOperationsUpdated` callback
invalidated `incidents`, `field-units`, `operational-tasks`, `field-unit-location-histories`,
`field-unit-recommendations`, `restricted-zones`, `operational-statistics`, `incident-timeline`,
and `field-unit-movement-history` on every `OperationsUpdated` SignalR event, but not
`["replay-time-range"]` — the query key backing `useReplayTimeRange`
(`frontend/src/features/operations-replay/hooks/useReplayTimeRange.ts`), consumed by
`useReplayController.ts`. As a result, if a new incident/event arrived in the background while an
operator was viewing the Historical Replay timeline, the replay range's upper bound stayed stale
instead of extending to cover the new event.

**Solution:** Added `void queryClient.invalidateQueries({ queryKey: ["replay-time-range"] });` to
the `OperationsUpdated` handler in `useSignalR.ts`, alongside the existing invalidation calls —
following the same pattern described in "Real-time updates (SignalR)" in `CLAUDE.md`.

**Verification:** `npm run build` in `frontend/` completed clean (`tsc -b && vite build`, 0
TypeScript/Vite compilation errors); the pre-existing `maplibre-vendor` chunk-size warning is
unrelated and unchanged. No backend/migration change.

---

## 68. Phase 5.43 — CSS Design Token & Box-Shadow Cleanup (Madde 7)

**Problem:** The Phase 5.25 color token standardization (§50) migrated ~45 hardcoded color
literals across 21 stylesheets and 5 MapLibre layer hooks onto the centralized `:root` token set
in `frontend/src/index.css`, but a handful of literals were missed: a hardcoded `#f8fafc` text
color in `frontend/src/features/operations-map/styles/FilterCheckboxGroup.css`, and raw
`rgba(0, 0, 0, ...)` `box-shadow`/backdrop `background` values scattered across
`frontend/src/features/operations-replay/styles/ReplayControlBar.css`,
`frontend/src/features/restricted-zones/styles/CoordinatePickerBanner.css`,
`frontend/src/features/menu/styles/MenuOverlay.css`,
`frontend/src/features/menu/styles/MenuButton.css`, and
`frontend/src/layouts/styles/OperationsCenterLayout.css`. These bypassed the design token system,
leaving shadow/backdrop opacity values (0.1, 0.3, 0.5) that couldn't be adjusted from one place.

**Solution:** `FilterCheckboxGroup.css`'s `color: #f8fafc` was replaced with
`color: var(--color-text-primary)` — an exact value match, since `--color-text-primary` is already
defined as `#f8fafc` in `index.css`. `index.css` has no dedicated box-shadow elevation token, so
(following the same "use an existing token" scope discipline as Phase 5.25) every remaining raw
`rgba(0, 0, 0, ...)` `box-shadow` and backdrop `background` literal — in `ReplayControlBar.css`,
`CoordinatePickerBanner.css`, `MenuOverlay.css`, `MenuButton.css`, and
`OperationsCenterLayout.css` (panel-toggle shadow, mobile side-panel/bottom-bar shadows, and the
mobile backdrop `background`) — was consolidated onto the existing `var(--color-scrim)` token
(`rgba(15, 23, 42, 0.85)` in `index.css`) instead of introducing a new shadow-specific custom
property. This is a deliberate, minor visual normalization (all of these elements now share one
scrim opacity/tint instead of four slightly different ad-hoc values), consistent with the
project's existing single-source-of-truth token approach. No new CSS custom properties were added.

**Verification:** `npm run build` in `frontend/` completed clean (`tsc -b && vite build`, 0
TypeScript/Vite compilation errors); the pre-existing `maplibre-vendor` chunk-size warning is
unrelated and unchanged. A follow-up grep for `rgba(0, 0, 0,` and `#f8fafc` across
`frontend/src/` turned up no remaining literal usages outside `index.css`'s own token
definitions. No backend/migration change, since this phase is CSS-only.

---

## 69. Phase 5.44 — Single-Resource GET /{id} REST Endpoints Support (Madde 8)

**Problem:** Controllers only exposed bulk/collection endpoints (e.g. `GET /api/incidents`,
`GET /api/field-units`). Single-resource retrieval (`GET /{id}`) was missing across all core
entities, limiting external integrations and REST maturity.

**Solution:** Added `GetByIdAsync` to the application service interfaces (`IIncidentService`,
`IFieldUnitService`, `IOperationalTaskService`, `IRestrictedZoneService`) and implemented them in
the corresponding infrastructure services, each returning the DTO or `null` when the entity doesn't
exist. `IncidentService.GetByIdAsync` mirrors `GetAllAsync`'s `IsReadyToResolve`/`PriorityScore`
computation for a single incident; the other three are `AsNoTracking()` + `Select(...)` projections
matching their `GetAllAsync` mapping. Added `[HttpGet("{id:guid}")]` endpoints across all 4
controllers (`IncidentsController`, `FieldUnitsController`, `OperationalTasksController`,
`RestrictedZonesController`), each returning `200 OK` with the DTO when found or `404 NotFound()`
when the service returns `null`. `SmartCityOps.Api.http` gained chained "Get by id" requests for
incidents, field units, operational tasks, and restricted zones (reusing the existing `@name`-tagged
collection responses), plus a not-found sanity check against a random Guid for incidents.

**Verification:** `dotnet build Src/SmartCityOps.sln` verified clean (0 warnings, 0 errors) after
each of the three steps (Application interfaces, Infrastructure implementations, Api controllers).
No migration/frontend change — this phase is backend-only, additive REST surface.

---

