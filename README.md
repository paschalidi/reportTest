## Установка
### Предварительно требования
[Node](https://nodejs.org/en/download/), [NPM](https://docs.npmjs.com/getting-started/installing-node)

### Установка зависимостей
`npm install`

## Окружение
Береться из файла .env из корня проекта, где:
APP - url тестируемого приложения
SECURITY_APP - url до сервиса security
LOGIN - логин пользователя
PASSWORD - пароль пользователя

## Запуск имеющихся тестов
Либо `npm test`
Либо `npm run test`
Результаты выполнения кладутся в папку ./output

## Генерация отчета
Для генерации отчета требуется выполнить `npm run report`
Сгенерированный отчет будет находиться в папке ./allure-report

Запуск тестов в _debug_ режиме (вывод расширенных логов)
`npm run debug`

## Описание тестов
[Док](https://docs.google.com/spreadsheets/d/1X_vyyGFs41l-fmbrPtBxhroN_i7p6Mj4G0YTz8ojQCM/edit#gid=847301551)