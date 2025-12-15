// ============================================
// PROCESADOR DE BOLETAS - JavaScript Principal
// Para integrar en Ruby on Rails
// ============================================

// Estado de la aplicación
let appState = {
  receipts: [],
  selectedFile: null,
  currentFormData: null,
  filters: {
    category: 'Todas',
    startDate: '',
    endDate: ''
  }
};

// Datos de ejemplo (en Rails vendrían desde el backend)
var CATEGORIES = [];
const SAMPLE_RECEIPTS = [
  {
    id: '1',
    rut: '76.123.456-7',
    razonSocial: 'Supermercado Santa Isabel S.A.',
    giro: 'Venta al por menor de alimentos',
    direccion: 'Av. Libertador Bernardo O\'Higgins 1234',
    comuna: 'Santiago',
    folio: '00123456',
    fecha: '2025-12-08',
    categoria: 'Alimentación',
    items: [
      { descripcion: 'Pan Hallulla x6', cantidad: 1, precioUnitario: 1500, total: 1500 },
      { descripcion: 'Leche Entera 1L', cantidad: 2, precioUnitario: 950, total: 1900 },
      { descripcion: 'Queso Mantecoso 250g', cantidad: 1, precioUnitario: 2890, total: 2890 }
    ],
    subtotal: 6290,
    iva: 1195,
    total: 7485
  },
  {
    id: '2',
    rut: '96.789.123-4',
    razonSocial: 'Farmacias Cruz Verde S.A.',
    giro: 'Venta de productos farmacéuticos',
    direccion: 'Av. Providencia 2589',
    comuna: 'Providencia',
    folio: '00234567',
    fecha: '2025-12-05',
    categoria: 'Salud',
    items: [
      { descripcion: 'Paracetamol 500mg x20', cantidad: 2, precioUnitario: 2500, total: 5000 },
      { descripcion: 'Vitamina C 1000mg', cantidad: 1, precioUnitario: 8900, total: 8900 }
    ],
    subtotal: 13900,
    iva: 2641,
    total: 16541
  },
  {
    id: '3',
    rut: '77.456.789-1',
    razonSocial: 'Copec S.A.',
    giro: 'Venta de combustibles',
    direccion: 'Av. Apoquindo 4567',
    comuna: 'Las Condes',
    folio: '00345678',
    fecha: '2025-12-10',
    categoria: 'Transporte',
    items: [
      { descripcion: 'Bencina 93 - 40 litros', cantidad: 1, precioUnitario: 32000, total: 32000 }
    ],
    subtotal: 32000,
    iva: 6080,
    total: 38080
  },
  {
    id: '4',
    rut: '78.234.567-8',
    razonSocial: 'Falabella Retail S.A.',
    giro: 'Venta al por menor',
    direccion: 'Mall Costanera Center',
    comuna: 'Providencia',
    folio: '00456789',
    fecha: '2025-11-28',
    categoria: 'Vestuario',
    items: [
      { descripcion: 'Camisa Hombre Talla M', cantidad: 1, precioUnitario: 19990, total: 19990 },
      { descripcion: 'Pantalón Jean Talla 32', cantidad: 1, precioUnitario: 29990, total: 29990 }
    ],
    subtotal: 49980,
    iva: 9496,
    total: 59476
  }
];


function camelCase(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDateDDMMYYYY(dateStr) {
  console.log("Formatting date:", dateStr);
  if (!dateStr) return 'No disponible';
  return dateStr.split('T')[0];
}

function normalizeInvoice(inv) {
  // Convertir precios con puntos o números a enteros
  const parsePrice = (price) => {
    if (price == null) return 0;
    if (typeof price === 'number') return price;
    return parseInt(price.toString().replace(/\./g, ''), 10);
  };

  // TOTAL incluye IVA → sumar todo
  const total = inv.invoice_items.reduce((sum, item) => {
    return sum + item.qtty * item.price;
  }, 0);

  // Calcular subtotal e IVA desde el total con IVA incluido
  const subtotal = Math.round(total / 1.19);
  const iva = total - subtotal;

  return {
    id: inv.id,
    rut: inv.issuer_tax_id || 'No disponible',
    razonSocial: inv.issuer || 'No disponible',
    giro: 'No disponible',
    direccion: inv.address || 'No disponible',
    comuna: inv.city_name || 'No disponible',
    folio: inv.id,
    fecha: inv.billed_at,
    categoria: camelCase(inv.category?.name) || 'Otros',

    items: inv.invoice_items.map(it => {
      const unitPrice = Math.round(it.price || 0);
      return {
        descripcion: it.name,
        cantidad: it.qtty,
        precioUnitario: unitPrice,
        total: Math.ceil(it.qtty * unitPrice)
      };
    }),

    subtotal,
    iva,
    total
  };
}

function normalizeResponse(inv) {
  // Convertir precios tipo "1.380" a enteros (1380)
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    // Eliminar puntos y convertir a número
    return parseInt(priceStr.replace(/\./g, ''), 10);
  };

  const total = inv.invoice_items.reduce((sum, item) => {
    return sum + item.qtty * parsePrice(item.price);
  }, 0);

  const subtotal = Math.round(total / 1.19);
  const iva = Math.round(total - subtotal);

  return {
    rut: inv.issuer_tax_id || 'No disponible',
    razonSocial: inv.issuer || 'No disponible',
    giro: 'No disponible', // Si tuvieras un campo en el JSON original, aquí podrías mapearlo
    direccion: inv.address || 'No disponible',
    comuna: inv.city_name || 'No disponible',
    folio: inv.invoice_id || 'No disponible',
    fecha: formatDateDDMMYYYY(inv.billed_at) || 'No disponible',
    categoria: camelCase(inv.category?.name) || 'Otros',
    items: inv.invoice_items.map(it => ({
      descripcion: it.name,
      cantidad: it.qtty,
      precioUnitario: parsePrice(it.price),
      total: Math.ceil(it.qtty * parsePrice(it.price))
    })),
    subtotal,
    iva,
    total
  };
}

function normalizeCategories(categoriesArray) {
  const normalized = {};

  categoriesArray.forEach(cat => {
    normalized[cat.name] = {
      id: cat.id,
      icon: cat.icon,
      color: cat.color
    };
  });

  return normalized;
}


// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
  var invoiceData = await fetch('/invoices')
  invoiceData = await invoiceData.json()

  var categoriesData = await fetch('/categories')
  categoriesData = await categoriesData.json()
  CATEGORIES = normalizeCategories(categoriesData);

  // Cargar datos de ejemplo
  appState.receipts = invoiceData.map(inv => normalizeInvoice(inv));;

  // Cargar vistas HTML
  loadView('expenses', 'expenses-view.html');
  loadView('upload', 'upload-view.html');
  loadView('processing', 'processing-view.html');
  loadView('form', 'form-view.html', ()=>{loadCategoriesForm()});
  loadView('success', 'success-view.html');
  
  // Configurar drag & drop
  setupDragAndDrop();
});

// Cargar vista HTML
function loadView(viewId, htmlFile, callback = null) {
  fetch(htmlFile)
    .then(response => response.text())
    .then(html => {
      document.getElementById(`view-${viewId}`).innerHTML = html;

      if (callback) callback();

      if (viewId === 'expenses') {
        renderExpensesView();
      }
      lucide.createIcons();
    });
}

function loadCategoriesForm() {
  const categorySelect = document.getElementById('categoria');
  if (!categorySelect) return;

  categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
  Object.keys(CATEGORIES).forEach(catName => {
    categorySelect.innerHTML += `<option value="${CATEGORIES[catName]?.id}">${catName}</option>`;
  });
}

// ============================================
// NAVEGACIÓN ENTRE VISTAS
// ============================================

function showView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view-container').forEach(view => {
    view.classList.add('hidden');
  });
  
  // Mostrar vista seleccionada
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }
  
  // Actualizar navegación
  updateNavigation(viewName);
  
  // Renderizar según la vista
  if (viewName === 'expenses') {
    renderExpensesView();
  }
  
  // Reinicializar iconos
  lucide.createIcons();
}

function updateNavigation(activeView) {
  const navButtons = {
    'expenses': document.getElementById('nav-expenses'),
    'upload': document.getElementById('nav-upload')
  };
  
  Object.keys(navButtons).forEach(key => {
    if (navButtons[key]) {
      if (key === activeView) {
        navButtons[key].className = 'px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 bg-blue-100 text-blue-700';
      } else {
        navButtons[key].className = 'px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-gray-600 hover:bg-gray-100';
      }
    }
  });
}

// ============================================
// VISTA DE GASTOS
// ============================================

function renderExpensesView() {
  const filteredReceipts = getFilteredReceipts();
  const summary = calculateSummary(filteredReceipts);
  
  renderSummaryCards(summary, filteredReceipts.length);
  renderCategoryBreakdown(summary);
  renderReceiptsTable(filteredReceipts);
}

function getFilteredReceipts() {
  return appState.receipts.filter(receipt => {
    const categoryMatch = appState.filters.category === 'Todas' || receipt.categoria === appState.filters.category;
    const startDateMatch = !appState.filters.startDate || receipt.fecha >= appState.filters.startDate;
    const endDateMatch = !appState.filters.endDate || receipt.fecha <= appState.filters.endDate;
    return categoryMatch && startDateMatch && endDateMatch;
  });
}

function calculateSummary(receipts) {
  const total = receipts.reduce((sum, r) => sum + r.total, 0);
  const byCategory = {};
  
  receipts.forEach(receipt => {
    if (!byCategory[receipt.categoria]) {
      byCategory[receipt.categoria] = 0;
    }
    byCategory[receipt.categoria] += receipt.total;
  });
  
  return { total, byCategory };
}

function renderSummaryCards(summary, receiptCount) {
  const container = document.getElementById('summary-cards');
  if (!container) return;
  
  let html = `
    <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
      <p class="text-blue-100 text-sm mb-1">Total Gastado</p>
      <p class="text-3xl font-bold">$${summary.total.toLocaleString('es-CL')}</p>
      <p class="text-blue-100 text-sm mt-2">
        ${receiptCount} ${receiptCount === 1 ? 'boleta' : 'boletas'}
      </p>
    </div>
  `;
  
  const topCategories = Object.entries(summary.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  topCategories.forEach(([category, amount]) => {
    const categoryInfo = CATEGORIES[category] || CATEGORIES['Otros'];
    const colorClass = getCategoryColorClass(categoryInfo.color);
    const percentage = ((amount / summary.total) * 100).toFixed(0);
    
    html += `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-2">
          <div class="p-2 rounded-lg ${colorClass}">
            <i data-lucide="${categoryInfo.icon}" class="size-4"></i>
          </div>
          <p class="text-sm text-gray-600">${category}</p>
        </div>
        <p class="text-2xl font-bold text-gray-900">
          $${amount.toLocaleString('es-CL')}
        </p>
        <div class="mt-2 bg-gray-100 rounded-full h-1.5">
          <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderCategoryBreakdown(summary) {
  const container = document.getElementById('category-breakdown-grid');
  if (!container) return;
  
  const categories = Object.entries(summary.byCategory)
    .sort(([, a], [, b]) => b - a);
  
  if (categories.length === 0) {
    document.getElementById('category-breakdown').classList.add('hidden');
    return;
  }
  
  document.getElementById('category-breakdown').classList.remove('hidden');
  
  let html = '';
  categories.forEach(([category, amount]) => {
    const categoryInfo = CATEGORIES[category] || CATEGORIES['Otros'];
    const colorClass = getCategoryColorClass(categoryInfo.color);
    const percentage = ((amount / summary.total) * 100).toFixed(1);
    
    html += `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div class="p-2.5 rounded-lg ${colorClass}">
          <i data-lucide="${categoryInfo.icon}" class="size-5"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-600 truncate">${category}</p>
          <p class="font-semibold text-gray-900">$${amount.toLocaleString('es-CL')}</p>
          <p class="text-xs text-gray-500">${percentage}% del total</p>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderReceiptsTable(receipts) {
  const tbody = document.getElementById('receipts-tbody');
  const emptyState = document.getElementById('receipts-empty');
  const tableContainer = document.getElementById('receipts-table-container');
  const receiptsCount = document.getElementById('receipts-count');
  
  if (!tbody) return;
  
  if (receipts.length === 0) {
    emptyState.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    receiptsCount.textContent = '';
    return;
  }
  
  emptyState.classList.add('hidden');
  tableContainer.classList.remove('hidden');
  receiptsCount.textContent = `(${receipts.length})`;
  
  let html = '';
  receipts.forEach(receipt => {
    const categoryInfo = CATEGORIES[receipt.categoria] || CATEGORIES['Otros'];
    const badgeClass = getCategoryBadgeClass(categoryInfo.color);
    const date = receipt.fecha ? formatDateDDMMYYYY(receipt.fecha) : 'No disponible';
    
    html += `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${date}
        </td>
        <td class="px-6 py-4 text-sm">
          <div>
            <p class="font-medium text-gray-900">${receipt.razonSocial}</p>
            <p class="text-gray-500 text-xs">${receipt.rut}</p>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}">
            <i data-lucide="${categoryInfo.icon}" class="size-3"></i>
            ${receipt.categoria}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          ${receipt.folio}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
          $${receipt.total.toLocaleString('es-CL')}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <button onclick="toggleReceiptDetail('${receipt.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <i data-lucide="chevron-down" class="size-5" id="chevron-${receipt.id}"></i>
          </button>
        </td>
      </tr>
      <tr id="detail-${receipt.id}" class="hidden">
        <td colspan="6" class="px-6 py-4 bg-gray-50">
          ${renderReceiptDetail(receipt)}
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

function renderReceiptDetail(receipt) {
  let itemsHtml = '';
  receipt.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td class="px-4 py-2 text-sm text-gray-900">${item.descripcion}</td>
        <td class="px-4 py-2 text-center text-sm text-gray-600">${item.cantidad}</td>
        <td class="px-4 py-2 text-right text-sm text-gray-600">$${item.precioUnitario.toLocaleString('es-CL')}</td>
        <td class="px-4 py-2 text-right text-sm font-medium text-gray-900">$${item.total.toLocaleString('es-CL')}</td>
      </tr>
    `;
  });
  
  return `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-600 mb-1 font-medium">Giro</p>
          <p class="text-gray-900">${receipt.giro}</p>
        </div>
        <div>
          <p class="text-gray-600 mb-1 font-medium">Dirección</p>
          <p class="text-gray-900">${receipt.direccion}</p>
        </div>
        <div>
          <p class="text-gray-600 mb-1 font-medium">Comuna</p>
          <p class="text-gray-900">${receipt.comuna}</p>
        </div>
      </div>
      <div class="border-t border-gray-200 pt-4">
        <h4 class="font-semibold text-gray-900 mb-3">Ítems de la boleta</h4>
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-600">Descripción</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-600">Cantidad</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-600">Precio Unit.</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${itemsHtml}
              <tr class="bg-gray-50">
                <td colspan="3" class="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal:</td>
                <td class="px-4 py-2 text-right text-sm font-semibold text-gray-900">$${receipt.subtotal.toLocaleString('es-CL')}</td>
              </tr>
              <tr class="bg-gray-50">
                <td colspan="3" class="px-4 py-2 text-right text-sm font-medium text-gray-700">IVA (19%):</td>
                <td class="px-4 py-2 text-right text-sm font-semibold text-gray-900">$${receipt.iva.toLocaleString('es-CL')}</td>
              </tr>
              <tr class="bg-gray-50">
                <td colspan="3" class="px-4 py-2 text-right text-sm font-bold text-gray-900">Total:</td>
                <td class="px-4 py-2 text-right text-sm font-bold text-gray-900">$${receipt.total.toLocaleString('es-CL')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function toggleReceiptDetail(receiptId) {
  const detailRow = document.getElementById(`detail-${receiptId}`);
  const chevron = document.getElementById(`chevron-${receiptId}`);
  
  if (detailRow.classList.contains('hidden')) {
    detailRow.classList.remove('hidden');
    chevron.setAttribute('data-lucide', 'chevron-up');
  } else {
    detailRow.classList.add('hidden');
    chevron.setAttribute('data-lucide', 'chevron-down');
  }
  
  lucide.createIcons();
}

// ============================================
// FILTROS
// ============================================

function applyFilters() {
  appState.filters = {
    category: document.getElementById('filter-category').value,
    startDate: document.getElementById('filter-start-date').value,
    endDate: document.getElementById('filter-end-date').value
  };
  
  const hasFilters = appState.filters.category !== 'Todas' || 
                     appState.filters.startDate || 
                     appState.filters.endDate;
  
  const clearSection = document.getElementById('clear-filters-section');
  if (clearSection) {
    clearSection.classList.toggle('hidden', !hasFilters);
  }
  
  renderExpensesView();
  lucide.createIcons();
}

function clearFilters() {
  document.getElementById('filter-category').value = 'Todas';
  document.getElementById('filter-start-date').value = '';
  document.getElementById('filter-end-date').value = '';
  applyFilters();
}

// ============================================
// UPLOAD - DRAG & DROP
// ============================================

function setupDragAndDrop() {
  const dropzone = document.getElementById('upload-dropzone');
  if (!dropzone) return;
  
  ['dragover', 'dragenter'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-gray-300');
      dropzone.classList.add('border-blue-500', 'bg-blue-50');
    });
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-blue-500', 'bg-blue-50');
      dropzone.classList.add('border-gray-300');
    });
  });
  
  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    alert('Tipo de archivo no válido. Solo se aceptan PDF, JPG y PNG.');
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert('El archivo es demasiado grande. Máximo 10MB.');
    return;
  }
  
  appState.selectedFile = file;
  displaySelectedFile(file);
}

function displaySelectedFile(file) {
  const emptyState = document.getElementById('upload-empty-state');
  const selectedState = document.getElementById('upload-selected-state');
  const dropzone = document.getElementById('upload-dropzone');
  const iconContainer = document.getElementById('file-icon-container');
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  
  emptyState.classList.add('hidden');
  selectedState.classList.remove('hidden');
  dropzone.classList.remove('border-gray-300', 'hover:border-gray-400');
  dropzone.classList.add('border-green-500', 'bg-green-50');
  
  const icon = file.type === 'application/pdf' ? 
    '<i data-lucide="file-text" class="size-12 text-red-500"></i>' :
    '<i data-lucide="image" class="size-12 text-blue-500"></i>';
  
  iconContainer.innerHTML = icon;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  lucide.createIcons();
}

function manualUpload(){
  showFormWithData({
    rut: '',
    razonSocial: '',
    giro: '',
    direccion: '',
    comuna: '',
    folio: '',
    fecha: '',
    categoria: '',
    items: []
  })
}

function clearFileSelection() {
  appState.selectedFile = null;
  const emptyState = document.getElementById('upload-empty-state');
  const selectedState = document.getElementById('upload-selected-state');
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('file-input');
  
  emptyState.classList.remove('hidden');
  selectedState.classList.add('hidden');
  dropzone.classList.remove('border-green-500', 'bg-green-50');
  dropzone.classList.add('border-gray-300');
  fileInput.value = '';
  
  lucide.createIcons();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// PROCESAMIENTO
// ============================================
async function processFile() {
  if (!appState.selectedFile) return;

  showView('processing');

  const processingFilename = document.getElementById('processing-filename');
  if (processingFilename) {
    processingFilename.textContent = `Estamos analizando ${appState.selectedFile.name} con inteligencia artificial`;
  }

  try {
    // Creamos FormData y agregamos la imagen
    const formData = new FormData();
    formData.append('invoice_image', appState.selectedFile);

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    console.log("Enviando archivo al backend para procesamiento...");
    const response = await fetch('/home/extract_invoice', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfToken // <─ Aquí se envía el token
      }
    });

    if (!response.ok) {
      throw new Error(`Error al procesar la factura: ${response.statusText}`);
    }

    const extractedData = await response.json();
    // JSONIFYD DATA FROM RESPONSE
    const dataJson = await JSON.parse(extractedData['parts'][0]['text'] );
    const dataJsonFormatted = normalizeResponse(dataJson);
    // Guardamos los datos extraídos en el estado
    appState.currentFormData = dataJsonFormatted;

    // Mostramos el formulario con los datos
    showFormWithData(dataJsonFormatted);

  } catch (error) {
    console.error(error);
    alert('Hubo un error procesando la factura. Revisa la consola para más detalles.');
    showView('upload'); // Volvemos a la vista de subida
  }
}

// ============================================
// FORMULARIO
// ============================================

function showFormWithData(data) {
  showView('form');
  
  // Llenar campos del formulario
  document.getElementById('rut').value = data.rut;
  document.getElementById('razon_social').value = data.razonSocial;
  document.getElementById('giro').value = data.giro;
  document.getElementById('direccion').value = data.direccion;
  document.getElementById('comuna').value = data.comuna;
  document.getElementById('folio').value = data.folio;
  document.getElementById('fecha').value = data.fecha.split('T')[0];
  document.getElementById('categoria').value = data.categoria;
  
  // Limpiar items previos
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  
  // Agregar items
  data.items.forEach((item, index) => {
    addFormItem(item, index);
  });
  
  calculateFormTotals();
  lucide.createIcons();
}

function addFormItem(itemData = null, index = null) {
  const itemsContainer = document.getElementById('items-container');
  const itemIndex = index !== null ? index : itemsContainer.children.length;
  
  const item = itemData || {
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    total: 0
  };
  
  const itemHtml = `
    <div class="item-row p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <input type="text" 
                 name="items[${itemIndex}][descripcion]" 
                 value="${item.descripcion}"
                 onchange="calculateFormTotals()"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 required>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
          <input type="number" 
                 name="items[${itemIndex}][cantidad]" 
                 value="${item.cantidad}"
                 onchange="updateItemTotal(this)"
                 class="item-cantidad w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 required>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Precio Unit.</label>
          <input type="number" 
                 name="items[${itemIndex}][precio_unitario]" 
                 value="${item.precioUnitario}"
                 onchange="updateItemTotal(this)"
                 class="item-precio w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 required>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Total</label>
          <input type="number" 
                 name="items[${itemIndex}][total]" 
                 value="${item.total}"
                 class="item-total w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" 
                 readonly>
        </div>
        <div class="md:col-span-1 flex items-end">
          <button type="button" 
                  onclick="removeFormItem(this)"
                  class="w-full md:w-auto p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar ítem">
            <i data-lucide="trash-2" class="size-5"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
  lucide.createIcons();
}

function removeFormItem(button) {
  button.closest('.item-row').remove();
  calculateFormTotals();
}

function updateItemTotal(input) {
  const row = input.closest('.item-row');
  const cantidad = parseInt(row.querySelector('.item-cantidad').value) || 0;
  const precio = parseInt(row.querySelector('.item-precio').value) || 0;
  const total = cantidad * precio;
  row.querySelector('.item-total').value = total;
  calculateFormTotals();
}

function calculateFormTotals() {
  const itemTotals = document.querySelectorAll('.item-total');

  let total = 0;
  itemTotals.forEach((input) => {
    total += parseInt(input.value) || 0;
  });

  const subtotal = Math.round(total / 1.19);
  const iva = Math.round(total - subtotal);
  
  document.getElementById('subtotal-display').textContent = '$' + subtotal.toLocaleString('es-CL');
  document.getElementById('iva-display').textContent = '$' + iva.toLocaleString('es-CL');
  document.getElementById('total-display').textContent = '$' + total.toLocaleString('es-CL');
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);

  const newInvoice = {
    invoice: {  // clave 'invoice' porque tu controller usa params.require(:invoice)
      billed_at: formData.get('fecha'),
      category_id: parseInt(formData.get('categoria') || 1), // Ajusta según tu categoría
      issuer: formData.get('razon_social'),
      city_name: formData.get('comuna'),
      address: formData.get('direccion'),
      issuer_tax_id: formData.get('rut'),
      invoice_items_attributes: [] // Rails nested attributes
    }
  };
  
  // Recopilar items
  const itemRows = document.querySelectorAll('.item-row');
  itemRows.forEach(row => {
    const item = {
      name: row.querySelector('[name*="[descripcion]"]').value,
      qtty: parseInt(row.querySelector('[name*="[cantidad]"]').value),
      price: parseInt(row.querySelector('[name*="[precio_unitario]"]').value),
    };
    newInvoice.invoice.invoice_items_attributes.push(item);
  });
    
  // Enviar datos al backend
  // console.log("Enviando nueva factura al backend:", newInvoice);
  // return 0;
  try {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    const response = await fetch('/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(newInvoice)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creando la factura:', errorData);
      alert('Ocurrió un error al guardar la factura');
      return;
    }

    const savedInvoice = await response.json();
    console.log('Factura guardada:', savedInvoice);
    showView('success');
  } catch (err) {
    console.error('Error en la conexión con el servidor:', err);
    alert('Error de conexión con el servidor');
  }
}


// ============================================
// UTILIDADES
// ============================================

function getCategoryColorClass(color) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    pink: 'bg-pink-100 text-pink-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    gray: 'bg-gray-100 text-gray-700'
  };
  return colors[color] || colors.gray;
}

function getCategoryBadgeClass(color) {
  const colors = {
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[color] || colors.gray;
}
