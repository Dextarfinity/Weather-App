<template>
  <v-app>
    <v-container style="display: flex; justify-content: center; align-items: center">
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="pa-4">
            <div class="text-center mb-2">
              <p>{{ currentDate }}</p>
              <p>{{ currentTime }}</p>
            </div>

            <v-card-title>
              <h2 class="text-center">Weather App</h2>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="city"
                label="Enter city"
                @keyup.enter="fetchWeather"
              ></v-text-field>
              <v-row justify="space-evenly" class="mt-4" align="center">
                <v-col>
                  <v-btn color="primary" @click="fetchWeather" class="mr-2">
                    Get Weather
                  </v-btn>
                </v-col>
                <v-col>
                  <v-btn @click="isCelsius = !isCelsius">
                    Switch to {{ isCelsius ? "Fahrenheit" : "Celsius" }}
                  </v-btn>
                </v-col>
              </v-row>
              <v-alert v-if="error" type="error">{{ error }}</v-alert>
              <v-progress-circular
                v-if="loading"
                indeterminate
                color="primary"
              ></v-progress-circular>
              <v-card v-if="weather" class="mt-4">
                <v-card-title class="text-h5">{{ weather.name }}</v-card-title>
                <v-card-subtitle>
                  {{ weather.weather[0].description }}
                  <img :src="weather.iconUrl" alt="Weather Icon" />
                </v-card-subtitle>
                <v-card-text>
                  <p>
                    <span class="mdi mdi-thermometer" aria-hidden="true"></span>
                    <strong>Temperature:</strong> {{ weather.main.temp }} °C
                  </p>
                  <p>
                    <span class="mdi mdi-water" aria-hidden="true"></span>
                    <strong>Humidity:</strong> {{ weather.main.humidity }}%
                  </p>
                  <p>
                    <span class="mdi mdi-weather-windy-variant" aria-hidden="true"></span>
                    <strong>Wind Speed:</strong> {{ weather.wind.speed }} m/s
                  </p>
                  <p>
                    <span class="mdi mdi-gauge" aria-hidden="true"></span>
                    <strong>Pressure:</strong> {{ weather.main.pressure }} hPa
                  </p>
                  <p>
                    <span class="mdi mdi-eye" aria-hidden="true"></span>
                    <strong>Visibility:</strong> {{ weather.visibility / 1000 }} km
                  </p>
                  <p>
                    <span class="mdi mdi-weather-sunset-up" aria-hidden="true"></span>
                    <strong>Sunrise:</strong>
                    {{ new Date(weather.sys.sunrise * 1000).toLocaleTimeString() }}
                  </p>
                  <p>
                    <span class="mdi mdi-weather-sunset-down" aria-hidden="true"></span>
                    <strong>Sunset:</strong>
                    {{ new Date(weather.sys.sunset * 1000).toLocaleTimeString() }}
                  </p>
                </v-card-text>
                <v-btn @click="saveFavorite">Save Location</v-btn>
              </v-card>
              <v-card v-if="favorites.length > 0" class="mt-4">
                <v-card-title>Saved Locations</v-card-title>
                <v-list>
                  <v-list-item
                    v-for="favorite in favorites"
                    :key="favorite"
                    @click="fetchWeather(favorite)"
                  >
                    {{ favorite }}
                  </v-list-item>
                </v-list>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="pa-16" justify="center" align="center">
      <v-row>
        <v-col>
          <div id="map"></div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import "@mdi/font/css/materialdesignicons.css";
import L from "leaflet";

export default {
  data() {
    return {
      city: "",
      weather: null,
      error: "",
      loading: false,
      map: null,
      currentDate: this.formatDate(new Date()),
      currentTime: this.formatTime(new Date()),
      isCelsius: true, // New property to toggle temperature unit
      favorites: [], // New array to store favorite cities
    };
  },
  methods: {
    async fetchWeather() {
      this.loading = true; // Set loading to true
      if (this.city.trim() === "") {
        this.error = "Please enter a city name.";
        this.loading = false; // Set loading to false
        return;
      }
      try {
        const apiKey = "835cdf9290afa939d1cc3ee262272ccb"; // Replace with your OpenWeatherMap API key
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.cod === 200) {
          this.weather = data;
          this.error = "";
          // Get weather icon
          const icon = data.weather[0].icon;
          this.weather.iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`; // Add this line

          // Convert temperature to Fahrenheit if needed
          if (!this.isCelsius) {
            this.weather.main.temp = (data.main.temp * 9) / 5 + 32; // Convert to Fahrenheit
          }
          this.updateMap(data.coord.lat, data.coord.lon);
        } else {
          // Handle different error scenarios
          switch (data.cod) {
            case 404:
              this.error = "City not found.";
              break;
            case 401:
              this.error = "Invalid API key.";
              break;
            default:
              this.error = "An error occurred. Please try again.";
          }
          this.weather = null;
        }
      } catch (error) {
        this.error = "Unable to fetch weather data.";
        this.weather = null;
      } finally {
        this.loading = false; // Set loading to false at the end
      }
    },
    updateMap(lat, lon) {
      if (!this.map) {
        // Initialize map if it hasn't been created yet
        this.map = L.map("map").setView([lat, lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
      } else {
        // Update map view
        this.map.setView([lat, lon], 13);
      }

      // Create a custom icon using MDI
      const mdiIcon = L.divIcon({
        className: "mdi-icon",
        html:
          '<span class="mdi mdi-map-marker" style="font-size: 24px; color: red;"></span>',
        iconSize: [160, 160], // Set the size of the icon
        iconAnchor: [15, 30], // Adjust the anchor point
      });

      // Add the custom marker
      L.marker([lat, lon], { icon: mdiIcon })
        .addTo(this.map)
        .bindPopup(`Weather location: ${this.city}`)
        .openPopup();
    },
    formatDate(date) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatTime(date) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    saveFavorite() {
      if (this.city && !this.favorites.includes(this.city)) {
        this.favorites.push(this.city);
      }
    },
  },
  mounted() {
    // Initialize the map to a default location
    this.map = L.map("map").setView([51.505, -0.09], 13); // Default: London
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    setInterval(() => {
      this.currentTime = this.formatTime(new Date());
    }, 1000);
  },
};
</script>

<style>
#map {
  height: 400px; /* Set height for the map */
  margin-top: 20px; /* Add margin to the top */
}

.mdi-icon {
  background: none;
  border: none;
}

.v-card {
  transition: box-shadow 0.3s;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
</style>
