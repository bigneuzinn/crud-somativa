document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores do DOM ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroAppointmentBtn = document.querySelector('.btn-appointment');
    
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentsTableBody = document.getElementById('appointments-table');
    const addAppointmentBtn = document.getElementById('add-appointment');
    const successMessage = document.getElementById('success-message');
    const appointmentDateInput = document.getElementById('appointment-date');
    
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmInput = document.getElementById('register-confirm');
    const confirmError = document.getElementById('confirm-error');

    let currentAppointmentId = null;

    const API_URL = 'http://localhost:3000';

    // --- Sessão e UI ---

    function checkSession() {
        const loggedInUser  = sessionStorage.getItem('loggedInUser ');
        if (loggedInUser ) {
            showLoggedInUI(JSON.parse(loggedInUser ));
        } else {
            showLoginUI();
        }
    }

    function showLoggedInUI(user) {
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        mainHeader.style.display = 'block';
        mainContent.style.display = 'block';
        usernameDisplay.textContent = user.name;
        renderAppointments(user.email);
        showPage('home');
    }

    function showLoginUI() {
        loginPage.style.display = 'flex';
        registerPage.style.display = 'none';
        mainHeader.style.display = 'none';
        mainContent.style.display = 'none';
    }

    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            }
        });
    }

    // --- Login ---

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.elements['login-email'].value.trim();
        const password = e.target.elements['login-password'].value;

        fetch(`${API_URL}/usuarios?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
            .then(res => res.json())
            .then(users => {
                if (users.length > 0) {
                    const user = users[0];
                    sessionStorage.setItem('loggedInUser ', JSON.stringify(user));
                    showLoggedInUI(user);
                } else {
                    alert('Email ou senha incorretos.');
                }
            })
            .catch(() => alert('Erro ao conectar com o servidor.'));
    });

    // --- Cadastro ---

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.elements['register-name'].value.trim();
        const email = e.target.elements['register-email'].value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmInput.value;

        if (password !== confirmPassword) {
            confirmError.style.display = 'block';
            return;
        } else {
            confirmError.style.display = 'none';
        }

        // Verifica se email já existe
        fetch(`${API_URL}/usuarios?email=${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(users => {
                if (users.length > 0) {
                    alert('Este email já está cadastrado.');
                } else {
                    // Cria novo usuário
                    const newUser  = { name, email, password };
                    fetch(`${API_URL}/usuarios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newUser )
                    })
                    .then(res => {
                        if (!res.ok) throw new Error('Erro ao cadastrar usuário');
                        return res.json();
                    })
                    .then(() => {
                        alert('Cadastro realizado com sucesso! Faça login para continuar.');
                        showLoginUI();
                    })
                    .catch(() => alert('Erro ao conectar com o servidor.'));
                }
            })
            .catch(() => alert('Erro ao conectar com o servidor.'));
    });

    // --- Navegação entre login e cadastro ---

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

    // --- Logout ---

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser ');
        showLoginUI();
        window.location.reload();
    });

    // --- Navegação do menu ---

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);

            if (pageId === 'crud') {
                const user = JSON.parse(sessionStorage.getItem('loggedInUser '));
                if (user) renderAppointments(user.email);
            } else if (pageId === 'appointment') {
                resetAppointmentForm();
            }
        });
    });

    if (heroAppointmentBtn) {
        heroAppointmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('appointment');
            resetAppointmentForm();
        });
    }

    // --- Agendamento ---

    // Define data mínima para hoje
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.setAttribute('min', today);

    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const loggedInUser  = JSON.parse(sessionStorage.getItem('loggedInUser '));
        if (!loggedInUser ) {
            alert('Você precisa estar logado para agendar uma consulta.');
            return;
        }

        const newAppointmentData = {
            userEmail: loggedInUser .email,
            name: document.getElementById('patient-name').value.trim(),
            birthdate: document.getElementById('birthdate').value,
            healthPlan: document.getElementById('health-plan').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            reason: document.getElementById('reason').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            additionalInfo: document.getElementById('additional-info').value.trim(),
        };

        if (currentAppointmentId !== null) {
            // Atualizar agendamento (PUT)
            fetch(`${API_URL}/agendamentos/${currentAppointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppointmentData)
            })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao atualizar agendamento');
                return res.json();
            })
            .then(() => {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    showPage('crud');
                    renderAppointments(loggedInUser .email);
                    resetAppointmentForm();
                }, 2000);
            })
            .catch(() => alert('Erro ao conectar com o servidor.'));
        } else {
            // Criar novo agendamento (POST)
            fetch(`${API_URL}/agendamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppointmentData)
            })
            .then(res => {
                if (!res.ok) throw new Error('Erro ao criar agendamento');
                return res.json();
            })
            .then(() => {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    showPage('crud');
                    renderAppointments(loggedInUser .email);
                    resetAppointmentForm();
                }, 2000);
            })
            .catch(() => alert('Erro ao conectar com o servidor.'));
        }
    });

    // --- Renderizar agendamentos do usuário ---

    function renderAppointments(userEmail) {
        fetch(`${API_URL}/agendamentos?userEmail=${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(appointments => {
                appointmentsTableBody.innerHTML = '';
                if (appointments.length > 0) {
                    appointments.forEach(appointment => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${appointment.name}</td>
                            <td>${appointment.date}</td>
                            <td>${appointment.time}</td>
                            <td>${formatReason(appointment.reason)}</td>
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
            })
            .catch(() => {
                appointmentsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar agendamentos.</td></tr>`;
            });
    }

    // Formata o motivo para exibição legível
    function formatReason(reason) {
        switch(reason) {
            case 'consulta-rotina': return 'Consulta de rotina';
            case 'retorno': return 'Retorno';
            case 'exame': return 'Exame';
            case 'dor': return 'Relato de dor';
            case 'outro': return 'Outro motivo';
            default: return reason;
        }
    }

    // --- Editar agendamento ---

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

    function editAppointment(id) {
        fetch(`${API_URL}/agendamentos/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Agendamento não encontrado');
                return res.json();
            })
            .then(appointment => {
                document.getElementById('patient-name').value = appointment.name;
                document.getElementById('birthdate').value = appointment.birthdate;
                document.getElementById('health-plan').value = appointment.healthPlan || '';
                document.getElementById('phone').value = appointment.phone;
                document.getElementById('reason').value = appointment.reason;
                document.getElementById('appointment-date').value = appointment.date;
                document.getElementById('appointment-time').value = appointment.time;
                document.getElementById('additional-info').value = appointment.additionalInfo || '';

                currentAppointmentId = id;
                showPage('appointment');
                window.scrollTo(0, 0);
            })
            .catch(() => alert('Erro ao carregar agendamento para edição.'));
    }

    // --- Deletar agendamento ---

    function deleteAppointment(id) {
        fetch(`${API_URL}/agendamentos/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao deletar agendamento');
            const loggedInUser  = JSON.parse(sessionStorage.getItem('loggedInUser '));
            renderAppointments(loggedInUser .email);
        })
        .catch(() => alert('Erro ao conectar com o servidor.'));
    }

    // --- Resetar formulário ---

    function resetAppointmentForm() {
        appointmentForm.reset();
        currentAppointmentId = null;
    }

    addAppointmentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('appointment');
        resetAppointmentForm();
    });

    // --- Inicialização ---

    checkSession();

});