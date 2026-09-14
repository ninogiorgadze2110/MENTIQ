# MENTIQ

MENTIQ is a learning / practice platform built as a **single deployable
ASP.NET Core application** that serves an Angular single-page application and a
`/api/*` Web API from the **same origin**. This makes it simple and inexpensive
to host on a standard ASP.NET Core host such as **MonsterASP** — no separate
frontend hosting, no Node.js runtime in production, and no cross-origin (CORS)
configuration in production.

```
https://mentiq.com/            -> Angular SPA
https://mentiq.com/dashboard   -> Angular SPA (client-side route)
https://mentiq.com/api/health  -> ASP.NET Core Web API
https://mentiq.com/api/auth/*  -> ASP.NET Core Web API
```

---

## 1. Project overview

- **Frontend:** Angular 18 (standalone components, SCSS design system).
- **Backend:** ASP.NET Core 10 Web API (controllers, JWT auth).
- **Database:** Microsoft SQL Server via Entity Framework Core (Code First).
- **Deployment:** one ASP.NET Core app; Angular is compiled to static files and
  served from `wwwroot`.

## 2. Architecture

The backend follows a Clean Architecture layering:

| Project                 | Responsibility                                                        |
| ----------------------- | -------------------------------------------------------------------- |
| `Mentiq.Domain`         | Domain entities and domain abstractions. No dependencies.            |
| `Mentiq.Application`    | Use cases, DTOs, interfaces. Depends on Domain.                      |
| `Mentiq.Infrastructure` | EF Core, SQL Server, DbContext, migrations, JWT/auth, persistence.   |
| `Mentiq.Api`            | HTTP layer: controllers, middleware, DI wiring, SPA static serving.  |
| `Mentiq.Client`         | Angular application.                                                  |

Dependencies point inwards: `Api → Application/Infrastructure → Domain`.

## 3. Folder structure

```
MENTIQ/
├── src/
│   ├── Mentiq.Api/            ASP.NET Core Web API (+ wwwroot for the SPA)
│   ├── Mentiq.Application/    Application logic, DTOs, interfaces
│   ├── Mentiq.Domain/         Domain entities and abstractions
│   ├── Mentiq.Infrastructure/ EF Core, SQL Server, migrations, auth
│   └── Mentiq.Client/         Angular application
├── tests/
│   ├── Mentiq.UnitTests/
│   └── Mentiq.IntegrationTests/
├── scripts/
│   ├── build-production.ps1
│   └── build-production.sh
├── .github/workflows/ci.yml
├── Mentiq.sln
├── .gitignore
└── README.md
```

## 4. Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download) (`dotnet --version` → 10.x)
- [Node.js 20+](https://nodejs.org/) and npm
- Microsoft SQL Server, SQL Server Express, or **LocalDB** (bundled with Visual
  Studio / the SQL Server Express installer) for local development
- Angular CLI (optional globally; the repo uses the local CLI via `npx`)

## 5. Local setup

```bash
# Backend: restore packages and EF tooling
dotnet restore
dotnet tool restore            # installs dotnet-ef (see .config/dotnet-tools.json)

# Frontend: install Angular dependencies
cd src/Mentiq.Client
npm install
```

## 6. SQL Server setup

The default local development connection string uses LocalDB and is stored in
`src/Mentiq.Api/appsettings.Development.json` (it contains **no password** —
it uses trusted Windows authentication):

```
Server=(localdb)\MSSQLLocalDB;Database=MentiqDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true
```

To use a different SQL Server locally without editing committed files, set it
through **User Secrets** (never committed):

```bash
cd src/Mentiq.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=...;Database=MentiqDb;User Id=...;Password=...;TrustServerCertificate=true"
```

You must also set a JWT signing secret for authentication to work locally
(again via User Secrets so it is never committed):

```bash
dotnet user-secrets set "Jwt:Secret" "a-long-random-development-only-secret-at-least-32-chars"
```

## 7. EF Core migrations

Migrations live in `Mentiq.Infrastructure/Persistence/Migrations`. Run the EF
tools with the Infrastructure project as the migrations project and the API as
the startup project:

```bash
# Add a migration
dotnet dotnet-ef migrations add <MigrationName> \
  --project src/Mentiq.Infrastructure \
  --startup-project src/Mentiq.Api \
  --output-dir Persistence/Migrations

# Apply migrations to the database
dotnet dotnet-ef database update \
  --project src/Mentiq.Infrastructure \
  --startup-project src/Mentiq.Api
```

> The application does **not** apply migrations automatically on startup. Apply
> them deliberately with `database update` (or as a deployment step).

## 8. Angular development

```bash
cd src/Mentiq.Client
npm start          # ng serve on http://localhost:4200
```

The dev server proxies `/api` to the API (`proxy.conf.json` → `https://localhost:7216`),
so the frontend always calls the relative URL `/api/...` in both development and
production. Run the API in another terminal (see below) so the proxy has a target.

## 9. ASP.NET Core development

```bash
cd src/Mentiq.Api
dotnet run         # https://localhost:7216 / http://localhost:5042
```

Useful endpoints:

- `GET  /api/health` → `{ "status": "healthy" }`
- `GET  /api/health/ready` → health + database connectivity (boolean only)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /openapi/v1.json` (OpenAPI document, Development only)

## 10. Production build

A single script builds Angular, copies it into the API's `wwwroot`, and
publishes the ASP.NET Core app as one deployable unit:

```powershell
# Windows / PowerShell
./scripts/build-production.ps1
```

```bash
# Linux / macOS / Git Bash
./scripts/build-production.sh
```

The exact steps performed:

```
1. npm ci                    (install Angular deps)         # in src/Mentiq.Client
2. npx ng build --configuration production
3. clear src/Mentiq.Api/wwwroot
4. copy dist/mentiq-client/browser/* -> src/Mentiq.Api/wwwroot
5. dotnet publish src/Mentiq.Api -c Release -o publish
```

The result in `./publish` (containing `Mentiq.Api.dll`, `web.config`, and
`wwwroot/`) is ready to deploy to any ASP.NET Core host. Pass `-SkipPublish`
(PowerShell) / `--skip-publish` (bash) to only build the SPA into `wwwroot`.

## 11. Environment configuration

Configuration is layered via `appsettings.json`, `appsettings.Development.json`,
User Secrets (development), and environment variables (production).

| Setting                              | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| `ConnectionStrings:DefaultConnection`| SQL Server connection string          |
| `Jwt:Secret`                         | JWT signing secret (**never commit**) |
| `Jwt:Issuer`, `Jwt:Audience`         | JWT issuer / audience                 |
| `Jwt:AccessTokenExpiryMinutes`       | Access-token lifetime                 |

On a host such as MonsterASP, supply the production connection string and JWT
secret through the hosting environment (environment variables or the host's
configuration UI), e.g. `ConnectionStrings__DefaultConnection` and `Jwt__Secret`.

The Angular app never contains the JWT secret and always calls the relative
`/api` base URL (`src/Mentiq.Client/src/environments`).

## 12. GitHub workflow

`.github/workflows/ci.yml` runs on push / PR to `main`:

1. Restore .NET dependencies
2. Install Angular dependencies
3. Build Angular
4. Copy Angular output into `wwwroot`
5. Build ASP.NET Core
6. Run tests
7. Publish and upload the deployable app as a build artifact

No deployment secrets are required yet; a MonsterASP deployment step can be
connected later.

## 13. Deployment preparation (MonsterASP)

1. Run `./scripts/build-production.ps1` (or the CI artifact) to produce `./publish`.
2. Deploy the contents of `./publish` to the host (web deploy / FTP / the host's
   pipeline).
3. Configure on the host:
   - `ConnectionStrings__DefaultConnection`
   - `Jwt__Secret`
   - `ASPNETCORE_ENVIRONMENT=Production`
4. Apply database migrations with `dotnet-ef database update` against the
   production connection string (deliberate step, not on startup).

The app requires only a standard ASP.NET Core host — no Docker, Kubernetes,
Node.js runtime, or separate frontend hosting.

## 14. Security notes

- **Secrets are never committed.** JWT secret and real connection strings are
  supplied via User Secrets (dev) or environment variables (prod). `.gitignore`
  excludes `node_modules/`, `bin/`, `obj/`, `dist/`, `publish/`, `wwwroot/`,
  database files, and `.env`.
- **JWT** signing secret is known only to the backend. The frontend stores only
  the issued access token and attaches it via an Angular HTTP interceptor.
- **Passwords** are hashed with the ASP.NET Core Identity PBKDF2 hasher; plain
  text is never stored.
- **CORS** is only configured for local development; in production the SPA and
  API share one origin, so no permissive CORS policy is used.
- **Error handling** is centralized; internal exception details are not exposed
  to clients (a consistent `ApiError` shape is returned instead).
- The `/api/health` endpoint never exposes secrets or connection strings.

---

## Development quick reference

```bash
dotnet build Mentiq.sln                       # build backend
dotnet test  Mentiq.sln                        # run all tests
cd src/Mentiq.Client && npm start              # Angular dev server (:4200)
cd src/Mentiq.Api && dotnet run                # API (:7216 / :5042)
./scripts/build-production.ps1                 # full single-app production build
```
