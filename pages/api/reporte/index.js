import empty from 'is-empty';
import bcrypt from 'bcrypt'
import { db } from '../../../function/util/database';

export default async (req, res) => {

    switch (req.method) {
        case 'POST':
            await CrearVenta(req, res)
            break;
        case 'GET':
            await ListarVanta(req, res)
            break;
        case 'PUT':
            await ActualizarVentaSecuencial(req, res)
            break;
        case 'DELETE':
            await CambiarEstadoUsuarioInactivo(req, res)
            break;
        default:
            break;
    }
}
const ListarVanta = async (req, res) => {
    try {
        const { empresa, fecha } = req.query
        let sql = `SELECT secuencia, fecha_creacion, empresa, sum(precio_venta * cantidad) AS total, estado, forma_pago FROM esq_reporte.reporte  WHERE empresa = '${empresa}' AND fecha_creacion = '${fecha}' GROUP BY secuencia, empresa, fecha_creacion, estado, forma_pago`;
        db.query(sql).then((response) => {
            if (!empty(response.rows[0])) {
                res.status(200).json({ success: true, data: response.rows })
            } else {
                res.status(200).json({ success: false })
            }
        }).catch((err) => {
            console.log("Error", err);
        })
    } catch (error) {
        console.log("Listarusuario", error)
    }
}
const ActualizarVentaSecuencial = async (req, res) => {
    try {
        const { editar, forma_pago, estado } = req.body;
        const { secuencia, empresa } = editar
        if(!empty(forma_pago) && !empty(estado)){
            let sql = `UPDATE esq_reporte.reporte SET forma_pago = '${forma_pago}', estado = '${estado}' WHERE empresa = '${empresa}' AND secuencia = '${secuencia}'`;
            db.query(sql).then((response) => {
                if (!empty(response.rows[0])) {
                    res.status(200).json({ success: true, data: response.rows })
                } else {
                    res.status(200).json({ success: false })
                }
            }).catch((err) => {
                console.log("Error", err);
            }) 
        }else if(!empty(estado)){
            let sql = `UPDATE esq_reporte.reporte SET estado = '${estado}'  WHERE empresa = '${empresa}' AND secuencia = '${secuencia}'`;
            db.query(sql).then((response) => {
                if (!empty(response.rows[0])) {
                    res.status(200).json({ success: true, data: response.rows })
                } else {
                    res.status(200).json({ success: false })
                }
            }).catch((err) => {
                console.log("Error", err);
            })
        }else if(!empty(forma_pago)){
            let sql = `UPDATE esq_reporte.reporte SET forma_pago = '${forma_pago}'  WHERE empresa = '${empresa}' AND secuencia = '${secuencia}'`;
            db.query(sql).then((response) => {
                if (!empty(response.rows[0])) {
                    res.status(200).json({ success: true, data: response.rows })
                } else {
                    res.status(200).json({ success: false })
                }
            }).catch((err) => {
                console.log("Error", err);
            })
        }
    } catch (error) {
        console.log("ActualizarVentaSecuencial",error);
    }
}
async function CrearVenta(req, res) {
    const { empresa, tienda, secuencial, fecha, forma_pago, estado } = req.body;
    var count = 0;
    for (var index = 0; index < tienda.length; index++) {
        let producto = tienda[index].producto;
        let precio_venta = tienda[index].precio_venta;
        let cantidad = tienda[index].cantidad;
        let sql = `INSERT INTO esq_reporte.reporte (secuencia, producto, precio_venta, cantidad, fecha_creacion, empresa, forma_pago, estado ) 
        VALUES ('${secuencial}','${producto}','${precio_venta}','${cantidad}','${fecha}','${empresa}','${forma_pago}','${estado}')`;
        db.query(sql).then((response) => {
            if (!empty(response.rows)) {
               count += 1
            } else {
                res.status(200).json({ success: false })
            }
        }).catch((err) => {
            console.log("Error", err);
        })
    }
    if(index === tienda.length){
        res.json({
            success:true,
            msg:'Se registro correctamente la Factura',
            items: "item registrado "+count
        })
    }else{
        console.log("error")
    }
}