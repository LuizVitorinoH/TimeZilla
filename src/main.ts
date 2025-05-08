import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideNgxMask } from 'ngx-mask';

// NÃO passe configurações manualmente aqui
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideNgxMask() // <- apenas isso
  ]
}).catch((err) => console.error(err));
