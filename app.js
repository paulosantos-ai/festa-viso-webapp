// Data Manager usando localStorage
class DataManager {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('folhas')) {
            this.saveFolhas([{
                id: Date.now(),
                nome: 'Semana 1',
                ativa: true,
                dataCriacao: Date.now()
            }]);
        }
        if (!localStorage.getItem('registos')) {
            this.saveRegistos([]);
        }
        if (!localStorage.getItem('vencedores')) {
            this.saveVencedores([]);
        }
    }

    // Folhas
    getFolhas() {
        return JSON.parse(localStorage.getItem('folhas') || '[]');
    }

    getFolhasAtivas() {
        return this.getFolhas().filter(f => f.ativa);
    }

    saveFolhas(folhas) {
        localStorage.setItem('folhas', JSON.stringify(folhas));
    }

    adicionarFolha(nome) {
        const folhas = this.getFolhas();
        const novaFolha = {
            id: Date.now(),
            nome: nome,
            ativa: true,
            dataCriacao: Date.now()
        };
        folhas.push(novaFolha);
        this.saveFolhas(folhas);
        return novaFolha;
    }

    toggleFolhaAtiva(folhaId) {
        const folhas = this.getFolhas();
        const folha = folhas.find(f => f.id === folhaId);
        if (folha) {
            folha.ativa = !folha.ativa;
            this.saveFolhas(folhas);
        }
    }

    eliminarFolha(folhaId) {
        const folhas = this.getFolhas().filter(f => f.id !== folhaId);
        this.saveFolhas(folhas);
        // Eliminar registos da folha
        const registos = this.getRegistos().filter(r => r.folhaId !== folhaId);
        this.saveRegistos(registos);
    }

    // Registos
    getRegistos() {
        return JSON.parse(localStorage.getItem('registos') || '[]');
    }

    getRegistosByFolha(folhaId) {
        return this.getRegistos().filter(r => r.folhaId === folhaId);
    }

    getNumerosOcupados(folhaId) {
        return this.getRegistosByFolha(folhaId).map(r => r.numero);
    }

    saveRegistos(registos) {
        localStorage.setItem('registos', JSON.stringify(registos));
    }

    registarNumero(folhaId, numero, nome, contacto) {
        const ocupados = this.getNumerosOcupados(folhaId);
        if (ocupados.includes(numero)) {
            return false;
        }

        const registos = this.getRegistos();
        registos.push({
            id: Date.now(),
            folhaId: folhaId,
            numero: numero,
            nome: nome,
            contacto: contacto,
            dataRegisto: Date.now()
        });
        this.saveRegistos(registos);
        return true;
    }

    // Vencedores
    getVencedores() {
        return JSON.parse(localStorage.getItem('vencedores') || '[]');
    }

    saveVencedores(vencedores) {
        localStorage.setItem('vencedores', JSON.stringify(vencedores));
    }

    registarVencedor(folhaId, folhaNome, numeroVencedor, dataSorteio) {
        const registo = this.getRegistosByFolha(folhaId).find(r => r.numero === numeroVencedor);
        if (!registo) {
            return false;
        }

        const vencedores = this.getVencedores();
        vencedores.push({
            id: Date.now(),
            folhaId: folhaId,
            folhaNome: folhaNome,
            dataSorteio: dataSorteio,
            numeroVencedor: numeroVencedor,
            vencedorNome: registo.nome,
            vencedorContacto: registo.contacto
        });
        this.saveVencedores(vencedores);
        return true;
    }

    // Admin
    verificarLogin(username, password) {
        return username === 'admin' && password === 'admin123';
    }
}

// App State
const dataManager = new DataManager();
let currentScreen = 'sorteio';
let selectedFolhaId = null;
let selectedNumero = null;
let isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

// Navigation
function showScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');

    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    navItems.forEach((item, index) => {
        item.classList.remove('active');
        const screenNames = ['sorteio', 'vencedores', 'admin'];
        if (screenNames[index] === screenName) {
            item.classList.add('active');
        }
    });

    document.getElementById('screen-' + screenName).classList.add('active');

    currentScreen = screenName;

    if (screenName === 'sorteio') {
        loadSorteio();
    } else if (screenName === 'vencedores') {
        loadVencedores();
    } else if (screenName === 'admin') {
        loadAdmin();
    }
}

// Helper: Get current week name
function getCurrentWeekName() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    return `Semana ${weekNumber}`;
}

// Sorteio Screen with swipe between folhas
function loadSorteio() {
    const folhas = dataManager.getFolhasAtivas();

    if (folhas.length === 0) {
        document.getElementById('number-grid').innerHTML = '<div style="text-align: center; color: #999;">Não existem folhas ativas</div>';
        return;
    }

    // Auto-select current week or first
    const currentWeekName = getCurrentWeekName();
    const currentWeekFolha = folhas.find(f => f.nome === currentWeekName);
    const initialIndex = currentWeekFolha ? folhas.indexOf(currentWeekFolha) : 0;

    let currentFolhaIndex = initialIndex;
    selectedFolhaId = folhas[currentFolhaIndex].id;

    function displayCurrentFolha() {
        const folha = folhas[currentFolhaIndex];
        selectedFolhaId = folha.id;

        // Update folha name display
        document.getElementById('folha-name').textContent = folha.nome;
        document.getElementById('folha-indicator').textContent = currentFolhaIndex === initialIndex ?
            `${folha.nome} (Semana Atual)` : folha.nome;

        loadNumeros();
    }

    displayCurrentFolha();

    // Remove old swipe listeners
    const container = document.getElementById('screens-container');
    const oldContainer = container.cloneNode(true);
    container.parentNode.replaceChild(oldContainer, container);

    // Add swipe for folhas only in sorteio screen
    if (currentScreen === 'sorteio' && folhas.length > 1) {
        let touchStartX = 0;
        let touchEndX = 0;

        oldContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        oldContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0 && currentFolhaIndex < folhas.length - 1) {
                    // Swipe left - next folha
                    currentFolhaIndex++;
                    displayCurrentFolha();
                } else if (diff < 0 && currentFolhaIndex > 0) {
                    // Swipe right - previous folha
                    currentFolhaIndex--;
                    displayCurrentFolha();
                }
            }
        }, { passive: true });
    }
}

function loadNumeros() {
    if (!selectedFolhaId) return;

    const numerosOcupados = dataManager.getNumerosOcupados(selectedFolhaId);
    const grid = document.getElementById('number-grid');

    // Update stats
    document.getElementById('stat-disponiveis').textContent = 50 - numerosOcupados.length;
    document.getElementById('stat-vendidos').textContent = numerosOcupados.length;

    // Create grid
    grid.innerHTML = '';
    for (let i = 1; i <= 50; i++) {
        const button = document.createElement('button');
        button.className = numerosOcupados.includes(i) ? 'number-btn ocupado' : 'number-btn disponivel';
        button.textContent = i;

        if (!numerosOcupados.includes(i)) {
            button.addEventListener('click', () => {
                selectedNumero = i;
                showRegistoDialog();
            });
        }

        grid.appendChild(button);
    }
}

// Registo Dialog
function showRegistoDialog() {
    document.getElementById('dialog-numero').textContent = selectedNumero;
    document.getElementById('input-nome').value = '';
    document.getElementById('input-contacto').value = '';
    document.getElementById('dialog-registo').classList.add('show');
}

function closeDialog() {
    document.getElementById('dialog-registo').classList.remove('show');
}

function registarNumero() {
    const nome = document.getElementById('input-nome').value.trim();
    const contacto = document.getElementById('input-contacto').value.trim();

    if (nome.length < 3) {
        alert('Nome deve ter pelo menos 3 caracteres');
        return;
    }

    if (contacto.length !== 9 || !/^\d+$/.test(contacto)) {
        alert('Contacto deve ter exatamente 9 dígitos');
        return;
    }

    const sucesso = dataManager.registarNumero(selectedFolhaId, selectedNumero, nome, contacto);

    if (sucesso) {
        closeDialog();
        loadNumeros();
    } else {
        alert('Erro ao registar número');
    }
}

// Vencedores Screen
function loadVencedores() {
    const vencedores = dataManager.getVencedores().sort((a, b) => b.dataSorteio - a.dataSorteio);
    const list = document.getElementById('vencedores-list');

    if (vencedores.length === 0) {
        list.innerHTML = '<div class="empty-state">Ainda não há vencedores registados</div>';
        return;
    }

    list.innerHTML = '';
    vencedores.forEach(v => {
        const card = document.createElement('div');
        card.className = 'vencedor-card';
        card.innerHTML = `
            <div class="numero">#${v.numeroVencedor}</div>
            <div class="nome">${v.vencedorNome}</div>
            <div class="info">📋 Folha: ${v.folhaNome}</div>
            <div class="info">📅 Data: ${new Date(v.dataSorteio).toLocaleDateString('pt-PT')}</div>
            <div class="info">📞 Contacto: ${v.vencedorContacto}</div>
        `;
        list.appendChild(card);
    });
}

// Admin Screen
function loadAdmin() {
    const content = document.getElementById('admin-content');

    if (!isAdminLoggedIn) {
        content.innerHTML = '<div class="admin-card"><button class="btn-primary" onclick="showLoginDialog()">🔐 Fazer Login</button></div>';
        return;
    }

    // Admin Panel
    const folhas = dataManager.getFolhas();
    const registos = dataManager.getRegistos();
    const vencedores = dataManager.getVencedores();

    content.innerHTML = `
        <div class="admin-card">
            <h3>Estatísticas</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${folhas.filter(f => f.ativa).length}</div>
                    <div class="label">Folhas Ativas</div>
                </div>
                <div class="stat-card">
                    <div class="value">${registos.length}</div>
                    <div class="label">Vendidos</div>
                </div>
                <div class="stat-card">
                    <div class="value">${vencedores.length}</div>
                    <div class="label">Vencedores</div>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <h3>Gestão de Folhas</h3>
            <div id="folhas-list"></div>
            <button class="btn-primary" onclick="showCriarFolhaDialog()">➕ Criar Nova Folha</button>
        </div>

        <div class="admin-card">
            <button class="btn-primary btn-success" onclick="showVencedorDialog()">🏆 Registar Vencedor</button>
            <button class="btn-primary btn-danger" onclick="logoutAdmin()">🚪 Sair</button>
        </div>
    `;

    loadFolhasList();
}

function loadFolhasList() {
    const folhas = dataManager.getFolhas();
    const list = document.getElementById('folhas-list');

    list.innerHTML = '';
    folhas.forEach(folha => {
        const registos = dataManager.getRegistosByFolha(folha.id).length;
        const item = document.createElement('div');
        item.className = 'folha-item';
        item.innerHTML = `
            <div>
                <strong>${folha.nome}</strong><br>
                <small>${registos}/50 vendidos - ${folha.ativa ? '✅ Ativa' : '❌ Inativa'}</small>
            </div>
            <div class="folha-actions">
                <button class="btn-small" onclick="toggleFolha(${folha.id})" style="background: ${folha.ativa ? '#FFC107' : '#4CAF50'}; color: white;">
                    ${folha.ativa ? 'Desativar' : 'Ativar'}
                </button>
                ${folhas.length > 1 ? `<button class="btn-small" onclick="deleteFolha(${folha.id})" style="background: #f44336; color: white;">Eliminar</button>` : ''}
            </div>
        `;
        list.appendChild(item);
    });
}

function toggleFolha(folhaId) {
    dataManager.toggleFolhaAtiva(folhaId);
    loadAdmin();
    loadSorteio();
}

function deleteFolha(folhaId) {
    if (confirm('Tem a certeza que deseja eliminar esta folha?')) {
        dataManager.eliminarFolha(folhaId);
        loadAdmin();
        loadSorteio();
    }
}

// Login Dialog
function showLoginDialog() {
    document.getElementById('dialog-login').classList.add('show');
}

function closeLoginDialog() {
    document.getElementById('dialog-login').classList.remove('show');
}

function loginAdmin() {
    const username = document.getElementById('input-username').value;
    const password = document.getElementById('input-password').value;

    if (dataManager.verificarLogin(username, password)) {
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        closeLoginDialog();
        loadAdmin();
    } else {
        alert('Credenciais inválidas');
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    loadAdmin();
}

// Criar Folha Dialog
function showCriarFolhaDialog() {
    document.getElementById('input-folha-nome').value = '';
    document.getElementById('dialog-criar-folha').classList.add('show');
}

function closeCriarFolhaDialog() {
    document.getElementById('dialog-criar-folha').classList.remove('show');
}

function criarFolha() {
    const nome = document.getElementById('input-folha-nome').value.trim();

    if (nome.length < 3) {
        alert('Nome da folha deve ter pelo menos 3 caracteres');
        return;
    }

    dataManager.adicionarFolha(nome);
    closeCriarFolhaDialog();
    loadAdmin();
    loadSorteio();
}

// Registar Vencedor Dialog
function showVencedorDialog() {
    const select = document.getElementById('input-vencedor-folha');
    const folhas = dataManager.getFolhas();

    select.innerHTML = '';
    folhas.forEach(folha => {
        const option = document.createElement('option');
        option.value = folha.id;
        option.textContent = folha.nome;
        select.appendChild(option);
    });

    document.getElementById('input-vencedor-data').valueAsDate = new Date();
    document.getElementById('input-vencedor-numero').value = '';
    document.getElementById('dialog-vencedor').classList.add('show');
}

function closeVencedorDialog() {
    document.getElementById('dialog-vencedor').classList.remove('show');
}

function registarVencedor() {
    const folhaId = parseInt(document.getElementById('input-vencedor-folha').value);
    const folhaNome = dataManager.getFolhas().find(f => f.id === folhaId).nome;
    const data = new Date(document.getElementById('input-vencedor-data').value).getTime();
    const numero = parseInt(document.getElementById('input-vencedor-numero').value);

    if (!numero || numero < 1 || numero > 50) {
        alert('Número deve ser entre 1 e 50');
        return;
    }

    const sucesso = dataManager.registarVencedor(folhaId, folhaNome, numero, data);

    if (sucesso) {
        closeVencedorDialog();
        alert('Vencedor registado com sucesso!');
        loadAdmin();
    } else {
        alert('Número não foi vendido nesta folha');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSorteio();
});
