
const stocksBtn = document.getElementById('stocks-button');
const dogsBtn = document.getElementById('dogs-button');

if (stocksBtn) {
  stocksBtn.addEventListener('click', () => {
    window.location.href = 'INST377-Assignment2-AlexMartini-Stocks.html';
  });
}
if (dogsBtn) {
  dogsBtn.addEventListener('click', () => {
    window.location.href = 'INST377-Assignment2-AlexMartini-Dogs.html';
  });
}


async function loadQuote() {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    const quote = data[0].q;
    const author = data[0].a;
    const quoteBox = document.getElementById('quote-text');
    if (quoteBox) {
      quoteBox.textContent = `"${quote}" – ${author}`;
    }
  } catch (err) {
    const quoteBox = document.getElementById('quote-text');
    if (quoteBox) quoteBox.textContent = 'Could not load quote.';
    console.error(err);
  }
}
window.addEventListener('DOMContentLoaded', loadQuote);


if (window.annyang) {
  const commands = {
    'hello': () => {
      alert('Hello World');
      speechSynthesis.speak(new SpeechSynthesisUtterance("Hello, World!"));
    },
    'change the color to *color': (color) => {
      document.body.style.backgroundColor = color;
      speechSynthesis.speak(new SpeechSynthesisUtterance(`Changing background to ${color}`));
    },
    'navigate to *page': (page) => {
      const lower = page.toLowerCase();
      let msg;
      if (lower.includes('stock')) {
        window.location.href = 'INST377-Assignment2-AlexMartini-Stocks.html';
        msg = 'Going to stocks page';
      } else if (lower.includes('dog')) {
        window.location.href = 'INST377-Assignment2-AlexMartini-Dogs.html';
        msg = 'Going to dogs page';
      } else {
        window.location.href = 'INST377-Assignment2-AlexMartini-Home.html';
        msg = 'Going home';
      }
      speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
    },
    'lookup *stock': (stock) => {
      const input = document.getElementById('stock-input');
      const dropdown = document.getElementById('day-range');
      const btn = document.getElementById('lookup-stock');
      if (input && dropdown && btn) {
        input.value = stock.toUpperCase();
        dropdown.value = "30";
        btn.click();
        speechSynthesis.speak(new SpeechSynthesisUtterance(`Looking up ${stock}`));
      }
    },
    'load dog breed *name': async (name) => {
      const res = await fetch('https://api.thedogapi.com/v1/breeds');
      const data = await res.json();
      const match = data.find(b => b.name.toLowerCase().includes(name.toLowerCase()));
      if (match) {
        showBreedInfo(match);
        speechSynthesis.speak(new SpeechSynthesisUtterance(`Loaded information for ${match.name}`));
      } else {
        speechSynthesis.speak(new SpeechSynthesisUtterance(`Could not find ${name}`));
      }
    }
  };
  annyang.addCommands(commands);
}


const stockBtn = document.getElementById('lookup-stock');
if (stockBtn) {
  stockBtn.addEventListener('click', async () => {
    const ticker = document.getElementById('stock-input').value.toUpperCase().trim();
    const range = document.getElementById('day-range').value;
    if (!ticker) return;

    const API_KEY = '7UtJRDycwjExvtGJ67je_kpYhWhqWfzn';
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - parseInt(range));

    const from = pastDate.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log('Polygon data:', data);
      const prices = data.results;

      if (!prices || prices.length === 0) {
        alert("No stock data found. Check the ticker.");
        return;
      }

      const labels = prices.map(p => new Date(p.t).toLocaleDateString());
      const values = prices.map(p => p.c);
      drawChart(labels, values, ticker);
    } catch (err) {
      console.error('Polygon API error:', err);
      alert('Failed to fetch stock data.');
    }
  });
}

function drawChart(labels, data, ticker) {
  const ctx = document.getElementById('stockChart').getContext('2d');
  if (window.stockChartInstance) window.stockChartInstance.destroy();

  window.stockChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Closing Price for ${ticker}`,
        data: data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Price ($)' } }
      }
    }
  });
}


async function loadRedditStocks() {
  const tbody = document.getElementById('reddit-stocks');
  if (!tbody) return;

  try {
    const res = await fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03');
    const data = await res.json();

    tbody.innerHTML = '';
    data.slice(0, 5).forEach(stock => {
      const row = document.createElement('tr');
      const sentimentIcon = stock.sentiment.toLowerCase() === 'bullish'
        ? '<img src="https://cdn-icons-png.flaticon.com/512/3771/3771367.png" alt="Bull" width="40">'
        : '<img src="https://cdn-icons-png.flaticon.com/512/3771/3771358.png" alt="Bear" width="40">';

      row.innerHTML = `
        <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
        <td>${stock.no_of_comments}</td>
        <td>${sentimentIcon}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load Reddit stocks:', err);
  }
}
window.addEventListener('DOMContentLoaded', loadRedditStocks);


async function loadDogImages() {
  const carousel = document.getElementById('dog-carousel');
  if (!carousel) return;

  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random/10');
    const data = await res.json();
    const images = data.message;

    carousel.innerHTML = '';
    let index = 0;

    const img = document.createElement('img');
    img.src = images[index];
    img.alt = 'Dog Image';
    img.width = 300;
    carousel.appendChild(img);

    setInterval(() => {
      index = (index + 1) % images.length;
      img.src = images[index];
    }, 2500);
  } catch (err) {
    console.error('Dog API error:', err);
  }
}
window.addEventListener('DOMContentLoaded', loadDogImages);


async function loadDogBreeds() {
  const container = document.getElementById('breed-buttons');
  if (!container) return;

  try {
    const res = await fetch('https://api.thedogapi.com/v1/breeds');
    const data = await res.json();

    data.slice(0, 20).forEach(breed => {
      const btn = document.createElement('button');
      btn.textContent = breed.name;
      btn.addEventListener('click', () => showBreedInfo(breed));
      container.appendChild(btn);
    });
  } catch (err) {
    console.error('Breed button error:', err);
  }
}
window.addEventListener('DOMContentLoaded', loadDogBreeds);


function showBreedInfo(breed) {
  const infoBox = document.getElementById('breed-info');
  if (!infoBox) return;

  const description = breed.temperament || breed.bred_for || "No description available";
  const origin = breed.origin ? `<br><strong>Origin:</strong> ${breed.origin}` : '';

  infoBox.innerHTML = `
    <div class="breed-grid">
      <div><strong>Name:</strong><br> ${breed.name}</div>
      <div><strong>Description:</strong><br> ${description}${origin}</div>
      <div><strong>Life Span:</strong><br> ${breed.life_span}</div>
    </div>
  `;
}

  