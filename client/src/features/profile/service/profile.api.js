import axios from "axios";

const profileInstance = axios.create({
  baseURL: "/api/profile",
});

export const getProfileDetails = async() => {
  const response = await profileInstance.get("/get-details")
  return response.data
}

export const createProfileDetails = async (userid, payload) => {
  const response = await profileInstance.post(`/add-details/${userid}`, payload)
  return response.data
}