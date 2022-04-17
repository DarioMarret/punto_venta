import { db } from '../../../function/util/database';
import empty from 'is-empty';
import bcrypt from 'bcrypt'

export default async (req, res) => {

    switch (req.method) {
        case 'POST':
            await ListarProductoConsiDencia(req, res)
            break;
        case 'GET':
            await Listarusuario(req, res)
            break;
        case 'PUT':
            await ActualizarUsuario(req, res)
            break;
        case 'DELETE':
            await CambiarEstadoUsuarioInactivo(req, res)
            break;
        default:
            break;
    }
}
async function ListarProductoConsiDencia(req, res){
    try {
        const { empresa, busqueda } = req.body;
        let coinsi = busqueda.toLowerCase()
        let sql = `SELECT id, id_categoria, producto, precio_venta, porcentaje_iva, estado FROM esq_productos.producto WHERE (producto LIKE '%${coinsi}%') AND empresa = '${empresa}' AND estado = 'A' LIMIT 10`;
        db.query(sql).then((response)=>{
            console.log(response.rows);
            if(!empty(response)){
                res.json({
                    success: true,
                    data: response.rows,
                    msg:'ListarProductoConsiDencia',
                })
            }else{
                res.json({ success: false, msg: "no se encontro coinsidencia"})
            }
        }).catch((err)=>{
            console.log("Error", err);
            res.json({ success: false, msg: err})
        })
    } catch (error) {
        console.log(error)
    }
}