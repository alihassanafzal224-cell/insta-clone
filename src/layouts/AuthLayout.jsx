import { Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import SignUp from "../pages/SignUp"

export default function AuthLayout() {
    
    const route = <>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="*" element={<Navigate to="/login" />} />
    </>
    return (
        <Routes>
            {route}
        </Routes>
    )
}

