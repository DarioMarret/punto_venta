import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
// import { getDatosUsuario,getTokenUsuarioEncryp } from 'res/usuario/usuario';
import axios from 'axios';
// import { host } from 'res/global';
import { getDatosUsuario  } from "../../../function/localstore/storeUsuario";
import { Fecha } from "../../../function/hora/fechas";
import {Modal as ModalAntd} from 'antd';
import fileDownload from 'js-file-download'
import Header from "components/Headers/Header.js";
import Admin from "layouts/Admin.js";
import { host } from '../../../function/util/global';

function caja(props) {
    const [ModalIngreso, setModalIngreso] = useState(false)
    const [ModalRetiro, setModalRetiro] = useState(false)
    const [ModalCuadre, setModalCuadre] = useState(false)
    const [ListaIngreso, setListaIngreso] = useState([])
    const [ListaRetiro, setListaRetiro] = useState([])
    const [efectivo, setefectivo] = useState(null)
    const [conteo, setconteo] = useState(null);
    const [perfil, setperfil] = useState(null)
    const [movimiento, setmovimiento] = useState({
        detalle:null,
        usuario: getDatosUsuario().data.usuario,
        ingreso: 0,
        salida: 0,
        fecha: Fecha("DD/MM/YYYY"),
        empresa: getDatosUsuario().data.empresa,
    })
    const [Select, setSelect] = useState(null);
    const [ActualizarC, setActualizarC] = useState(false)   
    const [listM, setlistM] = useState(null);

    useEffect(() => {
        (async()=>{
            await ListarTotalCaja()
            await ListarMovimientos()
        })()
    }, [])
    async function ListarTotalCaja(){
        try {
            let fecha_ini = Fecha("DD/MM/YYYY")
            let fecha_fin = Fecha("DD/MM/YYYY")
            let empresa = getDatosUsuario().data.empresa
            const { data } = await axios.post(`${host}/v1/listar_caja`,{empresa, fecha_ini,fecha_fin, estado:"ACTIVO"})
            console.log(data);
            if(data.success){
                setefectivo(data.data[0].cuadre_total)
            }else{
                setefectivo(0)
            }
        } catch (error) {
            console.log("ListarTotalcaja", error)
        }
    }
    async function ListarMovimientos(){
        try {
            let empresa = getDatosUsuario().data.empresa
            const { data } = await axios.get(`${host}/v1/listar_movimiento?empresa=${empresa}&estado=ACTIVO`)
            // const { data } = await axios.get(`http://localhost:5000/v1/listar_movimiento?empresa=${empresa}&estado=${estado}`)
            console.log(data);
            if(data.success){
                setlistM(data.data)
            }else{
                setlistM(null)
            }
        } catch (error) {
            console.log("ListarTotalcaja", error)
        }
    }
    async function CuadrarCaja(){
      try {
        if(conteo){
            let fecha_cuadre = Fecha("DD/MM/YYYY")
            let empresa = getDatosUsuario().data.empresa 
            let usuario = getDatosUsuario().data.usuario
            let estado = "ACTIVO"
            await axios.post(`${host}/v1/cuadre_caja`,{fecha_cuadre, empresa, usuario, estado, conteo})
            await ListarTotalCaja()
        }else{
            alert("Error")
        }
      } catch (error) {
        console.log("CuadrarCaja",error)
      }  
    }
    async function RegistrarMovimiento(){
        if(movimiento.detalle !==null && movimiento.ingreso > 0 || movimiento.salida > 0 ){
            const { data } = await axios.post(`${host}/v1/ingresar_movimiento`,movimiento)
            if(data.success){
                setModalIngreso(false)
            }else{
                setModalIngreso(false)
            }
        }
    }
    async function RegistrarRetirar(){
        if(Ingreso.detalle !==null && Ingreso.cantidad > 0){
            console.log(Ingreso)
            let perfil = getDatosUsuario().perfil
            let empresa = getDatosUsuario().empresa
            const token = getTokenUsuarioEncryp();
            const { data } = await axios.post(`${host}/retirar_dinero_caja-chica`,{perfil,empresa,Ingreso},{
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:`Bearer ${token}`, 
                }
            })
            if(data.success){
                setModalRetiro(false)
                setIngreso([])
                ModalAntd.success({
                    title: 'SISTEMABM',
                    content: data.msg,
                })
                await Init()
            }else{
                setModalRetiro(false)
                setIngreso([])
                ModalAntd.error({
                    title: 'SISTEMABM',
                    content: data.msg,
                }) 
            }
        }
    }
    async function ActualizarCaja(){
        try {
            if(actualizarCaja.id !== null && actualizarCaja.cantidad > 0){
                let perfil = getDatosUsuario().perfil
                let empresa = getDatosUsuario().empresa
                const token = getTokenUsuarioEncryp();
                const {data} = await axios.post(`${host}/actualizar-cuadrando-caja`,{empresa,perfil,actualizarCaja},{
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization:`Bearer ${token}`, 
                    }
                })
                if(data){
                    await Init()
                    handleCloseActualizar()
                }
            }
        } catch (error) {
            ModalAntd.error({
                title: 'SISTEMABM',
                content: error
            })
        }
    }
    async function CambiarEstado(id, x, accion){
        var estado = x == 'A' ? 'N' : 'A';
        const perfil = getDatosUsuario().perfil
        const empresa = getDatosUsuario().empresa
        const token = getTokenUsuarioEncryp();
        if(accion === "Ingreso"){
            const {data} = await axios.post(`${host}/cambiar-estado-caja`,{empresa, perfil,estado,accion,id},{
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:`Bearer ${token}`, 
                }
            })
            data.success ? ModalAntd.success({
                title: 'SISTEMABM',
                content: data.msg
            }):ModalAntd.error({
                title: 'SISTEMABM',
                content: data.msg
            })
            await Init()
        }else{
            const {data} = await axios.post(`${host}/cambiar-estado-caja`,{empresa, perfil,estado,accion,id},{
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:`Bearer ${token}`, 
                }
            })
            data.success ? ModalAntd.success({
                title: 'SISTEMABM',
                content: data.msg
            }):ModalAntd.error({
                title: 'SISTEMABM',
                content: data.msg
            })
            await Init()
        }
    }
    function handleTextImput(e) {
        setmovimiento({
            ...movimiento,
            [e.target.name]:e.target.value
        })
    }
    function handleClose(){
        setModalIngreso(!ModalIngreso)  
    }
    function handleCloseRetiro(){
        setModalRetiro(!ModalRetiro)  
    }
    function handleCloseCuadre(){
        setModalCuadre(!ModalCuadre)  
    }
    function handleTextactualizar(e){
        setactualizarCaja({
            ...actualizarCaja,
            [e.target.name]:e.target.value
        })
    }
    function handleCloseActualizar(){
        setActualizarC(!ActualizarC)  
    }
    return (
        <>
            <Header />
            <Row >
            <Col md={12} className="text-center ">

            <Button className="btn-wd mr-1 m-2" variant="default" onClick={() =>handleCloseCuadre(true)}> Cuadre de Caja </Button>
            <Button className="btn-wd mr-1 m-2" variant="default" onClick={() =>setModalIngreso(true)}> Movimiento de Caja </Button>
            {/* <Button className="btn-wd mr-1 m-2" variant="default" onClick={() =>handleCloseRetiro()}> Retiar Dinero </Button> */}
            { perfil === "Administrador" ? <Button className="btn-wd mr-1 m-2" variant="default" onClick={() =>setActualizarC(true)}> Actualizar Caja </Button> : ''}
            <Card className="text-center">
                <Row className="d-flex justify-content-center m-2">
                    <Col lg={5} className="d-flex justify-content-center m-2">
                        <div className="bg-default" style={{ background:"#313131",width:"300px" ,height:"150px", display:'table'}}>
                            <h2 style={{display:'table-cell', verticalAlign:'middle',color:'#fff'}}>$ {efectivo != null ? efectivo : 0}</h2>
                        </div>
                    </Col>
                    <Col lg={7} className="d-flex justify-content-center m-2">
                        <p>Cuadre Anterior</p>
                    </Col>
                </Row>
            </Card>
                <Row className="position-relative justify-content-center">
                    <Col lg={6} className="position-absolute top-0 center-0">
                    <p> Movimiento de Caja</p>
                        <table responsive className="table border">
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>DETALLE</th>
                                    <th>INGRESO</th>
                                    <th>SALIDA</th>
                                    {/* <th>ACCION</th> */}
                                </tr>
                            </thead>
                            <tbody>
                            {
                                listM ?
                                listM.map((iten,index) =>(
                                    <tr key={index}>
                                        <td>{iten.fecha}</td>
                                        <td>{iten.detalle}</td>
                                        <td>${iten.ingreso}</td>
                                        <td>${iten.salida}</td>
                                        {/* <td> <button className={iten.estado === "ACTIVO" ? "btn btn-default" : "btn btn-danger"} onClick={()=>CambiarEstado(iten.id, iten.estado)}> Anular </button> </td> */}
                                    </tr>
                                )):''
                            }
                            </tbody>
                        </table>
                    </Col>
                </Row>
            </Col>
            </Row>
            <Modal show={ModalIngreso} onHide={handleClose} size="md">
                <Modal.Header>
                    <Modal.Title>Movimiento de caja</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <Form>
                        <Form.Group>
                        <select name="tipo_movimiento" id="" className="form-control" onChange={(e)=>setSelect(e.target.value)}>
                            <option value="">Seleccion tipo de movimiento</option>
                            <option value="I">Ingreso de Dinero</option>
                            <option value="S">Salida de Dinero</option>
                        </select>
                        <label>Detalle el motivo</label>
                        <textarea style={{height:"50px"}} className="form-control" name="detalle" onChange={(e)=>handleTextImput(e)}></textarea>
                        </Form.Group>
                        {
                            Select == "I" ?
                            <Form.Group>
                              <label>Cantidad Ingreso</label>
                              <Form.Control placeholder="Cantidad Inicial" type="number" name="ingreso" onChange={(e)=>handleTextImput(e)}></Form.Control>
                            </Form.Group>
                            :
                            <Form.Group>
                              <label>Cantidad Salida</label>
                              <Form.Control placeholder="Cantidad Inicial" type="number" name="salida" onChange={(e)=>handleTextImput(e)}></Form.Control>
                            </Form.Group>

                        }
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
                <Button variant="primary" onClick={()=>RegistrarMovimiento()}>
                    Registrar Movimiento
                </Button> 
                </Modal.Footer>
            </Modal>
            {/* modal Cuadre de Caja */}
            <Modal show={ModalCuadre} onHide={handleCloseCuadre} size="md">
                <Modal.Header>
                    <Modal.Title>Cuadrar Caja</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <Form>
                        <Form.Group>
                        <label>Ingrese su conteo de efectivo</label>
                        <Form.Control placeholder="Cantidad Inicial" type="number" name="conteo" onChange={(e)=>setconteo(e.target.value)} ></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseCuadre}>
                    Cerrar
                </Button>
                <Button variant="primary" onClick={()=>CuadrarCaja()}>
                    Cuadrar Caja
                </Button> 
                </Modal.Footer>
            </Modal>
            {/* modal Actualizar caja */}
            <Modal show={ActualizarC} onHide={handleCloseActualizar} size="md">
                <Modal.Header>
                    <Modal.Title className="text-center">Actualizar Caja</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <Form>
                        <Form.Group>
                        <label>Cantidad</label>
                        <Form.Control placeholder="Cantidad Inicial" type="text" name="cantidad" onChange={(e)=>handleTextactualizar(e)} ></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseActualizar}>
                    Cerrar
                </Button>
                <Button variant="primary" onClick={()=>ActualizarCaja()}>
                    Actualizar Caja
                </Button> 
                </Modal.Footer>
            </Modal>
            <div style={{padding:'80px'}}/>
        </>
    );
}

caja.layout = Admin;
export default caja;