/**
 * Creates the extension menu when the spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('GPT Extension')
    .addItem('Показать Ассистента', 'showSidebar')
    .addSeparator()
    .addSubMenu(ui.createMenu('Инструменты')
      .addItem('Анализ Выбранных Ячеек', 'analyzeSelection')
      .addItem('Создать Сводку', 'generateSummary'))
    .addSeparator()
    .addItem('Настройки', 'showSettings')
    .addToUi();
}

/**
 * Shows the sidebar with the GPT Assistant
 */
function showSidebar() {
  if (!checkSetup()) return;
  
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('GPT Assistant')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Analyzes the currently selected cells using GPT
 */
function analyzeSelection() {
  if (!checkSetup()) return;

  const selection = SpreadsheetApp.getActiveRange();
  if (!selection) {
    SpreadsheetApp.getUi().alert('Пожалуйста, выберите ячейки для анализа.');
    return;
  }
  
  const values = selection.getValues();
  const numRows = values.length;
  const numCols = values[0].length;
  
  const prompt = `Пожалуйста, проанализируйте следующие данные из таблицы (${numRows} строк × ${numCols} столбцов):
    
${formatDataForPrompt(values)}

Предоставьте:
1. Краткий обзор данных
2. Заметные закономерности или тенденции
3. Ключевые выводы или рекомендации`;

  try {
    const analysis = callOpenAI(prompt);
    showModalDialog(analysis, 'Результаты анализа');
  } catch (error) {
    showError(error);
  }
}

/**
 * Generates a summary of the active sheet
 */
function generateSummary() {
  if (!checkSetup()) return;

  const sheet = SpreadsheetApp.getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  const prompt = `Пожалуйста, сделайте сводку данных этой таблицы:
    
Название листа: ${sheet.getName()}
Столбцы: ${headers.join(', ')}
Количество строк: ${values.length}

Пример данных (первые несколько строк):
${formatDataForPrompt(values.slice(0, 5))}

Предоставьте:
1. Краткий обзор содержимого таблицы
2. Основные категории/типы данных
3. Заметные закономерности в структуре данных`;

  try {
    const summary = callOpenAI(prompt);
    showModalDialog(summary, 'Сводка по таблице');
  } catch (error) {
    showError(error);
  }
}

/**
 * Formats spreadsheet data for better prompt readability
 * @param {Array<Array>} values - 2D array of cell values
 * @returns {string} Formatted data string
 */
function formatDataForPrompt(values) {
  return values.map(row => 
    row.map(cell => 
      cell === '' ? '(empty)' : String(cell)
    ).join(' | ')
  ).join('\n');
}

/**
 * Shows a modal dialog with formatted content
 * @param {string} content - The content to display
 * @param {string} title - The dialog title
 */
function showModalDialog(content, title) {
  const html = HtmlService.createHtmlOutput(`
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="content">${content}</div>
      </body>
    </html>
  `)
  .setWidth(600)
  .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

/**
 * Shows an error message in a modal dialog
 * @param {Error} error - The error object
 */
function showError(error) {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Ошибка', error.message, ui.ButtonSet.OK);
}

/**
 * Shows the settings dialog
 */
function showSettings() {
  const html = HtmlService.createHtmlOutputFromFile('Settings')
    .setWidth(400)
    .setHeight(300)
    .setTitle('GPT Extension Settings');
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

/**
 * Gets the OpenAI API key from Script Properties
 * @returns {string} The stored API key
 */
function getApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error(
      'API ключ не найден. Пожалуйста, добавьте OPENAI_API_KEY в настройках скрипта:\n\n' +
      '1. Откройте редактор скрипта\n' +
      '2. Перейдите в Project Settings\n' +
      '3. Во вкладке Script Properties добавьте свойство OPENAI_API_KEY'
    );
  }
  return apiKey;
}

/**
 * Checks if the extension is properly set up
 * @returns {boolean} True if API key is set, false otherwise
 */
function isSetupComplete() {
  return Boolean(PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY'));
}

/**
 * Initial setup function to guide users
 * @returns {boolean} True if setup is complete, false otherwise
 */
function checkSetup() {
  if (!isSetupComplete()) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Требуется настройка',
      'Пожалуйста, настройте API ключ OpenAI перед использованием расширения.\n\n' +
      '1. Нажмите "GPT Extension > Настройки"\n' +
      '2. Введите ваш API ключ OpenAI\n' +
      '3. Нажмите Сохранить',
      ui.ButtonSet.OK
    );
    return false;
  }
  
  if (!validateApiConnection()) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Ошибка подключения к API',
      'Произошла ошибка при подключении к OpenAI API. Пожалуйста, проверьте ваш API ключ и настройки.',
      ui.ButtonSet.OK
    );
    return false;
  }
  
  return true;
}

/**
 * Saves settings to Script Properties
 * @param {Object} settings - The settings object containing baseUrl, model, temperature, and maxTokens
 */
function saveSettings(settings) {
  if (!settings) throw new Error('Настройки не могут быть пустыми');
  
  // Use default baseUrl if not provided
  const baseUrl = settings.baseUrl?.trim() || DEFAULT_SETTINGS.baseUrl;
  const model = settings.model?.trim() || DEFAULT_SETTINGS.model;
  const temperature = settings.temperature ?? DEFAULT_SETTINGS.temperature;
  const maxTokens = settings.maxTokens ?? DEFAULT_SETTINGS.maxTokens;

  // Validate settings
  if (temperature < 0 || temperature > 1) {
    throw new Error('Температура должна быть между 0 и 1');
  }
  if (maxTokens < 150) {
    throw new Error('Максимальное количество токенов должно быть не менее 150');
  }

  PropertiesService.getScriptProperties().setProperties({
    'BASE_URL': baseUrl,
    'MODEL': model,
    'TEMPERATURE': temperature.toString(),
    'MAX_TOKENS': maxTokens.toString()
  });
}

/**
 * Gets current settings from Script Properties
 * @returns {Object} The current settings
 */
function getSettings() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    baseUrl: props.BASE_URL || DEFAULT_SETTINGS.baseUrl,
    model: props.MODEL || DEFAULT_SETTINGS.model,
    temperature: parseFloat(props.TEMPERATURE) || DEFAULT_SETTINGS.temperature,
    maxTokens: parseInt(props.MAX_TOKENS) || DEFAULT_SETTINGS.maxTokens
  };
}

/**
 * Calls the OpenAI API with the given prompt
 * @param {string} prompt - The user's prompt
 * @returns {string} The API response text
 */
function callOpenAI(prompt) {
  if (!prompt) throw new Error('Prompt cannot be empty');

  const apiKey = getApiKey();
  const settings = getSettings();
  const apiUrl = `${settings.baseUrl}/chat/completions`;
  
  const requestBody = {
    model: settings.model,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: settings.temperature,
    max_tokens: settings.maxTokens
  };

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const jsonResponse = JSON.parse(response.getContentText());
    
    Logger.log('API Response:', response.getContentText());
    
    if (response.getResponseCode() === 200) {
      return jsonResponse.choices[0].message.content;
    } else {
      throw new Error(`API Error: ${jsonResponse.error?.message || 'Unknown error occurred'}`);
    }
  } catch (error) {
    Logger.log(`Error in callOpenAI: ${error.message}`);
    throw new Error(`Failed to call OpenAI API: ${error.message}`);
  }
}

/**
 * Modified test function with setup check
 */
function testOpenAI() {
  try {
    if (!checkSetup()) {
      return 'Требуется настройка. Пожалуйста, установите API ключ в Настройках.';
    }
    const result = callOpenAI('Здравствуйте! Пожалуйста, ответьте простым приветствием.');
    Logger.log(`Результат теста: ${result}`);
    return result;
  } catch (error) {
    Logger.log(`Ошибка теста: ${error.message}`);
    return `Ошибка: ${error.message}`;
  }
}

/**
 * Validates the API connection settings
 * @returns {boolean} True if connection is valid
 */
function validateApiConnection() {
  try {
    const settings = getSettings();
    Logger.log('Current Settings:', settings);  // Log current settings
    
    // Test the API with a minimal request
    const result = callOpenAI('Test connection');
    Logger.log('Connection test result:', result);
    return true;
  } catch (error) {
    Logger.log('API Connection Error:', error.message);
    return false;
  }
}

// Add this at the top of Code.gs with other constants
const DEFAULT_SETTINGS = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000
}; 