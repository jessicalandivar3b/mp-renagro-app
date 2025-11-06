/**
 * Define los posibles estados de una boleta de registro.
 */
export enum EstadosBoleta {
    /** El registro se esta registrando, aun no completa el proceso de registro. */
    REGISTRANDO = 'REGISTRANDO',

    /** El registro ha sido enviado exitosamente al servidor. */
    ENVIADO = 'ENVIADO',

    /** El registro fue enviado, pero hubo un error u observaciones de validación. */
    QA = 'QA',

    /** El registro ha sido completado y recibido por el MAG. */
    RECIBIDO = 'RECIBIDO',

    /** El registro fue enviado, pero hubo un error u observaciones de fiscalizacion. */
    FISCALIZADO_QA = 'FISCALIZADO_QA',

    /** El registro ha sido completado y recibido por fiscalizacion. */
    FISCALIZADO = 'FISCALIZADO',
}