const mineflayer = require('mineflayer');

// === НАСТРОЙКИ ПОДКЛЮЧЕНИЯ (ЗАМЕНИ НА СВОИ) ===
const CONFIG = {
    server: {
        host: 'botcreatortest.aternos.me',  // СЮДА IP твоего Aternos сервера
        port: 23209,
    },
    bot: {
        username: 'SetupBot',            // Ник бота (должен быть свободен)
        version: '1.20.1',
        auth: 'offline'                  // Для Aternos обычно 'offline'
    },
    debug: true, // Показывать все действия в логах GitHub
};

// === ИЕРАРХИЯ РАНГОВ (ОТ СЛАБОГО К СИЛЬНОМУ) ===
// Твой полный список из 16 рангов. Для каждого указаны:
// - name: внутреннее имя группы (для LuckPerms)
// - prefix: префикс, как у тебя
// - weight: вес (1 — слабый, 16 — сильный)
// - permissions: МАССИВ КОНКРЕТНЫХ ПРАВ, которые получит эта группа
const RANKS = [
    {   name: "Premium",
        prefix: "&7&l[Premium]",
        weight: 1,
        permissions: [ "essentials.kit.premium" ]
    },
    {   name: "Creative",
        prefix: "&a&l[Creative]",
        weight: 2,
        permissions: [ "essentials.gamemode.creative", "essentials.gamemode.survival" ] // /gm 1 и /gm 0
    },
    {   name: "Moder",
        prefix: "&e&l[Moder]",
        weight: 3,
        permissions: [ "libertybans.mute.notify", "libertybans.warn" ]
    },
    {   name: "Admin",
        prefix: "&c&l[Admin]",
        weight: 4,
        permissions: [ "libertybans.ban", "libertybans.unban", "essentials.kit.admin" ]
    },
    {   name: "Lord",
        prefix: "&5&l[Lord]",
        weight: 5,
        permissions: [ "essentials.kit.lord" ]
    },
    {   name: "HeadAdmin",
        prefix: "&4&l[Гл. Админ]",
        weight: 6,
        permissions: [ "libertybans.*", "worldedit.*" ]
    },
    {   name: "Creator",
        prefix: "&9&l[Создатель]",
        weight: 7,
        permissions: [ "worldedit.limit.unrestricted" ]
    },
    {   name: "Founder",
        prefix: "&b&l[Основатель]",
        weight: 8,
        permissions: [ "essentials.kit.founder" ]
    },
    {   name: "Owner",
        prefix: "&6&l[Владелец]",
        weight: 9,
        permissions: [ "luckperms.*", "essentials.*" ]
    },
    {   name: "Console",
        prefix: "&8&l[Консоль]",
        weight: 10,
        permissions: [ "*" ] // Полный доступ
    },
    {   name: "Caesar",
        prefix: "&d&l[Цезарь]",
        weight: 11,
        permissions: [ "essentials.kit.caesar" ]
    },
    {   name: "Server",
        prefix: "&e&l[Сервер]",
        weight: 12,
        permissions: []
    },
    {   name: "Helper",
        prefix: "&b&l[Helper]",
        weight: 13,
        permissions: [ "libertybans.mute", "libertybans.warn.notify", "essentials.kit.helper" ]
    },
    {   name: "HYPE",
        prefix: "&6&l[HYPE]",
        weight: 14,
        permissions: [ "essentials.kit.hype" ]
    },
    {   name: "Staff",
        prefix: "&d&l[STAFF]",
        weight: 15,
        permissions: [ "libertybans.*.silent", "luckperms.user.groups" ]
    },
    {   name: "Ruler",
        prefix: "&r&4&l♛ &c&lПРАВИТЕЛЬ &4&l♛",
        weight: 16,
        permissions: [ "*" ] // Полный доступ ко всем командам
    },
];

// === ОСНОВНОЙ КОД БОТА (НЕ МЕНЯТЬ) ===
let bot = null;
let currentRankIndex = 0;

function createBot() {
    console.log('🟡 Запуск бота-установщика...');
    bot = mineflayer.createBot({
        host: CONFIG.server.host,
        port: CONFIG.server.port,
        username: CONFIG.bot.username,
        version: CONFIG.bot.version,
        auth: CONFIG.bot.auth
    });

    bot.on('login', () => {
        console.log(`✅ Бот ${bot.username} зашел на сервер!`);
        setTimeout(startSetup, 4000);
    });

    bot.on('error', (err) => console.error('❌ Ошибка бота:', err));
    bot.on('end', () => console.log('🔴 Бот отключился от сервера'));
}

function sendCommand(command, delay = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (CONFIG.debug) console.log(`📝 Отправка команды: ${command}`);
            bot.chat(command);
            resolve();
        }, delay);
    });
}

async function setupRank(rank) {
    console.log(`\n🚀 Настройка ранга: ${rank.name} (вес: ${rank.weight})`);
    
    await sendCommand(`/lp creategroup ${rank.name}`, 500);
    await sendCommand(`/lp group ${rank.name} set weight ${rank.weight}`, 1000);
    await sendCommand(`/lp group ${rank.name} meta addprefix "${rank.prefix} "`, 1000);
    
    for (const perm of rank.permissions) {
        await sendCommand(`/lp group ${rank.name} permission set ${perm} true`, 800);
    }
    
    if (rank.name === "Ruler") {
        await sendCommand(`/lp group ${rank.name} meta addmeta "Особый-ранг" "Лимитированная привилегия. Полный доступ."`, 800);
    }
    
    console.log(`✅ Ранг ${rank.name} настроен.`);
}

async function startSetup() {
    console.log("🎬 НАЧАЛО НАСТРОЙКИ СИСТЕМЫ РАНГОВ (16 шт)");
    for (const rank of RANKS) {
        await setupRank(rank);
    }
    await finalizeSetup();
}

async function finalizeSetup() {
    console.log("\n🎉 ВСЕ РАНГИ УСПЕШНО СОЗДАНЫ И НАСТРОЕНЫ!");
    await sendCommand("Пока шлюхи, я работяга", 2000);
    bot.setControlState('sneak', true);
    await sendCommand("/afk", 1000);
    console.log("💤 Бот в режиме AFK. Можно закрыть вкладку Actions.");
}

createBot();
