import { computed, inject, Injectable } from '@angular/core';
import { Terreno } from '../interfaces/boleta.interface';
import { onInputChangeValue } from '../utils/on-input-change-value';
import { DataService } from './data.service';
import { Utils } from '../utils/utils';
// NOTA: Se asume que Terreno, Cultivo, CultivoForestal y Boleta están definidos en '../interfaces/boleta.interface'
// Si se necesita compilación en el entorno Canvas, estas interfaces y clases deben ser simuladas aquí.

@Injectable({
  providedIn: 'root',
})
export class TerrenoService {
  private boletaService = inject(DataService);

  public readonly terrenos = computed(() => {
    const itemsList = this.boletaService.boleta().terrenos;
    return itemsList;
  });

  public readonly terreno = computed(() => {
    const terrenoSelcted = this.boletaService.terreno();
    return terrenoSelcted;
  });

  constructor() { }

  // CRUD METHODS
  public addTerreno(): void {
    let newItem = new Terreno();
    //genero los datos iniciales
    newItem.terrenoUuid = Utils.generaUUID();
    newItem.terrenoNo = this.boletaService.boleta().terrenos.length + 1;
    this.boletaService.boletaData.update(boleta => {
      return {
        ...boleta,
        terrenos: [...(boleta.terrenos || []), newItem],
      };
    });
    this.boletaService.terrenoUuid.set(`${newItem.terrenoUuid}`);
  }

  public removeTerreno(): void {
    const selectedUuid = this.boletaService.terrenoUuid();
    if (!selectedUuid) {
      return;
    }

    this.boletaService.boletaData.update(boleta => {
      const filteredItem = boleta.terrenos.filter(m => m.terrenoUuid !== selectedUuid);
      //actualiza las secuencias
      const renumbered = filteredItem.map((item, index) => {
        const itemUpdated = {
          ...item,
          terrenoNo: index + 1
        };
        return itemUpdated;
      });

      return {
        ...boleta,
        terrenos: renumbered
      };
    });
    //actualizo el uuid seleccionado
    if (this.boletaService.boleta().terrenos.length > 0) {
      this.boletaService.terrenoUuid.set(
        this.boletaService.boleta().terrenos[this.boletaService.boleta().terrenos.length - 1].terrenoUuid
      )
    } else {
      this.boletaService.terrenoUuid.set(null);
    }
  }

  public onInputChange(event: any, fieldPath: string): void {
    const valueInput = onInputChangeValue(event);
    console.log(`onInputChange MO: ${fieldPath} - ${valueInput} `)

    //valida que exista
    const listado = this.terrenos();
    const selectedUuid = this.boletaService.terrenoUuid();
    // console.log(`selectedUuid: ${selectedUuid}`);
    if (!listado || !selectedUuid || selectedUuid.length == 0) {
      return;
    }

    //actualizo el valor
    let updatedItem: any = JSON.parse(JSON.stringify(this.terreno()));
    // console.log(`mo: ${JSON.stringify(updatedItem)}`);
    updatedItem[fieldPath] = valueInput;
    console.log(`mo : ${JSON.stringify(updatedItem)}`);

    //actualizo los datos de la boleta
    this.boletaService.boletaData.update(boleta => {
      const currentItems = boleta.terrenos;
      const updatedItems = currentItems.map(item => {
        if (item.terrenoUuid === updatedItem.terrenoUuid) {
          return updatedItem;
        }
        return item;
      });

      return {
        ...boleta,
        terrenos: updatedItems
      };
    });
  }










  // // --- LÓGICA DE CÁLCULO DE SUPERFICIE GLOBAL ---

  // // Hacer esta función pública
  // /**
  //  * Convierte la superficie de una unidad dada (M2, CD, HA) a Metros Cuadrados (M2),
  //  * replicando la lógica de la función SQL superficie_calcula_m2.
  //  * @param superficie El valor numérico de la superficie.
  //  * @param unidadCodigo El código de la unidad (e.g., '4348', '4347', '4346').
  //  * @returns La superficie convertida a Metros Cuadrados (m²).
  //  */

  // // PROPIEDAD CALCULADA: Superficie total de todos los terrenos en Metros Cuadrados (M2).
  // public readonly totalSuperficieGlobal = computed(() => {
  //   const terrenos = this.terrenosList();
  //   if (!terrenos || terrenos.length === 0) {
  //     return 0;
  //   }

  //   const totalM2 = terrenos.reduce((sum, terreno) => {
  //     const superficie = terreno.superficie || 0;
  //     const unidadCodigo = terreno.superficieUnidad || '';

  //     // Sumar la superficie convertida a M2
  //     return sum + Utils.convertToSquareMeters(superficie, unidadCodigo);
  //   }, 0);

  //   // Redondear a dos decimales
  //   return Math.round(totalM2 * 100) / 100;
  // });

  // // ---------------------------------------------


  // // NUEVA PROPIEDAD: Retorna el objeto Cultivo activo
  // public readonly cultivo = computed(() => {
  //   const terrenoActual = this.terreno();
  //   const selectedUuid = this.cultivoUuid();

  //   if (!terrenoActual.cultivos || !selectedUuid || selectedUuid === 'nuevo') {
  //     // Si es 'nuevo' o no hay contexto, retorna una nueva instancia de Cultivo
  //     // Se asume que 'Cultivo' tiene un constructor vacío
  //     return {} as Cultivo;
  //   }

  //   // Busca el cultivo dentro del terreno padre
  //   const foundCultivo = terrenoActual.cultivos.find((c: Cultivo) => c.cultivoUuid === selectedUuid);
  //   // Se asume que 'Cultivo' tiene un constructor vacío
  //   return foundCultivo || {} as Cultivo;
  // });

  // // NUEVA PROPIEDAD: Retorna el objeto Cultivo Forestal activo
  // public readonly cultivoForestal = computed(() => {
  //   const terrenoActual = this.terreno();
  //   const selectedUuid = this.cultivoForestalUuid();

  //   if (!terrenoActual.cultivosForestales || !selectedUuid || selectedUuid === 'nuevo') {
  //     // Si es 'nuevo' o no hay contexto, retorna una nueva instancia
  //     // Se asume que 'CultivoForestal' tiene un constructor vacío
  //     return {} as CultivoForestal;
  //   }

  //   // Busca el cultivo forestal dentro del terreno padre
  //   const foundForestal = terrenoActual.cultivosForestales.find((f: CultivoForestal) => f.forestalUuid === selectedUuid);
  //   // Se asume que 'CultivoForestal' tiene un constructor vacío
  //   return foundForestal || {} as CultivoForestal;
  // });




}
