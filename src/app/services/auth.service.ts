import { computed, effect, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';
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

    // Variable de tipo Signal para almacenar el usuario
    private _user = signal<User | null | undefined>(null);
    // Propiedad para acceder al usuario (solo lectura)
    public readonly user = this._user.asReadonly();

    // Propiedad calculada que extrae el codigoOperativo
    public readonly getCodigoEncuestador = computed(() => this._user()?.codigoOperativo ?? "");

    constructor(private http: HttpClient, private router: Router, private boletaservice: BoletasService) {
        this._user.set(this.loadFromLocalStorage());
        effect(() => {
            console.log('this.getCodigoEncuestador()', this.getCodigoEncuestador())
            if (this.getCodigoEncuestador().trim().length > 0) {
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
