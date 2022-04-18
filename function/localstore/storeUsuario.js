import { DescryptCualquierDato, EncryptCualquierDato } from "../util/ecrypt";
import { usuario_local } from "../util/global";


export function setDatosUsuario(data) {
    try {
        const strings = JSON.stringify(data)
        const use = EncryptCualquierDato(strings);
        localStorage.setItem(usuario_local,use)
        return true;
    } catch (error) {
        console.log(error);
    }
  }
export function getDatosUsuario() {
    try {
        const parse =DescryptCualquierDato(localStorage.getItem(usuario_local))
        const datos_usuario = JSON.parse(parse)
        return datos_usuario;
    } catch (error) {
        console.log(error);
    }
}
export function removeDatosUsuario() {
    try {
        localStorage.removeItem(usuario_local)
        return true;
    } catch (error) {
        console.log(error);
    }
}

var PViten = []
export async function TiendaIten(ProductoVenta, options){
    await VerTienda()
    const existe = PViten.some(iten => iten.id === ProductoVenta.id)
    if(existe){
        //Actualizar Cantidad
        let x = options
        const Product = PViten.map(iten =>{
            if(iten.id === ProductoVenta.id){
                x == "sumar" ? iten.cantidad++ :iten.cantidad--;
                return iten; //retorna la cantidad actualizada
            }else{
                return iten; //retorna los objetos que no son actualizado
            }
        })
        PViten = [...Product];
        window.localStorage.setItem('tienda:',JSON.stringify(PViten))
        let array = JSON.parse(window.localStorage.getItem('tienda:'))
        // Acumuladores(ProductoVenta, options)
        return array
    }else{
        let x = options
        //Agregamos a la tienda
        window.localStorage.setItem('tienda:',JSON.stringify([...PViten,ProductoVenta]))
        let array = JSON.parse(window.localStorage.getItem('tienda:'))
        //Acumuladores(ProductoVenta, x)
        return array
    }
}
async function VerTienda() {
    try {
        let iten = JSON.parse(window.localStorage.getItem('tienda:'));
        if(iten !== null){
            PViten = iten;
        }
    } catch (error) {
        console.log(error)
    }
}
export async function LimpiarAcumuladorById(id){
    let iten = JSON.parse(localStorage.getItem('tienda:'));
    if(iten !== null) {
        let Cost = []
        Cost = iten.filter(tienda=> tienda.id !== id)
        localStorage.setItem('tienda:',JSON.stringify(Cost));
        return getVerTienda()

    }
}
export function functionPorcentaje(){
    // try {
    //     let iten = localStorage.getItem('tienda:')
    //     if(iten !== null){
    //         let iva = JSON.parse(iten);
    //         let  = 0;
    //         iva.map(iten => {
    //             if(iten.impuesto_iva.codigo_impuesto_iva != 2){
    //                 totalIVA12 += iten.total_iva
    //             }
    //         })
    //         return totalIVA12
    //     }else{
    //         return 0
    //     }
    //  } catch (error) {
    //     console.log(error)
    //  }
}
export function functionTotal(){
    try {
        let iten = localStorage.getItem('tienda:')
        if(iten !== null){
            let iva = JSON.parse(iten);
            let total = 0;
            iva.map(iten => {
                total += parseFloat(iten.precio_venta) * iten.cantidad
            })
            return total.toFixed(2)
        }else{
            return 0
        }
     } catch (error) {
        console.log(error)
     }
}
export function getVerTienda() {
    try {
        let iten = JSON.parse(window.localStorage.getItem('tienda:'));
        if(iten !== null && iten !== 'NaN'){
            PViten = [];
            return PViten = iten;
        }else{
            PViten = [];
            return window.localStorage.removeItem('tienda:')
        }
    } catch (error) {
        console.log(error);
    }
}

export function LimpiarStoreDespuesDenviar(){
    localStorage.removeItem('tienda:')
    getVerTienda()
}