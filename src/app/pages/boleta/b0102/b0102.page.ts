import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { MpInputErrorComponent } from "src/app/components/mp-input-error/mp-input-error.component";
import { MpSearchModalComponent } from 'src/app/components/mp-search-modal/mp-search-modal.component';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DataService } from 'src/app/services/data.service';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { MpAlphanumericValidator } from "src/app/validators/alphanumeric-validator";
import { MpDecimalPrecisionValidator } from 'src/app/validators/decimal-precision-validator';
import { MpTextValidator } from 'src/app/validators/text-validator';


import { TerrenoService } from 'src/app/services/terreno.service';

@Component({
  selector: 'app-b0102',
  templateUrl: './b0102.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MpInputErrorComponent, MpTextValidator, MpAlphanumericValidator, MpDecimalPrecisionValidator]
})
export class B0102Page {
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private navegacionService = inject(NavegacionService);
  public readonly catalogoService = inject(CatalogoService);

  public readonly boletaService = inject(DataService);
  public boleta = this.boletaService.boleta;
  public readonly terrenoService = inject(TerrenoService);
  public terreno = this.terrenoService.terreno;

  private modalController = inject(ModalController);

  constructor() { }

  async openModal(campo: string, grupo: string = 'boleta'): Promise<void> {
    const modal = await this.modalController.create({
      component: MpSearchModalComponent,
      componentProps: { campo, grupo },
    });
    await modal.present();
  }

  public onButtonBack(): void {
    this.navegacionService.goToPrevious(this.router.url);
  }

  public onButtonNext(): void {
    this.navegacionService.goToNext(this.router.url);
  }

  public goToTerrenosPage(): void {
    this.navCtrl.navigateForward('/home/terrenos');
  }
}
