export const initials = (firstName: string, lastName: string): string => {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().split(/\s+/).pop()?.charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || '?';
};

export const fullName = (firstName: string, lastName: string): string => `${firstName} ${lastName}`.trim();

export const maskChassis = (chassis: string): string => {
  if (chassis.length <= 7) {
    return chassis;
  }
  return `${chassis.slice(0, 3)}${'•'.repeat(7)}${chassis.slice(-4)}`;
};

export const formatMemberSince = (isoDate: string): string => {
  const date = new Date(isoDate);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  return `Membro desde ${month} de ${date.getFullYear()}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
};

export const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;
