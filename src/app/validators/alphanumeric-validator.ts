import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[mpAlphanumeric]',
    providers: [{ provide: NG_VALIDATORS, useExisting: MpAlphanumericValidator, multi: true }]
})
export class MpAlphanumericValidator implements Validator {

    validate(control: AbstractControl): ValidationErrors | null {
        // console.log('MpAlphanumericValidator.validate');

        if (control.value === null || control.value === undefined || control.value === '') {
            return null;
        }

        const valueAsString = String(control.value);

        const alphanumericSpacePattern = /^[a-zA-Z0-9\s]*$/;

        if (alphanumericSpacePattern.test(valueAsString)) {
            return null;
        } else {
            return { 'mpAlphanumeric': { value: control.value } };
        }
    }
}