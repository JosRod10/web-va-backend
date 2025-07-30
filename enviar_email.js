const nodemailer = require('nodemailer');

async function enviarCorreo() {
  // Crear un transportador (configuración para Gmail)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jarodriguez@cinasa.com.mx', // Tu correo electrónico
      pass: '12345'  // Tu contraseña (o una contraseña de aplicación)
    }
  });

  // Definir el correo
  let mailOptions = {
    from: 'jarodriguez@cinasa.com.mx', // Remitente
    to: 'jarodriguez@cinasa.com.mx', // Destinatario
    subject: 'Prueba de email', // Asunto
    text: 'Este es un correo de prueba.', // Cuerpo del correo (texto plano)
    html: '<p>Contenido del correo en HTML</p>' // Cuerpo del correo (HTML)
  };

  try {
    // Enviar el correo
    let info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: ' + info.response);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

enviarCorreo();
// module.exports = enviarCorreo();