class FormBuilder {
    constructor() {
        this.questionnaire = null;
        this.customLayout = null;
        this.selectedElement = null;
        this.draggedElement = null;
        this.isEditMode = true;
        this.elementCounter = 0;
        
        this.init();
    }

    async init() {
        try {
            await this.loadQuestionnaire();
            await this.loadCustomLayout();
            await this.loadResponseData();
            this.setupEventListeners();
            this.renderElements();
            this.renderCanvas();
            
            // Esperar a que el canvas se renderice completamente antes de cargar valores
            setTimeout(() => {
                this.loadValuesIntoFormWhenReady();
            }, 1000);
            
            this.updateStatus('Aplicación cargada correctamente');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.updateStatus('Error al cargar la aplicación', 'error');
        }
    }

    async loadQuestionnaire() {
        try {
            const response = await fetch('questionnaire.json');
            this.questionnaire = await response.json();
            document.getElementById('formTitle').textContent = this.questionnaire.title || 'Formulario';
        } catch (error) {
            console.error('Error al cargar questionnaire.json:', error);
            throw error;
        }
    }

    async loadCustomLayout() {
        try {
            const response = await fetch('custom-layout.json');
            if (response.ok) {
                this.customLayout = await response.json();
                this.updateStatus('Diseño personalizado cargado');
            }
        } catch (error) {
            console.log('No se encontró diseño personalizado, usando configuración por defecto');
            this.customLayout = null;
        }
    }

    async loadResponseData() {
        try {
            const response = await fetch('response.json');
            if (response.ok) {
                this.responseData = await response.json();
                this.updateStatus('Datos de respuesta cargados correctamente', 'success');
            } else {
                this.updateStatus('No se pudo cargar response.json', 'warning');
            }
        } catch (error) {
            this.updateStatus('Error al cargar response.json', 'error');
        }
    }

    setupEventListeners() {
        // Controles del header
        document.getElementById('toggleMode').addEventListener('click', () => this.toggleMode());
        document.getElementById('saveLayout').addEventListener('click', () => this.saveLayout());
        document.getElementById('exportLayout').addEventListener('click', () => this.exportLayout());
        document.getElementById('importBtn').addEventListener('click', () => this.importLayout());
        document.getElementById('importLayout').addEventListener('change', (e) => this.handleImport(e));
        document.getElementById('resetLayout').addEventListener('click', () => this.resetLayout());
        document.getElementById('loadResponseData').addEventListener('click', () => this.reloadResponseData());
        
        // Controles del canvas
        document.getElementById('addRow').addEventListener('click', () => this.addRow());
        
        // Configuración
        document.getElementById('showGrid').addEventListener('change', (e) => this.toggleGrid(e.target.checked));
        document.getElementById('snapToGrid').addEventListener('change', (e) => this.toggleSnapToGrid(e.target.checked));
        
        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        
        // Canvas drag and drop
        this.setupCanvasDragAndDrop();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupCanvasDragAndDrop() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleCanvasDrop(e);
        });
    }

    renderElements() {
        const elementsList = document.getElementById('elementsList');
        elementsList.innerHTML = '';
        
        if (!this.questionnaire || !this.questionnaire.pages) return;
        
        this.questionnaire.pages.forEach(page => {
            this.renderPageElements(page.elements, elementsList);
        });
        
        this.updateElementCount();
    }

    renderPageElements(elements, container) {
        elements.forEach(element => {
            const elementDiv = this.createElementItem(element);
            container.appendChild(elementDiv);
            
            // Si es un panel, renderizar sus elementos hijos
            if (element.elements) {
                this.renderPageElements(element.elements, container);
            }
        });
    }

    createElementItem(element) {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.draggable = true;
        div.dataset.elementData = JSON.stringify(element);
        
        const isVisible = this.isElementVisible(element.name);
        if (!isVisible) {
            div.classList.add('hidden');
        }
        
        const icon = this.getElementIcon(element.type);
        const title = element.title || element.name || element.placeholder || 'Sin título';
        
        div.innerHTML = `
            <i class="fas ${icon}"></i>
            <span class="element-title">${title}</span>
            <i class="element-visibility fas ${isVisible ? 'fa-eye' : 'fa-eye-slash'}" 
               title="${isVisible ? 'Ocultar' : 'Mostrar'}" 
               data-element-name="${element.name}"></i>
        `;
        
        // Event listeners
        div.addEventListener('dragstart', (e) => this.handleDragStart(e, element));
        div.addEventListener('dragend', () => this.handleDragEnd());
        
        const visibilityBtn = div.querySelector('.element-visibility');
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleElementVisibility(element.name);
        });
        
        return div;
    }

    getElementIcon(type) {
        const icons = {
            'text': 'fa-font',
            'comment': 'fa-comment-alt',
            'panel': 'fa-layer-group',
            'dropdown': 'fa-chevron-down',
            'radiogroup': 'fa-dot-circle',
            'checkbox': 'fa-check-square',
            'rating': 'fa-star',
            'matrix': 'fa-table',
            'html': 'fa-code',
            'image': 'fa-image'
        };
        return icons[type] || 'fa-square';
    }

    isElementVisible(elementName) {
        if (!this.customLayout || !this.customLayout.elements) return true;
        const customElement = this.customLayout.elements.find(el => el.name === elementName);
        return customElement ? customElement.visible !== false : true;
    }

    toggleElementVisibility(elementName) {
        if (!this.customLayout) {
            this.customLayout = { elements: [], rows: [] };
        }
        
        let customElement = this.customLayout.elements.find(el => el.name === elementName);
        if (!customElement) {
            customElement = { name: elementName, visible: true };
            this.customLayout.elements.push(customElement);
        }
        
        customElement.visible = !customElement.visible;
        
        this.renderElements();
        this.renderCanvas();
        this.updateStatus(`Elemento ${customElement.visible ? 'mostrado' : 'ocultado'}`);
    }

    handleDragStart(e, element) {
        this.draggedElement = element;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(element));
        
        // Agregar clase visual
        e.target.classList.add('dragging');
    }

    handleDragEnd() {
        // Remover clases visuales
        document.querySelectorAll('.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        
        this.draggedElement = null;
    }

    handleCanvasDrop(e) {
        const elementData = e.dataTransfer.getData('text/plain');
        if (!elementData) return;
        
        const element = JSON.parse(elementData);
        const dropZone = document.getElementById('dropZone');
        
        // Si no hay filas, crear la primera
        if (dropZone.children.length === 1) { // Solo tiene el mensaje
            this.addRow();
        }
        
        // Buscar la fila más cercana al punto de drop
        const rows = document.querySelectorAll('.form-row');
        const lastRow = rows[rows.length - 1];
        
        if (lastRow) {
            this.addElementToRow(lastRow, element);
        }
    }

    addRow() {
        const dropZone = document.getElementById('dropZone');
        const message = dropZone.querySelector('.drop-zone-message');
        if (message) message.style.display = 'none';
        
        const row = document.createElement('div');
        row.className = 'form-row';
        row.dataset.rowId = `row-${Date.now()}`;
        
        row.innerHTML = `
            <div class="form-row-controls">
                <button class="row-control-btn btn-danger" onclick="formBuilder.removeRow(this)" title="Eliminar fila">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="row-control-btn btn-info" onclick="formBuilder.duplicateRow(this)" title="Duplicar fila">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        
        this.setupRowDragAndDrop(row);
        dropZone.appendChild(row);
        
        this.updateStatus('Nueva fila agregada');
        return row;
    }

    setupRowDragAndDrop(row) {
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            row.classList.add('drag-over');
        });
        
        row.addEventListener('dragleave', (e) => {
            if (!row.contains(e.relatedTarget)) {
                row.classList.remove('drag-over');
            }
        });
        
        row.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            row.classList.remove('drag-over');
            
            const elementData = e.dataTransfer.getData('text/plain');
            if (elementData) {
                const element = JSON.parse(elementData);
                this.addElementToRow(row, element);
            }
        });
        
        row.addEventListener('click', (e) => {
            if (e.target === row) {
                this.selectRow(row);
            }
        });
    }

    addElementToRow(row, elementData) {
        if (!this.isElementVisible(elementData.name)) {
            this.updateStatus('No se puede agregar un elemento oculto', 'warning');
            return;
        }
        
        const elementDiv = this.createFormElement(elementData);
        row.appendChild(elementDiv);
        
        this.updateStatus(`Elemento "${elementData.title || elementData.name}" agregado`);
        this.saveToCustomLayout();
    }

    createFormElement(elementData) {
        const div = document.createElement('div');
        div.className = 'form-element';
        div.dataset.elementName = elementData.name;
        div.dataset.elementType = elementData.type;
        
        const icon = this.getElementIcon(elementData.type);
        const title = elementData.title || elementData.name || elementData.placeholder || 'Sin título';
        
        let inputHtml = '';
        switch (elementData.type) {
            case 'text':
                const inputType = elementData.inputType || 'text';
                inputHtml = `<input type="${inputType}" class="element-input" placeholder="${elementData.placeholder || ''}" ${this.isEditMode ? 'readonly' : ''}>`;
                break;
            case 'comment':
                inputHtml = `<textarea class="element-input element-textarea" placeholder="${elementData.placeholder || ''}" ${this.isEditMode ? 'readonly' : ''}></textarea>`;
                break;
            case 'panel':
                inputHtml = `<div class="panel-content">Panel: ${title}</div>`;
                break;
            default:
                inputHtml = `<input type="text" class="element-input" placeholder="${elementData.placeholder || ''}" ${this.isEditMode ? 'readonly' : ''}>`;
        }
        
        div.innerHTML = `
            <div class="element-controls">
                <button class="element-control-btn btn-warning" onclick="formBuilder.editElement(this)" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="element-control-btn btn-danger" onclick="formBuilder.removeElement(this)" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="element-label">
                <i class="fas ${icon}"></i>
                ${title}
            </div>
            ${inputHtml}
        `;
        
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(div);
        });
        
        return div;
    }

    selectElement(element) {
        // Remover selección anterior
        document.querySelectorAll('.form-element.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        element.classList.add('selected');
        this.selectedElement = element;
        this.showElementProperties(element);
    }

    selectRow(row) {
        // Remover selección anterior
        document.querySelectorAll('.form-row.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        row.classList.add('selected');
        this.showRowProperties(row);
    }

    showElementProperties(element) {
        const propertiesContent = document.getElementById('propertiesContent');
        const elementName = element.dataset.elementName;
        const elementType = element.dataset.elementType;
        
        propertiesContent.innerHTML = `
            <div class="property-group">
                <h4><i class="fas fa-info-circle"></i> Información del Elemento</h4>
                <div class="property-field">
                    <label>Nombre:</label>
                    <input type="text" value="${elementName}" readonly>
                </div>
                <div class="property-field">
                    <label>Tipo:</label>
                    <input type="text" value="${elementType}" readonly>
                </div>
            </div>
            
            <div class="property-group">
                <h4><i class="fas fa-paint-brush"></i> Estilo</h4>
                <div class="property-field">
                    <label>Ancho:</label>
                    <select onchange="formBuilder.updateElementStyle('${elementName}', 'width', this.value)">
                        <option value="auto">Automático</option>
                        <option value="25%">25%</option>
                        <option value="50%">50%</option>
                        <option value="75%">75%</option>
                        <option value="100%">100%</option>
                    </select>
                </div>
                <div class="property-field">
                    <label>Visible:</label>
                    <input type="checkbox" ${this.isElementVisible(elementName) ? 'checked' : ''} 
                           onchange="formBuilder.toggleElementVisibility('${elementName}')">
                </div>
            </div>
            
            <div class="property-group">
                <h4><i class="fas fa-cogs"></i> Acciones</h4>
                <button class="btn btn-danger btn-sm" onclick="formBuilder.removeElement(formBuilder.selectedElement)">
                    <i class="fas fa-trash"></i> Eliminar Elemento
                </button>
            </div>
        `;
    }

    showRowProperties(row) {
        const propertiesContent = document.getElementById('propertiesContent');
        const rowId = row.dataset.rowId;
        
        propertiesContent.innerHTML = `
            <div class="property-group">
                <h4><i class="fas fa-info-circle"></i> Información de la Fila</h4>
                <div class="property-field">
                    <label>ID de Fila:</label>
                    <input type="text" value="${rowId}" readonly>
                </div>
                <div class="property-field">
                    <label>Elementos:</label>
                    <input type="text" value="${row.querySelectorAll('.form-element').length}" readonly>
                </div>
            </div>
            
            <div class="property-group">
                <h4><i class="fas fa-cogs"></i> Acciones</h4>
                <button class="btn btn-primary btn-sm" onclick="formBuilder.addRow()">
                    <i class="fas fa-plus"></i> Agregar Nueva Fila
                </button>
                <button class="btn btn-info btn-sm" onclick="formBuilder.duplicateRow(row)">
                    <i class="fas fa-copy"></i> Duplicar Fila
                </button>
                <button class="btn btn-danger btn-sm" onclick="formBuilder.removeRow(row)">
                    <i class="fas fa-trash"></i> Eliminar Fila
                </button>
            </div>
        `;
    }

    updateElementStyle(elementName, property, value) {
        const element = document.querySelector(`[data-element-name="${elementName}"]`);
        if (element) {
            element.style[property] = value;
            this.saveToCustomLayout();
            this.updateStatus(`Estilo actualizado: ${property} = ${value}`);
        }
    }

    editElement(button) {
        const element = button.closest('.form-element');
        this.selectElement(element);
    }

    removeElement(elementOrButton) {
        const element = elementOrButton.classList ? elementOrButton : elementOrButton.closest('.form-element');
        const elementName = element.dataset.elementName;
        
        this.showModal(
            'Confirmar Eliminación',
            `¿Estás seguro de que quieres eliminar el elemento "${elementName}"?`,
            () => {
                element.remove();
                this.saveToCustomLayout();
                this.updateStatus(`Elemento "${elementName}" eliminado`);
                this.clearProperties();
            }
        );
    }

    removeRow(buttonOrRow) {
        const row = buttonOrRow.classList ? buttonOrRow : buttonOrRow.closest('.form-row');
        const elementCount = row.querySelectorAll('.form-element').length;
        
        this.showModal(
            'Confirmar Eliminación',
            `¿Estás seguro de que quieres eliminar esta fila? Se eliminarán ${elementCount} elemento(s).`,
            () => {
                row.remove();
                this.saveToCustomLayout();
                this.updateStatus('Fila eliminada');
                this.clearProperties();
            }
        );
    }

    duplicateRow(buttonOrRow) {
        const row = buttonOrRow.classList ? buttonOrRow : buttonOrRow.closest('.form-row');
        const newRow = row.cloneNode(true);
        newRow.dataset.rowId = `row-${Date.now()}`;
        
        // Actualizar IDs de elementos duplicados
        newRow.querySelectorAll('.form-element').forEach(element => {
            const originalName = element.dataset.elementName;
            const newName = `${originalName}_copy_${Date.now()}`;
            element.dataset.elementName = newName;
        });
        
        this.setupRowDragAndDrop(newRow);
        row.parentNode.insertBefore(newRow, row.nextSibling);
        
        this.saveToCustomLayout();
        this.updateStatus('Fila duplicada');
    }

    clearProperties() {
        const propertiesContent = document.getElementById('propertiesContent');
        propertiesContent.innerHTML = '<p class="no-selection">Selecciona un elemento para ver sus propiedades</p>';
        this.selectedElement = null;
    }

    renderCanvas() {
        const dropZone = document.getElementById('dropZone');
        const message = dropZone.querySelector('.drop-zone-message');
        
        // Limpiar canvas excepto el mensaje
        Array.from(dropZone.children).forEach(child => {
            if (!child.classList.contains('drop-zone-message')) {
                child.remove();
            }
        });
        
        if (this.customLayout && this.customLayout.rows && this.customLayout.rows.length > 0) {
            message.style.display = 'none';
            this.renderCustomLayout();
        } else {
            message.style.display = 'block';
            this.renderDefaultLayout();
        }
    }

    renderCustomLayout() {
        const dropZone = document.getElementById('dropZone');
        
        this.customLayout.rows.forEach(rowData => {
            const row = this.addRow();
            
            rowData.elements.forEach(elementName => {
                const elementData = this.findElementData(elementName);
                if (elementData && this.isElementVisible(elementName)) {
                    this.addElementToRow(row, elementData);
                }
            });
        });
    }

    renderDefaultLayout() {
        if (!this.questionnaire || !this.questionnaire.pages) return;
        
        const dropZone = document.getElementById('dropZone');
        const message = dropZone.querySelector('.drop-zone-message');
        
        this.questionnaire.pages.forEach(page => {
            this.renderPageElementsToCanvas(page.elements);
        });
        
        if (dropZone.children.length > 1) {
            message.style.display = 'none';
        }
    }

    renderPageElementsToCanvas(elements) {
        elements.forEach(element => {
            if (this.isElementVisible(element.name)) {
                const row = this.addRow();
                this.addElementToRow(row, element);
            }
            
            // Si es un panel, renderizar sus elementos hijos
            if (element.elements) {
                this.renderPageElementsToCanvas(element.elements);
            }
        });
    }

    findElementData(elementName) {
        if (!this.questionnaire || !this.questionnaire.pages) return null;
        
        for (const page of this.questionnaire.pages) {
            const found = this.findElementInPage(page.elements, elementName);
            if (found) return found;
        }
        return null;
    }

    findElementInPage(elements, elementName) {
        for (const element of elements) {
            if (element.name === elementName) {
                return element;
            }
            if (element.elements) {
                const found = this.findElementInPage(element.elements, elementName);
                if (found) return found;
            }
        }
        return null;
    }

    saveToCustomLayout() {
        if (!this.customLayout) {
            this.customLayout = { elements: [], rows: [] };
        }
        
        // Guardar estructura de filas
        const rows = document.querySelectorAll('.form-row');
        this.customLayout.rows = Array.from(rows).map(row => ({
            id: row.dataset.rowId,
            elements: Array.from(row.querySelectorAll('.form-element')).map(el => el.dataset.elementName)
        }));
        
        // Mantener configuración de visibilidad
        if (!this.customLayout.elements) {
            this.customLayout.elements = [];
        }
    }

    async saveLayout() {
        try {
            this.saveToCustomLayout();
            
            const blob = new Blob([JSON.stringify(this.customLayout, null, 2)], {
                type: 'application/json'
            });
            
            // Simular guardado (en un entorno real, esto sería una llamada al servidor)
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'custom-layout.json';
            a.click();
            URL.revokeObjectURL(url);
            
            this.updateStatus('Diseño guardado correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar:', error);
            this.updateStatus('Error al guardar el diseño', 'error');
        }
    }

    exportLayout() {
        try {
            this.saveToCustomLayout();
            
            const dataStr = JSON.stringify(this.customLayout, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `custom-layout-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.updateStatus('Diseño exportado correctamente', 'success');
        } catch (error) {
            console.error('Error al exportar:', error);
            this.updateStatus('Error al exportar el diseño', 'error');
        }
    }

    importLayout() {
        document.getElementById('importLayout').click();
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedLayout = JSON.parse(e.target.result);
                this.customLayout = importedLayout;
                this.renderElements();
                this.renderCanvas();
                this.updateStatus('Diseño importado correctamente', 'success');
            } catch (error) {
                console.error('Error al importar:', error);
                this.updateStatus('Error al importar el diseño', 'error');
            }
        };
        reader.readAsText(file);
        
        // Limpiar el input
        event.target.value = '';
    }

    resetLayout() {
        this.showModal(
            'Confirmar Reset',
            '¿Estás seguro de que quieres resetear el diseño? Se perderán todos los cambios.',
            () => {
                this.customLayout = null;
                this.renderElements();
                this.renderCanvas();
                this.clearProperties();
                this.updateStatus('Diseño reseteado', 'success');
            }
        );
    }

    toggleMode() {
        this.isEditMode = !this.isEditMode;
        const button = document.getElementById('toggleMode');
        const inputs = document.querySelectorAll('.element-input');
        
        if (this.isEditMode) {
            button.innerHTML = '<i class="fas fa-eye"></i> Modo Vista';
            inputs.forEach(input => {
                if (input.tagName.toLowerCase() !== 'div') {
                    input.readOnly = true;
                }
            });
        } else {
            button.innerHTML = '<i class="fas fa-edit"></i> Modo Edición';
            inputs.forEach(input => {
                if (input.tagName.toLowerCase() !== 'div') {
                    input.readOnly = false;
                }
            });
        }
        
        this.updateStatus(`Cambiado a modo ${this.isEditMode ? 'edición' : 'vista'}`);
    }

    toggleGrid(show) {
        const canvas = document.getElementById('canvas');
        canvas.classList.toggle('show-grid', show);
    }

    toggleSnapToGrid(snap) {
        // Implementar lógica de snap to grid si es necesario
        this.updateStatus(`Ajuste a grilla ${snap ? 'activado' : 'desactivado'}`);
    }

    handleKeyboard(e) {
        if (e.ctrlKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveLayout();
                    break;
                case 'z':
                    e.preventDefault();
                    // Implementar undo si es necesario
                    break;
                case 'Delete':
                    if (this.selectedElement) {
                        this.removeElement(this.selectedElement);
                    }
                    break;
            }
        }
    }

    showModal(title, message, onConfirm) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        modalConfirm.onclick = () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        };
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    updateStatus(message, type = 'info') {
        const statusText = document.getElementById('statusText');
        statusText.textContent = message;
        
        // Remover clases anteriores
        statusText.className = '';
        
        // Agregar clase según el tipo
        if (type === 'error') statusText.style.color = '#e74c3c';
        else if (type === 'success') statusText.style.color = '#27ae60';
        else if (type === 'warning') statusText.style.color = '#f39c12';
        else statusText.style.color = '#fff';
        
        // Auto-limpiar después de 5 segundos
        setTimeout(() => {
            statusText.textContent = 'Listo';
            statusText.style.color = '#fff';
        }, 5000);
    }

    updateElementCount() {
        const count = document.querySelectorAll('.form-element').length;
        document.getElementById('elementCount').textContent = `${count} elementos`;
    }

    // Método para verificar si el canvas está listo
    isCanvasReady() {
        const elementsInCanvas = document.querySelectorAll('.form-element[data-element-name]').length;
        return elementsInCanvas > 0;
    }

    // Método mejorado para cargar valores con verificación de canvas
    loadValuesIntoFormWhenReady() {
        if (this.isCanvasReady()) {
            this.loadValuesIntoForm();
        } else {
            setTimeout(() => {
                this.loadValuesIntoFormWhenReady();
            }, 500);
        }
    }



    // Función para convertir fechas al formato correcto para inputs date
    formatDateForInput(dateString, inputType) {
        if (inputType !== 'date' || !dateString) return dateString;
        
        // Detectar diferentes formatos de fecha y convertir a YYYY-MM-DD
        const dateFormats = [
            /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
            /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
            /^(\d{4})-(\d{2})-(\d{2})$/    // YYYY-MM-DD (ya correcto)
        ];
        
        // DD/MM/YYYY -> YYYY-MM-DD
        if (dateFormats[0].test(dateString)) {
            const [, day, month, year] = dateString.match(dateFormats[0]);
            return `${year}-${month}-${day}`;
        }
        
        // YYYY/MM/DD -> YYYY-MM-DD
        if (dateFormats[1].test(dateString)) {
            return dateString.replace(/\//g, '-');
        }
        
        // Ya está en formato correcto
        if (dateFormats[2].test(dateString)) {
            return dateString;
        }
        
        return dateString; // Si no coincide con ningún formato, devolver original
    }

    loadValuesIntoForm() {
        if (!this.responseData) {
            return;
        }

        // Obtener todos los elementos definidos en el layout
        const layoutElements = this.getLayoutElements();
        
        // Buscar elementos del formulario
        const elements = document.querySelectorAll('.form-element[data-element-name]');
        let loadedCount = 0;
        
        // Procesar cada elemento del layout
        layoutElements.forEach(elementName => {
            // Usar querySelectorAll para encontrar TODOS los elementos con el mismo nombre
            const elements = document.querySelectorAll(`.form-element[data-element-name="${elementName}"]`);
            
            if (elements.length > 0) {
                let value = this.responseData[elementName];
                
                // Si el valor es null, undefined o string vacío, usar "N/A"
                if (value === null || value === undefined || value === '') {
                    value = 'N/A';
                }
                
                // Procesar CADA elemento encontrado
                elements.forEach((element, index) => {
                    // Intentar múltiples selectores para encontrar el input
                    let input = element.querySelector('.element-input');
                    if (!input) input = element.querySelector('input');
                    if (!input) input = element.querySelector('textarea');
                    if (!input) input = element.querySelector('select');
                    
                    if (input) {
                        let finalValue = value;
                        
                        // Formatear fechas para inputs de tipo date
                        if (input.type === 'date' && finalValue !== 'N/A') {
                            const originalValue = finalValue;
                            finalValue = this.formatDateForInput(finalValue, 'date');
                            if (elementName === 'Fecha de Nacimiento' && index === 0) {
                                console.log(`🔄 Fecha convertida: ${originalValue} -> ${finalValue}`);
                            }
                        }
                        
                        input.value = finalValue;
                        loadedCount++;
                        
                        // Verificación especial para elementos problemáticos (solo mostrar para el primer elemento)
                        if (elementName === 'question7' && index === 0) {
                            console.log(`✅ question7 mapeado correctamente: ${finalValue} -> ${elements.length} elemento(s) encontrado(s)`);
                        }
                        if (elementName === 'Fecha de Nacimiento' && index === 0) {
                            console.log(`✅ Fecha de Nacimiento mapeado: ${finalValue} -> ${elements.length} elemento(s) encontrado(s)`);
                            console.log(`Tipo de input: ${input.type}, Tag: ${input.tagName}`);
                        }
                    }
                });
            }
        });
        
        if (loadedCount === 0) {
            this.updateStatus('No se pudieron cargar valores desde response.json', 'error');
        } else {
            this.updateStatus(`Se cargaron ${loadedCount} valores desde response.json`, 'success');
        }
    }

    // Método para obtener todos los elementos definidos en el layout
    getLayoutElements() {
        const elements = new Set();
        
        // Agregar elementos del layout personalizado
        if (this.customLayout && this.customLayout.rows) {
            this.customLayout.rows.forEach(row => {
                if (row.elements) {
                    row.elements.forEach(elementName => {
                        elements.add(elementName);
                    });
                }
            });
        }
        
        // Agregar elementos del cuestionario base
        if (this.questionnaire && this.questionnaire.elements) {
            this.questionnaire.elements.forEach(element => {
                elements.add(element.name);
            });
        }
        
        return Array.from(elements);
    }

    // Método para recargar valores manualmente
    reloadResponseData() {
        this.updateStatus('Recargando datos de respuesta...', 'info');
        this.loadResponseData().then(() => {
            if (this.responseData) {
                this.loadValuesIntoFormWhenReady();
            } else {
                this.updateStatus('No se pudo cargar el archivo response.json', 'error');
            }
        }).catch(error => {
            console.error('Error al recargar datos:', error);
            this.updateStatus('Error al recargar datos de respuesta', 'error');
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.formBuilder = new FormBuilder();
});

// Manejar clicks fuera de elementos para deseleccionar
document.addEventListener('click', (e) => {
    if (!e.target.closest('.form-element') && !e.target.closest('.form-row') && !e.target.closest('.properties-panel')) {
        if (window.formBuilder) {
            window.formBuilder.clearProperties();
            document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        }
    }
});