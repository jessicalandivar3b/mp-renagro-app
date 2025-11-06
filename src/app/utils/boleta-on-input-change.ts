import { Boleta } from "../interfaces/boleta.interface";
import { boletaShowFields } from "./boleta-show-fields";
import { updateBoletaCalcs } from "./calcFields";
import { onInputChangeValue } from "./on-input-change-value";

export function boletaOnInputChange(boletaData: Boleta, event: any, filePath: string): Boleta {
    let boleta = JSON.parse(JSON.stringify(boletaData)) as any;
    let valueInput: any = onInputChangeValue(event);
    console.log(`boletaOnInputChange ${filePath}=${valueInput} `);

    if (filePath.includes('.')) {
        const parts = filePath.split('.');
        let tempObject = boleta[parts[0]];
        tempObject[parts[1]] = valueInput;
    } else {
        boleta[filePath] = valueInput;
        // boleta = {
        //     ...boleta,
        //     [filePath]: valueInput,
        // };
    }
    return boleta;
}