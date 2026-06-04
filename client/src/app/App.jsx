import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import { useSelector}  from "react-redux"
import { useAuth } from '../features/auth/hooks/useAuth'
import "remixicon/fonts/remixicon.css";

const App = () => {
  useSelector(state => state.auth.user)
  const { handleGetMe } = useAuth()
  
  useEffect(() => {
    handleGetMe()
  }, [])

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App