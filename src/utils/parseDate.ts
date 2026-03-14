export const parseDate = (value: string | undefined): number => {
  if (!value) return 0;

  // timestamp
  if (!isNaN(Number(value))) return Number(value);

  // ISO
  const iso = new Date(value);
  if (!isNaN(iso.getTime())) return iso.getTime();

  // HH:mm:ss,DD/MM/YYYY
  if (value.includes(",") && value.includes("/")) {
    const [time, date] = value.split(",");
    const [h, m, s] = time.split(":").map(Number);
    const [day, month, year] = date.split("/").map(Number);
    return new Date(year, month - 1, day, h, m, s).getTime();
  }

  return 0;
};
