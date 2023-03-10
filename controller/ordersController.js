require('dotenv').config();
const storage = require(`../daos/factory`)

const ordenesStorage = storage().ordenes

const sendEmail = require(`../utils/nodemailer.js`)
const sendSMS = require('../utils/twilioSMS.js')
const sendWhatsApp = require('../utils/twilioWhatsApp')

const createOrdenController = async (req, res) => {
  try {
    const userLog = req.user
    const userID = req.body.idUser
    const orden = await ordenesStorage.createOrden(userID)

    auxEmail(userLog, orden);

    //Descomentar para recibir el pedido en mensaje
    // sendSMS(`Su pedido ha sido recibido y se encuentra en proceso`, `+16672618331`, `+5491121681478`);
    // auxWhatsApp(userLog, orden);

    return res.render(`compraFinalizada`)
  } catch (err) {
    return res.status(404).json({
      error: `Error al crear la orden ${err}`,
    })
  }
}

const viewOrdenesController = (req, res) => {
  return res.send(`Estoy en viewOrdenes`)
}

const auxEmail = async (userLog, orden) => {
  let detallePedido = ``

  orden.products.forEach((element) => {
    detallePedido += `
        <li>UNIDADES: ${1}. PRODUCTO: ${element.title}. CODIGO:${element._id} </li>
    `
  })

  const mailOptions = {
    from: process.env.EMAIL,
    to: `almadebudin23@hotmail.com`,
    subject: `Nuevo pedido de: ${userLog.username}`,
    html: `
            <h3>Nuevo pedido!</h3>
            <p> Datos del cliente:</p>
            <ul>
            <li> Nombre: ${userLog.username}</li>
            <li> Email: ${userLog.email}</li>
            <li> Teléfono: ${userLog.telefono}</li>
            <li> Direccion: ${userLog.direccion}</li>
            </ul>
            <p> Pedido:</p>
            <ul>
            ${detallePedido}
            </ul>
        `,
  }
  const email = await sendEmail(mailOptions)
  console.log(email)
}

const auxWhatsApp = async (userLog, orden) => {
  let detallePedido = ``

  orden.products.forEach((element) => {
    detallePedido += `
            - UNIDADES: ${1}. PRODUCTO: ${element.title}. CODIGO: ${element._id}
            `
  })

  const body = `Nuevo pedido!
        Datos del cliente:
        Nombre: ${userLog.username}
        ${userLog.email}
        Teléfono: ${userLog.telefono}
        Direccion: ${userLog.direccion}
        Pedido:
        ${detallePedido}
        `
  await sendWhatsApp(body, `whatsapp:+14155238886`, process.env.PHONE_NUMBER_WHATSAPP)
}

module.exports = {
  viewOrdenesController,
  createOrdenController,
}
