// js/books.js

const BOOK_ISBN_MAP = {
    0: "9785699123456",
    1: "9780451524935",
    2: "9780060930318",
    3: "9780141439518",
    4: "9780743273565",
};

// Кэш в памяти
const bookCache = {};

async function fetchGoogleBooks(isbn) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].volumeInfo;
        }
        return null;
    } catch (e) {
        console.error("[Google Books] Ошибка:", e);
        return null;
    }
}

async function getBookInfo(markerId) {
    if (bookCache[markerId]) return bookCache[markerId];
    const isbn = BOOK_ISBN_MAP[markerId];
    if (!isbn) return null;
    const info = await fetchGoogleBooks(isbn);
    bookCache[markerId] = info;
    return info;
}

// Локальные данные (настроение / похожие книги)
const LOCAL_DATA = {
    0: { mood_query: "мрачная симфоническая музыка атмосфера старой Москвы", similar_books: ["Собачье сердце", "Белая гвардия"] },
    1: { mood_query: "тревожная электроника антиутопия минимализм", similar_books: ["Скотный двор", "Мы"] },
    2: { mood_query: "американский юг 1930-е джаз акустика", similar_books: ["Над пропастью во ржи"] },
    3: { mood_query: "английская классика фортепиано романтика XIX век", similar_books: ["Разум и чувства", "Джейн Эйр"] },
    4: { mood_query: "джаз эпоха джаза 1920-е Нью-Йорк", similar_books: ["Ночь нежна", "По эту сторону рая"] },
};