const express = require(`express`);

const cors = require(`cors`);



const app = express();
const PORT= 3000;

app.use(cors());
app.use(express.json());


app.post('/submit', (req, res) => {
  const { distance, fuelType, vehicleModel, fuelPrice } = req.body;


  const trip = { distance, fuelType, vehicleModel, fuelPrice };
  console.log('📝 Received trip:', trip);

  res.status(200).json({ message: 'Trip received!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

