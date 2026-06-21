// ==========================================================================
// 📅 1. XOGTA JADWALKA QUR'AANKA (MEMORIZATION PLANS)
// ==========================================================================
const quranMemorizePlans = [
    { pages: "3 Pages / Day", days: "5 Days / Week", duration: "10 months" },
    { pages: "3 Pages / Day", days: "4 Days / Week", duration: "12 months" },
    { pages: "2 Pages / Day", days: "5 Days / Week", duration: "15 months" },
    { pages: "2 Pages / Day", days: "4 Days / Week", duration: "19 months" },
    { pages: "1 Pages / Day", days: "5 Days / Week", duration: "30 months" },
    { pages: "1 Pages / Day", days: "4 Days / Week", duration: "37 months" }
];

// Kaydka guud ee suwarada laga soo xigtay API-ga iyo xaaladda badhamada "See All"
let globalSurahs = [];
let isAllVisible = { tafsiir: false, read: false };


// ==========================================================================
// 📱 2. MENU-GA TELEFOONADA (HAMBURGER MENU TOGGLE)
// ==========================================================================
function toggleMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
}


// ==========================================================================
// 🌐 3. API-GA GUUD: SOO DAADUGINTA LIISKA JUZ-YADA IYO SUWARADA QUR'AANKA
// ==========================================================================
async function fetchQuranData() {
    const hasTafsiir = document.getElementById('tafsiir-grid');
    const hasRead = document.getElementById('read-grid');
    
       if (!hasTafsiir && !hasRead) return; 

    try {
        // [API CALL]: Waxaan xogta cutubyada Qur'aanka ka soo xiganaynaa API-ga rasmiga ah ee quran.com
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        const data = await response.json();
        
        // Suraadaha la soo celiyey waxaan ku shubaynaa array-ga guud ee globalSurahs
        globalSurahs = data.chapters;
        
        // Marka ugu horeysa ee bogga la furo, kaliya 4-ta suuradood ee ugu horeysa soo bandhig
        if (hasTafsiir) renderSurahGrid('tafsiir', globalSurahs.slice(0, 4));
        if (hasRead) renderSurahGrid('read', globalSurahs.slice(0, 4));
    } catch (error) {
        // Haddii ay jirto internet la'aan ama cilad dhanka server-ka API-ga ah halkan ayay ku muuqanaysaa
        console.error("API Error (Liiska Suwarada):", error);
    }
}
// 🎨 4. DYNAMIC RENDER: DHISMAHA CARDS-KA Suradaha EE HTML-KA
function renderSurahGrid(tab, surahList) {
    const grid = document.getElementById(`${tab}-grid`);
    if (!grid) return;
    grid.innerHTML = '';
    
    surahList.forEach(surah => {
        // Waxaan ka hortageynaa in magacyada leh (') sida Al-An'am ay jabiyaan koodhka JavaScript-ka
        const safeName = surah.name_complex.replace(/'/g, "\\'");
        const card = document.createElement('div');
        card.className = 'surah-card';
        
        // Ku xir shaqada ku habboon badhanka (Akhris ama Tafsiir) marka card-ka la riixo
        card.setAttribute('onclick', tab === 'read' ? `loadSingleSurah(${surah.id}, '${safeName}')` : `loadSingleTafsiir(${surah.id}, '${safeName}')`);
        card.innerHTML = `
            <h3>${surah.name_arabic}</h3>
            <h4>${surah.name_complex}</h4>
            <p style="font-size:13px; color:var(--text-muted); margin-top:5px;">${surah.verses_count} Verses</p>
        `;
        grid.appendChild(card);
    });
}

// 📖 5. API-GA AKHRISKA: SOO KICINTA AAYADAHA 
async function loadSingleSurah(id, name) {
    const viewContainer = document.getElementById('single-read-container');
    const container = document.getElementById('read-verses-container');
    if (!viewContainer || !container) return;
    viewContainer.style.display = 'block';
    document.getElementById('read-surah-title').textContent = `${name} (Akhris)`;
    container.innerHTML = "<div style='text-align:center; padding: 20px;'>Waa la soo kicinayaa aayadaha...</div>";
    viewContainer.scrollIntoView({ behavior: 'smooth' });
    try {
        // [API CALL]: Waxaan halkan ka soo waceynaa quran.com si aan u helno qoraalka rasmiga ah ee Uthmani calamooyinka wata
        const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`);
        const data = await response.json();
        container.innerHTML = '';
        
        // Loop garee aayad kasta si loogu dhex daro sanduuqa (box) loogu talagalay HTML-ka
        data.verses.forEach(verse => {
            const box = document.createElement('div');
            box.className = 'verse-box';
            // split(':') wuxuu naga caawinayaa inaan aayadda lambarkeeda saxda ah ka soo dhex bixinno '1:1' u weecino '1'
            box.innerHTML = `<div class="arabic-text">${verse.text_uthmani} ﴿${verse.verse_key.split(':')[1]}﴾</div>`;
            container.appendChild(box);
        });
    } catch (error) { 
        console.error("API Error (Akhriska):", error);
        container.innerHTML = "<div style='text-align:center; color:red; padding:20px;'>Cilad ayaa dhacday intii aayadaha la soo kicinayey.</div>"; 
    }
}
// 🕌 6. API-GA TAFSIIRKA: SOO KICINTA AF-SOOMAALIGA (YAACOB)
async function loadSingleTafsiir(id, name) {
    const viewContainer = document.getElementById('single-tafsiir-container');
    const container = document.getElementById('tafsiir-verses-container');
    if (!viewContainer || !container) return;

    viewContainer.style.display = 'block';
    document.getElementById('tafsiir-surah-title').textContent = `${name} (Tafsiir & Tarjumaad)`;
    container.innerHTML = "<div style='text-align:center; padding: 20px;'>Waa la soo kicinayaa tafsiirka...</div>";
    viewContainer.scrollIntoView({ behavior: 'smooth' });

    try {
        // [API CALL]: Waxaan halkan koodhka uga soo xiganaynaa QuranEnc oo kaydisa tarjumada rasmiga ah ee af-Soomaaliga (Sheekh Yacqob)
        const response = await fetch(`https://quranenc.com/api/v1/translation/sura/somali_yacob/${id}`);
        const data = await response.json();
        container.innerHTML = '';
        
        // Dynamic ahaan u dhis sanduuqyada Carabiga iyo Soomaaliga isku dhex wata
        data.result.forEach(verse => {
            const box = document.createElement('div');
            box.className = 'verse-box';
            box.innerHTML = `
                <div class="arabic-text">${verse.arabic_text}</div>
                <div class="somali-text"><strong>Aayadda ${verse.aya}:</strong> ${verse.translation}</div>
            `;
            container.appendChild(box);
        });
    } catch (error) { 
        console.error("API Error (Tafsiirka):", error);
        container.innerHTML = "<div style='text-align:center; color:red; padding:20px;'>Cilad ayaa dhacday intii tafsiirka la soo kicinayey.</div>"; 
    }
}
// 🔍 7. SEARCH IYO FILTERS (RAADINTA SURADAHA)
function closeView(tab) {
    const viewContainer = document.getElementById(`single-${tab}-container`);
    if (viewContainer) {
        viewContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
function filterSurahs(tab) {
    const searchBox = document.getElementById(`${tab}-search`);
    if (!searchBox) return;

    const keyword = searchBox.value.toLowerCase();
    // Labada luqadoodba (Carabi iyo Ingiriis) waad ku raadin kartaa magaca suuradda
    const filtered = globalSurahs.filter(surah => 
        surah.name_complex.toLowerCase().includes(keyword) || 
        surah.name_arabic.includes(keyword)
    );
    renderSurahGrid(tab, filtered);
}
function showAllSurahs(tab) {
    const btn = document.getElementById(`btn-see-${tab}`);
    if (!btn) return;

    if (!isAllVisible[tab]) {
        renderSurahGrid(tab, globalSurahs); // Soo bandhig dhammaan 114-ta suuradood
        btn.textContent = "See Less";
        isAllVisible[tab] = true;
    } else {
        renderSurahGrid(tab, globalSurahs.slice(0, 4)); // Dib ugu soo celi kaliya 4 suuradood
        btn.textContent = "See All";
        isAllVisible[tab] = false;
    }
}
// 📊 8. JADWALKA (LOADING THE MEMORIZATION TABLE)
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
// ⚙️ 9. INITIALIZATION & LOCAL STORAGE MANAGEMENT (KICINTA BOGGA)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Kici shaqooyinka API-yada Qur'aanka iyo Shaxda Jadwalka marka boggu dhasho
    fetchQuranData();
    loadSchedule();
    // 2. [LOCAL STORAGE]: Maamulka Dark Mode Theme
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            // Ku dar ama ka saar class-ka .dark-theme jirka guud ee bogga (body)
            document.body.classList.toggle('dark-theme');
            // [LOCAL STORAGE SET]: Keydi doorashada isticmaalaha ('dark' ama 'light') si hadhow loo xasuusto
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });
    }
    // 3. [LOCAL STORAGE GET]: Hubi haddii uu jiro doorasho hore u keydsaneyd marka bogga dib loo fura
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
    // 4. Hubinta Form-ka Xiriirka (Contact Form Validation)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successMsg = document.getElementById('form-success');
            if (successMsg) successMsg.style.display = 'block';
            this.reset();
        });
    }
});