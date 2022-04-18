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
// layout for this page
import Admin from "layouts/Admin.js";
import Header from "components/Headers/Header.js";
import axios from 'axios'
// import TextField from "@material-ui/core/TextField"
import { getDatosUsuario } from '../../../function/localstore/storeUsuario';
import moment from 'moment';
import Modal from 'react-modal';
// import MUIDataTable from "mui-datatables";
import { columns, ESTADO, FORMAPAGO, host } from '../../../function/util/global';
import { TablePaging } from 'table-page-search';

const headerConfig = {
  key: "id",
  itemsPerPage: 8,
  defaultSort: "lastName",
  sortDescending: true,
  columns: [
      { fieldForSort: "secuencia", columnLabel: "SECUENCUAL", headerCellStyle:{width:80}, disableCellClick: false },
      { fieldForSort: "forma_pago", columnLabel: "FORMA DE PAGO", disableCellClick: true },
      { fieldForSort: "total", columnLabel: "TOTAL", disableCellClick: true },
      { fieldForSort: "fecha_creacion", columnLabel: "FECHA", disableCellClick: true },
      { fieldForSort: "empresa", columnLabel: "EMPRESA", disableCellClick: true },
      { fieldForSort: "estado", columnLabel: "ESTADO", disableCellClick: false},
  ]
};
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
    const [editar, seteditar] = useState({
        secuencia: null,
        forma_pago: null,
        total: null,
        fecha_creacion: null,
        estado: null,
        empresa: null,
    });
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
            setventa(data.data)
        }
    }
    const handleChange = (value) => {
        console.log(value);
        setfilterText(value);
    };
    const handleChangeEstado = async (e) => {
        const { data } = await axios.put(`${host}/v1/actualizar_estado`,{editar, [e.target.name]:e.target.value})
        console.log(data)
        await CargarListaReporte()
    }
    return (
        <>
            <Header />
            {/* <div style={{padding:'60px'}}/> */}
            <Card className="shadow">
                <div style={{ display: "flex" }}>
                    <h4 style={{ marginLeft: 20 }}>
                        Reporte Venta 
                    </h4>
                    {/* <TextField
                        label="Buscador"
                        style={{ marginLeft: 40 }}
                        vaule={filterText}
                        onChange={(e) => handleChange(e.target.value)}
                    /> */}
                </div>
                {/* <MUIDataTable
                    title={"Reporte Venta"}
                    data={venta}
                    columns={columns}
                    options={options}
                    onRowClick={(rows)=>console.log(rows)}
                    /> */}
                <TablePaging
                    loading={loading}
                    dataList={venta}
                    headerConfig={headerConfig}
                    filterText={filterText}
                    onRowClick={(row)=>openModal(row)}
                    tableStyleName={removeStyling ? "" : "stripe-table"}
                    useMaterialUiPaging={true} /> 
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
                Secuencia:{editar.secuencia}<br></br> 
                Total: ${editar.total} <br></br>
                Forma de Pago: {editar.forma_pago} <br></br>
                Estado: {editar.estado}</p>

                <select name="forma_pago" id="" className="form-control" onChange={(e) =>handleChangeEstado(e)}>
                    {
                        FORMAPAGO.map((iten,index)=>(
                            editar.forma_pago == iten.E ?
                            <option key={index} value={iten.M} selectd >{iten.E}</option>  
                            : <option key={index} value={iten.M} selectd >{iten.E}</option>
                        ))
                    }
                </select>
                <select name="estado" id="" className="form-control" onChange={(e) =>handleChangeEstado(e)}>
                    {
                        ESTADO.map((iten,index)=>(
                            editar.estado == iten.E ?
                            <option key={index} value={iten.M} selected >{iten.E}</option>  
                            : <option key={index} value={iten.M} selected >{iten.E}</option>
                        ))
                    }
                </select>
            </Modal> 
        </>
    );
}

reporteventa.layout = Admin;
export default reporteventa;