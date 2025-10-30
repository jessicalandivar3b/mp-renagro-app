import { Component, inject } from '@angular/core';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DataService } from 'src/app/services/data.service';
import { MpInputErrorComponent } from "src/app/components/mp-input-error/mp-input-error.component";
import { MpSearchModalComponent } from 'src/app/components/mp-search-modal/mp-search-modal.component';
import { MpTextValidator } from 'src/app/validators/text-validator';
import { MpAlphanumericValidator } from "src/app/validators/alphanumeric-validator";
import { MpDecimalPrecisionValidator } from 'src/app/validators/decimal-precision-validator';


@Component({
  selector: 'app-b0702',
  templateUrl: './b0702.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MpInputErrorComponent, MpTextValidator, MpAlphanumericValidator, MpDecimalPrecisionValidator]
})
export class B0702Page {
  private navCtrl = inject(NavController);
  public readonly catalogoService = inject(CatalogoService);

  public readonly boletaService = inject(DataService);
  public boleta = this.boletaService.boleta;

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
    //this.navCtrl.navigateForward('/home');
    this.navCtrl.pop();
  }

  public onButtonNext(): void {
    this.navCtrl.navigateForward('/home/b0703');
  }
}
