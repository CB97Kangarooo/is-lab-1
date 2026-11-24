CREATE TABLE IF NOT EXISTS app_user (
    id            BIGSERIAL    PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,

    CONSTRAINT chk_app_user_username_not_blank CHECK (btrim(username) <> ''),
    CONSTRAINT uq_app_user_username            UNIQUE (username)
);
