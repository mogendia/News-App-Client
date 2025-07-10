import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // لو عندك راوتنج

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes) // لو في راوتنج
  ]
});
