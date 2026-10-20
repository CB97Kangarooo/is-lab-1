import { HeroTable } from '../components/HeroTable';
import { Pager } from '../components/Pager';
import { useHeroTable } from '../hooks/useHeroTable';

export function HeroesPage() {
  const table = useHeroTable();

  return (
    <>
      <div className="page-head">
        <h1>Герои</h1>
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
    </>
  );
}
