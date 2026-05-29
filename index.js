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
        auth: 'offline'
    },
    debug: true,
};

// === ИЕРАРХИЯ РАНГОВ (ПО ПОРЯДКУ: от слабого к сильному) ===
// Более сильный ранг наследует права всех предыдущих
// У каждого ранга прописываем ТОЛЬКО НОВЫЕ доступы (которые добавляются к старым)
const RANKS = [
    { 
        name: "Premium",
        prefix: "&7&l[Premium]",
        permissions: [
            "essentials.kit.premium"
        ]
    },
    { 
        name: "Creative",
        prefix: "&a&l[Creative]",
        permissions: [
            "essentials.gamemode.creative",
            "essentials.gamemode.survival",
            "essentials.fly"
        ]
    },
    { 
        name: "Moder",
        prefix: "&e&l[Moder]",
        permissions: [
            "libertybans.mute.notify",
            "libertybans.warn",
            "essentials.kit.moder"
        ]
    },
    { 
        name: "Admin",
        prefix: "&c&l[Admin]",
        permissions: [
            "libertybans.ban",
            "libertybans.unban",
            "essentials.kit.admin",
            "essentials.gamemode"
        ]
    },
    { 
        name: "Lord",
        prefix: "&5&l[Lord]",
        permissions: [
            "essentials.kit.lord",
            "worldguard.region.claim"
        ]
    },
    { 
        name: "HeadAdmin",
        prefix: "&4&l[Гл. Админ]",
        permissions: [
            "libertybans.*",
            "worldedit.*",
            "worldguard.*"
        ]
    },
    { 
        name: "Creator",
        prefix: "&9&l[Создатель]",
        permissions: [
            "worldedit.limit.unrestricted",
            "worldguard.region.override"
        ]
    },
    { 
        name: "Founder",
        prefix: "&b&l[Основатель]",
        permissions: [
            "essentials.kit.founder",
            "essentials.god"
        ]
    },
    { 
        name: "Owner",
        prefix: "&6&l[Владелец]",
        permissions: [
            "luckperms.*",
            "essentials.*",
            "worldedit.*"
        ]
    },
    { 
        name: "Console",
        prefix: "&8&l[Консоль]",
        permissions: [
            "*"
        ]
    },
    { 
        name: "Caesar",
        prefix: "&d&l[Цезарь]",
        permissions: [
            "essentials.kit.caesar",
            "worldedit.navigation.thru"
        ]
    },
    { 
        name: "Server",
        prefix: "&e&l[Сервер]",
        permissions: [
            "essentials.kit.server"
        ]
    },
    { 
        name: "Helper",
        prefix: "&b&l[Helper]",
        permissions: [
            "libertybans.mute",
            "libertybans.warn.notify",
            "essentials.kit.helper"
        ]
    },
    { 
        name: "HYPE",
        prefix: "&6&l[HYPE]",
        permissions: [
            "essentials.kit.hype",
            "essentials.kit.donate"
        ]
    },
    { 
        name: "Staff",
        prefix: "&d&l[STAFF]",
        permissions: [
            "libertybans.*.silent",
            "luckperms.user.groups",
            "worldedit.clipboard"
        ]
    },
    { 
        name: "Ruler",
        prefix: "&r&4&l♛ &c&lПРАВИТЕЛЬ &4&l♛",
        permissions: [
            "*"
        ]
    },
];

// === ОСНОВНОЙ КОД БОТА ===
let bot = null;

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
            if (CONFIG.debug) console.log(`📝 ${command}`);
            bot.chat(command);
            resolve();
        }, delay);
    });
}

async function setupRanks() {
    console.log("🎬 НАЧАЛО НАСТРОЙКИ СИСТЕМЫ РАНГОВ (С НАСЛЕДОВАНИЕМ)");
    
    for (let i = 0; i < RANKS.length; i++) {
        const rank = RANKS[i];
        const previousRank = i > 0 ? RANKS[i-1].name : null;
        
        console.log(`\n🚀 [${i+1}/${RANKS.length}] Настройка ранга: ${rank.name}`);
        
        // 1. Создаём группу
        await sendCommand(`/lp creategroup ${rank.name}`, 500);
        
        // 2. Устанавливаем префикс
        await sendCommand(`/lp group ${rank.name} meta addprefix "${rank.prefix} "`, 1000);
        
        // 3. Устанавливаем вес (для правильной сортировки)
        await sendCommand(`/lp group ${rank.name} set weight ${i+1}`, 800);
        
        // 4. НАСЛЕДОВАНИЕ: более сильный ранг наследует предыдущий
        if (previousRank) {
            await sendCommand(`/lp group ${rank.name} parent set ${previousRank}`, 1000);
            console.log(`   ⬆ Наследует права от ${previousRank}`);
        }
        
        // 5. Выдаём НОВЫЕ права (только для этого ранга)
        for (const perm of rank.permissions) {
            await sendCommand(`/lp group ${rank.name} permission set ${perm} true`, 600);
            if (CONFIG.debug) console.log(`   ✅ + право: ${perm}`);
        }
        
        console.log(`✅ Ранг ${rank.name} полностью настроен (вес: ${i+1})`);
    }
    
    await finalizeSetup();
}

async function finalizeSetup() {
    console.log("\n🎉 ВСЕ РАНГИ УСПЕШНО СОЗДАНЫ С ПРАВИЛЬНЫМ НАСЛЕДОВАНИЕМ!");
    console.log("📊 Иерархия выстроена: каждый следующий сильнее предыдущего");
    
    await sendCommand("say Пока шлюхи, я работяга! Все ранги настроены с наследованием!", 2000);
    
    // Уходим в АФК
    bot.setControlState('sneak', true);
    await sendCommand("/afk", 1000);
    
    console.log("💤 Бот в режиме AFK. Задачи выполнены.");
    // Бот остаётся висеть на сервере
}

createBot();
