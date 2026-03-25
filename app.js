/* ========================================
   WEDDING PLANNER — APP.JS
   Complete SPA Logic with LocalStorage + AI
   ======================================== */

// =========== STATE ===========
const DB = {
  guests: [],
  expenses: [],
  shopping: [],
  tasks: [],
  ceremonySteps: [],
  music: [],
  messages: [],
  rsvpList: [],
  budget: 10000,
  weddingDate: '',
  coupleName: 'Gabriel e Anny',
  venue: 'Gama - DF',
  weddingTime: '15:30',
  dresscode: 'Social',
  mapsUrl: '',
  ceremonyNotes: '',
  inviteText: '',
  firebaseConfig: {
    apiKey: "AIzaSyCuFI7Hdlpjg6ygRxy-Kd2yf-XzSKZ9TdU",
    authDomain: "casamentoannygabriel.firebaseapp.com",
    projectId: "casamentoannygabriel",
    storageBucket: "casamentoannygabriel.firebasestorage.app",
    messagingSenderId: "490737829653",
    appId: "1:490737829653:web:c415bf1262182011a9cb1c",
    measurementId: "G-DF1G1W7S73"
  },
  isFirebaseActive: true,
};

// =========== INIT ===========
function loadDB() {
  const saved = localStorage.getItem('weddingPlanner');
  if (saved) Object.assign(DB, JSON.parse(saved));
}
function saveDB() {
  localStorage.setItem('weddingPlanner', JSON.stringify(DB));
  if (DB.isFirebaseActive) {
    syncToFirebase();
  }
}
function init() {
  loadDB();
  
  if (DB.firebaseConfig) {
    initFirebase();
  }

  setupDefaultTasks();
  setupDefaultCeremony();
  setupDefaultMusic();
  
  updateDashboard();
  renderGuests();
  renderExpenses();
  renderShoppingList();
  renderCeremony();
  renderMusicList();
  renderTasks();
  renderMessages();
  renderRsvpList();
  loadInviteFields();
  generateAITips();
  if (DB.weddingDate) document.getElementById('wedding-date').value = DB.weddingDate;
  document.getElementById('total-budget').value = DB.budget;
  document.getElementById('couple-name-display').innerText = DB.coupleName;
}

function setupDefaultTasks() {
  if (DB.tasks.length > 0) return;
  const defaults = [
    { text: 'Reservar o local da cerimônia', cat: 'Essencial', done: false },
    { text: 'Contratar buffet / alimentação', cat: 'Essencial', done: false },
    { text: 'Comprar roupas e trajes', cat: 'Essencial', done: false },
    { text: 'Contratar fotógrafo / filmador', cat: 'Essencial', done: false },
    { text: 'Enviar convites aos convidados', cat: 'Essencial', done: false },
    { text: 'Contratar decoração', cat: 'Importante', done: false },
    { text: 'Escolher músicas da cerimônia', cat: 'Importante', done: false },
    { text: 'Comprar bebidas e itens da lista', cat: 'Importante', done: false },
    { text: 'Confirmar lista de convidados', cat: 'Importante', done: false },
    { text: 'Preparar roteiro da cerimônia', cat: 'Importante', done: false },
    { text: 'Contratar DJ / música ao vivo', cat: 'Opcional', done: false },
    { text: 'Preparar lemburancinhas', cat: 'Opcional', done: false },
    { text: 'Alugar carro para os noivos', cat: 'Opcional', done: false },
  ];
  DB.tasks = defaults.map((t, i) => ({ ...t, id: Date.now() + i }));
  saveDB();
}

function setupDefaultCeremony() {
  if (DB.ceremonySteps.length > 0) return;
  DB.ceremonySteps = [
    { id: 1, time: '15:00', desc: 'Chegada e acomodação dos convidados' },
    { id: 2, time: '15:20', desc: 'Entrada dos padrinhos e madrinhas' },
    { id: 3, time: '15:28', desc: 'Entrada do noivo com a mãe' },
    { id: 4, time: '15:30', desc: 'Entrada da noiva com o pai' },
    { id: 5, time: '15:35', desc: 'Cerimônia — Abertura e louvor' },
    { id: 6, time: '15:45', desc: 'Mensagem / Sermão do pastor' },
    { id: 7, time: '16:05', desc: 'Troca de alianças e votos' },
    { id: 8, time: '16:15', desc: 'Beijo dos noivos 💑' },
    { id: 9, time: '16:18', desc: 'Saída dos noivos — chuva de arroz / pétalas' },
    { id: 10, time: '16:30', desc: '📸 Sessão de fotos — Pôr do Sol 🌅' },
    { id: 11, time: '17:30', desc: 'Início da festa e recepção dos convidados' },
  ];
  saveDB();
}

function setupDefaultMusic() {
  if (DB.music.length > 0) return;
  DB.music = [
    { icon: '🎹', name: 'A Thousand Years — Christina Perri (Piano)', desc: 'Entrada da noiva', tag: 'Entrada' },
    { icon: '🎼', name: 'Hallelujah — Jeff Buckley (Coral)', desc: 'Entrada padrinhos', tag: 'Entrada' },
    { icon: '🎺', name: 'Canon in D — Pachelbel (Orquestra)', desc: 'Instrumental cerimônia', tag: 'Cerimônia' },
    { icon: '🎹', name: 'Graça Sublime — Elizeu Rodrigues', desc: 'Gospel — Momento dos votos', tag: 'Votos' },
    { icon: '🎵', name: 'Eu Navegarei — Fernanda Brum', desc: 'Gospel — Durante cerimônia', tag: 'Cerimônia' },
    { icon: '🎤', name: 'Deus É Deus — Delino Marçal', desc: 'Gospel — Louvor abertura', tag: 'Abertura' },
    { icon: '🎊', name: 'All of Me — John Legend', desc: 'Saída alegre dos noivos', tag: 'Saída' },
    { icon: '🎉', name: 'For Once in My Life — Stevie Wonder', desc: 'Recepção / Festa', tag: 'Festa' },
  ];
  saveDB();
}

// =========== NAVIGATION ===========
function goto(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  window.scrollTo(0, 0);
}

function adminLogin() {
  const couple = document.getElementById('login-couple').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (!couple) { toast('⚠️ Informe o nome do casal'); return; }
  if (pass !== '@casamento2027') { toast('❌ Senha incorreta'); return; }
  DB.coupleName = couple;
  saveDB();
  document.getElementById('couple-name-display').innerText = couple;
  goto('admin');
  showTab('dashboard');
  updateDashboard();
}

function adminLogout() {
  goto('splash');
}

function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'shopping') {
    document.getElementById('shopping-guest-count').innerText = confirmedCount();
  }
}

function showGuestTab(name) {
  document.querySelectorAll('#guest .tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#guest .nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('gtab-' + name).classList.add('active');
  document.getElementById('gnav-' + name).classList.add('active');
  if (name === 'rsvp') renderRsvpList();
  if (name === 'info') updateInfoTab();
  window.scrollTo(0, 0);
}

// =========== TOAST ===========
function toast(msg) {
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// =========== DASHBOARD ===========
function updateDashboard() {
  const guests = DB.guests.length;
  const confirmed = confirmedCount();
  const spent = totalSpent();
  const budget = DB.budget;
  const remaining = budget - spent;
  const perPerson = confirmed > 0 ? (spent / confirmed) : 0;

  setEl('stat-guests', guests);
  setEl('stat-confirmed', confirmed);
  setEl('stat-spent', fmt(spent));
  setEl('stat-remaining', fmt(remaining < 0 ? 0 : remaining));
  setEl('stat-per-person', fmt(perPerson));

  // Days remaining
  if (DB.weddingDate) {
    const today = new Date(); today.setHours(0,0,0,0);
    const wd = new Date(DB.weddingDate + 'T00:00:00');
    const diff = Math.ceil((wd - today) / (1000*60*60*24));
    setEl('stat-days', diff > 0 ? diff + ' dias' : diff === 0 ? 'HOJE! 🎉' : 'Realizado!');
  }

  // Budget bar
  const pct = Math.min((spent / budget) * 100, 100);
  document.getElementById('budget-bar').style.width = pct + '%';
  document.getElementById('budget-bar').style.background = pct > 90
    ? 'linear-gradient(90deg,#ef4444,#b91c1c)'
    : 'linear-gradient(90deg,#10b981,#a855f7)';
  setEl('budget-label-spent', fmt(spent) + ' gasto');
  setEl('budget-label-total', 'de ' + fmt(budget));
  setEl('budget-labels', '');
}

function saveWeddingDate(val) {
  DB.weddingDate = val;
  saveDB(); updateDashboard();
}

function saveBudget(val) {
  DB.budget = parseFloat(val) || 10000;
  saveDB(); updateDashboard(); renderExpenses();
}

function confirmedCount() {
  return DB.guests.filter(g => g.confirmed).length + DB.rsvpList.filter(r => r.status === 'yes').length;
}

function totalSpent() {
  return DB.expenses.reduce((a, e) => a + e.value, 0);
}

function fmt(n) {
  return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

// =========== AI TIPS ===========
const ALL_AI_TIPS = [
  { icon: '💡', text: 'Com {confirmed} confirmados, você precisará de aprox. {food}kg de comida para o buffet.' },
  { icon: '🥤', text: 'Para {total} pessoas, compre {drinks} litros de bebidas variadas (refrigerante, suco, água).' },
  { icon: '💰', text: 'Você gastou {pct}% do orçamento. {status}' },
  { icon: '📅', text: 'Faltam {days} dias! {urgency}' },
  { icon: '🧊', text: 'Para {confirmed} convidados, compre aprox. {ice}kg de gelo.' },
  { icon: '🍽️', text: 'Calcule {plates} pratos descartáveis e {cups} copos para sua festa.' },
  { icon: '📸', text: 'Se ainda não contratou fotógrafo, essa é a prioridade número um para um casamento perfeito!' },
  { icon: '💐', text: 'Decida o tema e cores da decoração com pelo menos 2 meses de antecedência.' },
  { icon: '🎶', text: 'A música certa transforma a cerimônia. As sugestões gospel na aba Cerimônia são ótimas para o momento!' },
  { icon: '💌', text: 'Que tal enviar o convite digital para os convidados? Basta compartilhar o link desta página!' },
];

function generateAITips() {
  const confirmed = confirmedCount();
  const total = DB.guests.length;
  const spent = totalSpent();
  const pct = DB.budget > 0 ? Math.round((spent / DB.budget) * 100) : 0;
  const days = DB.weddingDate
    ? Math.ceil((new Date(DB.weddingDate + 'T00:00:00') - new Date()) / 86400000)
    : 30;

  const selected = shuffleArr([...ALL_AI_TIPS]).slice(0, 4);
  const html = selected.map(tip => {
    const msg = tip.text
      .replace('{confirmed}', confirmed || 0)
      .replace('{total}', total || 0)
      .replace('{food}', Math.round((confirmed || 10) * 0.35))
      .replace('{drinks}', Math.round((confirmed || 10) * 0.5))
      .replace('{pct}', pct)
      .replace('{status}', pct > 90 ? '⚠️ Cuidado, orçamento quase esgotado!' : pct > 60 ? '👀 Atenção ao saldo restante.' : '✅ Ótimo controle financeiro!')
      .replace('{days}', days > 0 ? days : '?')
      .replace('{urgency}', days < 30 ? '⚡ Últimas semanas — revise o checklist!' : days < 90 ? '🔔 Ainda dá tempo, mas mantenha o ritmo!' : '😌 Você ainda tem bastante tempo.')
      .replace('{ice}', Math.round((confirmed || 10) * 0.3))
      .replace('{plates}', Math.round((confirmed || 10) * 1.5))
      .replace('{cups}', Math.round((confirmed || 10) * 3));
    return `<div class="ai-tip"><span class="ai-tip-icon">${tip.icon}</span>${msg}</div>`;
  }).join('');
  document.getElementById('ai-dashboard-tips').innerHTML = html;
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// =========== GUESTS ===========
let guestFilter = 'all';

function addGuest() {
  const name = document.getElementById('guest-name').value.trim();
  if (!name) { toast('⚠️ Informe o nome do convidado'); return; }
  DB.guests.push({
    id: Date.now(), name,
    phone: document.getElementById('guest-phone').value.trim(),
    group: document.getElementById('guest-group').value,
    confirmed: false,
  });
  saveDB();
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-phone').value = '';
  renderGuests();
  updateDashboard();
  toast('✅ Convidado adicionado!');
}

function filterGuests(f, btn) {
  guestFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGuests();
}

function renderGuests() {
  const search = (document.getElementById('guest-search')?.value || '').toLowerCase();
  let list = DB.guests.filter(g => {
    if (search && !g.name.toLowerCase().includes(search)) return false;
    if (guestFilter === 'confirmed') return g.confirmed;
    if (guestFilter === 'pending') return !g.confirmed;
    return true;
  });

  const el = document.getElementById('guest-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">👥</span>Nenhum convidado encontrado.</div>`;
    return;
  }
  el.innerHTML = list.map(g => `
    <div class="guest-item" id="guest-${g.id}">
      <div class="guest-avatar">${g.name.charAt(0).toUpperCase()}</div>
      <div class="guest-info">
        <strong>${g.name}</strong>
        <span>${g.group}${g.phone ? ' · ' + g.phone : ''}</span>
      </div>
      <span class="guest-badge ${g.confirmed ? 'badge-confirmed' : 'badge-pending'}">
        ${g.confirmed ? '✅ Confirmado' : '⏳ Pendente'}
      </span>
      <div class="guest-actions">
        <button class="icon-btn" title="Alternar presença" onclick="toggleGuest(${g.id})">
          ${g.confirmed ? '✅' : '☑️'}
        </button>
        <button class="icon-btn danger" title="Remover" onclick="removeGuest(${g.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function toggleGuest(id) {
  const g = DB.guests.find(g => g.id === id);
  if (g) { g.confirmed = !g.confirmed; saveDB(); renderGuests(); updateDashboard(); }
}

function removeGuest(id) {
  DB.guests = DB.guests.filter(g => g.id !== id);
  saveDB(); renderGuests(); updateDashboard();
  toast('🗑️ Convidado removido');
}

// =========== EXPENSES ===========
function addExpense() {
  const desc = document.getElementById('expense-desc').value.trim();
  const val = parseFloat(document.getElementById('expense-value').value);
  if (!desc || isNaN(val) || val <= 0) { toast('⚠️ Preencha descrição e valor'); return; }
  DB.expenses.push({
    id: Date.now(),
    cat: document.getElementById('expense-cat').value,
    desc, value: val, date: new Date().toLocaleDateString('pt-BR'),
  });
  saveDB();
  document.getElementById('expense-desc').value = '';
  document.getElementById('expense-value').value = '';
  renderExpenses(); updateDashboard();
  toast('💰 Gasto adicionado!');
}

function renderExpenses() {
  // Categories
  const cats = {};
  DB.expenses.forEach(e => { cats[e.cat] = (cats[e.cat] || 0) + e.value; });
  const maxCat = Math.max(...Object.values(cats), 1);
  const ICONS = { 'Alimentação':'🍽️','Bebidas':'🥤','Trajes':'👗','Estrutura':'🏛️','Serviços':'📸','Decoração':'💐','Outros':'📦' };
  const catEl = document.getElementById('expense-categories');
  if (Object.keys(cats).length === 0) {
    catEl.innerHTML = `<div class="empty-state"><span class="empty-icon">📊</span>Nenhum gasto registrado.</div>`;
  } else {
    catEl.innerHTML = Object.entries(cats).map(([cat, val]) => `
      <div class="cat-row">
        <span class="cat-name">${ICONS[cat] || '📦'} ${cat}</span>
        <div class="cat-bar-wrap"><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(val/maxCat)*100}%"></div></div></div>
        <span class="cat-value">${fmt(val)}</span>
      </div>
    `).join('');
  }

  // Expense list
  const listEl = document.getElementById('expense-list');
  if (!DB.expenses.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="empty-icon">💸</span>Nenhum gasto ainda.</div>`;
    return;
  }
  listEl.innerHTML = [...DB.expenses].reverse().map(e => `
    <div class="expense-item">
      <div class="expense-left">
        <strong>${ICONS[e.cat] || '📦'} ${e.desc}</strong>
        <span>${e.cat} · ${e.date}</span>
      </div>
      <span class="expense-value">${fmt(e.value)}</span>
      <button class="icon-btn danger" onclick="removeExpense(${e.id})" style="margin-left:0.4rem">🗑️</button>
    </div>
  `).join('');
}

function removeExpense(id) {
  DB.expenses = DB.expenses.filter(e => e.id !== id);
  saveDB(); renderExpenses(); updateDashboard();
  toast('🗑️ Gasto removido');
}

// =========== SHOPPING LIST ===========
const SHOPPING_BASE = [
  { name: 'Refrigerante', unit: 'garrafas 2L', perPerson: 0.25 },
  { name: 'Suco', unit: 'garrafas 1L', perPerson: 0.2 },
  { name: 'Água mineral', unit: 'garrafas 500ml', perPerson: 1 },
  { name: 'Gelo', unit: 'kg', perPerson: 0.3 },
  { name: 'Pratos descartáveis', unit: 'unidades', perPerson: 1.5 },
  { name: 'Copos descartáveis', unit: 'unidades', perPerson: 3 },
  { name: 'Talheres descartáveis', unit: 'sets', perPerson: 1.5 },
  { name: 'Guardanapos', unit: 'pacotes', perPerson: 0.5 },
  { name: 'Canudos', unit: 'unidades', perPerson: 2 },
];

function generateShoppingList() {
  const n = Math.max(confirmedCount(), DB.guests.length, 10);
  const generated = SHOPPING_BASE.map((item, i) => ({
    id: 'gen_' + i, name: item.name,
    qty: Math.ceil(n * item.perPerson), unit: item.unit,
    done: false, generated: true,
  }));
  // Keep manual items
  const manual = DB.shopping.filter(s => !s.generated);
  DB.shopping = [...generated, ...manual];
  saveDB(); renderShoppingList();
  document.getElementById('shopping-guest-count').innerText = n;
  toast('✨ Lista gerada para ' + n + ' pessoas!');
}

function addShopItem() {
  const name = document.getElementById('shop-item-name').value.trim();
  const qty = document.getElementById('shop-item-qty').value;
  const unit = document.getElementById('shop-item-unit').value.trim();
  if (!name) { toast('⚠️ Informe o item'); return; }
  DB.shopping.push({ id: Date.now(), name, qty: qty || 1, unit: unit || 'un', done: false, generated: false });
  saveDB(); renderShoppingList();
  document.getElementById('shop-item-name').value = '';
  document.getElementById('shop-item-qty').value = '';
  document.getElementById('shop-item-unit').value = '';
  toast('✅ Item adicionado!');
}

function toggleShopItem(id) {
  const item = DB.shopping.find(s => s.id == id);
  if (item) { item.done = !item.done; saveDB(); renderShoppingList(); }
}

function removeShopItem(id) {
  DB.shopping = DB.shopping.filter(s => s.id != id);
  saveDB(); renderShoppingList();
}

function renderShoppingList() {
  const el = document.getElementById('shopping-list');
  if (!DB.shopping.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">🛒</span>Clique em "Gerar Lista" para começar!</div>`;
    return;
  }
  el.innerHTML = DB.shopping.map(item => `
    <div class="shop-item ${item.done ? 'done' : ''}" id="shop-${item.id}">
      <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleShopItem(${item.id})" />
      <div class="shop-info">
        <strong>${item.name}</strong>
        <span>${item.qty} ${item.unit}</span>
      </div>
      <button class="icon-btn danger" onclick="removeShopItem(${item.id})">🗑️</button>
    </div>
  `).join('');
}

// =========== CEREMONY ===========
function addCeremonyStep() {
  const id = Date.now();
  DB.ceremonySteps.push({ id, time: '00:00', desc: 'Nova etapa da cerimônia' });
  saveDB(); renderCeremony();
}

function removeCeremonyStep(id) {
  DB.ceremonySteps = DB.ceremonySteps.filter(s => s.id !== id);
  saveDB(); renderCeremony();
}

function updateCeremonyStep(id, field, val) {
  const s = DB.ceremonySteps.find(s => s.id === id);
  if (s) { s[field] = val; saveDB(); }
}

function renderCeremony() {
  const el = document.getElementById('ceremony-steps');
  el.innerHTML = DB.ceremonySteps.map((s, i) => `
    <div class="ceremony-step">
      <div class="step-num">${i + 1}</div>
      <div class="step-time">
        <input type="time" value="${s.time}" onchange="updateCeremonyStep(${s.id},'time',this.value)" />
      </div>
      <input class="step-desc" type="text" value="${s.desc}" onchange="updateCeremonyStep(${s.id},'desc',this.value)" />
      <button class="icon-btn danger" onclick="removeCeremonyStep(${s.id})">🗑️</button>
    </div>
  `).join('');

  // Restore notes
  const notes = document.getElementById('ceremony-notes');
  if (notes && DB.ceremonyNotes) notes.value = DB.ceremonyNotes;
}

function saveCeremonyNotes() {
  DB.ceremonyNotes = document.getElementById('ceremony-notes').value;
  saveDB();
}

function generateCeremonyText() {
  const couple = DB.coupleName || 'os noivos';
  const date = DB.weddingDate ? new Date(DB.weddingDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
  const text = `Bem-vindos à cerimônia de casamento de ${couple}!\n\nNeste dia abençoado, ${couple} celebram sua união diante de Deus e de todos vocês, amigos e familiares queridos.\n\nQue este momento seja eternamente guardado em seus corações, assim como o amor que os une é eterno.\n\nData: ${date} | Local: ${DB.venue || 'a confirmar'}\n\nAgradecemos a presença de cada um. Que Deus abençoe a todos! 🙏💍`;
  document.getElementById('ceremony-notes').value = text;
  DB.ceremonyNotes = text;
  saveDB();
  toast('🤖 Texto gerado com IA!');
}

function renderMusicList() {
  const el = document.getElementById('music-list');
  el.innerHTML = DB.music.map(m => `
    <div class="music-item">
      <span class="music-icon">${m.icon}</span>
      <div class="music-info">
        <strong>${m.name}</strong>
        <span>${m.desc}</span>
      </div>
      <span class="music-tag">${m.tag}</span>
    </div>
  `).join('');
}

const EXTRA_MUSIC = [
  { icon: '🎼', name: 'Quão Grande é o Meu Deus — Chris Tomlin', desc: 'Gospel - Abertura poderosa', tag: 'Abertura' },
  { icon: '🎹', name: 'Reckless Love — Cory Asbury', desc: 'Gospel - Adoração', tag: 'Cerimônia' },
  { icon: '🎤', name: 'Oceans — Hillsong United', desc: 'Gospel - Momento reflexivo', tag: 'Votos' },
  { icon: '🎵', name: 'Tu És Fiel — Douglas Borges', desc: 'Gospel - Gratidão', tag: 'Cerimônia' },
  { icon: '🎊', name: 'Can\'t Help Falling in Love — Elvis', desc: 'Clássico romântico - Saída', tag: 'Saída' },
  { icon: '🎉', name: 'Beautiful Day — U2', desc: 'Festivo - Recepção', tag: 'Festa' },
  { icon: '🎹', name: 'Jeová Nissi — Kleber Lucas', desc: 'Gospel - Celebração', tag: 'Festa' },
  { icon: '🌹', name: 'Amazed — Lincoln Brewster', desc: 'Gospel - Adoração', tag: 'Cerimônia' },
];
let musicIdx = 0;
function generateMoreMusic() {
  const batch = EXTRA_MUSIC.slice(musicIdx % EXTRA_MUSIC.length, (musicIdx % EXTRA_MUSIC.length) + 3);
  DB.music = [...DB.music, ...batch];
  musicIdx += 3;
  saveDB(); renderMusicList();
  toast('🎵 Novas músicas sugeridas!');
}

// =========== CHECKLIST ===========
function addTask() {
  const text = document.getElementById('task-text').value.trim();
  if (!text) { toast('⚠️ Informe a tarefa'); return; }
  DB.tasks.push({
    id: Date.now(), text, cat: document.getElementById('task-cat').value, done: false,
  });
  saveDB(); renderTasks(); updateDashboard();
  document.getElementById('task-text').value = '';
  toast('✅ Tarefa adicionada!');
}

function toggleTask(id) {
  const t = DB.tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; saveDB(); renderTasks(); }
}

function removeTask(id) {
  DB.tasks = DB.tasks.filter(t => t.id !== id);
  saveDB(); renderTasks();
}

function renderTasks() {
  const total = DB.tasks.length;
  const done = DB.tasks.filter(t => t.done).length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('checklist-progress-text').innerText = `${done} / ${total} tarefas`;
  document.getElementById('checklist-bar').style.width = pct + '%';

  const CATS = { 'Essencial': 'pri-essencial', 'Importante': 'pri-importante', 'Opcional': 'pri-opcional' };
  const el = document.getElementById('task-list');
  if (!DB.tasks.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">📋</span>Nenhuma tarefa ainda.</div>`;
    return;
  }
  el.innerHTML = DB.tasks.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})" />
      <div class="task-info"><strong>${t.text}</strong></div>
      <span class="task-priority ${CATS[t.cat] || ''}">${t.cat}</span>
      <button class="icon-btn danger" onclick="removeTask(${t.id})">🗑️</button>
    </div>
  `).join('');
}

// =========== GUEST AREA: INVITE ===========
function loadInviteFields() {
  if (DB.coupleName) document.getElementById('set-couple-name').value = DB.coupleName;
  if (DB.weddingDate) document.getElementById('set-wedding-date').value = DB.weddingDate;
  if (DB.weddingTime) document.getElementById('set-wedding-time').value = DB.weddingTime;
  if (DB.venue) document.getElementById('set-venue').value = DB.venue;
  if (DB.dresscode) document.getElementById('set-dresscode').value = DB.dresscode;
  if (DB.mapsUrl) document.getElementById('set-maps-url').value = DB.mapsUrl;
  updateInvite();
}

function updateInvite() {
  const couple = document.getElementById('set-couple-name')?.value || DB.coupleName;
  const date = document.getElementById('set-wedding-date')?.value || DB.weddingDate;
  const time = document.getElementById('set-wedding-time')?.value || DB.weddingTime;
  const venue = document.getElementById('set-venue')?.value || DB.venue;
  const dresscode = document.getElementById('set-dresscode')?.value || DB.dresscode;

  DB.coupleName = couple; DB.weddingDate = date; DB.weddingTime = time;
  DB.venue = venue; DB.dresscode = dresscode;
  saveDB();

  setEl('g-couple-name', couple || 'Gabriel e Anny');
  setEl('g-wedding-date', date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '— / — / —');
  setEl('g-wedding-time', time ? time + 'h' : '18:00h');
  setEl('g-wedding-venue', venue || 'Gama - DF');
  const dcEl = document.querySelector('.dress-code');
  if (dcEl) dcEl.innerText = '👔 Dress Code: ' + (dresscode || 'Social');

  // Update info tab
  setEl('info-venue', venue || '—');
  setEl('info-time', time ? time + 'h' : '—');
  setEl('info-date', date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : '—');
  setEl('info-dresscode', dresscode || '—');
  document.getElementById('couple-name-display').innerText = couple || 'Meu Casamento';
  if (DB.weddingDate) document.getElementById('wedding-date').value = DB.weddingDate;
}

function updateInfoTab() {
  setEl('info-venue', DB.venue || '—');
  setEl('info-time', DB.weddingTime ? DB.weddingTime + 'h' : '—');
  setEl('info-date', DB.weddingDate ? new Date(DB.weddingDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—');
  setEl('info-dresscode', DB.dresscode || '—');
}

function updateMap() {
  const url = document.getElementById('set-maps-url').value.trim();
  DB.mapsUrl = url; saveDB();
  if (url) document.getElementById('map-iframe').src = url;
}

function generateInviteText() {
  const couple = DB.coupleName || 'nossos noivos';
  const date = DB.weddingDate ? new Date(DB.weddingDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const time = DB.weddingTime || '18:00';
  const venue = DB.venue || 'local a definir';
  toast(`🎉 Convite digital gerado para ${couple}!`);
}

// =========== GUEST AREA: RSVP ===========
function rsvp(status) {
  const name = document.getElementById('rsvp-name').value.trim();
  const companions = parseInt(document.getElementById('rsvp-companions').value) || 0;
  if (!name) { toast('⚠️ Digite seu nome'); return; }

  // Remove existing from this person
  DB.rsvpList = DB.rsvpList.filter(r => r.name.toLowerCase() !== name.toLowerCase());
  DB.rsvpList.push({ id: Date.now(), name, companions, status, date: new Date().toLocaleDateString('pt-BR') });
  saveDB();

  const fb = document.getElementById('rsvp-feedback');
  if (status === 'yes') {
    fb.innerHTML = `
      <div style="color:#10b981; margin-bottom:1rem;">🎉 Presença confirmada! Esperamos por você, ${name}!</div>
      <button class="btn-primary" onclick="notifyWhatsApp('${name}', ${companions})" style="background:#25D366; box-shadow:0 4px 14px rgba(37,211,102,0.4)">
        📱 Avisar Noivos no WhatsApp
      </button>
    `;
    // Auto-open WhatsApp after a short delay
    setTimeout(() => notifyWhatsApp(name, companions), 1500);
  } else {
    fb.innerHTML = `<span style="color:#f59e0b">😢 Tudo bem! Sua ausência foi registrada, ${name}.</span>`;
  }
  document.getElementById('rsvp-name').value = '';
  renderRsvpList();
  updateDashboard();
}

function notifyWhatsApp(name, companions) {
  const phone = "5538991621135";
  const msg = `Olá Gabriel e Anny! Acabei de confirmar minha presença no casamento! 💍\n\nConvidado: ${name}\nAcompanhantes: ${companions}\n\nMal podemos esperar! ❤️`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function renderRsvpList() {
  const el = document.getElementById('guest-rsvp-list');
  if (!DB.rsvpList.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">✅</span>Nenhuma confirmação ainda.</div>`;
    return;
  }
  el.innerHTML = DB.rsvpList.map(r => `
    <div class="rsvp-item">
      <span class="guest-avatar" style="width:32px;height:32px;font-size:0.8rem">${r.name.charAt(0).toUpperCase()}</span>
      <div style="flex:1">
        <strong style="font-size:0.88rem">${r.name}</strong>
        <div style="font-size:0.73rem;color:var(--text-muted)">${r.companions > 0 ? `+${r.companions} acompanhante(s)` : 'Sozinho(a)'} · ${r.date}</div>
      </div>
      <span class="guest-badge ${r.status === 'yes' ? 'badge-confirmed' : 'badge-pending'}">
        ${r.status === 'yes' ? '✅ Vai!' : '❌ Não vai'}
      </span>
    </div>
  `).join('');
}

// =========== GUEST AREA: MESSAGES ===========
function sendMessage() {
  const name = document.getElementById('msg-name').value.trim();
  const text = document.getElementById('msg-text').value.trim();
  if (!name || !text) { toast('⚠️ Preencha seu nome e mensagem'); return; }
  DB.messages.push({
    id: Date.now(), name, text,
    time: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
  });
  saveDB();
  document.getElementById('msg-name').value = '';
  document.getElementById('msg-text').value = '';
  document.getElementById('msg-feedback').innerHTML = `<span style="color:#10b981">💌 Mensagem enviada! Os noivos vão adorar! 🥰</span>`;
  renderMessages();
  toast('💌 Mensagem enviada com sucesso!');
}

function renderMessages() {
  const el = document.getElementById('messages-list');
  if (!DB.messages.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">💬</span>Nenhuma mensagem ainda.</div>`;
    return;
  }
  el.innerHTML = [...DB.messages].reverse().map(m => `
    <div class="message-item">
      <div class="msg-author">💕 ${m.name}</div>
      <div class="msg-content">${m.text}</div>
      <div class="msg-time">${m.time}</div>
    </div>
  `).join('');
}

// =========== FIREBASE CLOUD SYNC ===========
function saveFirebaseConfig() {
  const apiKey = document.getElementById('fb-api-key').value.trim();
  const projectId = document.getElementById('fb-project-id').value.trim();
  const appId = document.getElementById('fb-app-id').value.trim();

  if (!apiKey || !projectId || !appId) {
    toast('⚠️ Preencha todos os campos do Firebase');
    return;
  }

  DB.firebaseConfig = { apiKey, projectId: projectId || "casamentoannygabriel-cffcf", appId };
  DB.isFirebaseActive = true;
  saveDB();
  
  document.getElementById('fb-status').innerHTML = '⏳ Inicializando Firebase...';
  setTimeout(() => location.reload(), 1500);
}

function initFirebase() {
  if (!window.firebase || !DB.firebaseConfig) return;

  const config = DB.firebaseConfig;

  try {
    firebase.initializeApp(config);
    const db = firebase.firestore();
    DB.isFirebaseActive = true;
    
    // Status UI
    const statusEl = document.getElementById('fb-status');
    if (statusEl) statusEl.innerHTML = '<span style="color:#10b981">✅ Cloud Ativo e Sincronizado</span>';

    // Real-time listener for the whole DB
    db.collection('weddings').doc(DB.firebaseConfig.projectId).onSnapshot((doc) => {
      if (doc.exists) {
        const cloudData = doc.data();
        // Merge cloud data into local DB (prioritizing cloud for shared lists)
        DB.guests = cloudData.guests || DB.guests;
        DB.messages = cloudData.messages || DB.messages;
        DB.rsvpList = cloudData.rsvpList || DB.rsvpList;
        DB.tasks = cloudData.tasks || DB.tasks;
        DB.expenses = cloudData.expenses || DB.expenses;
        
        // Re-render affected parts
        renderGuests();
        renderMessages();
        renderRsvpList();
        renderTasks();
        renderExpenses();
        updateDashboard();
      } else {
        // First time setup on cloud
        syncToFirebase();
      }
    });
  } catch (err) {
    console.error("Firebase error:", err);
    if (document.getElementById('fb-status')) {
      document.getElementById('fb-status').innerHTML = '<span style="color:#ef4444">❌ Erro ao conectar ao Firebase</span>';
    }
  }
}

function syncToFirebase() {
  if (!DB.isFirebaseActive || !window.firebase || firebase.apps.length === 0) return;
  const db = firebase.firestore();
  
  // We only sync the dynamic lists that need to be shared
  const sharedData = {
    guests: DB.guests,
    messages: DB.messages,
    rsvpList: DB.rsvpList,
    tasks: DB.tasks,
    expenses: DB.expenses,
    lastUpdate: new Date().getTime()
  };

  db.collection('weddings').doc(DB.firebaseConfig.projectId).set(sharedData, { merge: true })
    .catch(err => console.error("Cloud sync error:", err));
}

// =========== BOOT ===========
window.addEventListener('DOMContentLoaded', init);
