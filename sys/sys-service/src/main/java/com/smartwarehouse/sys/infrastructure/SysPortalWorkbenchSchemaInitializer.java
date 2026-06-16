package com.smartwarehouse.sys.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

/**
 * Keeps the portal workbench tables compatible with existing local MySQL data volumes.
 *
 * <p>The project relies on long-lived local Docker MySQL data in daily development, so
 * newer workbench tables cannot depend only on first-time init SQL. This initializer
 * makes the workbench schema self-healing on startup and seeds the minimum portal
 * notices only when the table is still empty.</p>
 */
@Component
public class SysPortalWorkbenchSchemaInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SysPortalWorkbenchSchemaInitializer.class);
    private static final String NOTICE_TABLE = "sys_portal_notice";
    private static final String ACCESS_LOG_TABLE = "sys_portal_access_log";

    private final JdbcTemplate jdbc;
    private final DataSource dataSource;

    public SysPortalWorkbenchSchemaInitializer(JdbcTemplate jdbc, DataSource dataSource) {
        this.jdbc = jdbc;
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureNoticeTable();
        ensureAccessLogTable();
        ensureNoticeColumns();
        ensureAccessLogColumns();
        seedDefaultNotices();
    }

    private void ensureNoticeTable() {
        if (tableExists(NOTICE_TABLE)) {
            return;
        }
        jdbc.execute("""
                create table if not exists sys_portal_notice (
                  id bigint primary key,
                  title varchar(128),
                  content varchar(512),
                  level varchar(32),
                  sort_no int default 0,
                  status varchar(32) default 'ENABLED',
                  published_time datetime
                )
                """);
        log.info("Created missing table {} for portal workbench notices", NOTICE_TABLE);
    }

    private void ensureAccessLogTable() {
        if (tableExists(ACCESS_LOG_TABLE)) {
            return;
        }
        jdbc.execute("""
                create table if not exists sys_portal_access_log (
                  id bigint primary key,
                  user_id bigint,
                  module_code varchar(64),
                  route_path varchar(255),
                  access_time datetime
                )
                """);
        log.info("Created missing table {} for portal workbench access logs", ACCESS_LOG_TABLE);
    }

    private void ensureNoticeColumns() {
        ensureColumn(NOTICE_TABLE, "title", "varchar(128)");
        ensureColumn(NOTICE_TABLE, "content", "varchar(512)");
        ensureColumn(NOTICE_TABLE, "level", "varchar(32)");
        ensureColumn(NOTICE_TABLE, "sort_no", "int default 0");
        ensureColumn(NOTICE_TABLE, "status", "varchar(32) default 'ENABLED'");
        ensureColumn(NOTICE_TABLE, "published_time", "datetime");
    }

    private void ensureAccessLogColumns() {
        ensureColumn(ACCESS_LOG_TABLE, "user_id", "bigint");
        ensureColumn(ACCESS_LOG_TABLE, "module_code", "varchar(64)");
        ensureColumn(ACCESS_LOG_TABLE, "route_path", "varchar(255)");
        ensureColumn(ACCESS_LOG_TABLE, "access_time", "datetime");
    }

    private void ensureColumn(String tableName, String columnName, String columnDefinition) {
        if (columnExists(tableName, columnName)) {
            return;
        }
        jdbc.execute("alter table " + tableName + " add column " + columnName + " " + columnDefinition);
        log.info("Added missing column {}.{} for portal workbench compatibility", tableName, columnName);
    }

    private void seedDefaultNotices() {
        Long count = jdbc.queryForObject("select count(*) from " + NOTICE_TABLE, Long.class);
        if (count != null && count > 0) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        insertNotice(501L, "Portal Workbench Ready", "Portal workbench is available for all signed-in users.", "info", 1, now);
        insertNotice(502L, "Weekly Patrol Reminder", "Please finish weekly patrol and log review on time.", "warning", 2, now.minusMinutes(30));
        insertNotice(503L, "Password Safety Reminder", "Rotate passwords regularly and avoid leaving shared screens signed in.", "info", 3, now.minusHours(1));
        log.info("Seeded default portal workbench notices because {} was empty", NOTICE_TABLE);
    }

    private void insertNotice(Long id, String title, String content, String level, int sortNo, LocalDateTime publishedTime) {
        jdbc.update("""
                insert into sys_portal_notice (id, title, content, level, sort_no, status, published_time)
                values (?, ?, ?, ?, ?, 'ENABLED', ?)
                """, id, title, content, level, sortNo, publishedTime);
    }

    private boolean tableExists(String tableName) {
        try (Connection connection = dataSource.getConnection()) {
            return tableExists(connection, tableName)
                    || tableExists(connection, tableName.toLowerCase())
                    || tableExists(connection, tableName.toUpperCase());
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to inspect table " + tableName, ex);
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws SQLException {
        try (ResultSet rs = connection.getMetaData().getTables(connection.getCatalog(), null, tableName, new String[]{"TABLE"})) {
            if (rs.next()) {
                return true;
            }
        }
        try (ResultSet rs = connection.getMetaData().getTables(null, null, tableName, new String[]{"TABLE"})) {
            return rs.next();
        }
    }

    private boolean columnExists(String tableName, String columnName) {
        try (Connection connection = dataSource.getConnection()) {
            return columnExists(connection, tableName, columnName)
                    || columnExists(connection, tableName.toLowerCase(), columnName.toLowerCase())
                    || columnExists(connection, tableName.toUpperCase(), columnName.toUpperCase());
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to inspect column " + tableName + "." + columnName, ex);
        }
    }

    private boolean columnExists(Connection connection, String tableName, String columnName) throws SQLException {
        try (ResultSet rs = connection.getMetaData().getColumns(connection.getCatalog(), null, tableName, columnName)) {
            if (rs.next()) {
                return true;
            }
        }
        try (ResultSet rs = connection.getMetaData().getColumns(null, null, tableName, columnName)) {
            return rs.next();
        }
    }
}
