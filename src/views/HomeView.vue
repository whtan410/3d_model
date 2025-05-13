<template>
  <div class="home">
    <h1>Welcome to 3D Model Viewer</h1>
    <div class="content">
      <div class="feature-card">
        <h2>Explore 3D Models</h2>
        <p>View and interact with amazing 3D models in real-time</p>
      </div>
      <div class="feature-card">
        <h2>Easy Navigation</h2>
        <p>Simple and intuitive controls for the best viewing experience</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.content {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 300px;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

h2 {
  color: #42b883;
  margin-bottom: 1rem;
}

p {
  color: #666666;
  line-height: 1.6;
}
</style>