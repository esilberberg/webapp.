// ==========================
// API ENDPOINT + DOM
// ==========================
const googleSheet = 'https://script.google.com/macros/s/AKfycbwgBOHLkyG2yw4IIgaVvhXx703rzhU9lM5jca4PAqB3eSxmA67KeCxA4RY-jtAKqrVd/exec';

const display = document.getElementById('display');
const input = document.getElementById('input');
const welcomeMsg = document.getElementById('welcome-msg');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const translations = {
   en: {
       welcomeMsg: 'Explore the collection',
       searchBtn: 'Search',
       refreshBtn: 'Refresh',
   },
   es: {
       welcomeMsg: 'Explorar la colección',
       searchBtn: 'Buscar',
       refreshBtn: 'Recargar',
   }
};

// ==========================
// TRANSLATION
// ==========================
let currentLanguage = 'en'; // Default language

function translatePage(language) {
   currentLanguage = language;

   // Update text content for the specified language
   welcomeMsg.textContent = translations[language].welcomeMsg;
   searchBtn.textContent = translations[language].searchBtn;
   refreshBtn.textContent = translations[language].refreshBtn;
}

// Initial translation based on the default language
translatePage(currentLanguage);

// Handle language selection from translation language links
document.querySelector('.translation').addEventListener('click', function (event) {
   const selectedLanguage = event.target.getAttribute('data-lang');
   if (selectedLanguage) {
       event.preventDefault(); // Prevent default page reload
       translatePage(selectedLanguage);
   }
});

// ==========================
// DATA STORAGE
// ==========================
let apiData = [];

// ==========================
// FETCH DATA
// ==========================
async function getData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    apiData = data;
    console.log(apiData);

    displayData(apiData);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

getData(googleSheet);

// ==========================
// SEARCH HANDLING
// ==========================
function runSearch() {
  const searchTerms = input.value.trim();
  filterData(searchTerms);
}

searchBtn.addEventListener('click', runSearch);

input.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    runSearch();
}
});

refreshBtn.addEventListener('click', () => {
 input.value = '';
 runSearch();
});

// ==========================
// FILTER DATA
// ==========================
function filterData(query) {
  if (!query) {
    displayData(apiData);
    return;
  }

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .map(term => removeDiacritics(term));

  const filteredData = apiData.filter(item => {
    return searchTerms.every(term => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return removeDiacritics(value.toLowerCase()).includes(term);
        }
        return false;
      });
    });
  });

  displayData(filteredData);
}

// ==========================
// REMOVE ACCENTS
// ==========================
function removeDiacritics(str = '') {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ==========================
// DISPLAY DATA
// ==========================
function displayData(data) {
  display.innerHTML = data.map(object => `
    <article class="item">
      <div class="item-header">
        <h2>
          <a href="${object.URL}" target="_blank" rel="noopener noreferrer">
            ${object.Resource_Title || ''}
          </a>
        </h2>
        <p>${object.Institutional_Hosts || ''}</p>
      </div>

      <div class="item-description">
        <p><span class="inline-label">Resource Types:</span> ${object.Resource_Types || ''}</p>
        <p><span class="inline-label">Subjects in English:</span> ${object.Subjects_in_English || ''}</p>
        <p><span class="inline-label">Materias en Español:</span> ${object.Materias_en_Espanol || ''}</p>
        <p><span class="inline-label">Assuntos em Português:</span> ${object.Assuntos_em_Portugues || ''}</p>
        <p><span class="inline-label">Languages:</span> ${object.Languages || ''}</p>
        <p><span class="inline-label">Countries:</span> ${object.Countries || ''}</p>
        <p><span class="inline-label">Time Coverage:</span> ${object.Time_Coverage || ''}</p>
        <p><span class="inline-label">Summary:</span> ${object.Summary || ''}</p>
      </div>
    </article>
  `).join('');
}