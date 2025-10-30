import { Injectable, signal, computed, inject, WritableSignal } from '@angular/core';
import { Boleta, Cultivo, Terreno } from '../interfaces/boleta.interface';
import { DataService } from './data.service';
import { TerrenoService } from './terreno.service';

@Injectable({
    providedIn: 'root',
})
export class CultivoService {
    private boletaData!: WritableSignal<Boleta>;
    private terrenoService = inject(TerrenoService);

    private cultivoUuid = signal<string | null>(null);

    public initialize(boletaSignal: WritableSignal<Boleta>) {
        this.boletaData = boletaSignal;
    }

    // PROPIEDADES REACTIVAS
    /**
     * Retorna el objeto Cultivo seleccionado del Terreno activo.
     * Retorna una nueva instancia si no hay uno seleccionado.
     */
    public readonly cultivo = computed(() => {
        const activeTerreno = this.terrenoService.terreno();
        const cultivosList = activeTerreno?.cultivos;
        const selectedUuid = this.cultivoUuid();

        if (!cultivosList || !selectedUuid) {
            return new Cultivo();
        }
        const foundCultivo = cultivosList.find((c: Cultivo) => c.cultivoUuid === selectedUuid);
        return foundCultivo || new Cultivo();
    });

    /**
     * Expone la lista de cultivos del terreno activo para la vista.
     */
    public readonly cultivosList = computed(() => {
        const activeTerreno = this.terrenoService.terreno();
        return activeTerreno?.cultivos || [];
    });

    constructor() { }

    // MÉTODOS
    /**
     * Establece el UUID del cultivo activo.
     * @param uuid El ID único del cultivo.
     */
    public setCultivoUuid(uuid: string | null): void {
        this.cultivoUuid.set(uuid);
    }

    /**
     * Agrega un nuevo cultivo al terreno activo y lo establece como activo.
     */
    public addCultivo(): void {
        const cultivoUuid = crypto.randomUUID();
        const activeTerreno = this.terrenoService.terreno();

        if (!activeTerreno || !activeTerreno.terrenoUuid) {
            console.error('No hay terreno activo para agregar un cultivo.');
            return;
        }

        this.boletaData.update(boleta => {
            const terrenoIndex = boleta.terrenos.findIndex(t => t.terrenoUuid === activeTerreno.terrenoUuid);

            if (terrenoIndex === -1) {
                return boleta;
            }

            const updatedTerrenos = [...boleta.terrenos];
            const updatedTerreno = { ...updatedTerrenos[terrenoIndex] };

            const newCultivo = new Cultivo();
            newCultivo.cultivoUuid = cultivoUuid;

            updatedTerreno.cultivos = [...(updatedTerreno.cultivos || []), newCultivo];
            updatedTerrenos[terrenoIndex] = updatedTerreno;

            return {
                ...boleta,
                terrenos: updatedTerrenos,
            };
        });


        this.setCultivoUuid(cultivoUuid);
    }

    /**
     * Elimina el cultivo seleccionado del terreno activo.
     */
    public removeCultivo(): void {
        const selectedUuid = this.cultivoUuid();
        const activeTerreno = this.terrenoService.terreno();

        if (!selectedUuid || !activeTerreno || !activeTerreno.terrenoUuid) {
            return;
        }

        this.boletaData.update(boleta => {
            const terrenoIndex = boleta.terrenos.findIndex(t => t.terrenoUuid === activeTerreno.terrenoUuid);

            if (terrenoIndex === -1) {
                return boleta;
            }

            const updatedTerrenos = [...boleta.terrenos];
            const updatedTerreno = { ...updatedTerrenos[terrenoIndex] };

            const newCultivos = updatedTerreno.cultivos.filter(c => c.cultivoUuid !== selectedUuid);
            updatedTerreno.cultivos = newCultivos;
            updatedTerrenos[terrenoIndex] = updatedTerreno;

            return {
                ...boleta,
                terrenos: updatedTerrenos,
            };
        });

        this.setCultivoUuid(null);
    }

    /**
     * Actualiza un campo específico del cultivo seleccionado.
     * @param event El evento del control de entrada.
     * @param fieldPath La ruta al campo a actualizar.
     */
    public onInputChange(event: any, fieldPath: string): void {
        const valueInput = event.detail?.value !== undefined ? event.detail.value : event;
        const selectedUuid = this.cultivoUuid();
        const activeTerreno = this.terrenoService.terreno();

        if (!selectedUuid || !activeTerreno || !activeTerreno.terrenoUuid) {
            return;
        }

        this.boletaData.update(boleta => {
            const terrenoIndex = boleta.terrenos.findIndex(t => t.terrenoUuid === activeTerreno.terrenoUuid);
            if (terrenoIndex === -1) {
                return boleta;
            }

            const updatedTerrenos = [...boleta.terrenos];
            const updatedTerreno = { ...updatedTerrenos[terrenoIndex] };
            const cultivoIndex = updatedTerreno.cultivos.findIndex(c => c.cultivoUuid === selectedUuid);

            if (cultivoIndex === -1) {
                return boleta;
            }

            const updatedCultivos = [...updatedTerreno.cultivos];
            const updatedCultivo = { ...updatedCultivos[cultivoIndex] };

            // Actualiza el campo utilizando la ruta de propiedades
            let currentObject: any = updatedCultivo;
            const parts = fieldPath.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                currentObject = currentObject[parts[i]];
            }
            currentObject[parts[parts.length - 1]] = valueInput;

            updatedCultivos[cultivoIndex] = updatedCultivo;
            updatedTerreno.cultivos = updatedCultivos;
            updatedTerrenos[terrenoIndex] = updatedTerreno;

            return {
                ...boleta,
                terrenos: updatedTerrenos,
            };
        });
    }

}