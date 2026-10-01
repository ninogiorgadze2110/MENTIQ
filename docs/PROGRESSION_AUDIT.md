# MENTIQ — Progression Audit

სტატუსი: აუდიტი (კოდი არ შეცვლილა). თარიღი: 2026-10-01.
მიზანი: „მენიუდან → გზაზე" გადასვლის მოსამზადებლად არსებული არქიტექტურის, მონაცემთა მოდელისა და ხელახლა გამოსაყენებელი ნაწილების ფიქსაცია.

---

## 1. მაღალი დონის არქიტექტურა

ერთი deployable: **ASP.NET Core 10 Web API** (Clean Architecture) + **Angular (standalone, signals)** კლიენტი.

```
src/
  Mentiq.Domain/         — entities (Б.Entity), enums, constants (არ იცის DB/EF)
  Mentiq.Application/     — Features/*, services, DTOs, interfaces (IApplicationDbContext)
  Mentiq.Infrastructure/  — EF Core DbContext (MentiqDbContext), Persistence/Migrations, Security
  Mentiq.Api/            — Controllers, Authorization, Program.cs, appsettings.json
  Mentiq.Client/         — Angular app (features/*, core/services, core/guards, styles.scss)
```

- **DB**: SQL Server, EF Core 10, code-first. მიგრაციები: `Mentiq.Infrastructure/Persistence/Migrations`.
  Design-time factory env-ზეა დამოკიდებული (Development→localhost, Production→prod).
- **Auth**: JWT, role claim (`Student` / `Administrator`).
- **Paywall**: `RequireSubscriptionAttribute` (backend TypeFilter) + `subscriptionGuard` (frontend).
  საცდელი 14 დღე + ადმინის მართვადი **ბეტა უფასო რეჟიმი** (`PlatformSetting` key `BetaFreeAccess`).

---

## 2. Routing (frontend) — `app.routes.ts`

| გზა | guard-ები | შინაარსი |
|---|---|---|
| `''` | — | landing (public) |
| `login`, `onboarding`, `pricing` | — | auth / regist
| `practice`, `results` | auth + subscription | full-screen ვარჯიში |
| `kids/*` | auth + subscription + **kidsGuard** | ბავშვების ცალკე გამოცდილება (0 და 1 კლასი) |
| `dashboard`, `learn`, `progress`, `competition`, `achievements`, `contact` | auth (+subscription გარკვეულებზე) | sidebar shell |
| `admin/subscriptions`, `admin/contact` | adminGuard | ადმინი |

Landing-ს ეჩვენება პირდაპირ; login/register-ის შემდეგ `AuthService.homeRoute()` გადაიყვანს:
preschool **ან** 1 კლასი → `/kids`, დანარჩენი → `/dashboard`.

---

## 3. მონაცემთა მოდელი (Domain/Entities)

| Entity | დანიშნულება | მთავარი ველები |
|---|---|---|
| `User` | ანგარიში | Email, DisplayName, Role, **EducationLevel** (`preschool`/`school`/`adult`), **Grade** (0–12), Age, TrialStartUtc/TrialEndUtc |
| `PracticeSession` | **school ვარჯიშის აგრეგატი** | Mode(`count`/`time`), TotalQuestions, CorrectCount, WrongCount, Score, LongestStreak, **Accuracy**(0–100), **AvgSeconds** (წამი/კითხვაზე), DurationSeconds, Started/CompletedAtUtc |
| `ExerciseAttempt` | **kids per-question** | Skill, ExerciseType, World, Difficulty, CorrectAnswer, GivenAnswer, IsCorrect, **ResponseTimeMs**, AttemptNumber, CreatedAtUtc |
| `SkillProgress` | **kids per-skill პროგრესი** | Skill, Level(1–12), Score(⭐), TotalAttempts, CorrectAttempts, CorrectStreak, AverageResponseTimeMs |
| `UserAchievement` | გახსნილი მიღწევა | Code, UnlockedAtUtc |
| `Competition` / `CompetitionEntry` | შეჯიბრი + ჩანაწერები | Score, Accuracy |
| `DailyChallengeEntry` | დღის ამოცანის ლიდერბორდი | ChallengeDate, Grade, Score, Accuracy, DurationSeconds |
| `Subscription` / `SubscriptionHistory` | გამოწერა | Status, Start/EndDate, Plan |
| `PlatformSetting` | გლობალური switch | Key/Value (`BetaFreeAccess`) |
| `ContactMessage` | კონტაქტის ფორმა | — |

---

## 4. სად ინახება ვარჯიშის შედეგები (სიზუსტე, დრო)

**School (მთავარი პროდუქტი):**
- ამოცანები **კლიენტზე გენერირდება და სწორდება** (`features/practice/practice.component.ts`).
- სესიის **აგრეგატი** იგზავნება → `POST /api/practice` → `PracticeService.SaveSessionAsync` → `PracticeSession`.
- ინახება: Accuracy (სესიაზე), AvgSeconds (საშ. წამი/კითხვაზე), LongestStreak, Score, Mode.
- ⚠️ **per-question** დონის მონაცემი (რომელი კითხვა, თითო კითხვის დრო/სისწორე) **არ ინახება** school-ში.

**Kids:**
- სერვერზე გენერირდება და **სერვერზევე სწორდება** (HMAC-ხელმოწერილი token-ით, `KidsExerciseService`).
- თითო პასუხი → `ExerciseAttempt` (ResponseTimeMs-ით), per-skill → `SkillProgress`.

---

## 5. როგორ განისაზღვრება სირთულე 1–6

- `practice.component.ts`-ში `GRADES: Record<number, GradeDef>` (1–6), თითო grade-ს აქვს `ops[]` და თითო ოპერაციის რიცხვითი `range`.
- სირთულე = **მომხმარებლის მიერ არჩეული grade** (ღილაკებით). ავტომატური/ადაპტური სირთულე **არ არის**.
- `levelLabel` = `სირთულე {grade}`. ხრიკების (`trick`) დრილი grade-ს უგულებელყოფს.
- Kids-ში სირთულე = `SkillProgress.Level` (სერვერზე, streak-ით იზრდება).

## 6. გაკვეთილების საკეტი (Pro lock)

- `features/learn/learn.component.ts`: `CATEGORIES`/`lessons` — **სტატიკური hardcoded მასივი**.
- ზოგ გაკვეთილს აქვს `locked: true` (hardcoded). `select()` უბრალოდ აბრუნებს locked-ზე.
- ⚠️ **წმინდა ვიზუალური ფლაგია** — **არ** არის მიბმული გამოწერაზე და **არ** არის progress-ზე დამოკიდებული.
- school-ში **progress lock საერთოდ არ არსებობს** — ყველაფერი თავისუფალი „მენიუა".
- Kids-ში **არსებობს ნამდვილი progress lock**: თანმიმდევრული განბლოკვა mastery-ით (რუკა, Star Sky ტომები).

## 7. მიღწევების ლოგიკა

- `AchievementService.GetAndEvaluateAsync`: `UserStats` ითვლება `PracticeSessions`-იდან (+`CompetitionEntries`),
  `AchievementCatalog.All`-ის თითო def-ის `Progress(stats) >= Target` → გახსნა → `UserAchievement`.
- Stats: dayStreak, totalSessions, maxLongestStreak, bestAvgSeconds, perfect/20-of-20 სესია, საუკეთესო competition rank.
- ⚠️ **streak აქ UTC დღით ითვლება** (`DateOnly.FromDateTime(utc)`), `PracticeService`-ში კი **Tbilisi (UTC+4) დღით** — შეუსაბამობა.

## 8. დღის ამოცანა

- `DailyChallengeService`: per-grade ლიდერბორდი, ნადგურდება **06:00 Tbilisi-ზე**, 60 წმ ქვიზი, ინახავს დღის საუკეთესო ქულას,
  grade **ანგარიშიდან** (არა კლიენტიდან — anti-cheat). `DailyChallengeEntry`.

## 9. Streak

- `PracticeService`: Tbilisi (UTC+4) ლოკალური-დღის თანმიმდევრული streak + weekly activity (ბოლო 7 ლოკ. დღე).
- `AchievementService`: საკუთარი streak, მაგრამ UTC-ზე (იხ. რისკი §7).

---

## 10. სტილების სისტემა

- გლობალური `src/styles.scss`, "Classical" design-ტოკენები `:root`-ზე:
  `--ink`, `--paper`, `--gold`, `--hair`, `--ge` (sans), `--ge-serif` (serif). Tailwind **არ** არის.
- Kids გამოყენებს scoped `.kids-scope` პალიტრას (indigo/serif/paper) — ცვლადების override.
- კომპონენტები ფართოდ იყენებენ inline style-ებს + ტოკენ-ცვლადებს.

---

## 11. რა შეიძლება ხელახლა გამოვიყენოთ

- **Kids-ის პროგრესიის მოდელი უკვე არის ზუსტად „გზა და არა მენიუ"**: თანმიმდევრული mastery-unlock,
  პროგრესის %, locked მდგომარეობები, journey map, Star Sky ტომები, `kids-mastery.ts` (shared).
  → school-ზე გადასატანი საუკეთესო რეფერენსი/საძირკველი.
- **`ExerciseAttempt` + `SkillProgress` + `KidsExerciseService`** = უკვე არსებული სერვერ-graded, token-ით დაცული,
  per-skill პროგრესიის ძრავა — school-ის graded გზისთვის გაფართოებადი.
- **`PracticeSession`** აგრეგატები = უკვე არსებული accuracy/speed სიგნალი (მაგრამ მხოლოდ სესიის დონეზე).
- Daily challenge, Achievements, Competition, Subscription/Beta — მზა, გზას ფუნქციურად შეერწყმება.

## 12. რისკები / ხარვეზები (პროგრესიის რედიზაინისთვის)

1. **School ვარჯიში კლიენტზე სწორდება** — per-question მონაცემი არ ინახება და სირთულე სერვერ-authoritative არაა.
   სანდო mastery/progression-ისთვის საჭიროა kids-ის ძრავის მოდელი (სერვერ-graded, tokenized).
2. **Progress lock არ არსებობს school-ში**; `locked` სტატიკური ვიზუალია. საჭიროა ნამდვილი თანმიმდევრული
   განბლოკვა + განსხვავებული ვიზუალი „progress lock" vs „pro lock".
3. **სირთულე მომხმარებელი ირჩევს** (grade), არა ოსტატობით მოპოვებული.
4. **Streak ორ ადგილას ითვლება სხვადასხვა დღის ბაზით** (Tbilisi vs UTC) — გასაერთიანებელი.
5. **გაკვეთილები/ხრიკები hardcoded სტატიკური მასივებია**, არა data-driven პრერეკვიზიტებიანი გრაფი.
6. **ორი პარალელური სამყარო** (school vs kids) ცალ-ცალკე პროგრესიით — გადასაწყვეტია ძრავის გაერთიანება.

---

## 13. ღია კითხვები (იხ. ჩატის შეჯამება)

1. ახალი „გზა" school-ზე (1–12), kids-ზე, თუ ორივე გაერთიანებულ ძრავაზე?
2. school ვარჯიში რჩება client-graded, თუ გადადის სერვერ-graded ძრავაზე (kids-ივით)?
3. mastery-ის ზუსტი ზღვარი school-ზე: სიზუსტე + სიჩქარე (N სწორი, accuracy ≥X%, საშ. დრო ≤Y წმ) — კონკრეტული რიცხვები?
4. ინახება თუ არა per-question attempt school-ზე (საჭიროა speed/accuracy per skill)?
5. გზის სტრუქტურა: წრფივი თანმიმდევრობა თუ განშტოებული ხე ოპერაცია/grade-ით? 1–12 როგორ აისახება გზაზე?
6. Pro lock: გზის რომელი ნაწილია ფასიანი vs უფასო? (ამჟამად ბეტა = ყველაფერი უფასო.)
