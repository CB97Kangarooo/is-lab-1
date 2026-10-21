-- Функции из functions.sql зависят от таблиц (find_by_name_prefix возвращает SETOF human_being),
-- поэтому при повторном запуске их нужно удалить раньше таблиц. После этого скрипта снова выполнить functions.sql.
DROP FUNCTION IF EXISTS find_by_name_prefix(TEXT);
DROP FUNCTION IF EXISTS sum_impact_speed();
DROP FUNCTION IF EXISTS avg_impact_speed();
DROP FUNCTION IF EXISTS set_all_mood_sorrow();
DROP FUNCTION IF EXISTS assign_lada_kalina();

DROP TABLE IF EXISTS human_being;
DROP TABLE IF EXISTS car;

CREATE TABLE car (
    id   BIGSERIAL    PRIMARY KEY,
    name VARCHAR(255),              -- может быть null
    cool BOOLEAN,                   -- может быть null (Boolean, а не boolean)

    CONSTRAINT chk_car_id_positive CHECK (id > 0)
);

CREATE TABLE human_being (
    id             BIGSERIAL        PRIMARY KEY,
    version        BIGINT           NOT NULL,
    name           VARCHAR(255)     NOT NULL,
    x              DOUBLE PRECISION NOT NULL,
    y              DOUBLE PRECISION NOT NULL,   -- в Java примитив double: null невозможен
    creation_date  DATE             NOT NULL,   -- заполняется в Java (@PrePersist), DEFAULT нет осознанно
    real_hero      BOOLEAN          NOT NULL,   -- примитив boolean
    has_toothpick  BOOLEAN          NOT NULL,   -- примитив boolean
    car_id         BIGINT,                      -- может быть null
    mood           VARCHAR(16)      NOT NULL,
    impact_speed   INTEGER          NOT NULL,
    weapon_type    VARCHAR(16),                 -- может быть null

    CONSTRAINT chk_human_id_positive     CHECK (id > 0),
    CONSTRAINT chk_human_name_not_blank  CHECK (btrim(name) <> ''),
    CONSTRAINT chk_human_y_max           CHECK (y <= 119),
    CONSTRAINT chk_human_impact_speed    CHECK (impact_speed <= 213),
    CONSTRAINT chk_human_mood            CHECK (mood IN ('SORROW', 'GLOOM', 'RAGE')),
    CONSTRAINT chk_human_weapon_type     CHECK (weapon_type IN ('HAMMER', 'AXE', 'KNIFE', 'MACHINE_GUN')),

    CONSTRAINT uq_human_car UNIQUE (car_id),

    -- Удаление машины удаляет её владельца (требование «связанные объекты удаляются»).
    -- По удалению героя БД не может удалить машину тк FK у героя, так что за это отвечает cascade = REMOVE в JPA.
    CONSTRAINT fk_human_car FOREIGN KEY (car_id) REFERENCES car (id) ON DELETE CASCADE
);
