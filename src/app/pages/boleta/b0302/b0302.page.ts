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


import { ForestalService } from 'src/app/services/forestal.service';
import { TerrenoService } from 'src/app/services/terreno.service';

@Component({
  selector: 'app-b0302',
  templateUrl: './b0302.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MpInputErrorComponent, MpTextValidator, MpAlphanumericValidator, MpDecimalPrecisionValidator]
})
export class B0302Page {
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private navegacionService = inject(NavegacionService);
  public readonly catalogoService = inject(CatalogoService);

  public readonly boletaService = inject(DataService);
  public boleta = this.boletaService.boleta;
  public readonly forestalService = inject(ForestalService);
  public forestal = this.forestalService.forestal;
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

  public goToForestalPage(): void {
    this.navCtrl.navigateForward('/home/terrenos');
  }
}
