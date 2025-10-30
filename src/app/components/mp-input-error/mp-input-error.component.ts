import { Component, computed, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'mp-input-error',
  templateUrl: './mp-input-error.component.html',
  styleUrls: ['./mp-input-error.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class MpInputErrorComponent {
  // Define un input para recibir el control de formulario (ej. #distanciaInput="ngModel")
  control = input<AbstractControl | null>(null);
  field = input<string>('');
  value = input<any>(null);
  propiedades = input<string>('');

  errorsField = computed<string[]>(() => {
    const valor = `${this.value()}`;
    const errorMessages: string[] = [];
    // console.log(`v: ${this.field()}:${valor}`);

    const propiedades = this.propiedades().split(',');
    for (const propiedad of propiedades) {
      let procesaTipo = false;
      const [tipo, regla] = propiedad.split(':').map(s => s.trim());
      // console.log(`p: ${tipo}:${regla}`);
      if (tipo === 'decimales') {
        procesaTipo = true;
        // console.log('valor:', valor);
        const [entero, decimales] = valor.split('.');
        // console.log(`e: ${entero}:${decimales}`);
        if (decimales) {
          if (decimales.length > +regla) {
            errorMessages.push(`Deber tener hasta ${regla} decimales, tiene ${decimales.length}`);
          }
        }
      }

      if (tipo.trim().length > 0 && (!procesaTipo)) {
        console.error(`MpInputError Campo:${this.field()} Valor:${valor} prop:${tipo} por controlar`);
      }
    }
    return errorMessages;
  });

  // Propiedad computada que genera la lista de mensajes de error.
  // Es reactiva, por lo que se actualizará automáticamente con cada cambio en el control.
  errors = computed<string[]>(() => {
    const controlErrors: ValidationErrors | null | undefined = this.control()?.errors;
    const errorMessages: string[] = [];
    // console.log('errors.computed', controlErrors);

    if (controlErrors) {
      if (controlErrors['required']) {
        errorMessages.push('Este campo es requerido.');
      }
      if (controlErrors['minlength']) {
        errorMessages.push(`El valor debe tener al menos ${controlErrors['minlength'].requiredLength} caracteres.`);
      }
      if (controlErrors['maxlength']) {
        errorMessages.push(`El valor no debe exceder los ${controlErrors['maxlength'].requiredLength} caracteres.`);
      }
      if (controlErrors['min']) {
        errorMessages.push(`El valor mínimo es ${controlErrors['min'].min}.`);
      }
      if (controlErrors['max']) {
        errorMessages.push(`El valor máximo es ${controlErrors['max'].max}.`);
      }
      if (controlErrors['email']) {
        errorMessages.push('Por favor ingrese un correo válido.');
      }
      //personalizadas
      if (controlErrors['mpDecimalPrecision']) {
        errorMessages.push(`Máximos decimales ${controlErrors['mpDecimalPrecision'].requiredDecimals}.`);
      }
      if (controlErrors['mpAlphanumeric']) {
        errorMessages.push(`Solo se permite letras numeros y espacios.`);
      }
      if (controlErrors['mpText']) {
        errorMessages.push(`Solo se permite letras y espacios.`);
      }
    }
    return errorMessages;
  });
}
