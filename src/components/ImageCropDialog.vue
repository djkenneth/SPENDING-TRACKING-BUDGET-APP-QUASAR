<!-- src/components/ImageCropDialog.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { ZoomIn, ZoomOut, Loader2, ImageIcon } from 'lucide-vue-next';

interface Props {
  open: boolean;
  file: File | null;
  defaultName?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  cropped: [payload: { blob: Blob; name: string }];
}>();

const cropperRef = ref();
const imageSrc = ref('');
const imageName = ref('');
const processing = ref(false);

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const currentZoom = ref(1);

const sliderValue = computed(() =>
  Math.round(((currentZoom.value - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100),
);

watch(
  () => props.file,
  (file) => {
    if (!file) return;
    if (imageSrc.value.startsWith('blob:')) URL.revokeObjectURL(imageSrc.value);
    imageSrc.value = URL.createObjectURL(file);
    imageName.value = (props.defaultName || file.name).replace(/\.[^/.]+$/, '');
    currentZoom.value = 1;
  },
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      if (imageSrc.value.startsWith('blob:')) URL.revokeObjectURL(imageSrc.value);
      imageSrc.value = '';
      currentZoom.value = 1;
    }
  },
);

const onZoomEvent = (payload: { factor: number }) => {
  currentZoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom.value * payload.factor));
};

const applyZoomFromSlider = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  const targetZoom = MIN_ZOOM + (val / 100) * (MAX_ZOOM - MIN_ZOOM);
  const factor = targetZoom / currentZoom.value;
  if (Math.abs(factor - 1) > 0.001) cropperRef.value?.zoom(factor);
};

const zoomIn = () => {
  if (currentZoom.value < MAX_ZOOM) cropperRef.value?.zoom(1.2);
};

const zoomOut = () => {
  if (currentZoom.value > MIN_ZOOM) cropperRef.value?.zoom(1 / 1.2);
};

const handleConfirm = async () => {
  if (!cropperRef.value) return;
  processing.value = true;
  try {
    const { canvas } = cropperRef.value.getResult();

    // Render circular crop with transparency
    const size = Math.min(canvas.width, canvas.height);
    const out = document.createElement('canvas');
    out.width = size;
    out.height = size;
    const ctx = out.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(canvas, 0, 0, size, size);

    await new Promise<void>((resolve) => {
      out.toBlob(
        (blob) => {
          if (blob) emit('cropped', { blob, name: imageName.value || 'avatar' });
          resolve();
        },
        'image/png',
        0.95,
      );
    });

    emit('update:open', false);
  } finally {
    processing.value = false;
  }
};

const handleCancel = () => emit('update:open', false);
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[440px] p-0 gap-0 overflow-hidden">

      <DialogHeader class="px-6 pt-5 pb-4 border-b">
        <DialogTitle class="flex items-center gap-2">
          <ImageIcon class="w-4 h-4 text-muted-foreground" />
          Crop Photo
        </DialogTitle>
      </DialogHeader>

      <!-- Cropper area -->
      <div class="relative overflow-hidden bg-zinc-950" style="height: 300px;">
        <Cropper
          v-if="imageSrc"
          ref="cropperRef"
          :src="imageSrc"
          :stencil-component="CircleStencil"
          :stencil-props="{ aspectRatio: 1, movable: true, scalable: false }"
          image-restriction="stencil"
          class="h-full w-full"
          @zoom="onZoomEvent"
        />
        <div v-else class="h-full flex items-center justify-center text-sm text-zinc-500">
          No image selected
        </div>
      </div>

      <!-- Zoom bar -->
      <div class="px-5 py-3 flex items-center gap-3 border-b bg-muted/40">
        <button
          type="button"
          class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-40"
          :disabled="currentZoom <= MIN_ZOOM"
          @click="zoomOut"
        >
          <ZoomOut class="w-4 h-4" />
        </button>

        <div class="flex-1 relative flex items-center">
          <input
            type="range"
            class="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
            :value="sliderValue"
            min="0"
            max="100"
            step="1"
            @input="applyZoomFromSlider"
          />
        </div>

        <button
          type="button"
          class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-40"
          :disabled="currentZoom >= MAX_ZOOM"
          @click="zoomIn"
        >
          <ZoomIn class="w-4 h-4" />
        </button>

        <span class="text-xs font-mono text-muted-foreground w-9 text-right shrink-0">
          {{ currentZoom.toFixed(1) }}×
        </span>
      </div>

      <!-- Photo name input -->
      <div class="px-6 py-4 space-y-2">
        <Label for="crop-photo-name" class="text-sm font-medium">Photo name</Label>
        <Input
          id="crop-photo-name"
          v-model="imageName"
          placeholder="e.g. my-avatar"
          autocomplete="off"
        />
        <p class="text-xs text-muted-foreground">
          Used as the filename when saving. Extension is added automatically.
        </p>
      </div>

      <DialogFooter class="px-6 pb-5 pt-1 gap-2">
        <Button variant="outline" :disabled="processing" @click="handleCancel">
          Cancel
        </Button>
        <Button :disabled="!imageSrc || processing" @click="handleConfirm">
          <Loader2 v-if="processing" class="w-4 h-4 mr-2 animate-spin" />
          Save Photo
        </Button>
      </DialogFooter>

    </DialogContent>
  </Dialog>
</template>
