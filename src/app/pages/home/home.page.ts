import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenu,
  IonMenuToggle,
  IonList,
  IonRouterOutlet,
  IonItem,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',

  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonLabel,
    IonIcon,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenu,
    IonMenuToggle,
    IonList,
    IonRouterOutlet,
    RouterModule
  ]
})
export class HomePage {

  public appPages = [
    { title: "Listado", url: "listado", icon: "home" },
    //
    { title: "1.1 - Ubicación geográfica", url: "b0101", icon: "clipboard" },
    { title: "1.2 - Uso de suelo de los terrenos con fines agrícolas, pecuarios, apícolas, silvícolas y/o fungicultura", url: "b0102", icon: "clipboard" },
    { title: "2.1 - Nombre de la persona productora (PP) ", url: "b0201-02", icon: "clipboard" },
    { title: "2.3 - Domicilio de la persona productora (PP)", url: "b0203", icon: "clipboard" },
    { title: "2.4 - Tenencia de medios de comunicación", url: "b0204-05", icon: "clipboard" },
    { title: "2.6 - Acceso a beneficios otorgados por el Estado", url: "b0206", icon: "clipboard" },
    { title: "2.7 - Asociatividad", url: "b0207", icon: "clipboard" },
    { title: "3.1 - Cultivos perennes, transitorios, flores, silvicultura, fungicultura y mosaicos", url: "b0301", icon: "clipboard" },
    { title: "3.2 - Especies forestales en monocultivo", url: "b0302", icon: "clipboard" },
    { title: "4.2 - Ganado bovino", url: "b0402", icon: "clipboard" },
    { title: "4.3 - Ganado porcino", url: "b0403", icon: "clipboard" },
    { title: "4.4 - Pollos", url: "b0404", icon: "clipboard" },
    { title: "4.5 - Otras especies", url: "b0405", icon: "clipboard" },
    { title: "5.1 - Prácticas de mejoramiento de suelos", url: "b0501", icon: "clipboard" },
    { title: "6.1 - Infraestructura agrícola", url: "b0601", icon: "clipboard" },
    { title: "6.2 - Disponibilidad del agua para riego", url: "b0602", icon: "clipboard" },
    { title: "6.3 - Maquinaria, equipos e implementos", url: "b0603", icon: "clipboard" },
    { title: "7.1 - Destino de la producción", url: "b0701", icon: "clipboard" },
    { title: "7.2 - Extensión Rural", url: "b0702", icon: "clipboard" },
    { title: "7.3 - Crédito", url: "b0703", icon: "clipboard" },
    { title: "8.1 - Acerca de la mano de obra de los NO MIEMBROS DEL HOGAR", url: "b0801", icon: "clipboard" },
    { title: "8.2 - Información de los miembros del hogar de la persona productora", url: "b0802", icon: "clipboard" },
    { title: "9.1 - Persona responsable del terreno", url: "b0901", icon: "clipboard" },
    { title: "11.1 - CAPTURA DE COORDENADAS (GPS) (WGS 84 - UTM)", url: "b1101", icon: "clipboard" },
  ];

  constructor() { }

}