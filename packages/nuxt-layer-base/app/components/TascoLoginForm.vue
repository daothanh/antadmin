<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { message } from '@antadmin/ui'
import type { AuthClientOption, AuthMethod, LoginCredentials } from '@antadmin/composables'
import { useAuth } from '@antadmin/composables'
import { useRuntimeConfig } from 'nuxt/app'

// Form đăng nhập first-party, cấu hình được:
//  - endpoint/field mapping ở runtimeConfig.auth (server) → BFF /auth/*
//  - phương thức, dropdown app, nhãn/logo qua props (fallback public.auth)
// Dự án khác chỉ cần <AntAdminLoginForm /> hoặc truyền props để tuỳ biến.

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    logo?: string
    /** Phương thức xác thực bật trên form. Mặc định lấy từ public.auth.methods. */
    methods?: AuthMethod[]
    /** Hiện dropdown chọn ứng dụng. Mặc định lấy từ public.auth.showClientSelect. */
    showClientSelect?: boolean
    /** Cố định 1 client (code) khi không hiện dropdown. */
    defaultClientCode?: string
  }>(),
  {
    title: 'Đăng nhập',
    subtitle: '',
    logo: '',
    methods: undefined,
    showClientSelect: undefined,
    defaultClientCode: undefined,
  },
)

const emit = defineEmits<{ success: [] }>()

const publicAuth = (useRuntimeConfig().public.auth ?? {}) as {
  methods?: string
  showClientSelect?: boolean
  defaultClientCode?: string
}

// Nhãn hiển thị của từng phương thức.
const METHOD_LABELS: Record<AuthMethod, string> = {
  google: 'Google Authentication',
  telegram: 'Gửi OTP qua Telegram',
}

const enabledMethods = computed<AuthMethod[]>(() => {
  if (props.methods?.length) return props.methods
  const raw = publicAuth.methods ?? ''
  return raw
    .split(',')
    .map((m) => m.trim())
    .filter((m): m is AuthMethod => m === 'google' || m === 'telegram')
})

const showClients = computed(() =>
  props.showClientSelect ?? publicAuth.showClientSelect ?? true,
)
const defaultCode = computed(() => props.defaultClientCode ?? publicAuth.defaultClientCode ?? '')

const { loginWithPassword } = useAuth()

const form = reactive<LoginCredentials>({
  clientId: undefined,
  username: '',
  password: '',
  method: enabledMethods.value[0],
  otp: '',
})

// Telegram cần bấm "Gửi mã" trước; Google Authenticator tự sinh mã trong app.
const needsOtpSend = computed(() => form.method === 'telegram')

const clients = ref<AuthClientOption[]>([])
const clientsLoading = ref(false)
const submitting = ref(false)
const otpCountdown = ref(0)
// transactionId trả về từ bước gửi OTP Telegram — gửi kèm khi đăng nhập.
const transactionId = ref<string | undefined>()
let countdownTimer: ReturnType<typeof setInterval> | undefined

async function loadClients() {
  // IAM định danh ứng dụng bằng CODE (vd WP_HRM), nên dropdown dùng code làm value.
  if (!showClients.value) {
    if (defaultCode.value) form.clientId = defaultCode.value
    return
  }
  clientsLoading.value = true
  try {
    const { clients: list } = await $fetch<{ clients: AuthClientOption[] }>('/auth/clients')
    clients.value = list
    const preset = defaultCode.value
      ? list.find((c) => c.code === defaultCode.value)
      : undefined
    form.clientId = (preset ?? list[0])?.code
  } catch {
    message.error('Không tải được danh sách ứng dụng.')
  } finally {
    clientsLoading.value = false
  }
}

async function onSendOtp() {
  if (!form.username.trim() || !form.password) {
    message.warning('Nhập tên đăng nhập và mật khẩu trước khi gửi mã.')
    return
  }
  try {
    const res = await $fetch<{ transactionId?: string }>('/auth/otp/send', {
      method: 'POST',
      body: { username: form.username, password: form.password, clientId: form.clientId },
    })
    transactionId.value = res.transactionId
    message.success('Đã gửi mã OTP qua Telegram.')
    startCountdown(60)
  } catch (err) {
    message.error(errorMessage(err, 'Gửi OTP thất bại.'))
  }
}

function startCountdown(seconds: number) {
  otpCountdown.value = seconds
  countdownTimer = setInterval(() => {
    otpCountdown.value -= 1
    if (otpCountdown.value <= 0 && countdownTimer) clearInterval(countdownTimer)
  }, 1000)
}

function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { statusMessage?: string; message?: string } })?.data
  return data?.statusMessage || data?.message || fallback
}

async function onSubmit() {
  submitting.value = true
  try {
    await loginWithPassword({ ...form, transactionId: transactionId.value })
    emit('success')
  } catch (err) {
    message.error(errorMessage(err, 'Đăng nhập thất bại.'))
  } finally {
    submitting.value = false
  }
}

onMounted(loadClients)
onBeforeUnmount(() => countdownTimer && clearInterval(countdownTimer))
</script>

<template>
  <div class="antadmin-login">
    <CCard class="antadmin-login__card">
      <div class="antadmin-login__head">
        <img
          v-if="logo"
          :src="logo"
          alt=""
          class="antadmin-login__logo"
        >
        <h1 class="antadmin-login__title">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="antadmin-login__subtitle"
        >
          {{ subtitle }}
        </p>
      </div>

      <a-form
        layout="vertical"
        :model="form"
        @finish="onSubmit"
      >
        <a-form-item
          v-if="showClients"
          label="Chọn ứng dụng"
          name="clientId"
          :rules="[{ required: true, message: 'Vui lòng chọn ứng dụng.' }]"
        >
          <a-select
            v-model:value="form.clientId"
            :loading="clientsLoading"
            :options="clients.map((c) => ({ value: c.code, label: c.name }))"
            placeholder="Chọn ứng dụng"
          />
        </a-form-item>

        <a-form-item
          label="Tên đăng nhập"
          name="username"
          :rules="[{ required: true, message: 'Vui lòng nhập tên đăng nhập.' }]"
        >
          <a-input
            v-model:value="form.username"
            autocomplete="username"
          />
        </a-form-item>

        <a-form-item
          label="Mật khẩu"
          name="password"
          :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]"
        >
          <a-input-password
            v-model:value="form.password"
            autocomplete="current-password"
          />
        </a-form-item>

        <template v-if="enabledMethods.length">
          <a-form-item
            label="Phương thức xác thực"
            name="method"
          >
            <a-select
              v-model:value="form.method"
              :options="enabledMethods.map((m) => ({ value: m, label: METHOD_LABELS[m] }))"
            />
          </a-form-item>

          <a-form-item
            label="Mã bảo mật (OTP)"
            name="otp"
            :rules="[{ required: true, message: 'Vui lòng nhập mã OTP.' }]"
          >
            <a-input-group
              compact
              class="antadmin-login__otp"
            >
              <a-input
                v-model:value="form.otp"
                autocomplete="one-time-code"
                inputmode="numeric"
                class="antadmin-login__otp-input"
              />
              <CButton
                v-if="needsOtpSend"
                variant="outline"
                :disabled="otpCountdown > 0"
                @click="onSendOtp"
              >
                {{ otpCountdown > 0 ? `${otpCountdown}s` : 'Gửi mã' }}
              </CButton>
            </a-input-group>
          </a-form-item>
        </template>

        <CButton
          type="primary"
          html-type="submit"
          block
          :loading="submitting"
          class="antadmin-login__submit"
        >
          Đăng nhập
        </CButton>
      </a-form>
    </CCard>
  </div>
</template>

<style scoped>
.antadmin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--antadmin-color-page);
}
.antadmin-login__card {
  width: 100%;
  max-width: 420px;
  box-shadow: var(--antadmin-shadow-card);
}
.antadmin-login__head {
  text-align: center;
  margin-bottom: 20px;
}
.antadmin-login__logo {
  height: 40px;
  margin-bottom: 12px;
}
.antadmin-login__title {
  font-family: var(--antadmin-font-family-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--antadmin-color-primary);
  margin: 0;
}
.antadmin-login__subtitle {
  color: var(--antadmin-color-text-secondary);
  margin: 4px 0 0;
}
.antadmin-login__otp {
  display: flex;
}
.antadmin-login__otp-input {
  flex: 1;
}
.antadmin-login__submit {
  margin-top: 8px;
}
</style>
