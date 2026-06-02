import configure from "../config/config.js"
import jwt from "jsonwebtoken"

export const generateAccessToken = (userid) => {
    const accessToken = jwt.sign({ userid }, configure.ACCESS_TOKEN_SECRET, { expiresIn: configure.ACCESS_TOKEN_EXPIRES_IN })
    return accessToken
}

export const generateRefreshToken = (userid) => {
    const refreshToken  = jwt.sign({userid}, configure.REFRESH_TOKEN_SECRET, { expiresIn: configure.REFRESH_TOKEN_EXPIRES_IN })

    return refreshToken
}