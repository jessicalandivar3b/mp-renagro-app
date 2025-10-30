import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    children: [
      { path: "b0101", loadComponent: () => import("./pages/boleta/b0101/b0101.page").then(m => m.B0101Page) },
      { path: "b0102", loadComponent: () => import("./pages/boleta/b0102/b0102.page").then(m => m.B0102Page) },
      { path: "b0201-02", loadComponent: () => import("./pages/boleta/b0201-02/b0201-02.page").then(m => m.B020102Page) },
      { path: "b0203", loadComponent: () => import("./pages/boleta/b0203/b0203.page").then(m => m.B0203Page) },
      { path: "b0204-05", loadComponent: () => import("./pages/boleta/b0204-05/b0204-05.page").then(m => m.B020405Page) },
      { path: "b0206", loadComponent: () => import("./pages/boleta/b0206/b0206.page").then(m => m.B0206Page) },
      { path: "b0207", loadComponent: () => import("./pages/boleta/b0207/b0207.page").then(m => m.B0207Page) },
      { path: "b0301", loadComponent: () => import("./pages/boleta/b0301/b0301.page").then(m => m.B0301Page) },
      { path: "b0302", loadComponent: () => import("./pages/boleta/b0302/b0302.page").then(m => m.B0302Page) },
      { path: "b0402", loadComponent: () => import("./pages/boleta/b0402/b0402.page").then(m => m.B0402Page) },
      { path: "b0403", loadComponent: () => import("./pages/boleta/b0403/b0403.page").then(m => m.B0403Page) },
      { path: "b0404", loadComponent: () => import("./pages/boleta/b0404/b0404.page").then(m => m.B0404Page) },
      { path: "b0405", loadComponent: () => import("./pages/boleta/b0405/b0405.page").then(m => m.B0405Page) },
      { path: "b0501", loadComponent: () => import("./pages/boleta/b0501/b0501.page").then(m => m.B0501Page) },
      { path: "b0601", loadComponent: () => import("./pages/boleta/b0601/b0601.page").then(m => m.B0601Page) },
      { path: "b0602", loadComponent: () => import("./pages/boleta/b0602/b0602.page").then(m => m.B0602Page) },
      { path: "b0603", loadComponent: () => import("./pages/boleta/b0603/b0603.page").then(m => m.B0603Page) },
      { path: "b0701", loadComponent: () => import("./pages/boleta/b0701/b0701.page").then(m => m.B0701Page) },
      { path: "b0702", loadComponent: () => import("./pages/boleta/b0702/b0702.page").then(m => m.B0702Page) },
      { path: "b0703", loadComponent: () => import("./pages/boleta/b0703/b0703.page").then(m => m.B0703Page) },
      { path: "b0801", loadComponent: () => import("./pages/boleta/b0801/b0801.page").then(m => m.B0801Page) },
      { path: "b0802", loadComponent: () => import("./pages/boleta/b0802/b0802.page").then(m => m.B0802Page) },
      { path: "b0901", loadComponent: () => import("./pages/boleta/b0901/b0901.page").then(m => m.B0901Page) },
      { path: "b1101", loadComponent: () => import("./pages/boleta/b1101/b1101.page").then(m => m.B1101Page) },
      //
      {
        path: 'miembro-hogar',
        loadComponent: () => import('./pages/miembros-hogar-list/miembros-hogar-list.page').then(m => m.MiembrosHogarListPage)
      },

      {
        path: 'listado',
        loadComponent: () => import('./pages/listado/listado.page').then(m => m.ListadoPage)
      },
      {
        path: 'terrenos',
        loadComponent: () => import('./pages/terrenos-list/terrenos-list.page').then(m => m.TerrenosListPage)
      },
      {
        path: '',
        redirectTo: 'listado',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'upload-excel',
    loadComponent: () => import('./pages/upload-excel/upload-excel.page').then(m => m.UploadExcelPage)
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },



];
