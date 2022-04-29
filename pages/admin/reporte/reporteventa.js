import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    NavItem,
    NavLink,
    Nav,
    Progress,
    Table,
    Container,
    Row,
    Col,
} from "reactstrap";
import Admin from "layouts/Admin.js";
import Header from "components/Headers/Header.js";
import axios from 'axios'
import { getDatosUsuario } from '../../../function/localstore/storeUsuario';
import moment from 'moment';
import Modal from 'react-modal';
import { columns, ESTADO, FORMAPAGO, host } from '../../../function/util/global';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-next-table/dist/SmartTable.css';
import TableFilter from '../../../components/Table/TableFilter';


const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
};
const options = {
    filterType: 'checkbox',
};

function reporteventa(props) {
    const [loading, setloading] = useState(true);
    const [filterText, setfilterText] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false)
    const [removeStyling, setremoveStyling] = useState(true);
    const [editar, seteditar] = useState(null);
    const [venta, setventa] = useState([]);

    function openModal(row) {
        seteditar(row)
        setIsOpen(true);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        subtitle.style.color = '#f00';
    }

    function closeModal() {
        setIsOpen(false);
    }

    useEffect(async() => {
        await CargarListaReporte()
        setTimeout(() => {
            setloading(false);
        }, 1000)
    }, []);
    const CargarListaReporte=async()=>{
        let empresa = getDatosUsuario().data.empresa
        let fecha = moment().format('DD/MM/YYYY')
        const { data } = await axios.get(`${host}/v1/listar_reporte_venta_actual?empresa=${empresa}&fecha=${fecha}`)
        if(data.success){
            // console.log(data.data)
            setventa(data.data)
        }
    }

    const handleChangeEstado = async (e) => {
        const { data } = await axios.put(`${host}/v1/actualizar_estado`,{editar, [e.target.name]:e.target.value})
        // console.log(data)
        await CargarListaReporte()
    }

    const ClickRowsCelda = (row) =>{
        openModal(row)
    } 

    const headCells = [
        { id: "secuencia", label: "SECUENCIAL", numeric: false, width: 200, click: true},
        { id: "forma_pago", label: "FORMA DE PAGO", numeric: false, width: 200},
        { id: "total", label: "TOTAL", numeric: false, width: 200},
        { id: "fecha_creacion", label: "FECHA", numeric: false, width: 200},
        { id: "empresa", label: "EMPRESA", numeric: false, width: 200},
        { id: "estado", label: "ESTADO", numeric: false, width: 200},
    ]
    return (
        <>
            <Header />
            <Card className="shadow">
                <div style={{ display: "flex" }}>
                    <h4 style={{ marginLeft: 20 }}>
                        Reporte Venta 
                    </h4>
                </div>
               <TableFilter
                headerTitle={headCells}
                data={venta}
                rowFila={10}
                onRowClick={(rows)=>ClickRowsCelda(rows)}
               />
            </Card>
            <Modal
                isOpen={modalIsOpen}
                // onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <p style={{
                    fontSize: '20px',
                    fontWeight: "bold",
                }}
                >
                Secuencia:{editar ? editar.secuencia: ''}<br></br> 
                Total: ${editar ? editar.total: ''} <br></br>
                Forma de Pago: {editar ? editar.forma_pago: ''} <br></br>
                Estado: {editar ? editar.estado: ''}</p>

                <select name="forma_pago" id="" className="form-control" onChange={(e) =>handleChangeEstado(e)}>
                    {
                        editar 
                        ?
                        FORMAPAGO.map((iten,index)=>(
                            editar.forma_pago == iten.E 
                            ? <option key={index} value={iten.E} selected={true} >{iten.E}</option>  
                            : <option key={index} value={iten.E}  >{iten.E}</option>
                        ))
                        : ''
                    }
                </select>
                &nbsp;
                <select name="estado" id="" className="form-control" onChange={(e) =>handleChangeEstado(e)}>
                    {
                        editar 
                        ?
                        ESTADO.map((iten,index)=>(
                            editar != null && editar.estado == iten.E 
                            ? <option key={index} value={iten.E} selected>{iten.E}</option>  
                            : <option key={index} value={iten.E} >{iten.E}</option>
                        ))
                        : ''
                    }
                </select>
            </Modal> 
        </>
    );
}

reporteventa.layout = Admin;
export default reporteventa;