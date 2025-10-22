import { hasPermission } from '@/utils/permission'
import { Directive, type DirectiveBinding } from "vue";

export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    if (value) {
      !hasPermission(value) && el.parentNode?.removeChild(el);
    } else {
      throw new Error("need auths! Like v-auth=\"['btn.add','btn.edit']\"");
    }
  }
};
