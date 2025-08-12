async function calculate() {
  const button = document.getElementById("btn");
  button.disabled = true;
  button.innerText = "Vroom Vroom...";

  const distance = document.getElementById("Distance").value;
  const fuelType = document.getElementById("fuelType").value;
  const vehicleModel = document.getElementById("VehicleType").value;
  const fuelPrice = document.getElementById("FuelPrice").value;

  const tripData = {
    distance: Number(distance),
    fuelType,
    vehicleModel,
    fuelPrice: Number(fuelPrice),
  };

  console.log("Sending tripData:", tripData);

try {
  const response = await fetch("https://ecodrive-2458.onrender.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tripData),
  });

  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }

    const result = await response.json();
    const latest = result.trip;
    console.log("Received trip from backend:", latest);

    let mileage, emissionFactor;
    if (latest.fuelType === "Petrol") {
      mileage = 15;
      emissionFactor = 2.31;
    } else if (latest.fuelType === "Diesel") {
      mileage = 18;
      emissionFactor = 2.68;
    } else if (latest.fuelType === "Electric") {
      mileage = 6;
      emissionFactor = 0;
    }

    const fuelUsed = latest.distance / mileage;
    const cost = fuelUsed * latest.fuelPrice;
    const co2 = fuelUsed * emissionFactor;

    const resultDiv = document.getElementById("result");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
      <h3>Trip Summary</h3>
      <p><strong>Vehicle:</strong> ${latest.vehicleModel}</p>
      <p><strong>Distance:</strong> ${latest.distance} km</p>
      <p><strong>Fuel Used:</strong> ${fuelUsed.toFixed(2)} ${latest.fuelType === 'Electric' ? 'kWh' : 'litres'}</p>
      <p><strong>Estimated Cost:</strong> ₹${cost.toFixed(2)}</p>
      <p><strong>CO₂ Emission:</strong> ${co2.toFixed(2)} kg</p>
    `;

    showComparison(latest.distance);
    document.getElementById("trip-form").reset();
  } catch (err) {
    console.error("Fetch failed:", err);
    alert("Error submitting trip. Try again later.");
  } finally {
    button.disabled = false;
    button.innerText = "Calculate";
  }
}

function showComparison(distance) {
  const trainCostPerKm = 0.6;
  const trainCo2PerKm = 0.02;
  const busCostPerKm = 0.8;
  const busCo2PerKm = 0.04;

  const trainCost = (distance * trainCostPerKm).toFixed(2);
  const trainCo2 = (distance * trainCo2PerKm).toFixed(2);
  const busCost = (distance * busCostPerKm).toFixed(2);
  const busCo2 = (distance * busCo2PerKm).toFixed(2);

  const comparisonCard = document.getElementById("comparison-card");
  if (comparisonCard) {
    comparisonCard.innerHTML = `
      <h3>Compare Options</h3>
      <div><strong>🚆 Train</strong><br>Cost: ₹${trainCost}<br>CO₂: ${trainCo2} kg</div><br>
      <div><strong>🚌 Bus</strong><br>Cost: ₹${busCost}<br>CO₂: ${busCo2} kg</div>
    `;
  }
}

window.addEventListener("load", () => {
  const weatherCard = document.getElementById("weather-card");

  if (!navigator.geolocation) {
    weatherCard.innerHTML = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const data = await response.json();
        const weather = data.current_weather;

    // Mapping Open-Meteo weather codes to readable descriptions
const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

const code = weather.weathercode;
const description = weatherDescriptions[code] || "Unknown condition";

weatherCard.innerHTML = `
  <h3>🌤️ Local Weather</h3>
  <div><strong>Temp:</strong> ${weather.temperature}°C</div>
  <div><strong>Wind:</strong> ${weather.windspeed} km/h</div>
  <div><strong>Condition:</strong> ${description}</div>
`;
} catch (err) {
  weatherCard.innerHTML = "Failed to fetch weather.";
  console.error(err);
}
},
() => {
  weatherCard.innerHTML = "Permission denied for location.";
}
);
});
