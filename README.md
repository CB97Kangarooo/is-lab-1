# Информационные системы. Лабораторная работа 1 (вариант 683)

Учебная информационная система управления коллекцией объектов `HumanBeing`
(с вложенными `Coordinates` и связанной сущностью `Car`) — CRUD, серверная
пагинация/фильтрация/сортировка, real-time синхронизация между клиентами.

**Стек:** Jakarta EE 8 (javax.*), CDI, JAX-RS, Hibernate/JPA, PostgreSQL, WildFly 21.

## Быстрый старт

1. Поднять PostgreSQL, применить `sql/schema.sql`.
2. Настроить datasource в `DatasourceConfig.java` под свою БД.
3. `mvn clean package` → задеплоить `target/lab-is.war` на WildFly.
