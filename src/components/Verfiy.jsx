import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail, resetVerifyState } from "../store/feauters/verifySlice";
import Swal from "sweetalert2";

export default function Verify() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success, error } = useSelector((state) => state.verify);

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token));
    }

    return () => {
      dispatch(resetVerifyState());
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: "success",
        title: "Email Verified",
        text: "You can now login",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/login");
    }

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error,
      });
    }
  }, [success, error, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      {loading && (
        <p className="text-lg font-semibold">Verifying your email...</p>
      )}
    </div>
  );
}
