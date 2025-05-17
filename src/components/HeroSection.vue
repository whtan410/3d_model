<template>
  <section class="hero-section">
    <div class="hero-container">
      <div class="text-content">
        <h1>
          Learn Differently,<br />
          <span class="highlight">For Better Grades</span>
        </h1>
        <p class="subtitle">
          Experience Learning That Adapts to You, with AliBaba Qwen.
        </p>
      </div>
      <div class="image-content">
        <div class="decorative-background-oval"></div>
        <img
          src="@/assets/hero-image.png"
          alt="Student learning with a laptop and book"
          class="hero-image"
        />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
};
</script>

<style scoped>
.hero-section {
  background-color: #f7f9fb; /* Light grey background */
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh; /* Adjust as needed */
  font-family: "Arial", sans-serif; /* Or your preferred font */
}

.hero-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  width: 100%;
}

.text-content {
  flex: 1;
  padding-right: 40px; /* Space between text and image */
  max-width: 50%;
}

h1 {
  font-size: 2.8rem; /* Adjust size as needed */
  font-weight: bold;
  line-height: 1.3;
  color: #333; /* Dark grey for text */
  margin-bottom: 20px;
}

.highlight {
  color: #00c2a2; /* Teal color for "For Better Grades" */
}

.subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555; /* Medium grey for subtitle */
  max-width: 450px; /* To control line length */
}

.image-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* For positioning the decorative oval */
  max-width: 50%;
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px; /* Optional: if you want slightly rounded corners for the image */
  position: relative;
  z-index: 2;
}

.decorative-background-oval {
  position: absolute;
  width: 120%; /* Make it larger than the image container to achieve the effect */
  height: 90%; /* Adjust height to control oval shape */
  /* A brighter, slightly different teal for the gradient */
  background-image: radial-gradient(
    ellipse at right center,
    #1df2d0 20%,
    rgba(107, 245, 220, 0.5) 50%,
    rgba(247, 249, 251, 0) 70% /* Fading to transparent or background color */
  );
  border-radius: 50%; /* Makes it an oval */
  right: -20%; /* Shift it to the right to be partially visible */
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  opacity: 0.7; /* Adjust opacity if needed */
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .hero-container {
    flex-direction: column;
    text-align: center;
  }

  .text-content {
    padding-right: 0;
    margin-bottom: 40px;
    max-width: 100%;
  }

  .subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .image-content {
    max-width: 80%;
  }

  .decorative-background-oval {
    width: 100%;
    height: 100%;
    right: 0;
    left: 0;
    margin: auto;
    /* Adjust gradient for centered mobile view if needed */
    background-image: radial-gradient(
      ellipse at center,
      #1df2d0 20%,
      rgba(107, 245, 220, 0.5) 50%,
      rgba(247, 249, 251, 0) 70%
    );
  }
}

@media (max-width: 576px) {
  h1 {
    font-size: 2rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .image-content {
    max-width: 100%;
  }
}
</style>
