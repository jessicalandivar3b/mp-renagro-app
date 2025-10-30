import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export type EntityType = 'avance' | 'meta';

@Injectable({
  providedIn: 'root'
})
export class ExcelUploadService {

  private apiUrl = environment.API_RENAGRO_URL;

  constructor(private http: HttpClient) { }

  uploadExcel(file: File, token: string, entityType: EntityType): Observable<any> {

    let uploadPath: string;
    if (entityType === 'avance') {
      uploadPath = '/api-renagro/avance/upload-excel';
    } else if (entityType === 'meta') {
      uploadPath = '/api-renagro/meta/upload-excel';
    } else {
      throw new Error('Tipo de entidad no válido.');
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

    // 💡 CAMBIO CLAVE 1: Inicializa las cabeceras vacías
    let headers = new HttpHeaders();

    // 💡 CAMBIO CLAVE 2: Solo agrega la cabecera si el token no es una cadena vacía
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Envía la solicitud al Base URL (http://localhost:3023) + Path
    // Si 'token' fue '', las cabeceras estarán vacías y la llamada funcionará sin autenticación.
    return this.http.post(`${this.apiUrl}${uploadPath}`, formData, { headers });
  }
}
