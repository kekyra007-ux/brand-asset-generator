# Участие в разработке

## Добавление нового стиля логотипа

1. Добавьте название стиля в `LogoStyle` в файле `src/core/types.ts`:
   ```typescript
   export type LogoStyle = "gold" | "neon" | ... | "my-new-style";
   ```

2. Добавьте его в `LOGO_STYLES` (и при необходимости в `LOGO_STYLES_FRAMED` или `LOGO_STYLES_FRAMELESS`) в `src/core/asset-generator.ts`.

3. Добавьте ветку в `buildFaceGradient()` — как выглядит лицевая грань текста.

4. При необходимости обработайте новый стиль в `_logoBg()` для кастомного фона.

5. При необходимости обработайте в `_logoBorder()` и `_logoDecorations()`.

6. Добавьте пример в `src/cli/cli.ts` → массив `BATCH_LOGOS`.

7. Добавьте тест в `tests/logo.test.ts`.

## Добавление нового стиля иконки

1. Добавьте название стиля в `IconStyle` в файле `src/core/types.ts`.

2. Добавьте его в `ICON_STYLES` в `src/core/asset-generator.ts`.

3. Создайте функцию `_symMyStyle(ctx, cx, cy, r, color)` в `src/core/asset-generator.ts`.

4. Добавьте ветку `case "my-style":` в `_iconSymbol()`.

5. Добавьте пример в `src/cli/cli.ts` → массив `BATCH_ICONS`.

6. Добавьте тест в `tests/icon.test.ts`.

## Запуск тестов

```bash
npm test
npm run test:coverage
```

## Стиль кода

- Включён TypeScript strict mode — никаких `any`
- Вся логика рендеринга остаётся в `src/core/asset-generator.ts`
- Утилиты работы с цветом — в `src/utils/colors.ts`
- Утилиты работы со шрифтами — в `src/utils/fonts.ts`

## Pull Request

1. Сделайте форк репозитория
2. Создайте ветку: `git checkout -b feature/my-new-style`
3. Зафиксируйте изменения с понятным описанием коммита
4. Откройте PR с описанием того, как выглядит новый стиль
