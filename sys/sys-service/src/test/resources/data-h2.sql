INSERT INTO sys_dept (id, parent_id, dept_code, dept_name, sort_no, status, created_time, updated_time, deleted)
VALUES (100, 0, 'ROOT', 'Platform Dept', 1, 'ENABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO sys_post (id, post_code, post_name, sort_no, status)
VALUES
  (200, 'PLATFORM_ADMIN', 'Platform Admin', 1, 'ENABLED'),
  (201, 'WAREHOUSE_MANAGER', 'Warehouse Manager', 2, 'ENABLED');

INSERT INTO sys_user (id, username, password, nickname, phone, email, dept_id, post_id, status, tenant_id, created_by, created_time, updated_by, updated_time, deleted, version)
VALUES
  (1, 'admin', '5acc1f4a06d434aca10a9d94f4b2c99618bcb4a7587c83d55f0b68c46f1d9acc', 'Admin', '13800000000', 'admin@example.local', 100, 200, 'ENABLED', 1, 0, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
  (2, 'wms_manager', '5acc1f4a06d434aca10a9d94f4b2c99618bcb4a7587c83d55f0b68c46f1d9acc', 'Wms Manager', '13800000001', 'wms@example.local', 100, 201, 'ENABLED', 1, 0, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0);

INSERT INTO sys_role (id, role_code, role_name, data_scope, status, remark, tenant_id, created_by, created_time, updated_by, updated_time, deleted, version)
VALUES
  (1, 'ADMIN', 'System Admin', 'ALL', 'ENABLED', 'All permissions', 1, 0, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0),
  (2, 'WAREHOUSE_MANAGER', 'Warehouse Manager', 'WAREHOUSE', 'ENABLED', 'Warehouse-only access', 1, 0, CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, 0, 0);

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, module_code, path, component, permission, icon, sort_no, visible, status, created_time, updated_time, deleted)
VALUES
  (10, 0, 'System', 'DIR', 'sys', '/sys', '', '', 'Setting', 1, 1, 'ENABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
  (11, 10, 'Users', 'MENU', 'sys', '/sys/users', 'UserPage', 'sys:user:list', 'User', 1, 1, 'ENABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
  (12, 10, 'Roles', 'MENU', 'sys', '/sys/roles', 'RolePage', 'sys:role:list', 'UserFilled', 2, 1, 'ENABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
  (30, 0, 'Wms', 'DIR', 'wms', '/wms', '', '', 'Box', 2, 1, 'ENABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0),
  (31, 30, 'Materials', 'MENU', 'wms', '/wms/materials', 'MaterialPage', 'wms:material:list', 'Collection', 1, 1, 'ENABLED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO sys_user_role (id, user_id, role_id)
VALUES
  (1001, 1, 1),
  (1002, 2, 2);

INSERT INTO sys_role_menu (id, role_id, menu_id)
VALUES
  (200010, 1, 10),
  (200011, 1, 11),
  (200012, 1, 12),
  (200030, 1, 30),
  (200031, 1, 31),
  (210030, 2, 30),
  (210031, 2, 31);

INSERT INTO sys_user_warehouse (id, user_id, warehouse_id)
VALUES
  (3001, 1, 1),
  (3002, 1, 2),
  (3003, 1, 3),
  (3004, 2, 1);

INSERT INTO sys_frontend_module (id, module_code, module_name, route_prefix, entry_url, remote_name, remote_entry, exposed_module, api_prefix, owner_type, owner_name, status, sort_no, created_time, updated_time)
VALUES
  (401, 'sys', 'System', '/sys', '/apps/sys/', 'smart_sys_web', 'http://localhost:5175/apps/sys/assets/remoteEntry.js', './RemoteApp', '/api/sys', 'OWNER', 'Owner Team', 'ENABLED', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (402, 'wms', 'Wms', '/wms', '/apps/wms/', 'smart_wms_web', 'http://localhost:5176/apps/wms/assets/remoteEntry.js', './RemoteApp', '/api/wms', 'VENDOR', 'Vendor A', 'ENABLED', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO sys_portal_notice (id, title, content, level, sort_no, status, published_time)
VALUES
  (501, 'Workbench Live', 'Portal workbench is available.', 'info', 1, 'ENABLED', CURRENT_TIMESTAMP),
  (502, 'Weekly Patrol', 'Please finish patrol and log review.', 'warning', 2, 'ENABLED', DATEADD('MINUTE', -30, CURRENT_TIMESTAMP));

INSERT INTO sys_login_log (id, username, user_id, login_ip, user_agent, login_status, fail_reason, login_time, trace_id)
VALUES
  (601, 'admin', 1, '127.0.0.1', 'JUnit', 'SUCCESS', NULL, DATEADD('HOUR', -4, CURRENT_TIMESTAMP), 'trace-admin-1'),
  (602, 'admin', 1, '127.0.0.1', 'JUnit', 'SUCCESS', NULL, DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'trace-admin-2'),
  (603, 'wms_manager', 2, '127.0.0.1', 'JUnit', 'SUCCESS', NULL, DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'trace-wms-1');

INSERT INTO sys_portal_access_log (id, user_id, module_code, route_path, access_time)
VALUES
  (701, 1, 'sys', '/sys/users', DATEADD('HOUR', -5, CURRENT_TIMESTAMP)),
  (702, 1, 'sys', '/sys/roles', DATEADD('HOUR', -3, CURRENT_TIMESTAMP)),
  (703, 1, 'wms', '/wms/materials', DATEADD('HOUR', -1, CURRENT_TIMESTAMP)),
  (704, 2, 'wms', '/wms/materials', DATEADD('HOUR', -2, CURRENT_TIMESTAMP)),
  (705, 2, 'wms', '/wms/materials', DATEADD('MINUTE', -20, CURRENT_TIMESTAMP)),
  (706, 2, 'sys', '/sys/users', DATEADD('HOUR', -6, CURRENT_TIMESTAMP));
