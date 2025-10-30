import { Injectable, signal, effect, inject, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Boleta, Bovino, PecuarioOtro, PersonaInformante, PersonaProductora, Pollo, Porcino, Terreno } from '../interfaces/boleta.interface';
import { BoletaDto } from '../interfaces/boleta.dto.inteface';
import { environment } from 'src/environments/environment';
import { TerrenoService } from './terreno.service';
import { AuthService } from './auth.service';
import { MiembroHogarService } from './miembro-hogar.service';
import { CultivoService } from './cultivo.service';
import { ForestalService } from './forestal.service';
import { Utils } from '../utilis/utils';
import { updateBoletaVisibility } from '../utilis/showFields';
import { updateBoletaCalcs } from '../utils/calcFields';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private authService = inject(AuthService);
    private readonly LOCAL_STORAGE_KEY = 'renagroBoleta';
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.ApiBoletasUrl}/boletas`;
    public boletaData = signal<Boleta>(this.loadFromLocalStorage() || new Boleta());
    public boleta = this.boletaData.asReadonly();

    constructor(private terrenoService: TerrenoService,
        private miembroHogarService: MiembroHogarService,
        private cultivoService: CultivoService,
        private forestalService: ForestalService
    ) {
        this.terrenoService.initialize(this.boletaData);
        this.miembroHogarService.initialize(this.boletaData);
        this.cultivoService.initialize(this.boletaData);
        this.forestalService.initialize(this.boletaData);
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
        // 1. Obtener una boleta limpia para asegurar que todos los sub-objetos y arrays existan.
        const emptyBoleta = this.createEmptyBoleta();

        // 2. Fusionar los datos. Object.assign(target, source).
        // Se recomienda usar Object.assign({}, target, source) para evitar mutar 'emptyBoleta'.
        // Los valores de 'boletaParcial' (seleccionada) SOBRESCRIBEN los de 'emptyBoleta'.
        const boletaCompleta = Object.assign({}, emptyBoleta, boletaParcial);

        this.boletaData.set(boletaCompleta);
        console.log(`[DataService] Boleta activa (fusionada) establecida. ID: ${boletaCompleta.boletaIdLevanta}`);

        // Opcional: Si necesitas seleccionar automáticamente el último terreno al cargar una boleta
        if (boletaCompleta.terrenos && boletaCompleta.terrenos.length > 0) {
            const lastTerreno = boletaCompleta.terrenos[boletaCompleta.terrenos.length - 1];
            this.terrenoService.setTerrenoUuid(lastTerreno.terrenoUuid);
        } else {
            this.terrenoService.setTerrenoUuid(null);
        }
    }


    private loadFromLocalStorage(): Boleta | null {
        try {
            const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (data) {
                const boleta = JSON.parse(data) as Boleta;

                // Seleccion del terreno
                if (boleta.terrenos && boleta.terrenos.length > 0) {
                    const lastTerreno = boleta.terrenos[boleta.terrenos.length - 1];
                    this.terrenoService.setTerrenoUuid(lastTerreno.terrenoUuid);
                    // Si el último terreno tiene cultivos, selecciona el último
                    if (lastTerreno.cultivos && lastTerreno.cultivos.length > 0) {
                        const lastCultivo = lastTerreno.cultivos[lastTerreno.cultivos.length - 1];
                        this.cultivoService.setCultivoUuid(lastCultivo.cultivoUuid);
                    } else {
                        this.cultivoService.setCultivoUuid(null);
                    }

                    // Si el último terreno tiene cultivos forestales, selecciona el último
                    if (lastTerreno.cultivosForestales && lastTerreno.cultivosForestales.length > 0) {
                        const lastCultivoForestal = lastTerreno.cultivosForestales[lastTerreno.cultivosForestales.length - 1];
                        this.forestalService.setForestalUuid(lastCultivoForestal.forestalUuid);
                    } else {
                        this.forestalService.setForestalUuid(null);
                    }
                } else {
                    this.terrenoService.setTerrenoUuid(null);
                    this.cultivoService.setCultivoUuid(null);
                    this.forestalService.setForestalUuid(null);
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
            // console.log('saveToLocalStorage.Terrenos=>', this.boleta().terrenos);
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
    * Genera un nuevo objeto Boleta con valores iniciales y un ID temporal único.
    * @returns Una nueva instancia de Boleta.
    */
    public createEmptyBoleta(): Boleta {
        const timestamp = Date.now();
        // Aseguramos que el código de encuestador sea un string (o '000' por defecto)
        const codigoEncuestadorStr = this.authService.getCodigoEncuestador() || '000';
        const codigoEncuestadorNum = Number(codigoEncuestadorStr);

        // Generamos un ID temporal único
        const newBoletaIdLevanta = `NEW-${codigoEncuestadorStr}-${timestamp}`;

        // 1. Crear una nueva instancia de la clase Boleta
        const newBoleta = new Boleta();

        // 2. Inicialización de los campos de control críticos
        newBoleta.boletaIdLevanta = newBoletaIdLevanta;
        newBoleta.codigoEncuestador = codigoEncuestadorNum; // Toma el código del usuario

        // Usamos 'PENDIENTE_ENVIO' para que el guard de ruta no lo rechace. 
        newBoleta.estadoBoleta = 'PENDIENTE_ENVIO';

        // 3. Inicialización de los campos de la sección B0101 (Ubicación geográfica)

        // Strings
        newBoleta.provincia = '';
        newBoleta.canton = '';
        newBoleta.parroquia = '';
        newBoleta.sectorMuestreo = '';
        newBoleta.codigoUPA = '';

        // Números (Inicializados a 0 para consistencia con los inputs)
        newBoleta.poligono = 0;
        newBoleta.numeroUPA = 0;
        newBoleta.numeroBoleta = 0;

        // 💡 IMPORTANTE: INICIALIZACIÓN DE SUB-OBJETOS Y ARRAYS
        // Si cualquiera de estos es null, el Guard fallará.
        newBoleta.personaProductora = new PersonaProductora();
        newBoleta.personaInformante = new PersonaInformante();
        newBoleta.bovino = new Bovino();
        newBoleta.porcino = new Porcino();
        newBoleta.pollo = new Pollo();
        newBoleta.pecuarioOtro = new PecuarioOtro();

        newBoleta.terrenos = []; // ¡Fundamental!
        newBoleta.miembroHogar = []; // ¡Fundamental!
        // 4. Mantenimiento de Visibilidad (Show)
        newBoleta.provinciaShow = true;
        newBoleta.cantonShow = true;
        newBoleta.parroquiaShow = true;
        newBoleta.sectorMuestreoShow = true;
        newBoleta.poligonoShow = true;
        newBoleta.numeroUPAShow = true;
        newBoleta.codigoEncuestadorShow = true;
        newBoleta.numeroBoletaShow = true;
        newBoleta.codigoUPAShow = true;

        return newBoleta;
    }
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------

    /**
      * Crea una nueva boleta vacía y la establece como la boleta activa
      * (Este método permanece igual).
      */
    public createAndSetActiveBoleta(): void {
        const newBoleta = this.createEmptyBoleta();

        // 1. Establece la nueva boleta como la boleta activa
        this.boletaData.set(newBoleta);

        // 2. Deselecciona el terreno activo
        this.terrenoService.setTerrenoUuid(null);

        console.log(`[DataService] Nueva boleta creada y activada con ID: ${newBoleta.boletaIdLevanta}`);
    }

    resetBoleta(): string | null {
        this.boletaData.set(new Boleta());
        this.terrenoService.setTerrenoUuid(null); // Deselect the terreno
        return null;
    }

    onInputChange(event: any, fieldPath: string): void {
        // ... (Tu lógica de onInputChange se mantiene igual)
        let valueInput: any = null;
        if (!event.target) {
            valueInput = event;
        } else {
            const tagName = event.target.tagName;
            if (tagName === 'ION-TOGGLE') {
                valueInput = event.detail.checked;
            } else {
                valueInput = event.detail.value;
            }
        }

        if (fieldPath.includes('.')) {
            const parts = fieldPath.split('.');
            this.boletaData.update(currentBoleta => {
                let currentObject: any = { ...currentBoleta };
                let tempObject = currentObject;

                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    if (!tempObject[part]) {
                        tempObject[part] = {};
                    }
                    tempObject = tempObject[part];
                }
                const finalField = parts[parts.length - 1];
                tempObject[finalField] = valueInput;
                return currentObject;
            });
        } else {
            this.boletaData.update(currentBoleta => ({
                ...currentBoleta,
                [fieldPath]: valueInput,
            }));
        }

        //actualizo los Show
        this.boletaData.update(currentBoleta => {
            const boletaUpdate = updateBoletaVisibility(currentBoleta);
            return updateBoletaCalcs(boletaUpdate);
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