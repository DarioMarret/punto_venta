if (typeof document === 'undefined') { 
  // @ts-ignore global.document = { querySelector: function () {}, }; }
}
import React, { useEffect  } from "react";
import Router from "next/router";


export default function Index() {
  useEffect(()=>{
    Router.push("/admin/dashboard");
  },[])
  return <div />;
}
