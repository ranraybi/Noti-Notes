import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

let notes = [];
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');
const addBtn = document.getElementById('addBtn');

// טעינת פתקים עם פתיחת האפליקציה
async function loadNotes() {
  const { value } = await Preferences.get({ key: 'notes' });
  if (value) {
    notes = JSON.parse(value);
    renderNotes();
  }
}

// שמירת פתקים לאחסון המקומי
async function saveNotes() {
  await Preferences.set({ key: 'notes', value: JSON.stringify(notes) });
}

// יצירת התראה
async function createNotification(id, text) {
  // בקשת הרשאה (חובה מאנדרואיד 13 ומעלה)
  await LocalNotifications.requestPermissions();
  
  await LocalNotifications.schedule({
    notifications: [{
      title: 'פתק נעוץ',
      body: text,
      id: Math.floor(id / 1000), // נדרש מספר שלם בן 32 ביט
      ongoing: true, // בקשה להשאיר את ההתראה קבועה
      autoCancel: false
    }]
  });
}

// הוספת פתק חדש
addBtn.addEventListener('click', async () => {
  const text = noteInput.value.trim();
  if (!text) return;

  const id = new Date().getTime();
  notes.push({ id, text });
  await saveNotes();
  await createNotification(id, text);
  
  noteInput.value = '';
  renderNotes();
});

// מחיקת פתק והסרת ההתראה
window.deleteNote = async (id) => {
  notes = notes.filter(note => note.id !== id);
  await saveNotes();
  await LocalNotifications.cancel({ notifications: [{ id: Math.floor(id / 1000) }] });
  renderNotes();
};

// עדכון התצוגה על המסך
function renderNotes() {
  notesList.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${note.text}</span>
      <button class="delete-btn" onclick="deleteNote(${note.id})">מחק</button>
    `;
    notesList.appendChild(li);
  });
}

loadNotes();
