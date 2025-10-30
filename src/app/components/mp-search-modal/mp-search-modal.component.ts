import { Component, computed, inject, input, output, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CatalogoItem } from 'src/app/interfaces/catalogo';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DataService } from 'src/app/services/data.service';
import { Boleta, MiembroHogar, Terreno } from 'src/app/interfaces/boleta.interface';
import { TerrenoService } from 'src/app/services/terreno.service';
import { MiembroHogarService } from 'src/app/services/miembro-hogar.service';

@Component({
  selector: 'mp-search-modal',
  templateUrl: './mp-search-modal.component.html',
  styleUrls: ['./mp-search-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class MpSearchModalComponent {
  campo = input.required<string>();
  grupo = input<string>('boleta');
  itemSelected = output<CatalogoItem>();

  private readonly catalogoService = inject(CatalogoService);
  private readonly boletaService = inject(DataService);
  private readonly terrenoService = inject(TerrenoService);
  private readonly miembroHogarService = inject(MiembroHogarService);

  private searchQuery = signal('');

  constructor(private modalController: ModalController) { }

  catalogoItems = computed(() => {
    const grupoStr = '' + this.grupo;
    const campoStr = '' + this.campo;
    //console.log(`origen: ${grupoStr} ${campoStr}`)
    let recordCatalogo = this.catalogoService.getCampoCatalogoByGrupoCampo(grupoStr, campoStr)();
    if (!(recordCatalogo && recordCatalogo.catalogo)) {
      console.error(`No se encuentra un catalogo para el grupo: ${grupoStr} campo:${campoStr}`);
      return [];
    }

    // console.log('campoCatalogo', campoCatalogo)
    if (recordCatalogo && recordCatalogo.padre) {
      let valorDelCampo = '';
      if (grupoStr == 'terreno') {
        let terreno = this.terrenoService.terreno();
        let campoJson = recordCatalogo.padre as keyof Terreno;
        valorDelCampo = '' + terreno[campoJson];
      } else
        if (grupoStr == 'miembroHogar') {
          let miembroHogar = this.miembroHogarService.miembroHogar();
          let campoJson = recordCatalogo.padre as keyof MiembroHogar;
          valorDelCampo = '' + miembroHogar[campoJson];
        } else {
          let boleta = this.boletaService.boleta();
          let campoJson = recordCatalogo.padre as keyof Boleta;
          valorDelCampo = '' + boleta[campoJson];
        }
      //console.log(`valorDelCampo: ${valorDelCampo} `)
      return this.catalogoService.getItemsByGroupAndParent(recordCatalogo.catalogo, valorDelCampo)();
    } else {
      return this.catalogoService.getItemsByGroup(recordCatalogo.catalogo)();
    }
  });

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    //console.log(`grupo: ${this.grupo}  campo: ${this.campo} query: ${query}`)
    return this.catalogoItems().filter(item => item.descripcion.toLowerCase().includes(query));
  });

  onSearch(event: any): void {
    this.searchQuery.set(event.target.value);
  }

  selectItem(item: CatalogoItem): void {
    console.log('selectItem:', item.codigo, this.campo, this.grupo)
    const grupoStr = '' + this.grupo;
    const campoStr = '' + this.campo;
    if (grupoStr == 'terreno') {
      let campoJson = campoStr as keyof Terreno;
      this.terrenoService.onInputChange(item.codigo, campoJson);
    } else
      if (grupoStr == 'miembroHogar') {
        let campoJson = campoStr as keyof Terreno;
        this.miembroHogarService.onInputChange(item.codigo, campoJson);
      } else {
        let campoJson = campoStr as keyof Boleta;
        this.boletaService.onInputChange(item.codigo, campoJson);
      }


    let campoCatalogo = this.catalogoService.getCampoCatalogoByGrupoCampo(grupoStr, campoStr)();
    if (campoCatalogo && campoCatalogo.encera) {
      // console.log('campoCatalogo.encera', campoCatalogo.encera);
      for (const campoEncera of campoCatalogo.encera) {
        if (grupoStr == 'terreno') {
          let campoJson = campoEncera as keyof Terreno;
          this.terrenoService.onInputChange(campoJson, '');
        } else
          if (grupoStr == 'miembroHogar') {
            let campoJson = campoEncera as keyof MiembroHogar;
            this.miembroHogarService.onInputChange(campoJson, '');
          } else {
            let campoJson = campoEncera as keyof Boleta;
            this.boletaService.onInputChange(campoJson, '');
          }
      }
    }

    this.itemSelected.emit(item);
    this.closeModal();
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}