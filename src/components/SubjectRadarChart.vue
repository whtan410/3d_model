<template>
  <div class="radar-chart-container">
    <div class="chart-wrapper">
      <Radar :data="chartData" :options="chartOptions" ref="radarChart" />
    </div>
    <!-- <div v_if="icons && icons.length" class="icons-overlay">
      <div
        v-for="(icon, index) in icons"
        :key="index"
        :class="`icon-position-${index}`"
      >
        <v-icon v-if="icon.mdi" :color="icon.color || 'grey-darken-1'">{{
          icon.mdi
        }}</v-icon>
        <img
          v-else-if="icon.src"
          :src="icon.src"
          :alt="chartData.labels[index]"
          class="stat-icon-img"
        />
        <span v-else class="stat-icon-text">{{ icon.text }}</span>
      </div>
    </div> -->
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Radar } from "vue-chartjs";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title // Added Title for completeness, though not strictly in the image's chart part
);

export default {
  name: "SubjectRadarChart",
  components: {
    Radar,
  },
  props: {
    chartTitle: {
      type: String,
      default: "Subject Proficiency",
    },
    labels: {
      type: Array,
      default: () => [
        "Physics",
        "Biology",
        "Math",
        "Chemistry",
        "English",
        "Sports",
      ],
    },
    dataPoints: {
      type: Array,
      default: () => [30, 25, 20, 28, 35, 22], // Example data estimated from image
    },
    datasetLabel: {
      type: String,
      default: "Current Skills",
    },
    // Optional: For more complex icons around the chart
    icons: {
      type: Array,
      default: () => [
        // Example: Pass mdi icons or image urls
        // { mdi: 'mdi-atom', color: 'blue' }, // Physics
        // { src: '/path/to/biology-icon.png' }, // Biology
        // ... and so on for each label
      ],
    },
  },
  data() {
    return {
      chartData: {
        labels: this.labels,
        datasets: [
          {
            label: this.datasetLabel,
            data: this.dataPoints,
            backgroundColor: "rgba(77, 182, 172, 0.1)", // Light teal fill (optional, image doesn't show strong fill)
            borderColor: "#4DB6AC", // Teal line - matches your previous navbar
            pointBackgroundColor: "#4DB6AC", // Teal points
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#4DB6AC",
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: "rgba(100, 100, 100, 0.3)", // Color of lines from center to labels
            },
            grid: {
              color: "rgba(100, 100, 100, 0.3)", // Color of the concentric hexagonal grid lines
            },
            pointLabels: {
              font: {
                size: 13, // Adjust as needed
                weight: "500",
              },
              color: "#424242", // Dark grey for labels like "Physics", "Biology"
              // You can use a callback here for more complex label rendering if needed
              // callback: function(label, index) {
              //    return label; // Potentially add icon unicode/emoji here
              // }
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 100,
              stepSize: 20,
              backdropColor: "rgba(255, 255, 255, 0.75)", // Background for tick labels for readability
              color: "#616161", // Color of the tick numbers (20, 40, 60...)
              font: {
                size: 10,
              },
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
        plugins: {
          legend: {
            display: false, // Legend is not visible in the image for the dataset itself
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.r !== null) {
                  label += context.parsed.r;
                }
                return label;
              },
            },
          },
        },
      },
    };
  },
  watch: {
    dataPoints: {
      deep: true,
      handler(newData) {
        this.chartData.datasets[0].data = newData;
        // If you want to force a re-render, Chart.js typically reacts to data changes,
        // but you can use this.$refs.radarChart.updateChart() if needed.
      },
    },
    labels: {
      deep: true,
      handler(newLabels) {
        this.chartData.labels = newLabels;
      },
    },
  },
};
</script>

<style scoped>
.radar-chart-container {
  position: relative; /* For positioning icons if needed */
  width: 100%;
  max-width: 450px; /* Adjust as needed */
  margin: auto;
  /* background-color: #f5f5f5; /* Light grey background like in the image */
  /* padding: 20px; */
  /* border-radius: 8px; */
}

.chart-wrapper {
  position: relative;
  height: 350px; /* Or set a specific aspect ratio */
  width: 100%;
}

/* Example for icon positioning - this is illustrative and needs refinement */
.icons-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* So it doesn't interfere with chart interactions */
}

.stat-icon-img {
  width: 24px; /* Adjust size */
  height: 24px;
}
.stat-icon-text {
  font-size: 12px;
  color: #555;
}
</style>
