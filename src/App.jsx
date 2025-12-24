import { useSelector } from "react-redux";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./layouts/Home";

function App() {
  const user = useSelector((state) => state.auth.user)
  
  return (
    <>
      {user ? <Home /> : <AuthLayout />}
    </>
  );
}

export default App;
