import { config } from "dotenv";

config()

if (!process.env.MONGO_URI) {
  throw new Error("Mongodb uri is not defined in environment variable");
}

if(!process.env.PORT){
    throw new Error("Port is not defined in environment variable")
}

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variable");
}

if (!process.env.ACCESS_TOKEN_EXPIRES_IN) {
  throw new Error(
    "ACCESS_TOKEN_EXPIRES_IN is not defined in environment variable",
  );
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "REFRESH_TOKEN_SECRET is not defined in environment variable",
  );
}

if (!process.env.REFRESH_TOKEN_EXPIRES_IN) {
  throw new Error(
    "REFRESH_TOKEN_EXPIRES_IN is not defined in environment variable",
  );
}

if(!process.env.GOOGLE_CLIENT_ID){
  throw new Error("Google client id is not defined in environment variable")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
  throw new Error("Google client secret is not defined in environment variable")
} 

if(!process.env.IMAGEKIT_PUBLIC_KEY){
  throw new Error("Imagekit public key is not defined in environment variable")
}

if(!process.env.IMAGEKIT_PRIVATE_KEY){
  throw new Error("Imagekit private key is not defined in environment variable")
}

if(!process.env.IMAGEKIT_URL_ENDPOINT){
  throw new Error("Imagekit url endpoint is not defined in environment variable")
}

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error(  "Razorpay key id is not defined in environment variable")
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay secret id is not defined in environment variable");
}

if (!process.env.REDIS_HOST) {
  throw new Error("Redis host is not defined in environment variable")
}

if (!process.env.REDIS_PORT) {
  throw new Error("Redis port is not defined in environment variable")
}

if (!process.env.REDIS_PASSWORD) {
  throw new Error("Redis password is not defined in environment variable")
}

const configure = {
  PORT: process.env.PORT || 8000,
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD
};

export default configure