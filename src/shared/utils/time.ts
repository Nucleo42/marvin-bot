export const formatTime = (ms: number): string => {
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds} segundo${seconds > 1 ? "s" : ""}`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes} minuto${minutes > 1 ? "s" : ""}`;

  const hours = minutes / 60;
  if (hours < 24) return `${hours} hora${hours > 1 ? "s" : ""}`;

  const days = hours / 24;
  return `${days} dia${days > 1 ? "s" : ""}`;
};
