require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { TELEGRAM_BOT_TOKEN } = require('./.env');

const API_URL = 'http://localhost:3000/api/v1/tasks/';
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.telegram.setMyCommands([
  { command: 'start', description: 'Initial welcome' },
  { command: 'info', description: 'User info' },
  { command: 'get_all_tasks', description: 'All tasks' },
]);

const getAllTasks = async (ctx) => {
  try {
    const response = await axios.get(API_URL);
    const tasks = response.data;
    console.log(tasks);
    console.log(ctx);

    if (!tasks.length) return ctx.reply('Нет задач');

    const taskList = tasks
      .map(
        (task) =>
          `🆔 ID: ${task.id}\n👤 Название: ${task.name}\n📛 Описание: ${task.username}\n🫡 Статус: ${task.state}`,
      )
      .join('\n\n────────────────\n');

    ctx.reply(`📃 Список задач (всего: ${tasks.length}):\n\n${taskList}`);
  } catch (error) {
    ctx.reply('❌ Ошибка при получении задач');
    console.error('API Error:', error.response?.data || error.message);
  }
};

// Обработчики команд для работы с пользователями
bot.command('get_all_tasks', (ctx) => getAllTasks(ctx));

// Обработчики команд
bot.start(async (ctx) => {
  await ctx.replyWithSticker(
    'https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/192/6.webp',
  );
  await ctx.reply('Добро пожаловать!');
});

bot.command('info', (ctx) => {
  const user = ctx.from;

  return ctx.reply(`Тебя зовут ${user.first_name} ${user.last_name || ''}`);
});

// Обработка неизвестных команд
bot.on('text', (ctx) => {
  ctx.reply('Я тебя не понимаю, попробуй еще раз!');
});

// Запуск бота
bot.launch();
console.log('🤖 Бот запущен!');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
