package com.smartwarehouse.sys.infrastructure;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.id.SnowflakeIdGenerator;
import com.smartwarehouse.sys.api.SysDtos.*;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 基于 JDBC 的系统管理仓库。
 *
 * <p>本实现面向 V02 商业化基座：运行时连接 Docker MySQL，所有用户、角色、菜单、部门、岗位、
 * 字典、前端模块、数据权限、登录日志、操作日志和风控记录都落到数据库。当前不用 MyBatis Plus，
 * 是为了在个人实践项目里保持依赖轻量，但 SQL 和表结构已经按后续 ORM 迁移预留。</p>
 */
@Repository
public class JdbcSysRepository implements SysRepository {

    private final JdbcTemplate jdbc;
    private final SnowflakeIdGenerator idGenerator;

    public JdbcSysRepository(JdbcTemplate jdbc, SnowflakeIdGenerator idGenerator) {
        this.jdbc = jdbc;
        this.idGenerator = idGenerator;
    }

    @Override
    public UserRecord findUserByUsername(String username) {
        return queryOne("""
                select id, username, password, nickname, phone, email, dept_id, post_id, status, last_login_time, last_login_ip
                from sys_user
                where deleted = 0 and lower(username) = lower(?)
                """, userRecordMapper(), username == null ? "" : username);
    }

    @Override
    public UserRecord findUserById(Long id) {
        return queryOne("""
                select id, username, password, nickname, phone, email, dept_id, post_id, status, last_login_time, last_login_ip
                from sys_user
                where deleted = 0 and id = ?
                """, userRecordMapper(), id);
    }

    @Override
    public LoginUserView toLoginUser(UserRecord user) {
        List<String> roles = jdbc.query("""
                select r.role_code
                from sys_user_role ur
                join sys_role r on r.id = ur.role_id
                where ur.user_id = ? and r.deleted = 0 and r.status = 'ENABLED'
                order by r.id
                """, (rs, rowNum) -> rs.getString("role_code"), user.id());

        Set<String> permissions = new LinkedHashSet<>(jdbc.query("""
                select m.permission
                from sys_user_role ur
                join sys_role r on r.id = ur.role_id
                join sys_role_menu rm on rm.role_id = r.id
                join sys_menu m on m.id = rm.menu_id
                where ur.user_id = ?
                  and r.deleted = 0
                  and r.status = 'ENABLED'
                  and m.deleted = 0
                  and m.status = 'ENABLED'
                  and m.permission is not null
                  and m.permission <> ''
                order by m.sort_no, m.id
                """, (rs, rowNum) -> rs.getString("permission"), user.id()));

        List<Long> warehouseIds = jdbc.query("""
                select warehouse_id
                from sys_user_warehouse
                where user_id = ?
                order by warehouse_id
                """, (rs, rowNum) -> rs.getLong("warehouse_id"), user.id());

        return new LoginUserView(user.id(), user.username(), user.nickname(), roles, List.copyOf(permissions), warehouseIds);
    }

    @Override
    public boolean passwordMatches(UserRecord user, String rawPassword) {
        return user != null && user.passwordHash().equals(hashPassword(rawPassword));
    }

    @Override
    public void updatePassword(Long userId, String rawPassword) {
        // 密码哈希逻辑集中在仓库层，保证用户维护和个人改密使用同一套存储规则。
        jdbc.update("""
                update sys_user
                set password = ?, updated_time = ?
                where id = ? and deleted = 0
                """, hashPassword(rawPassword), LocalDateTime.now(), userId);
    }

    @Override
    public void updateLoginSuccess(Long userId, String ip) {
        jdbc.update("""
                update sys_user
                set last_login_time = ?, last_login_ip = ?, updated_time = ?
                where id = ? and deleted = 0
                """, LocalDateTime.now(), ip, LocalDateTime.now(), userId);
    }

    @Override
    public PageResult<UserView> pageUsers(PageQuery query, UserQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where deleted = 0");
        List<Object> args = new ArrayList<>();
        appendUserLikeFilter(whereSql, args, "username", request == null ? null : request.username());
        appendUserLikeFilter(whereSql, args, "nickname", request == null ? null : request.nickname());
        appendUserLikeFilter(whereSql, args, "phone", request == null ? null : request.phone());
        appendUserStatusFilter(whereSql, args, request == null ? null : request.status());

        long total = count("select count(*) from sys_user" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        String userPageSql = """
                select id, username, password, nickname, phone, email, dept_id, post_id, status, last_login_time, last_login_ip
                from sys_user
                """ + "\n" + whereSql + "\n" + """
                order by id
                limit ? offset ?
                """;
        List<UserView> records = jdbc.query(userPageSql, userRecordMapper(), pageArgs.toArray()).stream().map(this::toUserView).toList();
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    @Transactional
    public UserView saveUser(Long id, UserSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        UserRecord old = id == null ? null : findUserById(id);
        String passwordHash = request.password() == null || request.password().isBlank()
                ? (old == null ? hashPassword("123456") : old.passwordHash())
                : hashPassword(request.password());
        LocalDateTime now = LocalDateTime.now();
        if (old == null) {
            jdbc.update("""
                    insert into sys_user (id, username, password, nickname, phone, email, dept_id, post_id, status,
                                          tenant_id, created_by, created_time, updated_by, updated_time, deleted, version)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, 0, ?, 0, 0)
                    """, actualId, request.username(), passwordHash, request.nickname(), request.phone(), request.email(),
                    request.deptId(), request.postId(), normalizeStatus(request.status()), now, now);
        } else {
            jdbc.update("""
                    update sys_user
                    set username = ?, password = ?, nickname = ?, phone = ?, email = ?, dept_id = ?, post_id = ?,
                        status = ?, updated_by = 0, updated_time = ?, version = version + 1
                    where id = ? and deleted = 0
                    """, request.username(), passwordHash, request.nickname(), request.phone(), request.email(),
                    request.deptId(), request.postId(), normalizeStatus(request.status()), now, actualId);
        }
        return toUserView(findUserById(actualId));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        jdbc.update("update sys_user set deleted = 1, updated_time = ? where id = ?", LocalDateTime.now(), id);
        jdbc.update("delete from sys_user_role where user_id = ?", id);
        jdbc.update("delete from sys_user_warehouse where user_id = ?", id);
    }

    @Override
    public UserView updateUserStatus(Long id, String status) {
        jdbc.update("update sys_user set status = ?, updated_time = ? where id = ? and deleted = 0",
                normalizeStatus(status), LocalDateTime.now(), id);
        return toUserView(findUserById(id));
    }

    @Override
    @Transactional
    public void updateUserRoles(Long userId, List<Long> roleIds) {
        jdbc.update("delete from sys_user_role where user_id = ?", userId);
        for (Long roleId : roleIds) {
            jdbc.update("insert into sys_user_role (id, user_id, role_id) values (?, ?, ?)",
                    idGenerator.nextId(), userId, roleId);
        }
    }

    @Override
    @Transactional
    public void updateUserWarehouses(Long userId, List<Long> warehouseIds) {
        jdbc.update("delete from sys_user_warehouse where user_id = ?", userId);
        for (Long warehouseId : warehouseIds) {
            jdbc.update("insert into sys_user_warehouse (id, user_id, warehouse_id) values (?, ?, ?)",
                    idGenerator.nextId(), userId, warehouseId);
        }
    }

    @Override
    public PageResult<RoleView> pageRoles(PageQuery query, RoleQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where deleted = 0");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "role_code", request == null ? null : request.roleCode());
        appendLikeFilter(whereSql, args, "role_name", request == null ? null : request.roleName());
        appendStatusFilter(whereSql, args, request == null ? null : request.status());

        long total = count("select count(*) from sys_role" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<RoleView> records = jdbc.query("""
                select id, role_code, role_name, data_scope, status, remark
                from sys_role
                """ + "\n" + whereSql + "\n" + """
                order by id
                limit ? offset ?
                """, roleMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public List<RoleView> listRoles() {
        return jdbc.query("""
                select id, role_code, role_name, data_scope, status, remark
                from sys_role
                where deleted = 0
                order by id
                """, roleMapper());
    }

    @Override
    public RoleView saveRole(Long id, RoleSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        LocalDateTime now = LocalDateTime.now();
        if (id == null) {
            jdbc.update("""
                    insert into sys_role (id, role_code, role_name, data_scope, status, remark, tenant_id,
                                          created_by, created_time, updated_by, updated_time, deleted, version)
                    values (?, ?, ?, ?, ?, ?, 1, 0, ?, 0, ?, 0, 0)
                    """, actualId, request.roleCode(), request.roleName(), defaultValue(request.dataScope(), "SELF"),
                    normalizeStatus(request.status()), request.remark(), now, now);
        } else {
            jdbc.update("""
                    update sys_role
                    set role_code = ?, role_name = ?, data_scope = ?, status = ?, remark = ?,
                        updated_by = 0, updated_time = ?, version = version + 1
                    where id = ? and deleted = 0
                    """, request.roleCode(), request.roleName(), defaultValue(request.dataScope(), "SELF"),
                    normalizeStatus(request.status()), request.remark(), now, actualId);
        }
        return queryOne("""
                select id, role_code, role_name, data_scope, status, remark
                from sys_role
                where id = ? and deleted = 0
                """, roleMapper(), actualId);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        jdbc.update("update sys_role set deleted = 1, updated_time = ? where id = ?", LocalDateTime.now(), id);
        jdbc.update("delete from sys_role_menu where role_id = ?", id);
        jdbc.update("delete from sys_user_role where role_id = ?", id);
    }

    @Override
    @Transactional
    public void updateRoleMenus(Long roleId, List<Long> menuIds) {
        jdbc.update("delete from sys_role_menu where role_id = ?", roleId);
        for (Long menuId : menuIds) {
            jdbc.update("insert into sys_role_menu (id, role_id, menu_id) values (?, ?, ?)",
                    idGenerator.nextId(), roleId, menuId);
        }
    }

    @Override
    public List<MenuView> menuTree() {
        List<MenuRecord> menus = jdbc.query("""
                select id, parent_id, menu_name, menu_type, module_code, path, component, permission, icon, sort_no, visible, status
                from sys_menu
                where deleted = 0
                order by sort_no, id
                """, menuRecordMapper());
        return buildMenuTree(menus, 0L);
    }

    @Override
    public PageResult<MenuView> pageMenus(PageQuery query, MenuQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where deleted = 0");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "menu_name", request == null ? null : request.menuName());
        appendEqualFilter(whereSql, args, "menu_type", request == null ? null : request.menuType());
        appendEqualFilter(whereSql, args, "module_code", request == null ? null : request.moduleCode());
        appendStatusFilter(whereSql, args, request == null ? null : request.status());
        appendVisibleFilter(whereSql, args, request == null ? null : request.visible());

        long total = count("select count(*) from sys_menu" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<MenuView> records = jdbc.query("""
                select id, parent_id, menu_name, menu_type, module_code, path, component, permission, icon, sort_no, visible, status
                from sys_menu
                """ + "\n" + whereSql + "\n" + """
                order by sort_no, id
                limit ? offset ?
                """, menuRecordMapper(), pageArgs.toArray()).stream().map(menu -> toMenuView(menu, List.of())).toList();
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public List<MenuView> menuTreeForUser(Long userId) {
        // 门户侧菜单必须以后端授权结果为准，避免前端只做隐藏导致越权访问模块入口。
        List<MenuRecord> menus = jdbc.query("""
                select distinct m.id, m.parent_id, m.menu_name, m.menu_type, m.module_code, m.path, m.component,
                       m.permission, m.icon, m.sort_no, m.visible, m.status
                from sys_user_role ur
                join sys_role r on r.id = ur.role_id
                join sys_role_menu rm on rm.role_id = r.id
                join sys_menu m on m.id = rm.menu_id
                where ur.user_id = ?
                  and r.deleted = 0
                  and r.status = 'ENABLED'
                  and m.deleted = 0
                  and m.status = 'ENABLED'
                  and m.visible = 1
                order by m.sort_no, m.id
                """, menuRecordMapper(), userId);
        return buildMenuTree(menus, 0L);
    }

    @Override
    public MenuView saveMenu(Long id, MenuSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        LocalDateTime now = LocalDateTime.now();
        if (id == null) {
            jdbc.update("""
                    insert into sys_menu (id, parent_id, menu_name, menu_type, module_code, path, component, permission,
                                          icon, sort_no, visible, status, created_time, updated_time, deleted)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                    """, actualId, defaultLong(request.parentId()), request.menuName(), defaultValue(request.menuType(), "MENU"),
                    defaultValue(request.moduleCode(), "sys"), request.path(), request.component(), request.permission(),
                    request.icon(), defaultInt(request.sortNo()), visibleAsInt(request.visible()), normalizeStatus(request.status()), now, now);
        } else {
            jdbc.update("""
                    update sys_menu
                    set parent_id = ?, menu_name = ?, menu_type = ?, module_code = ?, path = ?, component = ?,
                        permission = ?, icon = ?, sort_no = ?, visible = ?, status = ?, updated_time = ?
                    where id = ? and deleted = 0
                    """, defaultLong(request.parentId()), request.menuName(), defaultValue(request.menuType(), "MENU"),
                    defaultValue(request.moduleCode(), "sys"), request.path(), request.component(), request.permission(),
                    request.icon(), defaultInt(request.sortNo()), visibleAsInt(request.visible()), normalizeStatus(request.status()),
                    now, actualId);
        }
        MenuRecord record = findMenuRecord(actualId);
        return toMenuView(record, List.of());
    }

    @Override
    @Transactional
    public void deleteMenu(Long id) {
        jdbc.update("update sys_menu set deleted = 1, updated_time = ? where id = ?", LocalDateTime.now(), id);
        jdbc.update("delete from sys_role_menu where menu_id = ?", id);
    }

    @Override
    public List<DeptView> deptTree() {
        List<DeptRecord> depts = jdbc.query("""
                select id, parent_id, dept_code, dept_name, sort_no, status
                from sys_dept
                where deleted = 0
                order by sort_no, id
                """, deptRecordMapper());
        return buildDeptTree(depts, 0L);
    }

    @Override
    public PageResult<DeptView> pageDepts(PageQuery query, DeptQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where deleted = 0");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "dept_code", request == null ? null : request.deptCode());
        appendLikeFilter(whereSql, args, "dept_name", request == null ? null : request.deptName());
        appendStatusFilter(whereSql, args, request == null ? null : request.status());

        long total = count("select count(*) from sys_dept" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<DeptView> records = jdbc.query("""
                select id, parent_id, dept_code, dept_name, sort_no, status
                from sys_dept
                """ + "\n" + whereSql + "\n" + """
                order by sort_no, id
                limit ? offset ?
                """, deptRecordMapper(), pageArgs.toArray()).stream().map(dept -> toDeptView(dept, List.of())).toList();
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public DeptView saveDept(Long id, DeptSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        LocalDateTime now = LocalDateTime.now();
        if (id == null) {
            jdbc.update("""
                    insert into sys_dept (id, parent_id, dept_code, dept_name, sort_no, status, created_time, updated_time, deleted)
                    values (?, ?, ?, ?, ?, ?, ?, ?, 0)
                    """, actualId, defaultLong(request.parentId()), request.deptCode(), request.deptName(),
                    defaultInt(request.sortNo()), normalizeStatus(request.status()), now, now);
        } else {
            jdbc.update("""
                    update sys_dept
                    set parent_id = ?, dept_code = ?, dept_name = ?, sort_no = ?, status = ?, updated_time = ?
                    where id = ? and deleted = 0
                    """, defaultLong(request.parentId()), request.deptCode(), request.deptName(),
                    defaultInt(request.sortNo()), normalizeStatus(request.status()), now, actualId);
        }
        DeptRecord record = queryOne("""
                select id, parent_id, dept_code, dept_name, sort_no, status
                from sys_dept
                where id = ? and deleted = 0
                """, deptRecordMapper(), actualId);
        return toDeptView(record, List.of());
    }

    @Override
    public void deleteDept(Long id) {
        jdbc.update("update sys_dept set deleted = 1, updated_time = ? where id = ?", LocalDateTime.now(), id);
    }

    @Override
    public PageResult<PostView> pagePosts(PageQuery query, PostQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "post_code", request == null ? null : request.postCode());
        appendLikeFilter(whereSql, args, "post_name", request == null ? null : request.postName());
        appendStatusFilter(whereSql, args, request == null ? null : request.status());

        long total = count("select count(*) from sys_post" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<PostView> records = jdbc.query("""
                select id, post_code, post_name, sort_no, status
                from sys_post
                """ + "\n" + whereSql + "\n" + """
                order by sort_no, id
                limit ? offset ?
                """, postMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public List<PostView> listPosts() {
        return jdbc.query("""
                select id, post_code, post_name, sort_no, status
                from sys_post
                order by sort_no, id
                """, postMapper());
    }

    @Override
    public PostView savePost(Long id, PostSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        if (id == null) {
            jdbc.update("""
                    insert into sys_post (id, post_code, post_name, sort_no, status)
                    values (?, ?, ?, ?, ?)
                    """, actualId, request.postCode(), request.postName(), defaultInt(request.sortNo()), normalizeStatus(request.status()));
        } else {
            jdbc.update("""
                    update sys_post
                    set post_code = ?, post_name = ?, sort_no = ?, status = ?
                    where id = ?
                    """, request.postCode(), request.postName(), defaultInt(request.sortNo()), normalizeStatus(request.status()), actualId);
        }
        return queryOne("""
                select id, post_code, post_name, sort_no, status
                from sys_post
                where id = ?
                """, postMapper(), actualId);
    }

    @Override
    public void deletePost(Long id) {
        jdbc.update("delete from sys_post where id = ?", id);
    }

    @Override
    public PageResult<DictTypeView> pageDictTypes(PageQuery query, DictTypeQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "dict_code", request == null ? null : request.dictCode());
        appendLikeFilter(whereSql, args, "dict_name", request == null ? null : request.dictName());
        appendStatusFilter(whereSql, args, request == null ? null : request.status());

        long total = count("select count(*) from sys_dict_type" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<DictTypeView> records = jdbc.query("""
                select id, dict_code, dict_name, status
                from sys_dict_type
                """ + "\n" + whereSql + "\n" + """
                order by id
                limit ? offset ?
                """, dictTypeMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public DictTypeView saveDictType(Long id, DictTypeSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        if (id == null) {
            jdbc.update("""
                    insert into sys_dict_type (id, dict_code, dict_name, status)
                    values (?, ?, ?, ?)
                    """, actualId, request.dictCode(), request.dictName(), normalizeStatus(request.status()));
        } else {
            jdbc.update("""
                    update sys_dict_type
                    set dict_code = ?, dict_name = ?, status = ?
                    where id = ?
                    """, request.dictCode(), request.dictName(), normalizeStatus(request.status()), actualId);
        }
        return queryOne("select id, dict_code, dict_name, status from sys_dict_type where id = ?", dictTypeMapper(), actualId);
    }

    @Override
    @Transactional
    public void deleteDictType(Long id) {
        DictTypeView dictType = queryOne("select id, dict_code, dict_name, status from sys_dict_type where id = ?", dictTypeMapper(), id);
        jdbc.update("delete from sys_dict_type where id = ?", id);
        if (dictType != null) {
            jdbc.update("delete from sys_dict_item where dict_code = ?", dictType.dictCode());
        }
    }

    @Override
    public PageResult<DictItemView> pageDictItems(PageQuery query, DictItemQueryRequest request) {
        String dictCode = request == null ? null : request.dictCode();
        if (dictCode == null || dictCode.isBlank()) {
            return new PageResult<>(List.of(), 0, query.pageNo(), query.pageSize());
        }

        StringBuilder whereSql = new StringBuilder(" where lower(dict_code) = ?");
        List<Object> args = new ArrayList<>();
        args.add(dictCode.trim().toLowerCase());
        appendLikeFilter(whereSql, args, "item_label", request.itemLabel());
        appendLikeFilter(whereSql, args, "item_value", request.itemValue());
        appendStatusFilter(whereSql, args, request.status());

        long total = count("select count(*) from sys_dict_item" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<DictItemView> records = jdbc.query("""
                select id, dict_code, item_label, item_value, sort_no, status
                from sys_dict_item
                """ + "\n" + whereSql + "\n" + """
                order by sort_no, id
                limit ? offset ?
                """, dictItemMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public DictItemView saveDictItem(Long id, DictItemSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        if (id == null) {
            jdbc.update("""
                    insert into sys_dict_item (id, dict_code, item_label, item_value, sort_no, status)
                    values (?, ?, ?, ?, ?, ?)
                    """, actualId, request.dictCode(), request.itemLabel(), request.itemValue(),
                    defaultInt(request.sortNo()), normalizeStatus(request.status()));
        } else {
            jdbc.update("""
                    update sys_dict_item
                    set dict_code = ?, item_label = ?, item_value = ?, sort_no = ?, status = ?
                    where id = ?
                    """, request.dictCode(), request.itemLabel(), request.itemValue(),
                    defaultInt(request.sortNo()), normalizeStatus(request.status()), actualId);
        }
        return queryOne("""
                select id, dict_code, item_label, item_value, sort_no, status
                from sys_dict_item
                where id = ?
                """, dictItemMapper(), actualId);
    }

    @Override
    public void deleteDictItem(Long id) {
        jdbc.update("delete from sys_dict_item where id = ?", id);
    }

    @Override
    public PageResult<FrontendModuleView> pageFrontendModules(PageQuery query, FrontendModuleQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "module_code", request == null ? null : request.moduleCode());
        appendLikeFilter(whereSql, args, "module_name", request == null ? null : request.moduleName());
        appendLikeFilter(whereSql, args, "owner_name", request == null ? null : request.ownerName());
        appendStatusFilter(whereSql, args, request == null ? null : request.status());

        long total = count("select count(*) from sys_frontend_module" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<FrontendModuleView> records = jdbc.query("""
                select id, module_code, module_name, route_prefix, entry_url, remote_name, remote_entry, exposed_module,
                       api_prefix, owner_type, owner_name, status, sort_no
                from sys_frontend_module
                """ + "\n" + whereSql + "\n" + """
                order by sort_no, id
                limit ? offset ?
                """, frontendModuleMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public List<FrontendModuleView> listEnabledFrontendModules() {
        return jdbc.query("""
                select id, module_code, module_name, route_prefix, entry_url, remote_name, remote_entry, exposed_module,
                       api_prefix, owner_type, owner_name, status, sort_no
                from sys_frontend_module
                where status = 'ENABLED'
                order by sort_no, id
                """, frontendModuleMapper());
    }

    @Override
    public List<FrontendModuleView> listEnabledFrontendModulesForUser(Long userId) {
        // 前端模块入口与菜单授权绑定：用户只要没有该 module_code 下的可见菜单，就不能看到模块卡片。
        return jdbc.query("""
                select distinct fm.id, fm.module_code, fm.module_name, fm.route_prefix, fm.entry_url, fm.remote_name,
                       fm.remote_entry, fm.exposed_module, fm.api_prefix, fm.owner_type, fm.owner_name, fm.status,
                       fm.sort_no
                from sys_frontend_module fm
                where fm.status = 'ENABLED'
                  and exists (
                    select 1
                    from sys_user_role ur
                    join sys_role r on r.id = ur.role_id
                    join sys_role_menu rm on rm.role_id = r.id
                    join sys_menu m on m.id = rm.menu_id
                    where ur.user_id = ?
                      and r.deleted = 0
                      and r.status = 'ENABLED'
                      and m.deleted = 0
                      and m.status = 'ENABLED'
                      and m.visible = 1
                      and m.module_code = fm.module_code
                  )
                order by fm.sort_no, fm.id
                """, frontendModuleMapper(), userId);
    }

    @Override
    public FrontendModuleView saveFrontendModule(Long id, FrontendModuleSaveRequest request) {
        Long actualId = id == null ? idGenerator.nextId() : id;
        LocalDateTime now = LocalDateTime.now();
        if (id == null) {
            jdbc.update("""
                    insert into sys_frontend_module (id, module_code, module_name, route_prefix, entry_url, remote_name,
                                                     remote_entry, exposed_module, api_prefix, owner_type, owner_name,
                                                     status, sort_no, created_time, updated_time)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, actualId, request.moduleCode(), request.moduleName(), request.routePrefix(), request.entryUrl(),
                    request.remoteName(), request.remoteEntry(), defaultValue(request.exposedModule(), "./RemoteApp"),
                    request.apiPrefix(), request.ownerType(), request.ownerName(), normalizeStatus(request.status()),
                    defaultInt(request.sortNo()), now, now);
        } else {
            jdbc.update("""
                    update sys_frontend_module
                    set module_code = ?, module_name = ?, route_prefix = ?, entry_url = ?, remote_name = ?,
                        remote_entry = ?, exposed_module = ?, api_prefix = ?, owner_type = ?, owner_name = ?,
                        status = ?, sort_no = ?, updated_time = ?
                    where id = ?
                    """, request.moduleCode(), request.moduleName(), request.routePrefix(), request.entryUrl(),
                    request.remoteName(), request.remoteEntry(), defaultValue(request.exposedModule(), "./RemoteApp"),
                    request.apiPrefix(), request.ownerType(), request.ownerName(), normalizeStatus(request.status()),
                    defaultInt(request.sortNo()), now, actualId);
        }
        return queryOne("""
                select id, module_code, module_name, route_prefix, entry_url, remote_name, remote_entry, exposed_module,
                       api_prefix, owner_type, owner_name, status, sort_no
                from sys_frontend_module
                where id = ?
                """, frontendModuleMapper(), actualId);
    }

    @Override
    public void deleteFrontendModule(Long id) {
        jdbc.update("delete from sys_frontend_module where id = ?", id);
    }

    @Override
    public PortalWorkbenchView loadPortalWorkbench(Long userId) {
        UserRecord user = findUserById(userId);
        if (user == null) {
            return new PortalWorkbenchView(null, List.of(), List.of(), List.of(), List.of());
        }

        LoginUserView loginUser = toLoginUser(user);
        PortalProfileView profile = new PortalProfileView(
                user.id(),
                user.username(),
                user.nickname(),
                loginUser.roles(),
                loginUser.permissions(),
                loginUser.warehouseIds(),
                user.lastLoginTime(),
                user.lastLoginIp()
        );

        List<PortalNoticeView> notices = jdbc.query("""
                select id, title, content, level, published_time
                from sys_portal_notice
                where status = 'ENABLED'
                order by published_time desc, sort_no asc, id desc
                limit 5
                """, (rs, rowNum) -> new PortalNoticeView(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("content"),
                rs.getString("level"),
                nullableTime(rs, "published_time")
        ));

        List<FrontendModuleView> commonModules = jdbc.query("""
                select fm.id, fm.module_code, fm.module_name, fm.route_prefix, fm.entry_url, fm.remote_name,
                       fm.remote_entry, fm.exposed_module, fm.api_prefix, fm.owner_type, fm.owner_name, fm.status,
                       fm.sort_no
                from sys_frontend_module fm
                join (
                    select module_code, count(*) as access_count, max(access_time) as last_access_time
                    from sys_portal_access_log
                    where user_id = ?
                    group by module_code
                ) stats on stats.module_code = fm.module_code
                where fm.status = 'ENABLED'
                  and exists (
                    select 1
                    from sys_user_role ur
                    join sys_role r on r.id = ur.role_id
                    join sys_role_menu rm on rm.role_id = r.id
                    join sys_menu m on m.id = rm.menu_id
                    where ur.user_id = ?
                      and r.deleted = 0
                      and r.status = 'ENABLED'
                      and m.deleted = 0
                      and m.status = 'ENABLED'
                      and m.visible = 1
                      and m.module_code = fm.module_code
                  )
                order by stats.access_count desc, stats.last_access_time desc, fm.sort_no, fm.id
                limit 6
                """, frontendModuleMapper(), userId, userId);

        List<FrontendModuleView> recentModules = jdbc.query("""
                select fm.id, fm.module_code, fm.module_name, fm.route_prefix, fm.entry_url, fm.remote_name,
                       fm.remote_entry, fm.exposed_module, fm.api_prefix, fm.owner_type, fm.owner_name, fm.status,
                       fm.sort_no
                from sys_frontend_module fm
                join (
                    select module_code, max(access_time) as last_access_time
                    from sys_portal_access_log
                    where user_id = ?
                    group by module_code
                ) stats on stats.module_code = fm.module_code
                where fm.status = 'ENABLED'
                  and exists (
                    select 1
                    from sys_user_role ur
                    join sys_role r on r.id = ur.role_id
                    join sys_role_menu rm on rm.role_id = r.id
                    join sys_menu m on m.id = rm.menu_id
                    where ur.user_id = ?
                      and r.deleted = 0
                      and r.status = 'ENABLED'
                      and m.deleted = 0
                      and m.status = 'ENABLED'
                      and m.visible = 1
                      and m.module_code = fm.module_code
                  )
                order by stats.last_access_time desc, fm.sort_no, fm.id
                limit 5
                """, frontendModuleMapper(), userId, userId);

        List<LoginLogView> loginRecords = jdbc.query("""
                select id, username, user_id, login_ip, user_agent, login_status, fail_reason, login_time, trace_id
                from sys_login_log
                where user_id = ?
                order by login_time desc
                limit 5
                """, loginLogMapper(), userId);

        return new PortalWorkbenchView(profile, notices, commonModules, recentModules, loginRecords);
    }

    @Override
    public void appendPortalAccessLog(Long userId, String moduleCode, String routePath) {
        jdbc.update("""
                insert into sys_portal_access_log (id, user_id, module_code, route_path, access_time)
                values (?, ?, ?, ?, ?)
                """, idGenerator.nextId(), userId, moduleCode, routePath, LocalDateTime.now());
    }

    @Override
    public PageResult<LoginLogView> pageLoginLogs(PageQuery query, LoginLogQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "username", request == null ? null : request.username());
        appendEqualFilter(whereSql, args, "login_status", request == null ? null : request.loginStatus());
        appendLikeFilter(whereSql, args, "login_ip", request == null ? null : request.loginIp());

        long total = count("select count(*) from sys_login_log" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<LoginLogView> records = jdbc.query("""
                select id, username, user_id, login_ip, user_agent, login_status, fail_reason, login_time, trace_id
                from sys_login_log
                """ + "\n" + whereSql + "\n" + """
                order by login_time desc
                limit ? offset ?
                """, loginLogMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public PageResult<OperLogView> pageOperLogs(PageQuery query, OperLogQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "username", request == null ? null : request.username());
        appendLikeFilter(whereSql, args, "module", request == null ? null : request.module());
        appendLikeFilter(whereSql, args, "operation", request == null ? null : request.operation());
        appendEqualFilter(whereSql, args, "result_status", request == null ? null : request.resultStatus());

        long total = count("select count(*) from sys_oper_log" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<OperLogView> records = jdbc.query("""
                select id, user_id, username, module, operation, request_uri, request_method, result_status,
                       error_message, cost_ms, oper_ip, trace_id, created_time
                from sys_oper_log
                """ + "\n" + whereSql + "\n" + """
                order by created_time desc
                limit ? offset ?
                """, operLogMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public PageResult<RiskRecordView> pageRiskRecords(PageQuery query, RiskRecordQueryRequest request) {
        StringBuilder whereSql = new StringBuilder(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        appendLikeFilter(whereSql, args, "risk_type", request == null ? null : request.riskType());
        appendLikeFilter(whereSql, args, "risk_target", request == null ? null : request.riskTarget());
        appendLikeFilter(whereSql, args, "action", request == null ? null : request.action());

        long total = count("select count(*) from sys_risk_record" + whereSql, args.toArray());
        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(query.pageSize());
        pageArgs.add(offset(query));

        List<RiskRecordView> records = jdbc.query("""
                select id, risk_type, risk_target, risk_level, action, reason, expire_time, extra_json, created_time
                from sys_risk_record
                """ + "\n" + whereSql + "\n" + """
                order by created_time desc
                limit ? offset ?
                """, riskRecordMapper(), pageArgs.toArray());
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }

    @Override
    public void appendLoginLog(String username, Long userId, String ip, String userAgent, String status, String failReason, String traceId) {
        jdbc.update("""
                insert into sys_login_log (id, username, user_id, login_ip, user_agent, login_status, fail_reason, login_time, trace_id)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, idGenerator.nextId(), username, userId, ip, userAgent, status, failReason, LocalDateTime.now(), traceId);
    }

    @Override
    public void appendOperLog(Long userId, String username, String module, String operation, String uri, String method,
                              String resultStatus, String errorMessage, long costMs, String ip, String traceId) {
        jdbc.update("""
                insert into sys_oper_log (id, user_id, username, module, operation, request_uri, request_method,
                                         request_params, result_status, error_message, cost_ms, oper_ip, trace_id, created_time)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, idGenerator.nextId(), userId, username, module, operation, uri, method, null, resultStatus,
                errorMessage, costMs, ip, traceId, LocalDateTime.now());
    }

    @Override
    public void appendRiskRecord(String type, String target, String level, String action, String reason, String expireTime, String extraJson) {
        jdbc.update("""
                insert into sys_risk_record (id, risk_type, risk_target, risk_level, action, reason, expire_time, extra_json, created_time)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, idGenerator.nextId(), type, target, level, action, reason, parseExpireTime(expireTime), extraJson, LocalDateTime.now());
    }

    private UserView toUserView(UserRecord user) {
        LoginUserView loginUser = toLoginUser(user);
        return new UserView(user.id(), user.username(), user.nickname(), user.phone(), user.email(), user.deptId(),
                user.postId(), user.status(), loginUser.roles(), loginUser.warehouseIds(), user.lastLoginTime(), user.lastLoginIp());
    }

    private RoleView toRoleView(Long id, String roleCode, String roleName, String dataScope, String status, String remark) {
        List<Long> menuIds = jdbc.query("""
                select menu_id
                from sys_role_menu
                where role_id = ?
                order by menu_id
                """, (rs, rowNum) -> rs.getLong("menu_id"), id);
        return new RoleView(id, roleCode, roleName, dataScope, status, remark, menuIds);
    }

    private MenuRecord findMenuRecord(Long id) {
        return queryOne("""
                select id, parent_id, menu_name, menu_type, module_code, path, component, permission, icon, sort_no, visible, status
                from sys_menu
                where id = ? and deleted = 0
                """, menuRecordMapper(), id);
    }

    private List<MenuView> buildMenuTree(List<MenuRecord> source, Long parentId) {
        return source.stream()
                .filter(menu -> menu.parentId().equals(parentId))
                .sorted(Comparator.comparing(MenuRecord::sortNo).thenComparing(MenuRecord::id))
                .map(menu -> toMenuView(menu, buildMenuTree(source, menu.id())))
                .toList();
    }

    private List<DeptView> buildDeptTree(List<DeptRecord> source, Long parentId) {
        return source.stream()
                .filter(dept -> dept.parentId().equals(parentId))
                .sorted(Comparator.comparing(DeptRecord::sortNo).thenComparing(DeptRecord::id))
                .map(dept -> toDeptView(dept, buildDeptTree(source, dept.id())))
                .toList();
    }

    private MenuView toMenuView(MenuRecord menu, List<MenuView> children) {
        return new MenuView(menu.id(), menu.parentId(), menu.menuName(), menu.menuType(), menu.moduleCode(), menu.path(),
                menu.component(), menu.permission(), menu.icon(), menu.sortNo(), menu.visible(), menu.status(), children);
    }

    private DeptView toDeptView(DeptRecord dept, List<DeptView> children) {
        return new DeptView(dept.id(), dept.parentId(), dept.deptCode(), dept.deptName(), dept.sortNo(), dept.status(), children);
    }

    private RowMapper<UserRecord> userRecordMapper() {
        return (rs, rowNum) -> new UserRecord(rs.getLong("id"), rs.getString("username"), rs.getString("password"),
                rs.getString("nickname"), rs.getString("phone"), rs.getString("email"), nullableLong(rs, "dept_id"),
                nullableLong(rs, "post_id"), rs.getString("status"), nullableTime(rs, "last_login_time"),
                rs.getString("last_login_ip"));
    }

    private RowMapper<RoleView> roleMapper() {
        return (rs, rowNum) -> toRoleView(rs.getLong("id"), rs.getString("role_code"), rs.getString("role_name"),
                rs.getString("data_scope"), rs.getString("status"), rs.getString("remark"));
    }

    private RowMapper<MenuRecord> menuRecordMapper() {
        return (rs, rowNum) -> new MenuRecord(rs.getLong("id"), rs.getLong("parent_id"), rs.getString("menu_name"),
                rs.getString("menu_type"), rs.getString("module_code"), rs.getString("path"), rs.getString("component"),
                rs.getString("permission"), rs.getString("icon"), rs.getInt("sort_no"), rs.getBoolean("visible"),
                rs.getString("status"));
    }

    private RowMapper<DeptRecord> deptRecordMapper() {
        return (rs, rowNum) -> new DeptRecord(rs.getLong("id"), rs.getLong("parent_id"), rs.getString("dept_code"),
                rs.getString("dept_name"), rs.getInt("sort_no"), rs.getString("status"));
    }

    private RowMapper<PostView> postMapper() {
        return (rs, rowNum) -> new PostView(rs.getLong("id"), rs.getString("post_code"), rs.getString("post_name"),
                rs.getInt("sort_no"), rs.getString("status"));
    }

    private RowMapper<DictTypeView> dictTypeMapper() {
        return (rs, rowNum) -> new DictTypeView(rs.getLong("id"), rs.getString("dict_code"), rs.getString("dict_name"),
                rs.getString("status"));
    }

    private RowMapper<DictItemView> dictItemMapper() {
        return (rs, rowNum) -> new DictItemView(rs.getLong("id"), rs.getString("dict_code"), rs.getString("item_label"),
                rs.getString("item_value"), rs.getInt("sort_no"), rs.getString("status"));
    }

    private RowMapper<FrontendModuleView> frontendModuleMapper() {
        return (rs, rowNum) -> new FrontendModuleView(rs.getLong("id"), rs.getString("module_code"),
                rs.getString("module_name"), rs.getString("route_prefix"), rs.getString("entry_url"),
                rs.getString("remote_name"), rs.getString("remote_entry"), rs.getString("exposed_module"),
                rs.getString("api_prefix"), rs.getString("owner_type"), rs.getString("owner_name"),
                rs.getString("status"), rs.getInt("sort_no"));
    }

    private RowMapper<LoginLogView> loginLogMapper() {
        return (rs, rowNum) -> new LoginLogView(rs.getLong("id"), rs.getString("username"), nullableLong(rs, "user_id"),
                rs.getString("login_ip"), rs.getString("user_agent"), rs.getString("login_status"),
                rs.getString("fail_reason"), nullableTime(rs, "login_time"), rs.getString("trace_id"));
    }

    private RowMapper<OperLogView> operLogMapper() {
        return (rs, rowNum) -> new OperLogView(rs.getLong("id"), nullableLong(rs, "user_id"), rs.getString("username"),
                rs.getString("module"), rs.getString("operation"), rs.getString("request_uri"),
                rs.getString("request_method"), rs.getString("result_status"), rs.getString("error_message"),
                rs.getLong("cost_ms"), rs.getString("oper_ip"), rs.getString("trace_id"), nullableTime(rs, "created_time"));
    }

    private RowMapper<RiskRecordView> riskRecordMapper() {
        return (rs, rowNum) -> new RiskRecordView(rs.getLong("id"), rs.getString("risk_type"), rs.getString("risk_target"),
                rs.getString("risk_level"), rs.getString("action"), rs.getString("reason"),
                nullableTime(rs, "expire_time") == null ? null : nullableTime(rs, "expire_time").toString(),
                rs.getString("extra_json"), nullableTime(rs, "created_time"));
    }

    private <T> T queryOne(String sql, RowMapper<T> mapper, Object... args) {
        try {
            return jdbc.queryForObject(sql, mapper, args);
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }

    private void appendUserLikeFilter(StringBuilder whereSql, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        whereSql.append(" and lower(").append(column).append(") like ?");
        args.add("%" + value.trim().toLowerCase() + "%");
    }

    private void appendUserStatusFilter(StringBuilder whereSql, List<Object> args, String status) {
        if (status == null || status.isBlank()) {
            return;
        }
        whereSql.append(" and status = ?");
        args.add(status.trim().toUpperCase());
    }

    private void appendStatusFilter(StringBuilder whereSql, List<Object> args, String status) {
        appendUserStatusFilter(whereSql, args, status);
    }

    private void appendLikeFilter(StringBuilder whereSql, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        whereSql.append(" and lower(").append(column).append(") like ?");
        args.add("%" + value.trim().toLowerCase() + "%");
    }

    private void appendEqualFilter(StringBuilder whereSql, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        whereSql.append(" and lower(").append(column).append(") = ?");
        args.add(value.trim().toLowerCase());
    }

    private void appendVisibleFilter(StringBuilder whereSql, List<Object> args, Boolean visible) {
        if (visible == null) {
            return;
        }
        whereSql.append(" and visible = ?");
        args.add(visible ? 1 : 0);
    }

    private long count(String sql, Object... args) {
        Long value = jdbc.queryForObject(sql, Long.class, args);
        return value == null ? 0 : value;
    }

    private int offset(PageQuery query) {
        return (query.pageNo() - 1) * query.pageSize();
    }

    private String normalizeStatus(String status) {
        return status == null || status.isBlank() ? "ENABLED" : status;
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private int visibleAsInt(Boolean visible) {
        return visible == null || visible ? 1 : 0;
    }

    private Long nullableLong(ResultSet rs, String column) throws java.sql.SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private LocalDateTime nullableTime(ResultSet rs, String column) throws java.sql.SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }

    private LocalDateTime parseExpireTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return java.time.Instant.parse(value).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception ignored) {
            return null;
        }
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(("SmartWarehouse-AI:" + (rawPassword == null ? "" : rawPassword)).getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte item : bytes) {
                builder.append(String.format("%02x", item));
            }
            return builder.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("password hash failed", ex);
        }
    }

    private record MenuRecord(Long id, Long parentId, String menuName, String menuType, String moduleCode, String path,
                              String component, String permission, String icon, Integer sortNo, Boolean visible,
                              String status) {
    }

    private record DeptRecord(Long id, Long parentId, String deptCode, String deptName, Integer sortNo, String status) {
    }
}
