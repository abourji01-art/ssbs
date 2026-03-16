# Public API & Permissions

Current-state reference for the backend exposure and access-control model.

This file intentionally describes what the code does now. It does not preserve older milestone language such as "what was implemented" or historical security notes that no longer match the runtime behavior.

---

## 1. Public API Surface

The backend exposes its API under `/api/v1/` from `backend/ssbs/urls.py`.

Registered route groups:

- `/api/v1/auth/`
- `/api/v1/stations/`
- `/api/v1/buses/`
- `/api/v1/routes/`
- `/api/v1/trips/`
- `/api/v1/reservations/`
- `/api/v1/reports/`
- `/api/v1/drivers/`

### Publicly reachable endpoints

Only the OAuth entrypoints and token refresh endpoint are intentionally unauthenticated:

| Method | Endpoint                     | Purpose                                                      |
|--------|------------------------------|--------------------------------------------------------------|
| `GET`  | `/api/v1/auth/42/login/`     | Return the 42 OAuth authorization URL                        |
| `GET`  | `/api/v1/auth/42/callback/`  | Receive the 42 OAuth callback and redirect to the frontend with JWTs |
| `POST` | `/api/v1/auth/token/refresh/`| Exchange a refresh token for a new access token              |

Everything else is authenticated by default unless a view overrides it.

---

## 2. Authentication Model

### Default API authentication

`backend/ssbs/settings.py` configures DRF with:

- `DEFAULT_AUTHENTICATION_CLASSES = [JWTAuthentication]`
- `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`

That means authenticated Bearer-token access is the baseline for API routes.

Example request header:

```http
Authorization: Bearer <access_token>
```

### OAuth/JWT flow

The backend uses 42 Intra OAuth to authenticate users, then issues SimpleJWT access and refresh tokens.

Flow summary:

1. `GET /api/v1/auth/42/login/`
2. User is redirected to 42
3. 42 redirects to `GET /api/v1/auth/42/callback/?code=...`
4. Backend exchanges the code, creates or updates the local user, and issues JWTs
5. Backend redirects the browser to the frontend `/auth/callback#...` URL with the tokens in the fragment

### API key support

`backend/apps/users/permissions.py` still defines `HasAPIKey`, which validates the `X-API-Key` header against `SSBS_API_KEY`.

Important current-state note: this permission class exists, and `SSBS_API_KEY` is loaded in settings, but no active route currently applies `HasAPIKey`. API access is therefore controlled by JWT authentication and per-view permissions, not by API key enforcement.

---

## 3. Rate Limiting

Global DRF throttling is enabled in `backend/ssbs/settings.py`:

| Scope                | Limit         |
|----------------------|---------------|
| Anonymous            | `100/hour`    |
| Authenticated user | `1000/hour` |

Configured throttle classes:

- `AnonRateThrottle`
- `UserRateThrottle`

This applies across the API, including the unauthenticated OAuth-related endpoints.

---

## 4. Roles

`backend/apps/users/models.py` defines three application roles:

| Role                | Meaning                         |
|---------------------|---------------------------------|
| `LOGISTICS_STAFF`   | Administrative and operational staff |
| `STUDENT`           | Student rider                   |
| `DRIVER`            | Driver user                     |

### Automatic role assignment during OAuth

In `backend/apps/users/views.py`:

- users default to `STUDENT` on first OAuth login
- the login matching `ADMIN_42_LOGIN` is promoted to `LOGISTICS_STAFF`

---

## 5. Custom Permission Classes

Defined in `backend/apps/users/permissions.py`:

| Class                         | Current behavior                                             |
|-------------------------------|--------------------------------------------------------------|
| `HasAPIKey`                   | Accepts requests with a valid `X-API-Key` header matching `SSBS_API_KEY` |
| `IsLogisticsStaff`            | Allows only authenticated users whose role is `LOGISTICS_STAFF` |
| `IsStudent`                   | Allows only authenticated users whose role is `STUDENT`      |
| `IsDriver`                    | Allows only authenticated users whose role is `DRIVER`       |
| `IsLogisticsStaffOrReadOnly`  | Allows read methods for everyone, write methods only for logistics staff |

Current usage note:

- `IsLogisticsStaff` is actively used by several views
- `HasAPIKey`, `IsStudent`, `IsDriver`, and `IsLogisticsStaffOrReadOnly` are currently defined but not attached to active routes in this codebase

---

## 6. Endpoint Permission Matrix

### Authentication and user management

| Endpoint                          | Permission behavior                    |
|-----------------------------------|----------------------------------------|
| `GET /api/v1/auth/42/login/`      | `AllowAny`                             |
| `GET /api/v1/auth/42/callback/`   | `AllowAny`                             |
| `POST /api/v1/auth/token/refresh/`| Public SimpleJWT refresh endpoint      |
| `GET /api/v1/auth/me/`            | `IsAuthenticated`                      |
| `PATCH /api/v1/auth/me/`          | `IsAuthenticated`                      |
| `GET /api/v1/auth/users/`         | `IsLogisticsStaff`                     |
| `GET /api/v1/auth/users/<id>/`    | `IsLogisticsStaff`                     |
| `PATCH /api/v1/auth/users/<id>/`  | `IsLogisticsStaff`                     |
| `DELETE /api/v1/auth/users/<id>/` | `IsLogisticsStaff`                     |

### Stations

| Endpoint                                 | Permission behavior                |
|------------------------------------------|------------------------------------|
| `GET /api/v1/stations/`                  | Authenticated users can list       |
| `POST /api/v1/stations/`                 | Logistics staff only               |
| `GET /api/v1/stations/<id>/`             | Authenticated users can retrieve   |
| `PUT/PATCH/DELETE /api/v1/stations/<id>/`| Logistics staff only               |

### Buses

| Endpoint                              | Permission behavior                |
|---------------------------------------|------------------------------------|
| `GET /api/v1/buses/`                  | Authenticated users can list       |
| `POST /api/v1/buses/`                 | Logistics staff only               |
| `GET /api/v1/buses/<id>/`             | Authenticated users can retrieve   |
| `PUT/PATCH/DELETE /api/v1/buses/<id>/`| Logistics staff only               |

### Routes

| Endpoint                               | Permission behavior                |
|----------------------------------------|------------------------------------|
| `GET /api/v1/routes/`                  | Authenticated users can list       |
| `POST /api/v1/routes/`                 | Logistics staff only               |
| `GET /api/v1/routes/<id>/`             | Authenticated users can retrieve   |
| `PUT/PATCH/DELETE /api/v1/routes/<id>/`| Logistics staff only               |

### Drivers

| Endpoint                                | Permission behavior  |
|-----------------------------------------|----------------------|
| `GET /api/v1/drivers/`                  | Logistics staff only |
| `POST /api/v1/drivers/`                 | Logistics staff only |
| `GET /api/v1/drivers/<id>/`             | Logistics staff only |
| `PUT/PATCH/DELETE /api/v1/drivers/<id>/`| Logistics staff only |

### Trips

| Endpoint                                            | Permission behavior  |
|-----------------------------------------------------|----------------------|
| `GET /api/v1/trips/`                                | Logistics staff only |
| `POST /api/v1/trips/`                               | Logistics staff only |
| `GET /api/v1/trips/<id>/`                           | Logistics staff only |
| `PUT/PATCH/DELETE /api/v1/trips/<id>/`              | Logistics staff only |
| `GET /api/v1/trips/available/?station_id=...`       | Any authenticated user |

### Reservations

| Endpoint                                   | Permission behavior                                             |
|--------------------------------------------|-----------------------------------------------------------------|
| `GET /api/v1/reservations/`                | Any authenticated user; results are role-filtered               |
| `POST /api/v1/reservations/`               | Authenticated users reach the endpoint, but only `STUDENT` can create |
| `DELETE /api/v1/reservations/<id>/`        | Any authenticated user; non-staff can only cancel their own reservation |
| `GET /api/v1/reservations/history/`        | Any authenticated user; results are role-filtered               |

### Incident reports

The reports API is exposed through a DRF `ModelViewSet` under `/api/v1/reports/`.

| Endpoint                        | Permission behavior                                             |
|---------------------------------|-----------------------------------------------------------------|
| `GET /api/v1/reports/`          | `IsAuthenticated`; staff sees all reports, others only their own |
| `POST /api/v1/reports/`         | `IsAuthenticated`; reporter is forced to the current user      |
| `GET /api/v1/reports/<id>/`     | `IsAuthenticated`; queryset limits non-staff to their own reports |
| `PATCH /api/v1/reports/<id>/`   | `IsAuthenticated`; only logistics staff can update             |
| `PUT /api/v1/reports/<id>/`     | `IsAuthenticated`; only logistics staff can update             |
| `DELETE /api/v1/reports/<id>/`  | `IsAuthenticated`; current implementation follows the viewset default destroy path with no extra staff-only guard |

That last point is important: the view explicitly restricts updates to staff, but it does not add a matching destroy guard. Any authenticated user who can reach an object through the queryset may delete it. Staff can delete any report; non-staff can delete their own reports.

---

## 7. Behavior Notes That Matter

### Reservations are narrower than the class-level permission suggests

`ReservationListCreateView` and `ReservationDetailView` use `IsAuthenticated`, but business logic applies additional role and ownership checks:

- logistics staff cannot create reservations
- only students can create reservations
- logistics staff can list all current or historical reservations
- non-staff users only see their own reservations
- non-staff users can only cancel their own reservations

### Several read endpoints are broader than older docs claimed

Stations, buses, and routes are readable by any authenticated user. They are not logistics-staff-only for `GET`.

### Trips are stricter than older docs claimed

General trip CRUD endpoints are logistics-staff-only. The student-facing trip browsing path is the dedicated `/api/v1/trips/available/` endpoint.

---

## 8. Source of Truth

When this file and other documentation disagree, treat the code below as authoritative:

- `backend/ssbs/settings.py`
- `backend/ssbs/urls.py`
- `backend/apps/users/permissions.py`
- `backend/apps/users/views.py`
- `backend/apps/stations/views.py`
- `backend/apps/buses/views.py`
- `backend/apps/routes/views.py`
- `backend/apps/drivers/views.py`
- `backend/apps/trips/views.py`
- `backend/apps/reservations/views.py`
- `backend/apps/reports/views.py`
