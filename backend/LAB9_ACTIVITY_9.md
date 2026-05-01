# Laboratory Activity No. 9 - DRF Integration Checklist

This backend is the DRF API used by the Vibeo React web app and Vibeo mobile app.

## Task 1 - Backend Models and Endpoints

Model example: `WatchlistItem` in `movies/models.py`

Relevant fields:
- `user`
- `tmdb_id`
- `title` / `name`
- `poster_path`
- `media_type`
- `status`
- `added_at`
- `updated_at`

API endpoints:
- `GET /api/v1/watchlist/`
- `POST /api/v1/watchlist/`
- `PATCH /api/v1/watchlist/{id}/`
- `DELETE /api/v1/watchlist/{id}/`
- `GET /api/v1/leaderboard/`
- `POST /api/v1/sync-stats/`
- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`

The endpoints return JSON through Django REST Framework serializers in `movies/serializers.py`.

## Task 2 - CORS

Configured in `vibeo_api/settings.py`:

```python
INSTALLED_APPS = [
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
]

CORS_ALLOW_ALL_ORIGINS = True
```

The package is listed in `requirements.txt`:

```txt
django-cors-headers>=4.0
```

## Task 3 - Web UI Fetches API Data

React web API client: `src/api/djangoClient.js`

Example function:

```js
export const fetchWatchlist = async () => normalizePaginated(await authRequest('/watchlist/'));
```

Interactive demo page:

```txt
/docs
```

Open the API Docs page, log in/register with Django credentials, then test:
- Protected Watchlist Retrieve
- Global Leaderboard
- User Stats Sync

## Task 4 - Web UI Sends Data to Backend

React web API client functions:

```js
createWatchlistItem(movie, 'planning')
updateWatchlistItem(movie, 'completed')
deleteWatchlistItem(movie)
```

The Docs page includes buttons for create, update, and delete. The response panel shows the DRF JSON response.

## Task 5 - Mobile UI Uses Same API

Mobile API client: `vibeo-mobile/src/api/djangoClient.ts`

Mobile hooks: `vibeo-mobile/src/hooks/useFirestore.ts`

The mobile app uses the same endpoints:
- `GET /api/v1/watchlist/`
- `POST /api/v1/watchlist/`
- `PATCH /api/v1/watchlist/{id}/`
- `DELETE /api/v1/watchlist/{id}/`
- `GET /api/v1/leaderboard/`
- `POST /api/v1/sync-stats/`

Set the mobile API URL in `.env`:

```txt
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

For a physical phone, use the computer LAN IP instead of `127.0.0.1`.

## Task 6 - Authentication Integration

Token auth endpoints:

```txt
POST /api/v1/auth/register/
POST /api/v1/auth/login/
```

Protected requests send:

```txt
Authorization: Token <your_token>
```

Web stores the token in localStorage. Mobile stores the token in AsyncStorage.

## Task 7 - Validate Data Flow

Expected flow:

```txt
Frontend -> API -> Database -> API -> Frontend
```

Use watchlist as the main CRUD proof:

1. Register or log in.
2. Create a watchlist item with `POST /api/v1/watchlist/`.
3. Retrieve it with `GET /api/v1/watchlist/`.
4. Update status with `PATCH /api/v1/watchlist/{id}/`.
5. Delete it with `DELETE /api/v1/watchlist/{id}/`.
6. Retrieve again and confirm it no longer appears.

## Task 8 - API Responses and Errors

The API clients parse DRF responses and display useful messages:
- Success responses are shown as JSON on the Docs page.
- Invalid input shows serializer errors.
- Missing token shows unauthorized errors.
- Empty lists render as empty arrays or paginated `results: []`.

## HTTPie Test Commands

Start backend:

```bash
python backend/manage.py migrate
python backend/manage.py runserver
```

Register:

```bash
http POST http://127.0.0.1:8000/api/v1/auth/register/ username=lab9user email=lab9user@example.com password='Lab9Pass123!'
```

Login:

```bash
http POST http://127.0.0.1:8000/api/v1/auth/login/ username=lab9user password='Lab9Pass123!'
```

Create watchlist item:

```bash
http POST http://127.0.0.1:8000/api/v1/watchlist/ "Authorization:Token <your_token>" tmdb_id:=157336 title=Interstellar media_type=movie status=planning
```

Retrieve watchlist:

```bash
http GET http://127.0.0.1:8000/api/v1/watchlist/ "Authorization:Token <your_token>"
```

Update watchlist item:

```bash
http PATCH http://127.0.0.1:8000/api/v1/watchlist/<id>/ "Authorization:Token <your_token>" status=completed
```

Delete watchlist item:

```bash
http DELETE http://127.0.0.1:8000/api/v1/watchlist/<id>/ "Authorization:Token <your_token>"
```

Leaderboard:

```bash
http GET http://127.0.0.1:8000/api/v1/leaderboard/
```

Sync stats:

```bash
http POST http://127.0.0.1:8000/api/v1/sync-stats/ firebase_uid=lab9-firebase-uid username='Lab 9 User' total_watch_time:=3600 current_streak:=3 highest_streak:=5
```

## Screenshot Checklist

Capture:
- Backend running in terminal.
- Swagger page at `/api/v1/swagger/`.
- HTTPie login response showing a token.
- HTTPie or Docs page watchlist POST response.
- Watchlist GET response showing the created item.
- PATCH response showing changed `status`.
- DELETE response or GET response confirming removal.
- React Docs page showing API response panels.
- Mobile screen using leaderboard or watchlist data.
