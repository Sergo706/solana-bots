import { isRef, type Ref, toRef } from "vue";

export type MaybeRef<T> = Ref<T> | undefined

export function useOrCreateRef<T>(maybeRef: MaybeRef<T>, fallback: T): Ref<T> {
 if (isRef(maybeRef)) {
    return maybeRef;
  }
  return toRef(fallback) as unknown as Ref<T>;
}