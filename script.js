   document.addEventListener('DOMContentLoaded', function() {
            // Elementos da interface
            const loginPage = document.getElementById('login-page');
            const registerPage = document.getElementById('register-page');
            const mainHeader = document.getElementById('main-header');
            const mainContent = document.getElementById('main-content');
            const showRegisterBtn = document.getElementById('show-register');
            const showLoginBtn = document.getElementById('show-login');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const logoutBtn = document.getElementById('logout-btn');
            const usernameDisplay = document.getElementById('username-display');
            
            // Função para fazer login
            function loginUser(email, name) {
                // Esconder páginas de login/cadastro
                loginPage.style.display = 'none';
                registerPage.style.display = 'none';
                
                // Mostrar conteúdo principal
                mainHeader.style.display = 'block';
                mainContent.style.display = 'block';
                
                // Atualizar nome do usuário
                usernameDisplay.textContent = name;
                
                // Salvar dados no localStorage
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);
            }
            
            // Função para fazer logout
            function logoutUser() {
                // Esconder conteúdo principal
                mainHeader.style.display = 'none';
                mainContent.style.display = 'none';
                
                // Mostrar página de login
                loginPage.style.display = 'flex';
                registerPage.style.display = 'none';
                
                // Limpar dados do localStorage
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
            }
            
            // Verificar se o usuário já está logado
            if (localStorage.getItem('userLoggedIn') === 'true') {
                const email = localStorage.getItem('userEmail');
                const name = localStorage.getItem('userName');
                loginUser(email, name);
            }
            
            // Alternar entre login e cadastro
            showRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginPage.style.display = 'none';
                registerPage.style.display = 'flex';
            });
            
            showLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                registerPage.style.display = 'none';
                loginPage.style.display = 'flex';
            });
            
            // Processar formulário de login
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                // Simulação de login bem-sucedido
                // Em um sistema real, isso seria validado no servidor
                if (email && password) {
                    loginUser(email, email.split('@')[0]); 
                } else {
                    alert('Por favor, preencha todos os campos.');
                }
            });
            
            // Processar formulário de cadastro
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirm = document.getElementById('register-confirm').value;
                const confirmError = document.getElementById('confirm-error');
                
                // Validar se as senhas coincidem
                if (password !== confirm) {
                    confirmError.style.display = 'block';
                    return;
                }
                
                confirmError.style.display = 'none';
                
                // Simulação de cadastro bem-sucedido
                // Em um sistema real, isso seria processado no servidor
                loginUser(email, name);
                alert('Cadastro realizado com sucesso!');
            });
            
            // Processar logout
            logoutBtn.addEventListener('click', function() {
                logoutUser();
            });
            
            // Navegação entre páginas
            const navLinks = document.querySelectorAll('.nav-link');
            const pages = document.querySelectorAll('.page');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetPage = this.getAttribute('data-page');
                    
                    // Atualizar navegação
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Mostrar página correspondente
                    pages.forEach(page => {
                        page.classList.remove('active');
                        if (page.id === targetPage) {
                            page.classList.add('active');
                        }
                    });
                    
                    // Scroll para o topo
                    window.scrollTo(0, 0);
                });
            });
            
            // Botão de agendamento na home
            document.querySelector('.btn-appointment').addEventListener('click', function(e) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('[data-page="appointment"]').classList.add('active');
                
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === 'appointment') {
                        page.classList.add('active');
                    }
                });
                
                window.scrollTo(0, 0);
            });
            
            // Botão de novo agendamento no CRUD
            document.getElementById('add-appointment').addEventListener('click', function() {
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('[data-page="appointment"]').classList.add('active');
                
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === 'appointment') {
                        page.classList.add('active');
                    }
                });
                
                window.scrollTo(0, 0);
            });

            // Validação do formulário de agendamento
            const appointmentForm = document.getElementById('appointment-form');
            
            // Definir data mínima como hoje
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;
            
            document.getElementById('appointment-date').min = todayStr;
            
            // Máscara para telefone
            const phoneInput = document.getElementById('phone');
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                if (value.length > 0) {
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                }
                if (value.length > 10) {
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                }
                
                e.target.value = value;
            });
            
            appointmentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simular sucesso no agendamento
                document.getElementById('success-message').style.display = 'block';
                
                // Adicionar à tabela (apenas para demonstração)
                const table = document.getElementById('appointments-table');
                const newRow = document.createElement('tr');
                
                const name = document.getElementById('patient-name').value;
                const date = document.getElementById('appointment-date').value;
                const time = document.getElementById('appointment-time').value;
                const reasonSelect = document.getElementById('reason');
                const reason = reasonSelect.options[reasonSelect.selectedIndex].text;
                
                newRow.innerHTML = `
                    <td>${name}</td>
                    <td>${date.split('-').reverse().join('/')}</td>
                    <td>${time}</td>
                    <td>${reason}</td>
                    <td>
                        <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                
                table.appendChild(newRow);
                
                // Adicionar eventos aos novos botões
                newRow.querySelector('.edit-btn').addEventListener('click', function() {
                    alert('Funcionalidade de edição será implementada aqui!');
                });
                
                newRow.querySelector('.delete-btn').addEventListener('click', function() {
                    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                        newRow.remove();
                        alert('Agendamento excluído com sucesso!');
                    }
                });
                
                // Rolagem suave para a mensagem de sucesso
                document.getElementById('success-message').scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Limpar formulário após 3 segundos
                setTimeout(function() {
                    appointmentForm.reset();
                    document.getElementById('success-message').style.display = 'none';
                }, 3000);
            });
            
            // Ações da tabela CRUD
            const editButtons = document.querySelectorAll('.edit-btn');
            const deleteButtons = document.querySelectorAll('.delete-btn');
            
            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    alert('Funcionalidade de edição será implementada aqui!');
                });
            });
            
            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                        const row = this.closest('tr');
                        row.remove();
                        alert('Agendamento excluído com sucesso!');
                    }
                });
            });
        });