import { Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import SignUp from "../pages/SignUp"
import Verify from "../components/Verfiy"
import ResetPassword from "../pages/ResetPassword"
import ForgotPassword from "../pages/ForgotPassword"

export default function AuthLayout() {

    const route = <>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


        <Route path="*" element={<Navigate to="/login" />} />
    </>
    return (
        <Routes>
            {route}
        </Routes>
    )
}

