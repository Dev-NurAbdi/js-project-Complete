// --- 📅 MIISKA CUSUB EE MEMORIZATION PLANS (SIDA SAWIRKAADU AHAA) ---
const quranMemorizePlans = [
    { pages: "3 Pages / Day", days: "5 Days / Week", duration: "10 months" },
    { pages: "3 Pages / Day", days: "4 Days / Week", duration: "12 months" },
    { pages: "2 Pages / Day", days: "5 Days / Week", duration: "15 months" },
    { pages: "2 Pages / Day", days: "4 Days / Week", duration: "19 months" },
    { pages: "1 Pages / Day", days: "5 Days / Week", duration: "30 months" },
    { pages: "1 Pages / Day", days: "4 Days / Week", duration: "37 months" }
];

let globalSurahs = [];
let isAllVisible = { tafsiir: false, read: false };

// --- 📱 HAMBURGER MENU TOGGLE ---
function toggleMenu() {
    document.getElementById('hamburger-menu').classList.toggle('active');
    document.getElementById('nav-menu').classList.toggle('active');
}

// --- FETCH DATA (IF GRID EXISTS ON CURRENT PAGE) ---
async function fetchQuranData() {
    const hasTafsiir = document.getElementById('tafsiir-grid');
    const hasRead = document.getElementById('read-grid');
    
    if (!hasTafsiir && !hasRead) return; // Ha shaqayn haddii aan boggagaas la joogin

    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        const data = await response.json();
        globalSurahs = data.chapters;
        
        if (hasTafsiir) renderSurahGrid('tafsiir', globalSurahs.slice(0, 4));
        if (hasRead) renderSurahGrid('read', globalSurahs.slice(0, 4));
    } catch (error) {
        console.error("API Error:", error);
    }
}

function renderSurahGrid(tab, surahList) {
    const grid = document.getElementById(`${tab}-grid`);
    if (!grid) return;
    grid.innerHTML = '';
    
    surahList.forEach(surah => {
        const card = document.createElement('div');
        card.className = 'surah-card';
        card.setAttribute('onclick', tab === 'read' ? `loadSingleSurah(${surah.id}, '${surah.name_complex}')` : `loadSingleTafsiir(${surah.id}, '${surah.name_complex}')`);
        card.innerHTML = `
            <h3>${surah.name_arabic}</h3>
            <h4>${surah.name_complex}</h4>
            <p style="font-size:13px; color:var(--text-muted); margin-top:5px;">${surah.verses_count} Verses</p>
        `;
        grid.appendChild(card);
    });
}

// --- LOAD SINGLE SURAH (READ BOGGA) ---
async function loadSingleSurah(id, name) {
    const viewContainer = document.getElementById('single-read-container');
    const container = document.getElementById('read-verses-container');
    viewContainer.style.display = 'block';
    document.getElementById('read-surah-title').textContent = `${name} (Akhris)`;
    container.innerHTML = "<div style='text-align:center;'>Waa la soo kicinayaa aayadaha...</div>";
    viewContainer.scrollIntoView({ behavior: 'smooth' });

    try {
        const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`);
        const data = await response.json();
        container.innerHTML = '';
        data.verses.forEach(verse => {
            const box = document.createElement('div');
            box.className = 'verse-box';
            box.innerHTML = `<div class="arabic-text">${verse.text_uthmani} ﴿${verse.verse_key.split(':')[1]}﴾</div>`;
            container.appendChild(box);
        });
    } catch (error) { container.innerHTML = "Cilad ayaa dhacday."; }
}

// --- LOAD SINGLE TAFSIIR ---
async function loadSingleTafsiir(id, name) {
    const viewContainer = document.getElementById('single-tafsiir-container');
    const container = document.getElementById('tafsiir-verses-container');
    viewContainer.style.display = 'block';
    document.getElementById('tafsiir-surah-title').textContent = `${name} (Tafsiir & Tarjumaad)`;
    container.innerHTML = "<div style='text-align:center;'>Waa la soo kicinayaa tafsiirka...</div>";
    viewContainer.scrollIntoView({ behavior: 'smooth' });

    try {
        const response = await fetch(`https://quranenc.com/api/v1/translation/sura/somali_yacob/${id}`);
        const data = await response.json();
        container.innerHTML = '';
        data.result.forEach(verse => {
            const box = document.createElement('div');
            box.className = 'verse-box';
            box.innerHTML = `<div class="arabic-text">${verse.arabic_text}</div><div class="somali-text"><strong>Aayadda ${verse.aya}:</strong> ${verse.translation}</div>`;
            container.appendChild(box);
        });
    } catch (error) { container.innerHTML = "Cilad ayaa dhacday."; }
}

function closeView(tab) {
    document.getElementById(`single-${tab}-container`).style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterSurahs(tab) {
    const keyword = document.getElementById(`${tab}-search`).value.toLowerCase();
    const filtered = globalSurahs.filter(surah => surah.name_complex.toLowerCase().includes(keyword) || surah.name_arabic.includes(keyword));
    renderSurahGrid(tab, filtered);
}

function showAllSurahs(tab) {
    const btn = document.getElementById(`btn-see-${tab}`);
    if (!isAllVisible[tab]) {
        renderSurahGrid(tab, globalSurahs);
        btn.textContent = "See Less";
        isAllVisible[tab] = true;
    } else {
        renderSurahGrid(tab, globalSurahs.slice(0, 4));
        btn.textContent = "See All";
        isAllVisible[tab] = false;
    }
}

// --- SOO BANDHIGISTA JADWALKA CUSUB ---
function loadSchedule() {
    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    quranMemorizePlans.forEach(plan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color: var(--primary-color); font-weight: 600;">${plan.pages}</td>
            <td>${plan.days}</td>
            <td style="font-weight: bold;">${plan.duration}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- DARK MODE THEME MANAGEMENT ---
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');

// --- CONTACT FORM VALIDATION ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('form-success').style.display = 'block';
        this.reset();
    });
}

window.onload = () => {
    fetchQuranData();
    loadSchedule();
};