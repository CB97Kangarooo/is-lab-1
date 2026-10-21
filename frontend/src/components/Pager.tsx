import { PAGE_SIZES } from '../hooks/useHeroTable';

interface PagerProps {
  page: number;
  size: number;
  total: number;
  shown: number;
  lastPage: number;
  disabled?: boolean;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
}

export function Pager({ page, size, total, shown, lastPage, disabled, onPage, onSize }: PagerProps) {
  return (
    <nav className="pager" aria-label="Страницы">
      <span aria-live="polite">
        Показано <b>{shown}</b> из <b>{total}</b>
      </span>
      <span className="pager-controls">
        <label className="pager-size">
          На странице
          <select value={size} onChange={(e) => onSize(Number(e.target.value))} disabled={disabled}>
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" disabled={disabled || page <= 0} onClick={() => onPage(page - 1)}>
          назад
        </button>
        <span>
          стр. {page + 1} из {lastPage + 1}
        </span>
        <button type="button" className="btn" disabled={disabled || page >= lastPage} onClick={() => onPage(page + 1)}>
          вперёд
        </button>
      </span>
    </nav>
  );
}
