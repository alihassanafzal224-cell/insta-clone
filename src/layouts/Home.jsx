import { Routes, Route, Navigate } from "react-router-dom"
import ToDoList from "../pages/HomePage"

export default function loginLayOut() {


    const route = <>
        <Route path="/todolist" element={<ToDoList />} />
        <Route path="*" element={<Navigate to="/todolist" />} />
    </>
    return (
        <Routes>
            {route}
        </Routes>
    )
}

