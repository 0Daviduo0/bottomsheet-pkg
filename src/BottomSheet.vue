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
const quickLinksHeightPx = ref(0); // Altezza dei quick links, ora resettata se non in peek
const peekTranslateY = ref(100);
const clickThreshold = 5;
const PEEK_HEIGHT_CSS_VAR = '--bottom-sheet-peek-height';

// Calcola l'altezza effettiva in pixel dell'area di peek
const actualPeekHeightPx = computed(() => {
  if (handleHeightPx.value > 0) {
    return handleHeightPx.value + quickLinksHeightPx.value; // quickLinksHeightPx è 0 se non in peek
  }
  return 0;
});

// Misura altezza handle
watch(handleRef, async (newHandleEl) => {
    if (newHandleEl) {
        await nextTick();
        handleHeightPx.value = newHandleEl.offsetHeight;
    }
}); // Come da tuo ultimo codice, senza { immediate: true } qui, ma onMounted lo gestisce

// Calcola altezza combinata in vh
const combinedPeekHeightVh = computed(() => {
  const windowHeight = window.innerHeight;
  if (!windowHeight || handleHeightPx.value <= 0) {
    return -1; // Non pronto se l'handle non ha altezza o la finestra non è misurabile
  }
  const handleVh = (handleHeightPx.value / windowHeight) * 100;
  // quickLinksHeightPx è 0 se non in peek state, quindi quickLinksVh sarà 0 in quel caso
  const quickLinksVh = ((quickLinksHeightPx.value || 0) / windowHeight) * 100;
  return handleVh + quickLinksVh;
});

// Calcola e aggiorna peekTranslateY
watch(combinedPeekHeightVh, (newCombinedHeightVh) => {
  if (newCombinedHeightVh >= 0) { // Altezza combinata valida
    const newPeekY = Math.max(0, 100 - newCombinedHeightVh);
    if (Math.abs(newPeekY - peekTranslateY.value) > 0.1) { // Aggiorna solo se c'è differenza significativa
        const oldPeekY = peekTranslateY.value;
        peekTranslateY.value = newPeekY;

        // Se attualmente siamo in stato peek (o eravamo vicini al vecchio peek), aggiusta la posizione corrente
        if (Math.abs(currentTranslateY.value - oldPeekY) < 1) {
            currentTranslateY.value = peekTranslateY.value;
        }
         // Aggiusta anche initialTranslateY se era basato sul vecchio peek e non stiamo trascinando
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
  return peekTranslateY.value < 100 && Math.abs(currentTranslateY.value - peekTranslateY.value) < tolerance;
});

// Watcher per misurare quickLinksHeightPx
watch(isPeekState, async (isPeeking) => {
  if (isPeeking) {
    await nextTick(); // Assicura che il DOM sia aggiornato e quickLinksRef sia presente
    if (quickLinksRef.value) {
      const newHeight = quickLinksRef.value.offsetHeight;
      if (quickLinksHeightPx.value !== newHeight) { // Aggiorna solo se l'altezza è cambiata
         quickLinksHeightPx.value = newHeight;
      }
    } else {
      // Se quickLinksRef non è disponibile anche se isPeeking è true,
      // la sua contribuzione all'altezza dovrebbe essere 0.
      if (quickLinksHeightPx.value !== 0) {
        quickLinksHeightPx.value = 0;
      }
    }
  } else {
    // Quando non è in stato peek, quickLinksRef non è nel DOM (v-if="isPeekState").
    // La sua contribuzione all'altezza per il calcolo di peekTranslateY dovrebbe essere 0.
    if (quickLinksHeightPx.value !== 0) { // Aggiorna solo se necessario
        quickLinksHeightPx.value = 0;
    }
  }
}, { immediate: true });

// Watcher dedicato per aggiornare la variabile CSS
watch([actualPeekHeightPx, isPeekState], ([newPixelHeight, isCurrentlyInPeekState]) => {
  if (isCurrentlyInPeekState && newPixelHeight > 0) {
    document.documentElement.style.setProperty(PEEK_HEIGHT_CSS_VAR, `${newPixelHeight}px`);
  } else {
    document.documentElement.style.setProperty(PEEK_HEIGHT_CSS_VAR, '0px');
  }
}, { immediate: true });


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
    // Limita il trascinamento verso il basso alla posizione di peek o middleY se peek è >= 100
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
    const peekY = peekTranslateY.value; // Questo sarà aggiornato se quickLinksHeightPx è cambiato
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
      // Includi peekY solo se è una posizione valida (es. < 100)
      const validSnapPoints = [middleY, fullY];
      if (peekY < 100) {
        validSnapPoints.push(peekY);
      }
      // Se non ci sono punti di snap validi (improbabile ma per sicurezza), non fare nulla o torna a un default
      if (validSnapPoints.length === 0) {
        finalSnapY = initialY; // o un altro fallback
      } else {
        finalSnapY = validSnapPoints.reduce((prev, curr) => Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev );
      }
    }
    currentTranslateY.value = finalSnapY;
    let finalStateName = 'peek';
    let newModelValue = false;
    if (Math.abs(finalSnapY - middleY) < tolerance) { finalStateName = 'middle'; newModelValue = true; }
    else if (Math.abs(finalSnapY - fullY) < tolerance) { finalStateName = 'full'; newModelValue = true; }
    // Se finalSnapY è vicino a peekY (e peekY < 100), allora lo stato è 'peek' e modelValue è false.
    // Questa condizione è implicita se non entra nelle altre due.

    if (props.modelValue !== newModelValue) emit('update:modelValue', newModelValue);
    emit('state-change', finalStateName, finalSnapY);
  } else { // Caso Click
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
  // Chiudi solo se non è già in stato peek e peek è una posizione valida
  if (currentTranslateY.value !== peekTranslateY.value && peekTranslateY.value < 100) {
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
    await nextTick(); // Assicura che l'handle sia renderizzato
    handleHeightPx.value = handleRef.value.offsetHeight;
  }
  // `watch(isPeekState, { immediate: true })` si occuperà della misurazione iniziale di quickLinksHeightPx
  // e `watch([actualPeekHeightPx, isPeekState], { immediate: true })` per la CSS var.

  // Imposta stato iniziale dopo che le altezze potrebbero essere state misurate dai watcher immediate
  setTimeout(() => {
       const currentTargetPeekY = peekTranslateY.value; // Questa è la posizione di peek calcolata
       if (props.modelValue) { // Se deve iniziare aperto (middle o full)
           // Se è attualmente chiuso (vicino a peek) o completamente fuori schermo, aprilo a middle.
           if (Math.abs(currentTranslateY.value - currentTargetPeekY) < 1 || currentTranslateY.value >= 100) {
               currentTranslateY.value = props.middleY;
               emit('state-change', 'middle', props.middleY);
           }
           // Se è già in uno stato aperto (middle/full), currentTranslateY.value sarà già < currentTargetPeekY (o < 100)
           // e non dovrebbe essere currentTargetPeekY. Lascialo com'è.
       } else { // Se deve iniziare chiuso (peek)
            // Se non è già precisamente a peek (e peek è una posizione valida), mettilo a peek.
            if (currentTargetPeekY < 100 && Math.abs(currentTranslateY.value - currentTargetPeekY) > 0.1) {
                 currentTranslateY.value = currentTargetPeekY;
                 emit('state-change', 'peek', currentTargetPeekY);
            } else if (currentTargetPeekY >= 100 && currentTranslateY.value < 100) {
                // Se peek non è una posizione valida (es. no handle) ma il sheet è visibile, nascondilo.
                currentTranslateY.value = 100; // Nascondi
                emit('state-change', 'hidden', 100); // Stato inventato per chiarezza
            }
       }
   }, 0); // Timeout 0 per eseguire dopo il ciclo corrente e i watcher immediate.

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
  document.documentElement.style.removeProperty(PEEK_HEIGHT_CSS_VAR);
});

// updatePeekPosition
const updatePeekPosition = async () => {
    if (handleRef.value) {
       await nextTick();
       handleHeightPx.value = handleRef.value.offsetHeight;
    }
    if (isPeekState.value && quickLinksRef.value) {
        await nextTick();
        const newHeight = quickLinksRef.value.offsetHeight;
        if (quickLinksHeightPx.value !== newHeight) {
            quickLinksHeightPx.value = newHeight;
        }
    } else if (!isPeekState.value) {
        if (quickLinksHeightPx.value !== 0) {
            quickLinksHeightPx.value = 0;
        }
    }
};

// Watcher v-model
watch(() => props.modelValue, (isOpen) => {
  if (isDragging.value || isPointerDown.value) return; // Non interferire con interazioni utente

  const currentY = currentTranslateY.value;
  const tolerance = 1;
  const targetPeekY = peekTranslateY.value;

  const isCurrentlyOpen = (Math.abs(currentY - props.middleY) < tolerance) || (Math.abs(currentY - props.fullY) < tolerance);
  const isCurrentlyPeek = (targetPeekY < 100 && Math.abs(currentY - targetPeekY) < tolerance);

  if (isOpen && !isCurrentlyOpen) {
      // Apri a middle se modelValue diventa true e non è già aperto
      currentTranslateY.value = props.middleY;
      emit('state-change', 'middle', props.middleY);
  } else if (!isOpen && !isCurrentlyPeek) {
      // Chiudi a peek se modelValue diventa false, non è già a peek, e peek è una posizione valida
      if (targetPeekY < 100) {
        currentTranslateY.value = targetPeekY;
        emit('state-change', 'peek', targetPeekY);
      } else {
        // Se peek non è una posizione valida (es. no handle), nascondi completamente.
        currentTranslateY.value = 100;
        emit('state-change', 'hidden', 100);
      }
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
          <div v-for="(item, itemIndex) in section.items" :key="itemIndex" >
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