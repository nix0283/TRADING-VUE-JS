# Timeframe Selector - Интеграция в TradingVue.js

## ✅ Что было добавлено

### Новые компоненты

| Компонент | Файл | Описание |
|-----------|------|----------|
| `TFSelector` | `src/components/TFSelector.vue` | Полный селектор с группами кнопок |
| `TFSelectorDropdown` | `src/components/TFSelectorDropdown.vue` | Компактный выпадающий селектор |

### Обновлённые файлы

| Файл | Изменения |
|------|-----------|
| `src/index.js` | Добавлен экспорт TFSelector и TFSelectorDropdown |
| `src/TradingVue.vue` | Добавлены props для встроенного селектора |
| `src/stuff/constants.js` | Расширен MAP_UNIT, добавлен TIMEFRAME_GROUPS |

---

## 📊 Поддерживаемые таймфреймы

| Категория | Таймфреймы |
|-----------|------------|
| **Секунды** | `1s`, `5s`, `15s`, `30s` |
| **Минуты** | `1`, `2`, `3`, `5`, `10`, `15`, `20`, `30`, `45` |
| **Часы** | `1H`, `2H`, `3H`, `4H`, `6H`, `8H`, `12H` |
| **Дни** | `1D`, `2D`, `3D` |
| **Недели** | `1W`, `2W` |
| **Месяцы** | `1M`, `3M`, `6M`, `12M`, `1Y` |

---

## 🚀 Использование

### Вариант 1: Встроенный селектор (рекомендуется)

```vue
<template>
  <trading-vue
    :data="chart"
    :timeframes="true"
    :timeframe="currentTimeframe"
    timeframe-style="dropdown"
    @timeframe-change="onTimeframeChange"
  />
</template>

<script>
export default {
  data() {
    return {
      currentTimeframe: '1D',
      chart: { /* ... */ }
    }
  },
  methods: {
    onTimeframeChange(tf) {
      // Загрузите данные для нового таймфрейма
      this.loadChartData(tf)
      this.currentTimeframe = tf
    }
  }
}
</script>
```

### Вариант 2: Отдельный компонент

```vue
<template>
  <trading-vue :data="chart" ref="tv" />
  <tf-selector
    v-model="timeframe"
    :night="true"
    :extended="true"
    @change="onTFChange"
  />
</template>

<script>
import { TFSelector } from 'trading-vue-js'

export default {
  components: { TFSelector },
  methods: {
    onTFChange(tf) {
      this.$refs.tv.resetChart()
    }
  }
}
</script>
```

---

## ⚙️ Props

### TradingVue (новые)

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `timeframes` | Boolean | `false` | Показывать селектор таймфреймов |
| `timeframe` | String | `'1D'` | Текущий таймфрейм |
| `timeframeStyle` | String | `'dropdown'` | Стиль: `'full'` или `'dropdown'` |
| `timeframeExtended` | Boolean | `false` | Показать расширенный набор |
| `showSecondsTF` | Boolean | `false` | Показать секундные таймфреймы |

### TFSelector

| Prop | Тип | По умолчанию |
|------|-----|--------------|
| `value` / `v-model` | String | `'1D'` |
| `night` | Boolean | `true` |
| `showSeconds` | Boolean | `false` |
| `extended` | Boolean | `false` |

### TFSelectorDropdown

| Prop | Тип | По умолчанию |
|------|-----|--------------|
| `value` / `v-model` | String | `'1D'` |
| `night` | Boolean | `true` |

---

## 📡 Events

| Event | Параметр | Описание |
|-------|----------|----------|
| `timeframe-change` | `tf: string` | Смена таймфрейма (встроенный) |
| `change` | `tf: string` | Смена таймфрейма (отдельный компонент) |
| `input` | `tf: string` | v-model обновление |

---

## 🔥 Горячие клавиши

| Клавиша | Таймфрейм |
|---------|-----------|
| `1` | 1 минута |
| `3` | 3 минуты |
| `5` | 5 минут |
| `H` | 1 час |
| `4` | 4 часа |
| `D` | День |
| `W` | Неделя |
| `M` | Месяц |

---

## 🧪 Тестирование

```bash
cd trading-vue-js
npm install
npm run test
```

Выберите тесты:
- **TimeframesDemo** — демо отдельных компонентов
- **TimeframesIntegrated** — встроенный селектор

---

## 📁 Структура файлов

```
src/
├── components/
│   ├── TFSelector.vue          # Полный селектор
│   └── TFSelectorDropdown.vue  # Выпадающий селектор
├── TradingVue.vue              # Главный компонент (обновлён)
├── index.js                    # Экспорт (обновлён)
└── stuff/
    └── constants.js            # Константы (обновлён)

test/tests/
├── TimeframesDemo.vue          # Демо отдельных компонентов
└── TimeframesIntegrated.vue    # Демо встроенного селектора

docs/guide/
└── TFSELECTOR.md               # Документация
```
