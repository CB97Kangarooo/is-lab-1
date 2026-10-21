import { useState } from 'react';
import type { FormEvent } from 'react';
import { HeroTable } from '../components/HeroTable';
import { useHeroDialogs } from '../components/HeroDialogs';
import { Pager } from '../components/Pager';
import { useHeroTable } from '../hooks/useHeroTable';

export function HeroesPage() {
  const table = useHeroTable();
  // после любого изменения таблица перезагружается с текущими страницей, сортировкой и фильтрами
  const heroDialogs = useHeroDialogs(table.reload);

  const [openId, setOpenId] = useState('');
  const [openIdError, setOpenIdError] = useState<string | null>(null);

  const submitOpenId = (event: FormEvent) => {
    event.preventDefault();
    const value = openId.trim();
    if (!/^\d+$/.test(value) || /^0+$/.test(value)) {
      setOpenIdError('Введите id — целое положительное число');
      return;
    }
    setOpenIdError(null);
    heroDialogs.openView(value.replace(/^0+(?=\d)/, ''));
  };

  return (
    <>
      <div className="page-head">
        <h1>Герои</h1>
        <div className="page-tools">
          <form className="open-id" onSubmit={submitOpenId} noValidate>
            <label htmlFor="open-id">открыть по id</label>
            <span className="open-id-row">
              <input
                id="open-id"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={openId}
                aria-invalid={openIdError !== null}
                aria-describedby={openIdError ? 'open-id-error' : undefined}
                onChange={(e) => {
                  setOpenId(e.target.value);
                  setOpenIdError(null);
                }}
              />
              <button type="submit" className="btn">
                открыть
              </button>
            </span>
            {openIdError && (
              <p id="open-id-error" className="field-error">
                {openIdError}
              </p>
            )}
          </form>
          <button type="button" className="btn btn-primary" onClick={heroDialogs.openCreate}>
            Создать героя
          </button>
        </div>
      </div>
      <HeroTable
        items={table.items}
        sort={table.sort}
        onSort={table.toggleSort}
        loading={table.loading}
        hasData={table.hasData}
        error={table.error}
        filterInputs={table.filterInputs}
        filtered={table.filtered}
        onFilter={table.setFilter}
        onOpen={(hero) => heroDialogs.openView(hero.id)}
        onEdit={heroDialogs.openEdit}
        onDelete={heroDialogs.openDelete}
        onRetry={table.reload}
      />
      <Pager
        page={table.page}
        size={table.size}
        total={table.total}
        shown={table.items.length}
        lastPage={table.lastPage}
        disabled={table.loading}
        onPage={table.setPage}
        onSize={table.changeSize}
      />
      {heroDialogs.dialogs}
    </>
  );
}
