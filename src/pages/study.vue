<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="text-center mb-4">
            Study Materials
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-4">Welcome to your personalized study space! Based on your quiz performance, we've prepared tailored materials to help you improve.</p>
            
            <v-expansion-panels>
              <v-expansion-panel
                v-for="(subject, index) in subjects"
                :key="index"
              >
                <v-expansion-panel-title>
                  {{ subject.name }}
                  <template v-slot:actions>
                    <v-icon :color="subject.color">{{ subject.icon }}</v-icon>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list>
                    <v-list-item
                      v-for="(material, mIndex) in subject.materials"
                      :key="mIndex"
                      :title="material.title"
                      :subtitle="material.description"
                      class="mb-2"
                    >
                      <template v-slot:append>
                        <v-btn
                          color="primary"
                          variant="text"
                          :href="material.link"
                          target="_blank"
                        >
                          Study Now
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const subjects = ref([
  {
    name: 'Physics',
    icon: 'mdi-atom',
    color: '#2196F3',
    materials: [
      {
        title: 'Forces and Motion',
        description: 'Learn about Newton\'s laws and their applications',
        link: '#'
      },
      {
        title: 'Electric Current',
        description: 'Understanding electrical concepts and measurements',
        link: '#'
      }
    ]
  },
  {
    name: 'Biology',
    icon: 'mdi-dna',
    color: '#4CAF50',
    materials: [
      {
        title: 'Cell Structure',
        description: 'Explore the building blocks of life',
        link: '#'
      }
    ]
  },
  {
    name: 'Mathematics',
    icon: 'mdi-calculator',
    color: '#FFC107',
    materials: [
      {
        title: 'Algebra Basics',
        description: 'Master fundamental algebraic concepts',
        link: '#'
      }
    ]
  }
]);
</script>

<style scoped>
.v-expansion-panels {
  margin-top: 20px;
}
</style>