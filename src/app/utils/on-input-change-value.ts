export function onInputChangeValue(event: any): any {
    let valueInput: any = null;
    if (!event.target) {
        valueInput = event;
    } else {
        const tagName = event.target.tagName;
        if (tagName === 'ION-TOGGLE') {
            valueInput = event.detail.checked;
        } else {
            valueInput = event.detail.value;
        }
    }
    return valueInput;
}