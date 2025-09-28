// Global variables
let resources = [];
let projects = [];
let teams = [];
let currentDate = new Date();
let productsChart = null;
let editingResourceId = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let supabase = null;
let isCloudPersistenceEnabled = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeApp();
    initializeSupabaseClient();
    await bootstrapData();
    setupEventListeners();
    updateStats();
    generateCalendar();
});

// Initialize application
function initializeApp() {
    // Set current date for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    
    // Set current month (restore original behavior)
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    
    // Set current month
    updateMonthDisplay();
}

// Initialize Supabase client if credentials provided in window
function initializeSupabaseClient() {
    try {
        const url = window.SUPABASE_URL;
        const key = window.SUPABASE_ANON_KEY;
        isCloudPersistenceEnabled = Boolean(url && key);
        if (isCloudPersistenceEnabled && window.supabase) {
            supabase = window.supabase.createClient(url, key);
        }
    } catch (e) {
        isCloudPersistenceEnabled = false;
    }
}

// Load initial data either from DB or from sample
async function bootstrapData() {
    console.log('Bootstrap data started, isCloudPersistenceEnabled:', isCloudPersistenceEnabled);
    
    if (isCloudPersistenceEnabled && supabase) {
        console.log('Loading from Supabase...');
        await loadResourcesFromDB();
        console.log('Loaded from Supabase, resources count:', resources.length);
    }
    
    // Fallback to localStorage if no cloud data
    if (resources.length === 0) {
        console.log('Loading from localStorage...');
        loadFromLocalStorage();
        console.log('Loaded from localStorage, resources count:', resources.length);
    }
    
    // If still no data, load sample
    if (resources.length === 0) {
        console.log('Loading sample data...');
        loadSampleData();
        console.log('Loaded sample data, resources count:', resources.length);
    }
    
    updateDisplay();
}

// Load sample data from CSV
function loadSampleData() {
    // Parse the CSV data structure
    const csvData = `ГрафТех (штат),Stack,час. план,,2025,Вика,,Влад,,Кирилл,,Юра,,Леша,,ТП,,2025,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Подвал,,,,,Леша,,Женя,,Дима,,Андрей,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Gravity,,,,,Gravity,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
8мост,,,,,8мост,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,Август (тест),,,,,,,,,,,,,Сентябрь,,,,,,,,,,,,Октябрь,,,,,,,,,,,,Ноябрь,,,,,,,,,
Продукты / Неделя,,,,3Q,1,,,2,,,3,,,4,,,4Q,6,,,7,,,8,,,9,,,10,,,11,,,12,,,13,,,10,,,11,,,12,,,13
ОТПУСКА,,,,,,,,,,,Кирилл,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,Влад,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Автограф.PRO,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Product's RoadMap,,152,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Проекты,Битрикс,1300,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГПИ,ROR,150,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Россети,Битрикс,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,ROR,900,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГрафБорд,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Product's RoadMap,,152,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Проекты,Битрикс,1300,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГПН,ROR,150,,,,,,,,,,,,8,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,8,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,15,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
АЛРОСА,Битрикс,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,ROR,900,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Автограф.Стандарт,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Product's RoadMap,,152,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Проекты,Битрикс,1300,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГПН,ROR,150,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Россети,Битрикс,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,ROR,900,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Автограф.MVP,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Product's RoadMap,,152,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Проекты,Битрикс,1300,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГПН,ROR,150,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Россети,Битрикс,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,ROR,900,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГрафДок,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Product's RoadMap,,152,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Проекты,Битрикс,1300,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГПН,ROR,150,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Россети,Битрикс,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,ROR,900,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Просмоторщик DWG,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Product's RoadMap,,152,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Проекты,Битрикс,1300,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ГПН,ROR,150,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Россети,Битрикс,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,ROR,900,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;

    parseCSVData(csvData);
}

// Parse CSV data and extract resources
function parseCSVData(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Extract team members and their data
    const teamMembers = ['Вика', 'Влад', 'Кирилл', 'Юра', 'Леша', 'Женя', 'Дима', 'Андрей'];
    const projects = ['Автограф.PRO', 'ГрафБорд', 'Автограф.Стандарт', 'Автограф.MVP', 'ГрафДок', 'Просмоторщик DWG'];
    const stacks = ['Битрикс', 'ROR', 'Gravity', '8мост'];
    
    // Create sample resources based on the CSV structure
    teamMembers.forEach(member => {
        if (member.trim()) {
            const randomProject = projects[Math.floor(Math.random() * projects.length)];
            const randomStack = stacks[Math.floor(Math.random() * stacks.length)];
            const hours = Math.floor(Math.random() * 20) + 10; // 10-30 hours per week
            
            resources.push({
                id: Date.now() + Math.random(),
                name: member.trim(),
                team: 'ГрафТех',
                product: randomProject,
                project: randomProject + ' - Проект',
                hoursPerMonth: hours * 4, // Convert weekly to monthly
                hourlyRate: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 rubles per hour
                month: '2025-01',
                status: 'active'
            });
        }
    });
    
    // Extract unique projects and teams
    projects.forEach(project => {
        if (project.trim()) {
            if (!window.projects) window.projects = [];
            if (!window.projects.find(p => p.name === project.trim())) {
                window.projects.push({
                    id: Date.now() + Math.random(),
                    name: project.trim(),
                    status: 'active',
                    budget: Math.floor(Math.random() * 1000000) + 500000
                });
            }
        }
    });
    
    if (!window.teams) window.teams = [];
    if (!window.teams.find(t => t.name === 'ГрафТех')) {
        window.teams.push({
            id: Date.now() + Math.random(),
            name: 'ГрафТех',
            members: teamMembers.filter(m => m.trim()).length,
            status: 'active'
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Month navigation
    document.getElementById('prevMonthBtn').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        updateDisplay();
    });
    
    document.getElementById('nextMonthBtn').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        updateDisplay();
    });
    
    // Add resource modal
    document.getElementById('addResourceBtn').addEventListener('click', function() {
        document.getElementById('resourceModal').style.display = 'block';
    });
    
    document.getElementById('saveResource').addEventListener('click', function() {
        saveResource();
    });
    
    document.getElementById('cancelResource').addEventListener('click', function() {
        closeModal();
    });
    
    document.querySelector('.close').addEventListener('click', function() {
        closeModal();
    });
    
    // Planning form
    document.getElementById('addPlanningBtn').addEventListener('click', function() {
        document.getElementById('planningForm').style.display = 'block';
    });
    
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('planningForm').style.display = 'none';
    });
    
    document.getElementById('resourceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePlanning();
    });
    
    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar();
    });
    
    // Analytics controls
    document.getElementById('analyticsMonth').addEventListener('change', function() {
        updateAnalytics();
    });
    
    document.getElementById('chartType').addEventListener('change', function() {
        updateAnalytics();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('resourceModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to selected tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content based on tab
    if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Handle file upload
function handleFileUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvData = e.target.result;
        parseCSVData(csvData);
        updateDisplay();
        showMessage('Файл успешно загружен!', 'success');
    };
    reader.readAsText(file);
}

// Save new resource
function saveResource() {
    const product = document.getElementById('resourceProduct').value;
    const project = document.getElementById('resourceProject').value;
    const name = document.getElementById('resourceName').value;
    const team = document.getElementById('resourceTeam').value;
    const hours = parseInt(document.getElementById('resourceHours').value);
    const rate = parseInt(document.getElementById('resourceRate').value);
    const month = document.getElementById('resourceMonth').value;
    
    if (!product || !project || !name || !team || !hours || !rate || !month) {
        showMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    const resource = {
        id: editingResourceId || Date.now(),
        product: product,
        project: project,
        name: name,
        team: team,
        hoursPerMonth: hours,
        hourlyRate: rate,
        month: month,
        status: 'active'
    };
    
    if (editingResourceId) {
        const index = resources.findIndex(r => r.id === editingResourceId);
        if (index !== -1) {
            resources[index] = resource;
        }
        editingResourceId = null;
        showMessage('Ресурс успешно обновлен!', 'success');
    } else {
        resources.push(resource);
        showMessage('Ресурс успешно добавлен!', 'success');
    }
    
    // Save to localStorage immediately
    saveToLocalStorage();
    
    // Try to sync to cloud DB
    syncResourceToDB(resource).finally(() => {
        updateDisplay();
        closeModal();
    });
}

// Save planning
function savePlanning() {
    const project = document.getElementById('projectSelect').value;
    const team = document.getElementById('teamSelect').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const hours = parseInt(document.getElementById('hours').value);
    
    if (!project || !team || !startDate || !endDate || !hours) {
        showMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    const planning = {
        id: Date.now(),
        project: project,
        team: team,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        hoursPerWeek: hours,
        status: 'planned'
    };
    
    // Add to resources as planned
    resources.push({
        id: Date.now() + Math.random(),
        name: `${team} - ${project}`,
        team: team,
        project: project,
        stack: 'Планируемый',
        hoursPerWeek: hours,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'planned'
    });
    
    updateDisplay();
    document.getElementById('planningForm').style.display = 'none';
    showMessage('Планирование сохранено!', 'success');
}

// Close modal
function closeModal() {
    document.getElementById('resourceModal').style.display = 'none';
    document.getElementById('addResourceForm').reset();
    editingResourceId = null;
    document.querySelector('#resourceModal .modal-header h3').textContent = 'Добавить ресурс';
}

// Edit resource
function editResource(id) {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;
    
    editingResourceId = id;
    document.getElementById('resourceProduct').value = resource.product || '';
    document.getElementById('resourceProject').value = resource.project || '';
    document.getElementById('resourceName').value = resource.name || '';
    document.getElementById('resourceTeam').value = resource.team || '';
    document.getElementById('resourceHours').value = resource.hoursPerMonth || '';
    document.getElementById('resourceRate').value = resource.hourlyRate || '';
    document.getElementById('resourceMonth').value = resource.month || '';
    
    document.querySelector('#resourceModal .modal-header h3').textContent = 'Редактировать ресурс';
    document.getElementById('resourceModal').style.display = 'block';
}

// Delete resource
function deleteResource(id) {
    if (confirm('Вы уверены, что хотите удалить этот ресурс?')) {
        const removed = resources.find(r => r.id === id);
        resources = resources.filter(r => r.id !== id);
        
        // Save to localStorage immediately
        saveToLocalStorage();
        
        updateDisplay();
        showMessage('Ресурс успешно удален!', 'success');
        deleteResourceFromDB(removed).catch(() => {});
    }
}

// Update month display
function updateMonthDisplay() {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('currentMonthDisplay').textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

// Update statistics
function updateStats() {
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    console.log('Current month filter:', currentMonthStr);
    console.log('All resources:', resources);
    
    const monthResources = resources.filter(r => {
        let resourceMonth = r.month;
        if (resourceMonth) {
            if (typeof resourceMonth === 'string') {
                // Handle both "2025-01" and "2025-01-01" formats
                resourceMonth = resourceMonth.substring(0, 7);
            } else {
                // Handle Date objects
                resourceMonth = resourceMonth.substring(0, 7);
            }
        } else {
            resourceMonth = '2025-01';
        }
        console.log('Comparing:', resourceMonth, 'with', currentMonthStr);
        return resourceMonth === currentMonthStr;
    });
    console.log('Filtered resources for current month:', monthResources);
    
    const totalMembers = new Set(monthResources.map(r => r.name)).size;
    const totalProjects = new Set(monthResources.map(r => r.project)).size;
    const monthlyHours = monthResources.reduce((sum, r) => sum + (r.hoursPerMonth || 0), 0);
    const monthlyCost = monthResources.reduce((sum, r) => sum + ((r.hoursPerMonth || 0) * (r.hourlyRate || 0)), 0);
    
    console.log('Stats calculated:', { totalMembers, totalProjects, monthlyHours, monthlyCost });
    
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('monthlyHours').textContent = monthlyHours;
    document.getElementById('monthlyCost').textContent = monthlyCost.toLocaleString('ru-RU') + ' ₽';
}

// Update display
function updateDisplay() {
    updateStats();
    updateProductsHierarchy();
    updatePlanningList();
    generateCalendar();
}

// Update products hierarchy
function updateProductsHierarchy() {
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    console.log('Products hierarchy - current month filter:', currentMonthStr);
    
    const monthResources = resources.filter(r => {
        let resourceMonth = r.month;
        if (resourceMonth) {
            if (typeof resourceMonth === 'string') {
                // Handle both "2025-01" and "2025-01-01" formats
                resourceMonth = resourceMonth.substring(0, 7);
            } else {
                // Handle Date objects
                resourceMonth = resourceMonth.substring(0, 7);
            }
        } else {
            resourceMonth = '2025-01';
        }
        return resourceMonth === currentMonthStr;
    });
    console.log('Products hierarchy - filtered resources:', monthResources);
    
    const productsContainer = document.getElementById('productsContainer');
    
    if (monthResources.length === 0) {
        console.log('No resources for current month, showing empty state');
        productsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Нет ресурсов на ${getMonthName(currentMonth)} ${currentYear}</h3>
                <p>Добавьте ресурсы для отображения иерархии продуктов</p>
            </div>
        `;
        return;
    }
    
    // Group resources by product
    const productsMap = {};
    monthResources.forEach(resource => {
        if (!productsMap[resource.product]) {
            productsMap[resource.product] = {};
        }
        if (!productsMap[resource.product][resource.project]) {
            productsMap[resource.product][resource.project] = [];
        }
        productsMap[resource.product][resource.project].push(resource);
    });
    
    // Generate HTML
    let html = '';
    Object.keys(productsMap).forEach(productName => {
        const productData = productsMap[productName];
        const totalHours = Object.values(productData).flat().reduce((sum, r) => sum + (r.hoursPerMonth || 0), 0);
        const totalCost = Object.values(productData).flat().reduce((sum, r) => sum + ((r.hoursPerMonth || 0) * (r.hourlyRate || 0)), 0);
        const projectCount = Object.keys(productData).length;
        
        html += `
            <div class="product-card">
                <div class="product-header" onclick="toggleProduct('${productName}')">
                    <div class="product-name">${productName}</div>
                    <div class="product-stats">
                        <span>${projectCount} проектов</span>
                        <span>${totalHours}ч</span>
                        <span>${totalCost.toLocaleString('ru-RU')} ₽</span>
                    </div>
                </div>
                <div class="product-content" id="product-${productName.replace(/\s+/g, '-')}">
                    ${Object.keys(productData).map(projectName => {
                        const projectResources = productData[projectName];
                        const projectHours = projectResources.reduce((sum, r) => sum + (r.hoursPerMonth || 0), 0);
                        const projectCost = projectResources.reduce((sum, r) => sum + ((r.hoursPerMonth || 0) * (r.hourlyRate || 0)), 0);
                        
                        return `
                            <div class="project-card">
                                <div class="project-header" onclick="toggleProject('${productName}', '${projectName}')">
                                    <div class="project-name">${projectName}</div>
                                    <div class="project-stats">
                                        <span>${projectResources.length} участников</span>
                                        <span>${projectHours}ч</span>
                                        <span>${projectCost.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                </div>
                                <div class="project-content" id="project-${productName.replace(/\s+/g, '-')}-${projectName.replace(/\s+/g, '-')}">
                                    <div class="resources-container">
                                        ${projectResources.map(resource => `
                                            <div class="resource-card">
                                                <div class="resource-header">
                                                    <div class="resource-name">${resource.name}</div>
                                                    <div class="resource-actions">
                                                        <button onclick="editResource(${resource.id})" class="btn-icon edit-btn" title="Редактировать">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button onclick="deleteResource(${resource.id})" class="btn-icon delete-btn" title="Удалить">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="resource-details">
                                                    <div class="resource-detail"><strong>Команда:</strong> ${resource.team}</div>
                                                    <div class="resource-detail"><strong>Часов:</strong> ${resource.hoursPerMonth}ч</div>
                                                    <div class="resource-detail"><strong>Ставка:</strong> ${resource.hourlyRate.toLocaleString('ru-RU')} ₽/ч</div>
                                                    <div class="resource-detail"><strong>Стоимость:</strong> ${((resource.hoursPerMonth || 0) * (resource.hourlyRate || 0)).toLocaleString('ru-RU')} ₽</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    productsContainer.innerHTML = html;
}

// Toggle product visibility
function toggleProduct(productName) {
    const content = document.getElementById(`product-${productName.replace(/\s+/g, '-')}`);
    if (content) {
        content.classList.toggle('expanded');
    }
}

// Toggle project visibility
function toggleProject(productName, projectName) {
    const content = document.getElementById(`project-${productName.replace(/\s+/g, '-')}-${projectName.replace(/\s+/g, '-')}`);
    if (content) {
        content.classList.toggle('expanded');
    }
}

// Get month name
function getMonthName(monthIndex) {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return monthNames[monthIndex];
}


// Update planning list
function updatePlanningList() {
    const planningList = document.getElementById('planningList');
    const plannedResources = resources.filter(r => r.status === 'planned');
    
    if (plannedResources.length === 0) {
        planningList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h3>Нет запланированных ресурсов</h3>
                <p>Добавьте новое планирование для отслеживания будущих ресурсов</p>
            </div>
        `;
        return;
    }
    
    planningList.innerHTML = plannedResources.map(resource => `
        <div class="planning-item">
            <h4>${resource.name}</h4>
            <div class="planning-details">
                <div><strong>Команда:</strong> ${resource.team}</div>
                <div><strong>Проект:</strong> ${resource.project}</div>
                <div><strong>Период:</strong> ${resource.startDate.toLocaleDateString('ru-RU')} - ${resource.endDate.toLocaleDateString('ru-RU')}</div>
                <div><strong>Часов в неделю:</strong> ${resource.hoursPerWeek}</div>
            </div>
        </div>
    `).join('');
}

// Generate calendar
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Day headers
    const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    let calendarHTML = dayHeaders.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek - 1; i++) {
        calendarHTML += '<div class="calendar-day other-month"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = new Date(year, month, day);
        const isToday = currentDay.toDateString() === new Date().toDateString();
        const dayResources = resources.filter(r => {
            const resourceDate = new Date(r.date);
            return resourceDate.toDateString() === currentDay.toDateString();
        });
        
        const totalHours = dayResources.reduce((sum, r) => sum + (r.hoursPerWeek || 0), 0);
        const totalCost = dayResources.reduce((sum, r) => sum + ((r.hoursPerWeek || 0) * (r.hourlyRate || 0)), 0);
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                <div class="day-resources">
                    ${dayResources.length > 0 ? `
                        <div class="day-resource-count">${dayResources.length} ресурсов</div>
                        <div class="day-resource-hours">${totalHours}ч</div>
                        <div class="day-resource-cost">${totalCost.toLocaleString('ru-RU')} ₽</div>
                        <div class="day-resource-details">
                            ${dayResources.slice(0, 3).map(r => `
                                <div class="resource-mini">
                                    <span class="resource-name-mini">${r.name}</span>
                                    <span class="resource-project-mini">${r.project}</span>
                                    <span class="resource-hours-mini">${r.hoursPerWeek}ч</span>
                                </div>
                            `).join('')}
                            ${dayResources.length > 3 ? `<div class="more-resources">+${dayResources.length - 3} еще</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    calendarGrid.innerHTML = calendarHTML;
}

// Update analytics
function updateAnalytics() {
    const selectedMonth = document.getElementById('analyticsMonth').value;
    const chartType = document.getElementById('chartType').value;
    
    updateProductsChart(selectedMonth, chartType);
    updateTopProjectsChart(selectedMonth);
    updateTeamsDistributionChart(selectedMonth);
    updateSummaryStats(selectedMonth);
}

// Update products chart
function updateProductsChart(month, chartType) {
    const ctx = document.getElementById('productsChart').getContext('2d');
    
    if (productsChart) {
        productsChart.destroy();
    }
    
    const monthResources = resources.filter(r => r.month === month);
    
    // Group by product and project
    const productsData = {};
    monthResources.forEach(resource => {
        if (!productsData[resource.product]) {
            productsData[resource.product] = {};
        }
        if (!productsData[resource.product][resource.project]) {
            productsData[resource.product][resource.project] = {
                cost: 0,
                hours: 0,
                members: 0
            };
        }
        
        const cost = (resource.hoursPerMonth || 0) * (resource.hourlyRate || 0);
        productsData[resource.product][resource.project].cost += cost;
        productsData[resource.product][resource.project].hours += (resource.hoursPerMonth || 0);
        productsData[resource.product][resource.project].members += 1;
    });
    
    // Prepare data for chart
    const labels = [];
    const datasets = [];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
    
    let colorIndex = 0;
    Object.keys(productsData).forEach(productName => {
        const productProjects = productsData[productName];
        const projectNames = Object.keys(productProjects);
        
        projectNames.forEach(projectName => {
            const projectData = productProjects[projectName];
            labels.push(`${productName} - ${projectName}`);
            
            let value;
            let label;
            switch (chartType) {
                case 'cost':
                    value = projectData.cost;
                    label = 'Расходы (₽)';
                    break;
                case 'hours':
                    value = projectData.hours;
                    label = 'Часы';
                    break;
                case 'members':
                    value = projectData.members;
                    label = 'Участники';
                    break;
            }
            
            datasets.push({
                label: label,
                data: [value],
                backgroundColor: colors[colorIndex % colors.length],
                borderColor: colors[colorIndex % colors.length],
                borderWidth: 1
            });
            
            colorIndex++;
        });
    });
    
    // Create grouped bar chart
    const chartData = {
        labels: labels,
        datasets: [{
            label: chartType === 'cost' ? 'Расходы (₽)' : chartType === 'hours' ? 'Часы' : 'Участники',
            data: labels.map((_, index) => {
                const productProject = labels[index].split(' - ');
                const productName = productProject[0];
                const projectName = productProject[1];
                const projectData = productsData[productName][projectName];
                
                switch (chartType) {
                    case 'cost': return projectData.cost;
                    case 'hours': return projectData.hours;
                    case 'members': return projectData.members;
                    default: return 0;
                }
            }),
            backgroundColor: labels.map((_, index) => colors[index % colors.length]),
            borderColor: labels.map((_, index) => colors[index % colors.length]),
            borderWidth: 2
        }]
    };
    
    const desiredHeight = 320; // px, to prevent layout overflow
    try {
        const canvas = document.getElementById('productsChart');
        if (canvas) {
            canvas.style.height = desiredHeight + 'px';
        }
    } catch (e) {}
    productsChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (chartType === 'cost') {
                                return `Расходы: ${value.toLocaleString('ru-RU')} ₽`;
                            } else if (chartType === 'hours') {
                                return `Часы: ${value}`;
                            } else {
                                return `Участники: ${value}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: chartType === 'cost' ? 'Расходы (₽)' : chartType === 'hours' ? 'Часы' : 'Участники'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Update top projects chart
function updateTopProjectsChart(month) {
    const monthResources = resources.filter(r => r.month === month);
    const projectData = {};
    
    monthResources.forEach(resource => {
        if (!projectData[resource.project]) {
            projectData[resource.project] = {
                cost: 0,
                hours: 0,
                members: 0
            };
        }
        
        const cost = (resource.hoursPerMonth || 0) * (resource.hourlyRate || 0);
        projectData[resource.project].cost += cost;
        projectData[resource.project].hours += (resource.hoursPerMonth || 0);
        projectData[resource.project].members += 1;
    });
    
    const sortedProjects = Object.entries(projectData)
        .sort(([,a], [,b]) => b.cost - a.cost)
        .slice(0, 5);
    
    const topProjectsChart = document.getElementById('topProjectsChart');
    topProjectsChart.innerHTML = `
        <div class="top-projects-list">
            ${sortedProjects.map(([projectName, data], index) => `
                <div class="project-item-chart">
                    <div class="item-name">${projectName}</div>
                    <div class="item-value">${data.cost.toLocaleString('ru-RU')} ₽</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Update teams distribution chart
function updateTeamsDistributionChart(month) {
    const monthResources = resources.filter(r => r.month === month);
    const teamData = {};
    
    monthResources.forEach(resource => {
        if (!teamData[resource.team]) {
            teamData[resource.team] = {
                cost: 0,
                hours: 0,
                members: 0
            };
        }
        
        const cost = (resource.hoursPerMonth || 0) * (resource.hourlyRate || 0);
        teamData[resource.team].cost += cost;
        teamData[resource.team].hours += (resource.hoursPerMonth || 0);
        teamData[resource.team].members += 1;
    });
    
    const sortedTeams = Object.entries(teamData)
        .sort(([,a], [,b]) => b.cost - a.cost);
    
    const teamsDistributionChart = document.getElementById('teamsDistributionChart');
    teamsDistributionChart.innerHTML = `
        <div class="teams-distribution-list">
            ${sortedTeams.map(([teamName, data]) => `
                <div class="team-item-chart">
                    <div class="item-name">${teamName}</div>
                    <div class="item-value">${data.cost.toLocaleString('ru-RU')} ₽</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Update summary stats
function updateSummaryStats(month) {
    const monthResources = resources.filter(r => r.month === month);
    
    const totalCost = monthResources.reduce((sum, r) => sum + ((r.hoursPerMonth || 0) * (r.hourlyRate || 0)), 0);
    const totalHours = monthResources.reduce((sum, r) => sum + (r.hoursPerMonth || 0), 0);
    const totalMembers = new Set(monthResources.map(r => r.name)).size;
    const totalProjects = new Set(monthResources.map(r => r.project)).size;
    const totalProducts = new Set(monthResources.map(r => r.product)).size;
    const avgHourlyRate = totalHours > 0 ? totalCost / totalHours : 0;
    
    const summaryStats = document.getElementById('summaryStats');
    summaryStats.innerHTML = `
        <div class="summary-stats">
            <div class="summary-stat">
                <div class="summary-stat-value">${totalCost.toLocaleString('ru-RU')}</div>
                <div class="summary-stat-label">Общие расходы (₽)</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${totalHours}</div>
                <div class="summary-stat-label">Часов</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${totalMembers}</div>
                <div class="summary-stat-label">Участников</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${totalProjects}</div>
                <div class="summary-stat-label">Проектов</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${totalProducts}</div>
                <div class="summary-stat-label">Продуктов</div>
            </div>
            <div class="summary-stat">
                <div class="summary-stat-value">${avgHourlyRate.toFixed(0)}</div>
                <div class="summary-stat-label">Средняя ставка (₽/ч)</div>
            </div>
        </div>
    `;
}

// Show message
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.body.insertBefore(message, document.body.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Initialize analytics on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set current month for analytics
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    document.getElementById('analyticsMonth').value = currentMonthStr;
    
    setTimeout(() => {
        if (document.getElementById('analytics').classList.contains('active')) {
            updateAnalytics();
        }
    }, 100);
});

// ============================
// Supabase helpers (optional)
// ============================
async function loadResourcesFromDB() {
    if (!isCloudPersistenceEnabled || !supabase) {
        console.log('Supabase not available');
        return;
    }
    try {
        console.log('Fetching from Supabase...');
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        console.log('Supabase response:', data);
        
        if (Array.isArray(data)) {
            resources = data.map(row => ({
                id: row.id,
                product: row.product,
                project: row.project,
                name: row.name,
                team: row.team,
                hoursPerMonth: row.hoursPerMonth,
                hourlyRate: row.hourlyRate,
                month: row.month ? (typeof row.month === 'string' ? row.month : row.month.substring(0, 7)) : '2025-01',
                status: row.status || 'active'
            }));
            console.log('Mapped resources:', resources);
        }
    } catch (e) {
        console.error('Failed to load from Supabase:', e);
        // Fallback to local sample if DB fails
        isCloudPersistenceEnabled = false;
    }
}

async function syncResourceToDB(resource) {
    if (!isCloudPersistenceEnabled || !supabase || !resource) return;
    try {
        const payload = {
            id: resource.id,
            product: resource.product,
            project: resource.project,
            name: resource.name,
            team: resource.team,
            hoursPerMonth: resource.hoursPerMonth,
            hourlyRate: resource.hourlyRate,
            month: resource.month ? new Date(resource.month + '-01') : new Date('2025-01-01'),
            status: resource.status || 'active'
        };
        const { error } = await supabase
            .from('resources')
            .upsert(payload, { onConflict: 'id' });
        if (error) throw error;
    } catch (e) {
        // Ignore sync errors in UI to keep UX smooth
    }
}

async function deleteResourceFromDB(resource) {
    if (!isCloudPersistenceEnabled || !supabase || !resource || !resource.id) return;
    try {
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', resource.id);
        if (error) throw error;
    } catch (e) {
        // Ignore
    }
}

// ============================
// localStorage helpers (fallback)
// ============================
function saveToLocalStorage() {
    try {
        localStorage.setItem('dashboard_resources', JSON.stringify(resources));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('dashboard_resources');
        if (saved) {
            resources = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        resources = [];
    }
}


