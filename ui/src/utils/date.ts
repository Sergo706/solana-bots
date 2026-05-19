import {onMounted, ref, computed} from 'vue';

const locale = ref('en-US');
onMounted(() => {
  locale.value = navigator.language;
});

export const dtFmt = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
});

export const dtFmtWithSeconds = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
});

export function formatDate(value: Date | string | number | null | undefined) {
  if (!value) return '—';

  const date = value instanceof Date
    ? value
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return dtFmt.value.format(date);
}