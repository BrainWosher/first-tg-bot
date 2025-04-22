require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { gameOptions, againOptions } = require('./options');
const { TELEGRAM_BOT_TOKEN } = require('./.env');

const API_URL = 'http://localhost:3000/api/v1/users/';
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const chats = {};

// Инициализация игры
const startGame = async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply('Сейчас я загадаю число от 0 до 9. Ты должен его угадать.');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await ctx.reply('Отгадай число.', gameOptions);
};

const getAllUsers = async (ctx) => {
  try {
    const response = await axios.get(API_URL);
    const users = response.data;
    // console.log(users);
    // console.log(ctx);

    if (!users.length) return ctx.reply('Нет зарегистрированных пользователей');

    const userList = users
      .map((user) => `🆔 ID: ${user.id}\n👤 Имя: ${user.name}\n📛 Логин: ${user.username}`)
      .join('\n\n────────────────\n');

    ctx.reply(`📃 Список пользователей (всего: ${users.length}):\n\n${userList}`);
  } catch (error) {
    ctx.reply('❌ Ошибка при получении пользователей');
    console.error('API Error:', error.response?.data || error.message);
  }
};

// Обработчики команд для работы с пользователями
bot.command('get_all_users', (ctx) => getAllUsers(ctx));

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

bot.command('game', (ctx) => startGame(ctx));

bot.command('get_all_users', async (ctx) => {
  try {
    // Здесь будет логика получения пользователей
    await ctx.reply('Функционал в разработке 🛠');
  } catch (error) {
    console.error(error);
  }
});

// Обработка callback-кнопок
bot.action('/again', (ctx) => {
  ctx.deleteMessage();
  return startGame(ctx);
});

// Обработка неизвестных команд
bot.on('text', (ctx) => {
  ctx.reply('Я тебя не понимаю, попробуй еще раз!');
});

// Запуск бота
bot
  .launch()
  .then(() => console.log('Бот успешно запущен'))
  .catch((err) => console.error('Ошибка запуска:', err));

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
