# Brand Asset Generator

Универсальный генератор брендовых ассетов — логотипы и иконки через Node.js Canvas API. Генерируйте высококачественные PNG/JPG логотипы и квадратные иконки программно с богатым набором визуальных стилей.

## Возможности

- **9 стилей логотипов**: gold, neon, chrome, velvet, diamond, royal, gradient, aurora, plain
- **10 стилей иконок**: diamond, spade, crown, flame, ace, coin, chip, star, clover, joker
- **3 варианта фона иконок**: прозрачный, solid (тёмный), gradient (цветной)
- **Экспорт JPG/PNG** с настраиваемым качеством
- **Автоматический размер** логотипов по длине текста
- **Кастомные шрифты** — добавьте TTF-файлы в папку `fonts/`, они загрузятся автоматически
- **TypeScript** с полными типами
- **CLI** для интерактивного и пакетного режима
- **Jest** тесты

## Установка

```bash
npm install
```

## Быстрый старт

### CLI — Интерактивный режим

```bash
npm start
```

### CLI — Пакетный режим (сгенерировать все встроенные примеры)

```bash
npm run batch
```

### CLI — Список стилей

```bash
npm run list-styles
```

### CLI — Генерация логотипа без диалога

```bash
npx ts-node src/cli/cli.ts --generate-logo --text "МОЙ БРЕНД" --color "#FFD700" --style gold
```

### CLI — Генерация иконки без диалога

```bash
npx ts-node src/cli/cli.ts --generate-icon --text "МБ" --color "#FFD700" --style crown --size 512
```

## Программный API

```typescript
import { generateLogo, generateIcon } from "./src/core/asset-generator";

// Генерация логотипа
const logo = generateLogo({ text: "МОЙ БРЕНД", color: "#FFD700", style: "gold" });
fs.writeFileSync("logo.png", logo.buffer);

// Генерация иконки
const icon = generateIcon({ text: "МБ", color: "#FFD700", style: "crown", size: 512 });
fs.writeFileSync("icon.png", icon.buffer);

// Экспорт в JPG
const jpg = generateLogo({ text: "ТЕСТ" }, { format: "jpg", quality: 85 });
fs.writeFileSync("logo.jpg", jpg.buffer);
```

## Стили логотипов

| Стиль    | Описание                                              |
|----------|-------------------------------------------------------|
| gold     | Тёплый 3D-экструдированный текст с металлическим блеском |
| neon     | Светящийся неон на тёмном фоне                        |
| chrome   | Металлический хром с яркими бликами                   |
| velvet   | Мягкая бархатная текстура                             |
| diamond  | Кристальный гранёный вид                              |
| royal    | Глубокие королевские тона                             |
| gradient | Горизонтальный цветовой градиент, без рамки           |
| aurora   | Диагональный эффект северного сияния, без рамки       |
| plain    | Только текст на прозрачном фоне                       |

## Стили иконок

`diamond`, `spade`, `crown`, `flame`, `ace`, `coin`, `chip`, `star`, `clover`, `joker`

## Кастомные шрифты

Поместите семейства шрифтов в папку `fonts/`. Каждое семейство — в отдельной подпапке:

```
fonts/
  MyFont/
    MyFont-Bold.ttf
```

Генератор автоматически найдёт и зарегистрирует шрифты при запуске.

## Примеры

```bash
npx ts-node examples/basic-logo.ts
npx ts-node examples/batch-generation.ts
npx ts-node examples/custom-styles.ts
npx ts-node examples/advanced-usage.ts
```

## Тесты

```bash
npm test
npm run test:coverage
```

## Сборка

```bash
npm run build
# Результат в dist/
npm run start:js
```

## Структура проекта

```
src/
  core/
    types.ts           — TypeScript интерфейсы и типы
    asset-generator.ts — Основная логика генерации
  utils/
    colors.ts          — Работа с цветом (hexToRgb, lighten, darken, rgba, mesh/shimmer)
    fonts.ts           — Загрузка и управление шрифтами
    export.ts          — Конвертация Canvas → Asset
  cli/
    cli.ts             — Точка входа CLI
  index.ts             — Публичный API
tests/                 — Jest тесты
examples/              — Примеры использования
fonts/                 — Папка для кастомных шрифтов
output/                — Сгенерированные файлы (в .gitignore)
```

## Лицензия

MIT
