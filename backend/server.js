require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.warn('WARNING: OPENWEATHER_API_KEY not set. Set it in .env');
}

// --- replace existing handlers with these ---

function buildOWUrl(path, params) {
  const base = 'https://api.openweathermap.org/data/2.5/' + path;
  const url = new URL(base);
  // always include api key & units
  url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
  url.searchParams.set('units', params.units || 'metric');

  if (params.lat && params.lon) {
    url.searchParams.set('lat', params.lat);
    url.searchParams.set('lon', params.lon);
  } else if (params.q) {
    // allow the caller to send zip (like "94040,us") or city
    url.searchParams.set('q', params.q);
  }
  return url.toString();
}

app.get('/api/weather', async (req, res) => {
  try {
    const q = req.query.q;
    const lat = req.query.lat;
    const lon = req.query.lon;
    const units = req.query.units || 'metric';
    const url = buildOWUrl('weather', { q, lat, lon, units });

    const response = await axios.get(url);
    return res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message;
    return res.status(status).json({ error: message });
  }
});

app.get('/api/forecast', async (req, res) => {
  try {
    const q = req.query.q;
    const lat = req.query.lat;
    const lon = req.query.lon;
    const units = req.query.units || 'metric';
    const url = buildOWUrl('forecast', { q, lat, lon, units });

    const response = await axios.get(url);
    // group by day (date), pick up to 5 days
    const days = {};
    response.data.list.forEach(item => {
      const day = item.dt_txt.split(' ')[0];
      days[day] = days[day] || [];
      days[day].push(item);
    });
    const resDays = Object.keys(days).slice(0, 5).map(day => {
      const items = days[day];
      const temps = items.map(i => i.main.temp);
      const weather = items[0].weather[0];
      return {
        date: day,
        temp_min: Math.min(...temps),
        temp_max: Math.max(...temps),
        weather
      };
    });
    return res.json({ city: response.data.city, forecast: resDays });
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message;
    return res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
