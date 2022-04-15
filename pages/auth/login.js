import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";
// layout for this page
import Auth from "layouts/Auth.js";
import { getDatosUsuario, setDatosUsuario } from "../../function/localstore/storeUsuario";
import axios from "axios";
import { useRouter } from 'next/router';
import Swal from 'sweetalert2'
import 'animate.css';

function Login() {
  const router = useRouter()
	React.useEffect(() => {
		let user = getDatosUsuario()
		if(user != null){
			router.push("/admin/dashboard")
		}
	}, [])
  
  const { login, setReloadUser } = useAuth();
  const [user, setuser] = useState({
    usuario:null,
    contracena:null,
    status:'validar'
  });
  
  const AuthValivation=async()=>{
    if(user.usuario !== null && user.contracena !== null){
      console.log(user)
      
      const { data } = await axios.post('http://18.207.32.71:5050/v1/validarlogin',{usuario:user.usuario, contracena:user.contracena})
      console.log(data)
      if(data.success){
        setDatosUsuario(data)
        login(data)
        setReloadUser(data.success)
      }else{
        Swal.fire({
          title: data.msg,
          showClass: {
              popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
          }
      })
      }
    }
  }

  const handelChange = (e)=>{
    setuser({
      ...user,
      [e.target.name]:e.target.value
    })
  }

  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-5">
            <div className="text-muted text-center mt-2 mb-3">
              <small>Login</small>
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
            </div>
            <Form role="form">
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-circle-08" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    onChange={(e)=>handelChange(e)}
                    name="usuario"
                    placeholder="username"
                    password
                    autoComplete="new-email"
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    onChange={(e)=>handelChange(e)}
                    name="contracena"
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                  />
                </InputGroup>
              </FormGroup>
              <div className="text-center">
                <Button className="my-4" color="primary" type="button" onClick={() =>AuthValivation()}>
                  Sign in
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
}

Login.layout = Auth;

export default Login;
