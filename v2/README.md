Prompt: genera una aplicacion que recibe los valores de questionnaire.json y con base a ellos renderiza en el html todos los elementos. esta aplicacion debe tener su propio archivo json donde quede el diseño personalizado de todos los elemento en el html, de forma que si mas adelante se recarga la pagina html, se consulta primero si existe el json con el diseño personalizado y se renderiza, en caso de no existir, se renderiza a partir del archivo questionnaire.json. esta aplicacion debe permitir realizar drag and drop. agrupar varios elementos en una misma fila o un elemento en una sola fila, cuando el elemento en el json personlizado esta visible, mostrar o ocultar el elemento del html. tener un boton de guardar donde se genera el json con el diseño personalizado. boton para exportar el json del diseño personalizado o para importalo


# Editor de Formularios Dinámicos

Una aplicación web que permite crear y personalizar formularios de manera visual mediante drag and drop, basada en archivos JSON de configuración.

## Características

- **Renderizado dinámico**: Lee elementos desde `questionnaire.json` y los renderiza en HTML
- **Diseño personalizado**: Guarda configuraciones personalizadas en `custom-layout.json`
- **Drag and Drop**: Arrastra elementos para reorganizar el formulario
- **Agrupación flexible**: Agrupa varios elementos en una fila o mantén elementos individuales
- **Visibilidad**: Muestra/oculta elementos dinámicamente
- **Persistencia**: Guarda, exporta e importa diseños personalizados
- **Modo dual**: Alterna entre modo edición y modo vista

## Estructura de Archivos

```
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── styles.css         # Estilos CSS
├── server.js          # Servidor local (Node.js)
├── questionnaire.json # Configuración base del formulario
├── custom-layout.json # Diseño personalizado (generado)
└── README.md          # Este archivo
```

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