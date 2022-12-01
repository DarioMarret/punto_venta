import axios from 'axios';
import { getDatosUsuario } from './storeUsuario';
import moment from 'moment';

const axiosFact = axios.create({
    baseURL: 'https://codigomarret.online/facturacion/empresa',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});


export const JsonStructura = async () => {
    let user = getDatosUsuario()
    console.log(user.data.empresa.toLowerCase().replace(/ /g, ''))
    const {empresa, ambiente, clave_firma, correo, establecimiento, numero_secuencial, punto_emision, razon_social, ruc, 
        tipo_comprobante,tipo_emision, whatsapp, matriz, direccion, contabilidad } = await datosEmpresa()
 
    var json = {
        "infoTributaria": {
            "ambiente": ambiente,
            "tipoEmision": tipo_emision,
            "razonSocial": razon_social,
            "nombreComercial":empresa.toUpperCase(),
            "ruc": ruc,
            "claveAcceso": await ConsultarClaveAcceso(ruc, empresa),
            "codDoc": tipo_comprobante,
            "estab": establecimiento,
            "ptoEmi": punto_emision,
            "secuencial":numero_secuencial,
            "dirMatriz": matriz||"Salinas"
        },
        "infoFactura": {
            "fechaEmision": moment().format('DD/MM/YYYY'),
            "dirEstablecimiento": direccion || "Malecon de Salinas",
            "obligadoContabilidad": contabilidad|| "NO",
            "tipoIdentificacionComprador": "05",
            "razonSocialComprador": "Dario Javier Marret Medranda",
            "identificacionComprador": "0927177345",
            "direccionComprador":"Salinas santa elena",
            "totalSinImpuestos": "12.00",
            "totalDescuento": "0.00",
            "totalConImpuestos": {
                "totalImpuesto": [
                    {
                        "codigo": "2",
                        "codigoPorcentaje": "2",
                        "baseImponible": "12.00",
                        "valor": "1.44"
                    }
                ]
            },
            "propina":"0.00",
            "importeTotal": "13.44",
            "moneda": "DOLAR"
        },
        "detalles": {
            "detalle": [
                {
                    "codigoPrincipal": "125BJC-01",
                    "codigoAuxiliar": "1234D56789-A",
                    "descripcion": "Marinero",
                    "cantidad": "1",
                    "precioUnitario": "12.00",
                    "descuento": "0.00",
                    "precioTotalSinImpuesto": "12.00",
                    "impuestos": {
                        "impuesto": [
                            {
                                "codigo": "2",
                                "codigoPorcentaje": "2",
                                "tarifa": "12.00",
                                "baseImponible": "12.00",
                                "valor": "1.44"
                            }
                        ]
                    }
                }
            ]
        }
    }
}

export const datosEmpresa = async () => {
    let user = getDatosUsuario()
    let empresa = user.data.empresa.toLowerCase().replace(/ /g, '')
    console.log(user.data.empresa.toLowerCase().replace(/ /g, ''))
    const {data, status} = await axiosFact.get(`/${empresa}`)
    // console.log(data.data[0])
    return data.data[0][0]
}

export const ConsultarClaveAcceso = async (ruc, empresa) => {
    try {
        const { data, status } = await axios.post('https://codigomarret.online/facturacion/claveacceso',{
            ruc,
            empresa
        })
        if(data.success){
            return data.claveAcceso
        }
    } catch (error) {
        console.log(error)
    }
}
export const ValidarCedula = async (cedula) => {
    if(cedula.length > 10){
        return 
    }
}