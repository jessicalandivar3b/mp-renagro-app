// src/app/pages/login/login.page.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonList,
  IonItem,
  IonNote,
  IonButton,
  IonImg,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { LoginRequest } from 'src/app/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonNote,
    IonItem,
    IonList,
    IonInput,
    IonContent,
    IonImg,
    CommonModule,
    FormsModule
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private alertController = inject(AlertController);

  public cedula = signal<string>('');
  public clave = signal<string>('');
  public loginError = signal<string | null>(null);

  constructor() { }

  async onLogin(): Promise<void> {
    this.loginError.set(null);

    const credentials: LoginRequest = {
      cedula: this.cedula(),
      clave: this.clave()
    };

    this.authService.login(credentials).subscribe({
      next: (user) => {
        if (!user) {
          this.loginError.set('Credenciales incorrectas. Intente de nuevo.');
        } else {
          console.log('Login exitoso y redireccionado por el AuthService.');
        }
      },
      error: (err) => {

        if (err.message === 'CONNECTION_ERROR') {
          this.presentServiceUnavailableAlert();
        } else {

          this.loginError.set('Ocurrió un error inesperado. Intente de nuevo.');
        }
        console.error('Error de Login:', err);
      }
    });
  }

  private async presentServiceUnavailableAlert(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Error de Conexión',
      message: 'No hay conexión con el servicio. Intente de nuevo.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}