export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const METHODS = [
  { value: "bkash", label: "bKash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "in_person", label: "In Person" },
];

export const methodLabel = (value) => METHODS.find((m) => m.value === value)?.label ?? value ?? "—";

export const money = (n) => `৳${Number(n ?? 0).toLocaleString("en-US")}`;

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const currentYear = () => new Date().getFullYear();
export const currentMonth = () => new Date().getMonth() + 1;

/** Years offered in dropdowns: two back, one ahead. */
export const yearOptions = () => {
  const y = currentYear();
  return [y - 2, y - 1, y, y + 1];
};
