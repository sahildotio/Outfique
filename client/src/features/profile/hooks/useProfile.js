import { useDispatch } from "react-redux"
import {  createProfileDetails, getProfileDetails } from "../service/profile.api.js";
import { clearProfile, setProfile, setProfileError, setProfileLoading  } from "../state/profile.slice.js"

export const useProfile = () => {
    const dispatch = useDispatch()

  const handelCreateUserProfile = async (userid, payload) => {
      try {
        dispatch(setProfileLoading(true))
        const data = await createProfileDetails(userid, payload)
        dispatch(setProfile(data.profile))
      } catch (error) {
        dispatch(setProfileError(error.message))
      } finally {
        dispatch(setProfileLoading(false))
      }
    }
   
    const handleGetProfileDetails = async () => {
        try {
          const profileData = await getProfileDetails()
          return profileData.profile
        } catch (error) {
          dispatch(clearProfile(error.message))
        }
    }
  return { 
    handleGetProfileDetails,
    handelCreateUserProfile
     }
}