import { computed, inject, Injectable } from '@angular/core';
import { MiembroHogar } from '../interfaces/boleta.interface';
import { DataService } from './data.service';
import { Utils } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class MiembroHogarService {
    private boletaService = inject(DataService);

    /**
     * Listado de miembros de hogar
     */
    public readonly miembrosHogar = computed(() => {
        const miembrosList = this.boletaService.boleta().miembroHogar;
        return miembrosList;
    });

    /**
     * Miembro de hogar seleccionado
     */
    public readonly miembroHogar = computed(() => {
        const miembrosList = this.boletaService.boleta().miembroHogar;
        const selectedUuid = this.boletaService.miembroHogarUuid();
        console.log(`selectedUuid: ${selectedUuid}`);
        if (!miembrosList || !selectedUuid || selectedUuid.length == 0) {
            return new MiembroHogar();
        }
        const foundMember = miembrosList.find((m: MiembroHogar) => m.miembroUuid === selectedUuid);
        console.log(`Num:${miembrosList.length} miembroHogar sel:${foundMember}`);
        return foundMember || new MiembroHogar();
    });

    constructor() { }

    // CRUD METHODS
    public addMiembroHogar(): void {
        let newMember = new MiembroHogar();
        //genero los datos iniciales
        newMember.miembroUuid = Utils.generaUUID();
        newMember.noHogar = this.boletaService.boleta().miembroHogar.length + 1;
        this.boletaService.boletaData.update(boleta => {
            return {
                ...boleta,
                miembroHogar: [...(boleta.miembroHogar || []), newMember],
            };
        });
        this.boletaService.miembroHogarUuid.set(`${newMember.miembroUuid}`);
    }

    public removeMiembroHogar(): void {
        const selectedUuid = this.boletaService.miembroHogarUuid();
        if (!selectedUuid) {
            return;
        }

        this.boletaService.boletaData.update(boleta => {
            const filteredMembers = boleta.miembroHogar.filter(m => m.miembroUuid !== selectedUuid);
            //actualiza las secuencias
            const renumberedMembers = filteredMembers.map((miembro, index) => {
                const updatedMember = {
                    ...miembro,
                    noHogar: index + 1
                };
                return updatedMember;
            });

            return {
                ...boleta,
                miembroHogar: renumberedMembers
            };
        });
        //actualizo el uuid seleccionado
        if (this.boletaService.boleta().miembroHogar.length > 0) {
            this.boletaService.miembroHogarUuid.set(
                this.boletaService.boleta().miembroHogar[this.boletaService.boleta().miembroHogar.length - 1].miembroUuid
            )
        } else {
            this.boletaService.miembroHogarUuid.set(null);
        }
    }

    public onInputChange(event: any, fieldPath: string): void {
        const valueInput = event.detail?.value !== undefined ? event.detail.value : event;
        // console.log(`onInputChange MO: ${fieldPath} - ${valueInput} `)

        //valida que exista
        const miembrosList = this.miembrosHogar();
        const selectedUuid = this.boletaService.miembroHogarUuid();
        // console.log(`selectedUuid: ${selectedUuid}`);
        if (!miembrosList || !selectedUuid || selectedUuid.length == 0) {
            return;
        }

        //actualizo el valor
        let updatedMember: any = JSON.parse(JSON.stringify(this.miembroHogar()));
        // console.log(`mo: ${JSON.stringify(updatedMember)}`);
        updatedMember[fieldPath] = valueInput;
        // console.log(`mo : ${JSON.stringify(updatedMember)}`);

        //actualizo los datos de la boleta
        this.boletaService.boletaData.update(boleta => {
            const currentMembers = boleta.miembroHogar;
            const updatedMembers = currentMembers.map(miembro => {
                if (miembro.miembroUuid === updatedMember.miembroUuid) {
                    return updatedMember;
                }
                return miembro;
            });

            return {
                ...boleta,
                miembroHogar: updatedMembers
            };
        });
    }

}