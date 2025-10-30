// miembro-hogar.service.ts
import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Boleta, MiembroHogar } from '../interfaces/boleta.interface';

@Injectable({
    providedIn: 'root',
})
export class MiembroHogarService {

    // The main signal from DataService will be passed here.
    private boletaData!: WritableSignal<Boleta>;
    // Signal to track the selected member's ID.
    private miembroHogarUuid = signal<string | null>(null);

    // PROPERTIES (SIGNALS)
    /**
     * Returns the selected MiembroHogar object. Returns a new instance if none is selected.
     */
    public readonly miembroHogar = computed(() => {
        const miembrosList = this.boletaData()?.miembroHogar;
        const selectedUuid = this.miembroHogarUuid();

        if (!miembrosList || !selectedUuid) {
            return new MiembroHogar();
        }

        const foundMember = miembrosList.find((m: MiembroHogar) => m.miembroUuid === selectedUuid);
        return foundMember || new MiembroHogar();
    });

    /**
     * Returns the index of the selected member in the array.
     */
    public readonly miembroHogarIndex = computed(() => {
        const miembrosList = this.boletaData()?.miembroHogar;
        const selectedUuid = this.miembroHogarUuid();

        if (!miembrosList || !selectedUuid) {
            return -1;
        }

        return miembrosList.findIndex(m => m.miembroUuid === selectedUuid);
    });

    /**
     * Exposes the list of members for the view.
     */
    public readonly miembrosList = computed(() => {
        const boleta = this.boletaData;
        if (!boleta) {
            return [];
        }
        return boleta().miembroHogar;
    });

    // CONSTRUCTOR
    constructor() { }

    /**
     * Initializes the service by receiving the main boleta signal from DataService.
     * @param boletaSignal The writable signal of the main boleta.
     */
    public initialize(boletaSignal: WritableSignal<Boleta>): void {
        this.boletaData = boletaSignal;
    }

    /**
     * Sets the UUID of the currently selected household member.
     * @param uuid The unique ID of the member.
     */
    public setMiembroHogarUuid(uuid: string | null): void {
        this.miembroHogarUuid.set(uuid);
    }

    // CRUD METHODS
    /**
     * ➕ Adds a new household member to the boleta and sets it as active.
     */
    public addMiembroHogar(): void {
        const memberUuid = crypto.randomUUID();
        this.boletaData.update(boleta => {
            const newMember = new MiembroHogar();
            // Assuming MiembroHogar has a 'miembroUuid' property.
            newMember.miembroUuid = memberUuid;
            return {
                ...boleta,
                miembroHogar: [...(boleta.miembroHogar || []), newMember],
            };
        });
        this.setMiembroHogarUuid(memberUuid);
    }

    /**
     * ➖ Removes the currently selected household member from the boleta.
     */
    public removeMiembroHogar(): void {
        const selectedUuid = this.miembroHogarUuid();
        if (!selectedUuid) {
            return;
        }

        this.boletaData.update(boleta => {
            const newMembers = boleta.miembroHogar.filter(m => m.miembroUuid !== selectedUuid);
            return {
                ...boleta,
                miembroHogar: newMembers,
            };
        });
        this.setMiembroHogarUuid(null);
    }

    /**
     * 📝 Updates a specific field of the currently selected household member.
     * @param event The event object from the input control.
     * @param fieldPath The path to the field (e.g., 'primerNombre', 'domicilio.calle').
     */
    public onInputChange(event: any, fieldPath: string): void {
        const valueInput = event.detail?.value !== undefined ? event.detail.value : event;
        const selectedUuid = this.miembroHogarUuid();
        if (!selectedUuid) {
            return;
        }

        this.boletaData.update(boleta => {
            const index = boleta.miembroHogar.findIndex(m => m.miembroUuid === selectedUuid);
            if (index === -1) {
                return boleta;
            }

            const updatedMembers = [...boleta.miembroHogar];
            const updatedMember = { ...updatedMembers[index] };

            let currentObject: any = updatedMember;
            const parts = fieldPath.split('.');
            for (let i = 0; i < parts.length - 1; i++) {
                currentObject = currentObject[parts[i]];
            }
            currentObject[parts[parts.length - 1]] = valueInput;

            updatedMembers[index] = updatedMember;

            return {
                ...boleta,
                miembroHogar: updatedMembers,
            };
        });
    }

}