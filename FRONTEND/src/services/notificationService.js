import { toast } from 'react-toastify';

// Cấu hình chung cho các toast, bạn có thể bỏ trống nếu đã hài lòng với cấu hình ở App.js
const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

export const notifySuccess = (message) => {
    toast.success(message, toastOptions);
};

export const notifyError = (message) => {
    toast.error(message, toastOptions);
};

export const notifyInfo = (message) => {
    toast.info(message, toastOptions);
};

export const notifyWarning = (message) => {
    toast.warn(message, toastOptions);
};