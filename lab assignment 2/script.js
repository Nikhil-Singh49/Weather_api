// Async Weather Tracker

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const historyList = document.getElementById('history-list');

// Weather code mapping
const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
};

// Load search history on page load
document.addEventListener('DOMContentLoaded', loadHistory);

// Event listener for search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        console.log('Search button clicked, starting search for:', city);
        searchWeather(city);
    }
});

// Function to search weather
async function searchWeather(city) {
    console.log('Entering searchWeather function');
    try {
        console.log('About to call getCoordinates');
        const coords = await getCoordinates(city);
        console.log('Coordinates received:', coords);
        console.log('About to call getWeather');
        const weather = await getWeather(coords.lat, coords.lon);
        console.log('Weather data received:', weather);
        displayWeather(city, weather);
        saveToHistory(city);
    } catch (error) {
        console.error('Error in searchWeather:', error);
        displayError(error.message);
    }
    console.log('Exiting searchWeather function');
}

// Function to get coordinates from city name
async function getCoordinates(city) {
    console.log('Entering getCoordinates for city:', city);
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    console.log('Fetching geocoding URL:', url);
    const response = await fetch(url);
    console.log('Geocoding response status:', response.status);
    if (!response.ok) {
        throw new Error('Network error while fetching coordinates');
    }
    const data = await response.json();
    console.log('Geocoding data:', data);
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found');
    }
    const { latitude, longitude, name } = data.results[0];
    console.log('Exiting getCoordinates with coords:', { lat: latitude, lon: longitude, name });
    return { lat: latitude, lon: longitude, name };
}

// Function to get weather data
async function getWeather(lat, lon) {
    console.log('Entering getWeather for lat:', lat, 'lon:', lon);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    console.log('Fetching weather URL:', url);
    const response = await fetch(url);
    console.log('Weather response status:', response.status);
    if (!response.ok) {
        throw new Error('Network error while fetching weather');
    }
    const data = await response.json();
    console.log('Weather data:', data);
    if (!data.current_weather) {
        throw new Error('Invalid weather response');
    }
    console.log('Exiting getWeather with weather:', data.current_weather);
    return data.current_weather;
}

// Function to display weather
function displayWeather(city, weather) {
    console.log('Displaying weather for city:', city);
    const description = weatherDescriptions[weather.weathercode] || 'Unknown';
    weatherDisplay.innerHTML = `
        <h2>${city}</h2>
        <p>Temperature: ${weather.temperature}°C</p>
        <p>Condition: ${description}</p>
    `;
}

// Function to display error
function displayError(message) {
    console.log('Displaying error:', message);
    weatherDisplay.innerHTML = `<p class="error">${message}</p>`;
}

// Function to save city to history
function saveToHistory(city) {
    console.log('Saving to history:', city);
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city); // Add to beginning
        if (history.length > 10) { // Keep only last 10
            history = history.slice(0, 10);
        }
        localStorage.setItem('weatherHistory', JSON.stringify(history));
        updateHistoryDisplay(history);
    }
}

// Function to load history
function loadHistory() {
    console.log('Loading history');
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    updateHistoryDisplay(history);
}

// Function to update history display
function updateHistoryDisplay(history) {
    console.log('Updating history display with:', history);
    historyList.innerHTML = '';
    history.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            console.log('History item clicked:', city);
            cityInput.value = city;
            searchWeather(city);
        });
        historyList.appendChild(li);
    });
}
