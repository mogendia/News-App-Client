import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // لو عندك راوتنج
import { LOCALE_ID } from '@angular/core';
import localeAr from '@angular/common/locales/ar';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeAr);
bootstrapApplication(App, {
  providers: [
     { provide: LOCALE_ID, useValue: 'ar-EG' },
    provideHttpClient(),
    provideRouter(routes) // لو في راوتنج
  ]
});
