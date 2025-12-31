import Swal from "sweetalert2";
import { logoutUserAsync } from "../feauters/authSlice";

export const authFetch = async (url, options = {}, dispatch) => {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401 || res.status === 403) {
    await Swal.fire({
      icon: "warning",
      title: "Session Expired",
      text: "Your session has expired. Please log in again.",
      confirmButtonText: "OK",
    });

    dispatch(logoutUserAsync()); 
    throw new Error("Session expired");
  }

  return res;
};
