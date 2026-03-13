# FitTrack AI Frontend

Stripe-inspired React frontend for the fitness microservices backend.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the sample env:

```bash
copy .env.example .env
```

3. Start the app:

```bash
npm run dev
```

## Environment

- `VITE_API_BASE_URL=http://localhost:8080`
- `VITE_KEYCLOAK_AUTH_URL=http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/auth`
- `VITE_KEYCLOAK_TOKEN_URL=http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/token`
- `VITE_KEYCLOAK_LOGOUT_URL=http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/logout`
- `VITE_KEYCLOAK_CLIENT_ID=oauth2-pkce-client`
- `VITE_KEYCLOAK_REDIRECT_URI=http://localhost:5173/auth`
- `VITE_ENABLE_MOCK_FALLBACK=true`

## Demo path

1. Login from the landing page.
2. Open the dashboard.
3. Track an activity.
4. Show the activity history and recommendation status.
5. Open recommendations and explain fallback/pending states.
