package com.smartwarehouse.sys;

import com.smartwarehouse.platform.redis.RedisKeys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * V02 本地 Docker 中间件验收测试。
 *
 * <p>这个测试不使用 H2，也不注入临时端口配置，目的是让自动测试和人工启动走同一套本地默认配置：
 * sys-service 默认连接 127.0.0.1:13306 的 MySQL、127.0.0.1:16381 的 Redis。
 * 如果本测试失败，说明开发者直接启动项目时大概率也会失败，不能把它误判为“仅测试环境问题”。</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LocalDockerMiddlewareAcceptanceTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void localDockerMysqlAndRedisShouldSupportRealSysFlow() {
        normalizeWarehouseManagerPermission();

        // 真实 Redis 会保留手工测试留下的失败次数，这里只清理 admin 账号的风控 Key，避免自动验收被历史状态污染。
        redisTemplate.delete(List.of(
                RedisKeys.userLoginFail("admin"),
                RedisKeys.userLoginLock("admin"),
                RedisKeys.userLoginFail("wms_manager"),
                RedisKeys.userLoginLock("wms_manager"),
                RedisKeys.ipLoginFail("127.0.0.1"),
                RedisKeys.ipLoginLock("127.0.0.1"),
                RedisKeys.ipLoginFail("0:0:0:0:0:0:0:1"),
                RedisKeys.ipLoginLock("0:0:0:0:0:0:0:1")
        ));

        Map<?, ?> health = restTemplate.getForObject(url("/actuator/health"), Map.class);
        assertThat(health).isNotNull();
        assertThat(health.get("status")).isEqualTo("UP");

        String accessToken = loginAsAdmin();
        HttpEntity<Void> authorized = authorized(accessToken);

        Map<?, ?> me = exchange("/api/sys/auth/me", HttpMethod.GET, authorized);
        assertThat(me.get("code")).isEqualTo("SUCCESS");
        assertThat(((Map<?, ?>) me.get("data")).get("username")).isEqualTo("admin");

        Map<?, ?> modules = exchange("/api/sys/frontend-modules/enabled", HttpMethod.GET, authorized);
        assertThat(modules.get("code")).isEqualTo("SUCCESS");
        assertThat((List<?>) modules.get("data")).isNotEmpty();
        assertWarehouseManagerOnlySeesWmsModuleAndMenu();

        // 通过新增、修改、删除临时岗位验证 MySQL 写入、查询和操作日志 AOP 都能在真实数据库上工作。
        String uniqueCode = "AUTO_POST_" + System.currentTimeMillis();
        Long postId = null;
        try {
            Map<?, ?> created = post("/api/sys/posts", accessToken, Map.of(
                    "postCode", uniqueCode,
                    "postName", "自动验收岗位",
                    "sortNo", 999,
                    "status", "ENABLED"
            ));
            assertThat(created.get("code")).isEqualTo("SUCCESS");
            postId = ((Number) ((Map<?, ?>) created.get("data")).get("id")).longValue();

            Map<?, ?> updated = exchange("/api/sys/posts/" + postId, HttpMethod.PUT,
                    json(accessToken, Map.of(
                            "postCode", uniqueCode,
                            "postName", "自动验收岗位-已更新",
                            "sortNo", 998,
                            "status", "ENABLED"
                    )));
            assertThat(updated.get("code")).isEqualTo("SUCCESS");
            assertThat(((Map<?, ?>) updated.get("data")).get("postName")).isEqualTo("自动验收岗位-已更新");
        } finally {
            if (postId != null) {
                Map<?, ?> deleted = exchange("/api/sys/posts/" + postId, HttpMethod.DELETE, authorized);
                assertThat(deleted.get("code")).isEqualTo("SUCCESS");
            }
        }
    }

    private void normalizeWarehouseManagerPermission() {
        // 本地 Docker MySQL 可能保留旧版本授权数据，验收前先把仓库主管角色收敛到 WMS 模块。
        jdbcTemplate.update("""
                delete from sys_role_menu
                where role_id = 2
                  and menu_id in (select id from sys_menu where module_code <> 'wms')
                """);
        jdbcTemplate.update("""
                insert into sys_role_menu (id, role_id, menu_id)
                select 210000 + id, 2, id from sys_menu where module_code = 'wms'
                on duplicate key update menu_id = values(menu_id)
                """);
    }

    private void assertWarehouseManagerOnlySeesWmsModuleAndMenu() {
        String accessToken = loginAs("wms_manager", "123456");
        HttpEntity<Void> authorized = authorized(accessToken);

        Map<?, ?> modules = exchange("/api/sys/frontend-modules/enabled", HttpMethod.GET, authorized);
        assertThat(modules.get("code")).isEqualTo("SUCCESS");
        List<String> moduleCodes = ((List<?>) modules.get("data")).stream()
                .map(item -> String.valueOf(((Map<?, ?>) item).get("moduleCode")))
                .toList();
        assertThat(moduleCodes).containsExactly("wms");

        Map<?, ?> menus = exchange("/api/sys/menus/tree", HttpMethod.GET, authorized);
        assertThat(menus.get("code")).isEqualTo("SUCCESS");
        List<String> menuModuleCodes = ((List<?>) menus.get("data")).stream()
                .map(item -> String.valueOf(((Map<?, ?>) item).get("moduleCode")))
                .toList();
        assertThat(menuModuleCodes).containsExactly("wms");

        Map<?, ?> me = exchange("/api/sys/auth/me", HttpMethod.GET, authorized);
        assertThat(me.get("code")).isEqualTo("SUCCESS");
        assertThat(((Map<?, ?>) me.get("data")).get("username")).isEqualTo("wms_manager");

        Map<?, ?> forbiddenUsers = exchange("/api/sys/users", HttpMethod.GET, authorized);
        assertThat(forbiddenUsers.get("code")).isEqualTo("FORBIDDEN");
    }

    private String loginAsAdmin() {
        return loginAs("admin", "123456");
    }

    private String loginAs(String username, String password) {
        Map<?, ?> login = post("/api/sys/auth/login", null, Map.of("username", username, "password", password));
        assertThat(login.get("code")).isEqualTo("SUCCESS");
        return String.valueOf(((Map<?, ?>) login.get("data")).get("accessToken"));
    }

    private Map<?, ?> post(String path, String token, Map<String, Object> body) {
        return restTemplate.postForObject(url(path), json(token, body), Map.class);
    }

    private Map<?, ?> exchange(String path, HttpMethod method, HttpEntity<?> entity) {
        Map<?, ?> body = restTemplate.exchange(url(path), method, entity, Map.class).getBody();
        assertThat(body).isNotNull();
        return body;
    }

    private HttpEntity<Void> authorized(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-Access-Token", token);
        return new HttpEntity<>(headers);
    }

    private HttpEntity<Map<String, Object>> json(String token, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
            headers.set("X-Access-Token", token);
        }
        return new HttpEntity<>(body, headers);
    }

    private String url(String path) {
        return "http://127.0.0.1:" + port + path;
    }
}
