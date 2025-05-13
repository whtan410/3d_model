<template>
  <div class="model-viewer">
    <h1>3D Model Viewer</h1>
    <div class="viewer-container">
      <!-- 3D viewer content will go here -->
      <div class="placeholder">
        <h2>3D Model Viewport</h2>
        <p>Your 3D model will be displayed here</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-viewer {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.viewer-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder {
  text-align: center;
  color: #666666;
}

h2 {
  color: #42b883;
  margin-bottom: 1rem;
}
</style>