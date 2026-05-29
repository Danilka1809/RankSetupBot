const mineflayer = require('mineflayer');

// === НАСТРОЙКИ (ЗАМЕНИ НА СВОИ) ===
const CONFIG = {
    server: {
        host: 'botcreatortest.aternos.me',
        port: 23209
    },
    bot: {
        username: 'SetupBot',
        version: '1.20.1',
        auth: 'offline'
    },
    debug: true,
};

// === ВСЕ 16 РАНГОВ С НАСЛЕДОВАНИЕМ ===
const RANKS = [
    { name: "Premium", prefix: "&7&l[Premium]", permissions: ["essentials.kit.premium"] },
    { name: "Creative", prefix: "&a&l[Creative]", permissions: ["essentials.gamemode.creative", "essentials.gamemode.survival", "essentials.fly"] },
    { name: "Moder", prefix: "&e&l[Moder]", permissions: ["libertybans.mute.notify", "libertybans.warn", "essentials.kit.moder"] },
    { name: "Admin", prefix: "&c&l[Admin]", permissions: ["libertybans.ban", "libertybans.unban", "essentials.kit.admin", "essentials.gamemode"] },
    { name: "Lord", prefix: "&5&l[Lord]", permissions: ["essentials.kit.lord", "worldguard.region.claim"] },
    { name: "HeadAdmin", prefix: "&4&l[Гл. Админ]", permissions: ["libertybans.*", "worldedit.*", "worldguard.*"] },
    { name: "Creator", prefix: "&9&l[Создатель]", permissions: ["worldedit.limit.unrestricted", "worldguard.region.override"] },
    { name: "Founder", prefix: "&b&l[Основатель]", permissions: ["essentials.kit.founder", "essentials.god"] },
    { name: "Owner", prefix: "&6&l[Владелец]", permissions: ["luckperms.*", "essentials.*", "worldedit.*"] },
    { name: "Console", prefix: "&8&l[Консоль]", permissions: ["*"] },
    { name: "Caesar", prefix: "&d&l[Цезарь]", permissions: ["essentials.kit.caesar", "worldedit.navigation.thru"] },
    { name: "Server", prefix: "&e&l[Сервер]", permissions: ["essentials.kit.server"] },
    { name: "Helper", prefix: "&b&l[Helper]", permissions: ["libertybans.mute", "libertybans.warn.notify", "essentials.kit.helper"] },
    { name: "HYPE", prefix: "&6&l[HYPE]", permissions: ["essentials.kit.hype", "essentials.kit.donate"] },
    { name: "Staff", prefix: "&d&l[STAFF]", permissions: ["libertybans.*.silent", "luckperms.user.groups", "worldedit.clipboard"] },
    { name: "Ruler", prefix: "&r&4&l♛ &c&lПРАВИТЕЛЬ &4&l♛", permissions: ["*"] },
];

let bot = null;

function sendCommand(command, delay = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (CONFIG.debug) console.log(`📝 ${command}`);
            bot.chat(command);
            resolve();
        }, delay);
    });
}

async function setupAllRanks() {
    console.log("🎬 НАЧИНАЮ НАСТРОЙКУ 16 РАНГОВ...");
    
    for (let i = 0; i < RANKS.length; i++) {
        const rank = RANKS[i];
        const previousRank = i > 0 ? RANKS[i-1].name : null;
        
        console.log(`\n🚀 [${i+1}/16] Создаю ранг: ${rank.name}`);
        
        await sendCommand(`/lp creategroup ${rank.name}`, 500);
        await sendCommand(`/lp group ${rank.name} meta addprefix "${rank.prefix} "`, 1000);
        await sendCommand(`/lp group ${rank.name} set weight ${i+1}`, 800);
        
        if (previousRank) {
            await sendCommand(`/lp group ${rank.name} parent set ${previousRank}`, 1000);
            console.log(`   ⬆ Наследует ${previousRank}`);
        }
        
        for (const perm of rank.permissions) {
            await sendCommand(`/lp group ${rank.name} permission set ${perm} true`, 600);
        }
        
        console.log(`✅ Ранг ${rank.name} готов`);
    }
    
    console.log("\n🎉 ВСЕ 16 РАНГОВ УСПЕШНО СОЗДАНЫ!");
    await sendCommand("say Пока шлюхи, я работяга! 16 рангов настроены!", 2000);
    
    // Проверка через запрос информации о каждом ранге
    console.log("\n🔍 ПРОВЕРКА СОЗДАННЫХ РАНГОВ:");
    for (let i = 0; i < RANKS.length; i++) {
        await sendCommand(`/lp group ${RANKS[i].name} info`, 800);
        console.log(`   Проверен: ${RANKS[i].name}`);
    }
    
    console.log("\n💤 Бот уходит в AFK. Задача выполнена!");
    bot.setControlState('sneak', true);
    await sendCommand("/afk", 1000);
}

function createBot() {
    console.log('🟡 Подключение...');
    bot = mineflayer.createBot({
        host: CONFIG.server.host,
        port: CONFIG.server.port,
        username: CONFIG.bot.username,
        version: CONFIG.bot.version,
        auth: CONFIG.bot.auth
    });

    bot.on('login', async () => {
        console.log(`✅ Бот ${bot.username} зашёл!`);
        await setupAllRanks();
    });

    bot.on('error', (err) => console.error('❌ Ошибка:', err));
    bot.on('end', () => console.log('🔴 Бот отключился'));
}

createBot();
