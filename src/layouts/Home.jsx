import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from "../pages/HomePage"
import Post from "../pages/Post"
import Profile from "../pages/Profile"
import SearchPage from "../pages/SearchPage"

export default function loginLayOut() {


    const route = <>
        <Route path="/" element={<HomePage />} />
        <Route path="/post" element={<Post />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
    </>
    return (
        <Routes>
            {route}
        </Routes>
    )
}

