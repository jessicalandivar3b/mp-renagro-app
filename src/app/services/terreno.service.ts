import { Injectable, inject, signal, computed, effect, WritableSignal } from '@angular/core';
import { Boleta, Terreno, Cultivo, CultivoForestal } from '../interfaces/boleta.interface';
import { Utils } from '../utilis/utils';
// NOTA: Se asume que Terreno, Cultivo, CultivoForestal y Boleta están definidos en '../interfaces/boleta.interface'
// Si se necesita compilación en el entorno Canvas, estas interfaces y clases deben ser simuladas aquí.

@Injectable({
  providedIn: 'root',
})
export class TerrenoService {
  private boletaData!: WritableSignal<Boleta>;

  // Signals para el contexto padre (Terreno)
  private terrenoUuid = signal<string | null>(null);

  // Signals para el contexto de las Sub-tablas (Cultivo y Cultivo Forestal)
  private cultivoUuid = signal<string | 'nuevo' | null>(null);
  private cultivoForestalUuid = signal<string | 'nuevo' | null>(null);

  // --- LÓGICA DE CÁLCULO DE SUPERFICIE GLOBAL ---

  // Hacer esta función pública
  /**
   * Convierte la superficie de una unidad dada (M2, CD, HA) a Metros Cuadrados (M2),
   * replicando la lógica de la función SQL superficie_calcula_m2.
   * @param superficie El valor numérico de la superficie.
   * @param unidadCodigo El código de la unidad (e.g., '4348', '4347', '4346').
   * @returns La superficie convertida a Metros Cuadrados (m²).
   */

  // PROPIEDAD CALCULADA: Superficie total de todos los terrenos en Metros Cuadrados (M2).
  public readonly totalSuperficieGlobal = computed(() => {
    const terrenos = this.terrenosList();
    if (!terrenos || terrenos.length === 0) {
      return 0;
    }

    const totalM2 = terrenos.reduce((sum, terreno) => {
      const superficie = terreno.superficie || 0;
      const unidadCodigo = terreno.superficieUnidad || '';

      // Sumar la superficie convertida a M2
      return sum + Utils.convertToSquareMeters(superficie, unidadCodigo);
    }, 0);

    // Redondear a dos decimales
    return Math.round(totalM2 * 100) / 100;
  });

  // ---------------------------------------------

  //  PROPIEDADES CALCULADAS

  /**
   * Retorna el objeto Terreno completo de la lista que coincide con el UUID seleccionado.
   * Si no se encuentra, retorna una nueva instancia de Terreno.
   */
  public readonly terreno = computed(() => {
    const terrenosList = this.boletaData()?.terrenos;
    const selectedUuid = this.terrenoUuid();

    // Si no hay lista de terrenos o no se ha seleccionado un UUID,
    // retorna una nueva instancia de Terreno.
    if (!terrenosList || !selectedUuid) {
      // Se asume que 'Terreno' tiene un constructor vacío
      return {} as Terreno;
    }

    // Busca el terreno en la lista. Si no se encuentra, retorna una nueva instancia.
    const foundTerreno = terrenosList.find((t: Terreno) => t.terrenoUuid === selectedUuid);
    // Se asume que 'Terreno' tiene un constructor vacío
    return foundTerreno || {} as Terreno;
  });

  // NUEVA PROPIEDAD: Retorna el objeto Cultivo activo
  public readonly cultivo = computed(() => {
    const terrenoActual = this.terreno();
    const selectedUuid = this.cultivoUuid();

    if (!terrenoActual.cultivos || !selectedUuid || selectedUuid === 'nuevo') {
      // Si es 'nuevo' o no hay contexto, retorna una nueva instancia de Cultivo
      // Se asume que 'Cultivo' tiene un constructor vacío
      return {} as Cultivo;
    }

    // Busca el cultivo dentro del terreno padre
    const foundCultivo = terrenoActual.cultivos.find((c: Cultivo) => c.cultivoUuid === selectedUuid);
    // Se asume que 'Cultivo' tiene un constructor vacío
    return foundCultivo || {} as Cultivo;
  });

  // NUEVA PROPIEDAD: Retorna el objeto Cultivo Forestal activo
  public readonly cultivoForestal = computed(() => {
    const terrenoActual = this.terreno();
    const selectedUuid = this.cultivoForestalUuid();

    if (!terrenoActual.cultivosForestales || !selectedUuid || selectedUuid === 'nuevo') {
      // Si es 'nuevo' o no hay contexto, retorna una nueva instancia
      // Se asume que 'CultivoForestal' tiene un constructor vacío
      return {} as CultivoForestal;
    }

    // Busca el cultivo forestal dentro del terreno padre
    const foundForestal = terrenoActual.cultivosForestales.find((f: CultivoForestal) => f.forestalUuid === selectedUuid);
    // Se asume que 'CultivoForestal' tiene un constructor vacío
    return foundForestal || {} as CultivoForestal;
  });


  /**
   * Retorna el índice del terreno activo en el array, para operaciones directas.
   */
  public readonly terrenoIndex = computed(() => {
    const terrenosList = this.boletaData()?.terrenos;
    const selectedUuid = this.terrenoUuid();

    if (!terrenosList || !selectedUuid) {
      return -1; // Retorna -1 si no hay un terreno seleccionado
    }

    return terrenosList.findIndex(t => t.terrenoUuid === selectedUuid);
  });

  /**
   * Retorna la lista de terrenos de la boleta.
   */
  public readonly terrenosList = computed(() => {
    let boleta = this.boletaData;
    if (!boleta) return [];
    return this.boletaData()?.terrenos
  });

  constructor() { }

  /**
   * Recibe la Boleta Signal del DataService para poder acceder a los datos.
   */
  public initialize(boletaSignal: WritableSignal<Boleta>) {
    this.boletaData = boletaSignal;
  }

  // --- MÉTODOS DE CONTEXTO ---

  /**
  * 🔎 Retorna el UUID del terreno actualmente seleccionado.
  */
  public getTerrenoUuid(): string | null {
    return this.terrenoUuid();
  }

  /**
   * Selecciona un terreno por su UUID, actualizando la propiedad de la señal.
   */
  public setTerrenoUuid(uuid: string | null): void {
    this.terrenoUuid.set(uuid);
  }

  /**
   * Establece el UUID del Cultivo (B0301) o 'nuevo'.
   */
  public setCultivoUuid(uuid: string | 'nuevo' | null): void {
    this.cultivoUuid.set(uuid);
  }

  /**
   * Establece el UUID del Cultivo Forestal (B0302) o 'nuevo'.
   */
  public setCultivoForestalUuid(uuid: string | 'nuevo' | null): void {
    this.cultivoForestalUuid.set(uuid);
  }


  // --- MÉTODOS CRUD PRINCIPALES (Terreno) ---

  /**
   * ➕ Agrega un nuevo terreno a la boleta.
   */
  public addTerreno(): void {
    const terrenoUuid = crypto.randomUUID();
    this.boletaData.update((boleta) => {

      // Se asume que 'Terreno' tiene un constructor vacío
      const newTerreno = {} as Terreno;
      newTerreno.terrenoUuid = terrenoUuid;
      newTerreno.terrenoNo = (boleta.terrenos?.length || 0) + 1;
      return {
        ...boleta,
        terrenos: [...(boleta.terrenos || []), newTerreno],
      };
    });
    this.setTerrenoUuid(terrenoUuid);
  }
  /**
   * ➖ Elimina el terreno seleccionado.
   */
  public removeTerreno(): void {
    const selectedUuid = this.terrenoUuid();
    if (!selectedUuid) {
      return;
    }

    this.boletaData.update(boleta => {
      // 1. Filtra el terreno a eliminar
      const filteredTerrenos = (boleta.terrenos || []).filter(t => t.terrenoUuid !== selectedUuid);

      // 2. Renumera los terrenos restantes
      const renumberedTerrenos = filteredTerrenos.map((t, index) => {
        const updatedTerreno = { ...t, terrenoNo: index + 1 };
        return updatedTerreno;
      });

      return {
        ...boleta,
        terrenos: renumberedTerrenos
      };
    });

    // 3. Selecciona el último terreno restante o deselecciona si no hay ninguno
    const newTerrenos = this.boletaData().terrenos;
    if (newTerrenos && newTerrenos.length > 0) {
      this.setTerrenoUuid(newTerrenos[newTerrenos.length - 1].terrenoUuid);
    } else {
      this.terrenoUuid.set(null);
    }
  }

  /**
   * 📝 Actualiza un campo específico del terreno activo.
   * CORRECCIÓN: Si se cambia la unidad del terreno, debe propagar esa unidad a todos
   * los cultivos y forestales para mantener la consistencia de la data.
   */
  public onInputChange(event: any, fieldPath: string): void {
    // Determinar el valor de entrada
    let valueInput = null;
    // ... (lógica de extracción de valor)
    if (!event.target) {
      valueInput = event;
    }
    else {
      const tagName = event.target.tagName;
      if (tagName === 'ION-TOGGLE') {
        valueInput = event.detail.checked;
      } else {
        // 🚀 CONVERSIÓN A NUMBER: Si el campo es 'superficie' o incluye 'superficie', se convierte a Number.
        if (fieldPath.includes('superficie') && fieldPath.includes('.')) { // Sub-campo de superficie
          valueInput = Number(event.detail.value);
        } else if (fieldPath === 'superficie') { // Superficie del Terreno
          valueInput = Number(event.detail.value);
        }
        else {
          valueInput = event.detail.value;
        }
      }
    }
    console.log(`TerrenoService.onInputChange ${fieldPath} : ${valueInput}`);

    this.boletaData.update(boleta => {
      // Usamos el índice para encontrar el terreno padre
      const index = boleta.terrenos.findIndex(t => t.terrenoUuid === this.terrenoUuid());
      if (index === -1) {
        return boleta;
      }

      // Clona el objeto para evitar mutación directa del estado
      let updatedTerrenos = [...boleta.terrenos];
      let updatedTerreno = { ...updatedTerrenos[index] };

      // Lógica para actualizar campos
      const parts = fieldPath.split('.');
      let currentObject: any = updatedTerreno;

      for (let i = 0; i < parts.length - 1; i++) {
        currentObject = currentObject[parts[i]];
      }
      currentObject[parts[parts.length - 1]] = valueInput;


      if (fieldPath === 'superficieUnidad') {
        const newUnidad = valueInput;

        // 1. Actualizar Cultivos
        updatedTerreno.cultivos = updatedTerreno.cultivos?.map(c => ({
          ...c,
          superficiePlantadaUnidad: newUnidad,
          superficieRiegoUnidad: newUnidad,
        })) || [];

        // 2. Actualizar Cultivos Forestales
        updatedTerreno.cultivosForestales = updatedTerreno.cultivosForestales?.map(f => ({
          ...f,
          superficiePlantadaUnidad: newUnidad,
        })) || [];

      }


      updatedTerrenos[index] = updatedTerreno;

      return {
        ...boleta,
        terrenos: updatedTerrenos
      };
    });
  }

}
