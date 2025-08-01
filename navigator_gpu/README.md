# WebGPU Navigator Dump

Этот проект создает детальный дамп `navigator.gpu.requestAdapter` и извлекает основные свойства `GPUAdapter` для анализа возможностей браузера и GPU.

## Описание

Проект состоит из двух основных компонентов:

1. **`index.html`** - Интерактивная веб-страница с пользовательским интерфейсом для создания дампа WebGPU API
2. **`webgpu-detailed-dump.js`** - Детальный JavaScript класс для программного анализа WebGPU API

## Возможности

### Основные функции:
- ✅ Проверка доступности WebGPU в браузере
- ✅ Тестирование `navigator.gpu.requestAdapter` с различными опциями
- ✅ Извлечение основных свойств `GPUAdapter`:
  - `features` - поддерживаемые функции
  - `limits` - аппаратные ограничения
  - `isFallbackAdapter` - является ли адаптер резервным
  - `info` - информация о вендоре и архитектуре

### Тестируемые опции requestAdapter:
- `powerPreference: 'low-power'` / `'high-performance'`
- `forceFallback: true` / `false`
- `featureLevel: 'compatibility'`
- `xrCompatible: true`
- Комбинированные опции

### Извлекаемые данные GPUAdapter:
- **features**: массив поддерживаемых WebGPU функций
- **limits**: объект с аппаратными ограничениями (maxTextureDimension1D, maxStorageBufferBindingSize, etc.)
- **isFallbackAdapter**: boolean, указывающий является ли адаптер резервным (software)
- **info**: объект с информацией о вендоре, архитектуре, устройстве и описании

## Использование

### Веб-интерфейс

1. Откройте `index.html` в браузере с поддержкой WebGPU
2. Нажмите кнопки для выполнения различных тестов:
   - **"Dump navigator.gpu"** - основной анализ WebGPU API и извлечение свойств адаптера
   - **"Dump Adapter Info"** - детальная информация об адаптере через свойство `info`
   - **"Clear All"** - очистка результатов

### Программное использование

```javascript
// Создание экземпляра дампера
const dumper = new WebGPUDumper();

// Полный анализ
const report = await dumper.generateFullReport();
console.log(JSON.stringify(report, null, 2));

// Только анализ navigator.gpu
const gpuDump = await dumper.dumpNavigatorGPU();
```

## Требования

- Браузер с поддержкой WebGPU (Chrome 113+, Edge 113+, Firefox Nightly)
- JavaScript ES2017+ (async/await)

## Структура проекта

```
navigator_gpu/
├── index.html              # Основная веб-страница
├── webgpu-detailed-dump.js # Детальный класс анализа
└── README.md              # Документация
```

## Примеры вывода

### Базовый дамп navigator.gpu:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "webgpuAvailable": true,
  "navigatorGPU": {
    "available": true,
    "requestAdapter": "function",
    "requestAdapterFunction": "function requestAdapter() { [native code] }"
  },
  "adapterTests": [...]
}
```

### Свойства GPUAdapter:
```json
{
  "features": ["float32-blendable", "texture-compression-bc"],
  "limits": {
    "maxTextureDimension1D": 16384,
    "maxTextureDimension2D": 16384,
    "maxStorageBufferBindingSize": 134217728,
    "maxBindGroups": 4,
    "maxBindingsPerBindGroup": 640
  },
  "isFallbackAdapter": false,
  "info": {
    "vendor": "nvidia",
    "architecture": "turing",
    "device": "0x8644",
    "description": "NVIDIA GeForce GTX 1660 SUPER"
  }
}
```

## API Reference

### navigator.gpu.requestAdapter(options)
Возвращает `Promise<GPUAdapter>` с основными свойствами:

- **features**: `GPUSupportedFeatures` - поддерживаемые функции
- **limits**: `GPUSupportedLimits` - аппаратные ограничения  
- **isFallbackAdapter**: `boolean` - является ли резервным адаптером
- **info**: `Promise<GPUAdapterInfo>` - информация о вендоре и архитектуре

### GPUAdapterInfo
- **vendor**: `string` - вендор GPU
- **architecture**: `string` - архитектура GPU
- **device**: `string` - идентификатор устройства
- **description**: `string` - описание GPU

## Основано на

Данный проект основан на официальной спецификации WebGPU и документации из Context7:
- WebGPU API Specification
- WebGPU Fundamentals
- Adapter Identifiers Design

## Лицензия

MIT License - свободное использование для любых целей. 