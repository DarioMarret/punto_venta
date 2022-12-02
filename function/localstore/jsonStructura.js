import axios from 'axios';
import { functionPorcentajeIva, functionSubtotal, functionTotal, getDatosUsuario } from './storeUsuario';
import moment from 'moment';

const axiosFact = axios.create({
    baseURL: 'https://codigomarret.online/facturacion/empresa',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});


export const JsonStructura = async (tienda, TotalesFacturacion, dataCliente) => {
    let user = getDatosUsuario()
    console.log(user.data.empresa.toLowerCase().replace(/ /g, ''))
    const {empresa, ambiente, clave_firma, correo, establecimiento, numero_secuencial, punto_emision, razon_social, ruc, 
        tipo_comprobante,tipo_emision, whatsapp, matriz, direccion, contabilidad } = await datosEmpresa()
        var detalle = []
        if(typeof tienda == 'object'){
            tienda.map(iten => {
                let numb = iten.cantidad * parseFloat(iten.precio_venta)
                let precioUnitario = (Math.round((parseFloat(iten.precio_venta)/1.12 + Number.EPSILON) * 100) / 100)
                let precioTotalSinImpuesto = (Math.round((numb/1.12 + Number.EPSILON) * 100) / 100)
                let info ={
                    "codigoPrincipal":iten.id,
                    // "codigoAuxiliar": "1234D56789-A",
                    "descripcion": iten.producto,
                    "cantidad": iten.cantidad,
                    "precioUnitario": precioUnitario.toFixed(2),
                    "descuento": "0.00",
                    "precioTotalSinImpuesto": precioTotalSinImpuesto.toFixed(2),
                    "impuestos": {
                        "impuesto": [
                            {
                                "codigo": "2",
                                "codigoPorcentaje": "2",
                                "tarifa": "12.00",
                                "baseImponible": (iten.subtota * iten.cantidad).toFixed(2),
                                "valor": (numb - (iten.subtota * iten.cantidad)).toFixed(2)
                            }
                        ]
                    }
                }
                detalle.push(info)
            })
        }
 
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
            "tipoIdentificacionComprador": await ValidarCedula(dataCliente.cedula),
            "razonSocialComprador": dataCliente.nombre,
            "identificacionComprador": dataCliente.cedula,
            "direccionComprador":dataCliente.direccion,
            "totalSinImpuestos": TotalesFacturacion.subTotal_12,
            "totalDescuento": "0.00",
            "totalConImpuestos": {
                "totalImpuesto": [
                    {
                        "codigo": "2",
                        "codigoPorcentaje": "2",
                        "baseImponible": TotalesFacturacion.subTotal_12,
                        "valor": TotalesFacturacion.iva
                    }
                ]
            },
            "propina":"0.00",
            "importeTotal": TotalesFacturacion.Total,
            "moneda": "DOLAR"
        },
        "detalles": {
            detalle
        }
    }
    await time(300)
    console.log(json)
    const { data } = await axios.post('https://codigomarret.online/facturacion/firmar_xml?empresa='+empresa, json)
    console.log(data)
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
    if(cedula == "9999999999999"){
        return "07"
    }else if(cedula.length == 10){
        return "05"
    }else if(cedula.length == 13){
        return "04"
    }
}

export const time = time => new Promise(resolve => setTimeout(resolve, time));
