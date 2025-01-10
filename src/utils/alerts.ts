import toast from "react-hot-toast";

export const showAlert = (message: string, type: "success" | "error") => {
  toast[type](message, {
    duration: 3000,
    position: "top-right",
  });
};
