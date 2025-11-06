import { Injectable, inject } from '@angular/core';
import { NavController } from '@ionic/angular';

interface RutaPagina {
    pantalla: string;
    orden: number;
}

@Injectable({
    providedIn: 'root'
})
export class NavegacionService {

    private navCtrl = inject(NavController);

    // 2. Definición del mapa de navegación con tus datos
    private readonly NAVIGATION_MAP: RutaPagina[] = [
        { pantalla: "b0101", orden: 1 },
        { pantalla: "b0102", orden: 2 },
        { pantalla: "b0201-02", orden: 3 },
        { pantalla: "b0203", orden: 4 },
        { pantalla: "b0204-05", orden: 5 },
        { pantalla: "b0206", orden: 7 },
        { pantalla: "b0207", orden: 8 },
        { pantalla: "b0301", orden: 9 },
        { pantalla: "b0302", orden: 10 },
        { pantalla: "b0402", orden: 11 },
        { pantalla: "b0403", "orden": 12 },
        { pantalla: "b0404", "orden": 13 },
        { pantalla: "b0405", "orden": 14 },
        { pantalla: "b0501", "orden": 15 },
        { pantalla: "b0601", "orden": 16 },
        { pantalla: "b0602", "orden": 17 },
        { pantalla: "b0603", "orden": 18 },
        { pantalla: "b0701", "orden": 19 },
        { pantalla: "b0702", "orden": 20 },
        { pantalla: "b0703", "orden": 21 },
        { pantalla: "b0801", "orden": 22 },
        { pantalla: "b0802", "orden": 23 },
        { pantalla: "b0901", "orden": 24 },
        { pantalla: "b1101", "orden": 25 },
    ];

    // 3. Mapa para buscar rápidamente por orden
    private readonly orderToRouteMap = new Map<number, string>();

    constructor() {
        // Inicializa el mapa de búsqueda rápida al crear el servicio
        this.NAVIGATION_MAP.forEach(item => {
            this.orderToRouteMap.set(item.orden, item.pantalla);
        });
    }

    // ------------------------------------------------------------------
    // 🎯 LÓGICA DE NAVEGACIÓN
    // ------------------------------------------------------------------

    /**
     * Obtiene la información de la página actual basándose en la ruta activa.
     * @param currentUrl La ruta de Angular actual (ej: '/b0102').
     * @returns La página actual o undefined si no se encuentra.
     */
    private getCurrentPageInfo(currentUrl: string): RutaPagina | undefined {
        // Extrae el nombre de la pantalla de la URL (ej: 'b0102')
        const currentScreen = currentUrl.split('/').pop() || '';
        console.log(currentScreen);
        return this.NAVIGATION_MAP.find(p => p.pantalla === currentScreen);
    }

    /**
     * Determina la siguiente ruta en la secuencia y navega.
     * @param currentUrl La ruta de Angular de la página actual.
     */
    public goToNext(currentUrl: string): void {
        const currentPage = this.getCurrentPageInfo(currentUrl);

        if (!currentPage) {
            console.error('Página actual no encontrada en el mapa de navegación.');
            return;
        }

        const nextOrder = currentPage.orden + 1;

        // 1. Busca la siguiente página secuencialmente
        let nextRoute = this.orderToRouteMap.get(nextOrder);

        // 2. Si el orden secuencial no existe (por saltos como de 5 a 7), buscamos el siguiente orden mayor.
        if (!nextRoute) {
            const nextItem = this.NAVIGATION_MAP
                .filter(p => p.orden > currentPage.orden)
                .sort((a, b) => a.orden - b.orden)[0]; // Obtiene el ítem con el orden más bajo siguiente

            if (nextItem) {
                nextRoute = nextItem.pantalla;
            }
        }

        if (nextRoute) {
            this.navCtrl.navigateForward(`/home/${nextRoute}`);
        } else {
            console.log('FIN DEL FORMULARIO');
            // Opcional: Navegar a una página de resumen o finalizar
            // this.navCtrl.navigateRoot('/summary'); 
        }
    }

    /**
     * Determina la ruta anterior en la secuencia y navega.
     * @param currentUrl La ruta de Angular de la página actual.
     */
    public goToPrevious(currentUrl: string): void {
        const currentPage = this.getCurrentPageInfo(currentUrl);
        console.log(currentPage);

        if (!currentPage) {
            console.error('Página actual no encontrada en el mapa de navegación.');
            return;
        }

        const previousOrder = currentPage.orden - 1;

        // 1. Busca la página anterior secuencialmente
        let previousRoute = this.orderToRouteMap.get(previousOrder);

        // 2. Si el orden secuencial no existe (por saltos), buscamos el orden anterior menor.
        if (!previousRoute) {
            const prevItem = this.NAVIGATION_MAP
                .filter(p => p.orden < currentPage.orden)
                .sort((a, b) => b.orden - a.orden)[0]; // Obtiene el ítem con el orden más alto anterior

            if (prevItem) {
                previousRoute = prevItem.pantalla;
            }
        }

        if (previousRoute) {
            this.navCtrl.navigateBack(`/home/${previousRoute}`);
        } else {
            console.log('INICIO DEL FORMULARIO');
            // Opcional: Mantener en la página actual o navegar al inicio absoluto
            // this.navCtrl.navigateBack('/home');
        }
    }
}