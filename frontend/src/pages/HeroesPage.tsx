import { useState } from 'react';
import { HeroForm } from '../components/HeroForm';
import { HeroTable } from '../components/HeroTable';
import { Pager } from '../components/Pager';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useHeroTable } from '../hooks/useHeroTable';

export function HeroesPage() {
  const table = useHeroTable();
  const [creating, setCreating] = useState(false);
  const focus = useFocusReturn();

  const openCreate = () => {
    focus.remember();
    setCreating(true);
  };
  const closeDialog = () => {
    setCreating(false);
    focus.restore();
  };

  return (
    <>
      <div className="page-head">
        <h1>Герои</h1>
        <div className="page-tools">
          <button type="button" className="btn btn-primary" onClick={openCreate}>
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
      {creating && (
        <HeroForm
          onClose={closeDialog}
          onSaved={() => {
            closeDialog();
            table.reload();
          }}
        />
      )}
    </>
  );
}
