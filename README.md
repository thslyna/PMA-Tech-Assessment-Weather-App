# 🌤️ PMA Tech Assessment — Weather App  
**Built by Lyna Touhouche**

A full-stack weather application built for the **PM Accelerator Software Engineer (AI/ML) Tech Assessment**.  
This app provides current weather, a 5-day forecast, and allows users to fetch weather based on city name or their current location.

---

## 🚀 Features

### 🔍 Search Weather by Location
Users can enter:
- City name  
- Landmark  
- GPS coordinates (lat/lon)

### 📍 Use My Location
- Uses browser **Geolocation API**
- Automatically retrieves latitude and longitude
- Fetches current weather + 5-day forecast

### 📆 5-Day Forecast
Shows:
- Weekday name  
- Date  
- Min & max temperature  
- Weather description  
- Weather icon  

### ✨ Modern UI
- Glassmorphism design  
- Animated icon glow  
- Clean layout  
- Fully responsive  

### 🌐 Real Weather Data
Powered by **OpenWeather API** (no static values).

---

## 🛠️ Tech Stack

### **Frontend**
- HTML  
- CSS  
- JavaScript (Vanilla)

### **Backend**
- Node.js  
- Express  
- Environment variables with `.env`

### **API**
- OpenWeather (Current Weather + Forecast)

---

## 📂 Project Structure
PMA-Tech-Assessment-Weather-App/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│
└── README.md

---

## ⚙️ How It Works

1. The **frontend** sends requests to the backend.  
2. The **backend** forwards requests to OpenWeather (API key kept safe in `.env`).  
3. Data is returned cleanly to the frontend.  
4. The UI displays current weather + 5-day forecast.  
5. Clicking **Use my location** triggers the browser’s GPS to auto-fill the weather.

---
