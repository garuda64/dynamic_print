Prompt: genera una aplicacion que recibe los valores de questionnaire.json y con base a ellos renderiza en el html todos los elementos. esta aplicacion debe tener su propio archivo json donde quede el diseño personalizado de todos los elemento en el html, de forma que si mas adelante se recarga la pagina html, se consulta primero si existe el json con el diseño personalizado y se renderiza, en caso de no existir, se renderiza a partir del archivo questionnaire.json. esta aplicacion debe permitir realizar drag and drop. agrupar varios elementos en una misma fila o un elemento en una sola fila, cuando el elemento en el json personlizado esta visible, mostrar o ocultar el elemento del html. tener un boton de guardar donde se genera el json con el diseño personalizado. boton para exportar el json del diseño personalizado o para importalo


# Editor de Formularios Dinámicos v2

## Descripción
Editor visual de formularios dinámicos que permite crear, editar y visualizar formularios basados en archivos JSON. Ahora incluye funcionalidad para cargar automáticamente datos de respuesta desde un archivo JSON.

## Características Principales

### ✨ Nuevas Funcionalidades
- **Carga Automática de Datos**: Los valores del archivo `response.json` se asignan automáticamente a los elementos correspondientes del formulario
- **Indicadores Visuales**: Los elementos que tienen datos cargados se muestran con un borde verde y fondo destacado
- **Botón de Recarga**: Permite recargar manualmente los datos desde `response.json`

### 🎯 Funcionalidades Existentes
- Drag & Drop para organizar elementos del formulario
- Editor visual con vista previa en tiempo real
- Modo edición/vista para alternar entre diseño y visualización
- Guardado y carga de diseños personalizados
- Importación/exportación de configuraciones
- Panel de propiedades para personalizar elementos
- Grilla visual opcional para alineación precisa

## Archivos Principales

- `index.html` - Interfaz principal del editor
- `app.js` - Lógica principal de la aplicación
- `styles.css` - Estilos CSS
- `questionnaire.json` - Definición de elementos del formulario
- `custom-layout.json` - Configuración del diseño personalizado
- `response.json` - **NUEVO**: Datos de respuesta que se cargan automáticamente
- `server.js` - Servidor HTTP simple para desarrollo

## Cómo Usar la Carga Automática de Datos

### 1. Formato del archivo response.json
El archivo debe contener un objeto JSON donde las claves corresponden a los nombres de los elementos del formulario:

```json
{
    "Nombre del Centro Notificador": "Hospital General",
    "Fecha": "2025-05-28",
    "name": "Centro Médico ABC",
    "question1": "Juan Pérez García",
    "CURP": "PEGJ850315HDFRRN09",
    "question2": "Agencia Central",
    "question3": "Accidente de tránsito",
    "question4": "Fractura en brazo derecho",
    "question6": "Dr. María González",
    "question7": 12345678
}
```

### 2. Carga Automática
- Los datos se cargan automáticamente al inicializar la aplicación
- Los elementos que reciben datos se marcan visualmente con:
  - Borde izquierdo verde
  - Fondo ligeramente verde
  - Etiqueta en color verde

### 3. Recarga Manual
- Usa el botón "Cargar Datos" en la barra superior para recargar los datos
- Útil cuando se modifica el archivo `response.json`

## Instalación y Uso

### Opción 1: Servidor Node.js (Recomendado)

1. Asegúrate de tener Node.js instalado
2. Abre una terminal en el directorio del proyecto
3. Ejecuta el servidor:
   ```bash
   node server.js
   ```
4. Abre tu navegador en `http://localhost:3000`

### Opción 2: Servidor HTTP alternativo

Si tienes Python instalado:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego abre `http://localhost:8000`

## Funcionalidades

### Panel de Elementos
- Lista todos los elementos disponibles desde `questionnaire.json`
- Permite mostrar/ocultar elementos individualmente
- Arrastra elementos al canvas para agregarlos al formulario

### Canvas de Diseño
- Área principal donde se construye el formulario
- Soporte para múltiples filas
- Drag and drop para reorganizar elementos
- Selección de elementos y filas para edición

### Panel de Propiedades
- Muestra propiedades del elemento seleccionado
- Permite modificar estilos y configuraciones
- Acciones rápidas (eliminar, duplicar, etc.)

### Controles Principales

- **Guardar Diseño**: Guarda la configuración actual
- **Exportar**: Descarga el archivo JSON del diseño
- **Importar**: Carga un diseño desde archivo JSON
- **Resetear**: Vuelve a la configuración original
- **Modo Vista/Edición**: Alterna entre modos

## Estructura del JSON

### questionnaire.json
```json
{
    "title": "Título del Formulario",
    "pages": [
        {
            "name": "page1",
            "elements": [
                {
                    "type": "text",
                    "name": "campo1",
                    "title": "Título del Campo",
                    "placeholder": "Texto de ejemplo"
                }
            ]
        }
    ]
}
```

### custom-layout.json
```json
{
    "elements": [
        {
            "name": "campo1",
            "visible": true,
            "width": "50%"
        }
    ],
    "rows": [
        {
            "id": "row-1",
            "elements": ["campo1", "campo2"]
        }
    ]
}
```

## Tipos de Elementos Soportados

- **text**: Campos de texto
- **comment**: Áreas de texto (textarea)
- **panel**: Contenedores agrupadores
- **dropdown**: Listas desplegables
- **radiogroup**: Grupos de radio buttons
- **checkbox**: Casillas de verificación
- **rating**: Sistemas de calificación
- **matrix**: Tablas de datos
- **html**: Contenido HTML personalizado
- **image**: Elementos de imagen

## Atajos de Teclado

- `Ctrl + S`: Guardar diseño
- `Delete`: Eliminar elemento seleccionado
- `Ctrl + Z`: Deshacer (próximamente)

## Personalización

### Estilos CSS
Los estilos están organizados en variables CSS en `styles.css`:
```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    /* ... más variables */
}
```

### Extensión de Funcionalidades
La clase `FormBuilder` en `app.js` puede extenderse para agregar:
- Nuevos tipos de elementos
- Validaciones personalizadas
- Integraciones con APIs
- Funcionalidades de colaboración

## Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsive design para dispositivos móviles
- Soporte para touch en dispositivos táctiles

## Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Prueba en diferentes navegadores
5. Envía un pull request

## Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

## Soporte

Para reportar bugs o solicitar features, crea un issue en el repositorio del proyecto.