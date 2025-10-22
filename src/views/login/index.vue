<script setup lang="ts">
// import { useI18n } from "vue-i18n";
// import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
// import { loginRules } from "./utils/rule";
import { useNav } from "@/layout/hooks/useNav";
// import type { FormInstance } from "element-plus";
// import { $t, transformI18n } from "@/plugins/i18n";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
// import { avatar, illustration } from "./utils/static";
// import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { initRouter } from "@/router/utils";
import { encryptRSA } from "./utils/encrypt";
// import Lock from "@iconify-icons/ri/lock-fill";
// import User from "@iconify-icons/ri/user-3-fill";
import dragVerifyImgChip from "./dragVerifyImgChip.vue";
import Check from "@iconify-icons/ep/check";
import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";

defineOptions({
  name: "Login"
});
const router = useRouter();
const loading = ref(false);
// const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

// const { t } = useI18n();
const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

// 登录表单信息
const ruleForm = reactive({
  // 页面交互用
  showUsernameClear: false,
  showPasswordClear: false,
  isPwd: true, // 页面交互用

  // 接口使用
  username: "",
  password: "",
  tip: "" // 错误提示
});

function beforeLogin() {
  if (ruleForm.username == "" || ruleForm.password == "") {
    ruleForm.tip = "账号密码不能为空";
    return false;
  }
  if (ruleForm.username.length == 0) {
    ruleForm.tip = "账号至少为1位";
    return false;
  }
  if (ruleForm.password.length < 1) {
    ruleForm.tip = "密码至少为1位";
    return false;
  }
  ruleForm.tip = "";
  return true;
}

function toLogin() {
  if (!beforeLogin()) {
    return;
  }

  if (securityVerify.value == true && !usernameChange.value) {
    ruleForm.tip = "请完成安全验证,方可登录";
    showDragVerify();
    return;
  }
  usernameChange.value=false
  login(ruleForm.username, ruleForm.password,null);
}

function login(username, password, captchaParam) {
  let formData={
    username: username,
    password: encryptRSA(password),
  }
  if(captchaParam){
    formData.captcha=captchaParam.value
  }
  useUserStoreHook()
    .loginByUsername(formData)
    .then(res => {
      if (res?.u) {
        // 获取后端路由
        initRouter().then(() => {
          router.push("/");
          message("登录成功", { type: "success" });
        });
      } else if (res.code != 200) {
        loading.value = false;
        securityVerify.value = false;
        if (res.code == 6666) {
          securityVerify.value = true;
          isPassing.value = false;
          captcha.value=res.data
        }
        ruleForm.tip = res.msg;
      } else {
        securityVerify.value = false;
      }
    });
}

function showDragVerify() {
  dragShow.value = true;
  dragVerify.value.reset();
  reimg();
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
function onBlur() {
  ruleForm.showUsernameClear = false;
  if (ruleForm.username == "") {
    usernameChange.value=false;
    preUsername.value ='';
    securityVerify.value = false;
    captcha.value=0
    return;
  }

  if(preUsername.value != ruleForm.username){
    if(preUsername.value==''){
      usernameChange.value=false;
    }else{
      usernameChange.value=true;
      securityVerify.value = false;
      captcha.value=0
    }
    preUsername.value = ruleForm.username
    ruleForm.tip = "";
  }else{
    usernameChange.value=false
  }

}
/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    toLogin();
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});

//===========    滑块
const isPassing = ref(false);
// const slideImg = ref(getUrl('slide'))
const slideImg = ref("");

const securityVerify = ref(false);
const preUsername = ref("");

const dragShow = ref(false);
const dragVerify = ref("");

let randNum = -1; // 保留上次的随机数

const captcha=ref(0)

const usernameChange=ref(false)

// 滑块成功
function handlePass() {
  securityVerify.value = false;
  setTimeout(() => {
    dragShow.value = false;
    loading.value = true;
    login(ruleForm.username, ruleForm.password,captcha);
  }, 500);
}

/**
 * 随机数范围 【min,max)
 * @param min
 * @param max
 */
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// 刷新换图
function reimg() {
  let num = getRandom(1, 5);
  // 当生成的随机数重复时，随机数+1，超过最大值，重置为0
  if (randNum === num) {
    num += 1;
    if (num > 4) {
      num = 1;
    }
  }
  randNum = num;
  slideImg.value = getUrl("slide" + num);
}
function getUrl(name) {
  return new URL(`./img/${name}.png`, import.meta.url).href;
}
</script>

<template>
  <div class="absolute flex-c right-5 top-3" v-if="false">
    <!-- 主题 -->
    <el-switch
      v-model="dataTheme"
      inline-prompt
      :active-icon="dayIcon"
      :inactive-icon="darkIcon"
      @change="dataThemeChange"
    />
    <!-- 国际化 -->
    <el-dropdown trigger="click">

      <template #dropdown>
        <el-dropdown-menu class="translation">
          <el-dropdown-item
            :style="getDropdownItemStyle(locale, 'zh')"
            :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
            @click="translationCh"
          >
            <IconifyIconOffline
              class="check-zh"
              v-show="locale === 'zh'"
              :icon="Check"
            />
            简体中文
          </el-dropdown-item>
          <el-dropdown-item
            :style="getDropdownItemStyle(locale, 'en')"
            :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
            @click="translationEn"
          >
            <span class="check-en" v-show="locale === 'en'">
              <IconifyIconOffline :icon="Check" />
            </span>
            English
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <div class="bg">
    <div class="main h100">
      <div class="flex h100" style="align-items: center">
        <div class="flex1" />
        <div class="login-section">
          <img class="logo" src="./img/logo.png" alt="" />
          <div class="tip">{{ ruleForm.tip }}</div>
          <div class="input-section flex-center">
            <img class="account" src="./img/account.png" alt="" />
            <input
              type="text"
              class="username"
              maxlength="50"
              placeholder="请输入账号"
              autocomplete="off"
              v-model.trim="ruleForm.username"
              @focus="ruleForm.showUsernameClear = true"
              @blur.enter.stop="onBlur()"
            />
            <img
              class="clear"
              src="./img/clear.png"
              alt=""
              v-show="ruleForm.showUsernameClear && ruleForm.username"
              @mousedown="ruleForm.username = ''"
            />
          </div>
          <div class="input-section flex-center">
            <img class="account" src="./img/lock.png" alt="" />
            <input
              :type="ruleForm.isPwd ? 'password' : 'text'"
              class="username"
              placeholder="请输入密码"
              maxlength="20"
              v-model.trim="ruleForm.password"
              @focus="ruleForm.showPasswordClear = true"
              @blur="ruleForm.showPasswordClear = false"
            />
            <!--blur事件优先级比click高，此处要把click改为mousedown -->
            <img
              class="clear"
              src="./img/clear.png"
              alt=""
              v-show="ruleForm.showPasswordClear && ruleForm.password"
              @mousedown="ruleForm.password = ''"
            />
            <img
              class="code"
              src="./img/code_hide.png"
              alt=""
              v-show="ruleForm.isPwd"
              @click="ruleForm.isPwd = false"
            />
            <img
              class="code"
              src="./img/code_show.png"
              alt=""
              v-show="!ruleForm.isPwd"
              @click="ruleForm.isPwd = true"
            />
          </div>
          <div class="btn" @click="toLogin">登录</div>
        </div>
      </div>
    </div>
    <p class="footer">
      广州极点三维信息科技有限公司版权所有&nbsp;&nbsp;&nbsp;&nbsp;粤ICP备000000000号
    </p>
  </div>
  <div class="mask flex-vertical" v-show="dragShow">
    <div class="drag-section">
      <div class="top flex-between">
        <p>请完成安全验证</p>
        <img
          class="close"
          src="./img/close.png"
          alt=""
          @click="dragShow = false"
        />
      </div>
      <drag-verify-img-chip
        class="drag-verify"
        ref="dragVerify"
        :imgsrc="slideImg"
        v-model:isPassing="isPassing"
        :showRefresh="true"
        handlerIcon="arrow-icon"
        successIcon="success-icon"
        refresh-icon="refresh-icon"
        @refresh="reimg"
        @passcallback="handlePass"
        text="请按住滑块拖动"
        :width="360"
        :height="44"
        :background="'rgba(0, 0, 0, 0.06)'"
        handler-bg="#595959"
        radius="0 0 4px 4px"
      />
    </div>
  </div>
</template>

<style scoped>
</style>

<style lang="scss" scoped>
.h100 {
  height: 100%;
}

.bg {
  background-image: url("./img/bg.png");
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.main {
  width: 1200px;
  margin: 0 auto;
}

.login-section {
  //background: #fff;
  background: rgba(255, 255, 255, 0.5);
  width: 400px;
  height: 480px;
  /*box-shadow: 0px 3px 6px -4px rgba(0, 0, 0, 0.12),
    0px 6px 16px rgba(0, 0, 0, 0.08), 0px 9px 28px 8px rgba(0, 0, 0, 0.05);*/
  border-radius: 16px;
  box-sizing: border-box;
  padding-top: 78px;

  .logo {
    margin: 0 auto;
  }

  .tip {
    color: #ff4d4f;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 4px;
    min-height: 20px;
    margin-left: 40px;
  }

  .input-section {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    width: 320px;
    height: 44px;
    margin: 0 auto 16px;
    box-sizing: border-box;
    padding-right: 12px;
    background: #fff;

    input {
      font-weight: 400;
      font-size: 14px;
      flex: 1;
      outline: none;

      &::-webkit-input-placeholder {
        color: #bfbfbf;
      }
    }

    .account {
      margin-left: 12px;
      margin-right: 8px;
    }

    .clear {
      cursor: pointer;
    }

    .code {
      cursor: pointer;
    }

    &:hover,
    &:focus {
      border-color: #1890ff;
    }
  }

  .btn {
    background: #595959;
    border-radius: 4px;
    height: 44px;
    width: 320px;
    text-align: center;
    line-height: 44px;
    font-weight: 500;
    font-size: 16px;
    color: #ffffff;
    margin: 0 auto;

    &:hover {
      background: #262626;
    }

    &:active {
      background: #000;
    }
  }
}

.footer {
  font-weight: 400;
  font-size: 12px;
  color: #fff;
  text-align: center;
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
}

.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
}

.drag-section {
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0px 6px 16px rgba(0, 0, 0, 0.08), 0px 9px 28px 8px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  background: #ffffff;
  height: 320px;
  width: 400px;

  .top {
    height: 54px;
    padding: 0 20px;
    align-items: center;

    p {
      font-weight: 500;
      font-size: 16px;
      color: #262626;
    }

    .close {
      cursor: pointer;
    }
  }

  .drag-verify {
    margin: 0 auto;
    width: 360px;
  }
}

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
</style>
<style>
.dv_handler {
  display: flex;
  justify-content: center;
  align-items: center;
}

.arrow-icon {
  background-color: #595959;
  width: 20px;
  height: 20px;
  display: block;
  background-image: url("./img/double_arrow_right.png");
  background-size: 100% 100%;
}

.drag-verify .dv_text {
  color: #262626;
  font-weight: 400;
  font-size: 14px;
}

.success-icon {
  /*background-color: blue;*/
  width: 16px;
  height: 16px;
  display: block;
  background-image: url("./img/success.png");
}

.refresh {
  top: 8px !important;
  right: 8px !important;
}

.refresh-icon {
  width: 20px;
  height: 20px;
  display: block;
  background-image: url("./img/refresh.png");
  background-size: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
