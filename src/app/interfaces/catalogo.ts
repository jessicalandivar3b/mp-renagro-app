export interface CatalogoItem {
    grupo: string;
    descripcionGrupo: string;
    codigo: string;
    descripcion: string;
    padre: string;
    codigoEquivale: string;
}

export interface CatalogoData {
    items: CatalogoItem[];
}

export interface CampoCatalogoItem {
    grupo: string;
    campo: string;
    catalogo: string;
    padre: string;
    encera: string[];
}