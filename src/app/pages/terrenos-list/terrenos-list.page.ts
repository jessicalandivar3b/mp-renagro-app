import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { TerrenoService } from 'src/app/services/terreno.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { Terreno } from 'src/app/interfaces/boleta.interface';
import { Utils } from 'src/app/utils/utils';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-terrenos-list',
  templateUrl: './terrenos-list.page.html',
  styleUrls: ['./terrenos-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TerrenosListPage {

  public readonly catalogoService = inject(CatalogoService);
  public readonly boletaService = inject(DataService);
  public readonly terrenoService = inject(TerrenoService);
  private navCtrl = inject(NavController);
  public totalSuperficieGlobal = 0;//this.terrenoService.totalSuperficieGlobal;


  constructor() { }

  public getSuperficieTerrenoEnM2(terreno: Terreno): number {
    return Utils.convertToSquareMeters(terreno.superficie, terreno.superficieUnidad || '');
  }

  getSuperficieResumenCultivo(terreno: Terreno): { plantada: number, riego: number, unidad: string } {

    // ** CORRECCIÓN LÍNEA 36 **
    const totalPlantadaM2 = terreno.cultivos?.reduce((sum, c) => {
      // Usamos la unidad del terreno si no se define una unidad específica para la superficie Plantada.
      // NOTA: Si en tu interfaz Cultivo existe 'superficiePlantadaUnidad', úsala aquí.
      // Por ahora, usamos el fallback de terreno, ya que 'superficieUnidad' no existe.
      return sum + Utils.convertToSquareMeters(
        c.superficiePlantada,
        terreno.superficieUnidad || '' // Usamos la unidad del Terreno como base
      );
    }, 0) || 0;

    // ** CORRECCIÓN LÍNEA 41 **
    const totalRiegoM2 = terreno.cultivos?.reduce((sum, c) => {
      // Usamos la propiedad sugerida por el compilador: 'superficieRiegoUnidad'
      return sum + Utils.convertToSquareMeters(
        c.superficieRiego,
        c.superficieRiegoUnidad || terreno.superficieUnidad || '' // Usamos la unidad de riego o el fallback
      );
    }, 0) || 0;

    // Devolvemos la unidad 'M²' y el valor convertido a M².
    return { plantada: totalPlantadaM2, riego: totalRiegoM2, unidad: 'M²' };
  }

  getSuperficieResumenForestal(terreno: Terreno): { plantada: number, unidad: string } {
    const unidadTerreno = terreno.superficieUnidad || '';
    // Este código ya estaba correcto, ya que usa 'superficiePlantadaUnidad' que sí debe existir en CultivoForestal
    const totalPlantadaM2 = terreno.cultivosForestales?.reduce((sum, f) => {
      const unidadCodigo = f.superficiePlantadaUnidad || terreno.superficieUnidad || '';
      return sum + Utils.convertToSquareMeters(f.superficiePlantada, unidadCodigo);
    }, 0) || 0;

    // Devolvemos la unidad 'M²' y el valor convertido a M².
    return { plantada: totalPlantadaM2, unidad: 'M²' };
  }

  public selectTerreno(terrenoUuid: string): void {
    this.boletaService.terrenoUuid.set(terrenoUuid);
    console.log(`Contexto Terreno cambiado a: ${terrenoUuid}`);
    this.navCtrl.navigateBack('/home/b0102');
  }

  public navegarACultivo(terrenoUuid: string, cultivoUuid: string): void {
    this.boletaService.terrenoUuid.set(terrenoUuid);
    console.log(`Contexto Terreno padre cambiado a: ${terrenoUuid}`);

    this.boletaService.cultivoUuid.set(cultivoUuid);
    console.log(`Contexto Cultivo cambiado a: ${cultivoUuid}`);

    this.navCtrl.navigateForward('/home/b0301');
  }

  public navegarAForestal(terrenoUuid: string, forestalUuid: string): void {
    this.boletaService.terrenoUuid.set(terrenoUuid);
    console.log(`Contexto Terreno padre cambiado a: ${terrenoUuid}`);

    this.boletaService.cultivoForestalUuid.set(forestalUuid);
    console.log(`Contexto Cultivo Forestal cambiado a: ${forestalUuid}`);

    this.navCtrl.navigateForward('/home/b0302');
  }
}
