export const PAGE_SIZE = 6;

const firstPageSlots = (withAddCard: boolean): number => (withAddCard ? PAGE_SIZE - 1 : PAGE_SIZE);

export const pageWindow = (page: number, withAddCard: boolean): { offset: number; limit: number } => {
  const firstSlots = firstPageSlots(withAddCard);
  if (page <= 1) {
    return { offset: 0, limit: firstSlots };
  }
  return { offset: firstSlots + (page - 2) * PAGE_SIZE, limit: PAGE_SIZE };
};

export const countPages = (total: number, withAddCard: boolean): number => {
  const firstSlots = firstPageSlots(withAddCard);
  return total <= firstSlots ? 1 : 1 + Math.ceil((total - firstSlots) / PAGE_SIZE);
};

export const parsePage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};
