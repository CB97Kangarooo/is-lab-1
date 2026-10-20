-- Выполняется в PostgreSQL до деплоя приложения.

CREATE OR REPLACE FUNCTION sum_impact_speed()
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN COALESCE((SELECT SUM(impact_speed) FROM human_being), 0);
END;
$$;

CREATE OR REPLACE FUNCTION avg_impact_speed()
RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- Среднее пустого набора не определено: NULL (REST отдаёт его как null).
    RETURN (SELECT AVG(impact_speed) FROM human_being)::DOUBLE PRECISION;
END;
$$;

CREATE OR REPLACE FUNCTION find_by_name_prefix(p_prefix TEXT)
RETURNS SETOF human_being
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
        SELECT hb.*
        FROM human_being hb
        -- Префикс ищется буквально: \, % и _ экранируются, иначе LIKE трактует их как шаблон.
        WHERE hb.name LIKE replace(replace(replace(p_prefix, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
        ORDER BY hb.id;
END;
$$;

CREATE OR REPLACE FUNCTION set_all_mood_sorrow()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- version + 1: прямой UPDATE обходит Hibernate, поэтому версию поднимает сама функция,
    -- иначе клиент со старой формой сохранил бы её поверх массового изменения.
    UPDATE human_being
    SET mood = 'SORROW',
        version = version + 1
    WHERE mood IS DISTINCT FROM 'SORROW';

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

CREATE OR REPLACE FUNCTION assign_lada_kalina()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    human_row human_being%ROWTYPE;
    new_car_id BIGINT;
    affected_rows INTEGER := 0;
BEGIN
    -- FOR UPDATE: строки блокируются до конца транзакции. Параллельный вызов ждёт
    -- на заблокированной строке, после commit перечитывает её и пропускает,
    -- потому что car_id перестал быть NULL. Без этого оба вызова создали бы по машине,
    -- и машина проигравшего осталась бы без владельца.
    FOR human_row IN
        SELECT * FROM human_being WHERE car_id IS NULL ORDER BY id FOR UPDATE
    LOOP
        INSERT INTO car (name, cool)
        VALUES ('Lada Kalina', TRUE)
        RETURNING id INTO new_car_id;

        UPDATE human_being
        SET car_id = new_car_id,
            version = version + 1
        WHERE id = human_row.id;

        affected_rows := affected_rows + 1;
    END LOOP;

    RETURN affected_rows;
END;
$$;
