CREATE TABLE sys_user (
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
  version INT DEFAULT 0
);

CREATE TABLE sys_role (
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
  version INT DEFAULT 0
);

CREATE TABLE sys_menu (
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
  deleted TINYINT DEFAULT 0
);

CREATE TABLE sys_frontend_module (
  id BIGINT PRIMARY KEY,
  module_code VARCHAR(64) NOT NULL,
  module_name VARCHAR(128) NOT NULL,
  route_prefix VARCHAR(128) NOT NULL,
  entry_url VARCHAR(255) NOT NULL,
  remote_name VARCHAR(128),
  remote_entry VARCHAR(255),
  exposed_module VARCHAR(128),
  api_prefix VARCHAR(128) NOT NULL,
  owner_type VARCHAR(32) NOT NULL,
  owner_name VARCHAR(128),
  status VARCHAR(32) NOT NULL,
  sort_no INT DEFAULT 0,
  created_time DATETIME,
  updated_time DATETIME
);

CREATE TABLE sys_portal_notice (
  id BIGINT PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  content VARCHAR(512) NOT NULL,
  level VARCHAR(32) NOT NULL,
  sort_no INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  published_time DATETIME
);

CREATE TABLE sys_portal_access_log (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  module_code VARCHAR(64) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  access_time DATETIME
);

CREATE TABLE sys_user_role (id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL, role_id BIGINT NOT NULL);
CREATE TABLE sys_role_menu (id BIGINT PRIMARY KEY, role_id BIGINT NOT NULL, menu_id BIGINT NOT NULL);
CREATE TABLE sys_dept (id BIGINT PRIMARY KEY, parent_id BIGINT NOT NULL, dept_code VARCHAR(64), dept_name VARCHAR(128), sort_no INT, status VARCHAR(32), created_time DATETIME, updated_time DATETIME, deleted TINYINT DEFAULT 0);
CREATE TABLE sys_post (id BIGINT PRIMARY KEY, post_code VARCHAR(64), post_name VARCHAR(128), sort_no INT, status VARCHAR(32));
CREATE TABLE sys_dict_type (id BIGINT PRIMARY KEY, dict_code VARCHAR(64), dict_name VARCHAR(128), status VARCHAR(32));
CREATE TABLE sys_dict_item (id BIGINT PRIMARY KEY, dict_code VARCHAR(64), item_label VARCHAR(128), item_value VARCHAR(128), sort_no INT, status VARCHAR(32));
CREATE TABLE sys_user_warehouse (id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL, warehouse_id BIGINT NOT NULL);
CREATE TABLE sys_login_log (id BIGINT PRIMARY KEY, username VARCHAR(64), user_id BIGINT, login_ip VARCHAR(64), user_agent VARCHAR(255), login_status VARCHAR(32), fail_reason VARCHAR(255), login_time DATETIME, trace_id VARCHAR(128));
CREATE TABLE sys_oper_log (id BIGINT PRIMARY KEY, user_id BIGINT, username VARCHAR(64), module VARCHAR(64), operation VARCHAR(128), request_uri VARCHAR(255), request_method VARCHAR(16), request_params CLOB, result_status VARCHAR(32), error_message CLOB, cost_ms BIGINT, oper_ip VARCHAR(64), trace_id VARCHAR(128), created_time DATETIME);
CREATE TABLE sys_risk_record (id BIGINT PRIMARY KEY, risk_type VARCHAR(64), risk_target VARCHAR(128), risk_level VARCHAR(32), action VARCHAR(64), reason VARCHAR(255), expire_time DATETIME, extra_json CLOB, created_time DATETIME);
