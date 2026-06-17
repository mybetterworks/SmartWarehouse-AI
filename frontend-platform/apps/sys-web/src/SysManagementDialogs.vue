<template>
  <el-dialog v-model="sys.profileDialogVisible" title="个人信息" width="520px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="账号">{{ user?.username }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ user?.nickname }}</el-descriptions-item>
      <el-descriptions-item label="角色">{{ user?.roles?.join(', ') || '-' }}</el-descriptions-item>
      <el-descriptions-item label="仓库权限">{{ user?.warehouseIds?.join(', ') || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <el-dialog v-model="sys.passwordDialogVisible" title="修改密码" width="520px">
    <el-form :model="sys.passwordForm" label-width="96px">
      <el-form-item label="旧密码"><el-input v-model="sys.passwordForm.oldPassword" type="password" show-password /></el-form-item>
      <el-form-item label="新密码"><el-input v-model="sys.passwordForm.newPassword" type="password" show-password /></el-form-item>
      <el-form-item label="确认密码"><el-input v-model="sys.passwordForm.confirmPassword" type="password" show-password @keyup.enter="sys.submitPassword" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.passwordDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="sys.passwordSubmitting" @click="sys.submitPassword">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.userDialogVisible" title="用户维护" width="640px">
    <el-form :model="sys.userForm" label-width="88px">
      <el-form-item label="账号"><el-input v-model="sys.userForm.username" /></el-form-item>
      <el-form-item label="密码"><el-input v-model="sys.userForm.password" type="password" show-password placeholder="编辑时留空表示不修改" /></el-form-item>
      <el-form-item label="姓名"><el-input v-model="sys.userForm.nickname" /></el-form-item>
      <el-form-item label="手机号"><el-input v-model="sys.userForm.phone" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="sys.userForm.email" /></el-form-item>
      <el-form-item label="部门">
        <el-select v-model="sys.userForm.deptId" clearable filterable>
          <el-option v-for="item in flattenTree(sys.deptTreeOptions)" :key="item.id" :label="String(item.deptName)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位">
        <el-select v-model="sys.userForm.postId" clearable filterable>
          <el-option v-for="item in sys.postOptions" :key="item.id" :label="String(item.postName)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="sys.userRoleIds" multiple clearable filterable>
          <el-option v-for="role in sys.roleOptions" :key="role.id" :label="role.roleName" :value="role.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.userForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.userDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveUser">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.roleDialogVisible" title="角色维护" width="560px">
    <el-form :model="sys.roleForm" label-width="88px">
      <el-form-item label="角色编码"><el-input v-model="sys.roleForm.roleCode" /></el-form-item>
      <el-form-item label="角色名称"><el-input v-model="sys.roleForm.roleName" /></el-form-item>
      <el-form-item label="数据范围">
        <el-select v-model="sys.roleForm.dataScope">
          <el-option label="全部数据" value="ALL" />
          <el-option label="仓库数据" value="WAREHOUSE" />
          <el-option label="本人数据" value="SELF" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.roleForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="sys.roleForm.remark" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.roleDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveRole">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.roleMenuDialogVisible" title="角色菜单授权" width="560px">
    <el-tree ref="roleMenuTreeRef" :data="sys.menuTreeOptions" node-key="id" show-checkbox default-expand-all :props="{ label: 'menuName', children: 'children' }" />
    <template #footer>
      <el-button @click="sys.roleMenuDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveRoleMenus">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.permissionDialogVisible" title="仓库数据权限" width="520px">
    <el-input v-model="sys.warehouseInput" class="sys-dialog-input" placeholder="输入仓库 ID，多个用英文逗号分隔，例如 1,2,3" />
    <template #footer>
      <el-button @click="sys.permissionDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveWarehousePermission">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.menuDialogVisible" title="菜单维护" width="640px">
    <el-form :model="sys.menuForm" label-width="96px">
      <el-form-item label="上级菜单">
        <el-select v-model="sys.menuForm.parentId" filterable>
          <el-option label="根菜单" :value="0" />
          <el-option v-for="item in flattenTree(sys.menuTreeOptions)" :key="item.id" :label="String(item.menuName)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="菜单名称"><el-input v-model="sys.menuForm.menuName" /></el-form-item>
      <el-form-item label="菜单类型">
        <el-select v-model="sys.menuForm.menuType">
          <el-option label="目录" value="DIR" />
          <el-option label="菜单" value="MENU" />
          <el-option label="按钮" value="BUTTON" />
        </el-select>
      </el-form-item>
      <el-form-item label="模块编码"><el-input v-model="sys.menuForm.moduleCode" /></el-form-item>
      <el-form-item label="路由路径"><el-input v-model="sys.menuForm.path" /></el-form-item>
      <el-form-item label="组件标识"><el-input v-model="sys.menuForm.component" /></el-form-item>
      <el-form-item label="权限标识"><el-input v-model="sys.menuForm.permission" /></el-form-item>
      <el-form-item label="图标"><el-input v-model="sys.menuForm.icon" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="sys.menuForm.sortNo" :min="0" /></el-form-item>
      <el-form-item label="是否显示"><el-switch v-model="sys.menuForm.visible" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.menuForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.menuDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveMenu">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.deptDialogVisible" title="部门维护" width="560px">
    <el-form :model="sys.deptForm" label-width="88px">
      <el-form-item label="上级部门">
        <el-select v-model="sys.deptForm.parentId" filterable>
          <el-option label="根部门" :value="0" />
          <el-option v-for="item in flattenTree(sys.deptTreeOptions)" :key="item.id" :label="String(item.deptName)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门编码"><el-input v-model="sys.deptForm.deptCode" /></el-form-item>
      <el-form-item label="部门名称"><el-input v-model="sys.deptForm.deptName" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="sys.deptForm.sortNo" :min="0" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.deptForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.deptDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveDept">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.postDialogVisible" title="岗位维护" width="520px">
    <el-form :model="sys.postForm" label-width="88px">
      <el-form-item label="岗位编码"><el-input v-model="sys.postForm.postCode" /></el-form-item>
      <el-form-item label="岗位名称"><el-input v-model="sys.postForm.postName" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="sys.postForm.sortNo" :min="0" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.postForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.postDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.savePost">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.dictTypeDialogVisible" title="字典类型维护" width="520px">
    <el-form :model="sys.dictTypeForm" label-width="88px">
      <el-form-item label="字典编码"><el-input v-model="sys.dictTypeForm.dictCode" /></el-form-item>
      <el-form-item label="字典名称"><el-input v-model="sys.dictTypeForm.dictName" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.dictTypeForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.dictTypeDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveDictType">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.dictItemDialogVisible" title="字典项维护" width="520px">
    <el-form :model="sys.dictItemForm" label-width="88px">
      <el-form-item label="字典编码"><el-input v-model="sys.dictItemForm.dictCode" disabled /></el-form-item>
      <el-form-item label="显示文本"><el-input v-model="sys.dictItemForm.itemLabel" /></el-form-item>
      <el-form-item label="数据值"><el-input v-model="sys.dictItemForm.itemValue" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="sys.dictItemForm.sortNo" :min="0" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.dictItemForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.dictItemDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveDictItem">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="sys.moduleDialogVisible" title="前端模块维护" width="560px">
    <el-form :model="sys.moduleForm" label-width="96px">
      <el-form-item label="模块编码"><el-input v-model="sys.moduleForm.moduleCode" /></el-form-item>
      <el-form-item label="模块名称"><el-input v-model="sys.moduleForm.moduleName" /></el-form-item>
      <el-form-item label="路由前缀"><el-input v-model="sys.moduleForm.routePrefix" /></el-form-item>
      <el-form-item label="入口地址"><el-input v-model="sys.moduleForm.entryUrl" /></el-form-item>
      <el-form-item label="远程容器"><el-input v-model="sys.moduleForm.remoteName" placeholder="例如 smart_wms_web" /></el-form-item>
      <el-form-item label="远程入口"><el-input v-model="sys.moduleForm.remoteEntry" placeholder="例如 http://localhost:5176/apps/wms/assets/remoteEntry.js" /></el-form-item>
      <el-form-item label="暴露模块"><el-input v-model="sys.moduleForm.exposedModule" placeholder="./RemoteApp" /></el-form-item>
      <el-form-item label="接口前缀"><el-input v-model="sys.moduleForm.apiPrefix" /></el-form-item>
      <el-form-item label="负责人类型">
        <el-select v-model="sys.moduleForm.ownerType">
          <el-option label="Owner" value="OWNER" />
          <el-option label="Vendor" value="VENDOR" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人"><el-input v-model="sys.moduleForm.ownerName" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="sys.moduleForm.sortNo" :min="0" /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="sys.moduleForm.status">
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sys.moduleDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="sys.saveModule">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { LoginUser } from '@smartwarehouse/platform-types'
import type { SysManagementApi } from './useSysManagement'

const props = defineProps<{
  user?: LoginUser
  sys: SysManagementApi
}>()

const sys = reactive(props.sys)
const roleMenuTreeRef = props.sys.roleMenuTree

function flattenTree(source: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return source.flatMap((item) => [item, ...flattenTree((item.children as Array<Record<string, unknown>> | undefined) ?? [])])
}
</script>
