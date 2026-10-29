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
    currentBookInfo = bookInfo;
    currentIsbn = BOOK_ISBN_MAP[markerId];

    // Заполнение полей
    document.getElementById("card-title").textContent = bookInfo?.title || "Без названия";
    document.getElementById("card-authors").textContent = 
        bookInfo?.authors?.join(", ") || "Автор не указан";
    const year = bookInfo?.publishedDate?.substring(0, 4) || "—";
    document.getElementById("card-passport").textContent = 
        `${year} | ${bookInfo?.publisher || "—"} | ${bookInfo?.pageCount || "—"} стр.`;
    document.getElementById("card-isbn").textContent = `ISBN: ${currentIsbn}`;
    document.getElementById("card-rating").textContent = 
        bookInfo?.averageRating ? `Рейтинг: ${bookInfo.averageRating.toFixed(1)}/5` : "Рейтинг: нет данных";
    document.getElementById("card-genre").textContent = 
        bookInfo?.categories?.slice(0, 3).join(", ") || "Жанр: —";
    document.getElementById("card-quote").textContent = quoteText;

    // Похожие книги
    const similar = LOCAL_DATA[markerId]?.similar_books || [];
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
        const isbn = BOOK_ISBN_MAP[markerId];

        // Загрузка данных
        const bookInfo = await getBookInfo(markerId);
        const quote = await getRandomQuote(markerId);

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