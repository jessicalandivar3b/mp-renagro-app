import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[mpNumeric]',
    providers: [{ provide: NG_VALIDATORS, useExisting: MpNumericValidator, multi: true }]
})
export class MpNumericValidator implements Validator {

    validate(control: AbstractControl): ValidationErrors | null {
        // console.log('MpNumericValidator.validate');

        if (control.value === null || control.value === undefined || control.value === '') {
            return null;
        }

        const valueAsString = String(control.value);

        const alphanumericSpacePattern = /^[0-9\s]*$/;

        if (alphanumericSpacePattern.test(valueAsString)) {
            return null;
        } else {
            return { 'mpNumeric': { value: control.value } };
        }
    }
}