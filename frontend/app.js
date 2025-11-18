/* frontend JS with forecast icons, spinner, gradient, sunrise/sunset, geolocation */
var backend = 'http://localhost:4000';
function $(id){ return document.getElementById(id); }

var cityInput = $('cityInput');
var searchBtn = $('searchBtn');
var locBtn = $('locBtn'); // new
var result = $('result');
var forecastEl = $('forecast');
var errorEl = $('error');

function clearUI(){
  result.innerHTML = '';
  forecastEl.innerHTML = '';
  errorEl.textContent = '';
}

/* tiny helper: unix -> local time hh:mm */
function timeFromUnix(ts){
  try {
    var d = new Date(ts * 1000);
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  } catch(e){ return ''; }
}

/* fetch helper with JSON error handling */
function fetchJson(url){
  return fetch(url).then(function(resp){
    if(!resp.ok){
      return resp.json().then(function(j){ throw new Error(j.error || resp.statusText || 'Error'); });
    }
    return resp.json();
  });
}

/* render current weather (adds sunrise/sunset, sets body data-weather) */
function renderWeather(data) {
  var card = document.createElement('div');
  card.className = 'card';

  var icon = (data && data.weather && data.weather[0] && data.weather[0].icon) || '';
  var main = (data && data.weather && data.weather[0] && data.weather[0].main) || '';
  var desc = (data && data.weather && data.weather[0] && data.weather[0].description) || '';
  var name = (data && data.name) || '';
  var temp = (data && data.main && Math.round(data.main.temp)) || '';
  var humidity = (data && data.main && data.main.humidity);
  var wind = (data && data.wind && data.wind.speed);

  // set page gradient via dataset (CSS has selectors)
  if(main) {
    try { document.body.dataset.weather = main; } catch(e) {}
  } else {
    document.body.removeAttribute('data-weather');
  }

  // sunrise/sunset if present
  var sunrise = (data && data.sys && data.sys.sunrise) ? timeFromUnix(data.sys.sunrise) : '';
  var sunset = (data && data.sys && data.sys.sunset) ? timeFromUnix(data.sys.sunset) : '';

  var inner = '<div class="title">' + name + '</div><div style="display:flex;align-items:center;gap:12px" class="info">';
  if (icon) inner += '<img class="" src="https://openweathermap.org/img/wn/' + icon + '@2x.png" alt="" />';
  inner += '<div><div class="temp">' + temp + '°C</div>';
  inner += '<div class="desc" style="text-transform:capitalize">' + desc + '</div>';
  inner += '<div>Humidity: ' + humidity + '%</div>';
  inner += '<div>Wind: ' + wind + ' m/s</div>';
  if(sunrise || sunset){
    inner += '<div style="margin-top:8px;font-size:0.92rem;color:rgba(10,15,30,0.8)">';
    inner += (sunrise ? 'Sunrise: ' + sunrise + ' ' : '') + (sunset ? ' • Sunset: ' + sunset : '');
    inner += '</div>';
  }
  inner += '</div></div>';

  card.innerHTML = inner;
  result.appendChild(card);
}

/* render forecast with icons; while fetching we show a spinner in the forecast area */
function renderForecast(obj){
  var arr = (obj && obj.forecast) || [];
  if(!arr.length) return;

  var wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.innerHTML = '<h3>Forecast</h3>';
  var list = document.createElement('div');
  list.className = 'forecast-list';

  for(var i=0;i<arr.length;i++){
    var d = arr[i];
    var item = document.createElement('div');
    item.className = 'forecast-item';

    // compute readable day name + date
    var dateObj = new Date(d.date);
    var weekday = dateObj.toLocaleDateString([], { weekday: 'short' }); // short day e.g. Tue
    var month = dateObj.toLocaleDateString([], { month: 'short' });
    var day = dateObj.getDate();

    // small icon if available
    var iconElm = '';
    var icon = (d.weather && d.weather.icon) || '';
    if(icon){
      iconElm = '<img src="https://openweathermap.org/img/wn/' + icon + '@2x.png" alt="" />';
    }

    var html = '<div style="font-weight:600;margin-bottom:6px">' + weekday + ' — ' + month + ' ' + day + '</div>';
    html += iconElm;
    html += '<div style="margin-top:6px">' + Math.round(d.temp_min) + '° / ' + Math.round(d.temp_max) + '°</div>';
    html += '<div style="text-transform:capitalize;margin-top:6px;color:rgba(10,15,30,0.8)">' + (d.weather && d.weather.description || '') + '</div>';

    item.innerHTML = html;
    list.appendChild(item);
  }

  wrap.appendChild(list);
  forecastEl.appendChild(wrap);
}

/* show spinner in forecast area while fetching */
function showForecastLoading(){
  forecastEl.innerHTML = '';
  var box = document.createElement('div');
  box.className = 'card';
  box.style.alignItems = 'center';
  box.style.justifyContent = 'center';
  box.innerHTML = '<div class="spinner" aria-hidden="true"></div>';
  forecastEl.appendChild(box);
}

function lookupCity(city){
  if(!city) return;
  clearUI();
  showForecastLoading();
  fetchJson(backend + '/api/weather?q=' + encodeURIComponent(city) + '&units=metric')
    .then(function(w){
      renderWeather(w);
      return fetchJson(backend + '/api/forecast?q=' + encodeURIComponent(city) + '&units=metric');
    })
    .then(function(f){
      // clear spinner and render forecast
      forecastEl.innerHTML = '';
      renderForecast(f);
    })
    .catch(function(e){
      forecastEl.innerHTML = '';
      errorEl.textContent = e.message || 'Request failed';
      console.error(e);
    });
}

/* attach search button */
searchBtn.addEventListener('click', function(){
  var city = (cityInput.value || '').trim();
  if(!city) return;
  lookupCity(city);
});

/* Enter key */
cityInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter') searchBtn.click();
});

/* Use my location button — geolocation -> backend lat/lon calls */
if(locBtn){
  locBtn.addEventListener('click', function(){
    if(!navigator.geolocation){
      errorEl.textContent = 'Geolocation not supported';
      return;
    }
    clearUI();
    showForecastLoading();
    locBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      fetchJson(backend + '/api/weather?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon) + '&units=metric')
        .then(function(w){
          renderWeather(w);
          return fetchJson(backend + '/api/forecast?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon) + '&units=metric');
        })
        .then(function(f){
          forecastEl.innerHTML = '';
          renderForecast(f);
        })
        .catch(function(e){
          forecastEl.innerHTML = '';
          errorEl.textContent = e.message || 'Request failed';
          console.error(e);
        })
        .finally(function(){ locBtn.disabled = false; });
    }, function(err){
      forecastEl.innerHTML = '';
      locBtn.disabled = false;
      errorEl.textContent = 'Unable to retrieve location: ' + (err && err.message || 'error');
    }, { timeout:10000 });
  });
}