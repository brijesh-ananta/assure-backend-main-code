import { toast } from "react-toastify";

export const handleErrorToaster = (error) => {
  const errors = error?.response?.data?.errors;
  const message = error?.response?.data?.message;

  if (Array.isArray(errors) && errors?.length) {
    errors?.forEach((err) => {
      toast.error(err?.msg || err?.message);
    });
  } else if (errors?.data && errors?.message) {
    const missingFields = errors.data.missingFields?.join(", ") || "";
    toast.error(`${errors?.message || ""} ${missingFields}`);
  } else if (message) {
    toast.error(message?.message || message);
  } else {
    toast.error("Something went wrong!");
  }
};

export function getUrlWithParams(path, search = "") {
  return `${path}${location.search || search}`;
}

export function formatMaskedCardNumber(cardNumber, mode) {
  if (!cardNumber) return "";

  const clean = cardNumber.replace(/\D/g, "");
  const len = clean.length;

  if (len < 8) return cardNumber;

  if (mode === "full") {
    if (len === 16) {
      return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
    } else if (len === 14) {
      return clean.replace(/(\d{4})(\d{6})(\d{4})/, "$1 $2 $3");
    } else {
      return clean.replace(/(.{1,4})/g, "$1 ").trim();
    }
  }

  // MASKED DISPLAY MODE
  const first = clean.slice(0, 4);
  const last = clean.slice(-4);
  const maskLen = len - 8;
  let masked = "X".repeat(maskLen);

  if (len === 16) {
    masked = masked.slice(0, 4) + " " + masked.slice(4);
    return `${first} ${masked} ${last}`;
  }
  if (len === 14) {
    return `${first} ${masked} ${last}`;
  }
  return `${first} ${masked} ${last}`;
}
