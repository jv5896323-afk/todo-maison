const STORAGE_KEY = 'todo-maison-tasks';

const DEFAULT_TASKS = [
  { name: 'Faire la vaisselle', room: 'cuisine', freq: 'quotidien' },
  { name: 'Nettoyer le plan de travail', room: 'cuisine', freq: 'quotidien' },
  { name: 'Vider le lave-vaisselle', room: 'cuisine', freq: 'quotidien' },
  { name: 'Passer l\'aspirateur au salon', room: 'salon', freq: 'quotidien' },
  { name: 'Trier le courrier', room: 'entree', freq: 'quotidien' },
  { name: 'Faire le lit', room: 'chambre', freq: 'quotidien' },
  { name: 'Nettoyer la salle de bain', room: 'salle-de-bain', freq: 'hebdomadaire' },
  { name: 'Passer la serpillère', room: 'cuisine', freq: 'hebdomadaire' },
  { name: 'Dépoussiérer le salon', room: 'salon', freq: 'hebdomadaire' },
  { name: 'Changer les draps', room: 'chambre', freq: 'hebdomadaire' },
  { name: 'Nettoyer les vitres', room: 'salon', freq: 'mensuel' },
  { name: 'Ranger les placards', room: 'cuisine', freq: 'mensuel' },
  { name: 'Tuyaux d\'aspirateur / filtres', room: 'autre', freq: 'mensuel' },
];

const ROOM_LABELS = {
  'cuisine': 'Cuisine',
  'salon': 'Salon',
  'chambre': 'Chambre',
  'salle-de-bain': 'Salle de bain',
  'entree': 'Entrée',
  'jardin': 'Jardin',
  'autre': 'Autre',
};

let tasks = [];
let currentFilter = 'all';

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    tasks = JSON.parse(stored);
  } else {
    tasks = DEFAULT_TASKS.map((t, i) => ({
      id: Date.now() + i,
      name: t.name,
      room: t.room,
      freq: t.freq,
      done: false,
    }));
    saveTasks();
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(name, room, freq) {
  tasks.unshift({ id: Date.now(), name, room, freq, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

function resetAll() {
  if (!confirm('Réinitialiser toutes les tâches ? Les tâches par défaut seront restaurées.')) return;
  tasks = DEFAULT_TASKS.map((t, i) => ({
    id: Date.now() + i,
    name: t.name,
    room: t.room,
    freq: t.freq,
    done: false,
  }));
  saveTasks();
  render();
}

function updateStats() {
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  document.getElementById('stats-text').textContent = `${done} / ${total} tâches accomplies`;
  const pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
}

function render() {
  const list = document.getElementById('task-list');
  const filtered = currentFilter === 'all'
    ? tasks
    : tasks.filter(t => t.freq === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">Aucune tâche à afficher</div>';
    updateStats();
    return;
  }

  list.innerHTML = filtered.map(t => `
    <div class="task-card ${t.done ? 'done' : ''}">
      <div class="task-check" onclick="toggleTask(${t.id})">
        ${t.done ? '&#10003;' : ''}
      </div>
      <div class="task-info">
        <div class="task-name">${escapeHtml(t.name)}</div>
        <div class="task-meta">
          <span class="badge badge-room">${ROOM_LABELS[t.room] || t.room}</span>
          <span class="badge badge-${t.freq}">${t.freq}</span>
        </div>
      </div>
      <button class="task-delete" onclick="deleteTask(${t.id})">&times;</button>
    </div>
  `).join('');

  updateStats();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Event listeners
document.getElementById('add-btn').addEventListener('click', () => {
  const input = document.getElementById('new-task');
  const name = input.value.trim();
  if (!name) return;
  const room = document.getElementById('new-room').value;
  const freq = document.getElementById('new-freq').value;
  addTask(name, room, freq);
  input.value = '';
  input.focus();
});

document.getElementById('new-task').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('add-btn').click();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById('clear-done').addEventListener('click', clearDone);
document.getElementById('reset-all').addEventListener('click', resetAll);

// Init
loadTasks();
render();
