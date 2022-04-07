import { reactive, shallowRef } from 'vue'
import type { ShallowRef, UnwrapNestedRefs } from 'vue'
import type { RuleItem } from 'async-validator'
import type { FormInstance } from 'element-plus'

type FormRuleItem = RuleItem & {
  trigger?: 'blur' | 'change' | ('blur' | 'change')[]
}

export function useForm<T extends Record<string, unknown>>(options: {
  defaultFormData: T
  defaultFormRules?: Record<keyof T, FormRuleItem | FormRuleItem[]>
}): {
  formEl: ShallowRef<FormInstance>
  formData: UnwrapNestedRefs<T>
  formRules: UnwrapNestedRefs<Record<keyof T, FormRuleItem | FormRuleItem[]>>
} {
  const formEl = shallowRef<FormInstance>(null as unknown as FormInstance)
  const formData = reactive(options.defaultFormData)
  const formRules = reactive(options.defaultFormRules || ({} as Record<keyof T, FormRuleItem | FormRuleItem[]>))

  return {
    formEl,
    formData,
    formRules,
  }
}
