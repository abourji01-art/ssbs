# BACKEND_API.md — SSBS Backend API Reference

---

## BASE URL

| Environment                       | URL                             |
| --------------------------------- | ------------------------------- |
| Local (backend direct)            | `http://localhost:8000/api/v1`  |
| Local (WAF / frontend entrypoint) | `https://localhost:8443/api/v1` |
| Frontend same-origin API          | `/api/v1`                       |
| Production                        | Not configured yet              |

---

## AUTHENTICATION

### How it works

SSBS uses **42 Intra OAuth2** for login and **JWT (SimpleJWT)** for session tokens.

```
Authorization: Bearer <access_token>
```

### How to get a token

1. `GET /api/v1/auth/42/login/` → returns an `authorization_url`
2. Redirect user's browser to that URL
3. 42 redirects back to `GET /api/v1/auth/42/callback/?code=<code>`
4. Backend redirects the browser to the frontend `/auth/callback` route with JWTs in the URL fragment
5. Frontend stores those tokens and uses `access` as Bearer token on authenticated requests
6. When `access` expires → `POST /api/v1/auth/token/refresh/` with `{ refresh }` → get new `access`

### Token lifetimes

| Token   | Lifetime   |
| ------- | ---------- |
| Access  | 60 minutes |
| Refresh | 7 days     |

### Default permission

Settings define `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]`. Public access is limited to OAuth login/callback and token refresh; resource endpoints require authentication and many mutations require `LOGISTICS_STAFF`.

---

## ALL ENDPOINTS

---

### 1 — Authentication (`/api/v1/auth/`)

---

#### GET /api/v1/auth/42/login/

**What:** Returns the 42 OAuth authorization URL.
**Who:** Anyone
**Auth:** No

**Response 200**

```json
{
  "authorization_url": "https://api.intra.42.fr/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=public"
}
```

---

#### GET /api/v1/auth/42/callback/?code={code}

**What:** Exchanges the 42 auth code, issues JWT tokens, and redirects the browser to the frontend callback route.
**Who:** Anyone (browser redirect)
**Auth:** No

**Response 302**

Redirect location shape:

```text
/auth/callback#access=<jwt>&refresh=<jwt>&role=<role>&login=<login_42>
```

**Errors**

| Status | Message                                               | Trigger                            |
| ------ | ----------------------------------------------------- | ---------------------------------- |
| 400    | `{"error": "Missing authorization code."}`            | No `code` query param              |
| 502    | `{"error": "Failed to obtain access token from 42."}` | 42 token exchange failed           |
| 502    | `{"error": "Failed to fetch user profile from 42."}`  | 42 profile API failed              |
| 502    | `{"error": "Incomplete profile data from 42."}`       | Profile missing `login` or `email` |

---

#### POST /api/v1/auth/token/refresh/

**What:** Returns a new access token from a valid refresh token.
**Who:** Anyone
**Auth:** No

**Request**

```json
{
  "refresh": "string (JWT)"
}
```

**Response 200**

```json
{
  "access": "string (JWT)"
}
```

**Errors**

| Status | Message                                                                | Trigger                      |
| ------ | ---------------------------------------------------------------------- | ---------------------------- |
| 401    | `{"detail": "Token is invalid or expired", "code": "token_not_valid"}` | Bad or expired refresh token |

---

#### GET /api/v1/auth/me/

**What:** Returns the current user's profile.
**Who:** Any authenticated user
**Auth:** **Yes**

**Response 200**

```json
{
  "id": "uuid",
  "login_42": "string",
  "email": "string",
  "role": "STUDENT | LOGISTICS_STAFF | DRIVER",
  "station": "uuid | null",
  "station_name": "string | null",
  "is_active": true,
  "created_at": "datetime"
}
```

**Errors**

| Status | Message                                                       | Trigger               |
| ------ | ------------------------------------------------------------- | --------------------- |
| 401    | `{"detail": "Authentication credentials were not provided."}` | No token              |
| 401    | `{"detail": "Given token not valid for any token type"}`      | Expired/invalid token |

---

#### PATCH /api/v1/auth/me/

**What:** Update current user's profile (only `station` is writable).
**Who:** Any authenticated user
**Auth:** **Yes**

**Request**

```json
{
  "station": "uuid | null"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "login_42": "string",
  "email": "string",
  "role": "string",
  "station": "uuid | null",
  "station_name": "string | null",
  "is_active": true,
  "created_at": "datetime"
}
```

**Errors**

| Status | Message                                                       | Trigger                |
| ------ | ------------------------------------------------------------- | ---------------------- |
| 400    | `{"station": ["Invalid pk ... - object does not exist."]}`    | Station UUID not found |
| 401    | `{"detail": "Authentication credentials were not provided."}` | No token               |

**Read-only fields:** `id`, `login_42`, `email`, `role`, `is_active`, `created_at`

---

### 2 — Stations (`/api/v1/stations/`)

---

#### GET /api/v1/stations/

**What:** List all stations.
**Who:** Any authenticated user
**Auth:** Yes

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "created_at": "datetime"
  }
]
```

Ordered by `name` (ascending alphabetical).

---

#### POST /api/v1/stations/

**What:** Create a new station.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "name": "string"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "string",
  "created_at": "datetime"
}
```

**Errors**

| Status | Message                                                | Trigger        |
| ------ | ------------------------------------------------------ | -------------- |
| 400    | `{"name": ["station with this name already exists."]}` | Duplicate name |
| 400    | `{"name": ["This field is required."]}`                | Missing name   |

---

#### GET /api/v1/stations/{id}/

**What:** Retrieve a single station.
**Who:** Any authenticated user
**Auth:** Yes

**Response 200** — Same as list item shape.

**Errors**

| Status | Message                    | Trigger             |
| ------ | -------------------------- | ------------------- |
| 404    | `{"detail": "Not found."}` | UUID does not exist |

---

#### PUT /api/v1/stations/{id}/

**What:** Full update of a station.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "name": "string"
}
```

**Response 200** — Updated station.

**Errors**

| Status | Message                                                | Trigger        |
| ------ | ------------------------------------------------------ | -------------- |
| 400    | `{"name": ["station with this name already exists."]}` | Duplicate name |
| 404    | `{"detail": "Not found."}`                             | UUID not found |

---

#### PATCH /api/v1/stations/{id}/

**What:** Partial update of a station.
**Who:** Logistics staff only
**Auth:** Yes

**Request** (partial)

```json
{
  "name": "string"
}
```

**Response 200** — Updated station.

---

#### DELETE /api/v1/stations/{id}/

**What:** Delete a station (if not used by a route).
**Who:** Logistics staff only
**Auth:** Yes

**Response 204** — No content.

**Errors**

| Status | Message                                                      | Trigger                      |
| ------ | ------------------------------------------------------------ | ---------------------------- |
| 400    | `{"detail": "Station is referenced by one or more routes."}` | Station is in a RouteStation |
| 404    | `{"detail": "Not found."}`                                   | UUID not found               |

---

### 3 — Buses (`/api/v1/buses/`)

---

#### GET /api/v1/buses/

**What:** List all buses.
**Who:** Any authenticated user
**Auth:** Yes

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "plate": "string",
    "seat_capacity": "integer",
    "created_at": "datetime"
  }
]
```

Ordered by `name`.

---

#### POST /api/v1/buses/

**What:** Create a bus.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "name": "string",
  "plate": "string",
  "seat_capacity": "integer (positive)"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "string",
  "plate": "string",
  "seat_capacity": "integer",
  "created_at": "datetime"
}
```

**Errors**

| Status | Message                                              | Trigger         |
| ------ | ---------------------------------------------------- | --------------- |
| 400    | `{"plate": ["bus with this plate already exists."]}` | Duplicate plate |
| 400    | `{"seat_capacity": ["This field is required."]}`     | Missing field   |

---

#### GET /api/v1/buses/{id}/

**What:** Retrieve one bus.
**Who:** Any authenticated user
**Auth:** Yes

**Response 200** — Same shape as list item.

| Status | Message                    | Trigger   |
| ------ | -------------------------- | --------- |
| 404    | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/buses/{id}/

**What:** Full update.
**Who:** Logistics staff only
**Auth:** Yes

**Request** — Same as POST.
**Response 200** — Updated bus.

---

#### PATCH /api/v1/buses/{id}/

**What:** Partial update.
**Who:** Logistics staff only
**Auth:** Yes

**Request** (partial)

```json
{
  "seat_capacity": 60
}
```

**Response 200** — Updated bus.

---

#### DELETE /api/v1/buses/{id}/

**What:** Delete a bus (if no trip references it).
**Who:** Logistics staff only
**Auth:** Yes

**Response 204** — No content.

**Errors**

| Status | Message                                                 | Trigger                |
| ------ | ------------------------------------------------------- | ---------------------- |
| 400    | `{"detail": "Bus is referenced by one or more trips."}` | Bus assigned to a trip |
| 404    | `{"detail": "Not found."}`                              | Not found              |

---

### 4 — Routes (`/api/v1/routes/`)

---

#### GET /api/v1/routes/

**What:** List all routes with nested ordered stations.
**Who:** Any authenticated user
**Auth:** Yes

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "window": "peak | consolidated",
    "created_at": "datetime",
    "stations": [
      {
        "order": 1,
        "station": {
          "id": "uuid",
          "name": "string",
          "created_at": "datetime"
        }
      }
    ]
  }
]
```

Ordered by `name`.

---

#### POST /api/v1/routes/

**What:** Create a route with ordered stations.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "name": "string",
  "window": "peak | consolidated",
  "station_ids": ["uuid", "uuid", "uuid"]
}
```

- `station_ids` is **write-only**. Array order = stop order (index 0 = order 1).
- `stations` is **read-only** in the response (nested objects).

**Response 201** — Full route object with nested stations.

**Errors**

| Status | Message                                                                          | Trigger                          |
| ------ | -------------------------------------------------------------------------------- | -------------------------------- |
| 400    | `{"station_ids": "A route must have at least one station."}`                     | Missing or empty station_ids     |
| 400    | `{"non_field_errors": ["One or more stations do not exist or are duplicated."]}` | Bad UUIDs or duplicates in array |
| 400    | `{"name": ["route with this name already exists."]}`                             | Duplicate name                   |
| 400    | `{"window": ["\"x\" is not a valid choice."]}`                                   | Invalid window value             |

---

#### GET /api/v1/routes/{id}/

**What:** Retrieve one route with nested stations.
**Who:** Any authenticated user
**Auth:** Yes

**Response 200** — Same shape as list item.

| Status | Message                    | Trigger   |
| ------ | -------------------------- | --------- |
| 404    | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/routes/{id}/

**What:** Full update. Providing `station_ids` replaces all existing route stations.
**Who:** Logistics staff only
**Auth:** Yes

**Request** — Same as POST.
**Response 200** — Updated route with stations.

---

#### PATCH /api/v1/routes/{id}/

**What:** Partial update. If `station_ids` included, replaces stations. If omitted, stations untouched.
**Who:** Logistics staff only
**Auth:** Yes

**Request** (any subset)

```json
{
  "station_ids": ["uuid", "uuid"]
}
```

**Errors**

| Status | Message                                                      | Trigger                 |
| ------ | ------------------------------------------------------------ | ----------------------- |
| 400    | `{"station_ids": "A route must have at least one station."}` | Empty station_ids array |

---

#### DELETE /api/v1/routes/{id}/

**What:** Delete a route (if no trip references it).
**Who:** Logistics staff only
**Auth:** Yes

**Response 204** — No content.

**Errors**

| Status | Message                                                   | Trigger         |
| ------ | --------------------------------------------------------- | --------------- |
| 400    | `{"detail": "Route is referenced by one or more trips."}` | Route has trips |
| 404    | `{"detail": "Not found."}`                                | Not found       |

---

### 5 — Drivers (`/api/v1/drivers/`)

---

#### GET /api/v1/drivers/

**What:** List all drivers.
**Who:** Logistics staff only
**Auth:** Yes

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "string",
    "username": "string",
    "status": "active | inactive",
    "created_at": "datetime"
  }
]
```

> ⚠️ `password` is **never returned** in any response.

Ordered by `name`.

---

#### POST /api/v1/drivers/

**What:** Create a driver.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "name": "string",
  "username": "string",
  "password": "string (required, write-only)",
  "status": "active | inactive (default: active)"
}
```

**Response 201** — Driver object (no password).

**Errors**

| Status | Message                                                       | Trigger            |
| ------ | ------------------------------------------------------------- | ------------------ |
| 400    | `{"password": "Password is required."}`                       | Missing password   |
| 400    | `{"username": ["driver with this username already exists."]}` | Duplicate username |

**Notes:** `password` is hashed with Django's `make_password` before storage.

---

#### GET /api/v1/drivers/{id}/

**What:** Retrieve one driver.
**Who:** Logistics staff only
**Auth:** Yes

**Response 200** — Same as list item (no password).

| Status | Message                    | Trigger   |
| ------ | -------------------------- | --------- |
| 404    | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/drivers/{id}/

**What:** Full update. Password re-hashed if provided.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "name": "string",
  "username": "string",
  "password": "string (optional on update)",
  "status": "active | inactive"
}
```

**Response 200** — Updated driver (no password).

---

#### PATCH /api/v1/drivers/{id}/

**What:** Partial update. Send `password` to change it.
**Who:** Logistics staff only
**Auth:** Yes

**Request** (any subset)

```json
{
  "status": "inactive"
}
```

**Response 200** — Updated driver.

---

#### DELETE /api/v1/drivers/{id}/

**What:** Delete driver OR soft-delete (set inactive) if assigned to trips.
**Who:** Logistics staff only
**Auth:** Yes

**If no trips reference this driver:**
- **Response 204** — Permanently deleted.

**If trips reference this driver:**
- **Response 400** — `{"detail": "Driver is assigned to trips and has been set to inactive."}`
- Driver's `status` is changed to `"inactive"` (not deleted).

| Status | Message                                                                   | Trigger   |
| ------ | ------------------------------------------------------------------------- | --------- |
| 400    | `{"detail": "Driver is assigned to trips and has been set to inactive."}` | Has trips |
| 404    | `{"detail": "Not found."}`                                                | Not found |

---

### 6 — Trips (`/api/v1/trips/`)

---

#### GET /api/v1/trips/

**What:** List all trips (staff view).
**Who:** Logistics staff only
**Auth:** Yes

**Response 200**

```json
[
  {
    "id": "uuid",
    "route": "uuid (FK)",
    "bus": "uuid (FK)",
    "driver": "uuid (FK)",
    "departure_datetime": "datetime",
    "seats_left": "integer",
    "archived_at": "datetime | null",
    "created_at": "datetime"
  }
]
```

Ordered by `departure_datetime`.

---

#### POST /api/v1/trips/

**What:** Create a trip.
**Who:** Logistics staff only
**Auth:** Yes

**Request**

```json
{
  "route": "uuid",
  "bus": "uuid",
  "driver": "uuid",
  "departure_datetime": "datetime"
}
```

**Response 201** — Trip object.

**Errors**

| Status | Message                                                   | Trigger         |
| ------ | --------------------------------------------------------- | --------------- |
| 400    | `{"route": ["Invalid pk ... - object does not exist."]}`  | Bad route UUID  |
| 400    | `{"bus": ["Invalid pk ... - object does not exist."]}`    | Bad bus UUID    |
| 400    | `{"driver": ["Invalid pk ... - object does not exist."]}` | Bad driver UUID |

---

#### GET /api/v1/trips/{id}/

**What:** Retrieve one trip.
**Who:** Logistics staff only
**Auth:** Yes

**Response 200** — Trip object.

| Status | Message                    | Trigger   |
| ------ | -------------------------- | --------- |
| 404    | `{"detail": "Not found."}` | Not found |

---

#### PUT /api/v1/trips/{id}/

**What:** Full update.
**Who:** Logistics staff only
**Auth:** Yes

**Request** — Same as POST.
**Response 200** — Updated trip.

---

#### PATCH /api/v1/trips/{id}/

**What:** Partial update.
**Who:** Logistics staff only
**Auth:** Yes

**Request** (any subset)

```json
{
  "departure_datetime": "2026-01-01T23:00:00Z"
}
```

**Response 200** — Updated trip.

---

#### DELETE /api/v1/trips/{id}/

**What:** Delete a trip (cascades to all its reservations).
**Who:** Logistics staff only
**Auth:** Yes

**Response 204** — No content.

| Status | Message                    | Trigger   |
| ------ | -------------------------- | --------- |
| 404    | `{"detail": "Not found."}` | Not found |

---

#### GET /api/v1/trips/available/?station_id={uuid}

**What:** Browse trips available to an authenticated user for a station. Returns the next relevant night-service window for that station.
**Who:** Any authenticated user
**Auth:** Yes

**Query Parameters**

| Param        | Type | Required |
| ------------ | ---- | -------- |
| `station_id` | uuid | **Yes**  |

**Availability logic (server local time — `Africa/Casablanca`):**

- Finds the earliest future, non-archived trip for the given station.
- Builds the logical night-service window around that trip.
- Returns trips in that window that:
  - include the requested station
  - are not archived
  - depart in the future
  - are not full

**Filters applied:**
1. `archived_at IS NULL` (active only)
2. Route includes `station_id` in its RouteStation list
3. `reservation_count < bus.seat_capacity` (not full)
4. Ordered by `departure_datetime` ascending

**Response 200**

```json
[
  {
    "id": "uuid",
    "route": "uuid",
    "bus": "uuid",
    "driver": "uuid",
    "departure_datetime": "datetime",
    "seats_left": "integer",
    "archived_at": null,
    "created_at": "datetime"
  }
]
```

Empty `[]` = no trips available (not an error).

**Errors**

| Status | Message                                 | Trigger             |
| ------ | --------------------------------------- | ------------------- |
| 400    | `{"detail": "station_id is required."}` | Missing query param |

---

### 7 — Reservations (`/api/v1/reservations/`)

---

#### GET /api/v1/reservations/

**What:** List active reservations.
**Who:** Authenticated users
**Auth:** Yes

**Response 200**

```json
[
  {
    "id": "uuid",
    "trip": "uuid (FK)",
    "student": "uuid (FK)",
    "created_at": "datetime"
  }
]
```

Ordered by `created_at` descending. Filters: `trip.archived_at IS NULL`.

**Behavior**

- `LOGISTICS_STAFF` sees all active reservations.
- Non-staff users see only their own active reservations.

---

#### POST /api/v1/reservations/

**What:** Reserve a seat on a trip for the authenticated student.
**Who:** Students only
**Auth:** Yes

**Request**

```json
{
  "trip": "uuid"
}
```

`user_id` from the client is ignored if sent.

**Response 201**

```json
{
  "id": "uuid",
  "trip": "uuid",
  "student": "uuid",
  "created_at": "datetime"
}
```

**Seat locking:** Uses `SELECT ... FOR UPDATE` inside a DB transaction. Two concurrent requests for the last seat = only one succeeds. Unique constraint `(trip, student)` prevents double-booking at DB level.

**Errors**

| Status | Message                                                     | Trigger                          |
| ------ | ----------------------------------------------------------- | -------------------------------- |
| 400    | `{"detail": "trip is required."}`                           | Missing trip                     |
| 400    | `{"detail": "Trip is no longer available."}`                | Trip is archived                 |
| 403    | `{"detail": "Logistics staff cannot create reservations."}` | Staff caller                     |
| 403    | `{"detail": "Only students can create reservations."}`      | Non-student caller               |
| 409    | `{"error": "No seats available", "code": "capacity_error"}` | Trip is full                     |
| 400    | `{"detail": "Already reserved."}`                           | Student already booked this trip |
| 404    | `{"detail": "Trip not found."}`                             | Trip UUID doesn't exist          |

---

#### GET /api/v1/reservations/history/

**What:** List archived reservations.
**Who:** Authenticated users
**Auth:** Yes

**Response 200** — Same shape as active list. Filters: `trip.archived_at IS NOT NULL`.

**Behavior**

- `LOGISTICS_STAFF` sees all archived reservations.
- Non-staff users see only their own archived reservations.

---

#### DELETE /api/v1/reservations/{id}/

**What:** Cancel a reservation.
**Who:** Reservation owner or logistics staff
**Auth:** Yes

**Response 204** — Deleted. Seat becomes available again.

**Errors**

| Status | Message                                                           | Trigger                                          |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------ |
| 400    | `{"detail": "Cannot cancel a reservation for an archived trip."}` | Trip is archived                                 |
| 404    | (empty body)                                                      | Reservation not found or not owned by the caller |

---

### 8 — Reports (`/api/v1/reports/`)

**What:** Incident reports for late buses, no-shows, full buses, accidents, and related issues.
**Who:** Authenticated users
**Auth:** Yes

**Behavior**

- `GET /api/v1/reports/`: staff sees all reports; other users see only reports they created.
- `POST /api/v1/reports/`: any authenticated user can create a report; `reporter` is always the authenticated user.
- `GET /api/v1/reports/{id}/`: authenticated access through the same queryset rules.
- `PATCH/PUT /api/v1/reports/{id}/`: logistics staff only.
- `DELETE /api/v1/reports/{id}/`: follows the `ModelViewSet` default permission (`IsAuthenticated`), so the current implementation allows authenticated deletes unless tightened separately.

---

## ALL MODELS

---

### User (`apps.users`)

| Field        | Type                 | Nullable              | Notes                                                               |
| ------------ | -------------------- | --------------------- | ------------------------------------------------------------------- |
| `id`         | UUIDField (PK)       | No                    | Auto-generated                                                      |
| `login_42`   | CharField(100)       | Yes (nullable, blank) | Unique                                                              |
| `email`      | EmailField           | No                    | Unique, used as USERNAME_FIELD                                      |
| `role`       | CharField(20)        | No                    | Choices: `STUDENT`, `LOGISTICS_STAFF`, `DRIVER`. Default: `STUDENT` |
| `station`    | ForeignKey → Station | Yes (nullable)        | SET_NULL on delete                                                  |
| `is_active`  | BooleanField         | No                    | Default: True                                                       |
| `is_staff`   | BooleanField         | No                    | Default: False                                                      |
| `created_at` | DateTimeField        | No                    | Auto-set on create                                                  |
| `password`   | CharField            | No                    | Inherited from AbstractBaseUser                                     |
| `last_login` | DateTimeField        | Yes                   | Inherited from AbstractBaseUser                                     |

---

### Station (`apps.stations`)

| Field        | Type           | Nullable | Notes              |
| ------------ | -------------- | -------- | ------------------ |
| `id`         | UUIDField (PK) | No       | Auto-generated     |
| `name`       | CharField(100) | No       | Unique             |
| `created_at` | DateTimeField  | No       | Auto-set on create |

Ordering: `name` ascending.

---

### Bus (`apps.buses`)

| Field           | Type                 | Nullable | Notes              |
| --------------- | -------------------- | -------- | ------------------ |
| `id`            | UUIDField (PK)       | No       | Auto-generated     |
| `name`          | CharField(100)       | No       |                    |
| `plate`         | CharField(20)        | No       | Unique             |
| `seat_capacity` | PositiveIntegerField | No       |                    |
| `created_at`    | DateTimeField        | No       | Auto-set on create |

Ordering: `name` ascending.

---

### Route (`apps.routes`)

| Field        | Type           | Nullable | Notes                           |
| ------------ | -------------- | -------- | ------------------------------- |
| `id`         | UUIDField (PK) | No       | Auto-generated                  |
| `name`       | CharField(100) | No       | Unique                          |
| `window`     | CharField(20)  | No       | Choices: `peak`, `consolidated` |
| `created_at` | DateTimeField  | No       | Auto-set on create              |

Ordering: `name` ascending.

---

### RouteStation (`apps.routes`)

| Field     | Type                 | Nullable | Notes                                    |
| --------- | -------------------- | -------- | ---------------------------------------- |
| `id`      | AutoField (PK)       | No       | Django default                           |
| `route`   | ForeignKey → Route   | No       | CASCADE, `related_name='route_stations'` |
| `station` | ForeignKey → Station | No       | PROTECT                                  |
| `order`   | PositiveIntegerField | No       |                                          |

Constraints: `unique_together = [('route', 'order'), ('route', 'station')]`
Ordering: `order` ascending.

---

### Driver (`apps.drivers`)

| Field        | Type           | Nullable | Notes                                            |
| ------------ | -------------- | -------- | ------------------------------------------------ |
| `id`         | UUIDField (PK) | No       | Auto-generated                                   |
| `name`       | CharField(100) | No       |                                                  |
| `username`   | CharField(100) | No       | Unique                                           |
| `password`   | CharField(255) | No       | Stored hashed via `make_password`                |
| `status`     | CharField(20)  | No       | Choices: `active`, `inactive`. Default: `active` |
| `created_at` | DateTimeField  | No       | Auto-set on create                               |

Ordering: `name` ascending.

---

### Trip (`apps.trips`)

| Field                | Type                 | Nullable       | Notes                       |
| -------------------- | -------------------- | -------------- | --------------------------- |
| `id`                 | UUIDField (PK)       | No             | Auto-generated              |
| `route`              | ForeignKey → Route   | No             | PROTECT                     |
| `bus`                | ForeignKey → Bus     | No             | PROTECT                     |
| `driver`             | ForeignKey → Driver  | No             | PROTECT                     |
| `departure_datetime` | DateTimeField        | No             |                             |
| `seats`              | PositiveIntegerField | No             | Must be ≤ bus.seat_capacity |
| `archived_at`        | DateTimeField        | Yes (nullable) | Default: null               |
| `created_at`         | DateTimeField        | No             | Auto-set on create          |

Ordering: `departure_datetime` ascending.

---

### Reservation (`apps.reservations`)

| Field        | Type              | Nullable | Notes                                  |
| ------------ | ----------------- | -------- | -------------------------------------- |
| `id`         | UUIDField (PK)    | No       | Auto-generated                         |
| `trip`       | ForeignKey → Trip | No       | CASCADE, `related_name='reservations'` |
| `student`    | ForeignKey → User | No       | CASCADE                                |
| `created_at` | DateTimeField     | No       | Auto-set on create                     |

Constraints: `unique_together = [('trip', 'student')]`
Ordering: `-created_at` (newest first).

---

### Report (`apps.reports`)

| Field         | Type              | Nullable | Notes                                                   |
| ------------- | ----------------- | -------- | ------------------------------------------------------- |
| `id`          | UUIDField (PK)    | No       | Auto-generated                                          |
| `reporter`    | ForeignKey → User | No       | CASCADE, `related_name='reports'`                       |
| `trip`        | ForeignKey → Trip | Yes      | SET_NULL, optional                                      |
| `category`    | CharField(20)     | No       | Choices: `late`, `no_show`, `full`, `accident`, `other` |
| `description` | TextField         | Yes      | Blank allowed                                           |
| `status`      | CharField(20)     | No       | Choices: `pending`, `resolved`                          |
| `created_at`  | DateTimeField     | No       | Auto-set on create                                      |

---

## IMPLEMENTATION NOTES

- `archive_trips` is implemented as a management command and archives trips that departed more than 25 minutes ago and have reservations.
- Resource permissions are enforced with `IsAuthenticated` and custom role-based permission classes; the historical `AllowAny` audit notes no longer apply.
- Trip responses expose `seats_left` as a derived read-only field. Capacity is defined by the related bus.
- Incident reports are implemented under `/api/v1/reports/` using a DRF router-backed `ModelViewSet`.

---

## KNOWN LIMITATIONS

### 1. Trip serializer returns FK UUIDs, not fully nested route/bus/driver objects

**Severity:** Low
**Where:** `apps/trips/serializers.py`
**Problem:** Trip responses return related objects primarily as UUIDs, with a small set of helper labels such as `route_name`, `bus_name`, and `seats_left`.
**Impact:** Clients that need full route/bus/driver payloads may still need additional requests or local joins.
