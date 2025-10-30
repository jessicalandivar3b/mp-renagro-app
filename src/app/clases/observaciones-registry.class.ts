export class ObservacionesRegistry {

    private observaciones: Record<string, string[]> = {};

    public register(campo: string, observacion: string): void {
        if (!campo || !observacion) {
            console.warn('registerObservation requiere campo y observacion.');
            return;
        }
        if (!this.observaciones[campo]) {
            this.observaciones[campo] = [];
        }
        this.observaciones[campo].push(observacion);
    }

    /**
     * Obtiene todas las observaciones registradas para un campo destino.
     */
    public getSourcesForCampo(campo: string): string[] {
        return this.observaciones[campo] || [];
    }

    /**
     * Devuelve una copia completa del registro (solo lectura).
     */
    public getAllObservations(): Readonly<Record<string, string[]>> {
        return { ...this.observaciones };
    }
}
