const API_CONVERT = 'https://api.exchangerate-api.com/v4/latest';
const form = document.getElementById('converter-form');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const resultDiv = document.getElementById('result');
const themeToggle = document.getElementById('theme-toggle');
const saveFavBtn = document.getElementById('save-favorite');
const favList = document.getElementById('favorites-list');

const currencies = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' }
];

// Initialize currencies and theme
document.addEventListener('DOMContentLoaded', () => {
  populateCurrencies();
  loadTheme();
  renderFavorites();
  convert();
});

// Populate dropdowns with currency code and name
function populateCurrencies() {
  currencies.forEach(currency => {
    fromSelect.add(new Option(`${currency.code} - ${currency.name}`, currency.code));
    toSelect.add(new Option(`${currency.code} - ${currency.name}`, currency.code));
  });
  fromSelect.value = 'USD';
  toSelect.value = 'EUR';
}

// Perform conversion
async function convert() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value) || 0;

  if (!amount || amount <= 0) {
    resultDiv.textContent = '⚠️ Please enter a valid amount.';
    return;
  }

  resultDiv.textContent = 'Converting...';

  try {
    const res = await fetch(`${API_CONVERT}/${from}`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const data = await res.json();
    const rate = data.rates[to];
    if (!rate) {
      resultDiv.textContent = `❌ Conversion rate for ${to} not found.`;
      return;
    }
    resultDiv.textContent = `${amount} ${from} = ${(amount * rate).toFixed(4)} ${to}`;
  } catch (err) {
    resultDiv.textContent = `❌ Conversion failed.`;
    console.error(err);
  }
}

// Handle form submission
form.addEventListener('submit', e => {
  e.preventDefault();
  convert();
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Load theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Save favorites
saveFavBtn.addEventListener('click', () => {
  const favorite = `${fromSelect.value}-${toSelect.value}`;
  const favorites = getFavorites();
  if (favorites.includes(favorite)) {
    alert('⚠️ Favorite already saved!');
    return;
  }
  favorites.push(favorite);
  saveFavorites(favorites);
  renderFavorites();
});

// Render favorites
function renderFavorites() {
  const favorites = getFavorites();
  favList.innerHTML = favorites.map(pair => {
    const [from, to] = pair.split('-');
    return `
      <li>
        <button onclick="convertFavorite('${from}', '${to}')">${from} ➡ ${to}</button>
      </li>`;
  }).join('');
}

// Get and save favorites
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Convert favorite
window.convertFavorite = (from, to) => {
  fromSelect.value = from;
  toSelect.value = to;
  convert();
};
