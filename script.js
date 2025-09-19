class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.editingId = null;
        this.currentFilter = 'all';
        this.reminderInterval = null;
        this.initializeEventListeners();
        this.initializeNotifications();
        this.startReminderChecker();
        this.updateUI();
    }

    // Cargar tareas desde LocalStorage
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('taskflow-tasks');
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error('Error cargando tareas:', error);
            return [];
        }
    }

    // Guardar tareas en LocalStorage
    saveTasks() {
        try {
            localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error guardando tareas:', error);
        }
    }

    // Inicializar notificaciones del navegador
    async initializeNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.showNotification('¡Notificaciones activadas!', 'Te recordaremos tus tareas a tiempo.', 'success');
                }
            }
        }
    }

    initializeEventListeners() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const reminderTime = document.getElementById('reminderTime');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) this.addTask();
        });

        // Set minimum datetime to current time
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // 1 minute from now
        reminderTime.min = now.toISOString().slice(0, 16);

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const reminderInput = document.getElementById('reminderTime');
        const text = input.value.trim();
        
        if (text === '') {
            this.showNotification('Error', 'Por favor escribe una tarea', 'error');
            return;
        }

        const reminderTime = reminderInput.value ? new Date(reminderInput.value) : null;
        
        // Validar que el recordatorio sea en el futuro
        if (reminderTime && reminderTime <= new Date()) {
            this.showNotification('Error', 'El recordatorio debe ser en el futuro', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date(),
            reminderTime: reminderTime,
            reminderTriggered: false
        };

        this.tasks.unshift(task);
        input.value = '';
        reminderInput.value = '';
        
        if (reminderTime) {
            this.showNotification('Recordatorio programado', `Te recordaré "${text}" el ${this.formatDateTime(reminderTime)}`, 'success');
        }
        
        this.saveTasks();
        this.updateUI();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            // Si se marca como completada, cancelar recordatorio
            if (task.completed) {
                task.reminderTriggered = true;
            }
            this.saveTasks();
            this.updateUI();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.updateUI();
    }

    startEdit(id) {
        this.editingId = id;
        this.renderTasks();
    }

    saveEdit(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveTasks();
        }
        this.editingId = null;
        this.updateUI();
    }

    cancelEdit() {
        this.editingId = null;
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    // Iniciar el verificador de recordatorios
    startReminderChecker() {
        // Verificar cada 30 segundos
        this.reminderInterval = setInterval(() => {
            this.checkReminders();
        }, 30000);

        // Verificar inmediatamente
        this.checkReminders();
    }

    // Verificar recordatorios pendientes
    checkReminders() {
        const now = new Date();
        
        this.tasks.forEach(task => {
            if (task.reminderTime && !task.reminderTriggered && !task.completed) {
                const reminderTime = new Date(task.reminderTime);
                
                // Si es hora del recordatorio (o ya pasó)
                if (now >= reminderTime) {
                    this.triggerReminder(task);
                    task.reminderTriggered = true;
                    this.saveTasks();
                    this.updateUI();
                }
            }
        });
    }

    // Disparar recordatorio
    triggerReminder(task) {
        // Reproducir sonido
        this.playNotificationSound();
        
        // Notificación del navegador
        if (Notification.permission === 'granted') {
            new Notification('⏰ Recordatorio de Tarea', {
                body: task.text,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fbbf24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                requireInteraction: true
            });
        }
        
        // Notificación visual en la app
        this.showNotification('⏰ ¡Es hora!', task.text, 'reminder', 10000);
    }

    // Reproducir sonido de notificación
    playNotificationSound() {
        const audio = document.getElementById('notificationSound');
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.7;
            audio.play().catch(e => {
                console.log('No se pudo reproducir el sonido:', e);
            });
        }
    }

    // Mostrar notificación visual
    showNotification(title, message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification-popup ${type}`;
        
        const icon = type === 'error' ? '❌' : 
                    type === 'success' ? '✅' : 
                    type === 'reminder' ? '⏰' : 'ℹ️';
        
        notification.innerHTML = `
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
            <div class="notification-header">
                <span>${icon}</span>
                <span>${title}</span>
            </div>
            <div class="notification-body">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    // Formatear fecha y hora
    formatDateTime(date) {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Obtener estado del recordatorio
    getReminderStatus(task) {
        if (!task.reminderTime) return null;
        
        const now = new Date();
        const reminderTime = new Date(task.reminderTime);
        
        if (task.reminderTriggered) {
            return { type: 'triggered', text: 'Recordatorio enviado' };
        } else if (now > reminderTime) {
            return { type: 'overdue', text: 'Vencido' };
        } else {
            return { type: 'scheduled', text: this.formatDateTime(reminderTime) };
        }
    }

    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        // Actualizar contador
        document.getElementById('taskCounter').textContent = `${completed}/${total}`;
        
        // Actualizar porcentaje
        document.getElementById('progressPercentage').textContent = `${percentage}%`;
        
        // Actualizar círculo de progreso
        const progressRing = document.getElementById('progressRing');
        const circumference = 2 * Math.PI * 50; // radio = 50
        const offset = circumference - (percentage / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <h3>¡Todo listo!</h3>
                    <p>No hay tareas ${this.currentFilter === 'all' ? 'para mostrar' : this.currentFilter}.</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => {
            const reminderStatus = this.getReminderStatus(task);
            const hasReminder = task.reminderTime;
            const isOverdue = reminderStatus && reminderStatus.type === 'overdue';
            
            return `
                <div class="task-item ${task.completed ? 'completed' : ''} ${hasReminder ? 'has-reminder' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="task-main-row">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                             onclick="taskManager.toggleTask(${task.id})"></div>
                        
                        ${this.editingId === task.id ? `
                            <input type="text" class="task-text editing" value="${task.text}" 
                                   id="editInput-${task.id}" 
                                   onkeypress="if(event.key==='Enter') taskManager.saveEdit(${task.id}, this.value)"
                                   onblur="taskManager.saveEdit(${task.id}, this.value)">
                        ` : `
                            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                        `}
                        
                        <div class="task-actions">
                            ${this.editingId === task.id ? `
                                <button class="action-btn save-btn" onclick="taskManager.saveEdit(${task.id}, document.getElementById('editInput-${task.id}').value)">✓</button>
                            ` : `
                                <button class="action-btn edit-btn" onclick="taskManager.startEdit(${task.id})">✎</button>
                            `}
                            <button class="action-btn delete-btn" onclick="taskManager.deleteTask(${task.id})">×</button>
                        </div>
                    </div>
                    
                    ${reminderStatus ? `
                        <div class="task-reminder-info">
                            <svg class="reminder-icon" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span>Recordatorio: ${reminderStatus.text}</span>
                            ${isOverdue ? '<span class="overdue-badge">¡Vencido!</span>' : 
                             reminderStatus.type === 'scheduled' ? '<span class="reminder-badge">Programado</span>' : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Focus en el input de edición si existe
        if (this.editingId) {
            setTimeout(() => {
                const editInput = document.getElementById(`editInput-${this.editingId}`);
                if (editInput) {
                    editInput.focus();
                    editInput.select();
                }
            }, 0);
        }
    }

    updateUI() {
        this.updateProgress();
        this.renderTasks();
    }

    // Limpiar intervalos al cerrar
    destroy() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
    if (window.taskManager) {
        window.taskManager.destroy();
    }
});