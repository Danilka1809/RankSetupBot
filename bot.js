const mineflayer = require('mineflayer');
const mc = require('minecraftstatuspinger');
const fs = require('fs');

// === НАСТРОЙКИ ===
const CONFIG = {
    server: {
        host: 'ТВОЙ_СЕРВЕР.aternos.me',  // ЗАМЕНИ НА IP
        port: 25565
    },
    bot: {
        username: 'StatusBot',
        version: '1.20.1',
        auth: 'offline'
    },
    debug: true
};

let bot = null;

// === ФУНКЦИЯ ПРОВЕРКИ СЕРВЕРА ===
async function checkServer() {
    try {
        const result = await mc.lookup({
            host: CONFIG.server.host,
            port: CONFIG.server.port,
            ping: true,
            timeout: 5000
        });
        
        const status = {
            online: true,
            players: result.players?.online || 0,
            maxPlayers: result.players?.max || 0,
            version: result.version?.name || "Unknown",
            motd: result.description?.text || result.description || "No MOTD",
            latency: result.latency || 0,
            lastUpdate: new Date().toISOString()
        };
        
        fs.writeFileSync('public/status.json', JSON.stringify(status, null, 2));
        console.log(`✅ Сервер онлайн: ${status.players}/${status.maxPlayers} игроков`);
        return status;
    } catch (err) {
        const offlineStatus = {
            online: false,
            error: err.message,
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync('public/status.json', JSON.stringify(offlineStatus, null, 2));
        console.log(`❌ Сервер оффлайн: ${err.message}`);
        return offlineStatus;
    }
}

// === БОТ ДЛЯ ЧАТА ===
function createChatBot() {
    console.log('🟡 Запуск чат-бота...');
    
    bot = mineflayer.createBot({
        host: CONFIG.server.host,
        port: CONFIG.server.port,
        username: CONFIG.bot.username,
        version: CONFIG.bot.version,
        auth: CONFIG.bot.auth
    });

    bot.on('login', () => {
        console.log(`✅ Бот ${bot.username} зашёл на сервер!`);
        // Пишем приветствие
        setTimeout(() => {
            bot.chat('🤖 Статус-бот активирован! Информация о сервере доступна на сайте.');
        }, 3000);
    });

    bot.on('chat', (username, message) => {
        // Можно добавить команды для бота
        if (message === '!статус' || message === '!status') {
            const status = JSON.parse(fs.readFileSync('public/status.json'));
            if (status.online) {
                bot.chat(`📊 Онлайн: ${status.players}/${status.maxPlayers} | Пинг: ${status.latency}ms`);
            } else {
                bot.chat(`❌ Сервер оффлайн. Последняя проверка: ${status.lastUpdate}`);
            }
        }
    });

    bot.on('end', () => {
        console.log('🔴 Чат-бот отключился, переподключение через 10 сек...');
        setTimeout(createChatBot, 10000);
    });
}

// === ЗАПУСК ВСЕГО ===
async function main() {
    // Первая проверка
    await checkServer();
    
    // Проверка каждую минуту
    setInterval(checkServer, 60000);
    
    // Запуск чат-бота
    createChatBot();
}

main();
