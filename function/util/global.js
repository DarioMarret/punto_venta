export const usuario_local = "usuario:";
export const usuario_token = "token_usuario:";
export const host = "https://codigomarret.online/back"


//localinfo
export const DOCUMENTO = [
    {
    "forma":"Facturacion",
    "codigo":"01",
    },
    {
      "forma":"Ticket",
      "codigo":"00",
    }
  ]
export const FORMAPAGO = [
    {
      "E": "EFECTIVO",
    },
    {
      "E": "TARJETA",
    },
    {
      "E": "TRANSFERENCIA",
    }
]

export const ESTADO = [
    {
      "E": "ACTIVO",
      "M": "ACTIVO"
    },
    {
      "E": "ANULADO",
      "M": "ANULADO"
    }
]
export const columns = [
    {
      name: "secuencia",
      label: "SECUENCIAL",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "forma_pago",
      label: "FORMA DE PAGO",
      options: {
        filter: true,
        sort: false,
      }
    },
    {
      name: "total",
      label: "TOTAL",
      options: {
        filter: true,
        sort: false,
      }
    },
    {
      name: "fecha_creacion",
      label: "FECHA",
      options: {
        filter: true,
        sort: false,
      }
    },
    {
      name: "empresa",
      label: "EMPRESA",
      options: {
        filter: true,
        sort: false,
      }
    },
    {
      name: "estado",
      label: "ESTADO",
      options: {
        filter: true,
        sort: false,
      }
    },
]
