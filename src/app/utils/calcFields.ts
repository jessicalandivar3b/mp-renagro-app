import { ObservacionesRegistry } from '../clases/observaciones-registry.class';
import { Boleta } from '../interfaces/boleta.interface';

export function updateBoletaCalcs(boletaData: Boleta): Boleta {
    const boleta = JSON.parse(JSON.stringify(boletaData)) as Boleta;
    let observacionesRegistry = new ObservacionesRegistry();
    if (!((boleta.bovino.vacasEnProduccion ?? 0 > 0) && (boleta.bovino.litrosLecheObtenido ?? 0 > 0))) {
        observacionesRegistry.register('boleta.bovino.vacasEnProduccion', 'Si tiene litros de leche debe tener vacas en producion');
    }//35
    boleta.personaProductora.isPersonaJuridica = !boleta.personaProductora.isPersonaNatural;//10
    boleta.isAsesoramientoTecnico = boleta.isExtensionAgropecuaria;//22
    boleta.isCredito = boleta.isPrestamoGestiono;//28
    boleta.isEspacioComercio = boleta.sitioAgricola !== "291" || boleta.sitioBovina !== "291" || boleta.sitioPorcicola !== "291" || boleta.sitioAvicola !== "291" || boleta.sitioOtrasAves !== "291" || boleta.sitioOvinoCaprino !== "291" || boleta.sitioCuyesConejos !== "291" || boleta.sitioApicola !== "291" || boleta.sitioForestal !== "291";//27
    boleta.isEvitaErosion = !boleta.isNoRealizaMejora;//39
    boleta.isExtensionAgropecuaria = boleta.isAsistenciaTecnica || boleta.isAsesoramientoTecnico || boleta.isKitAgricola || boleta.isVacunaAgrocalidad;//64
    boleta.isGestionFinanciamiento = boleta.isCredito;//65
    boleta.isInfraestructura = boleta.isBodega || boleta.isSilo || boleta.isEmpacador || boleta.isReservorio || boleta.isCuartoMaquinariaRiego || boleta.isInvernadero || boleta.isConstruccionSecado || boleta.isInfraestructuraOtra;//26
    boleta.isInfraestructuraNinguno = !(boleta.isBodega || boleta.isSilo || boleta.isEmpacador || boleta.isReservorio || boleta.isCuartoMaquinariaRiego || boleta.isInvernadero || boleta.isConstruccionSecado || boleta.isInfraestructuraOtra);//19
    boleta.isNinguno = !(boleta.isAsistenciaTecnica || boleta.isLegalizacionTierra || boleta.isAsesoramientoTecnico || boleta.isKitAgricola || boleta.isVacunaAgrocalidad || boleta.isAccesoRiego || boleta.isAgriculturaFamiliarCamp || boleta.isMaquinaria || boleta.isInfraestructura || boleta.isEspacioComercio || boleta.isCredito || boleta.isOtroBeneficioEstado || boleta.otroBeneficioEstado);//21
    boleta.isNoRealizaMejora = !(boleta.isIncorporaAbono || boleta.isEvitaErosion || boleta.isRotaCultivo || boleta.isPastoreoRotativo || boleta.isOtraPracticaMejora);//20
    boleta.isOtraPracticaMejora = !boleta.isNoRealizaMejora;//42
    boleta.isPastoreoRotativo = !boleta.isNoRealizaMejora;//41
    boleta.isRotaCultivo = !boleta.isNoRealizaMejora;//40
    boleta.bovino.subtotalAjenos = (boleta.bovino.propositoParaLecheAjeno ?? 0) + (boleta.bovino.propositoParaCarneAjeno ?? 0) + (boleta.bovino.doblePropositoAjeno ?? 0);//4
    boleta.bovino.subtotalHembras = (boleta.bovino.terneras ?? 0) + (boleta.bovino.vaconas ?? 0) + (boleta.bovino.vacasEnProduccion ?? 0) + (boleta.bovino.vacasSecas ?? 0);//7
    boleta.bovino.subtotalMachos = (boleta.bovino.terneros ?? 0) + (boleta.bovino.toretes ?? 0) + (boleta.bovino.toros ?? 0);//6
    boleta.bovino.subtotalPropio = (boleta.bovino.propositoParaLechePropio ?? 0) + (boleta.bovino.propositoParaCarnePropio ?? 0) + (boleta.bovino.doblePropositoPropio ?? 0);//3
    boleta.bovino.totalGanado = (boleta.bovino.subtotalMachos ?? 0) + (boleta.bovino.subtotalHembras ?? 0);//8
    boleta.bovino.totalGanadoProposito = (boleta.bovino.noSabeProposito ?? 0) + (boleta.bovino.subtotalAjenos ?? 0) + (boleta.bovino.subtotalPropio ?? 0);//5
    boleta.sistemaAguaRiego = boleta.fuenteAguaRiego === "1565" ? boleta.sistemaAguaRiego = "1570" : boleta.sistemaAguaRiego = "";//44
    boleta.sistemaAguaRiego = boleta.fuenteAguaRiego === "1566" ? boleta.sistemaAguaRiego = "1571" : boleta.sistemaAguaRiego = "";//45
    boleta.sitioAgricola = boleta.compradorAgricola === "291" ? boleta.sitioAgricola = "291" : boleta.sitioAgricola = boleta.sitioAgricola;//53
    boleta.sitioApicola = boleta.compradorApicola === "291" ? boleta.sitioApicola = "291" : boleta.sitioApicola = boleta.sitioApicola;//60
    boleta.sitioAvicola = boleta.compradorAvicola === "291" ? boleta.sitioAvicola = "291" : boleta.sitioAvicola = boleta.sitioAvicola;//56
    boleta.sitioBovina = boleta.compradorBovina === "291" ? boleta.sitioBovina = "291" : boleta.sitioBovina = boleta.sitioBovina;//54
    boleta.sitioCuyesConejos = boleta.compradorCuyesConejos === "291" ? boleta.sitioCuyesConejos = "291" : boleta.sitioCuyesConejos = boleta.sitioCuyesConejos;//59
    boleta.sitioForestal = boleta.compradorForestal === "291" ? boleta.sitioForestal = "291" : boleta.sitioForestal = boleta.sitioForestal;//61
    boleta.sitioOtrasAves = boleta.compradorOtrasAves === "291" ? boleta.sitioOtrasAves = "291" : boleta.sitioOtrasAves = boleta.sitioOtrasAves;//57
    boleta.sitioOvinoCaprino = boleta.compradorOvinoCaprino === "291" ? boleta.sitioOvinoCaprino = "291" : boleta.sitioOvinoCaprino = boleta.sitioOvinoCaprino;//58
    boleta.sitioPorcicola = boleta.compradorPorcicola === "291" ? boleta.sitioPorcicola = "291" : boleta.sitioPorcicola = boleta.sitioPorcicola;//55
    boleta.porcino.totalHembraPorcino = (boleta.porcino.menos2MesesHembrasPorcino ?? 0) + (boleta.porcino.mas2MesHembraPorcino ?? 0);//2
    boleta.porcino.totalMachoPorcino = (boleta.porcino.menos2MesMachoPorcino ?? 0) + (boleta.porcino.mas2MesMachoPorcino ?? 0);//1

    return boleta;
}
