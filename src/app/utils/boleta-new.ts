import { EstadosBoleta } from "../interfaces/boleta.estado.enum";
import { Boleta } from "../interfaces/boleta.interface";
import { Utils } from "./utils";

/**
* Genera un nuevo objeto Boleta con valores iniciales y un ID temporal único.
* @returns Una nueva instancia de Boleta.
*/
export function boletaNew(codigoEncuestador: number): Boleta {
    // let timestamp = new Date()
    const newBoleta = new Boleta();
    newBoleta.tmpZona = 'Z1';
    newBoleta.codigoEncuestador = codigoEncuestador ?? 0;
    newBoleta.boletaIdLevanta = `${codigoEncuestador}-${Utils.generaUUID()}`;
    newBoleta.fechaInicio = new Date();
    newBoleta.fechaFin = new Date();
    newBoleta.estadoBoleta = EstadosBoleta.REGISTRANDO;
    newBoleta.isUsoDeSuelo = true;


    // newBoleta.personaProductora = new PersonaProductora();
    // newBoleta.personaInformante = new PersonaInformante();
    // newBoleta.bovino = new Bovino();
    // newBoleta.porcino = new Porcino();
    // newBoleta.pollo = new Pollo();
    // newBoleta.pecuarioOtro = new PecuarioOtro();

    // newBoleta.terrenos = [];
    // newBoleta.miembroHogar = [];

    return newBoleta;
}