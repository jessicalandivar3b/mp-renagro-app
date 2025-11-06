// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  ApiAuthUrl: 'http://localhost:3010/api',
  //ApiAuthUrl: 'https://mp-auth-srv.vercel.app/api',
  ApiBoletasUrl: 'http://localhost:3006/api',
  //ApiBoletasUrl: 'https://mp-renagro-srv.vercel.app/api',
  API_RENAGRO_URL: 'http://localhost:3023',
  appVersion: 9
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
