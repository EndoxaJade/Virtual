// js/quotes.js

const CITATY_URL_MAP = {
    0: "https://citaty.info/book/dzhonatan-straud/pustaya-mogila",
    1: "https://citaty.info/book/dzhordzh-oruell/1984/short",
    2: "https://citaty.info/book/harper-li/ubit-peresmeshnika",
    3: "https://citaty.info/book/dzhein-ostin/gordost-i-predubezhdenie",
    4: "https://citaty.info/book/frensis-skott-ficdzherald/velikii-getsbi/short",
};

const quotesCache = {};

// Использование бесплатного CORS-прокси (corsproxy.io)
// Формат: https://corsproxy.io/?url=<URL-с-кодировкой>
function proxify(url) {
    return `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
}

async function fetchQuotesFromCitaty(bookId) {
    const targetUrl = CITATY_URL_MAP[bookId];
    if (!targetUrl) return [];

    try {
        const resp = await fetch(proxify(targetUrl), {
            headers: { "Accept-Language": "ru-RU,ru;q=0.9" }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const html = await resp.text();

        // Парсинг HTML (используем DOMParser браузера)
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Селекторы citaty.info (при изменении структуры сайта требуют обновления)
        const blocks = doc.querySelectorAll("div.quote, div.views-row");
        const quotes = [];
        blocks.forEach(block => {
            const textEl = block.querySelector(
                ".quote-text, .field-name-field-quote, .views-field-field-quote-text, .text"
            );
            if (textEl) {
                const text = textEl.textContent.trim();
                if (text.length > 20) quotes.push(text);
            }
        });

        // Дедупликация
        return [...new Set(quotes)];
    } catch (e) {
        console.error("[Citaty] Ошибка парсинга:", e);
        return [];
    }
}

async function getRandomQuote(bookId) {
    if (!quotesCache[bookId]) {
        quotesCache[bookId] = await fetchQuotesFromCitaty(bookId);
    }
    const quotes = quotesCache[bookId];
    if (quotes.length === 0) return "Цитаты не найдены (проверьте селекторы парсера)";
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function refreshQuote(bookId) {
    const quotes = quotesCache[bookId];
    if (!quotes || quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
}
