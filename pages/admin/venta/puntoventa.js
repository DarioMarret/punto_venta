import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Col, Container, Row, Table, Form, Modal as ModalSpinner } from "react-bootstrap";
import { Modal, Spin } from 'antd'
import Admin from "layouts/Admin.js";
import "assets/css/PuntoVenta.css";
import { DOCUMENTO, host } from "../../../function/util/global";
import moment from "moment";
import axios from "axios";
import { functionPorcentaje, functionTotal, getDatosUsuario, getVerTienda, LimpiarStoreDespuesDenviar, TiendaIten } from "../../../function/localstore/storeUsuario";

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

    const [Formato, setFormato] = useState(null)
    const inputrefLimpiar = useRef(null);
    const [tikect, settikect] = useState(false)
    const [formaPago, setformaPago] = useState([]);
    const [resultadoSearch, setresultadoSearch] = useState([]);
    const [dataCliente, setdataCliente] = useState("getDatosCliente()");
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
        subTotal_12: null,
        Total: functionTotal(),
    })

    async function EnviarFactura() {
       
        let tienda = getVerTienda()
        let empresa = getDatosUsuario().data.empresa
        setcargando(true)
        let secuencial = NumeroAleatorio()
        let fecha = moment().format("DD/MM/YYYY");
        console.log(fecha)
        await axios.post('http://localhost:8000/imprimir/tikect',{secuencial, tienda, empresa, fecha})
        const { data } = await axios.post(`${host}/v1/crear_venta`,{tienda, empresa, secuencial, fecha})
        if (data.success) {
            LimpiarStoreDespuesDenviar()
            setTabla([])
            setcargando(false)
            setTotalesFacturacion({
                subTotal_12: null,
                Total: functionTotal(),
            })
        }
    }

    const NumeroAleatorio=()=>{
        const r = Math.random()*(10000000-99999999) + 99999999
        return Math.floor(r)
    }
    
    useEffect(async () => {
        // setformaPago(await ListarFormasPagos())
    }, [])
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
            var cedula = e.target.value;
            if (cedula.length == 10) {
                const response = await ObtenerCliente(cedula)
                if (response) {
                    setDatosCliente(response.data[0]);
                    setdataCliente(getDatosCliente())
                }
            } else if (cedula.length == 13 && cedula.indexOf("001", 10)) {
                const response = await ObtenerCliente(cedula);
                if (response) {
                    setDatosCliente(response.data[0]);
                    setdataCliente(getDatosCliente())
                }
            }
        }

        function limpiar() {
            inputrefLimpiar.current.value = ""
            setDatosCliente(null);
            setdataCliente(null)
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
                setTotalesFacturacion( { subTotal_12: functionPorcentaje(), Total: functionTotal() })
            }

        }
        async function LimpiarById(itens) {
            let id = itens.id
            setTabla(await LimpiarAcumuladorById(id, itens))
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
        }
        async function Agregar(id,id_categoria,producto,precio_venta) {
            let cantidad = 1
            setTabla(await TiendaIten({id,id_categoria,producto,precio_venta,cantidad}, "sumar"))
            setTotalesFacturacion( { subTotal_12: functionPorcentaje(), Total: functionTotal() })
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
        return (
            <>
            <div style={{padding: "30px" }}/>
                <Container fluid>
                    <SpinnerCargando visible={cargando} />
                    <Row>
                        <Col lg={8}>
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
                        <Col lg={4}>
                            <div className="content-info-cliente">
                                <Col md={12} className="" style={{ background: 'rgba(163, 158, 158)', height: '50px', display: 'table', borderRadius: '2px' }}>
                                    <p style={{ display: 'table-cell', verticalAlign: 'middle', fontFamily: 'bold' }}> Datos Del Cliente </p>
                                </Col>
                                <div className="content-body-cliente">
                                    <Col lg={6}>
                                        <select name="documento" id="documento" className="form-control">
                                            {
                                                DOCUMENTO.map((iten, index) => (
                                                    <option key={index} value={iten.codigo}>{iten.forma}</option>
                                                ))
                                            }
                                        </select>
                                    </Col>
                                    <Col lg={5}>
                                        <select name="forma_pago" id="forma_pago" className="form-control" onChange={(e) => getLocalStoraFormaPaga(e.target.value)} >
                                            <option value={null}>Forma de pago</option>
                                            {/* {
                                                formaPago ? 
                                                formaPago.map( (iten, index)=>(
                                                <option key={index} value={iten.codigo}>{iten.forma_pago}</option>
                                                )): ''
                                            } */}
                                        </select>
                                    </Col>
                                    <Col lg={6}> <input type="text" className="form-control" value={"getDatosUsuario().empresa"} disabled /></Col>
                                    <Col lg={2}><input type="text" className="form-control text-center" value={"estable"} disabled /> </Col>
                                    {/* <Col lg={3}><input type="text" className="form-control text-center" disabled value={Fecha()}/></Col> */}
                                    <Col lg={7}><input type="text" ref={inputrefLimpiar} className="form-control" placeholder="Buscar cliente por ruc o cedula" onChange={(e) => ValidarRuc(e)} /> </Col>
                                    <Col lg={4}><input type="button" className="form-control" value="Limpiar" onClick={() => limpiar()} /></Col>
                                    <Col lg={11}>
                                        {
                                            dataCliente != null ? <input type="text" className="form-control text-center" value={dataCliente.cedula} disabled />
                                                : <input type="text" className="form-control text-center" value="" disabled />
                                        }
                                    </Col>
                                    {/* <Col lg={4}>  <input type="button" className="form-control" value="Crear" /> </Col> */}
                                    <Col lg={10}>
                                        <input type="text" className="form-control"
                                            value={
                                                dataCliente != null ? dataCliente.apellidos + " " + dataCliente.nombres : "SIN RAZON COMERCIAL"
                                            }
                                            disabled
                                        />
                                    </Col>
                                    <Col lg={1}> <input type="button" className="form-control btn-default" /></Col>
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
                                                <td> <b>{"0.0"}</b> </td>
                                                <td> <b>{"0.0"}</b> </td>
                                                <td> <b>{TotalesFacturacion.Total}</b> </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <div className="d-flex justify-content-end">
                                        {/* <Button className="" variant="default" onClick={() => console.log("hola")}>Guardar Firmar y Enviar</Button> */}
                                        <Button className="" variant="default" onClick={() => EnviarFactura()}>Guardar</Button>
                                        {/* <Button className="" variant="default" onClick={()=>ModalTikect("no")}>Imprimir y Guardar</Button> */}

                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* <ModalRemover show={show}>
                        <Row>
                            <Card>
                                <Card.Body>
                                    <Form action="#" method="#">
                                        <Row className="d-flex justify-content-between">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Codigo</label>
                                                    <Form.Control disabled type="text" name="codigoPrincipal" value={"ProductoFactura.codigoPrincipal"}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Producto Materia</label>
                                                    <Form.Control placeholder="Materia Prima" name="descripcion" type="text" disabled value={"ProductoFactura.descripcion"}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Cantidad</label>
                                                    <Form.Control placeholder="Cantidad Inicial" type="number" name="cantidad" onChange={() => console.log("hola")}></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Precio Unitario</label>
                                                    <Form.Control className="text-center" type="text" name="precio_unitario" onChange={() => console.log("hola")} ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <br />
                                    <div className="d-flex justify-content-between">
                                        <Button variant="default" onClick={() => console.log("hola")}> Cerrar </Button>
                                        <Button variant="default" onClick={() => console.log("hola")}> Registrar Producto </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Row>
                    </ModalRemover> */}
                </Container>
            </>
        );
    }

puntoventa.layout = Admin;
export default puntoventa;