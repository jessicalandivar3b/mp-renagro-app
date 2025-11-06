import { Injectable, signal, computed, inject, WritableSignal } from '@angular/core';
import { Boleta, Cultivo, Terreno } from '../interfaces/boleta.interface';
import { DataService } from './data.service';
import { onInputChangeValue } from '../utils/on-input-change-value';
import { Utils } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class CultivoService {
    private boletaService = inject(DataService);

    public readonly cultivos = computed(() => {
        const terreno = this.boletaService.terreno();
        if (!terreno) return [];
        const itemsList = terreno.cultivos;
        return itemsList;
    });

    public readonly cultivo = computed(() => {
        const terreno = this.boletaService.terreno();
        if (!terreno) return new Cultivo();
        const itemsList = terreno.cultivos;
        const selectedUuid = this.boletaService.cultivoUuid();
        console.log(`cultivo.selectedUuid: ${selectedUuid}`);
        if (!itemsList || !selectedUuid || selectedUuid.length == 0) {
            return new Cultivo();
        }
        const itemSelected = itemsList.find((m: Cultivo) => m.cultivoUuid === selectedUuid);
        console.log(`Num:${itemsList.length} cultivo sel:${itemSelected}`);
        return itemSelected || new Cultivo();
    });

    constructor() { }

    // CRUD METHODS
    public addCultivo(): void {
        const terreno = this.boletaService.terreno();
        if (!terreno) return;

        //agrego el nuevo cultivo
        let terrenoUpdate = JSON.parse(JSON.stringify(terreno)) as Terreno;
        let newItem = new Cultivo();
        newItem.cultivoUuid = Utils.generaUUID();
        terrenoUpdate.cultivos = [...(terrenoUpdate.cultivos || []), newItem]

        //actualizo los terrenos
        let terrenos: Terreno[] = JSON.parse(JSON.stringify(this.boletaService.boleta().terrenos));
        const terrenosUpdated = terrenos.map(item => {
            if (item.terrenoUuid === terrenoUpdate.terrenoUuid) {
                return JSON.parse(JSON.stringify(terrenoUpdate)) as Terreno;
            }
            return item;
        });
        //actualizo la boleta
        this.boletaService.boletaData.update(boleta => {
            return {
                ...boleta,
                terrenos: terrenosUpdated
            };
        });

        //actualizo el uuid seleccionado
        this.boletaService.cultivoUuid.set(`${newItem.cultivoUuid}`);
    }

    public removeCultivo(): void {
        const selectedUuid = this.boletaService.cultivoUuid();
        if (!selectedUuid) {
            return;
        }
        const terreno = this.boletaService.terreno();
        if (!terreno) return;
        //elimino el cultivo
        let terrenoUpdate = JSON.parse(JSON.stringify(terreno)) as Terreno;
        const cultivos = terrenoUpdate.cultivos.filter(m => m.cultivoUuid !== selectedUuid);
        //actualizo los cultivos del terreno
        terrenoUpdate.cultivos = [...(terrenoUpdate.cultivos || [])]
        //actualizo los terrenos
        let terrenos: Terreno[] = JSON.parse(JSON.stringify(this.boletaService.boleta().terrenos));
        const terrenosUpdated = terrenos.map(item => {
            if (item.terrenoUuid === terrenoUpdate.terrenoUuid) {
                return JSON.parse(JSON.stringify(terrenoUpdate)) as Terreno;
            }
            return item;
        });
        //actualizo la boleta
        this.boletaService.boletaData.update(boleta => {
            return {
                ...boleta,
                terrenos: terrenosUpdated
            };
        });
        //actualizo el uuid seleccionado
        if (terreno.cultivos.length > 0) {
            this.boletaService.cultivoUuid.set(
                terreno.cultivos[terreno.cultivos.length - 1].cultivoUuid
            )
        } else {
            this.boletaService.cultivoUuid.set(null);
        }
    }

    public onInputChange(event: any, fieldPath: string): void {
        const valueInput = onInputChangeValue(event);
        console.log(`onInputChange MO: ${fieldPath} - ${valueInput} `)

        //valida que exista
        const cultivo = this.cultivo();
        if (cultivo.cultivoUuid.length == 0) {
            return;
        }
        //actualizo el valor
        let updatedItem: any = JSON.parse(JSON.stringify(this.cultivo()));
        // console.log(`mo: ${JSON.stringify(updatedItem)}`);
        updatedItem[fieldPath] = valueInput;
        console.log(`cultivo : ${JSON.stringify(updatedItem)}`);

        //actualizo los datos de la boleta
        const terreno = this.boletaService.terreno();
        if (terreno.terrenoUuid.length == 0) return;
        let terrenoUpdate = JSON.parse(JSON.stringify(terreno)) as Terreno;


        //actualizo los cultivos del terreno
        const itemsUpdated = terreno.cultivos.map(item => {
            if (item.cultivoUuid === updatedItem.cultivoUuid) {
                return JSON.parse(JSON.stringify(updatedItem)) as Cultivo;
            }
            return item;
        });
        terrenoUpdate.cultivos = [...(itemsUpdated || [])]

        //actualizo el terreno en la boleta
        this.updateTerrenosOnBoleta(terrenoUpdate);
    }

    updateTerrenosOnBoleta(terrenoUpdate: Terreno) {
        //actualizo los terrenos
        let terrenos: Terreno[] = JSON.parse(JSON.stringify(this.boletaService.boleta().terrenos));
        const terrenosUpdated = terrenos.map(item => {
            if (item.terrenoUuid === terrenoUpdate.terrenoUuid) {
                return JSON.parse(JSON.stringify(terrenoUpdate)) as Terreno;
            }
            return item;
        });
        //actualizo la boleta
        this.boletaService.boletaData.update(boleta => {
            return {
                ...boleta,
                terrenos: terrenosUpdated
            };
        });
    }

}