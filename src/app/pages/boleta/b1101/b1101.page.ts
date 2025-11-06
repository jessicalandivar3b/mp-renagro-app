import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { MpInputErrorComponent } from "src/app/components/mp-input-error/mp-input-error.component";
import { MpSearchModalComponent } from 'src/app/components/mp-search-modal/mp-search-modal.component';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DataService } from 'src/app/services/data.service';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { MpAlphanumericValidator } from "src/app/validators/alphanumeric-validator";
import { MpDecimalPrecisionValidator } from 'src/app/validators/decimal-precision-validator';
import { MpTextValidator } from 'src/app/validators/text-validator';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';

@Component({
  selector: 'app-b1101',
  templateUrl: './b1101.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MpInputErrorComponent, MpTextValidator, MpAlphanumericValidator, MpDecimalPrecisionValidator]
})
export class B1101Page {
  private router = inject(Router);
  private navegacionService = inject(NavegacionService);
  public readonly catalogoService = inject(CatalogoService);

  public readonly boletaService = inject(DataService);
  public boleta = this.boletaService.boleta;

  private modalController = inject(ModalController);

  private toastCtrl = inject(ToastController);
  private readonly geoOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000,           // Esperar hasta 30 segundos
    maximumAge: 0             // No usar caché
  };

  constructor() { }

  async openModal(campo: string, grupo: string = 'boleta'): Promise<void> {
    const modal = await this.modalController.create({
      component: MpSearchModalComponent,
      componentProps: { campo, grupo },
    });
    await modal.present();
  }

  public onButtonBack(): void {
    this.navegacionService.goToPrevious(this.router.url);
  }

  public onButtonNext(): void {
    this.navegacionService.goToNext(this.router.url);
  }

  // Utilidad para mostrar mensajes
  private async showToast(message: string, color: string = 'primary', duration: number = 3000): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'bottom',
    });
    toast.present();
  }

  /**
   * 🎯 Captura las coordenadas geográficas (Latitud, Longitud, Altitud) del dispositivo.
   */
  public async captureCoordinates(): Promise<void> {
    try {
      this.showToast('Buscando ubicación actual...', 'medium', 1500);

      // 1. Obtener la posición actual
      const position = await Geolocation.getCurrentPosition(this.geoOptions);

      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;
      const altitud = position.coords.altitude || 0;

      // 2. Actualizar los campos de la boleta mediante el servicio
      //    Nota: Asegurarse de que los valores sean strings si así los espera el servicio
      this.boletaService.onInputChange(longitud, 'longitud');
      this.boletaService.onInputChange(latitud, 'latitud');
      this.boletaService.onInputChange(Math.round(altitud), 'altitud');

      this.showToast('Coordenadas capturadas con éxito. ✅', 'success', 2000);

    } catch (error: any) {
      console.error('Error al capturar coordenadas:', error);

      let message = 'Error: No se pudo obtener la ubicación.';
      if (error.code === 1) {
        message = 'Debe activar los permisos de ubicación para la aplicación.';
      } else if (error.code === 3) {
        message = 'Tiempo de espera agotado. Intente de nuevo en un lugar abierto.';
      }

      this.showToast(message, 'danger', 4000);
    }
  }
}
