import moment from "moment";

export function Fecha(formato){
    try {
        let fecha = moment().format(formato)
        return fecha;
    } catch (error) {
        return null
    }
}