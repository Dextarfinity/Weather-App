<template>
  <v-app>
    <v-container
      style="min-height: 100vh; display: flex; justify-content: center; align-items: center;">
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="pa-4">
            <v-card-title>
              <h2 class="text-center">Weather App</h2>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="city"
                label="Enter city"
                @keyup.enter="fetchWeather"
              ></v-text-field>
              <v-btn color="primary" @click="fetchWeather">
                Get Weather
              </v-btn>
              <v-alert v-if="error" type="error">{{ error }}</v-alert>
              <v-card v-if="weather" class="mt-4">
                <v-card-title class="text-h5">{{ weather.name }}</v-card-title>
                <v-card-subtitle>
                  {{ weather.weather[0].description }}
                </v-card-subtitle>
                <v-card-text>
                  <p><strong>Temperature:</strong> {{ weather.main.temp }} °C</p>
                  <p><strong>Humidity:</strong> {{ weather.main.humidity }}%</p>
                  <p><strong>Wind Speed:</strong> {{ weather.wind.speed }} m/s</p>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>
<script>
export default {
data() {
return {city: '',
weather: null,
error: ''
};
},
methods: {
  async fetchWeather() {
  if (this.city.trim() === '') {
    this.error = 'Please enter a city name.';
    return;
  }
  try {
    const apiKey = '835cdf9290afa939d1cc3ee262272ccb'; // Replace with your OpenWeatherMap API key
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();
    
    console.log(data);  // Log the API response to see what’s being returned

    if (data.cod === 200) {
      this.weather = data;
      this.error = '';
    } else {
      this.error = 'City not found.';
      this.weather = null;
    }
  } catch (error) {
    this.error = 'Unable to fetch weather data.';
    this.weather = null;
  }
}
}
};
</script>
<style>
body {
font-family: 'Roboto', sans-serif;
}
</style>