import { Injectable, signal, computed, inject, WritableSignal } from '@angular/core';
import { Boleta, CultivoForestal, Terreno } from '../interfaces/boleta.interface';
import { DataService } from './data.service';
import { TerrenoService } from './terreno.service';
import { Utils } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ForestalService {
    private boletaData!: WritableSignal<Boleta>;
    private terrenoService = inject(TerrenoService);

    private forestalUuid = signal<string | null>(null);

    public initialize(boletaSignal: WritableSignal<Boleta>) {
        this.boletaData = boletaSignal;
    }

    public readonly forestal = computed(() => {
        const activeTerreno = this.terrenoService.terreno();
        const cultivosForestalesList = activeTerreno?.cultivosForestales;
        const selectedUuid = this.forestalUuid();

        if (!cultivosForestalesList || !selectedUuid) {
            return new CultivoForestal();
        }
        const foundCultivo = cultivosForestalesList.find((cf: CultivoForestal) => cf.forestalUuid === selectedUuid);
        return foundCultivo || new CultivoForestal();
    });

    /**
     * Expone la lista de cultivos forestales del terreno activo para la vista.
     */
    public readonly forestalesList = computed(() => {
        const activeTerreno = this.terrenoService.terreno();
        return activeTerreno?.cultivosForestales || [];
    });

    constructor() { }

    // MÉTODOS
    /**
     * Establece el UUID del cultivo forestal activo.
     * @param uuid El ID único del cultivo forestal.
     */
    public setForestalUuid(uuid: string | null): void {
        this.forestalUuid.set(uuid);
    }

    /**
     * Agrega un nuevo cultivo forestal al terreno activo y lo establece como activo.
     */
    public addCultivoForestal(): void {
        const forestalUuid = Utils.generaUUID();
        const activeTerreno = this.terrenoService.terreno();

        if (!activeTerreno || !activeTerreno.terrenoUuid) {
            console.error('No hay terreno activo para agregar un cultivo forestal.');
            return;
        }

        // Se usa 'update' del DataService para modificar el estado global de la boleta
        this.boletaData.update(boleta => {
            const terrenoIndex = boleta.terrenos.findIndex(t => t.terrenoUuid === activeTerreno.terrenoUuid);

            if (terrenoIndex === -1) {
                return boleta;
            }

            const updatedTerrenos = [...boleta.terrenos];
            const updatedTerreno = { ...updatedTerrenos[terrenoIndex] };

            const newCultivoForestal = new CultivoForestal();
            newCultivoForestal.forestalUuid = forestalUuid;

            updatedTerreno.cultivosForestales = [...(updatedTerreno.cultivosForestales || []), newCultivoForestal];
            updatedTerrenos[terrenoIndex] = updatedTerreno;

            return {
                ...boleta,
                terrenos: updatedTerrenos,
            };
        });

        this.setForestalUuid(forestalUuid);
    }

    /**
     * Elimina el cultivo forestal seleccionado del terreno activo.
     */
    public removeCultivoForestal(): void {
        const selectedUuid = this.forestalUuid();
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

            const newCultivos = updatedTerreno.cultivosForestales.filter(cf => cf.forestalUuid !== selectedUuid);
            updatedTerreno.cultivosForestales = newCultivos;
            updatedTerrenos[terrenoIndex] = updatedTerreno;

            return {
                ...boleta,
                terrenos: updatedTerrenos,
            };
        });

        this.setForestalUuid(null);
    }

    /**
     * Actualiza un campo específico del cultivo forestal seleccionado.
     * @param event El evento del control de entrada.
     * @param fieldPath La ruta al campo a actualizar.
     */
    public onInputChange(event: any, fieldPath: string): void {
        const valueInput = event.detail?.value !== undefined ? event.detail.value : event;
        const selectedUuid = this.forestalUuid();
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
            const cultivoForestalIndex = updatedTerreno.cultivosForestales.findIndex(cf => cf.forestalUuid === selectedUuid);

            if (cultivoForestalIndex === -1) {
                return boleta;
            }

            const updatedCultivos = [...updatedTerreno.cultivosForestales];
            const updatedCultivo = { ...updatedCultivos[cultivoForestalIndex] };

            // Actualiza el campo utilizando la ruta de propiedades
            let currentObject: any = updatedCultivo;
            const parts = fieldPath.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                currentObject = currentObject[parts[i]];
            }
            currentObject[parts[parts.length - 1]] = valueInput;

            updatedCultivos[cultivoForestalIndex] = updatedCultivo;
            updatedTerreno.cultivosForestales = updatedCultivos;
            updatedTerrenos[terrenoIndex] = updatedTerreno;

            return {
                ...boleta,
                terrenos: updatedTerrenos,
            };
        });
    }
}