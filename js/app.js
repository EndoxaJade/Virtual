// js/app.js

// ========== Закладки (localStorage) ==========
const BOOKMARKS_KEY = "ar_library_bookmarks";

function loadBookmarks() {
    try {
        return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    } catch { return []; }
}

function saveBookmark(title, isbn) {
    const bookmarks = loadBookmarks();
    if (bookmarks.some(b => b.isbn === isbn)) {
        showToast("Уже в закладках");
        return;
    }
    bookmarks.push({ title, isbn, time: new Date().toISOString() });
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    showToast(`Закладка добавлена: ${title}`);
}

function showBookmarksList() {
    const bookmarks = loadBookmarks();
    if (bookmarks.length === 0) {
        showToast("Закладок нет");
        return;
    }
    const list = bookmarks.map((b, i) => `${i + 1}. ${b.title} (ISBN: ${b.isbn})`).join("\n");
    alert("=== ЗАКЛАДКИ ===\n" + list);
}

// ========== Уведомления ==========
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
}

// ========== Переключение карточки ==========
let currentMarkerId = null;
let currentBookInfo = null;
let currentIsbn = null;

function showCard(markerId, bookInfo, quoteText) {
  currentMarkerId = markerId;

  // Подтягиваем данные из LOCAL_DATA по маркеру
  const data = LOCAL_DATA[markerId] || {};

  currentBookInfo = data;
  currentIsbn = data?.isbn;

  // Заполнение полей данными из LOCAL_DATA
  document.getElementById("card-title").textContent = data?.title ?? "Без названия";
  document.getElementById("card-authors").textContent = data?.authors?.join(", ") ?? "Автор не указан";

  const year = data?.publishedDate?.substring(0, 4) ?? "—";
  document.getElementById("card-passport").textContent =
    `${year} | ${data?.publisher ?? "—"} | ${data?.pageCount ?? "—"} стр.`;

  document.getElementById("card-isbn").textContent = `ISBN: ${data?.isbn ?? ""}`;

  document.getElementById("card-rating").textContent =
    data?.averageRating != null ? `Рейтинг: ${data.averageRating.toFixed(1)}/5` : "Рейтинг: нет данных";

  document.getElementById("card-genre").textContent =
    data?.categories?.slice(0, 3).join(", ") ?? "Жанр: —";

  // Вариант: подтягиваем цитату также из LOCAL_DATA
  document.getElementById("card-quote").textContent = data?.quote ?? "";

  // Похожие книги
  const similar = data?.similar_books || [];
  document.getElementById("card-similar").innerHTML =
    similar.map(s => `<li>${s}</li>`).join("");

  document.getElementById("book-card").classList.remove("hidden");
}

function hideCard() {
    document.getElementById("book-card").classList.add("hidden");
    currentMarkerId = null;
    currentBookInfo = null;
}

// ========== AR-события ==========
const marker = document.getElementById("main-marker");
if (marker) {
    marker.addEventListener("markerFound", async () => {
        // Для демонстрации используем markerId = 0 (Мастер и Маргарита)
        // В реальном проекте: несколько маркеров, каждый со своим ID
        const markerId = 0;
        const isbn = LOCAL_DATA[markerId]?.isbn;

        // Загрузка данных
        const bookInfo = LOCAL_DATA[markerId]?.mood_query;
        const quote = LOCAL_DATA[markerId]?.quote;

        showCard(markerId, bookInfo, quote);
    });

    marker.addEventListener("markerLost", () => {
        hideCard();
    });
}

// ========== Обработка кнопок ==========
document.getElementById("close-card").addEventListener("click", hideCard);

document.getElementById("btn-music").addEventListener("click", () => {
    if (!currentMarkerId) return;
    const query = LOCAL_DATA[currentMarkerId]?.mood_query;
    if (!query) { showToast("Запрос настроения не задан"); return; }
    const url = `https://music.yandex.ru/search?text=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
});

document.getElementById("btn-new-quote").addEventListener("click", () => {
    if (!currentMarkerId) return;
    const newQuote = refreshQuote(currentMarkerId);
    if (newQuote) {
        document.getElementById("card-quote").textContent = newQuote;
    } else {
        showToast("Нет доступных цитат");
    }
});

document.getElementById("btn-bookmark").addEventListener("click", () => {
    if (!currentBookInfo || !currentIsbn) return;
    saveBookmark(currentBookInfo.title || "Неизвестно", currentIsbn);
});

document.getElementById("btn-show-bookmarks").addEventListener("click", showBookmarksList);
