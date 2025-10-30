import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Boleta } from '../interfaces/boleta.interface';
import { environment } from 'src/environments/environment';

type BoletasMap = Map<string, Boleta>;

@Injectable({ providedIn: 'root' })
export class BoletasService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.ApiBoletasUrl}/boletas`;
    private readonly STORAGE_KEY = 'renagroBoletasList'; // Clave para localStorage

    // Señal para almacenar el listado de boletas
    public boletasList: WritableSignal<BoletasMap> = signal<BoletasMap>(new Map<string, Boleta>());

    constructor() {
        console.log('constructor');
        const initialBoletas = this.loadFromLocalStorage();
        this.boletasList.set(initialBoletas);

    }

    // ==================================================
    // 🔹 MÉTODOS CRUD LOCALES
    // ==================================================
    public addOrUpdateBoleta(boleta: Boleta): void {
        this.boletasList.update(currentMap => {
            const updatedMap = currentMap.set(boleta.boletaIdLevanta, boleta);

            // ✅ Guardado manual: Persiste el cambio inmediato
            this.saveToLocalStorage(Array.from(updatedMap.values()));
            return updatedMap;
        });
    }

    public deleteBoleta(boletaId: string): void {
        this.boletasList.update(currentMap => {
            currentMap.delete(boletaId);

            // ✅ Guardado manual: Persiste la eliminación inmediata
            this.saveToLocalStorage(Array.from(currentMap.values()));
            return currentMap;
        });
    }

    // ==================================================
    // 🔹 PERSISTENCIA LOCAL
    // ==================================================
    private loadFromLocalStorage(): BoletasMap {
        try {
            const storedData = localStorage.getItem(this.STORAGE_KEY);
            if (storedData) {
                const boletasArray: Boleta[] = JSON.parse(storedData);
                console.log(boletasArray.length);
                const boletasMap = new Map<string, Boleta>();
                boletasArray.forEach(boleta => {
                    boletasMap.set(boleta.id.toString(), boleta);
                    console.log(boleta);
                });
                return boletasMap;
            }
        } catch (e) {
            console.error('Error cargando datos de localStorage', e);
        }
        return new Map<string, Boleta>();
    }

    private saveToLocalStorage(boletas: Boleta[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(boletas));
            console.log(`[BoletasService] ${boletas.length} boletas guardadas en localStorage.`);
        } catch (e) {
            console.error('[BoletasService] Error al guardar en localStorage', e);
        }
    }

    // ==================================================
    // 🔹 SERVICIO PRINCIPAL (API REST)
    // ==================================================
    getBoletasPorEncuestador(codigoEncuestador: string): Observable<Boleta[]> {
        const codigoNumerico = Number(codigoEncuestador);
        const url = `${this.apiUrl}/encuestador/${codigoNumerico}`;
        console.log(`[BoletasService] Buscando boletas con URL: ${url}`);

        return this.http.get<Boleta[]>(url).pipe(
            tap(boletas => {
                // 1️⃣ Convertir y sobrescribir la señal con el Map correcto.
                const boletasMap = new Map<string, Boleta>();
                boletas.forEach(boleta => boletasMap.set(boleta.boletaIdLevanta, boleta));

                this.boletasList.set(boletasMap);

                // ✅ Guardado forzado (online): Garantiza que el LocalStorage tenga los datos actualizados.
                this.saveToLocalStorage(boletas);
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(`[BoletasService] Error en la API de Boletas:`, error);
                const initialBoletas = this.loadFromLocalStorage();
                this.boletasList.set(initialBoletas);


                let errorMessage = 'Error desconocido al cargar las boletas.';

                if (error.status === 0) {
                    errorMessage = 'ERROR: No se pudo conectar con el servidor de RENAGRO.';
                } else if (error.status === 404) {
                    errorMessage = `Error 404: La ruta de la API no existe o el código '${codigoEncuestador}' no devuelve datos.`;
                } else if (error.status) {
                    errorMessage = `Error ${error.status}: Revise el servidor de RENAGRO.`;
                }
                this.getBoletasLocalesAsArray();
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    // ==================================================
    // 🔹 MODO OFFLINE: CARGA LOCAL
    // ==================================================
    public getBoletasLocalesAsArray(): Boleta[] {

        return Array.from(this.boletasList().values());
    }
}
