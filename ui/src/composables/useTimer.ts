import { ref, computed, watch } from "vue";
import { type MaybeRef, useOrCreateRef } from "@/utils/useOrCreateRef";

interface Controls {
  stop?: MaybeRef<boolean>;
  start?: MaybeRef<boolean>;
  reverse?: MaybeRef<boolean>;
  reverseCountDownFrom?: MaybeRef<number>;
}

export function useTimer(controls: Controls = {}) {
  const stop = useOrCreateRef(controls.stop, true);
  const start = useOrCreateRef(controls.start, false);
  const reverse = useOrCreateRef(controls.reverse, false);
  const reverseCountDownFrom = useOrCreateRef(controls.reverseCountDownFrom, 0);

  const elapsedTime = ref(reverse.value ? reverseCountDownFrom.value : 0);
  let startTime = 0;
  let animationFrameId: number | null = null;

  const syncStartTime = () => {
    const now = performance.now();
    if (reverse.value) {
      startTime = now - (reverseCountDownFrom.value - elapsedTime.value);
    } else {
      startTime = now - elapsedTime.value;
    }
  };

  const updateTime = () => {
    if (stop.value) return;
    
    const now = performance.now();
    
    if (reverse.value) {
      const timeRemaining = reverseCountDownFrom.value - (now - startTime);
      if (timeRemaining <= 0) {
        elapsedTime.value = 0;
        resetStopwatch(); 
        return;
      }
      elapsedTime.value = timeRemaining;
    } else {
      elapsedTime.value = now - startTime;
    }

    animationFrameId = requestAnimationFrame(updateTime);
  };

  const startStopwatch = () => {
    if (reverse.value && elapsedTime.value <= 0) {
      elapsedTime.value = reverseCountDownFrom.value;
    }
    stop.value = false;
    start.value = true;
  };

  const stopStopwatch = () => {
    stop.value = true;
    start.value = false;
  };

  const resetStopwatch = () => {
    stopStopwatch();
    elapsedTime.value = reverse.value ? reverseCountDownFrom.value : 0;
  };

  watch(stop, (isStopped) => {
      if (isStopped) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        syncStartTime();
        animationFrameId = requestAnimationFrame(updateTime);
      }
    },
    { immediate: true }
  );

  watch(reverse, (isReversing) => {
    if (stop.value) {
      elapsedTime.value = isReversing ? reverseCountDownFrom.value : 0;
    } else {
      syncStartTime();
    }
  });

  watch(reverseCountDownFrom, (newMax) => {
  if (reverse.value) {
    elapsedTime.value = newMax;
    if (!stop.value) {
      syncStartTime();
    }
  }
});

  const formattedTime = computed(() => {
    const totalMs = Math.max(0, Math.floor(elapsedTime.value));

    const days = Math.floor(totalMs / 86400000);
    const hours = Math.floor((totalMs % 86400000) / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000); 
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const milliseconds = totalMs % 1000;      

    const pad = (num: number, digits = 2) => String(num).padStart(digits, '0');

    return {
      days: pad(days),  
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
      milliseconds: pad(milliseconds, 3).slice(0, 2), 
    };
  });

  return {
    stop,
    start,
    elapsedTime,
    formattedTime,
    startStopwatch,
    stopStopwatch,
    resetStopwatch,
  };
}