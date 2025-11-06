import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { MiembroHogarService } from 'src/app/services/miembro-hogar.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-miembros-hogar-list',
  templateUrl: './miembros-hogar-list.page.html',
  styleUrls: ['./miembros-hogar-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MiembrosHogarListPage {
  public readonly boletaService = inject(DataService);
  public readonly catalogoService = inject(CatalogoService);
  public readonly miembrosHogarService = inject(MiembroHogarService);
  private navCtrl = inject(NavController);

  constructor() { }

  /**
   * Selecciona un miembro del hogar y navega a la página de edición/detalle.
   * @param miembroUuid El ID único del miembro seleccionado.
   */
  public selectMiembro(miembroUuid: string): void {
    this.boletaService.miembroHogarUuid.set(miembroUuid);
    this.navCtrl.navigateForward('/home/b0802');
  }
}