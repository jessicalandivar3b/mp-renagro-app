import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Boleta, Terreno } from '../interfaces/boleta.interface';
import { boletaNew } from '../utils/boleta-new';
import { boletaOnInputChange } from '../utils/boleta-on-input-change';
import { Utils } from '../utils/utils';
import { boletaShowFields } from '../utils/boleta-show-fields';
import { updateBoletaCalcs } from '../utils/calcFields';
import { CatalogoService } from './catalogo.service';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    // private authService = inject(AuthService);
    private readonly LOCAL_STORAGE_KEY = 'renagroBoleta';
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.ApiBoletasUrl}/boletas`;
    // Inicialización con una nueva Boleta, la carga de LocalStorage se mueve al constructor.
    public boletaData = signal<Boleta>(new Boleta());
    public boleta = this.boletaData.asReadonly();
    private catalogoService = inject(CatalogoService);

    //items seleccionados de los listados
    public miembroHogarUuid = signal<string | null>(null);
    public terrenoUuid = signal<string | null>(null);
    public cultivoUuid = signal<string | null>(null);
    public cultivoForestalUuid = signal<string | null>(null);

    public readonly terreno = computed(() => {
        const itemsList = this.boleta().terrenos;
        const selectedUuid = this.terrenoUuid();
        console.log(`terreno.selectedUuid: ${selectedUuid}`);
        if (!itemsList || !selectedUuid || selectedUuid.length == 0) {
            return new Terreno();
        }
        const itemSelected = itemsList.find((m: Terreno) => m.terrenoUuid === selectedUuid);
        console.log(`Num:${itemsList.length} terreno sel:${itemSelected}`);
        return itemSelected || new Terreno();
    });

    // --------------------------------------------------------------------------
    // 🎯 CONSTRUCTOR MODIFICADO
    // --------------------------------------------------------------------------
    constructor() {
        const databoleta = this.loadFromLocalStorage();
        if (databoleta) {
            this.boletaData.set(databoleta);
        }
        effect(() => {
            this.saveToLocalStorage();
        });
    }

    /**
     * Establece la boleta seleccionada como la boleta activa global, 
     * asegurando la integridad de la data mediante una fusión con una boleta vacía.
     * @param boletaParcial La boleta seleccionada del listado.
     */
    public setActiveBoletaFromList(boletaParcial: Boleta): void {
        const emptyBoleta = new Boleta();
        const boletaCompleta = Object.assign({}, emptyBoleta, boletaParcial);
        this.boletaData.set({ ...boletaCompleta });
        console.log(`[DataService] Boleta activa (fusionada) establecida. ID: ${boletaCompleta.boletaIdLevanta}`);

        //  seleccionar automáticamente el último registro
        if (boletaCompleta.terrenos && boletaCompleta.terrenos.length > 0) {
            this.terrenoUuid.set(boletaCompleta.terrenos[boletaCompleta.terrenos.length - 1].terrenoUuid);
        } else {
            this.terrenoUuid.set(null);
        }
        if (boletaCompleta.miembroHogar && boletaCompleta.miembroHogar.length > 0) {
            this.miembroHogarUuid.set(
                boletaCompleta.miembroHogar[boletaCompleta.miembroHogar.length - 1].miembroUuid
            );
        } else {
            this.miembroHogarUuid.set(null);
        }
    }


    private loadFromLocalStorage(): Boleta | null {
        try {
            console.log(`loadFromLocalStorage ingresa: ${this.LOCAL_STORAGE_KEY}`);
            const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (data) {
                console.log(`loadFromLocalStorage caracters: ${data.length}`);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                navigator.clipboard.writeText(data).catch(() => { });
                const boleta = JSON.parse(data) as Boleta;
                console.log(`loadFromLocalStorage: ${boleta.miembroHogar.length}`);

                // Seleccion del terreno
                if (boleta.terrenos && boleta.terrenos.length > 0) {
                    const lastTerreno = boleta.terrenos[boleta.terrenos.length - 1];
                    this.terrenoUuid.set(lastTerreno.terrenoUuid);
                } else {
                    this.terrenoUuid.set(null);
                    this.cultivoUuid.set(null);
                    this.cultivoForestalUuid.set(null);
                }

                //miembro de hogar
                if (boleta.miembroHogar && boleta.miembroHogar.length > 0) {
                    this.miembroHogarUuid.set(
                        boleta.miembroHogar[boleta.miembroHogar.length - 1].miembroUuid
                    );
                } else {
                    this.miembroHogarUuid.set(null);
                }

                return boleta;
            }
        } catch (e) {
            console.error('Error cargando datos desde localStorage', e);
        }
        return null;
    }

    private saveToLocalStorage(): void {
        try {
            console.log('saveToLocalStorage=>', this.boleta().miembroHogar);
            const dataToSave = JSON.stringify(this.boleta());
            localStorage.setItem(this.LOCAL_STORAGE_KEY, dataToSave);
        } catch (e) {
            console.error('Error guardando datos en localStorage', e);
        }
    }

    // -------------------------------------------------------------------------
    // 🎯 MÉTODO MODIFICADO A PÚBLICO para ser usado en setActiveBoletaFromList
    // -------------------------------------------------------------------------

    /**
     * Crea una nueva boleta vacía y la establece como la boleta activa
     * (Este método permanece igual).
     */
    public createAndSetActiveBoleta(codigoEncuestador: number): void {
        const newBoleta = boletaNew(codigoEncuestador);
        let boleta = JSON.parse(JSON.stringify(newBoleta)) as Boleta;
        this.boletaData.set(boleta);
        this.miembroHogarUuid.set(null);
        this.terrenoUuid.set(null);
        this.cultivoUuid.set(null);
        this.cultivoForestalUuid.set(null);
    }

    onInputChange(event: any, filePath: string): void {
        this.boletaShowsCalcs(boletaOnInputChange(this.boleta(), event, filePath));
    }

    boletaShowsCalcs(boleta: Boleta): void {
        let boletaShows = boletaShowFields(boleta);
        let boletaCalcs = updateBoletaCalcs(boletaShows, this.catalogoService);
        this.boletaData.update(currentBoleta => {
            return boletaCalcs
        });
    }

    boletaSave(): Observable<any> {
        const boletaData = this.boletaData();
        const boletaDto = Utils.cleanObjectRecursive(boletaData);
        console.log(boletaDto);

        const url = `${this.apiUrl}/create`;

        console.log(`[DataService] Intentando guardar Boleta (DTO) con UPA: ${boletaDto.codigoUPA}`);

        return this.http.post<any>(url, boletaDto).pipe(
            tap(response => {
                console.log(`[DataService] Boleta guardada y sincronizada exitosamente.`, response);
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(`[DataService] Falla en la sincronización de la boleta:`, error);
                let errorMessage = 'Error desconocido al guardar la boleta.';
                if (error.status === 0) {
                    errorMessage = 'ERROR DE CONEXIÓN: El servidor no está disponible. Los datos están guardados localmente. 💾';
                } else {
                    errorMessage = `Error ${error.status}: ${error.statusText || 'Error del Servidor'}. No se pudo sincronizar.`;
                }
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}