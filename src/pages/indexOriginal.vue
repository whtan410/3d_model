<template>
  <NavigationBar />

  <HeroSection />

  <v-row class="pa-5" align="center" justify="center">
    <v-col v-for="image in images" align="center" justify="center">
      <ProductTile :imageSrc="image" />
    </v-col>
  </v-row>

  <v-row align="center" justify="center">
    <v-col cols="8" align="center" justify="center">
      <StudentBenefits />
    </v-col>
  </v-row>

  <v-row align="center" justify="center">
    <v-col cols="8" align="center" justify="center">
      <ParentBenefits />
    </v-col>
  </v-row>
</template>

<script setup>
//
import HeroSection from "@/components/HeroSection.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import ParentBenefits from "@/components/ParentBenefits.vue";
import ProductTile from "@/components/ProductTile.vue";
import StudentBenefits from "@/components/StudentBenefits.vue";

const images = [
  "@/assets/product1.png",
  "@/assets/product2.png",
  "@/assets/product3.png",
];
</script>
