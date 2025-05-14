
const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "oculta123tarot@gmail.com",
    pass: "rixfipzwiidikjcx",
  },
});

//! Mail de bienvenida
async function sendMail(to,subject,text,html){
  const info = await transporter.sendMail({
    from: 'oculta123tarot@gmail.com',
    to,
    subject,
    text,
    html
  });
}

//! Mail de contacto
async function sendContactEmail(formData){
  const { name, email, phone, service, message } = formData;
  const to = "oculta123tarot@gmail.com"; // Page email to receive contact form data
  const subject = `Nuevo mensaje de contacto de ${name}`;
  const text = `
  Nombre: ${name}
  Email: ${email}
  Teléfono: ${phone}
  Servicio: ${service}
  Mensaje: ${message}
  `;
  const html = `
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Teléfono:</strong> ${phone}</p>
    <p><strong>Servicio:</strong> ${service}</p>
    <p><strong>Mensaje:</strong> ${message}</p>
  `;
  const info = await transporter.sendMail({
    from: 'oculta123tarot@gmail.com',
    replyTo: email,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendMail, sendContactEmail };
