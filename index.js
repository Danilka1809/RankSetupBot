const mineflayer = require('mineflayer');

// ===== НАСТРОЙКИ (ТЫ МЕНЯЕШЬ ЗДЕСЬ) =====
const CONFIG = {
    server: {
        host: 'botcreatortest.aternos.me',  // ЗАМЕНИ НА IP ТВОЕГО СЕРВЕРА
        port:  23209
    },
    bot: {
        username: 'RankBot',              // Ник бота
        version: '1.20.1'
    },
    debug: true
};

// ===== ИЕРАРХИЯ РАНГОВ (ОТ СЛАБОГО К СИЛЬНОМУ) =====
const RANKS = [
    { name: "Премиум",   prefix: "&7[&eПрем&7] ",   weight: 1 },
    { name: "Креатив",   prefix: "&7[&aКреат&7] ",  weight: 2 },
    { name: "Хелпер",    prefix: "&7[&3Хелпер&7] ", weight: 3 },
    { name: "Модер",     prefix: "&7[&9Модер&7] ",  weight: 4 },
    { name: "Лорд",      prefix: "&7[&6Лорд&7] ",   weight: 5 },
    { name: "Админ",     prefix: "&7[&cАдмин&7] ",  weight: 6 },
    { name: "Гл.Админ",  prefix: "&7[&4Гл.Админ&7] ", weight: 7 },
    { name: "Цезарь",    prefix: "&7[&5Цезарь&7] ", weight: 8 },
    { name: "Основатель",prefix: "&7[&dОснователь&7] ", weight: 9 },
    { name: "Создатель", prefix: "&7[&bСоздатель&7] ", weight: 10 },
    { name: "Владелец",  prefix: "&7[&2Владелец&7] ", weight: 11 },
    { name: "Правитель", prefix: "&7[&c♛ Правитель ♛&7] ", weight: 12 }
];

// ===== ОСНОВНАЯ ЛОГИКА =====
let bot = null;
let currentIndex = 0;
let createdRanks = [];
let failedRanks = [];

function createBot() {
    console.log('🟡 Подключение к серверу...');
    
    bot = mineflayer.createBot({
        host: CONFIG.server.host,
        port: CONFIG.server.port,
        username: CONFIG.bot.username,
        version: CONFIG.bot.version,
        auth: 'offline'
    });

    bot.on('login', () => {
        console.log(`✅ Бот ${CONFIG.bot.username} зашёл на сервер!`);
        setTimeout(startSetup, 3000);
    });

    bot.on('chat', (username, message) => {
        if (CONFIG.debug) console.log(`💬 [${username}]: ${message}`);
    });

    bot.on('error', (err) => console.error('❌ Ошибка:', err));
    
    bot.on('end', () => {
        console.log('🔴 Бот отключился');
        // Если не всё создано и не было ошибок — переподключаемся
        if (currentIndex < RANKS.length && failedRanks.length === 0) {
            console.log('🟡 Переподключение...');
            setTimeout(createBot, 5000);
        }
    });
}

function startSetup() {
    console.log('🚀 НАЧИНАЮ НАСТРОЙКУ РАНГОВ...');
    console.log(`📋 Всего рангов: ${RANKS.length}`);
    setupNextRank();
}

function setupNextRank() {
    if (currentIndex >= RANKS.length) {
        // ВСЕ РАНГИ СОЗДАНЫ — ПРОВЕРЯЕМ И ФИНИШИРУЕМ
        verifyAndFinish();
        return;
    }
    
    const rank = RANKS[currentIndex];
    console.log(`[${currentIndex+1}/${RANKS.length}] Создаю ранг: ${rank.name} (вес: ${rank.weight})`);
    
    // Отправляем команды на создание и настройку
    bot.chat(`/lp creategroup ${rank.name}`);
    
    setTimeout(() => {
        bot.chat(`/lp group ${rank.name} set weight ${rank.weight}`);
    }, 500);
    
    setTimeout(() => {
        bot.chat(`/lp group ${rank.name} meta addprefix "${rank.prefix}"`);
    }, 1000);
    
    // Ждём 2 секунды и переходим к следующему
    setTimeout(() => {
        createdRanks.push(rank.name);
        currentIndex++;
        setupNextRank();
    }, 2000);
}

function verifyAndFinish() {
    console.log('🔍 ПРОВЕРЯЮ СОЗДАННЫЕ РАНГИ...');
    
    // Проверка: запрашиваем информацию о каждой группе
    let checkIndex = 0;
    
    function checkNext() {
        if (checkIndex >= createdRanks.length) {
            finishSetup();
            return;
        }
        
        const rankName = createdRanks[checkIndex];
        console.log(`Проверяю ранг: ${rankName}`);
        bot.chat(`/lp group ${rankName} info`);
        
        setTimeout(() => {
            checkIndex++;
            checkNext();
        }, 1500);
    }
    
    checkNext();
}

function finishSetup() {
    console.log('🎉 ВСЕ РАНГИ УСПЕШНО СОЗДАНЫ И НАСТРОЕНЫ!');
    console.log(`✅ Создано рангов: ${createdRanks.length}`);
    console.log(`❌ Ошибок: ${failedRanks.length}`);
    
    // Пишем в чат финальное сообщение
    bot.chat('Пока шлюхи, я работяга');
    
    // Уходим в АФК (бот остаётся на сервере)
    setTimeout(() => {
        console.log('💤 Бот уходит в АФК. Остаётся на сервере.');
        bot.chat('/afk');  // если есть плагин AFK
        bot.setControlState('sneak', true);  // приседаем (визуально)
    }, 2000);
    
    // Бот НЕ ОТКЛЮЧАЕТСЯ, остаётся висеть
}

// ===== ЗАПУСК =====
createBot();
