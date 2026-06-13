import nodemailer from "nodemailer"
import configure from "../config/config.js"

const transporter = nodemailer.createTestAccount({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: configure.GOOGLE_USER,
        clientId: configure.GOOGLE_CLIENT_ID,
        clientSecret: configure.GOOGLE_CLIENT_SECRET,
        refreshToken: configure.GOOGLE_REFRESH_TOKEN
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log("Error connecting to email server: ", error)
    } else {
        console.log("Email server is ready to send messages ")
    }
})

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Outfique Support <${configure.GOOGLE_USER}>"`,
            to,
            subject,
            text,
            html
        })
    } catch (error) {
        console.log("Error sending email: ", error)
    }
}

