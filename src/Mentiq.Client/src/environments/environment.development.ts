/**
 * Development environment.
 *
 * The Angular dev server (ng serve) proxies "/api" to the ASP.NET Core API
 * via proxy.conf.json, so the same relative base URL works in development.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api'
};
