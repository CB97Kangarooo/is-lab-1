package ru.itmo.is.lab.config;

import javax.annotation.sql.DataSourceDefinition;
import javax.ejb.Singleton;
import javax.ejb.Startup;

@DataSourceDefinition(
        name = "java:app/jdbc/studs",
        className = "org.postgresql.ds.PGSimpleDataSource",
        url = "jdbc:postgresql://pg:5432/studs",
        user = "s467351",
        password = "password"
)
@Singleton
@Startup
public class DatasourceConfig {
}
