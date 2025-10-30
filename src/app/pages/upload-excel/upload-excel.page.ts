import { Component, OnInit } from '@angular/core';
import { ExcelUploadService, EntityType } from '../../services/excel-upload.service';
import {
  LoadingController, AlertController, ToastController,
  // Importación de componentes de Ionic para Standalone
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonItem,
  IonLabel, IonSelect, IonSelectOption, IonButton,
  IonIcon, IonButtons, IonBackButton, IonText
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// ❌ Se elimina la importación del AuthService, ya que no se usará.
// import { AuthService } from 'src/app/services/auth.service'; 

@Component({
  selector: 'app-upload-excel',
  templateUrl: './upload-excel.page.html',
  styleUrls: ['./upload-excel.page.scss'],

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonText
  ]
})
export class UploadExcelPage implements OnInit {

  selectedFile: File | null = null;
  selectedEntity: EntityType | null = null; // Controla si es 'meta' o 'avance'

  // ❌ Propiedad authToken eliminada

  constructor(
    private uploadService: ExcelUploadService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    // ❌ Inyección de AuthService eliminada
  ) { }

  ngOnInit() {
    // ❌ Lógica de inicialización de token eliminada
  }

  /**
   * Captura el archivo seleccionado del input.
   */
  onFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    this.selectedFile = (fileList && fileList.length > 0) ? fileList[0] : null;
  }

  /**
   * Asigna la entidad seleccionada por el dropdown.
   */
  onEntityChange(event: any) {
    this.selectedEntity = event.detail.value as EntityType;
  }

  /**
   * Inicia el proceso de carga masiva.
   */
  async uploadData() {
    if (!this.selectedEntity || !this.selectedFile) {
      this.presentToast('Debe seleccionar la Entidad y el Archivo.', 'warning');
      return;
    }

    // ❌ Validación de token eliminada

    const loader = await this.loadingCtrl.create({
      message: `Cargando y procesando registros de ${this.selectedEntity}...`,
    });
    await loader.present();

    // 💡 LLAMADA AL SERVICIO: Enviamos una cadena vacía ('') como token.
    // (Esto funciona porque el ExcelUploadService fue modificado para ignorar cabeceras si el token es '').
    this.uploadService.uploadExcel(this.selectedFile, '', this.selectedEntity).subscribe({
      next: (response) => {
        loader.dismiss();
        this.presentToast(response.message || 'Carga completada exitosamente.', 'success');
        this.selectedFile = null;
        this.selectedEntity = null; // Reinicia la selección
      },
      error: async (err) => {
        loader.dismiss();
        const status = err.status;

        if (status === 207) {
          // Manejo de Error MULTI-STATUS (Carga Parcial)
          const message = err.error?.message || 'Carga parcial completada con errores.';
          this.presentAlert('Carga Parcial con Errores (207)', message, err.error?.errors);
        } else if (status >= 400) {
          // Errores de la API (Validación, Server, etc.)
          this.presentAlert(`Error ${status}`, err.error?.message || 'Error en el servidor.');
        } else {
          // Errores de red o conexión
          this.presentAlert('Error de Conexión', 'No se pudo contactar al servidor.');
        }
      }
    });
  }

  // --- Funciones de Utilidad (Toast y Alert) ---

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }

  private async presentAlert(header: string, message: string, errors: any[] = []) {
    let subHeader = message;
    if (errors.length > 0) {
      subHeader += `<br><br>Se encontraron **${errors.length} errores**. Ver consola para el detalle de los registros fallidos.`;
      console.error('Detalle de Errores de Carga:', errors);
    }

    const alert = await this.alertCtrl.create({
      header: header,
      subHeader: subHeader,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}
