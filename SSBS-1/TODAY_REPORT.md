# Today's Report — Mar 16, 2026

## Testing Setup

To test trips at any time of day (bypassing the 10PM–6AM window):

1. Make sure `TESTING_MODE=true` is set in `.env` and `docker-compose.yml`
2. Run the test trip seeder to create trips departing soon:

```bash
docker-compose exec backend python manage.py create_test_trips
```

This creates 3 trips departing in 5 minutes, 30 minutes, and 1 hour from now.

> **Note:** To test: run `seed_test_data.py` to create trips with `departure_datetime = now + 5 minutes`

## What TESTING_MODE Does

| Setting | Effect |
|---------|--------|
| `TESTING_MODE=true` | Backend returns all active trips regardless of time of day |
| `TESTING_MODE=false` (default) | Production behavior: trips only between 10PM and 6AM |
| `VITE_TESTING_MODE=true` | Shows amber "Testing Mode" banner in admin trips page |

## Frontend Env

`frontend/.env.local`:
```
VITE_TESTING_MODE=true
```
