import sequelize from 'sequelize';
import db from '../../../db/sequelizedb'
import empty from 'is-empty';
import bcrypt from 'bcrypt'

export default async (req, res) => {

    switch (req.method) {
        case 'POST':
            await ValidarLoginInit(req, res)
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

const verificarexistencia = async (usuario, empresa) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM esq_usuario.usuario WHERE usuario = '${usuario}'`;
        db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
            console.log(response);
            if (!empty(response[0])) {
                resolve(true)
            } else {
                resolve(false)
            }
        }).catch((err) => {
            console.log("Error", err);
        })
    })
}

const ValidarLoginInit = async (req, res) => {
    const { usuario, contracena, status, perfil, empresa } = req.body;
    if (status === 'validar') {
        try {
            let sql = `SELECT * FROM esq_usuario.usuario WHERE usuario = '${usuario}'`;
            db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
                console.log(response);
                if (!empty(response[0])) {
                    const x = bcrypt.compare(contracena, response[0].contracena)
                    if (x) {
                        res.json({
                            data: response[0],
                            success: true,
                            msg: 'Bienvenido ' + response[0].usuario
                        })
                    } else {
                        res.status(401).json({
                            success: false,
                            msg: "Contraceña incorrecta"
                        })
                    }
                } else {
                    res.status(401).json({
                        success: false,
                        msg: "usuario incorrecta"
                    })
                }
            }).catch((err) => {
                console.log("Error", err);
            })
        } catch (error) {
            console.log(error);
        }
    } else if (status === 'crear') {
        try {
            const existe = await verificarexistencia(usuario, empresa)
            if (existe) {
                res.send("El usuario ya existe dentro de la empresa " + empresa)
            } else {
                let hash_clave = await bcrypt.hash(contracena, 8);
                let sql = `INSERT INTO esq_usuario.usuario (usuario, contracena, perfil, empresa, fecha_ultimo_acceso) VALUES ('${usuario}', '${hash_clave}', '${perfil}', '${empresa}', 'NOW()')`;
                db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
                    console.log(response);
                    res.json({
                        success: true,
                        msg: 'Nuevo Usuario registrado en la empresa: ' + empresa,
                    })
                }).catch((err) => {
                    res.send("server invalid state")
                })
            }
        } catch (error) {
            console.log(error);
        }
    }
}
const Listarusuario = async (req, res) => {
    try {
        const { empresa } = req.query
        let sql = `SELECT * FROM esq_usuario.usuario WHERE empresa = '${empresa}'`;
        db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
            if (!empty(response[0])) {
                res.status(200).json({ success: true, data: response })
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
const ActualizarUsuario = async (req, res) => {
    try {
        const { empresa, usuario, contracena, perfil, id} = req.body
        let contr = await VerificarContracena(contracena, id)
        let sql = `UPDATE esq_usuario.usuario SET usuario = '${usuario}', perfil = '${perfil}', empresa = '${empresa}' WHERE id = '${id}'`;
        db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
            res.status(200).json({ success: true, data: response })
        }).catch((err) => {
            res.status(200).json({ success: false, data: err })
        })
    } catch (error) {
        console.log("ActualizarUsuario", error);
    }
}
const VerificarContracena = async(contracena, id)=>{
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM esq_usuario.usuario WHERE id = '${id}'`;
        db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
            console.log("VerificarContracena:1",response);
            if (!empty(response[0])) {
                const x = bcrypt.compare(contracena, response[0].contracena)
                if (x) {
                    resolve("igual")
                } else {
                    let hash_clave = bcrypt.hash(contracena, 8);
                    let sql = `UPDATE esq_usuario.usuario SET contracena = '${hash_clave}' WHERE id = '${id}'`;
                    db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
                        resolve("actualizada")  
                    })
                }
            } else {
                resolve(false)
            }
        }).catch((err) => {
            console.log("Error", err);
        })
    })
}
const CambiarEstadoUsuarioInactivo = async(req, res) => {
    try {
        const { estado, id  } = req.query
        let sql = `UPDATE esq_usuario.usuario SET estado = '${estado}' WHERE id = '${id}'`;
        db.query(sql, { type: sequelize.QueryTypes.SELECT }).then((response) => {
            res.status(200).json({ success: true, data: response })
        }).catch((err) => {
            res.status(200).json({ success: false, data: err })
        })
    } catch (error) {
        console.log("object", error);
    }
}