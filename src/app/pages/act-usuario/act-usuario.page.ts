import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
    IonInput, IonButton, IonIcon, IonLabel, AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { UpdateUserRequest, User } from 'src/app/interfaces/auth.interface';
import { Router } from '@angular/router';
import { Observable } from 'rxjs'; 

@Component({
    selector: 'app-usuario-editar',
    templateUrl: './act-usuario.page.html',
    styleUrls: ['./act-usuario.page.scss'],
    standalone: true,
    imports: [
        IonIcon, IonLabel, IonButton, IonInput, IonItem, IonList,
        IonContent, IonHeader, IonTitle, IonToolbar,
        CommonModule, FormsModule
    ]
})
export class UsuarioEditarPage implements OnInit {
    private authService = inject(AuthService);
    private alertController = inject(AlertController);
    private router = inject(Router);

    public nombre = signal<string>('');
    public cedula = signal<string>('');
    public isEditing = signal<boolean>(false);

    ngOnInit() {
        const currentUser = this.authService.user();
        if (currentUser && currentUser.nombre && currentUser.cedula) {
            this.nombre.set(currentUser.nombre);
            this.cedula.set(currentUser.cedula);
        } else {
            this.router.navigateByUrl('/login');
        }
    }

    public toggleEdit(): void {
        this.isEditing.update(val => !val);
    }

    // 🆕 NUEVO MÉTODO: Navega al Home, usado por el botón "Volver al Inicio"
    public onCancel(): void {
        this.router.navigateByUrl('/home');
    }

    public onUpdateUser(): void {
        const currentUser = this.authService.user();
        
        if (!currentUser || !currentUser.cedula) {
            this.presentAlert('Error', 'No se pudo obtener la sesión actual del usuario.');
            return;
        }

        // 1. Obtener la cédula ORIGINAL para el parámetro de la URL
        const cedulaOriginal = currentUser.cedula; 

        // 2. Obtener los datos nuevos (nombre y la posiblemente nueva cédula) para el cuerpo
        const dataToUpdate: UpdateUserRequest = {
            nombre: this.nombre(),
            cedula: this.cedula()
        };

        // 3. Llamar al servicio, pasando el ID para la URL y los datos para el cuerpo
        this.authService.updateUser(cedulaOriginal, dataToUpdate).subscribe({
            next: (updatedUser) => {
                this.isEditing.set(false);
                // 💡 Opcional: El servicio debe actualizar el signal this.authService.user()
                this.presentAlert('Éxito', '¡Tus datos han sido actualizados!');
            },
            error: async (err) => {
                console.error('Error al actualizar:', err);
                let errorMessage = 'No se pudo actualizar la información. Error desconocido.';

                // Manejo de errores específicos (400 Bad Request, 404 Not Found)
                if (err.status === 400 && err.error && err.error.message) {
                    errorMessage = err.error.message;
                } else if (err.status === 404) {
                    errorMessage = 'Usuario no encontrado. Reinicie sesión.';
                }
                
                await this.presentAlert('Error', errorMessage);
            }
        });
    }

    public async onDeleteUser(): Promise<void> {
        // ... (Tu código de borrado/alerta aquí)
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
