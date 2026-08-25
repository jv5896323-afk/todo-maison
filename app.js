const STORAGE_KEY = 'todo-maison-tasks';

const ROOMS = {
  chambre1: 'Chambre 1',
  chambre2: 'Chambre 2',
  salon: 'Salon',
  cuisine: 'Cuisine',
};

const DEFAULT_TASKS = [
  { name: 'Faire le lit', room: 'chambre1', freq: 'quotidien' },
  { name: 'Dépoussiérer les meubles', room: 'chambre1', freq: 'hebdomadaire' },
  { name: 'Passer l\'aspirateur', room: 'chambre1', freq: 'hebdomadaire' },
  { name: 'Changer les draps', room: 'chambre1', freq: 'hebdomadaire' },
  { name: 'Ranger les vêtements', room: 'chambre1', freq: 'mensuel' },

  { name: 'Faire le lit', room: 'chambre2', freq: 'quotidien' },
  { name: 'Dépoussiérer les meubles', room: 'chambre2', freq: 'hebdomadaire' },
  { name: 'Passer l\'aspirateur', room: 'chambre2', freq: 'hebdomadaire' },
  { name: 'Changer les draps', room: 'chambre2', freq: 'hebdomadaire' },
  { name: 'Ranger les vêtements', room: 'chambre2', freq: 'mensuel' },

  { name: 'Passer l\'aspirateur', room: 'salon', freq: 'quotidien' },
  { name: 'Trier le courrier', room: 'salon', freq: 'quotidien' },
  { name: 'Dépoussiérer', room: 'salon', freq: 'hebdomadaire' },
  { name: 'Aspirer les canapés', room: 'salon', freq: 'mensuel' },
  { name: 'Nettoyer les vitres', room: 'salon', freq: 'mensuel' },

  { name: 'Faire la vaisselle', room: 'cuisine', freq: 'quotidien' },
  { name: 'Nettoyer le plan de travail', room: 'cuisine', freq: 'quotidien' },
  { name: 'Vider le lave-vaisselle', room: 'cuisine', freq: 'quotidien' },
  { name: 'Passer la serpillère', room: 'cuisine', freq: 'hebdomadaire' },
  { name: 'Nettoyer le four', room: 'cuisine', freq: 'mensuel' },
  { name: 'Ranger les placards', room: 'cuisine', freq: 'mensuel' },
];

let tasks = [];
let currentRoom = null;
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

function openRoom(room) {
  currentRoom = room;
  currentFilter = 'all';
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('room-screen').style.display = 'block';
  document.getElementById('room-title').textContent = ROOMS[room];

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

  render();
}

function goHome() {
  currentRoom = null;
  document.getElementById('room-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'block';
  updateHomeProgress();
}

function updateHomeProgress() {
  for (const room of Object.keys(ROOMS)) {
    const roomTasks = tasks.filter(t => t.room === room);
    const done = roomTasks.filter(t => t.done).length;
    const total = roomTasks.length;
    const el = document.getElementById('progress-' + room);
    if (el) {
      if (total === 0) {
        el.textContent = 'Aucune tâche';
      } else {
        el.textContent = done + ' / ' + total + ' accomplies';
      }
    }
  }
}

function addTask(name, freq) {
  tasks.unshift({ id: Date.now(), name, room: currentRoom, freq, done: false });
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
  tasks = tasks.filter(t => !(t.room === currentRoom && t.done));
  saveTasks();
  render();
}

function updateStats() {
  const roomTasks = tasks.filter(t => t.room === currentRoom);
  const done = roomTasks.filter(t => t.done).length;
  const total = roomTasks.length;
  document.getElementById('stats-text').textContent = done + ' / ' + total + ' tâches accomplies';
  const pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
}

function render() {
  const list = document.getElementById('task-list');
  let filtered = tasks.filter(t => t.room === currentRoom);

  if (currentFilter !== 'all') {
    filtered = filtered.filter(t => t.freq === currentFilter);
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">Aucune tâche</div>';
    updateStats();
    return;
  }

  list.innerHTML = filtered.map(t => {
    return '<div class="task-card ' + (t.done ? 'done' : '') + '">' +
      '<div class="task-check" onclick="toggleTask(' + t.id + ')">' +
      (t.done ? '&#10003;' : '') +
      '</div>' +
      '<div class="task-info">' +
      '<div class="task-name">' + escapeHtml(t.name) + '</div>' +
      '<span class="badge badge-' + t.freq + '">' + t.freq + '</span>' +
      '</div>' +
      '<button class="task-delete" onclick="deleteTask(' + t.id + ')">&times;</button>' +
      '</div>';
  }).join('');

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
  const freq = document.getElementById('new-freq').value;
  addTask(name, freq);
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

// Init
loadTasks();
updateHomeProgress();
