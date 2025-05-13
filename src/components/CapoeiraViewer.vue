<template>
    <div class="viewer-container">
        <div ref="canvasContainerRef" class="canvas-area"></div>
        <div class="controls">
        <button @click="triggerAnimation('JumpPushUp')">Jump Push Up</button>
        <button @click="triggerAnimation('LegStretchDance')">Leg Stretch Dance</button>
        <button @click="triggerAnimation('Situps')">Situps</button>
        <button @click="stopCurrentAnimation" class="stop-button">Stop Animation</button>
        <p v-if="currentAnimationName">Playing: {{ currentAnimationName }}</p>
        </div>
    </div>
</template>
  
<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import *   as THREE from 'three';
  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  
  const canvasContainerRef = ref(null);
  const currentAnimationName = ref('');
  
  let renderer, scene, camera, controls, mixer;
  const clock = new THREE.Clock();
  const animationActions = {}; // To store { 'AnimationKey': AnimationAction }
  let activeAction = null;
  let characterModel = null; // To store the loaded character mesh/group
  
  // Define keys for your animations and map them to FBX file paths
  // IMPORTANT: Ensure these paths are correct and you have an 'Idle.fbx'
  const ANIMATION_FILES = {
    JumpPushUp: '/models/Jump_push_up.fbx',
    LegStretchDance: '/models/Leg_stretch_dance.fbx',
    Situps: '/models/situps.fbx',
    Idle: '/models/Idle.fbx', // Make sure you have an Idle animation FBX
  };
  const CHARACTER_MODEL_FILE = '/models/model.fbx'; // Your main character model
  const IDLE_ANIMATION_KEY = 'Idle'; // Helper to refer to the idle animation
  
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
    // scene.background = new THREE.Color(0xdddddd); // Optional background
  
    // 3. Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5); // Adjust as needed
  
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
    controls.target.set(0, 1, 0); // Adjust to your model's center
  
    // 6. Load Character Model First
    const fbxLoader = new FBXLoader();
    try {
      characterModel = await fbxLoader.loadAsync(CHARACTER_MODEL_FILE);
      characterModel.scale.set(0.01, 0.01, 0.01); // FBX often needs scaling, adjust as needed
      characterModel.position.set(0, 0, 0);      // Character is static
      characterModel.traverse(child => {
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
        if (!animPath) { // Skip if path is not defined (e.g. if Idle.fbx is missing but entry exists)
          console.warn(`Animation path for key "${animKey}" is undefined. Skipping.`);
          continue;
        }
        try {
          const animFbx = await fbxLoader.loadAsync(animPath);
          if (animFbx.animations && animFbx.animations.length > 0) {
            const clip = animFbx.animations[0]; // Assuming one animation per FBX
            const action = mixer.clipAction(clip);
            animationActions[animKey] = action;
  
            // Set all animations (including Idle) to loop by default
            action.setLoop(THREE.LoopRepeat, Infinity);
  
            console.log(`Loaded animation: ${animKey} from ${animPath}`);
          } else {
            console.warn(`No animations found in ${animPath} for key ${animKey}`);
          }
        } catch (error) {
          console.error(`Error loading animation ${animPath} for key ${animKey}:`, error);
        }
      }
  
      // Set up an Idle animation to play by default if it exists
      if (animationActions[IDLE_ANIMATION_KEY]) {
        activeAction = animationActions[IDLE_ANIMATION_KEY];
        activeAction.play();
        currentAnimationName.value = IDLE_ANIMATION_KEY;
      } else {
        currentAnimationName.value = 'None (No Idle Animation Loaded)';
      }
  
    } catch (error) {
      console.error("Error loading character model:", error);
      return; // Stop if character doesn't load
    }
  
    // 9. Start Animation Loop
    animate();
  
    // 10. Handle Resize
    window.addEventListener('resize', onWindowResize);
  };
  
  const triggerAnimation = (animationKey) => {
    if (!mixer || !animationActions[animationKey] || !characterModel) {
      console.warn(`Animation "${animationKey}" or mixer/model not ready.`);
      return;
    }
  
    const newAction = animationActions[animationKey];
  
    if (activeAction === newAction) {
      // If clicking the same button and it's already playing (looping), do nothing
      // Or you could add a reset if desired: newAction.reset().play();
      return;
    }
  
    currentAnimationName.value = animationKey;
  
    if (activeAction) {
      activeAction.fadeOut(0.3); // Smoothly fade out current animation
    }
  
    newAction.reset().fadeIn(0.3).play(); // Play the new one (it's already set to loop)
    activeAction = newAction;
  };
  
  const stopCurrentAnimation = () => {
    if (!activeAction || !activeAction.isRunning()) {
       // If nothing is running, but we have an idle, ensure idle is playing
       if (animationActions[IDLE_ANIMATION_KEY] && activeAction !== animationActions[IDLE_ANIMATION_KEY]) {
           if(activeAction) activeAction.fadeOut(0.1); // fade out any non-running old action
           animationActions[IDLE_ANIMATION_KEY].reset().fadeIn(0.3).play();
           activeAction = animationActions[IDLE_ANIMATION_KEY];
           currentAnimationName.value = IDLE_ANIMATION_KEY;
       } else if (!animationActions[IDLE_ANIMATION_KEY]) {
           currentAnimationName.value = 'Stopped (No Idle)';
       }
      return;
    }
  
    const actionBeingStopped = activeAction;
    actionBeingStopped.fadeOut(0.3);
  
    if (animationActions[IDLE_ANIMATION_KEY] && actionBeingStopped !== animationActions[IDLE_ANIMATION_KEY]) {
      // Transition to Idle animation if it exists and isn't the one being stopped
      const idle = animationActions[IDLE_ANIMATION_KEY];
      idle.reset().fadeIn(0.3).play(); // It will loop
      activeAction = idle;
      currentAnimationName.value = IDLE_ANIMATION_KEY;
    } else {
      // No Idle animation, or Idle itself was stopped.
      // The action will fade out. For a true stop after fadeOut:
      setTimeout(() => {
          if (actionBeingStopped && actionBeingStopped.isRunning() && actionBeingStopped === activeAction) { // Check if it didn't get replaced
              actionBeingStopped.stop();
          }
      }, 300); // Should match fadeOut duration
  
      if (actionBeingStopped === animationActions[IDLE_ANIMATION_KEY]) {
           activeAction = null; // Or a specific "paused idle" state if desired
           currentAnimationName.value = 'Idle Stopped';
      } else {
           activeAction = null; // Character will freeze after fadeOut
           currentAnimationName.value = 'Stopped';
      }
    }
  };
  
  const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (controls) controls.update(); // Only if enableDamping is true
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
    window.removeEventListener('resize', onWindowResize);
    if (renderer) {
      renderer.dispose();
    }
    if (scene) {
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    characterModel = null; // Clear reference
    // mixer = null; // Mixer is tied to model
    // animationActions = {};
  });
  
</script>
  
<style scoped>
  .viewer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100vh; /* Or a fixed height */
  }
  .canvas-area {
    width: 80%; /* Adjust as needed */
    height: 70vh; /* Adjust as needed */
    border: 1px solid #ccc;
    margin-bottom: 20px;
    background-color: #f0f0f0; /* Light gray background for canvas area */
  }
  .controls {
    padding: 10px;
    background-color: #e9e9e9;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .controls button {
    margin: 5px;
    padding: 10px 15px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  .controls button:hover {
    opacity: 0.9;
  }
  .controls button:not(.stop-button) {
    background-color: #4CAF50; /* Green */
    color: white;
  }
  .controls button.stop-button {
    background-color: #f44336; /* Red */
    color: white;
  }
  .controls p {
    margin-top: 10px;
    font-style: italic;
    text-align: center;
  }
</style>