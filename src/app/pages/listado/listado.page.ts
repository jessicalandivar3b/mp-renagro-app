import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSpinner,
  IonButton,
  IonButtons,
  IonMenuButton,
  ToastController,
  IonFooter,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { BoletasService } from 'src/app/services/boletas.service';
import { DataService } from 'src/app/services/data.service';
import { Boleta } from 'src/app/interfaces/boleta.interface';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonSpinner,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonFooter,
    IonIcon
  ]
})
export class ListadoPage implements OnInit {
  private authService = inject(AuthService);
  private boletasService = inject(BoletasService);
  private dataService = inject(DataService);
  private toastController = inject(ToastController);
  private router = inject(Router);

  public codigoEncuestador: string | undefined | null = null;
  public boletas = signal<Boleta[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);
  public isSaving = signal<boolean>(false);

  // Panel JSON
  public selectedBoletaJson: WritableSignal<Boleta | null> = signal(null);
  public isJsonPanelOpen: WritableSignal<boolean> = signal(false);

  constructor() { }

  ngOnInit() {
    this.codigoEncuestador = this.authService.getCodigoEncuestador();

    if (!this.codigoEncuestador) {
      this.error.set('No se encontró el código de encuestador. Por favor, vuelva a iniciar sesión.');
      this.isLoading.set(false);
      return;
    }

    this.fetchBoletas();
  }

  // ==================================================
  // 🔹 PANEL JSON (Visualizador)
  // ==================================================
  public showJsonPanel(boleta: Boleta): void {
    this.selectedBoletaJson.set(boleta);
    this.isJsonPanelOpen.set(true);
  }

  public closeJsonPanel(): void {
    this.isJsonPanelOpen.set(false);
    // this.selectedBoletaJson.set(null); // Opcional
  }

  public formatJson(json: any): string {
    if (!json) return 'No hay datos de boleta seleccionada.';

    let jsonString = JSON.stringify(json, null, 2);
    jsonString = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([a-zA-Z0-9_]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(-?\d+(\.\d+)?)/g, ': <span class="json-number">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="json-boolean">$1</span>');

    return jsonString;
  }

  // ==================================================
  // 🔹 SELECCIONAR Y CARGAR BOLETA
  // ==================================================
  public selectBoleta(boletaKey: string): void {
    const selectedBoleta = this.boletas().find(
      (boleta: Boleta) => boleta.codigoUPA === boletaKey
    );

    if (selectedBoleta) {
      console.log('✅ Boleta seleccionada para cargar (usando UPA):', selectedBoleta);

      this.dataService.setActiveBoletaFromList(selectedBoleta);

      this.mostrarToast(`Boleta ${selectedBoleta.codigoUPA} cargada. 📋`, 'success', 1500);
      this.router.navigateByUrl('/home/b0101');
    } else {
      this.mostrarToast('Error: Boleta no encontrada con el UPA proporcionado. 🔑', 'danger');
      console.error(`Boleta con clave '${boletaKey}' no encontrada en el array local.`);
    }
  }

  // ==================================================
  // 🔹 GUARDAR / SINCRONIZAR BOLETA ACTUAL
  // ==================================================
  public grabarBoletaActual(): void {
    this.isSaving.set(true);
    console.log('Iniciando intento de guardado/sincronización de la boleta actual...');

    this.dataService.boletaSave().subscribe({
      next: () => {
        this.mostrarToast('Boleta guardada y sincronizada correctamente. ✅', 'success');
        this.isSaving.set(false);
      },
      error: (err: Error) => {
        this.mostrarToast(`${err.message} 💾`, 'warning', 6000);
        this.isSaving.set(false);
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }

  // ==================================================
  // 🔹 NUEVA BOLETA
  // ==================================================
  public nuevaBoleta(): void {
    this.dataService.createAndSetActiveBoleta();
    this.mostrarToast('Iniciando nueva boleta. 📝', 'success', 2000);
    this.router.navigateByUrl('/home/b0101');
  }

  // ==================================================
  // 🔹 UTILIDAD: TOAST
  // ==================================================
  private async mostrarToast(
    message: string,
    color: string,
    duration: number = 3000
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'bottom',
    });
    toast.present();
  }

  // ==================================================
  // 🔹 CARGAR BOLETAS (ONLINE / OFFLINE)
  // ==================================================
  fetchBoletas(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.boletasService.getBoletasPorEncuestador(this.codigoEncuestador!).subscribe({
      next: (data) => {
        this.boletas.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        const boletasLocales = this.boletasService.getBoletasLocalesAsArray();

        if (boletasLocales.length > 0) {
          this.boletas.set(boletasLocales);
          this.mostrarToast('Servidor no disponible. Usando datos locales. 💾', 'warning', 5000);
        } else {
          this.error.set(err.message || 'Error desconocido al cargar el listado de boletas. No hay datos locales.');
        }

        this.isLoading.set(false);
      }
    });
  }
}
