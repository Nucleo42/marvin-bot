export const getDayAndTime = (): {
  weekday: string;
  time: string;
  hour: number;
} => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const now = new Date().toLocaleString("pt-BR", options);

  const [weekday, time] = now.split(" ") as [string, string];
  const [hour] = time?.split(":").map(Number) ?? [0];

  return { weekday, hour: hour || 12, time };
};
