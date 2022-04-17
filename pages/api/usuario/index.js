import sequelize from 'sequelize';
import db from '../../../db/sequelizedb'
import empty from 'is-empty';
import bcrypt from 'bcrypt'

const usuario_token = "token_usuario:"
const usuario_local = "usuario:"
export default async (req, res)=>{
    try {
        const { usuario, contracena } = req.body;
        let sql = `SELECT * FROM esq_usuario.usuario WHERE usuario = '${usuario}'`;
        db.query(sql,{type: sequelize.QueryTypes.SELECT}).then((response)=>{
            console.log(response);
            if(!empty(response[0])){
                const x = bcrypt.compare(contracena, response[0].contracena)
                if(x){
                    res.json({
                        data: response[0],
                        success: true,
                        msg: 'Bienvenido ' + response[0].usuario
                    }) 
                }else{
                    res.status(401).json({
                        success: false,
                        msg: "Contraceña incorrecta"
                    })
                }
            }else{
                res.status(401).json({
                    success: false,
                    msg: "usuario incorrecta"
                })
            }
        }).catch((err)=>{
            console.log("Error", err);
        })
    } catch (error) {
        console.log(error);
    }
}

// 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
//git clone https://DarioMarret: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@github.com/DarioMarret/sistema_tienda.git