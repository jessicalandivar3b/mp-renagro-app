import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Import the addIcons function and the specific icons you need
import { addIcons } from 'ionicons';
import {
  personCircleOutline, mapOutline, clipboardOutline, refreshCircleOutline, chevronDownOutline,
  clipboardSharp, home, homeSharp, addCircleOutline, removeCircleOutline, listOutline, arrowBackOutline, arrowForwardOutline,
  locateOutline,
  documentTextOutline,
  saveOutline,
  personCircleSharp,
  logOutSharp,
  leafOutline,
  createOutline
} from 'ionicons/icons';
import { provideHttpClient } from '@angular/common/http';


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      navAnimation: undefined,
      animated: false
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient()
  ],
});

// Registro de íconos
addIcons({
  'home': home,
  'home-sharp': homeSharp,
  'list-outline': listOutline,
  'add-circle-outline': addCircleOutline,
  'remove-circle-outline': removeCircleOutline,
  'clipboard-sharp': clipboardSharp,
  'person-circle-outline': personCircleOutline,
  'map-outline': mapOutline,
  'clipboard-outline': clipboardOutline,
  'refresh-circle-outline': refreshCircleOutline,
  'chevron-down-outline': chevronDownOutline,
  'arrow-back-outline': arrowBackOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'locate-outline': locateOutline,
  'document-text-outline': documentTextOutline,
  'save-outline': saveOutline,
  'person-circle-sharp': personCircleSharp,
  'log-out-sharp': logOutSharp,
  'leaf-outline': leafOutline,
  // 'tree-outline': tree
  'create-outline': createOutline,

});