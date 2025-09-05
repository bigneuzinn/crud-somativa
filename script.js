document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores do DOM ---
    // Páginas e seções principais
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    
    // Links e botões de navegação
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroAppointmentBtn = document.querySelector('.btn-appointment'); // Botão na seção principal
    
    // Formulário de agendamento e elementos relacionados
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentsTableBody = document.getElementById('appointments-table');
    const addAppointmentBtn = document.getElementById('add-appointment'); // Botão "Novo Agendamento" da tabela
    const successMessage = document.getElementById('success-message');
    const appointmentDateInput = document.getElementById('appointment-date');
    
    // Campos de validação
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmInput = document.getElementById('register-confirm');
    const confirmError = document.getElementById('confirm-error');

    // Variável para controle de edição (se está editando ou criando um novo agendamento)
    let currentAppointmentId = null;

    // --- Funções de Gerenciamento de Dados (LocalStorage) e Sessão (SessionStorage) ---

    // Obtém o banco de dados de usuários do LocalStorage. Se não existir, cria um novo objeto.
    function getDB() {
        const db = localStorage.getItem('saudeTotalDB');
        return db ? JSON.parse(db) : { usuarios: [] };
    }

    // Salva o banco de dados no LocalStorage.
    function saveDB(db) {
        localStorage.setItem('saudeTotalDB', JSON.stringify(db));
    }

    // Verifica se há um usuário logado no SessionStorage ao carregar a página.
    function checkSession() {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        if (loggedInUser) {
            showLoggedInUI(JSON.parse(loggedInUser));
        } else {
            showLoginUI();
        }
    }

    // Exibe a interface principal da aplicação (após o login).
    function showLoggedInUI(user) {
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        mainHeader.style.display = 'block';
        mainContent.style.display = 'block';
        usernameDisplay.textContent = user.name;
        renderAppointments(user.email);
        showPage('home'); // Redireciona para a página inicial
    }

    // Exibe a interface de login/cadastro.
    function showLoginUI() {
        loginPage.style.display = 'flex';
        registerPage.style.display = 'none';
        mainHeader.style.display = 'none';
        mainContent.style.display = 'none';
    }

    // Controla qual página do conteúdo principal está visível.
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');

        // Atualiza a classe 'active' nos links de navegação
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            }
        });
    }

    // --- Eventos e Lógica dos Formulários ---

    // Define a data mínima no campo de agendamento para a data atual.
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.setAttribute('min', today);

    // Lógica para o formulário de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.elements['login-email'].value;
        const password = e.target.elements['login-password'].value;
        const db = getDB();
        const user = db.usuarios.find(u => u.email === email && u.password === password);

        if (user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            showLoggedInUI(user);
        } else {
            alert('Email ou senha incorretos.');
        }
    });

    // Lógica para o formulário de cadastro
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.elements['register-name'].value;
        const email = e.target.elements['register-email'].value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmInput.value;

        if (password !== confirmPassword) {
            confirmError.style.display = 'block';
            return;
        } else {
            confirmError.style.display = 'none';
        }

        const db = getDB();
        const userExists = db.usuarios.some(u => u.email === email);

        if (userExists) {
            alert('Este email já está cadastrado.');
            return;
        }

        const newUser = { name, email, password, appointments: [] };
        db.usuarios.push(newUser);
        saveDB(db);
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        showLoginUI(); // Redireciona para a página de login
    });

    // Alternar entre as páginas de login e cadastro
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.style.display = 'none';
        registerPage.style.display = 'flex';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.style.display = 'flex';
        registerPage.style.display = 'none';
    });

    // Lógica do botão de logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        showLoginUI();
        window.location.reload(); // Recarrega a página para limpar o estado
    });

    // Lógica de navegação para os links do menu
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);

            if (pageId === 'crud') {
                const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
                if (user) {
                    renderAppointments(user.email);
                }
            } else if (pageId === 'appointment') {
                resetAppointmentForm();
            }
        });
    });
    
    // Lógica para o botão "Agendar Consulta" na seção Hero (home)
    if (heroAppointmentBtn) {
        heroAppointmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('appointment');
            resetAppointmentForm();
        });
    }

    // --- Agendamento de Consultas (CRUD) ---

    // Lógica para submissão do formulário de agendamento (Criação e Atualização)
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
            alert('Você precisa estar logado para agendar uma consulta.');
            return;
        }

        const newAppointmentData = {
            name: document.getElementById('patient-name').value,
            birthdate: document.getElementById('birthdate').value,
            healthPlan: document.getElementById('health-plan').value,
            phone: document.getElementById('phone').value,
            reason: document.getElementById('reason').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            additionalInfo: document.getElementById('additional-info').value,
        };

        const db = getDB();
        const userIndex = db.usuarios.findIndex(u => u.email === loggedInUser.email);
        const user = db.usuarios[userIndex];

        if (userIndex !== -1) {
            if (currentAppointmentId !== null) {
                // Se `currentAppointmentId` tem um valor, é uma atualização
                const appointmentIndex = user.appointments.findIndex(app => app.id === currentAppointmentId);
                if (appointmentIndex !== -1) {
                    user.appointments[appointmentIndex] = {
                        id: currentAppointmentId,
                        ...newAppointmentData
                    };
                }
            } else {
                // Caso contrário, é um novo agendamento
                const newId = user.appointments.length > 0 ? Math.max(...user.appointments.map(app => app.id)) + 1 : 1;
                user.appointments.push({
                    id: newId,
                    ...newAppointmentData
                });
            }

            saveDB(db);
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
                showPage('crud');
                renderAppointments(loggedInUser.email);
                resetAppointmentForm();
            }, 2000);
        }
    });

    // Preenche a tabela de agendamentos do usuário logado (Read)
    function renderAppointments(userEmail) {
        const db = getDB();
        const user = db.usuarios.find(u => u.email === userEmail);
        appointmentsTableBody.innerHTML = ''; // Limpa a tabela antes de preencher

        if (user && user.appointments.length > 0) {
            user.appointments.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.name}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.reason}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${appointment.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${appointment.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                appointmentsTableBody.appendChild(row);
            });
        } else {
            appointmentsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>`;
        }
    }

    // Evento de clique para os botões de ação na tabela (Editar e Excluir)
    appointmentsTableBody.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = parseInt(e.target.closest('.edit-btn').dataset.id);
            editAppointment(id);
        } else if (e.target.closest('.delete-btn')) {
            const id = parseInt(e.target.closest('.delete-btn').dataset.id);
            if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                deleteAppointment(id);
            }
        }
    });

    // Lógica para preencher o formulário com dados de um agendamento para edição (Update)
    function editAppointment(id) {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!loggedInUser) return;

        const db = getDB();
        const user = db.usuarios.find(u => u.email === loggedInUser.email);
        const appointment = user.appointments.find(app => app.id === id);

        if (appointment) {
            document.getElementById('patient-name').value = appointment.name;
            document.getElementById('birthdate').value = appointment.birthdate;
            document.getElementById('health-plan').value = appointment.healthPlan;
            document.getElementById('phone').value = appointment.phone;
            document.getElementById('reason').value = appointment.reason;
            document.getElementById('appointment-date').value = appointment.date;
            document.getElementById('appointment-time').value = appointment.time;
            document.getElementById('additional-info').value = appointment.additionalInfo;

            currentAppointmentId = id;
            showPage('appointment');
            window.scrollTo(0, 0); // Rola para o topo da página para facilitar a edição
        }
    }

    // Lógica para excluir um agendamento (Delete)
    function deleteAppointment(id) {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!loggedInUser) return;

        const db = getDB();
        const user = db.usuarios.find(u => u.email === loggedInUser.email);
        user.appointments = user.appointments.filter(app => app.id !== id);
        saveDB(db);
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        renderAppointments(loggedInUser.email);
    }

    // Limpa o formulário de agendamento e a variável de controle de edição
    function resetAppointmentForm() {
        appointmentForm.reset();
        currentAppointmentId = null;
    }
    
    // Lógica para o botão "Novo Agendamento" na página Meus Agendamentos
    addAppointmentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('appointment');
        resetAppointmentForm();
    });

    // --- Inicialização da Aplicação ---
    checkSession();
});