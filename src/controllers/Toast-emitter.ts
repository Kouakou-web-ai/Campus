import { toast, Zoom } from "react-toastify";
import { useNotificationStore } from "../store/notificationStore";

export const ToastSuccess = (message: string) => {
  // Ajouter à l'historique des notifications de la session
  useNotificationStore.getState().addNotification("Succès", message, "success");

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
  // Ajouter à l'historique des notifications de la session
  useNotificationStore.getState().addNotification("Erreur", message, "error");

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
