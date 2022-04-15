import { pool } from "../../../function/util/database";
import bcrypt from 'bcrypt'

export default async (req, res) => {

    switch (req.method) {
        case 'POST':
            await ValidarLogin(req, res)
            break;
        case 'GET':

            break;
        case 'PUT':

            break;
        case 'DELETE':

            break;

        default:
            break;
    }
}

const ValidarLogin = async (req, res) =>{
    try {
        const { usuario, password, status } = req.body;
        if(status === 'validar'){
            let sql = 'SELECT * FROM tbl_usuarios WHERE usuario_usu = ?'
            pool.query(sql,[ usuario ], async (err, result) => {
                if(err) console.log(err)
                if(result.length > 0) {
                    let pass_has = result[0].password_usu
                    const x = await bcrypt.compare(password, pass_has)
                    if(x){
                        res.status(200).json({success:true,data:result[0]})  
                    }else{
                        res.json({msg:"contraceña incorrecta", success: false})
                    }
                }else{
                    res.json({msg:"usuario no existe", success: false})
                }
            })
        }
        if(status === 'crear'){
            const { usuario, password, correo, estado } = req.body;
            const existe = await verificarexistencia(usuario)
            if(existe != false){
                await res.status(200).json({msg:"Ya existe el usuario", success: false})
            }else{
                let contracena = await bcrypt.hash(password, 8);
                let sql = "INSERT INTO tbl_usuarios (usuario_usu, password_usu, correo_usu, estado_usu) VALUES (?, ?, ?, ?)";
                pool.query(sql,[ usuario, contracena, correo, estado ], async (err, result) => {
                    if(err) console.log(err)
                    if(result) {
                        res.json({...result, success: true})
                    }else{
                        res.json({success: false})
                    }
                })
            }
        }
    } catch (error) {
        console.log("ValidarLogin",error);
    }
}
const verificarexistencia = async(usuario)=>{
    return new Promise((resolve, reject) =>{
        let sql = "SELECT * FROM tbl_usuarios WHERE usuario_usu = ?";
        pool.query(sql,[usuario], async (err, result) => {
            if(err) {
                reject(err)
                console.log(err)
            }
            if(result.length > 0) {
                resolve(result)
            }else{
                resolve(false)
            }
        }) 
    })
}