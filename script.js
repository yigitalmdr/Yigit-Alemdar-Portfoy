const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') root.classList.add('light');

function updateThemeIcon() {
  themeIcon.textContent = root.classList.contains('light') ? '☾' : '☼';
}

updateThemeIcon();
themeButton.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  updateThemeIcon();
});

document.querySelector('#year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

const guestbookForm = document.querySelector('#guestbook-form');
const guestbookNotes = document.querySelector('#guestbook-notes');
const guestbookEmpty = document.querySelector('#guestbook-empty');
const formStatus = document.querySelector('#form-status');
const guestbookKey = 'yigit-guestbook-notes';
const blockedWords = ['amk', 'aq', 'orospu', 'piç', 'sik', 'siker', 'siktir', 'yarrak', 'yarak', 'göt', 'ibne', 'kahpe', 'pezevenk', 'salak', 'gerizekalı'];

function normalizeForFilter(value) {
  return value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/0/g, 'o').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/[^a-zçğıöşü]/g, '');
}

function containsBlockedWord(value) {
  const normalized = normalizeForFilter(value);
  return blockedWords.some((word) => normalized.includes(normalizeForFilter(word)));
}

function getGuestbookNotes() {
  try {
    return JSON.parse(localStorage.getItem(guestbookKey)) || [];
  } catch {
    return [];
  }
}

function renderGuestbookNotes() {
  const notes = getGuestbookNotes();
  guestbookNotes.replaceChildren();
  guestbookEmpty.hidden = notes.length > 0;

  notes.forEach((note) => {
    const article = document.createElement('article');
    article.className = 'guest-note';

    const name = document.createElement('strong');
    name.textContent = note.name;

    const message = document.createElement('p');
    message.textContent = note.message;

    const time = document.createElement('time');
    time.dateTime = note.createdAt;
    time.textContent = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(note.createdAt));

    article.append(name, message, time);
    guestbookNotes.append(article);
  });
}

guestbookForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(guestbookForm);
  const name = data.get('name').trim();
  const message = data.get('message').trim();

  if (!name || !message) return;

  if (containsBlockedWord(`${name} ${message}`)) {
    formStatus.className = 'form-status';
    formStatus.textContent = 'Bu yorum uygun olmayan bir ifade içeriyor.';
    return;
  }

  const notes = getGuestbookNotes();
  notes.unshift({ name, message, createdAt: new Date().toISOString() });
  localStorage.setItem(guestbookKey, JSON.stringify(notes.slice(0, 12)));
  guestbookForm.reset();
  formStatus.className = 'form-status success';
  formStatus.textContent = 'Yorumun eklendi.';
  renderGuestbookNotes();
});

renderGuestbookNotes();
