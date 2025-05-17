<template>
    <v-card class="border ma-4 pa-4">
      <v-row>
        <v-col col="6">
          <v-responsive class="mx-auto" max-width="344">
            <v-text-field
              hide-details="auto"
              label="Question Asked"
              v-model="firstName"
            ></v-text-field>
            <v-btn color="primary" @click="submitForm">Submit</v-btn>
          </v-responsive>
        </v-col>
        <v-col col="6"> displayanswer here </v-col>
      </v-row>
    </v-card>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  const firstName = ref("");
  
  const submitForm = async () => {
    // Basic validation: Check if firstName is not empty
    if (!firstName.value.trim()) {
      alert("First name cannot be empty.");
      return;
    }
  
    try {
      // Replace 'YOUR_BACKEND_API_ENDPOINT' with your actual API endpoint
      const response = await fetch("YOUR_BACKEND_API_ENDPOINT", {
        method: "POST", // Or 'GET', 'PUT', 'DELETE', etc., depending on your API
        headers: {
          "Content-Type": "application/json",
          // Add any other headers your API requires, like authorization tokens
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify({
          firstName: firstName.value,
          // Add other data you want to send to the backend
        }),
      });
  
      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }
  
      const data = await response.json();
      console.log("Success:", data);
      // Handle successful response here (e.g., show a success message, redirect, clear form)
      alert("Form submitted successfully!");
      firstName.value = ""; // Clear the input field after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle errors here (e.g., show an error message to the user)
      alert(`Error submitting form: ${error.message}`);
    }
  };
  </script>
  