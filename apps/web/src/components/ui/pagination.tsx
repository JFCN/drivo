import { cn } from '@/lib/cn';
import { Icon } from './icon';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

type PageItem = number | 'gap';

export const buildPageItems = (page: number, totalPages: number): PageItem[] => {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((first, second) => first - second);

  return pages.flatMap<PageItem>((item, index) => (index > 0 && item - pages[index - 1] > 1 ? ['gap', item] : [item]));
};

const baseItem = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-callout transition-colors';

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Paginação" className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className={cn(baseItem, 'bg-surface text-text-primary hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-surface')}
      >
        <Icon name="chevronLeft" className="size-5" />
      </button>

      <ul className="hidden items-center gap-2 sm:flex">
        {buildPageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-text-tertiary">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  baseItem,
                  item === page ? 'bg-accent font-semibold text-white' : 'bg-surface text-text-secondary hover:bg-surface-2 hover:text-text-primary',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <p className="px-3 text-callout text-text-secondary sm:hidden" aria-live="polite">
        Página {page} de {totalPages}
      </p>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Próxima página"
        className={cn(baseItem, 'bg-surface text-text-primary hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-surface')}
      >
        <Icon name="chevronRight" className="size-5" />
      </button>
    </nav>
  );
};
