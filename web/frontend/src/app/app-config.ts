import { ApplicationConfig } from '@angular/core';
import {  provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './security/interceptor/AuthInterceptor';


export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), provideHttpClient(withInterceptors([authInterceptor]))]
};
