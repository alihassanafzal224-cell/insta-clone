import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from "../pages/HomePage"
import Post from "../pages/Post"
import Profile from "../pages/Profile"

export default function loginLayOut() {


    const route = <>
        <Route path="/" element={<HomePage/>} />
        <Route path="/post" element={<Post/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
    </>
    return (
        <Routes>
            {route}
        </Routes>
    )
}

