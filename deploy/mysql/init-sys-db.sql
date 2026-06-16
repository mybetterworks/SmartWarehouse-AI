SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS smart_sys DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE smart_sys;

CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(128) NOT NULL,
  nickname VARCHAR(64) NOT NULL,
  phone VARCHAR(32),
  email VARCHAR(128),
  dept_id BIGINT,
  post_id BIGINT,
  status VARCHAR(32) NOT NULL,
  last_login_time DATETIME,
  last_login_ip VARCHAR(64),
  tenant_id BIGINT,
  created_by BIGINT,
  created_time DATETIME,
  updated_by BIGINT,
  updated_time DATETIME,
  deleted TINYINT DEFAULT 0,
  version INT DEFAULT 0,
  UNIQUE KEY uk_sys_user_username(username),
  KEY idx_sys_user_dept(dept_id),
  KEY idx_sys_user_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_role (
  id BIGINT PRIMARY KEY,
  role_code VARCHAR(64) NOT NULL,
  role_name VARCHAR(64) NOT NULL,
  data_scope VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  remark VARCHAR(255),
  tenant_id BIGINT,
  created_by BIGINT,
  created_time DATETIME,
  updated_by BIGINT,
  updated_time DATETIME,
  deleted TINYINT DEFAULT 0,
  version INT DEFAULT 0,
  UNIQUE KEY uk_sys_role_code(role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_menu (
  id BIGINT PRIMARY KEY,
  parent_id BIGINT NOT NULL,
  menu_name VARCHAR(64) NOT NULL,
  menu_type VARCHAR(16) NOT NULL,
  module_code VARCHAR(64) NOT NULL,
  path VARCHAR(255),
  component VARCHAR(255),
  permission VARCHAR(128),
  icon VARCHAR(64),
  sort_no INT DEFAULT 0,
  visible TINYINT DEFAULT 1,
  status VARCHAR(32) NOT NULL,
  created_time DATETIME,
  updated_time DATETIME,
  deleted TINYINT DEFAULT 0,
  KEY idx_sys_menu_module(module_code),
  KEY idx_sys_menu_permission(permission),
  KEY idx_sys_menu_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_frontend_module (
  id BIGINT PRIMARY KEY,
  module_code VARCHAR(64) NOT NULL,
  module_name VARCHAR(128) NOT NULL,
  route_prefix VARCHAR(128) NOT NULL,
  entry_url VARCHAR(255) NOT NULL,
  remote_name VARCHAR(128),
  remote_entry VARCHAR(255),
  exposed_module VARCHAR(128) DEFAULT './RemoteApp',
  api_prefix VARCHAR(128) NOT NULL,
  owner_type VARCHAR(32) NOT NULL,
  owner_name VARCHAR(128),
  status VARCHAR(32) NOT NULL,
  sort_no INT DEFAULT 0,
  created_time DATETIME,
  updated_time DATETIME,
  UNIQUE KEY uk_sys_frontend_module_code(module_code),
  KEY idx_sys_frontend_module_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE sys_frontend_module ADD COLUMN IF NOT EXISTS remote_name VARCHAR(128) AFTER entry_url;
ALTER TABLE sys_frontend_module ADD COLUMN IF NOT EXISTS remote_entry VARCHAR(255) AFTER remote_name;
ALTER TABLE sys_frontend_module ADD COLUMN IF NOT EXISTS exposed_module VARCHAR(128) DEFAULT './RemoteApp' AFTER remote_entry;

CREATE TABLE IF NOT EXISTS sys_portal_notice (
  id BIGINT PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  content VARCHAR(512) NOT NULL,
  level VARCHAR(32) NOT NULL,
  sort_no INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  published_time DATETIME,
  KEY idx_sys_portal_notice_status(status),
  KEY idx_sys_portal_notice_time(published_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_portal_access_log (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  module_code VARCHAR(64) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  access_time DATETIME,
  KEY idx_sys_portal_access_user(user_id),
  KEY idx_sys_portal_access_module(module_code),
  KEY idx_sys_portal_access_time(access_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_user_role (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  UNIQUE KEY uk_sys_user_role(user_id, role_id),
  KEY idx_sys_user_role_user(user_id),
  KEY idx_sys_user_role_role(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_role_menu (
  id BIGINT PRIMARY KEY,
  role_id BIGINT NOT NULL,
  menu_id BIGINT NOT NULL,
  UNIQUE KEY uk_sys_role_menu(role_id, menu_id),
  KEY idx_sys_role_menu_role(role_id),
  KEY idx_sys_role_menu_menu(menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_dept (
  id BIGINT PRIMARY KEY,
  parent_id BIGINT NOT NULL,
  dept_code VARCHAR(64) NOT NULL,
  dept_name VARCHAR(128) NOT NULL,
  sort_no INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  created_time DATETIME,
  updated_time DATETIME,
  deleted TINYINT DEFAULT 0,
  UNIQUE KEY uk_sys_dept_code(dept_code),
  KEY idx_sys_dept_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_post (
  id BIGINT PRIMARY KEY,
  post_code VARCHAR(64) NOT NULL,
  post_name VARCHAR(128) NOT NULL,
  sort_no INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  UNIQUE KEY uk_sys_post_code(post_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_dict_type (
  id BIGINT PRIMARY KEY,
  dict_code VARCHAR(64) NOT NULL,
  dict_name VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  UNIQUE KEY uk_sys_dict_type_code(dict_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_dict_item (
  id BIGINT PRIMARY KEY,
  dict_code VARCHAR(64) NOT NULL,
  item_label VARCHAR(128) NOT NULL,
  item_value VARCHAR(128) NOT NULL,
  sort_no INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  KEY idx_sys_dict_item_code(dict_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_user_warehouse (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  UNIQUE KEY uk_sys_user_warehouse(user_id, warehouse_id),
  KEY idx_sys_user_warehouse_user(user_id),
  KEY idx_sys_user_warehouse_warehouse(warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_login_log (
  id BIGINT PRIMARY KEY,
  username VARCHAR(64),
  user_id BIGINT,
  login_ip VARCHAR(64),
  user_agent VARCHAR(255),
  login_status VARCHAR(32),
  fail_reason VARCHAR(255),
  login_time DATETIME,
  trace_id VARCHAR(128),
  KEY idx_sys_login_log_username(username),
  KEY idx_sys_login_log_user(user_id),
  KEY idx_sys_login_log_ip(login_ip),
  KEY idx_sys_login_log_status(login_status),
  KEY idx_sys_login_log_time(login_time),
  KEY idx_sys_login_log_trace(trace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_oper_log (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  username VARCHAR(64),
  module VARCHAR(64),
  operation VARCHAR(128),
  request_uri VARCHAR(255),
  request_method VARCHAR(16),
  request_params TEXT,
  result_status VARCHAR(32),
  error_message TEXT,
  cost_ms BIGINT,
  oper_ip VARCHAR(64),
  trace_id VARCHAR(128),
  created_time DATETIME,
  KEY idx_sys_oper_log_user(user_id),
  KEY idx_sys_oper_log_module(module),
  KEY idx_sys_oper_log_trace(trace_id),
  KEY idx_sys_oper_log_time(created_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_risk_record (
  id BIGINT PRIMARY KEY,
  risk_type VARCHAR(64),
  risk_target VARCHAR(128),
  risk_level VARCHAR(32),
  action VARCHAR(64),
  reason VARCHAR(255),
  expire_time DATETIME,
  extra_json TEXT,
  created_time DATETIME,
  KEY idx_sys_risk_record_type(risk_type),
  KEY idx_sys_risk_record_target(risk_target),
  KEY idx_sys_risk_record_time(created_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sys_dept (id, parent_id, dept_code, dept_name, sort_no, status, created_time, updated_time, deleted)
VALUES
  (100, 0, 'ROOT', '智能制造事业部', 1, 'ENABLED', NOW(), NOW(), 0),
  (101, 100, 'WAREHOUSE', '仓储运营部', 2, 'ENABLED', NOW(), NOW(), 0),
  (102, 100, 'PRODUCTION', '生产执行部', 3, 'ENABLED', NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name), status = VALUES(status), updated_time = NOW(), deleted = 0;

INSERT INTO sys_post (id, post_code, post_name, sort_no, status)
VALUES
  (200, 'PLATFORM_ADMIN', '平台管理员', 1, 'ENABLED'),
  (201, 'WAREHOUSE_MANAGER', '仓库管理员', 2, 'ENABLED'),
  (202, 'PRODUCTION_PLANNER', '生产计划员', 3, 'ENABLED')
ON DUPLICATE KEY UPDATE post_name = VALUES(post_name), status = VALUES(status);

INSERT INTO sys_user (
  id, username, password, nickname, phone, email, dept_id, post_id, status,
  last_login_time, last_login_ip, tenant_id, created_by, created_time, updated_by, updated_time, deleted, version
)
VALUES
  (1, 'admin', '40d8b67bb34f5594d8f38deeef5ee6e1d5be6e32d3eb060f0df7a99822504e44', '平台管理员', '13800000000', 'admin@example.local', 100, 200, 'ENABLED', NULL, NULL, 1, 0, NOW(), 0, NOW(), 0, 0),
  (2, 'wms_manager', '40d8b67bb34f5594d8f38deeef5ee6e1d5be6e32d3eb060f0df7a99822504e44', '仓库主管', '13800000001', 'wms@example.local', 101, 201, 'ENABLED', NULL, NULL, 1, 0, NOW(), 0, NOW(), 0, 0)
ON DUPLICATE KEY UPDATE nickname = VALUES(nickname), dept_id = VALUES(dept_id), post_id = VALUES(post_id), status = VALUES(status), updated_time = NOW(), deleted = 0;

INSERT INTO sys_role (id, role_code, role_name, data_scope, status, remark, tenant_id, created_by, created_time, updated_by, updated_time, deleted, version)
VALUES
  (1, 'ADMIN', '系统管理员', 'ALL', 'ENABLED', '拥有平台全部权限', 1, 0, NOW(), 0, NOW(), 0, 0),
  (2, 'WAREHOUSE_MANAGER', '仓库管理员', 'WAREHOUSE', 'ENABLED', '只能查看授权仓库数据', 1, 0, NOW(), 0, NOW(), 0, 0),
  (3, 'AUDITOR', '审计员', 'SELF', 'ENABLED', '查看登录日志、操作日志和风控记录', 1, 0, NOW(), 0, NOW(), 0, 0)
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name), data_scope = VALUES(data_scope), status = VALUES(status), remark = VALUES(remark), updated_time = NOW(), deleted = 0;

INSERT INTO sys_menu (id, parent_id, menu_name, menu_type, module_code, path, component, permission, icon, sort_no, visible, status, created_time, updated_time, deleted)
VALUES
  (10, 0, '系统管理', 'DIR', 'sys', '/sys', '', '', 'Setting', 1, 1, 'ENABLED', NOW(), NOW(), 0),
  (11, 10, '用户管理', 'MENU', 'sys', '/sys/users', 'UserPage', 'sys:user:list', 'User', 1, 1, 'ENABLED', NOW(), NOW(), 0),
  (12, 10, '角色管理', 'MENU', 'sys', '/sys/roles', 'RolePage', 'sys:role:list', 'UserFilled', 2, 1, 'ENABLED', NOW(), NOW(), 0),
  (13, 10, '菜单管理', 'MENU', 'sys', '/sys/menus', 'MenuPage', 'sys:menu:list', 'Menu', 3, 1, 'ENABLED', NOW(), NOW(), 0),
  (14, 10, '部门管理', 'MENU', 'sys', '/sys/depts', 'DeptPage', 'sys:dept:list', 'OfficeBuilding', 4, 1, 'ENABLED', NOW(), NOW(), 0),
  (15, 10, '岗位管理', 'MENU', 'sys', '/sys/posts', 'PostPage', 'sys:post:list', 'Postcard', 5, 1, 'ENABLED', NOW(), NOW(), 0),
  (16, 10, '字典管理', 'MENU', 'sys', '/sys/dicts', 'DictPage', 'sys:dict:list', 'Tickets', 6, 1, 'ENABLED', NOW(), NOW(), 0),
  (17, 10, '前端模块', 'MENU', 'sys', '/sys/modules', 'ModulePage', 'sys:module:list', 'Grid', 7, 1, 'ENABLED', NOW(), NOW(), 0),
  (18, 10, '安全审计', 'DIR', 'sys', '/sys/audit', '', '', 'Lock', 8, 1, 'ENABLED', NOW(), NOW(), 0),
  (19, 18, '登录日志', 'MENU', 'sys', '/sys/login-logs', 'LoginLogPage', 'sys:login-log:list', 'Document', 1, 1, 'ENABLED', NOW(), NOW(), 0),
  (20, 18, '操作日志', 'MENU', 'sys', '/sys/oper-logs', 'OperLogPage', 'sys:oper-log:list', 'DocumentChecked', 2, 1, 'ENABLED', NOW(), NOW(), 0),
  (21, 18, '风控记录', 'MENU', 'sys', '/sys/risk-records', 'RiskRecordPage', 'sys:risk:list', 'Warning', 3, 1, 'ENABLED', NOW(), NOW(), 0),
  (30, 0, '仓储管理', 'DIR', 'wms', '/wms', '', '', 'Box', 2, 1, 'ENABLED', NOW(), NOW(), 0),
  (31, 30, '物料管理', 'MENU', 'wms', '/wms/materials', 'MaterialPage', 'wms:material:list', 'Collection', 1, 1, 'ENABLED', NOW(), NOW(), 0),
  (40, 0, '生产执行', 'DIR', 'mes', '/mes', '', '', 'Operation', 3, 1, 'ENABLED', NOW(), NOW(), 0),
  (41, 40, '工单管理', 'MENU', 'mes', '/mes/workorders', 'WorkOrderPage', 'mes:workorder:list', 'Tickets', 1, 1, 'ENABLED', NOW(), NOW(), 0),
  (50, 0, '运营看板', 'DIR', 'task', '/task', '', '', 'DataAnalysis', 4, 1, 'ENABLED', NOW(), NOW(), 0),
  (60, 0, 'AI 助手', 'DIR', 'ai', '/ai', '', '', 'ChatDotRound', 5, 1, 'ENABLED', NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE menu_name = VALUES(menu_name), permission = VALUES(permission), status = VALUES(status), updated_time = NOW(), deleted = 0;

INSERT INTO sys_user_role (id, user_id, role_id)
VALUES (1001, 1, 1), (1002, 2, 2)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO sys_role_menu (id, role_id, menu_id)
SELECT 200000 + id, 1, id FROM sys_menu
ON DUPLICATE KEY UPDATE menu_id = VALUES(menu_id);

DELETE FROM sys_role_menu
WHERE role_id = 2
  AND menu_id IN (SELECT id FROM sys_menu WHERE module_code <> 'wms');

INSERT INTO sys_role_menu (id, role_id, menu_id)
SELECT 210000 + id, 2, id FROM sys_menu WHERE module_code = 'wms'
ON DUPLICATE KEY UPDATE menu_id = VALUES(menu_id);

INSERT INTO sys_user_warehouse (id, user_id, warehouse_id)
VALUES (3001, 1, 1), (3002, 1, 2), (3003, 1, 3), (3004, 2, 1)
ON DUPLICATE KEY UPDATE warehouse_id = VALUES(warehouse_id);

INSERT INTO sys_dict_type (id, dict_code, dict_name, status)
VALUES
  (300, 'sys_status', '系统状态', 'ENABLED'),
  (310, 'data_scope', '数据权限范围', 'ENABLED'),
  (320, 'owner_type', '前端模块负责人类型', 'ENABLED')
ON DUPLICATE KEY UPDATE dict_name = VALUES(dict_name), status = VALUES(status);

INSERT INTO sys_dict_item (id, dict_code, item_label, item_value, sort_no, status)
VALUES
  (301, 'sys_status', '启用', 'ENABLED', 1, 'ENABLED'),
  (302, 'sys_status', '禁用', 'DISABLED', 2, 'ENABLED'),
  (311, 'data_scope', '全部数据', 'ALL', 1, 'ENABLED'),
  (312, 'data_scope', '仓库数据', 'WAREHOUSE', 2, 'ENABLED'),
  (313, 'data_scope', '本人数据', 'SELF', 3, 'ENABLED'),
  (321, 'owner_type', '甲方', 'OWNER', 1, 'ENABLED'),
  (322, 'owner_type', '乙方', 'VENDOR', 2, 'ENABLED')
ON DUPLICATE KEY UPDATE item_label = VALUES(item_label), item_value = VALUES(item_value), sort_no = VALUES(sort_no), status = VALUES(status);

INSERT INTO sys_frontend_module (id, module_code, module_name, route_prefix, entry_url, remote_name, remote_entry, exposed_module, api_prefix, owner_type, owner_name, status, sort_no, created_time, updated_time)
VALUES
  (401, 'sys', '系统管理', '/sys', '/apps/sys/', 'smart_sys_web', 'http://localhost:5175/apps/sys/assets/remoteEntry.js', './RemoteApp', '/api/sys', 'OWNER', '甲方平台团队', 'ENABLED', 1, NOW(), NOW()),
  (402, 'wms', '仓储管理', '/wms', '/apps/wms/', 'smart_wms_web', 'http://localhost:5176/apps/wms/assets/remoteEntry.js', './RemoteApp', '/api/wms', 'VENDOR', '乙方 A', 'ENABLED', 2, NOW(), NOW()),
  (403, 'mes', '生产执行', '/mes', '/apps/mes/', 'smart_mes_web', 'http://localhost:5177/apps/mes/assets/remoteEntry.js', './RemoteApp', '/api/mes', 'VENDOR', '乙方 B', 'ENABLED', 3, NOW(), NOW()),
  (404, 'task', '运营看板', '/task', '/apps/task/', NULL, NULL, NULL, '/api/task', 'OWNER', '甲方平台团队', 'ENABLED', 4, NOW(), NOW()),
  (405, 'ai', 'AI 助手', '/ai', '/apps/ai/', 'smart_ai_web', 'http://localhost:5178/apps/ai/assets/remoteEntry.js', './RemoteApp', '/api/ai', 'VENDOR', '乙方 C', 'ENABLED', 5, NOW(), NOW())
ON DUPLICATE KEY UPDATE module_name = VALUES(module_name), entry_url = VALUES(entry_url), remote_name = VALUES(remote_name), remote_entry = VALUES(remote_entry), exposed_module = VALUES(exposed_module), api_prefix = VALUES(api_prefix), owner_type = VALUES(owner_type), owner_name = VALUES(owner_name), status = VALUES(status), sort_no = VALUES(sort_no), updated_time = NOW();

INSERT INTO sys_portal_notice (id, title, content, level, sort_no, status, published_time)
VALUES
  (501, '门户工作台上线', '统一门户工作台已启用，可查看消息、常用模块和最近访问。', 'info', 1, 'ENABLED', NOW()),
  (502, '系统巡检提醒', '请在每周一上午完成系统巡检与日志抽查。', 'warning', 2, 'ENABLED', NOW()),
  (503, '密码安全建议', '请定期轮换账号密码，并避免在公共环境中长期保持登录状态。', 'info', 3, 'ENABLED', NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), level = VALUES(level), sort_no = VALUES(sort_no), status = VALUES(status), published_time = VALUES(published_time);
