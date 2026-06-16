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

/**
 * 前端模块注册表的轻量兼容初始化器。
 *
 * <p>个人实践项目本地 MySQL 会保留历史数据卷，新增微前端字段后不能只依赖首次建库 SQL。
 * 这里仅补齐 V02 微前端运行时加载所需字段，并且只回填空值，避免覆盖后续在 sys-web 中维护的正式环境地址。</p>
 */
@Component
public class SysFrontendModuleSchemaInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SysFrontendModuleSchemaInitializer.class);
    private static final String TABLE_NAME = "sys_frontend_module";

    private final JdbcTemplate jdbc;
    private final DataSource dataSource;

    public SysFrontendModuleSchemaInitializer(JdbcTemplate jdbc, DataSource dataSource) {
        this.jdbc = jdbc;
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureColumn("remote_name", "varchar(128)");
        ensureColumn("remote_entry", "varchar(255)");
        ensureColumn("exposed_module", "varchar(128)");
        backfillLocalRemote("sys", "smart_sys_web", "http://localhost:5175/assets/remoteEntry.js", "http://localhost:5175/apps/sys/assets/remoteEntry.js");
        backfillLocalRemote("wms", "smart_wms_web", "http://localhost:5176/assets/remoteEntry.js", "http://localhost:5176/apps/wms/assets/remoteEntry.js");
        backfillLocalRemote("mes", "smart_mes_web", "http://localhost:5177/assets/remoteEntry.js", "http://localhost:5177/apps/mes/assets/remoteEntry.js");
        backfillLocalRemote("ai", "smart_ai_web", "http://localhost:5178/assets/remoteEntry.js", "http://localhost:5178/apps/ai/assets/remoteEntry.js");
    }

    private void ensureColumn(String columnName, String columnDefinition) {
        if (columnExists(columnName)) {
            return;
        }
        jdbc.execute("alter table " + TABLE_NAME + " add column " + columnName + " " + columnDefinition);
        log.info("Added missing column {}.{} for frontend module federation registry", TABLE_NAME, columnName);
    }

    private boolean columnExists(String columnName) {
        try (Connection connection = dataSource.getConnection()) {
            return columnExists(connection, TABLE_NAME, columnName)
                    || columnExists(connection, TABLE_NAME.toUpperCase(), columnName.toUpperCase());
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to inspect sys_frontend_module schema", ex);
        }
    }

    private boolean columnExists(Connection connection, String tableName, String columnName) throws SQLException {
        try (ResultSet rs = connection.getMetaData().getColumns(connection.getCatalog(), null, tableName, columnName)) {
            return rs.next();
        }
    }

    private void backfillLocalRemote(String moduleCode, String remoteName, String oldLocalRemoteEntry, String localPreviewRemoteEntry) {
        jdbc.update("""
                update sys_frontend_module
                set remote_name = coalesce(remote_name, ?),
                    remote_entry = case
                        when remote_entry is null or remote_entry = ? then ?
                        else remote_entry
                    end,
                    exposed_module = coalesce(exposed_module, './RemoteApp')
                where module_code = ?
                """, remoteName, oldLocalRemoteEntry, localPreviewRemoteEntry, moduleCode);
    }
}
