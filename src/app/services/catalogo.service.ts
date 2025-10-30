import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CampoCatalogoItem, CatalogoData, CatalogoItem } from '../interfaces/catalogo';

@Injectable({
    providedIn: 'root'
})
export class CatalogoService {

    private readonly _catalogo = signal<CatalogoItem[]>([]);
    // Exponemos el signal como un valor de solo lectura
    public readonly catalogo = this._catalogo.asReadonly();

    private readonly _campoCatalogo = signal<CampoCatalogoItem[]>([]);
    public readonly campoCatalogo = this._campoCatalogo.asReadonly();

    constructor(private http: HttpClient) {
        this.loadCatalogo();
        this.loadCampoCatalogo();
    }

    // Método para cargar los datos del JSON
    private loadCatalogo(): void {
        this.http.get<CatalogoData>('assets/config/catalogo.json').subscribe({
            next: (data) => {
                this._catalogo.set(data.items);
                console.log(`Catálogo cargado con éxito. ${data.items.length}`);
            },
            error: (error) => {
                console.error('Error al cargar el catálogo:', error);
            }
        });
    }

    private loadCampoCatalogo(): void {
        this.http.get<CampoCatalogoItem[]>('assets/config/campo_catalogo.json').subscribe({
            next: (data) => {
                this._campoCatalogo.set(data)
                console.log(`Campo Catálogo cargado con éxito. ${data.length}`);
            },
            error: (error) => {
                console.error('Error al cargar el campo catálogo:', error);
            }
        });
        // this.http.get<CampoCatalogoItem[]>('assets/config/campo_catalogo.json').pipe(
        //     tap(data => this._campoCatalogo.set(data))
        // ).subscribe();
    }

    /**
       * Obtiene una lista de ítems filtrados por grupo y padre de forma reactiva.
       * @param grupo El nombre del grupo a filtrar (ej. 'PROV').
       * @param padre El código del padre para la dependencia (ej. '2' para Azuay).
       * @returns Un signal de solo lectura con la lista de ítems filtrados.
       */
    public getItemsByGroupAndParent(grupo: string, padre: string = ''): () => CatalogoItem[] {
        return computed(() => {
            return this._catalogo().filter(item => item.grupo === grupo && item.padre === padre);
        });
    }

    /**
     * Obtiene una lista de ítems filtrados por grupo de forma reactiva.
     * @param grupo El nombre del grupo a filtrar (ej. 'PROV').
     * @returns Un signal de solo lectura con la lista de ítems filtrados.
     */
    public getItemsByGroup(grupo: string): () => CatalogoItem[] {
        return computed(() => {
            return this._catalogo().filter(item => item.grupo === grupo);
        });
    }

    public getDescripcionByCodigo(codigo: string): () => string | null {
        return computed(() => {
            const item = this._catalogo().find(
                (i) => i.codigo === codigo
            );
            return item ? item.descripcion : null;
        });
    }


    /********************************* CampoCatalogo **************************************/

    public getCampoCatalogoByGrupoCampo(grupo: string, campo: string): () => CampoCatalogoItem | null {
        return computed(() => {
            const item = this._campoCatalogo().find(
                (i) => i.grupo === grupo && i.campo === campo
            );
            return item ? item : null;
        });
    }
}