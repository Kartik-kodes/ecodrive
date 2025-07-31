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
    const response = await fetch("https://ecodrive.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const tripsResponse = await fetch("https://ecodrive.onrender.com/trips");
    const trips = await tripsResponse.json();
    const latest = trips[0];

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
      <p><strong>Fuel Used:</strong> ${fuelUsed.toFixed(2)} ${fuelType === 'Electric' ? 'kWh' : 'litres'}</p>
      <p><strong>Estimated Cost:</strong> ₹${cost.toFixed(2)}</p>
      <p><strong>CO₂ Emission:</strong> ${co2.toFixed(2)} kg</p>
    `;

    showComparison(latest.distance);
    document.getElementById("trip-form").reset();
  } catch (err) {
    console.error("Fetch failed", err);
    alert("Error submitting trip");
  } finally {
    button.disabled = false;
    button.innerText = "Calculate";
  }
}

// ✅ OUTSIDE calculate()
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

// ✅ OUTSIDE all
window.addEventListener("load", () => {
  const weatherCard = document.getElementById("weather-card");

  if (!navigator.geolocation) {
    weatherCard.innerHTML = "Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await response.json();

      const weather = data.current_weather;
      const temperature = weather.temperature;
      const windspeed = weather.windspeed;
      const condition = weather.weathercode;

      weatherCard.innerHTML = `
        <h3>🌤️ Local Weather</h3>
        <div><strong>Temp:</strong> ${temperature}°C</div>
        <div><strong>Wind:</strong> ${windspeed} km/h</div>
        <div><strong>Code:</strong> ${condition}</div>
      `;
    } catch (err) {
      weatherCard.innerHTML = "Failed to fetch weather.";
      console.error(err);
    }
  }, () => {
    weatherCard.innerHTML = "Permission denied for location.";
  });
});

