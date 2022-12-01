import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Col, Container, Row, Table, Form, Modal as ModalSpinner } from "react-bootstrap";
import { Modal, Spin } from 'antd'
import Admin from "layouts/Admin.js";
import "assets/css/PuntoVenta.css";
import { DOCUMENTO, host, FORMAPAGO } from "../../../function/util/global";
import moment from "moment";
import axios from "axios";
import { functionPorcentajeIva, functionSubtotal, functionTotal, functionTotalIva, getDatosUsuario, getVerTienda, LimpiarAcumuladorById, LimpiarStoreDespuesDenviar, TiendaIten } from "../../../function/localstore/storeUsuario";
import { datosEmpresa, JsonStructura } from "../../../function/localstore/jsonStructura";
import isEmpty from "is-empty";



function puntoventa(props) {


    const [estable, setestable] = useState(null)
    var empresaDatos = [];
    // (async () => {
    //     empresaDatos = await ObtenerDatosEmpresa()
    //     setestable(empresaDatos.establecimiento_empresa)
    // })()

    const componentRef = useRef();
    const [tabla, setTabla] = useState(getVerTienda());
    const inputref = useRef(null);
    const [show, setShow] = useState(false);
    const [mensage, setmensage] = useState(null)
    const [cargando, setcargando] = useState(false);

    const [modalregistro, setModalRegistro] = useState(false)
    const [modalformaPago, setModalFormapago] = useState(false)

    const [Formato, setFormato] = useState(null)
    const inputrefLimpiar = useRef(null);
    const [tikect, settikect] = useState(false)
    const [formaPago, setformaPago] = useState([]);
    const [resultadoSearch, setresultadoSearch] = useState([]);
    const [dataCliente, setdataCliente] = useState({
        nombre: "",
        razon_social: "",
        fecha_nacimiento: "",
        edad: "",
        sexo:"Masculino",
        discapacidad: "NO",
        email: "",
        direccion:"",
        telefono:"",
        cedula:"" 
    })
    const [message, setMessage] = useState('')
    const [ProductoFactura, setProductoFactura] = useState({
        id: null,
        codigo: null,
        codigo_adm_ice: 0,
        codigo_adm_irbpnr: 0,
        codigo_adm_iva: 0,
        codigo_impuesto_ice: 0,
        codigo_impuesto_irbpnr: 0,
        codigo_impuesto_iva: 2,
        empresa: "getDatosUsuario().empresa",
        porcentaje_ice: 0,
        porcentaje_irbpnr: 0,
        porcentaje_iva: 0,
        precio_venta: 0,
        producto: null,
        producto_descuento: 0,
    })

    const [TotalesFacturacion, setTotalesFacturacion] = useState({
        subTotal_12: functionSubtotal(),
        iva: functionPorcentajeIva(),
        Total: functionTotal(),
    })

    async function EnviarFactura() {
       
        let tienda = getVerTienda()
        let empresa = getDatosUsuario().data.empresa
        let {numero_secuencial} = await datosEmpresa()
        let secuencial = numero_secuencial
        setcargando(true)
        let fecha = moment().format("DD/MM/YYYY");
        await JsonStructura(tienda, TotalesFacturacion, dataCliente)
        await axios.post('http://localhost:8000/imprimir/tikect',{secuencial, tienda, empresa, fecha})
        const { data } = await axios.post(`${host}/v1/crear_venta`,{tienda, empresa, secuencial, fecha})
        if (data.success) {
            LimpiarStoreDespuesDenviar()
            setTabla([])
            setcargando(false)
            setTotalesFacturacion({
                subTotal_12: functionSubtotal(),
                Total: functionTotal(),
                iva: functionPorcentajeIva(),
            })
            setModalFormapago(false)
            limpiar()
        }
    }
    
    const SpinnerCargando = () => {
        return (
            <ModalSpinner show={cargando} size="sm" onClick={() => setcargando(false)}>
                <div style={{ padding: "20px" }} />
                <Spin
                    className="loader"
                    tip="Cargando..."
                    spinning={cargando}></Spin>
                <div className="text-center" style={{ padding: "20px" }}>{mensage}</div>
            </ModalSpinner>
        )
    }

    async function ValidarRuc(e) {
        try {
            var cedula = e;
            setdataCliente({
            ...dataCliente,
                cedula:cedula
            })
            if (cedula.length == 10) {
                const {data , status} = await axios.get("https://codigomarret.online/facturacion/cedula/"+e)
                console.log(data)
                if (data.success) {
                    setdataCliente(data.data);
                }else{
                    setMessage("Numero de cedula no se encuentra en la nuestra base de datos por favor registrar")
                }
            } else if (cedula.length == 13 && cedula.indexOf("001", 10)) {
                const {data , status} = await axios.get("https://codigomarret.online/facturacion/cedula/"+e)
                if (data.success) {
                    setdataCliente(data.data);
                }else{
                    setMessage("Numero de cedula no se encuentra en la nuestra base de datos por favor registrar")
                }
            }
        } catch (error) {
            setMessage("Numero de cedula no se encuentra en la nuestra base de datos por favor registrar")
        }
    }

    function limpiar() {
        setdataCliente({
            nombre: "",
            razon_social: "",
            fecha_nacimiento: "",
            edad: "",
            sexo:"",
            discapacidad: "NO",
            email: "",
            direccion:"",
            telefono:"",
            cedula:"" 
        })
    }

        async function BuscadorHandle(event) {
            var busqueda = event.target.value;
            let empresa = getDatosUsuario().data.empresa
            const { data } = await axios.post(`${host}/v1/busqueda_coinsidencia`,{busqueda, empresa});
            if (data) {
                setresultadoSearch(data.data);
            }
        }
        async function RestarSumar(itens, options) {
            if (options == 'restar' && itens.cantidad == 1) {
                Modal.info({
                    title: 'SYSTEMABM',
                    content: 'Cantidad es ' + itens.cantidad + ' minimo requerido'
                })
            } else {
                itens["cantidad"] = 1
                setTabla(await TiendaIten(itens, options))
                setTotalesFacturacion( { subTotal_12: functionSubtotal(), Total: functionTotal(), iva: functionPorcentajeIva() })
            }

        }
        async function LimpiarById(itens) {
            let id = itens.id
            setTabla(await LimpiarAcumuladorById(id, itens))
            setTotalesFacturacion( { subTotal_12: functionSubtotal(), Total: functionTotal(), iva: functionPorcentajeIva() })
        }
        async function Agregar(id,id_categoria,producto,precio_venta) {
            let cantidad = 1
            let iva = parseFloat(precio_venta) - (parseFloat(precio_venta)/1.12)
            let subtota = parseFloat(precio_venta)/1.12
            setTabla(await TiendaIten({id,id_categoria,producto,precio_venta,cantidad, iva, subtota}, "sumar"))
            setTotalesFacturacion( { subTotal_12: functionSubtotal(), Total: functionTotal(), iva: functionPorcentajeIva() })
            inputref.current.value = ''
            inputref.current.focus()
        }


        const handleTextImput = (e) => {
            setProductoFactura({
                ...ProductoFactura,
                [e.target.name]: parseFloat(e.target.value)
            })
        }

        async function AgregarProducto(e) {
            e.preventDefault();
            if (ProductoFactura.cantidad && ProductoFactura.precio_unitario) {
                setTabla(await TiendaIten(ProductoFactura))
                setTotalesFacturacion({
                    Ice: TotalImpuestoICE().toFixed(2),
                    subTotal_12: TotalTarifa12().toFixed(2),
                    subTotal_0: TotalTarifa0().toFixed(2),
                    subTotal_iva: TotalImpuestoIVA().toFixed(2),
                    Descuento: DescuentosTotal().toFixed(2),
                    Total_irbpnr: TotalImpuestoIRBPNR().toFixed(2),
                    Total_sin_impuesto: ImporteTotal().toFixed(2),
                    Total: (TotalImpuestos() + ImporteTotal()).toFixed(2),
                })
                setShow(false)
            }
        }

        async function RegistrarContinual(){
            // if(!isEmpty(dataCliente.cedula) && !isEmpty(dataCliente.nombre) && !isEmpty(dataCliente.direccion) && !isEmpty(dataCliente.telefono) && !isEmpty(dataCliente.email) ){
                try {
                    const { data } = await axios.post("https://codigomarret.online/facturacion/cedula",{
                        "razon_social": dataCliente.nombre,
                        "nombre": dataCliente.nombre,
                        "fecha_nacimiento": dataCliente.fecha_nacimiento,
                        "edad": dataCliente.edad,
                        "sexo": dataCliente.sexo,
                        "discapacidad": dataCliente.discapacidad,
                        "email": dataCliente.email,
                        "direccion": dataCliente.direccion,
                        "telefono": dataCliente.telefono,
                        "cedula": dataCliente.cedula  
                    })
                    if (data.success == false && data.message == "La cedula ya se encuentra registrada") {
                        setMessage("La cedula ya se encuentra registrada")
                        setModalRegistro(!modalregistro)
                        setModalFormapago(!modalformaPago)
                        const { data } = await axios.put("https://codigomarret.online/facturacion/cedula_refrescar",{
                            "razon_social": dataCliente.nombre,
                            "nombre": dataCliente.nombre,
                            "fecha_nacimiento": dataCliente.fecha_nacimiento,
                            "edad": dataCliente.edad,
                            "sexo": dataCliente.sexo,
                            "discapacidad": dataCliente.discapacidad,
                            "email": dataCliente.email,
                            "direccion": dataCliente.direccion,
                            "telefono": dataCliente.telefono,
                            "cedula": dataCliente.cedula  
                        })
                    }else{
                        setMessage("Cliente registrado correctamente")
                        setModalRegistro(!modalregistro)
                        setModalFormapago(!modalformaPago)
                    }
                } catch (error) {
                    setMessage("Error por favor vuelva a intentar")
                }

            // }else{
            //     setMessage("Por favor complete los campos")
            // }
        }

        function handleTextImputCliente(e){
            setdataCliente({
                ...dataCliente,
                [e.target.name]: e.target.value
            })
        }

        return (
            <>
            <div style={{padding: "30px" }}/>
                <Container fluid>
                    <SpinnerCargando visible={cargando} />
                    <Row>
                        <Col lg={12}>
                            <div className="content-info-cliente">
                                <div className="search">
                                    <i className="bi-search"></i>
                                    <input type="text" ref={inputref} placeholder="Buscar producto" className="form-control" onChange={(event) => BuscadorHandle(event)} />
                                    <i className="bi-crop"></i>
                                </div>
                                <div className="container-productos">
                                    <Row>
                                        {resultadoSearch != null
                                            ? resultadoSearch.map((iten, index) => (
                                                <div
                                                    className="items entrada" key={index}
                                                    onClick={() => Agregar(
                                                        iten.id,
                                                        iten.id_categoria,
                                                        iten.producto,
                                                        iten.precio_venta,
                                                    )}
                                                >
                                                    <p>
                                                        <br />
                                                        {iten.producto} <br />
                                                        {iten.precio_venta}
                                                    </p>
                                                </div>
                                            ))
                                            : ""}
                                    </Row>
                                </div>
                            </div>
                        </Col>

                        <Col lg={12}>
                            <Card>
                                <Card.Body>
                                    <Table className="table-hover table-striped w-full">
                                        <thead>
                                            <tr>
                                                <th>Quitar</th>
                                                <th>cambiar</th>
                                                <th>Cantidad</th>
                                                <th>Producto</th>
                                                <th>Precio</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                  tabla ?
                                                  tabla.map((itens, index)=>(
                                                  <tr className="entrada" key={index} id={":"+itens.id} >
                                                      <td className="" style={{cursor: "pointer"}} onClick={()=>LimpiarById(itens)}>Quitar</td>
                                                      <td className="d-flex justify-content-around" >
                                                      <div style={{cursor: "pointer"}} onClick={()=>RestarSumar(itens, "sumar")} >
                                                      <i className="nc-icon nc-simple-add icon-bold" style={{fontSize:20}}>+</i>
                                                      </div>
                                                      <div style={{cursor: "pointer"}} onClick={()=>RestarSumar(itens, "restar")}>
                                                      <i className="nc-icon nc-simple-delete icon-bold" style={{fontSize:20}}>-</i>
                                                      </div>
                                                      </td>
                                                      <td className=""> {itens.cantidad} </td>
                                                      <td className=""> {itens.producto} </td>
                                                      <td className=""> {'$'+ itens.precio_venta} </td>
                                                      <td className=""> {'$'+ (itens.precio_venta * itens.cantidad).toFixed(2)} </td>
                                                  </tr>
                                                  )):''
                                            }
                                            <tr>
                                                <td>  </td>
                                                <td>  </td>
                                                <td>  </td>
                                                <td> <b>SUBTOTAL 12%</b> </td>
                                                <td> <b>IVA 12%</b> </td>
                                                <td> <b>TOTAL</b> </td>
                                            </tr>
                                            <tr>
                                                <td> </td>
                                                <td> </td>
                                                <td> </td>
                                                <td> <b>${TotalesFacturacion.subTotal_12}</b> </td>
                                                <td> <b>${TotalesFacturacion.iva}</b> </td>
                                                <td> <b>${TotalesFacturacion.Total}</b> </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <div className="d-flex justify-content-end">
                                        {/* <Button className="" variant="default" onClick={() => EnviarFactura()}>Guardar</Button> */}
                                        <Button className="" variant="default" onClick={() => setModalRegistro(!modalregistro)}>PAGAR</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <ModalSpinner 
                        show={modalregistro}
                        onHide={() => setShow(!show)}
                        title="Pagar"
                        size="lg"
                    >
                        <Row>
                            <Card>
                                <Card.Body>
                                    <Form action="#" method="#">
                                        <Col>
                                            <h2>Ingrese Datos de Cliente</h2>
                                        </Col>
                                        <Row className="d-flex justify-content-between">
                                            <Col md={4}>
                                                <Form.Group>
                                                    <label>Cedula / Ruc</label>
                                                    <input type="text" name="cedula"
                                                    placeholder="Ruc"
                                                     className="form-control" 
                                                     value={dataCliente.cedula}
                                                     onChange={(event) => {
                                                         ValidarRuc(event.target.value),
                                                         setMessage('')
                                                     }} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={8}>
                                                <Form.Group>
                                                    <label>Nombre Completo</label>
                                                    <Form.Control placeholder="" type="text" name="nombre" 
                                                    value={dataCliente.nombre} onChange={(e)=>setdataCliente({...dataCliente, nombre: e.target.value})}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            {/* <Col md={3}>
                                                <Form.Group>
                                                    <label>Fecha nacimiento</label>
                                                    <Form.Control className="text-center" type="date" name="fecha_nacimiento" 
                                                    value={dataCliente.fecha_nacimiento} 
                                                    onChange={(e)=>setdataCliente({...dataCliente, fecha_nacimiento: e.target.value})}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <label>Edad</label>
                                                    <Form.Control className="text-center" type="number" name="edad" 
                                                    value={dataCliente.edad} 
                                                    onChange={(e)=>setdataCliente({...dataCliente, edad: e.target.value})}></Form.Control>
                                                </Form.Group>
                                            </Col> */}
                                            {/* <Col md={3}>
                                                <Form.Group>
                                                    <label>Sexo</label>
                                                    <select
                                                    className="form-control text-center"
                                                        value={dataCliente.sexo} 
                                                        onChange={(e)=>setdataCliente({...dataCliente, sexo: e.target.value})}
                                                    >
                                                        <option>Masculino</option>
                                                        <option>Femenino</option>
                                                    </select>
                                                </Form.Group>
                                            </Col> */}
                                            {/* <Col md={3}>
                                                <Form.Group>
                                                    <label>Discapacidad</label>
                                                    <select
                                                    className="form-control text-center"
                                                        value={dataCliente.discapacidad} 
                                                        onChange={(e)=>setdataCliente({...dataCliente, discapacidad: e.target.value})}
                                                    >
                                                        <option>NO</option>
                                                        <option>SI</option>
                                                    </select>
                                                </Form.Group>
                                            </Col> */}
                                            <Col md={4}>
                                                <Form.Group>
                                                    <label>Telefono</label>
                                                    <Form.Control className="text-center" type="text" name="telefono" 
                                                    value={dataCliente.telefono} 
                                                    onChange={(e)=>setdataCliente({...dataCliente, telefono: e.target.value})}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={8}>
                                                <Form.Group>
                                                    <label>Email</label>
                                                    <Form.Control className="text-center" type="text" name="email" 
                                                    value={dataCliente.email} 
                                                    onChange={(e)=>setdataCliente({...dataCliente, email: e.target.value})}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <label>Direccion</label>
                                                    <Form.Control className="text-center" type="text" name="direccion" 
                                                    value={dataCliente.direccion} 
                                                    onChange={(e)=>setdataCliente({...dataCliente, direccion: e.target.value})}></Form.Control>
                                                    <p
                                                        style={{
                                                            color:"red",
                                                            fontSize:17
                                                        }}
                                                    >{message}</p>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <br />
                                    <div className="d-flex justify-content-between">
                                        <Button variant="default" onClick={() => setModalRegistro(!modalregistro)}> Cerrar </Button>
                                        <Button variant="default" onClick={() => RegistrarContinual()}> Registrar y continuar </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Row>
                    </ModalSpinner>
                    <ModalSpinner 
                        show={modalformaPago}
                        onHide={() => setModalFormapago(!modalformaPago)}
                        title="Pagar"
                        size="lg"
                    >
                        <Row>
                            <Card
                                style={{
                                    width: "100%"
                                }}
                            >
                                <Card.Body>
                                    <Form action="#" method="#">
                                    <Col md={12}>
                                            <h2>Forma de Pago</h2>
                                        </Col>
                                        <Row className="d-flex justify-content-between">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <select
                                                    className="form-control text-center"
                                                    >
                                                        <option>Selecione una forma de pago</option>
                                                        {
                                                            FORMAPAGO.map((item, index) => (
                                                                <option key={index}>{item.E}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <br />
                                    <div className="d-flex justify-content-between">
                                        <Button variant="default" onClick={() => setModalFormapago(!modalformaPago)}> Cerrar </Button>
                                        <Button variant="default" onClick={() => EnviarFactura()}> PAGAR </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Row>
                    </ModalSpinner>
                </Container>
            </>
        );
    }

puntoventa.layout = Admin;
export default puntoventa;