# Drawing Tools - Инструменты рисования

TradingVue.js теперь включает полный набор инструментов рисования в стиле TradingView.

## Доступные инструменты

### 🖌️ Кисть (BrushTool)
Свободное рисование с различными режимами:
- **Brush** - обычная кисть
- **Pencil** - тонкий карандаш (1px)
- **Marker** - толстый маркер (5px)
- **Highlighter** - полупрозрачный маркер (10px, opacity 0.3)

```javascript
// Добавление кисти на график
{
    type: 'BrushTool',
    name: 'Brush',
    data: [],
    settings: {
        mode: 'brush', // 'pencil', 'marker', 'highlighter'
        lineWidth: 2,
        color: '#2962ff',
        points: [[timestamp1, price1], [timestamp2, price2], ...]
    }
}
```

### 📏 Линии

#### Trend Line (SegmentTool)
Наклонная линия тренда с двумя точками.

#### Horizontal Line (HorizontalLine)
Горизонтальная линия уровня с ценовой меткой.

```javascript
{
    type: 'HorizontalLine',
    settings: {
        p1: [timestamp, price],
        lineWidth: 1.5,
        color: '#2962ff',
        dashed: false
    }
}
```

#### Vertical Line (VerticalLine)
Вертикальная линия времени.

```javascript
{
    type: 'VerticalLine',
    settings: {
        p1: [timestamp, price],
        lineWidth: 1.5,
        color: '#2962ff',
        dashed: false
    }
}
```

### 🔷 Геометрические фигуры

#### Rectangle (RectangleTool)
Прямоугольник с опциями заливки и текста.

```javascript
{
    type: 'RectangleTool',
    settings: {
        p1: [timestamp1, price1],
        p2: [timestamp2, price2],
        lineWidth: 1.5,
        color: '#2962ff',
        filled: false,
        fillColor: '#2962ff33',
        withText: false,
        text: 'Label'
    }
}
```

#### Circle (CircleTool)
Круг/эллипс.

```javascript
{
    type: 'CircleTool',
    settings: {
        p1: [timestamp1, price1],
        p2: [timestamp2, price2],
        filled: false,
        withText: false
    }
}
```

#### Triangle (TriangleTool)
Треугольник.

```javascript
{
    type: 'TriangleTool',
    settings: {
        p1: [timestamp1, price1],
        p2: [timestamp2, price2],
        filled: false
    }
}
```

### 📝 Текст и аннотации

#### Text Tool (TextTool)
Текстовая метка.

```javascript
{
    type: 'TextTool',
    settings: {
        p1: [timestamp, price],
        text: 'Note',
        fontSize: 14,
        bold: false,
        color: '#ffffff',
        bgColor: '#1e2224cc'
    }
}
```

#### Arrow (ArrowTool)
Стрелка направления.

```javascript
{
    type: 'ArrowTool',
    settings: {
        p1: [timestamp1, price1],
        p2: [timestamp2, price2],
        lineWidth: 2,
        color: '#2962ff',
        headLength: 15,
        double: false // Двусторонняя стрелка
    }
}
```

#### Callout (CalloutTool)
Выноска/заметка с облачком.

```javascript
{
    type: 'CalloutTool',
    settings: {
        p1: [timestamp1, price1], // Точка привязки
        p2: [timestamp2, price2], // Позиция облачка
        text: 'Note',
        color: '#ffd600',
        bgColor: '#1e2224'
    }
}
```

## DrawingToolbar Component

Панель инструментов для выбора инструментов рисования.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| activeTool | String | 'cursor' | Активный инструмент |
| currentColor | String | '#2962ff' | Текущий цвет |
| currentWidth | Number | 2 | Толщина линии |
| vertical | Boolean | true | Вертикальная ориентация |
| showColorPicker | Boolean | true | Показать выбор цвета |
| showWidthSlider | Boolean | true | Показать слайдер толщины |
| night | Boolean | true | Тёмная тема |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| tool-select | { type, settings } | Выбор инструмента |
| color-change | color | Изменение цвета |
| width-change | width | Изменение толщины |
| undo | - | Отмена |
| redo | - | Повтор |
| clear-all | - | Очистить все |

### Использование

```vue
<template>
    <drawing-toolbar
        :active-tool="activeTool"
        :current-color="color"
        :current-width="lineWidth"
        @tool-select="onToolSelect"
        @color-change="color = $event"
        @clear-all="clearDrawings"
    />
</template>

<script>
import DrawingToolbar from 'trading-vue-js'

export default {
    components: { DrawingToolbar },
    data() {
        return {
            activeTool: 'cursor',
            color: '#2962ff',
            lineWidth: 2
        }
    },
    methods: {
        onToolSelect({ type, settings }) {
            // Активировать инструмент
            this.activeTool = type
        }
    }
}
</script>
```

## Группы инструментов

```
├── Cursor (Курсор/Выделение)
├── Lines (Линии)
│   ├── Trend Line
│   ├── Horizontal Line
│   └── Vertical Line
├── Drawing (Рисование)
│   ├── Brush (Кисть)
│   ├── Pencil (Карандаш)
│   ├── Marker (Маркер)
│   └── Highlighter (Подчёркиватель)
├── Shapes (Фигуры)
│   ├── Rectangle
│   ├── Circle
│   └── Triangle
├── Text (Текст)
│   ├── Text Label
│   ├── Arrow
│   └── Callout
└── Measure (Измерение)
    └── Price/Time Range
```

## Модификации инструментов

Каждый инструмент имеет модификации (mods), доступные через контекстное меню:

```javascript
// RectangleTool mods
mods: {
    'Filled': {
        icon: '▮',
        settings: { filled: true }
    },
    'With Text': {
        icon: '▣',
        settings: { withText: true }
    }
}
```

## Цветовая палитра

По умолчанию доступны 12 цветов:
- #2962ff (синий)
- #ff1744 (красный)
- #00c853 (зелёный)
- #ffea00 (жёлтый)
- #aa00ff (фиолетовый)
- #00b8d4 (голубой)
- #ff6d00 (оранжевый)
- #f50057 (розовый)
- #64dd17 (лайм)
- #00e5ff (циан)
- #d500f9 (пурпурный)
- #ffffff (белый)

## Горячие клавиши

При активном инструменте:
- **Delete / Backspace** - удалить выбранный объект
- **Escape** - отменить рисование
- **Shift** - привязка к углам (для линий)

## Сохранение рисунков

Рисунки сохраняются в DataCube:

```javascript
const dc = new DataCube({
    chart: { ... },
    onchart: [
        // Индикаторы
    ],
    offchart: [
        // Осцилляторы
    ],
    drawings: [
        // Рисунки
        {
            type: 'RectangleTool',
            settings: { ... }
        }
    ]
})
```

## Пример полного использования

```vue
<template>
<div class="chart-container">
    <drawing-toolbar
        :active-tool="tool"
        @tool-select="tool = $event.type"
        @color-change="color = $event"
    />

    <trading-vue
        :data="chart"
        :overlays="drawingTools"
        :width="800"
        :height="500"
    />
</div>
</template>

<script>
import TradingVue, {
    DataCube, DrawingToolbar,
    BrushTool, RectangleTool, CircleTool,
    HorizontalLine, VerticalLine, TextTool
} from 'trading-vue-js'

export default {
    components: { TradingVue, DrawingToolbar },
    data() {
        return {
            chart: new DataCube({ ... }),
            tool: 'cursor',
            color: '#2962ff',
            drawingTools: [
                BrushTool, RectangleTool, CircleTool,
                HorizontalLine, VerticalLine, TextTool
            ]
        }
    }
}
</script>
```
