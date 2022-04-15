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
import TextField from "@material-ui/core/TextField"
import { TablePaging } from 'table-page-search';


const headerConfig = {
    key: "id",
    itemsPerPage: 8,
    defaultSort: "lastName",
    sortDescending: true,
    columns: [
        { fieldForSort: "usuario", columnLabel: "Usuario", headerCellStyle:{width:80} },
        { fieldForSort: "contracena", columnLabel: "Contraceña", disableCellClick: true },
        { fieldForSort: "correo", columnLabel: "Correo", disableCellClick: true },
        { fieldForSort: "estado", columnLabel: "Estado" },
        {
            display: (row, columnConfig, onRowClick)=> `${row.lastName}, ${row.firstName}`,
            columnLabel: "Full Name"
        }
    ]
};

const users = [
    {
        "id": 0,
        "usuario": "Dario",
        "contracena": "123456789",
        "correo": "javier_dario@hotmail.com",
        "estado": "Activo"
    },
    {
        "id": 1,
        "usuario": "Javier",
        "contracena": "987456321",
        "correo": "dario_javier@hotmail.com",
        "estado": "inactivo"
    },
];

function listarusuario(props) {
    const [loading, setloading] = useState(true);
    const [filterText, setfilterText] = useState(false);
    const [selectedUser, setselectedUser] = useState(null);
    const [removeStyling, setremoveStyling] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setloading(false);
        }, 2000)
    }, []);
    const handleChange = (value) => {
        console.log(value);
        setfilterText(value);
    };
    return (
        <>
          <Header />  
          {/* <div style={{padding:'60px'}}/> */}
          <Card className="shadow">
          <div style={{display:"flex"}}>
                    <h4 style={{marginLeft: 20}}>
                        Table with Paging and Search
                    </h4>
                    <TextField
                        label="Search"
                        style={{marginLeft: 40}}
                        vaule={filterText}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                </div>
          <TablePaging  
          loading={loading}
          dataList={users}
          headerConfig={headerConfig}
          filterText={filterText}
          tableStyleName={removeStyling ? "" : "stripe-table"}
          useMaterialUiPaging={true} />
          </Card>
        </>
    );
}
listarusuario.layout = Admin;
export default listarusuario;