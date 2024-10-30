# GPT Расширение для Google Sheets 🚀

Мощное расширение для интеграции возможностей GPT в ваши Google таблицы.

## 🌟 Основные возможности

- 🔄 Прямая интеграция с OpenAI API
- 📊 Встроенное меню "GPT Extension" в Google Sheets
- 💬 Удобная боковая панель для взаимодействия с GPT
- ⚙️ Настраиваемые параметры модели:
  - URL API (поддержка совместимых с OpenAI API моделей)
  - Выбор модели (GPT-4, GPT-3.5-Turbo и другие)
  - Настройка температуры генерации (0-1)
  - Установка максимального количества токенов

## 📋 Функциональность

### Меню расширения
- **Показать ассистента** - открывает боковую панель для работы с GPT
- **Инструменты**:
  - Анализ выбранных ячеек
  - Генерация сводки данных
- **Настройки** - конфигурация API и параметров модели

### Боковая панель
- Интуитивно понятный интерфейс
- Поле для ввода запросов
- Отображение ответов модели
- Индикация процесса обработки запроса

### Панель настроек
- Настройка базового URL API
- Выбор модели из предустановленных вариантов или ввод пользовательской
- Регулировка температуры генерации
- Установка лимита токенов

## 🛠 Установка

1. Откройте [Google Apps Script](https://script.google.com)
2. Создайте новый проект
3. Добавьте следующие файлы:
   - `Code.gs` - основной скрипт
   - `Sidebar.html` - интерфейс боковой панели
   - `Settings.html` - панель настроек
   - `appsscript.json` - конфигурация проекта
4. Настройте ключ API OpenAI в свойствах скрипта

## 🔑 Настройка API

```javascript
// Установка ключа API
function setApiKey() {
  const apiKey = 'ваш-ключ-api';
  PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', apiKey);
}
```

## 💡 Использование

1. Откройте Google таблицу
2. Найдите меню "GPT Extension" в верхней панели
3. Выберите "Показать ассистента" для открытия боковой панели
4. Введите ваш запрос и получите ответ от GPT

## ⚙️ Структура проекта

```
gpt-google-sheets-extension/
│
├── appsscript.json          # Файл конфигурации
├── Code.gs                  # Основной скрипт
├── Sidebar.html            # UI боковой панели
├── Settings.html           # UI настроек
└── README.md               # Документация
```

## 🤝 Вклад в проект

Мы приветствуем ваш вклад в развитие проекта! Для участия:

1. Форкните репозиторий
2. Создайте ветку для ваших изменений
3. Внесите изменения и создайте коммиты
4. Отправьте pull request

## 📝 Лицензия

MIT License

## 🔗 Полезные ссылки

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)

## 📞 Поддержка

При возникновении вопросов или проблем создайте issue в репозитории проекта.

---
⭐️ Если вам понравился проект, не забудьте поставить звезду! 