package com.smartwarehouse.sys;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * V02 登录与风控集成测试。
 *
 * <p>测试直接启动 sys-service 随机端口，验证认证接口真实可用，后续替换 MySQL/Redis 时仍应保持行为一致。</p>
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "smartwarehouse.jwt.secret=test-secret-for-v02-auth-flow-32chars",
                "smartwarehouse.sys.default-admin-password=TestLocalPassword",
                "spring.cloud.nacos.discovery.enabled=false",
                "spring.datasource.url=jdbc:h2:mem:smart_sys;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.datasource.username=sa",
                "spring.datasource.password=",
                "spring.data.redis.host=127.0.0.1",
                "spring.data.redis.port=6391",
                "spring.data.redis.timeout=200ms",
                "spring.sql.init.mode=always",
                "spring.sql.init.schema-locations=classpath:schema-h2.sql",
                "spring.sql.init.data-locations=classpath:data-h2.sql"
        }
)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthFlowIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @Order(5)
    void loginSuccessAndFailureRiskShouldWork() {
        Map<String, Object> loginBody = Map.of("username", "admin", "password", "TestLocalPassword");
        Map<?, ?> login = restTemplate.postForObject(url("/api/sys/auth/login"), json(loginBody), Map.class);
        assertThat(login.get("code")).isEqualTo("SUCCESS");
        String accessToken = String.valueOf(((Map<?, ?>) login.get("data")).get("accessToken"));
        assertThat(accessToken).isNotBlank();

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.set("X-Access-Token", accessToken);
        Map<?, ?> me = restTemplate.exchange(url("/api/sys/auth/me"), org.springframework.http.HttpMethod.GET,
                new HttpEntity<>(tokenHeaders), Map.class).getBody();
        assertThat(me).isNotNull();
        assertThat(me.get("code")).isEqualTo("SUCCESS");
        assertThat(((Map<?, ?>) me.get("data")).get("username")).isEqualTo("admin");

        Map<String, Object> passwordBody = Map.of(
                "oldPassword", "TestLocalPassword",
                "newPassword", "ChangedPassword123",
                "confirmPassword", "ChangedPassword123"
        );
        Map<?, ?> changed = restTemplate.exchange(url("/api/sys/auth/password"), HttpMethod.PUT,
                json(tokenHeaders, passwordBody), Map.class).getBody();
        assertThat(changed).isNotNull();
        assertThat(changed.get("code")).isEqualTo("SUCCESS");

        Map<?, ?> relogin = restTemplate.postForObject(url("/api/sys/auth/login"),
                json(Map.of("username", "admin", "password", "ChangedPassword123")), Map.class);
        assertThat(relogin.get("code")).isEqualTo("SUCCESS");

        Map<String, Object> badBody = Map.of("username", "admin", "password", "bad-password");
        for (int i = 0; i < 3; i++) {
            restTemplate.postForObject(url("/api/sys/auth/login"), json(badBody), Map.class);
        }

        Map<?, ?> risk = restTemplate.getForObject(url("/api/sys/auth/risk-state?username=admin"), Map.class);
        Map<?, ?> data = (Map<?, ?>) risk.get("data");
        assertThat(data.get("captchaRequired")).isEqualTo(true);
        assertThat(data.get("failureCount")).isEqualTo(3);
    }

    @Test
    @Order(2)
    void workbenchShouldBeAvailableForAdminAndReflectPortalData() {
        String accessToken = accessToken("admin", "TestLocalPassword");
        HttpHeaders tokenHeaders = tokenHeaders(accessToken);

        Map<?, ?> workbench = restTemplate.exchange(
                url("/api/sys/portal/workbench"),
                HttpMethod.GET,
                new HttpEntity<>(tokenHeaders),
                Map.class
        ).getBody();

        assertThat(workbench).isNotNull();
        assertThat(workbench.get("code")).isEqualTo("SUCCESS");
        Map<?, ?> data = (Map<?, ?>) workbench.get("data");
        Map<?, ?> profile = (Map<?, ?>) data.get("profile");
        assertThat(profile.get("username")).isEqualTo("admin");
        assertThat((Iterable<?>) data.get("notices")).isNotEmpty();
        assertThat((Iterable<?>) data.get("commonModules")).isNotEmpty();
        assertThat((Iterable<?>) data.get("recentModules")).isNotEmpty();
        assertThat((Iterable<?>) data.get("loginRecords")).isNotEmpty();
    }

    @Test
    @Order(3)
    void workbenchShouldBeAvailableForWmsManagerButStillBlockSysManagementApis() {
        String accessToken = accessToken("wms_manager", "TestLocalPassword");
        HttpHeaders tokenHeaders = tokenHeaders(accessToken);

        Map<?, ?> workbench = restTemplate.exchange(
                url("/api/sys/portal/workbench"),
                HttpMethod.GET,
                new HttpEntity<>(tokenHeaders),
                Map.class
        ).getBody();

        assertThat(workbench).isNotNull();
        assertThat(workbench.get("code")).isEqualTo("SUCCESS");
        Map<?, ?> data = (Map<?, ?>) workbench.get("data");
        Iterable<?> commonModules = (Iterable<?>) data.get("commonModules");
        Iterable<?> recentModules = (Iterable<?>) data.get("recentModules");
        assertThat(commonModules)
                .allSatisfy(item -> assertThat(((Map<?, ?>) item).get("moduleCode")).isEqualTo("wms"));
        assertThat(recentModules)
                .allSatisfy(item -> assertThat(((Map<?, ?>) item).get("moduleCode")).isEqualTo("wms"));

        ResponseEntity<Map> usersResponse = restTemplate.exchange(
                url("/api/sys/users"),
                HttpMethod.GET,
                new HttpEntity<>(tokenHeaders),
                Map.class
        );
        assertThat(usersResponse.getStatusCode().value()).isEqualTo(403);
    }

    @Test
    @Order(1)
    void usersApiShouldSupportQueryAndPagination() {
        String accessToken = accessToken("admin", "TestLocalPassword");
        HttpHeaders tokenHeaders = tokenHeaders(accessToken);

        Map<?, ?> users = restTemplate.exchange(
                url("/api/sys/users?pageNo=1&pageSize=1&username=admin&status=ENABLED"),
                HttpMethod.GET,
                new HttpEntity<>(tokenHeaders),
                Map.class
        ).getBody();

        assertThat(users).isNotNull();
        assertThat(users.get("code")).isEqualTo("SUCCESS");
        Map<?, ?> data = (Map<?, ?>) users.get("data");
        assertThat(data.get("pageNo")).isEqualTo(1);
        assertThat(data.get("pageSize")).isEqualTo(1);
        assertThat(data.get("total")).isEqualTo(1);
        java.util.List<?> records = (java.util.List<?>) data.get("records");
        assertThat(records).hasSize(1);
        assertThat(((Map<?, ?>) records.get(0)).get("username")).isEqualTo("admin");
    }

    @Test
    @Order(4)
    void portalAccessLogShouldAffectRecentAndCommonModules() {
        String accessToken = accessToken("admin", "TestLocalPassword");
        HttpHeaders tokenHeaders = tokenHeaders(accessToken);

        Map<String, Object> body = Map.of("moduleCode", "wms", "routePath", "/wms/materials");
        Map<?, ?> recordResponse = restTemplate.postForObject(
                url("/api/sys/portal/access-log"),
                json(tokenHeaders, body),
                Map.class
        );
        assertThat(recordResponse).isNotNull();
        assertThat(recordResponse.get("code")).isEqualTo("SUCCESS");

        Map<?, ?> workbench = restTemplate.exchange(
                url("/api/sys/portal/workbench"),
                HttpMethod.GET,
                new HttpEntity<>(tokenHeaders),
                Map.class
        ).getBody();

        assertThat(workbench).isNotNull();
        Map<?, ?> data = (Map<?, ?>) workbench.get("data");
        Map<?, ?> firstRecent = (Map<?, ?>) ((java.util.List<?>) data.get("recentModules")).get(0);
        assertThat(firstRecent.get("moduleCode")).isEqualTo("wms");
    }

    private String url(String path) {
        return "http://127.0.0.1:" + port + path;
    }

    private String accessToken(String username, String password) {
        Map<String, Object> loginBody = Map.of("username", username, "password", password);
        Map<?, ?> login = restTemplate.postForObject(url("/api/sys/auth/login"), json(loginBody), Map.class);
        assertThat(login).isNotNull();
        assertThat(login.get("code")).isEqualTo("SUCCESS");
        return String.valueOf(((Map<?, ?>) login.get("data")).get("accessToken"));
    }

    private HttpHeaders tokenHeaders(String accessToken) {
        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.set("X-Access-Token", accessToken);
        return tokenHeaders;
    }

    private HttpEntity<Map<String, Object>> json(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private HttpEntity<Map<String, Object>> json(HttpHeaders tokenHeaders, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.addAll(tokenHeaders);
        return new HttpEntity<>(body, headers);
    }
}
