<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

// Props
const props = defineProps({
  modelValue: Boolean,
  middleY: { type: Number, default: 50 },
  fullY:   { type: Number, default: 5 },
  quickLinks: { type: Object },
});

// Emits
const emit = defineEmits(['update:modelValue','state-change', 'handle-click']);

const route = useRoute();

const isIpadSafari = ref(false);
const userAgent = ref('');

// Refs
const sheetRef = ref(null);
const contentRef = ref(null);
const handleRef = ref(null);
const quickLinksRef = ref(null);

// Stato interno
const isDragging = ref(false);
const isPointerDown = ref(false);
const startClientY = ref(0);
const initialTranslateY = ref(100);
const currentTranslateY = ref(100);
const handleHeightPx = ref(0);
const quickLinksHeightPx = ref(0);
const peekTranslateY = ref(100);
const clickThreshold = 5;
const PEEK_HEIGHT_CSS_VAR = '--bottom-sheet-peek-height'; // Nome della variabile CSS

// Calcola l'altezza effettiva in pixel dell'area di peek
const actualPeekHeightPx = computed(() => {
  // L'handle deve essere misurato per avere un'altezza di peek valida
  if (handleHeightPx.value > 0) {
    // quickLinksHeightPx sarà 0 se non ci sono quickLinks o non sono ancora stati misurati, il che è corretto.
    return handleHeightPx.value + quickLinksHeightPx.value;
  }
  return 0; // Se l'handle non è misurato, l'altezza di peek effettiva per questo scopo è 0.
})

// Misura altezza handle
watch(handleRef, async (newHandleEl) => {
    if (newHandleEl) {
        await nextTick();
        handleHeightPx.value = newHandleEl.offsetHeight;
    }
});

// Calcola altezza combinata in vh
const combinedPeekHeightVh = computed(() => {
  const windowHeight = window.innerHeight;
  if (!windowHeight || handleHeightPx.value <= 0) {
    return -1;
  }
  const handleVh = (handleHeightPx.value / windowHeight) * 100;
  const quickLinksVh = ((quickLinksHeightPx.value || 0) / windowHeight) * 100;
  return handleVh + quickLinksVh;
});

// Calcola e aggiorna peekTranslateY
watch(combinedPeekHeightVh, (newCombinedHeightVh) => {
  if (newCombinedHeightVh >= 0) {
    const newPeekY = Math.max(0, 100 - newCombinedHeightVh);
    if (Math.abs(newPeekY - peekTranslateY.value) > 0.1) {
        const oldPeekY = peekTranslateY.value;
        peekTranslateY.value = newPeekY;
        if (Math.abs(currentTranslateY.value - oldPeekY) < 1) {
            currentTranslateY.value = peekTranslateY.value;
        }
         if (Math.abs(initialTranslateY.value - oldPeekY) < 1 && !isPointerDown.value) {
             initialTranslateY.value = peekTranslateY.value;
         }
    }
  }
});

// Punti di snap
const snapPoints = computed(() => [
  peekTranslateY.value,
  props.middleY,
  props.fullY
].sort((a, b) => b - a));

// Stile sheet
const sheetStyle = computed(() => ({
  top: `${currentTranslateY.value}vh`,
  position: 'fixed',
  left: '0',
  right: '0',
  bottom: '0',
  transition: isDragging.value ? 'none' : 'top 0.3s ease-out',
  maxHeight: `calc(100vh - ${props.fullY}vh)`
}));

// isPeekState
const isPeekState = computed(() => {
  const tolerance = 1;
  // Considera peek solo se c'è effettivamente un'area di peek (peekTranslateY < 100)
  return peekTranslateY.value < 100 && Math.abs(currentTranslateY.value - peekTranslateY.value) < tolerance;
});

// Watcher per misurare quickLinksHeightPx e per CSS Custom Property
watch(isPeekState, async (isPeeking) => {
  if (isPeeking) {
    await nextTick();
    if (quickLinksRef.value) {
      const newHeight = quickLinksRef.value.offsetHeight;
      if (newHeight > 0 && quickLinksHeightPx.value !== newHeight) {
         quickLinksHeightPx.value = newHeight;
      }
    }
  }
  // La logica per la CSS Custom Property è gestita da un altro watcher dedicato
}, { immediate: true }); // immediate: true per misurare subito se parte in peek

// Watcher dedicato per aggiornare la variabile CSS
watch([actualPeekHeightPx, isPeekState], ([newPixelHeight, isCurrentlyInPeekState]) => {
  if (isCurrentlyInPeekState && newPixelHeight > 0) {
    document.documentElement.style.setProperty(PEEK_HEIGHT_CSS_VAR, `${newPixelHeight}px`);
  } else {
    // Se non è in stato peek, o l'altezza calcolata è 0, lo spazio riservato dovrebbe essere 0.
    document.documentElement.style.setProperty(PEEK_HEIGHT_CSS_VAR, '0px');
  }
}, { immediate: true, deep: true }); // deep: true non è strettamente necessario qui con refs primitivi/compute


// handlePointerDown
const handlePointerDown = (event) => {
  if (handleRef.value && !handleRef.value.contains(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  isPointerDown.value = true;
  isDragging.value = false;
  startClientY.value = event.clientY;
  initialTranslateY.value = currentTranslateY.value;
  window.addEventListener('pointermove', handlePointerMove, { passive: false });
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointerleave', handlePointerUp);
};

// handlePointerMove
const handlePointerMove = (event) => {
  if (!isPointerDown.value) return;
  const currentClientY = event.clientY;
  const movedDistance = Math.abs(currentClientY - startClientY.value);
  if (!isDragging.value && movedDistance > clickThreshold) {
    isDragging.value = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }
  if (isDragging.value) {
    event.preventDefault();
    const deltaY = currentClientY - startClientY.value;
    const windowHeight = window.innerHeight;
    if (windowHeight === 0) return;
    const deltaPercentY = (deltaY / windowHeight) * 100;
    let newTranslateY = initialTranslateY.value + deltaPercentY;
    const lowerBound = (peekTranslateY.value < 100) ? peekTranslateY.value : props.middleY;
    newTranslateY = Math.max(props.fullY, Math.min(lowerBound, newTranslateY));
    currentTranslateY.value = newTranslateY;
  }
};

// handlePointerUp
const handlePointerUp = (event) => {
  if (!isPointerDown.value) return;
  const tolerance = 1;
  const startedFromPeek = Math.abs(initialTranslateY.value - peekTranslateY.value) < tolerance;

  if (isDragging.value) {
    isDragging.value = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    const currentY = currentTranslateY.value;
    const initialY = initialTranslateY.value;
    const peekY = peekTranslateY.value;
    const middleY = props.middleY;
    const fullY = props.fullY;
    let finalSnapY;
    const movedUp = currentY < initialY;
    if (startedFromPeek && movedUp) {
      if (currentY > middleY - tolerance) { finalSnapY = middleY; }
      else {
        const distToMiddle = Math.abs(currentY - middleY);
        const distToFull = Math.abs(currentY - fullY);
        finalSnapY = (distToFull < distToMiddle) ? fullY : middleY;
      }
    } else {
      const points = [peekY, middleY, fullY]
      finalSnapY = points.reduce((prev, curr) => Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev );
    }
    currentTranslateY.value = finalSnapY;
    let finalStateName = 'peek';
    let newModelValue = false;
    if (Math.abs(finalSnapY - middleY) < tolerance) { finalStateName = 'middle'; newModelValue = true; }
    else if (Math.abs(finalSnapY - fullY) < tolerance) { finalStateName = 'full'; newModelValue = true; }
    if (props.modelValue !== newModelValue) emit('update:modelValue', newModelValue);
    emit('state-change', finalStateName, finalSnapY);
  } else {
    if (startedFromPeek) {
      emit('handle-click');
      currentTranslateY.value = props.middleY;
      if (!props.modelValue) emit('update:modelValue', true);
      emit('state-change', 'middle', props.middleY);
    }
  }
  isPointerDown.value = false;
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
  window.removeEventListener('pointerleave', handlePointerUp);
};

// handleOverlayClick
const handleOverlayClick = () => {
  if (currentTranslateY.value !== peekTranslateY.value) {
      currentTranslateY.value = peekTranslateY.value;
      if (props.modelValue) emit('update:modelValue', false);
      emit('state-change', 'peek', peekTranslateY.value);
  }
};

// onMounted
onMounted(async () => {
  userAgent.value = navigator.userAgent.toLowerCase();
  isIpadSafari.value = /ipad/.test(userAgent.value) && /safari/.test(userAgent.value) && !/chrome/.test(userAgent.value);

  if (handleRef.value) {
    await nextTick();
    handleHeightPx.value = handleRef.value.offsetHeight;
  }

  setTimeout(() => {
       const currentPeekY = peekTranslateY.value;
       if (props.modelValue) {
           if (Math.abs(currentTranslateY.value - currentPeekY) < 1 || currentTranslateY.value >= 100) {
               currentTranslateY.value = props.middleY;
               emit('state-change', 'middle', props.middleY);
           }
       } else {
            if (Math.abs(currentTranslateY.value - currentPeekY) > 0.1) {
                 currentTranslateY.value = currentPeekY;
                 emit('state-change', 'peek', currentPeekY);
            }
       }
   }, 0);

  window.addEventListener('resize', updatePeekPosition);
});

// onUnmounted
onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
  window.removeEventListener('pointerleave', handlePointerUp);
  window.removeEventListener('resize', updatePeekPosition);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  // Pulisci la variabile CSS quando il componente viene smontato
  document.documentElement.style.removeProperty(PEEK_HEIGHT_CSS_VAR);
});

// updatePeekPosition
const updatePeekPosition = async () => {
    if (handleRef.value) {
       await nextTick();
       handleHeightPx.value = handleRef.value.offsetHeight;
    }
    if (isPeekState.value && quickLinksRef.value) { // Misura quicklinks solo se è in peek state
        await nextTick();
        quickLinksHeightPx.value = quickLinksRef.value.offsetHeight;
    } else if (!isPeekState.value) { // Se non è in peek, l'altezza dei quicklinks non contribuisce al calcolo attuale
        // quickLinksHeightPx.value = 0; // Potrebbe essere utile resettarlo, ma la logica attuale lo mantiene
    }
};

// Watcher v-model
watch(() => props.modelValue, (isOpen) => {
  if (isDragging.value || isPointerDown.value) return;
  const currentY = currentTranslateY.value;
  const tolerance = 1;
  const isCurrentlyOpen = (Math.abs(currentY - props.middleY) < tolerance) || (Math.abs(currentY - props.fullY) < tolerance);
  const isCurrentlyPeek = (Math.abs(currentY - peekTranslateY.value) < tolerance);

  if (isOpen && !isCurrentlyOpen) {
      currentTranslateY.value = props.middleY;
      emit('state-change', 'middle', props.middleY);
  } else if (!isOpen && !isCurrentlyPeek) {
      currentTranslateY.value = peekTranslateY.value;
      emit('state-change', 'peek', peekTranslateY.value);
  }
});

</script>

<template>
  <div class="lg:hidden">
    <Transition name="fade">
      <div
        v-if="!isPeekState"
        class="fixed inset-0 z-40 bg-gray-900/60 pointer-events-auto"
        @click="handleOverlayClick"
      />
    </Transition>
    <div
      ref="sheetRef"
      class="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden touch-pan-y z-50"
      :style="sheetStyle" >
      <div
        ref="handleRef"
        class="py-3 flex justify-center items-center cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        @pointerdown="handlePointerDown"
      >
        <div class="w-10 h-1.5 bg-gray-300 rounded-full pointer-events-none"></div>
      </div>
      <div
        v-if="isPeekState"
        ref="quickLinksRef"
        :class="['px-4','pt-3', props.quickLinks ? '' : ' p-12 ', isIpadSafari && props.quickLinks ? ' pb-24 border-t border-gray-200 ': '', !isIpadSafari && props.quickLinks ? ' pb-14 border-t border-gray-200 ': '' ]"
      >
        <div v-for="(section, sectionIndex) in props.quickLinks" :key="`mobile-sheet-section-${sectionIndex}`" class="flex justify-around">
          <div v-for="(item, itemIndex) in section.items" >
            <a v-if="item.href" :href="item.href" :class="[item.current ? 'bg-gray-100/60 text-urbis-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-urbis-blue', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                <component :is="item.icon" v-bind="item.iconProps" :class="['size-6 shrink-0', item.iconProps ? '' : (item.current ? 'text-urbis-blue' : 'text-gray-400 group-hover:text-urbis-blue')]" aria-hidden="true"/>
            </a>
            <router-link v-else-if="item.to" :to="item.to" custom v-slot="{ href, navigate, isActive }">
                <a :href="href" @click.prevent="() => { navigate() }" :class="[isActive ? 'bg-gray-100/60 text-urbis-blue' : 'text-gray-700 hover:bg-gray-50 hover:text-urbis-blue', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']">
                    <component :is="item.icon" v-bind="item.iconProps" :class="['size-6 shrink-0', item.iconProps ? '' : (isActive ? 'text-urbis-blue' : 'text-gray-400 group-hover:text-urbis-blue')]" aria-hidden="true"/>
                </a>
            </router-link>
          </div>
        </div>
      </div>
      <Transition name="fade">
        <div
          v-if="!isPeekState"
          ref="contentRef"
          class="flex-1 overflow-y-auto px-4 pb-4 min-h-[0]"
        >
          <slot />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
  /* Stili invariati */
.touch-pan-y { touch-action: pan-y; }
.touch-none { touch-action: none; }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>