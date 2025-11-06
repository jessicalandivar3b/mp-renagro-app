import { computed, effect, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, User, UpdateUserRequest, ActPasswordRequest, ActPasswordResponse } from '../interfaces/auth.interface';
import { BoletasService } from './boletas.service';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private readonly LOCAL_STORAGE_KEY = 'renagroUser';
    private apiUrl = `${environment.ApiAuthUrl}/users/validate`;
    private apiUpdateUrl = `${environment.ApiAuthUrl}/users/update`;
    private apiActPasswordUrl = `${environment.ApiAuthUrl}/users/actpassword`; 

    // Variable de tipo Signal para almacenar el usuario
    private _user = signal<User | null | undefined>(null);
    // Propiedad para acceder al usuario 
    public readonly user = this._user.asReadonly();

    // Propiedad calculada que extrae el codigoOperativo
    public readonly getCodigoEncuestador = computed(() => this._user()?.codigoOperativo ?? "0");

    constructor(private http: HttpClient, private router: Router, private boletaservice: BoletasService) {
        this._user.set(this.loadFromLocalStorage());
        effect(() => {
            console.log('this.getCodigoEncuestador()', this.getCodigoEncuestador())
            if (this.getCodigoEncuestador().trim().length > 0 && this.getCodigoEncuestador() != '0') {
                this.router.navigateByUrl('/home');
            }
            this.saveToLocalStorage();
        });
    }

    public login(credentials: LoginRequest): Observable<{ user: User, message: string }> {
        return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
            tap(response => {
                this._user.set(response.user);
            }),
            map(response => ({ user: response.user, message: response.message }))
        );
    }

    /**
    * @description Envia los datos actualizados del usuario (nombre y cédula) al servidor.
    * @param cedulaOriginal La cédula actual del usuario (se usa para el @Param de la URL).
    * @param data Objeto con el nombre y la nueva cédula a actualizar.
    * @returns Un Observable del objeto User actualizado.
    */
    public updateUser(cedulaOriginal: string, data: UpdateUserRequest): Observable<User> {
        // La URL debe incluir la cédula original como parámetro de ruta
        const url = `${this.apiUpdateUrl}/${cedulaOriginal}`;

        // El cuerpo de la petición (data) contiene el nuevo nombre y la posible nueva cédula
        return this.http.put<User>(url, data).pipe(
            tap(updatedUser => {
                // Actualiza el Signal: Sustituye el usuario local con los datos actualizados.
                this._user.set(updatedUser);
            }),
            map(updatedUser => updatedUser)
        );
    }

    /**
    * @description Envía la solicitud para cambiar la clave del usuario.
    * @param credentials Objeto con la cédula, clave actual y clave nueva.
    * @returns Un Observable con la ActPasswordResponse (que contiene el mensaje).
    * MÉTODO RENOMBRADO: Se llama 'actPassword'
    */
    public actPassword(credentials: ActPasswordRequest): Observable<ActPasswordResponse> {
        return this.http.put<ActPasswordResponse>(this.apiActPasswordUrl, credentials);
    }

    public logout(): void {
        this.removeUser();
        this.router.navigateByUrl('/login');
    }

    private removeUser(): void {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        this._user.set(null);
    }

    private saveToLocalStorage(): void {
        try {
            const dataToSave = JSON.stringify(this._user());
            localStorage.setItem(this.LOCAL_STORAGE_KEY, dataToSave);
            console.log('user en localstorage', this._user());
        } catch (e) {
            console.error('Error guardando datos en localStorage', e);
        }
    }

    private loadFromLocalStorage(): User | null {
        try {
            const storedData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return storedData ? JSON.parse(storedData) : null;
        } catch (e) {
            console.error('Error cargando datos de localStorage', e);
            return null;
        }
    }
}