export const authConfig = {
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'oauth2-pkce-client',
  authorizationEndpoint:
    import.meta.env.VITE_KEYCLOAK_AUTH_URL ||
    'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/auth',
  tokenEndpoint:
    import.meta.env.VITE_KEYCLOAK_TOKEN_URL ||
    'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/token',
  logoutEndpoint:
    import.meta.env.VITE_KEYCLOAK_LOGOUT_URL ||
    'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/logout',
  redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || 'http://localhost:5173/auth',
  scope: 'openid profile email offline_access',
  autoLogin: false,
  onRefreshTokenExpire: (event: { logIn: () => void }) => event.logIn(),
}
