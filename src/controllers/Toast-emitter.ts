import { toast, Zoom } from "react-toastify";
import { useNotificationStore } from "../store/notificationStore";

export const ToastSuccess = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    draggable: true,
    theme: "light",
    transition: Zoom,
  });
};

export const ToastError = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    draggable: true,
    theme: "light",
    transition: Zoom,
  });
};
