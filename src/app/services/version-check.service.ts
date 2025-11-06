import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

// Define la estructura de la respuesta de tu API de versión
interface ApiVersionResponse {
    grupoCod: string;
    grupoDes: string;
    versionActual: number;
    versionMinima: number;
    versionUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class VersionCheckService {
    private http = inject(HttpClient);
    private versionApiUrl = `${environment.ApiAuthUrl}/users/by-group/`;

    public versionApp = signal<number>(0);
    public versionActual = signal<number>(0);
    public versionMinima = signal<number>(0);
    public versionUrl = signal<string>('');
    public versionActualizar = signal<boolean>(false);
    public versionPendiente = signal<boolean>(false);

    constructor() { this.checkVersion(2) }

    /**
     * Método principal para validar la versión y forzar la actualización.
     */
    public async checkVersion(usuarioCod: number) {
        try {
            let currentAppVersion = environment.appVersion;
            this.versionApp.set(currentAppVersion);
            // 2. Obtener la versión más reciente desde tu API (simulado)
            const apiResponse: ApiVersionResponse[] = await this.getLatestVersionFromApi(usuarioCod);
            const reponseVersion = apiResponse[0];

            this.versionActual.set(reponseVersion.versionActual);
            this.versionMinima.set(reponseVersion.versionMinima);
            this.versionUrl.set(reponseVersion.versionUrl);

            // 3. Comparar las versiones
            if (currentAppVersion < reponseVersion.versionMinima) {
                this.versionActualizar.set(true);
                this.versionPendiente.set(true);
                return;
            }
            this.versionActualizar.set(false);
            this.versionPendiente.set(currentAppVersion < reponseVersion.versionActual ? true : false);
        } catch (error) {
            console.error('Error al verificar la versión:', error);
            this.versionActualizar.set(false);
            this.versionPendiente.set(false);
        }
    }

    /**
     * Obtiene la última versión y la URL de la tienda desde una API.
     */
    private async getLatestVersionFromApi(usuarioCod: number): Promise<ApiVersionResponse[]> {
        try {
            const url = this.versionApiUrl + usuarioCod;
            // console.log(`getLatestVersionFromApi url:${url}*`);
            const response = await firstValueFrom(this.http.get<ApiVersionResponse[]>(url));
            // console.log(`getLatestVersionFromApi reponse: ${JSON.stringify(response, null, 2)}`);
            return response;
        } catch (error) {
            console.error('getLatestVersionFromApi Error:', error);
            return [{
                grupoCod: 'ND',
                grupoDes: 'ND',
                versionActual: 0,
                versionMinima: 0,
                versionUrl: ''
            }]
        }
    }
}
