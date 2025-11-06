import { Component, computed, inject, input, output, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CatalogoItem } from 'src/app/interfaces/catalogo';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DataService } from 'src/app/services/data.service';
import { Boleta, Cultivo, CultivoForestal, MiembroHogar, Terreno } from 'src/app/interfaces/boleta.interface';
import { TerrenoService } from 'src/app/services/terreno.service';
import { MiembroHogarService } from 'src/app/services/miembro-hogar.service';
import { CultivoService } from 'src/app/services/cultivo.service';
import { ForestalService } from 'src/app/services/forestal.service';

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
  private readonly cultivoService = inject(CultivoService);
  private readonly forestalService = inject(ForestalService);
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

  setValue(grupo: string, campo: string, valor: string) {
    console.log(`setValue=>${grupo}.${campo}=${valor}`);
    switch (grupo) {
      case 'terreno':
        // const campoTerreno = campoStr as keyof Terreno;
        this.terrenoService.onInputChange(valor, campo);
        break;

      case 'miembroHogar':
        // const campoMiembro = campo as keyof MiembroHogar;
        this.miembroHogarService.onInputChange(valor, campo);
        break;

      case 'cultivos':
        // const campoCultivo = campo as keyof Cultivo;
        this.cultivoService.onInputChange(valor, campo);
        break;

      case 'forestal':
        // const campoForestal = campo as keyof CultivoForestal;
        this.forestalService.onInputChange(valor, campo);
        break;

      case 'boleta':
        // const campoForestal = campo as keyof CultivoForestal;
        this.boletaService.onInputChange(valor, campo);
        break;

      default:
        // Usamos las propiedades pasadas al modal (this.grupo y this.campo) para formar la ruta completa.
        this.boletaService.onInputChange(valor, `${this.grupo}.${this.campo}`);
        break;
    }
  }


  selectItem(item: CatalogoItem): void {
    console.log(`selectItem=>${this.grupo}.${this.campo}=${item.codigo}`);
    const grupoStr = '' + this.grupo;
    const campoStr = '' + this.campo;
    this.setValue(grupoStr, campoStr, item.codigo);

    let campoCatalogo = this.catalogoService.getCampoCatalogoByGrupoCampo(grupoStr, campoStr)();
    if (campoCatalogo && campoCatalogo.encera) {
      // console.log('campoCatalogo.encera', campoCatalogo.encera);
      for (const campoEncera of campoCatalogo.encera) {
        this.setValue(grupoStr, campoEncera, '');
      }
    }

    this.itemSelected.emit(item);
    this.closeModal(item);
  }

  closeModal(item?: CatalogoItem): void {
  this.modalController.dismiss(item);
}
}