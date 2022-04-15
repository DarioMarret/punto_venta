import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import Head from "next/head";
import Router from "next/router";
import AuthContext from '../context/AuthContext';
import PageChange from "components/PageChange/PageChange.js";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/nextjs-argon-dashboard.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./auth/login";
import Auth from "../layouts/Auth";
import { getDatosUsuario, removeDatosUsuario } from "../function/localstore/storeUsuario";

Router.events.on("routeChangeStart", (url) => {
  console.log(`Loading: ${url}`);
  document.body.classList.add("body-page-transition");
  ReactDOM.render(
    <PageChange path={url} />,
    document.getElementById("page-transition")
  );
});
Router.events.on("routeChangeComplete", () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
  document.body.classList.remove("body-page-transition");
});
Router.events.on("routeChangeError", () => {
  ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
  document.body.classList.remove("body-page-transition");
});

export default function MyApp({ Component, pageProps }) {

  const [auth, setAuth] = useState(undefined);
  const [ReloadUser,setReloadUser] = useState(false);

  useEffect(() => {
    (()=>{
      const user = getDatosUsuario();
      if (user != null) {
        setAuth(user);
      } else {
        setAuth(null);
      }
      setReloadUser(false);
    })()
  }, [ReloadUser]);

  const login = (user) => {
    setAuth(user)
  };
  
  const logout = () => {
      removeDatosUsuario()
      setAuth(null);
      setReloadUser(true);
  };
  
  const Layout = Component.layout || (({ children }) => <>{children}</>);
  
  const authData = useMemo(
    () => ({
      auth,
      login,
      logout,
      setReloadUser,
    }),
    [auth]
    );
    
    if (auth === undefined) return null;

  return (
    <AuthContext.Provider value={authData}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Plantilla</title>
        <script src="https://maps.googleapis.com/maps/api/js"></script>
      </Head>
      {
        auth != null ? 
          <Layout><Component {...pageProps} /></Layout> 
        : <Auth><Login/></Auth> 
      }
    </AuthContext.Provider>
  );
}
