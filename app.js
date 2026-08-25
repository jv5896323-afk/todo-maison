var firebaseConfig = {
  apiKey: "AIzaSyCxFRp6TvZVIFWtq8HcG4ovo_YX9sN8kxs",
  authDomain: "todo-maison.firebaseapp.com",
  databaseURL: "https://todo-maison-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todo-maison",
  storageBucket: "todo-maison.firebasestorage.app",
  messagingSenderId: "933123023742",
  appId: "1:933123023742:web:5798a7069dae23b26a092f"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();
var dbRef = db.ref('todo-maison');

var ROOMS = {
  chambre1: 'Chambre 1',
  chambre2: 'Chambre 2',
  salon: 'Salon',
  cuisine: 'Cuisine',
};

var DEFAULT_TASKS = [
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

var tasks = [];
var currentRoom = null;
var activeFilters = { quotidien: true, hebdomadaire: true, mensuel: true };

function loadTasks() {
  dbRef.once('value', function(snapshot) {
    var data = snapshot.val();
    if (data && data.tasks) {
      tasks = data.tasks;
    } else {
      tasks = DEFAULT_TASKS.map(function(t, i) {
        return { id: Date.now() + i, name: t.name, room: t.room, freq: t.freq, done: false };
      });
      saveTasks();
    }
    updateHomeProgress();
  });
}

function saveTasks() {
  dbRef.set({ tasks: tasks });
}

function openRoom(room) {
  currentRoom = room;
  activeFilters = { quotidien: true, hebdomadaire: true, mensuel: true };
  document.body.className = 'room-' + room;
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('room-screen').style.display = 'block';
  document.getElementById('room-title').textContent = ROOMS[room];
  syncFilterButtons();
  render();
}

function goHome() {
  currentRoom = null;
  document.body.className = '';
  document.getElementById('room-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'block';
  updateHomeProgress();
}

function syncFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    var f = btn.getAttribute('data-filter');
    if (activeFilters[f]) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function toggleFilter(freq) {
  activeFilters[freq] = !activeFilters[freq];
  syncFilterButtons();
  render();
}

function updateHomeProgress() {
  Object.keys(ROOMS).forEach(function(room) {
    var roomTasks = tasks.filter(function(t) { return t.room === room; });
    var done = roomTasks.filter(function(t) { return t.done; }).length;
    var total = roomTasks.length;
    var el = document.getElementById('progress-' + room);
    if (el) {
      el.textContent = total === 0 ? 'Aucune tâche' : done + ' / ' + total + ' accomplies';
    }
  });
}

function addTask(name, freq) {
  tasks.unshift({ id: Date.now(), name: name, room: currentRoom, freq: freq, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  var task = tasks.find(function(t) { return t.id === id; });
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(function(t) { return t.id !== id; });
  saveTasks();
  render();
}

function resetAll() {
  if (!confirm('Réinitialiser toutes les tâches ?')) return;
  tasks = DEFAULT_TASKS.map(function(t, i) {
    return { id: Date.now() + i, name: t.name, room: t.room, freq: t.freq, done: false };
  });
  saveTasks();
  render();
}

function updateStats() {
  var roomTasks = tasks.filter(function(t) { return t.room === currentRoom; });
  var done = roomTasks.filter(function(t) { return t.done; }).length;
  var total = roomTasks.length;
  document.getElementById('stats-text').textContent = done + ' / ' + total + ' tâches accomplies';
  var pct = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
}

function render() {
  var list = document.getElementById('task-list');
  var filtered = tasks.filter(function(t) { return t.room === currentRoom; });
  filtered = filtered.filter(function(t) { return activeFilters[t.freq]; });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">Aucune tâche</div>';
    updateStats();
    return;
  }

  var html = '';
  filtered.forEach(function(t) {
    html += '<div class="task-card ' + (t.done ? 'done' : '') + '">' +
      '<div class="task-check" onclick="toggleTask(' + t.id + ')">' +
      (t.done ? '&#10003;' : '') +
      '</div>' +
      '<div class="task-info">' +
      '<div class="task-name">' + escapeHtml(t.name) + '</div>' +
      '<span class="badge badge-' + t.freq + '">' + t.freq + '</span>' +
      '</div>' +
      '<button class="task-delete" onclick="deleteTask(' + t.id + ')">&times;</button>' +
      '</div>';
  });
  list.innerHTML = html;
  updateStats();
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('add-btn').addEventListener('click', function() {
    var input = document.getElementById('new-task');
    var name = input.value.trim();
    if (!name) return;
    var freq = document.getElementById('new-freq').value;
    addTask(name, freq);
    input.value = '';
    input.focus();
  });

  document.getElementById('new-task').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('add-btn').click();
  });

  document.getElementById('reset-all').addEventListener('click', resetAll);

  loadTasks();
});
