# История изменений

Все значимые изменения в проекте документируются здесь.

## [2.0.0] - 2026-03-31

### Добавлено
- Полный рефакторинг в модульную структуру `src/`
- `src/core/types.ts` — централизованные TypeScript-интерфейсы и типы
- `src/utils/colors.ts` — утилиты работы с цветом (`hexToRgb`, `lighten`, `darken`, `rgba`, `drawMeshGradient`, `drawMetalShimmer`)
- `src/utils/fonts.ts` — загрузка и управление шрифтами
- `src/utils/export.ts` — утилиты `canvasToAsset` и `getFileExtension`
- `src/core/asset-generator.ts` — рефакторинг основного генератора с обновлёнными сигнатурами
- `src/cli/cli.ts` — обновлённый CLI с командами `--list-styles`, `--generate-logo`, `--generate-icon`
- `src/index.ts` — чистый публичный API
- Интерфейс `ExportOptions` (`format`, `quality`) для `generateLogo` и `generateIcon`
- Поддержка экспорта JPG через `canvasToAsset`
- Новые стили логотипов: `gradient` (горизонтальный градиент, без рамки), `aurora` (диагональный aurora-эффект, без рамки), `plain` (только текст на прозрачном фоне)
- Фон иконок: параметр `bgFill: "solid" | "gradient"`
- Меню выбора рамки в CLI: с рамкой / без рамки / только текст / ручной выбор / полностью случайный
- Поддержка текста с пробелами в подписи иконок (автоматическое уменьшение шрифта)
- Jest тесты (`tests/logo.test.ts`, `tests/icon.test.ts`, `tests/colors.test.ts`, `tests/fonts.test.ts`)
- Примеры использования (`examples/basic-logo.ts`, `examples/batch-generation.ts`, `examples/custom-styles.ts`, `examples/advanced-usage.ts`)
- `CHANGELOG.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `SECURITY.md`, `LICENSE`, `.gitignore`

### Изменено
- Пакет переименован: `casino-asset-generator` → `brand-asset-generator`
- `Asset.mimeType` теперь поддерживает `"image/png" | "image/jpeg"`
- Все сообщения CLI переведены на русский язык

### Сохранено
- `src/casino-generator.ts` — оригинальный монолитный файл не тронут
- `src/cli.ts` — оригинальный CLI не тронут
- Вся логика рендеринга (функции `_logo*`, `_icon*`, `_sym*`) полностью сохранена

## [1.0.0] - Первый релиз

- Генератор логотипов и иконок
- 6 стилей логотипов, 10 стилей иконок
- Интерактивный CLI с пакетным режимом
- Поддержка кастомных шрифтов через папку `fonts/`
