import { v4 as uuidv4 } from 'uuid';

export class Utils {

    // Constantes basadas en la función de PostgreSQL
    private static readonly M2_TO_SQM = 1;      // Código '4348': Metro Cuadrado (M2)
    private static readonly CD_TO_SQM = 7057;   // Código '4347': Cuadra (CD)
    private static readonly HA_TO_SQM = 10000;  // Código '4346': Hectárea (HA)

    /**
     * Convierte una superficie de una unidad de medida dada a metros cuadrados (m²),
     * utilizando los factores de conversión de la base de datos sc_renagro_mag.
     * @param superficie El valor numérico de la superficie.
     * @param unidad El código de catálogo de la unidad de medida (e.g., '4348').
     * @returns La superficie convertida a metros cuadrados (number).
     */
    public static convertToSquareMeters(superficie: number | null, unidad: string | null): number {
        // Maneja valores nulos o no válidos para superficie
        const superficieValue = (superficie === null || superficie === undefined || isNaN(superficie)) ? 0 : Number(superficie);

        // Maneja unidad nula o indefinida, devolviendo 0 si no hay unidad válida
        if (!unidad) {
            return 0;
        }

        let conversionFactor = 0;

        switch (unidad.trim()) {
            case '4348': // METRO CUADRADO (M2)
                conversionFactor = Utils.M2_TO_SQM;
                break;
            case '4347': // CUADRA (CD)
                conversionFactor = Utils.CD_TO_SQM;
                break;
            case '4346': // HECTÁREA (HA)
                conversionFactor = Utils.HA_TO_SQM;
                break;
            default:
                // Si el código no coincide, el resultado es 0, al igual que en la función PostgreSQL
                conversionFactor = 0;
                break;
        }

        return superficieValue * conversionFactor;
    }



    /**
     * Función recursiva que limpia un objeto (o un elemento de un array)
     * eliminando todas las propiedades locales de la UI (e.g., *Show, tmp*).
     * @param data Objeto de datos (Boleta, Terreno, Cultivo, etc.).
     * @returns Un objeto limpio listo para ser enviado al servidor.
     */
    public static cleanObjectRecursive(data: any): any {
        // Si los datos no son un objeto o son nulos, retornamos como está.
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        // Usamos JSON.parse/stringify para crear una copia profunda que nos permita mutar (eliminar propiedades).
        // Esto asegura que no mutamos el signal original.
        const cleanedData = JSON.parse(JSON.stringify(data));

        // Iteramos sobre las claves para la eliminación
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key];

            // 1. ELIMINACIÓN DE PROPIEDADES LOCALES
            if (key.endsWith('Show') || key.startsWith('tmp')) {
                // Usamos la aserción de TypeScript para la eliminación segura
                delete cleanedData[key as keyof typeof cleanedData];
                return; // Pasamos a la siguiente clave
            }

            // 2. LLAMADA RECURSIVA PARA OBJETOS Y ARRAYS ANIDADOS
            if (Array.isArray(value)) {
                // Limpiamos cada elemento del array
                cleanedData[key] = value.map(item => this.cleanObjectRecursive(item));
            } else if (typeof value === 'object' && value !== null) {
                // Limpiamos el objeto anidado
                cleanedData[key] = this.cleanObjectRecursive(value);
            }
        });

        return cleanedData;
    }

    public static generaUUID(): string {
        return uuidv4();
    }
}