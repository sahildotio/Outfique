import { google } from "googleapis";
import nodemailer from "nodemailer"
import configure from "../config/config.js";

const oauth2Client = new google.auth.OAuth2(
  configure.GOOGLE_CLIENT_ID,
  configure.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: configure.GOOGLE_REFRESH_TOKEN
})

export const sendEmail = async (to, subject, text, html) => {
  try {
    const accessToken = await oauth2Client.getAccessToken()
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: configure.GOOGLE_USER,
        clientId: configure.GOOGLE_CLIENT_ID,
        clientSecret: configure.GOOGLE_CLIENT_SECRET,
        refreshToken: configure.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    (async () => {
      try {
        await transporter.verify()
        console.log("Email server is loaded")
      } catch (error) {
        console.log("Email server error: ", error.message)
      }
    })()
    
    await transporter.sendMail({
      from: `"Outfique Support" <${configure.GOOGLE_USER}`,
      to,
      subject,
      text,
      html
    })

    console.log("Email sent successfully")
  } catch (error) {
    console.log(error.message)
  }
}