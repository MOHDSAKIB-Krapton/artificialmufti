export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}, ${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
};
