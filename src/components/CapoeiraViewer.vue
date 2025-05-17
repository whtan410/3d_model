<template>
  <div class="viewer-container">
    <div ref="canvasContainerRef" class="canvas-area"></div>
    <!-- <div class="animation-status" v-if="currentAnimationName">
      <p>Playing: {{ currentAnimationName }}</p>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Props for dynamic control
const props = defineProps({
  // Animation to play
  animation: {
    type: String,
    default: "",
  },
  // Auto-play animation on mount
  autoPlay: {
    type: Boolean,
    default: false,
  },
  // Whether to stop the current animation
  stopAnimation: {
    type: Boolean,
    default: false,
  },
});

// Emit events
const emit = defineEmits([
  "animationStarted",
  "animationStopped",
  "modelLoaded",
  "error",
]);

const canvasContainerRef = ref(null);
const currentAnimationName = ref("");
const isModelLoaded = ref(false);

let renderer, scene, camera, controls, mixer;
const clock = new THREE.Clock();
const animationActions = {}; // To store { 'AnimationKey': AnimationAction }
let activeAction = null;
let characterModel = null; // To store the loaded character mesh/group

// Define keys for your animations and map them to FBX file paths
const ANIMATION_FILES = {
  JumpPushUp: new URL("../assets/models/Jump_push_up.fbx", import.meta.url)
    .href,
  LegStretchDance: new URL(
    "../assets/models/Leg_stretch_dance.fbx",
    import.meta.url
  ).href,
  Situps: new URL("../assets/models/situps.fbx", import.meta.url).href,
  Waving: new URL("../assets/models/Waving.fbx", import.meta.url).href,
};
const CHARACTER_MODEL_FILE = new URL(
  "../assets/models/model.fbx",
  import.meta.url
).href;
const IDLE_ANIMATION_KEY = "Idle";

// Watch for animation prop changes
watch(
  () => props.animation,
  (newAnimation) => {
    if (newAnimation && isModelLoaded.value) {
      triggerAnimation(newAnimation);
    }
  }
);

// Watch for stop animation prop changes
watch(
  () => props.stopAnimation,
  (shouldStop) => {
    if (shouldStop && isModelLoaded.value) {
      stopCurrentAnimation();
    }
  }
);

const initThree = async () => {
  const container = canvasContainerRef.value;
  if (!container) return;

  // 1. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);




  // 2. Scene
  scene = new THREE.Scene();

  // 3. Camera
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 5);

  // 4. Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 5. Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);

  // 6. Load Character Model First
  const fbxLoader = new FBXLoader();
  try {
    characterModel = await fbxLoader.loadAsync(CHARACTER_MODEL_FILE);
    characterModel.scale.set(0.01, 0.01, 0.01);
    characterModel.position.set(0, 0, 0);
    characterModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(characterModel);

    // 7. Initialize Animation Mixer with the character model
    mixer = new THREE.AnimationMixer(characterModel);

    // 8. Load Animation FBX Files
    for (const animKey in ANIMATION_FILES) {
      const animPath = ANIMATION_FILES[animKey];
      if (!animPath) {
        console.warn(
          `Animation path for key "${animKey}" is undefined. Skipping.`
        );
        continue;
      }
      try {
        const animFbx = await fbxLoader.loadAsync(animPath);
        if (animFbx.animations && animFbx.animations.length > 0) {
          const clip = animFbx.animations[0];
          const action = mixer.clipAction(clip);
          animationActions[animKey] = action;

          // Set all animations to loop by default
          action.setLoop(THREE.LoopRepeat, Infinity);

          console.log(`Loaded animation: ${animKey} from ${animPath}`);
        } else {
          console.warn(`No animations found in ${animPath} for key ${animKey}`);
        }
      } catch (error) {
        console.error(
          `Error loading animation ${animPath} for key ${animKey}:`,
          error
        );
        emit("error", {
          type: "animation",
          key: animKey,
          message: error.message,
        });
      }
    }

    // Set up an Idle animation to play by default if it exists
    if (animationActions[IDLE_ANIMATION_KEY]) {
      activeAction = animationActions[IDLE_ANIMATION_KEY];
      activeAction.play();
      currentAnimationName.value = IDLE_ANIMATION_KEY;
    } else {
      currentAnimationName.value = "None (No Idle Animation Loaded)";
    }

    isModelLoaded.value = true;
    emit("modelLoaded");

    // Auto-play animation if specified
    if (
      props.autoPlay &&
      props.animation &&
      animationActions[props.animation]
    ) {
      triggerAnimation(props.animation);
    }
  } catch (error) {
    console.error("Error loading character model:", error);
    emit("error", { type: "model", message: error.message });
    return;
  }

  // 9. Start Animation Loop
  animate();

  // 10. Handle Resize
  window.addEventListener("resize", onWindowResize);
};

const triggerAnimation = (animationKey) => {
  if (!mixer || !animationActions[animationKey] || !characterModel) {
    console.warn(`Animation "${animationKey}" or mixer/model not ready.`);
    return;
  }

  const newAction = animationActions[animationKey];

  if (activeAction === newAction) {
    return;
  }

  currentAnimationName.value = animationKey;
  emit("animationStarted", animationKey);

  if (activeAction) {
    activeAction.fadeOut(0.3);
  }

  newAction.reset().fadeIn(0.3).play();
  activeAction = newAction;
};

const stopCurrentAnimation = () => {
  if (!activeAction || !activeAction.isRunning()) {
    if (
      animationActions[IDLE_ANIMATION_KEY] &&
      activeAction !== animationActions[IDLE_ANIMATION_KEY]
    ) {
      if (activeAction) activeAction.fadeOut(0.1);
      animationActions[IDLE_ANIMATION_KEY].reset().fadeIn(0.3).play();
      activeAction = animationActions[IDLE_ANIMATION_KEY];
      currentAnimationName.value = IDLE_ANIMATION_KEY;
    } else if (!animationActions[IDLE_ANIMATION_KEY]) {
      currentAnimationName.value = "Stopped (No Idle)";
    }
    return;
  }

  const actionBeingStopped = activeAction;
  actionBeingStopped.fadeOut(0.3);
  emit("animationStopped", currentAnimationName.value);

  if (
    animationActions[IDLE_ANIMATION_KEY] &&
    actionBeingStopped !== animationActions[IDLE_ANIMATION_KEY]
  ) {
    const idle = animationActions[IDLE_ANIMATION_KEY];
    idle.reset().fadeIn(0.3).play();
    activeAction = idle;
    currentAnimationName.value = IDLE_ANIMATION_KEY;
  } else {
    setTimeout(() => {
      if (
        actionBeingStopped &&
        actionBeingStopped.isRunning() &&
        actionBeingStopped === activeAction
      ) {
        actionBeingStopped.stop();
      }
    }, 300);

    if (actionBeingStopped === animationActions[IDLE_ANIMATION_KEY]) {
      activeAction = null;
      currentAnimationName.value = "Idle Stopped";
    } else {
      activeAction = null;
      currentAnimationName.value = "Stopped";
    }
  }
};

// Expose methods to parent components
defineExpose({
  triggerAnimation,
  stopCurrentAnimation,
  getAvailableAnimations: () => Object.keys(animationActions),
});

const animate = () => {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
};

const onWindowResize = () => {
  if (camera && renderer && canvasContainerRef.value) {
    const container = canvasContainerRef.value;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
};

onMounted(() => {
  initThree();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
  if (renderer) {
    renderer.dispose();
  }
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  characterModel = null;
});
</script>

<style scoped>
.viewer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.canvas-area {
  width: 80%;
  height: 70vh;
  border: 1px solid #ccc;
  margin-bottom: 20px;
  background-color: #f0f0f0;
}

.animation-status {
  padding: 10px;
  background-color: #e9e9e9;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.animation-status p {
  margin: 0;
  font-style: italic;
  text-align: center;
}
</style>
