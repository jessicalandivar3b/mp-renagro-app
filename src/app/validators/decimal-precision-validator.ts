import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
    selector: '[mpDecimalPrecision]',
    providers: [{ provide: NG_VALIDATORS, useExisting: MpDecimalPrecisionValidator, multi: true }]
})
export class MpDecimalPrecisionValidator implements Validator {
    @Input('mpDecimalPrecision') maxDecimals: number = 0;

    validate(control: AbstractControl): ValidationErrors | null {
        if (control.value === null || control.value === undefined || control.value === '') {
            return null;
        }
        const valueAsString = String(control.value);

        let decimalPattern = new RegExp(`^\\d+?$`);
        if (this.maxDecimals > 0) {
            decimalPattern = new RegExp(`^\\d+(\\.\\d{1,${this.maxDecimals}})?$`);
        }

        if (decimalPattern.test(valueAsString)) {
            return null;
        } else {
            return { 'mpDecimalPrecision': { requiredDecimals: this.maxDecimals, actualValue: control.value } };
        }
    }
}