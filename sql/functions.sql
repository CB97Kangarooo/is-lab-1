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
    RETURN COALESCE((SELECT AVG(impact_speed) FROM human_being), 0)::DOUBLE PRECISION;
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
        WHERE hb.name LIKE p_prefix || '%'
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
    UPDATE human_being
    SET mood = 'SORROW'
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
    FOR human_row IN
        SELECT * FROM human_being WHERE car_id IS NULL ORDER BY id
    LOOP
        INSERT INTO car (name, cool)
        VALUES ('Lada Kalina', TRUE)
        RETURNING id INTO new_car_id;

        UPDATE human_being
        SET car_id = new_car_id
        WHERE id = human_row.id;

        affected_rows := affected_rows + 1;
    END LOOP;

    RETURN affected_rows;
END;
$$;
