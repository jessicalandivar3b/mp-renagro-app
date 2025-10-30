import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[mpText]',
    providers: [{ provide: NG_VALIDATORS, useExisting: MpTextValidator, multi: true }]
})
export class MpTextValidator implements Validator {

    validate(control: AbstractControl): ValidationErrors | null {
        // console.log('MpTextValidator.validate');

        if (control.value === null || control.value === undefined || control.value === '') {
            return null;
        }

        const valueAsString = String(control.value);

        const alphanumericSpacePattern = /^[a-zA-Z\s]*$/;

        if (alphanumericSpacePattern.test(valueAsString)) {
            return null;
        } else {
            return { 'mpText': { value: control.value } };
        }
    }
}