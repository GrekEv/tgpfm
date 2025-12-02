/**
 * Сервер для отправки сообщений в Telegram
 * 
 * Локальный запуск:
 *   node server.js
 *   или
 *   npm run server
 * 
 * Деплой на хостинг:
 *   См. инструкцию в DEPLOY_SERVER.md
 * 
 * Переменные окружения (ОБЯЗАТЕЛЬНЫ для продакшена):
 *   TELEGRAM_BOT_TOKEN - токен бота
 *   TELEGRAM_CHAT_ID - ID чата для получения сообщений (число)
 *   PORT - порт сервера (на хостинге обычно назначается автоматически)
 *   NODE_ENV - 'production' для продакшена
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Проверяем, что мы в продакшене
const isProduction = process.env.NODE_ENV === 'production';

// Получаем переменные окружения
// В продакшене они ОБЯЗАТЕЛЬНЫ, в разработке можно использовать fallback
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID_ENV = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 3000;

// В продакшене требуем переменные окружения
if (isProduction) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('ОШИБКА: TELEGRAM_BOT_TOKEN не установлен! Установите переменную окружения.');
        process.exit(1);
    }
    if (!TELEGRAM_CHAT_ID_ENV) {
        console.error('ОШИБКА: TELEGRAM_CHAT_ID не установлен! Установите переменную окружения.');
        process.exit(1);
    }
}

// Для разработки используем fallback значения (только если не продакшен)
// ВАЖНО: Эти значения НЕ должны попадать в продакшен!
const TELEGRAM_BOT_TOKEN_FINAL = TELEGRAM_BOT_TOKEN || (isProduction ? null : '8169125582:AAHdwp0dqSn3_o2MB4EXdJzuWj4qifsrc3Y');
const TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID_ENV 
    ? parseInt(TELEGRAM_CHAT_ID_ENV, 10) 
    : (isProduction ? null : 467035682);

if (!TELEGRAM_BOT_TOKEN_FINAL || TELEGRAM_CHAT_ID === null || isNaN(TELEGRAM_CHAT_ID)) {
    console.error('ОШИБКА: Неверные настройки Telegram бота!');
    process.exit(1);
}

if (!isProduction && (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID)) {
    console.warn('⚠️  ВНИМАНИЕ: Используются захардкоженные значения для разработки.');
    console.warn('⚠️  Для продакшена ОБЯЗАТЕЛЬНО установите переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID!');
}

const server = http.createServer((req, res) => {
    // Нормализация URL (убираем query string и trailing slash)
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Логирование запросов
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${pathname}`);

    // Настройка CORS для всех запросов
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка preflight запросов (OPTIONS) - для ЛЮБОГО URL
    if (req.method === 'OPTIONS') {
        console.log(`[${timestamp}] OPTIONS request handled successfully`);
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400', // 24 часа
            'Content-Length': '0'
        });
        res.end();
        return;
    }

    // Обработка GET запросов на корень (health check)
    if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ status: 'ok', service: 'telegram-bot-server' }));
        return;
    }

    // Обработка POST запросов на /send-message
    if (req.method === 'POST' && pathname === '/send-message') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('error', (error) => {
            console.error('Ошибка чтения запроса:', error);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Ошибка обработки запроса' }));
            }
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { name, phone, message } = data;

                // Формируем текст сообщения
                const text = `📋 Новая заявка с сайта\n\n` +
                           `👤 Имя: ${name || 'Не указано'}\n` +
                           `📞 Телефон: ${phone || 'Не указано'}\n` +
                           `💬 Сообщение: ${message || 'Не указано'}\n\n` +
                           `🕐 Время: ${new Date().toLocaleString('ru-RU')}`;

                // Отправляем сообщение в Telegram
                const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN_FINAL}/sendMessage`;
                const telegramData = JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID, // Уже число после parseInt
                    text: text
                });

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(telegramData)
                    }
                };

                const telegramReq = https.request(telegramUrl, options, (telegramRes) => {
                    let telegramBody = '';

                    telegramRes.on('data', chunk => {
                        telegramBody += chunk.toString();
                    });

                    telegramRes.on('error', (error) => {
                        console.error('Ошибка чтения ответа Telegram:', error);
                        if (!res.headersSent) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Ошибка получения ответа от Telegram' }));
                        }
                    });

                    telegramRes.on('end', () => {
                        try {
                            const telegramResponse = JSON.parse(telegramBody);
                            
                            if (telegramResponse.ok) {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: true, message: 'Сообщение отправлено' }));
                            } else {
                                console.error('Telegram API ошибка:', telegramResponse);
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ 
                                    success: false, 
                                    error: telegramResponse.description || 'Ошибка отправки в Telegram' 
                                }));
                            }
                        } catch (error) {
                            console.error('Ошибка парсинга ответа Telegram:', error);
                            if (!res.headersSent) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Ошибка обработки ответа' }));
                            }
                        }
                    });
                });

                telegramReq.on('error', (error) => {
                    console.error('Ошибка запроса к Telegram:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Ошибка соединения с Telegram' }));
                });

                telegramReq.write(telegramData);
                telegramReq.end();

            } catch (error) {
                console.error('Ошибка парсинга данных:', error);
                if (!res.headersSent) {
                    res.writeHead(400, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, error: 'Неверный формат данных' }));
                }
            }
        });
        return;
    }
    
    // Все остальные запросы - 404
    console.log(`[${timestamp}] 404 - Method: ${req.method}, Path: ${pathname}`);
    res.writeHead(404, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Ожидаю запросы на http://0.0.0.0:${PORT}`);
    console.log('Готов к приему заявок из формы');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
