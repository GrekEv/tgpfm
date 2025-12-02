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
 * Переменные окружения (опционально, для безопасности):
 *   TELEGRAM_BOT_TOKEN - токен бота
 *   TELEGRAM_CHAT_ID - ID чата для получения сообщений
 *   PORT - порт сервера (на хостинге обычно назначается автоматически)
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Используем переменные окружения для безопасности (на хостинге)
// Для локального запуска можно использовать значения по умолчанию
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8169125582:AAHdwp0dqSn3_o2MB4EXdJzuWj4qifsrc3Y';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '467035682';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // Настройка CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка preflight запросов
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Обработка POST запросов на /send-message
    if (req.method === 'POST' && req.url === '/send-message') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
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
                const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
                const telegramData = JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
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
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Ошибка обработки ответа' }));
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
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Неверный формат данных' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log('Готов к приему заявок из формы');
});
