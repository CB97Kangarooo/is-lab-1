# Информационные системы. Лабораторная работа 1 (вариант 683)

Учебная информационная система управления коллекцией объектов `HumanBeing`
(с вложенными `Coordinates` и связанной сущностью `Car`) — CRUD, серверная
пагинация/фильтрация/сортировка, real-time синхронизация между клиентами.

**Стек:** Jakarta EE 8 (javax.*), CDI, JAX-RS, Hibernate/JPA, PostgreSQL, WildFly 21.

## Быстрый старт

1. Поднять PostgreSQL, последовательно применить `sql/schema.sql` и `sql/functions.sql`.
2. Настроить datasource в `DatasourceConfig.java` под свою БД.
3. `mvn clean package` → задеплоить `target/lab-is.war` на WildFly.

## Фронтенд (UI)

React + TypeScript + Vite, исходники в `frontend/`. Собранная статика попадает в корень war и открывается по корню контекста
(`http://host:8080/lab-is/`). Node.js нужен только для сборки (20.19+ или 22.12+), на сервере его нет.

| Задача | Команда |
| --- | --- |
| Разработка (Vite + proxy `/api` на локальный WildFly) | `cd frontend && npm install && npm run dev` → http://localhost:5173 |
| Сборка статики в `frontend/dist` (с проверкой типов) | `cd frontend && npm run build` |
| Сборка war со встроенным UI | `mvn clean package` (после `npm run build`) |

Адрес бэкенда для dev-режима по умолчанию `http://localhost:8080/lab-is`; другой задаётся в `frontend/.env.local`:
`BACKEND_URL=http://localhost:8080/другой-контекст`.
Порядок для деплоя: `npm run build` → `mvn clean package` → `target/lab-is.war` на WildFly. Если `frontend/dist` не собран,
Maven соберёт war без UI.
