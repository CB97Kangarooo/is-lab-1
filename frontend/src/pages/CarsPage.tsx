import { useState } from 'react';
import { listCars } from '../api/cars';
import { Dash, Flag, Text } from '../components/Cells';
import { CarForm } from '../components/CarForm';
import { Pager } from '../components/Pager';
import { useAsyncLoader } from '../hooks/useAsyncLoader';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { PAGE_SIZES } from '../hooks/useHeroTable';

export function CarsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGE_SIZES[0]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [creating, setCreating] = useState(false);
  const focus = useFocusReturn();

  const loader = useAsyncLoader(
    (signal) => listCars({ offset: page * size, limit: size, freeOnly }, signal),
    [page, size, freeOnly],
  );
  const items = loader.data?.items ?? [];
  const total = loader.data?.total ?? 0;
  const lastPage = Math.max(0, Math.ceil(total / size) - 1);

  const closeDialog = () => {
    setCreating(false);
    focus.restore();
  };

  return (
    <>
      <div className="page-head">
        <h1>Машины</h1>
        <div className="page-tools">
          <label className="check-inline">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => {
                setFreeOnly(e.target.checked);
                setPage(0);
              }}
            />
            только свободные
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              focus.remember();
              setCreating(true);
            }}
          >
            Создать машину
          </button>
        </div>
      </div>

      <div className="table-wrap" aria-busy={loader.loading}>
        <table className="grid grid-narrow">
          <thead>
            <tr>
              <th scope="col" className="num">id</th>
              <th scope="col">name</th>
              <th scope="col">cool</th>
              <th scope="col">владелец</th>
            </tr>
          </thead>
          <tbody>
            {!loader.error &&
              items.map((car) => (
                <tr key={car.id}>
                  <td className="num">{car.id}</td>
                  <td className="wide">
                    <Text value={car.name} />
                  </td>
                  <td>
                    <Flag value={car.cool} />
                  </td>
                  <td>{car.owner ? `${car.owner.name} (id ${car.owner.id})` : <Dash />}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="state-cell">
                {loader.error ? (
                  <div className="state" role="alert">
                    <p>{loader.error}</p>
                    <button type="button" className="btn btn-primary" onClick={loader.reload}>
                      Повторить
                    </button>
                  </div>
                ) : !loader.data ? (
                  <div className="state muted">Загрузка…</div>
                ) : items.length === 0 ? (
                  <div className="state muted">{freeOnly ? 'Свободных машин нет' : 'Машин нет'}</div>
                ) : null}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Pager
        page={page}
        size={size}
        total={total}
        shown={items.length}
        lastPage={lastPage}
        disabled={loader.loading}
        onPage={setPage}
        onSize={(n) => {
          setSize(n);
          setPage(0);
        }}
      />

      {creating && (
        <CarForm
          onClose={closeDialog}
          onSaved={() => {
            closeDialog();
            loader.reload();
          }}
        />
      )}
    </>
  );
}
