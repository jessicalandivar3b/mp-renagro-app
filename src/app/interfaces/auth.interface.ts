export interface LoginRequest {
    cedula: string;
    clave: string;
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface User {
    usuarioCod: string;
    codigoOperativo: string;
    eliminado: boolean;
    cargo: string;
    cedula: string;
    clave: string;
    email: string;
    nombre: string;
    organizacionCod: string;
    roles: Role[];
    organization: Organization;
    fechaAct: Date;
    usuarioCodAct: null;
    grupos: GrupoElement[];
    poligonos: Poligono[];
}
export interface UpdateUserRequest {
    nombre: string;
    cedula: string;
}
export interface ActPasswordRequest {
    cedula: string; 
    claveActual: string; 
    claveNueva: string;  
}

export interface ActPasswordResponse {
    message: string;
}

export interface GrupoElement {
    grupoCod: string;
    usuarioCod: string;
    grupo: GrupoGrupo;
    usuarioCodAct: null;
    fechaAct: Date;
    eliminado: boolean;
}

export interface GrupoGrupo {
    grupoCod: string;
    grupoDes: string;
    usuarioCodAct: string;
    fechaAct: Date;
    eliminado: boolean;
}

export interface Organization {
    organizacionCod: string;
    organizacionDes: string;
    usuarioCodAct: string;
    fechaAct: Date;
    eliminado: boolean;
}

export interface Poligono {
    poligonoCod: string;
    poligonoDes: string;
    provinciaDta: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
    usuarioCodAct: string;
    fechaAct: Date;
    eliminado: boolean;
}

export interface Role {
    rolCod: string;
    rolDes: string;
    visible: boolean;
    modulo: string;
    usuarioCodAct: string;
    fechaAct: Date;
    eliminado: boolean;
}
