/**
 * Production environment.
 *
 * The Angular app is served by ASP.NET Core from the same origin as the API,
 * so a relative base URL is used. Never hardcode http(s)://localhost here.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api'
};
