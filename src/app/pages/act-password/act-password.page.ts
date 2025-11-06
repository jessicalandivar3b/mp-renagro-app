import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonInput, IonButton, IonIcon, IonLabel, AlertController, IonButtons
} from '@ionic/angular/standalone';
// 1.  Se elimina la importación de 'IonViewWillEnter' para evitar el error de TypeScript.
//    El método 'ionViewWillEnter' seguirá funcionando.
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ActPasswordRequest } from 'src/app/interfaces/auth.interface'; 

@Component({
    selector: 'app-act-password',
    templateUrl: './act-password.page.html',
    styleUrls: ['./act-password.page.scss'],
    standalone: true,
    imports: [
        IonIcon, IonLabel, IonButton, IonInput, IonItem, IonList,
        IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
        CommonModule, FormsModule
    ]
})
// 2.Se elimina 'IonViewWillEnter' de la declaración 'implements'.
export class ActPasswordPage implements OnInit { 
    private authService = inject(AuthService);
    private alertController = inject(AlertController);
    private router = inject(Router);

    // Campos no editables (para mostrar Nombre y Cédula)
    public nombreUsuario = signal<string>('');
    public cedulaUsuario = signal<string>('');

    // Campos de formulario para la contraseña (bindeados al HTML)
    public currentPassword = signal<string>('');
    public newPassword = signal<string>('');

    // Usuario actual del servicio (solo para mostrar)
    private readonly currentUser = this.authService.user;

    ngOnInit() {
        const user = this.currentUser();
        if (user && user.nombre && user.cedula) {
            // Cargar datos de usuario (solo para visualización)
            this.nombreUsuario.set(user.nombre);
            this.cedulaUsuario.set(user.cedula);
        } else {
            // Si no hay usuario, redirigir al login
            this.router.navigateByUrl('/login');
        }
    }

    /**
     * Método de ciclo de vida de Ionic. Se ejecuta siempre antes de que la vista se muestre.
     * Ionic lo reconoce automáticamente por su nombre.
     */
    ionViewWillEnter() {
        this.clearFormFields();
    }

    /**
     * Limpia los campos de contraseña (currentPassword y newPassword).
     */
    private clearFormFields(): void {
        this.currentPassword.set('');
        this.newPassword.set('');
    }

    /**
     * Pide al usuario que ingrese la contraseña actual por segunda vez en una alerta 
     * antes de llamar al servicio de cambio de contraseña (Doble Confirmación).
     */
    public async onAttemptChangePassword(): Promise<void> {
        // Validación inicial de campos
        if (!this.currentPassword() || !this.newPassword()) {
            await this.presentAlert('Error', 'Debe ingresar la contraseña actual y la nueva.');
            return;
        }

        if (this.currentPassword() === this.newPassword()) {
            await this.presentAlert('Error', 'La nueva contraseña no puede ser igual a la actual.');
            return;
        }

        const alert = await this.alertController.create({
            header: 'Confirmar Contraseña Actual',
            message: 'Por favor, reingrese su **Contraseña Actual** para confirmar el cambio de clave.',
            inputs: [
                {
                    name: 'confirmationPassword',
                    type: 'password',
                    placeholder: 'Contraseña Actual',
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Confirmar',
                    handler: (data) => {
                        // Comprueba que la contraseña ingresada en el prompt sea la misma que la del formulario
                        if (data.confirmationPassword === this.currentPassword()) {
                            this.changePassword();
                            //  Retorna un valor (true/undefined) para que la alerta se cierre.
                            return true; 
                        } else {
                            this.presentAlert('Error de Confirmación', 'La contraseña ingresada no coincide con la actual del formulario.');
                            return false; // Evita que la alerta se cierre
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    /**
     * Llama al servicio para cambiar la contraseña después de la confirmación.
     */
    private changePassword(): void {
        const userId = this.cedulaUsuario();

        // Usamos la interfaz ActPasswordRequest y sus propiedades: claveActual, claveNueva
        const request: ActPasswordRequest = {
            cedula: userId,
            claveActual: this.currentPassword(), // Mapeo de currentPassword() a claveActual
            claveNueva: this.newPassword()      // Mapeo de newPassword() a claveNueva
        };

        // Llamamos al método correcto del servicio: actPassword()
        this.authService.actPassword(request).subscribe({
            next: (response) => {
                this.presentAlert('Éxito', response.message || 'Contraseña actualizada con éxito. Por seguridad, debe volver a ingresar.');
                this.authService.logout(); // Forzar cierre de sesión por seguridad
            },
            error: async (err) => {
                console.error('Error al cambiar la contraseña:', err);
                const errorMessage = err.error?.message || 'Error al comunicarse con el servidor. Verifique la contraseña actual.';
                await this.presentAlert('Error', errorMessage);
            }
        });
    }

    // Navegar de vuelta al inicio
    public goBack(): void {
        this.router.navigateByUrl('/home');
    }

    private async presentAlert(header: string, message: string): Promise<void> {
        const alert = await this.alertController.create({
            header: header,
            message: message,
            buttons: ['Aceptar']
        });
        await alert.present();
    }
}