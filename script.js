/* ===== อ้างอิง element ===== */
const bookList = document.getElementById('bookList');
const booksHint = document.getElementById('booksHint');
const addFileToggle = document.getElementById('addFileToggle');
const addFilePanel = document.getElementById('addFilePanel');
const addBookName = document.getElementById('addBookName');
const addBookUrl = document.getElementById('addBookUrl');
const addBookSubmit = document.getElementById('addBookSubmit');
const addBookStatus = document.getElementById('addBookStatus');
const bookTrashToggle = document.getElementById('bookTrashToggle');
const bookTrashPanel = document.getElementById('bookTrashPanel');
const bookTrashList = document.getElementById('bookTrashList');
const bookTrashStatus = document.getElementById('bookTrashStatus');

const mainEmpty = document.getElementById('mainEmpty');
const workspace = document.getElementById('workspace');
const tabsBar = document.getElementById('tabsBar');
const createSheetOpen = document.getElementById('createSheetOpen');

const searchForm = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const button = document.getElementById('searchButton');
const statusFilter = document.getElementById('statusFilter');
const hint = document.getElementById('resultsHint');
const countLabel = document.getElementById('resultsCount');
const tableWrap = document.getElementById('tableWrap');
const tableHead = document.getElementById('dataTableHead');
const tableBody = document.getElementById('dataTableBody');

const addToggle = document.getElementById('addToggle');
const addPanel = document.getElementById('addPanel');
const addPanelSheetName = document.getElementById('addPanelSheetName');
const addFields = document.getElementById('addFields');
const addSubmitButton = document.getElementById('addSubmitButton');
const addStatus = document.getElementById('addStatus');

const manageToggle = document.getElementById('manageToggle');
const managePanel = document.getElementById('managePanel');
const manageChips = document.getElementById('manageChips');
const manageStatus = document.getElementById('manageStatus');

const trashToggle = document.getElementById('trashToggle');
const trashPanel = document.getElementById('trashPanel');
const trashList = document.getElementById('trashList');
const trashStatus = document.getElementById('trashStatus');

const createSheetModal = document.getElementById('createSheetModal');
const newSheetName = document.getElementById('newSheetName');
const gridEditor = document.getElementById('gridEditor');
const gridAddRow = document.getElementById('gridAddRow');
const gridAddCol = document.getElementById('gridAddCol');
const gridCancel = document.getElementById('gridCancel');
const gridSave = document.getElementById('gridSave');
const createSheetStatus = document.getElementById('createSheetStatus');

/* ===== สถานะที่รู้จัก — dropdown จะโชว์เฉพาะค่าที่พบจริงในข้อมูล ===== */
const KNOWN_STATUSES = ['รอตรวจสอบ', 'รับเรื่องแล้ว', 'แก้ไขแล้ว', 'ข้อมูลเพิ่มเติม', 'ปิดก่อน', 'แบน', 'ปลดแบน', 'BANNED', 'UNBANNED'];

let currentBook = '';
let selectedSheet = ''; // '' = ทุกแท็บในไฟล์นี้
let lastKeyword = '';
let jsonpCounter = 0;
let currentTableHeaders = []; // หัวตารางเต็ม (โหมดแท็บเดียว) หรือ ['แท็บ','แถวที่','ข้อมูล'] (โหมดทั้งหมด)
let currentRows = []; // ผลลัพธ์ล่าสุดที่โหลดมา (ก่อนกรองสถานะ)
let statusColIndex = -1; // ตำแหน่งคอลัมน์ "สถานะ" ในโหมดแท็บเดียว (-1 = ไม่มี)

document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
});

/* ===== เครื่องมือกลาง ===== */

function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonpCallback_${Date.now()}_${jsonpCounter++}`;
    const script = document.createElement('script');
    const cleanup = () => { delete window[callbackName]; script.remove(); };
    window[callbackName] = (data) => { cleanup(); resolve(data); };
    script.onerror = () => { cleanup(); reject(new Error('เชื่อมต่อ API ไม่สำเร็จ')); };
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function apiUrl(params) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  parts.push(`key=${encodeURIComponent(ACCESS_KEY)}`);
  return `${API_URL}?${parts.join('&')}`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightMatch(text, keyword) {
  const safeText = escapeHtml(text);
  if (!keyword) return safeText;
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, 'ig');
  return safeText.replace(regex, '<mark>$1</mark>');
}

function formatDateTime(isoString) {
  try {
    return new Date(isoString).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) {
    return isoString;
  }
}

/* ===== ซ้าย: รายชื่อไฟล์ ===== */

async function loadBooks() {
  if (!API_URL || API_URL.includes('วาง_URL')) {
    booksHint.textContent = 'ยังไม่ได้ตั้งค่า API_URL ใน config.js';
    return;
  }
  booksHint.textContent = 'กำลังโหลด...';
  try {
    const result = await jsonpRequest(apiUrl({ action: 'books' }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายชื่อไฟล์ไม่สำเร็จ');
    booksHint.textContent = '';
    renderBookList(result.books);
  } catch (err) {
    booksHint.textContent = 'เกิดข้อผิดพลาด: ' + err.message;
  }
}

function renderBookList(books) {
  bookList.innerHTML = '';
  books.forEach(book => {
    const item = document.createElement('div');
    item.className = 'book-item';
    item.setAttribute('data-active', String(book === currentBook));

    const nameBtn = document.createElement('button');
    nameBtn.type = 'button';
    nameBtn.className = 'book-item__main';
    nameBtn.textContent = book;
    nameBtn.title = book;
    nameBtn.addEventListener('click', () => openBook(book));

    const renameBtn = document.createElement('button');
    renameBtn.type = 'button';
    renameBtn.className = 'book-item__icon';
    renameBtn.textContent = '✎';
    renameBtn.title = `เปลี่ยนชื่อไฟล์ "${book}"`;
    renameBtn.addEventListener('click', (e) => { e.stopPropagation(); renameBookPrompt(book); });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'book-item__icon book-item__icon--danger';
    removeBtn.textContent = '×';
    removeBtn.title = `เอาไฟล์ "${book}" ออกจากระบบ`;
    removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeBook(book, item); });

    item.append(nameBtn, renameBtn, removeBtn);
    bookList.appendChild(item);
  });
}

async function renameBookPrompt(book) {
  const newName = (prompt(`ตั้งชื่อใหม่สำหรับไฟล์ "${book}"`, book) || '').trim();
  if (!newName || newName === book) return;

  try {
    const result = await jsonpRequest(apiUrl({ action: 'renameBook', oldName: book, newName }));
    if (!result.ok) throw new Error(result.error || 'เปลี่ยนชื่อไม่สำเร็จ');

    if (currentBook === book) currentBook = newName;
    renderBookList(result.books);
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  }
}

async function removeBook(book, itemEl) {
  const confirmed = confirm(`เอาไฟล์ "${book}" ออกจากระบบนี้?\n\n(ไฟล์ Google Sheet จริงจะไม่ถูกลบ กู้คืนได้จากถังขยะไฟล์)`);
  if (!confirmed) return;

  try {
    const result = await jsonpRequest(apiUrl({ action: 'removeBook', name: book }));
    if (!result.ok) throw new Error(result.error || 'เอาไฟล์ออกไม่สำเร็จ');

    itemEl.remove();
    if (currentBook === book) {
      currentBook = '';
      selectedSheet = '';
      workspace.hidden = true;
      mainEmpty.hidden = false;
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  }
}

/* ===== เพิ่มไฟล์ใหม่ ===== */

addFileToggle.addEventListener('click', () => {
  const isOpen = !addFilePanel.hidden;
  addFilePanel.hidden = isOpen;
  bookTrashPanel.hidden = true;
  addFileToggle.textContent = isOpen ? '+ เพิ่มไฟล์' : '× ปิดฟอร์ม';
  if (!isOpen) { addBookName.value = ''; addBookUrl.value = ''; setAddBookStatus('', null); }
});

addBookSubmit.addEventListener('click', async () => {
  const name = addBookName.value.trim();
  const sheetUrl = addBookUrl.value.trim();
  if (!name || !sheetUrl) { setAddBookStatus('กรุณากรอกทั้งชื่อไฟล์และลิงก์', 'error'); return; }

  addBookSubmit.disabled = true;
  setAddBookStatus('กำลังตรวจสอบและเพิ่มไฟล์...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'addBook', name, sheetUrl }));
    if (!result.ok) throw new Error(result.error || 'เพิ่มไฟล์ไม่สำเร็จ');

    setAddBookStatus(result.message, 'success');
    addBookName.value = ''; addBookUrl.value = '';
    renderBookList(result.books);
  } catch (err) {
    setAddBookStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    addBookSubmit.disabled = false;
  }
});

function setAddBookStatus(message, type) {
  addBookStatus.textContent = message;
  addBookStatus.className = 'sidebar-panel__status' + (type ? ` sidebar-panel__status--${type}` : '');
}

/* ===== ถังขยะไฟล์ ===== */

bookTrashToggle.addEventListener('click', () => {
  const isOpen = !bookTrashPanel.hidden;
  bookTrashPanel.hidden = isOpen;
  addFilePanel.hidden = true;
  bookTrashToggle.textContent = isOpen ? '🗑 ถังขยะไฟล์' : '× ปิดถังขยะไฟล์';
  if (!isOpen) loadBookTrash();
});

async function loadBookTrash() {
  bookTrashList.innerHTML = '';
  setBookTrashStatus('กำลังโหลด...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'bookTrash' }));
    if (!result.ok) throw new Error(result.error || 'โหลดถังขยะไฟล์ไม่สำเร็จ');
    renderBookTrashItems(result.items);
    setBookTrashStatus(result.items.length === 0 ? 'ยังไม่มีไฟล์ที่ถูกเอาออก' : '', null);
  } catch (err) {
    setBookTrashStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderBookTrashItems(items) {
  bookTrashList.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'trash-item';
    row.innerHTML = `
      <div class="trash-item__info">
        <div class="trash-item__meta">เอาไฟล์ออก · ${escapeHtml(formatDateTime(item.removedAt))}</div>
        <div class="trash-item__preview">${escapeHtml(item.name)}</div>
      </div>`;
    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'trash-item__restore';
    restoreBtn.textContent = 'กู้คืน';
    restoreBtn.addEventListener('click', () => restoreBookItem(item, row, restoreBtn));
    row.appendChild(restoreBtn);
    bookTrashList.appendChild(row);
  });
}

async function restoreBookItem(item, rowEl, buttonEl) {
  buttonEl.disabled = true;
  buttonEl.textContent = 'กำลังกู้คืน...';
  try {
    const result = await jsonpRequest(apiUrl({ action: 'restoreBook', id: item.id }));
    if (!result.ok) throw new Error(result.error || 'กู้คืนไม่สำเร็จ');
    rowEl.remove();
    setBookTrashStatus(result.message, 'success');
    renderBookList(result.books);
  } catch (err) {
    setBookTrashStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    buttonEl.disabled = false;
    buttonEl.textContent = 'กู้คืน';
  }
}

function setBookTrashStatus(message, type) {
  bookTrashStatus.textContent = message;
  bookTrashStatus.className = 'sidebar-panel__status' + (type ? ` sidebar-panel__status--${type}` : '');
}

/* ===== กลาง: เปิดไฟล์ → เลือกแท็บ ===== */

async function openBook(book) {
  currentBook = book;
  selectedSheet = '';
  lastKeyword = '';
  input.value = '';

  mainEmpty.hidden = true;
  workspace.hidden = false;

  Array.from(bookList.children).forEach(item => {
    const isThis = item.querySelector('.book-item__main').textContent === book;
    item.setAttribute('data-active', String(isThis));
  });

  resetPanels();
  statusFilter.hidden = true;
  manageToggle.hidden = true;
  tabsBar.innerHTML = '';
  showHint('กำลังโหลดรายชื่อแท็บ...', false);

  try {
    const result = await jsonpRequest(apiUrl({ action: 'sheets', book }));
    if (!result.ok) throw new Error(result.error || 'โหลดแท็บไม่สำเร็จ');
    renderTabs(result.sheets);
    selectTab(''); // เริ่มที่ "ทั้งหมดในไฟล์นี้"
  } catch (err) {
    showHint('เกิดข้อผิดพลาด: ' + err.message, true);
  }
}

function renderTabs(sheets) {
  tabsBar.innerHTML = '';
  tabsBar.appendChild(createTabPill('ทั้งหมดในไฟล์นี้', ''));
  sheets.forEach(s => tabsBar.appendChild(createTabPill(s.name, s.name)));
}

function createTabPill(label, sheetName) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'tab-pill';
  pill.textContent = label;
  pill.dataset.sheet = sheetName;
  pill.setAttribute('aria-pressed', 'false');
  pill.addEventListener('click', () => selectTab(sheetName));
  return pill;
}

function updateTabPillStates() {
  Array.from(tabsBar.children).forEach(pill => {
    pill.setAttribute('aria-pressed', String(pill.dataset.sheet === selectedSheet));
  });
}

async function selectTab(sheetName) {
  selectedSheet = sheetName;
  updateTabPillStates();
  resetPanels();
  manageToggle.hidden = !sheetName;

  if (sheetName) {
    await loadSingleTabView(sheetName, '');
  } else {
    await loadAllTabsView('');
  }
}

/* ===== โหมดแท็บเดียว: ตารางเต็มคอลัมน์ + ตัวกรองสถานะ ===== */

async function loadSingleTabView(sheetName, keyword) {
  lastKeyword = keyword;
  input.value = keyword;
  setLoading(true);
  showHint('กำลังโหลด...', false);

  try {
    const headerResult = await jsonpRequest(apiUrl({ action: 'tableHeaders', book: currentBook, sheet: sheetName }));
    if (!headerResult.ok) throw new Error(headerResult.error || 'โหลดหัวตารางไม่สำเร็จ');

    currentTableHeaders = headerResult.headers;
    statusColIndex = headerResult.statusIndex;

    const searchResult = await jsonpRequest(apiUrl({ action: 'search', q: keyword, book: currentBook, sheet: sheetName }));
    if (!searchResult.ok) throw new Error(searchResult.error || 'ค้นหาไม่สำเร็จ');

    currentRows = searchResult.results;
    setupStatusFilter();
    applyStatusFilterAndRender();
  } catch (err) {
    showHint('เกิดข้อผิดพลาด: ' + err.message, true);
  } finally {
    setLoading(false);
  }
}

function setupStatusFilter() {
  if (statusColIndex === -1) {
    statusFilter.hidden = true;
    statusFilter.innerHTML = '';
    return;
  }
  const found = new Set();
  currentRows.forEach(row => {
    const v = (row.cells[statusColIndex] || '').toString().trim();
    if (KNOWN_STATUSES.includes(v)) found.add(v);
  });
  if (found.size === 0) {
    statusFilter.hidden = true;
    statusFilter.innerHTML = '';
    return;
  }
  statusFilter.innerHTML = '<option value="">ทุกสถานะ</option>' +
    KNOWN_STATUSES.filter(s => found.has(s)).map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  statusFilter.hidden = false;
  statusFilter.value = '';
}

statusFilter.addEventListener('change', () => applyStatusFilterAndRender());

function applyStatusFilterAndRender() {
  const chosen = statusFilter.value;
  const rows = (!chosen || statusColIndex === -1)
    ? currentRows
    : currentRows.filter(row => (row.cells[statusColIndex] || '').toString().trim() === chosen);
  renderSingleTable(rows);
}

function renderSingleTable(rows) {
  if (!rows || rows.length === 0) {
    tableWrap.hidden = true;
    countLabel.hidden = true;
    showHint('ไม่พบข้อมูลที่ตรงกับคำค้นหา', false);
    return;
  }
  hint.hidden = true;
  countLabel.hidden = false;
  countLabel.textContent = `พบ ${rows.length} รายการ`;

  tableHead.innerHTML = '<tr>' + currentTableHeaders.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '<th></th></tr>';
  tableBody.innerHTML = '';
  rows.forEach(row => {
    const tr = document.createElement('tr');
    currentTableHeaders.forEach((h, i) => {
      const td = document.createElement('td');
      td.innerHTML = highlightMatch((row.cells[i] || '').toString(), lastKeyword);
      tr.appendChild(td);
    });
    const delTd = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'data-table__delete';
    delBtn.textContent = '🗑';
    delBtn.title = 'ลบแถวนี้';
    delBtn.addEventListener('click', () => deleteRow(row, tr, delBtn));
    delTd.appendChild(delBtn);
    tr.appendChild(delTd);
    tableBody.appendChild(tr);
  });
  tableWrap.hidden = false;
}

/* ===== โหมดทั้งหมดในไฟล์: ตาราง 3 คอลัมน์ (แท็บ / แถวที่ / ข้อมูล) ===== */

async function loadAllTabsView(keyword) {
  lastKeyword = keyword;
  input.value = keyword;
  statusFilter.hidden = true;
  setLoading(true);
  showHint('กำลังค้นหา...', false);

  try {
    const result = await jsonpRequest(apiUrl({ action: 'search', q: keyword, book: currentBook }));
    if (!result.ok) throw new Error(result.error || 'ค้นหาไม่สำเร็จ');

    currentTableHeaders = ['แท็บ', 'แถวที่', 'ข้อมูล'];
    currentRows = result.results;
    renderAllTable(currentRows);
  } catch (err) {
    showHint('เกิดข้อผิดพลาด: ' + err.message, true);
  } finally {
    setLoading(false);
  }
}

function renderAllTable(rows) {
  if (!rows || rows.length === 0) {
    tableWrap.hidden = true;
    countLabel.hidden = true;
    showHint('ไม่พบข้อมูลที่ตรงกับคำค้นหา', false);
    return;
  }
  hint.hidden = true;
  countLabel.hidden = false;
  countLabel.textContent = `พบ ${rows.length} รายการ`;

  tableHead.innerHTML = '<tr><th>แท็บ</th><th>แถวที่</th><th>ข้อมูล</th><th></th></tr>';
  tableBody.innerHTML = '';
  rows.forEach(row => {
    const tr = document.createElement('tr');

    const sheetTd = document.createElement('td');
    sheetTd.textContent = row.sheet;
    tr.appendChild(sheetTd);

    const rowTd = document.createElement('td');
    rowTd.textContent = row.row;
    tr.appendChild(rowTd);

    const dataTd = document.createElement('td');
    dataTd.innerHTML = row.cells.filter(c => c.trim() !== '').map(c => highlightMatch(c, lastKeyword)).join(' &middot; ');
    tr.appendChild(dataTd);

    const delTd = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'data-table__delete';
    delBtn.textContent = '🗑';
    delBtn.title = 'ลบแถวนี้';
    delBtn.addEventListener('click', () => deleteRow(row, tr, delBtn));
    delTd.appendChild(delBtn);
    tr.appendChild(delTd);

    tableBody.appendChild(tr);
  });
  tableWrap.hidden = false;
}

/* ===== ค้นหา ===== */

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const keyword = input.value.trim();
  if (selectedSheet) loadSingleTabView(selectedSheet, keyword);
  else loadAllTabsView(keyword);
});

function showHint(message, isError) {
  hint.textContent = message;
  hint.hidden = false;
  hint.classList.toggle('results__hint--error', !!isError);
  countLabel.hidden = true;
  tableWrap.hidden = true;
}

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? 'กำลังค้นหา...' : 'ค้นหา';
}

/* ===== ลบแถว ===== */

async function deleteRow(row, rowEl, buttonEl) {
  const confirmed = confirm(`ยืนยันลบข้อมูลแถวที่ ${row.row} ในแท็บ "${row.sheet}" ออกจากชีตจริง?\n\nการลบนี้ย้อนกลับไม่ได้ทันที (กู้คืนได้ที่ปุ่มถังขยะ)`);
  if (!confirmed) return;

  buttonEl.disabled = true;
  try {
    const result = await jsonpRequest(apiUrl({ action: 'deleteRow', book: currentBook, sheet: row.sheet, row: row.row }));
    if (!result.ok) throw new Error(result.error || 'ลบไม่สำเร็จ');

    rowEl.remove();
    currentRows = currentRows.filter(r => !(r.sheet === row.sheet && r.row === row.row));
    countLabel.textContent = `พบ ${currentRows.length} รายการ`;
    if (currentRows.length === 0) {
      tableWrap.hidden = true;
      showHint('ไม่พบข้อมูลที่ตรงกับคำค้นหา', false);
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
    buttonEl.disabled = false;
  }
}

/* ===== ปิดแผงย่อยทั้งหมด (ใช้ตอนสลับแท็บ/สลับโหมด) ===== */

function resetPanels() {
  addPanel.hidden = true;
  managePanel.hidden = true;
  trashPanel.hidden = true;
  addToggle.setAttribute('aria-pressed', 'false');
  addToggle.textContent = '+ เพิ่มข้อมูล';
  manageToggle.setAttribute('aria-pressed', 'false');
  manageToggle.textContent = 'จัดการคอลัมน์';
  trashToggle.setAttribute('aria-pressed', 'false');
  trashToggle.textContent = '🗑 ถังขยะ';
}

/* ===== แถบเพิ่มข้อมูล ===== */

addToggle.addEventListener('click', () => {
  if (!selectedSheet) { alert('กรุณาเลือกแท็บใดแท็บหนึ่งก่อน'); return; }
  const isOpen = !addPanel.hidden;
  addPanel.hidden = isOpen;
  managePanel.hidden = true;
  trashPanel.hidden = true;
  manageToggle.setAttribute('aria-pressed', 'false');
  manageToggle.textContent = 'จัดการคอลัมน์';
  trashToggle.setAttribute('aria-pressed', 'false');
  trashToggle.textContent = '🗑 ถังขยะ';
  addToggle.setAttribute('aria-pressed', String(!isOpen));
  addToggle.textContent = isOpen ? '+ เพิ่มข้อมูล' : '× ปิดฟอร์ม';
  if (!isOpen) loadAddFields();
});

async function loadAddFields() {
  addPanelSheetName.textContent = selectedSheet;
  addFields.innerHTML = '';
  addSubmitButton.disabled = true;
  setAddStatus('กำลังโหลดคอลัมน์...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'headers', book: currentBook, sheet: selectedSheet }));
    if (!result.ok) throw new Error(result.error || 'โหลดคอลัมน์ไม่สำเร็จ');
    renderAddFields(result.headers);
    addSubmitButton.disabled = false;
    setAddStatus('', null);
  } catch (err) {
    setAddStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderAddFields(headers) {
  addFields.innerHTML = '';
  headers.forEach(header => {
    const wrap = document.createElement('div');
    wrap.className = 'add-field';
    const label = document.createElement('label');
    label.textContent = header.name;
    label.setAttribute('for', `field-${header.name}`);
    wrap.appendChild(label);
    wrap.appendChild(buildFieldInput(header));
    addFields.appendChild(wrap);
  });
}

function buildFieldInput(header) {
  const isDateColumn = /วันที่|date/i.test(header.name);

  if (header.options && header.options.length > 0) {
    const select = document.createElement('select');
    select.id = `field-${header.name}`;
    select.dataset.header = header.name;
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '-- เลือก --';
    select.appendChild(blank);
    header.options.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      select.appendChild(opt);
    });
    return select;
  }

  const inputEl = document.createElement('input');
  inputEl.type = isDateColumn ? 'date' : 'text';
  inputEl.id = `field-${header.name}`;
  inputEl.dataset.header = header.name;
  return inputEl;
}

addSubmitButton.addEventListener('click', async () => {
  if (!selectedSheet) return;
  const data = {};
  addFields.querySelectorAll('input, select').forEach(el => { data[el.dataset.header] = el.value; });

  addSubmitButton.disabled = true;
  setAddStatus('กำลังบันทึก...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'add', book: currentBook, sheet: selectedSheet, data: JSON.stringify(data) }));
    if (!result.ok) throw new Error(result.error || 'บันทึกไม่สำเร็จ');

    setAddStatus('บันทึกข้อมูลสำเร็จ', 'success');
    addFields.querySelectorAll('input, select').forEach(el => { el.value = ''; });
    await loadSingleTabView(selectedSheet, lastKeyword);
  } catch (err) {
    setAddStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    addSubmitButton.disabled = false;
  }
});

function setAddStatus(message, type) {
  addStatus.textContent = message;
  addStatus.className = 'add-panel__status' + (type ? ` add-panel__status--${type}` : '');
}

/* ===== จัดการคอลัมน์ ===== */

manageToggle.addEventListener('click', () => {
  if (!selectedSheet) return;
  const isOpen = !managePanel.hidden;
  managePanel.hidden = isOpen;
  addPanel.hidden = true;
  trashPanel.hidden = true;
  addToggle.setAttribute('aria-pressed', 'false');
  addToggle.textContent = '+ เพิ่มข้อมูล';
  trashToggle.setAttribute('aria-pressed', 'false');
  trashToggle.textContent = '🗑 ถังขยะ';
  manageToggle.setAttribute('aria-pressed', String(!isOpen));
  manageToggle.textContent = isOpen ? 'จัดการคอลัมน์' : 'ปิดหน้าจัดการ';
  if (!isOpen) loadManageColumns();
});

async function loadManageColumns() {
  manageChips.innerHTML = '';
  setManageStatus('กำลังโหลด...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'headers', book: currentBook, sheet: selectedSheet }));
    if (!result.ok) throw new Error(result.error || 'โหลดคอลัมน์ไม่สำเร็จ');
    renderManageChips(result.headers);
    setManageStatus('', null);
  } catch (err) {
    setManageStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderManageChips(headers) {
  manageChips.innerHTML = '';
  if (headers.length === 0) { manageChips.innerHTML = '<p class="manage-panel__status">ไม่มีคอลัมน์ในแท็บนี้</p>'; return; }
  headers.forEach(header => {
    const name = header.name;
    const chip = document.createElement('span');
    chip.className = 'manage-chip';
    const label = document.createElement('span');
    label.textContent = name;
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'manage-chip__delete';
    delBtn.textContent = '×';
    delBtn.title = `ลบคอลัมน์ "${name}"`;
    delBtn.addEventListener('click', () => deleteColumn(name, chip, delBtn));
    chip.append(label, delBtn);
    manageChips.appendChild(chip);
  });
}

async function deleteColumn(header, chipEl, buttonEl) {
  const confirmed = confirm(`ยืนยันลบคอลัมน์ "${header}" ออกจากแท็บ "${selectedSheet}" ทั้งคอลัมน์?\n\nข้อมูลทุกแถวในคอลัมน์นี้จะหายไปด้วย (กู้คืนได้ที่ปุ่มถังขยะ)`);
  if (!confirmed) return;

  buttonEl.disabled = true;
  try {
    const result = await jsonpRequest(apiUrl({ action: 'deleteColumn', book: currentBook, sheet: selectedSheet, column: header }));
    if (!result.ok) throw new Error(result.error || 'ลบคอลัมน์ไม่สำเร็จ');

    chipEl.remove();
    setManageStatus(`ลบคอลัมน์ "${header}" สำเร็จ`, 'success');
    await loadSingleTabView(selectedSheet, lastKeyword);
  } catch (err) {
    setManageStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    buttonEl.disabled = false;
  }
}

function setManageStatus(message, type) {
  manageStatus.textContent = message;
  manageStatus.className = 'manage-panel__status' + (type ? ` manage-panel__status--${type}` : '');
}

/* ===== ถังขยะ (แถว/คอลัมน์ในแท็บ) ===== */

trashToggle.addEventListener('click', () => {
  const isOpen = !trashPanel.hidden;
  trashPanel.hidden = isOpen;
  addPanel.hidden = true;
  managePanel.hidden = true;
  addToggle.setAttribute('aria-pressed', 'false');
  addToggle.textContent = '+ เพิ่มข้อมูล';
  manageToggle.setAttribute('aria-pressed', 'false');
  manageToggle.textContent = 'จัดการคอลัมน์';
  trashToggle.setAttribute('aria-pressed', String(!isOpen));
  trashToggle.textContent = isOpen ? '🗑 ถังขยะ' : '× ปิดถังขยะ';
  if (!isOpen) loadTrash();
});

async function loadTrash() {
  trashList.innerHTML = '';
  setTrashStatus('กำลังโหลด...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'trash', book: currentBook }));
    if (!result.ok) throw new Error(result.error || 'โหลดถังขยะไม่สำเร็จ');
    renderTrashItems(result.items);
    setTrashStatus(result.items.length === 0 ? 'ยังไม่มีรายการที่ถูกลบในไฟล์นี้' : '', null);
  } catch (err) {
    setTrashStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderTrashItems(items) {
  trashList.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'trash-item';
    const typeLabel = item.type === 'row' ? 'ลบแถว' : 'ลบคอลัมน์';
    row.innerHTML = `
      <div class="trash-item__info">
        <div class="trash-item__meta">${escapeHtml(typeLabel)} · ${escapeHtml(item.sheetName)} · ${escapeHtml(formatDateTime(item.deletedAt))}</div>
        <div class="trash-item__preview">${escapeHtml(item.preview)}</div>
      </div>`;
    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'trash-item__restore';
    restoreBtn.textContent = 'กู้คืน';
    restoreBtn.addEventListener('click', () => restoreTrashItem(item, row, restoreBtn));
    row.appendChild(restoreBtn);
    trashList.appendChild(row);
  });
}

async function restoreTrashItem(item, rowEl, buttonEl) {
  buttonEl.disabled = true;
  buttonEl.textContent = 'กำลังกู้คืน...';
  try {
    const result = await jsonpRequest(apiUrl({ action: 'restore', book: currentBook, id: item.id }));
    if (!result.ok) throw new Error(result.error || 'กู้คืนไม่สำเร็จ');

    rowEl.remove();
    setTrashStatus(result.message, 'success');
    if (selectedSheet === item.sheetName) await loadSingleTabView(selectedSheet, lastKeyword);
    else if (!selectedSheet) await loadAllTabsView(lastKeyword);
  } catch (err) {
    setTrashStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    buttonEl.disabled = false;
    buttonEl.textContent = 'กู้คืน';
  }
}

function setTrashStatus(message, type) {
  trashStatus.textContent = message;
  trashStatus.className = 'trash-panel__status' + (type ? ` trash-panel__status--${type}` : '');
}

/* ===== สร้างแท็บใหม่แบบตาราง Excel ===== */

let gridRows = 4;
let gridCols = 4;

createSheetOpen.addEventListener('click', () => {
  if (!currentBook) return;
  newSheetName.value = '';
  createSheetStatus.textContent = '';
  gridRows = 4;
  gridCols = 4;
  buildGridEditor();
  createSheetModal.hidden = false;
});

gridCancel.addEventListener('click', () => { createSheetModal.hidden = true; });

gridAddRow.addEventListener('click', () => { gridRows++; buildGridEditor(preserveGridValues()); });
gridAddCol.addEventListener('click', () => { gridCols++; buildGridEditor(preserveGridValues()); });

function preserveGridValues() {
  const values = [];
  gridEditor.querySelectorAll('tr').forEach(tr => {
    const row = [];
    tr.querySelectorAll('input').forEach(inp => row.push(inp.value));
    values.push(row);
  });
  return values;
}

function buildGridEditor(existingValues) {
  gridEditor.innerHTML = '';
  for (let r = 0; r < gridRows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < gridCols; c++) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.placeholder = r === 0 ? `หัวคอลัมน์ ${c + 1}` : '';
      if (existingValues && existingValues[r] && existingValues[r][c] !== undefined) {
        inp.value = existingValues[r][c];
      }
      td.appendChild(inp);
      tr.appendChild(td);
    }
    gridEditor.appendChild(tr);
  }
}

gridSave.addEventListener('click', async () => {
  const sheetName = newSheetName.value.trim();
  if (!sheetName) { setCreateSheetStatus('กรุณาระบุชื่อแท็บใหม่', 'error'); return; }

  const grid = [];
  gridEditor.querySelectorAll('tr').forEach(tr => {
    const row = [];
    tr.querySelectorAll('input').forEach(inp => row.push(inp.value));
    grid.push(row);
  });

  gridSave.disabled = true;
  setCreateSheetStatus('กำลังสร้างแท็บ...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'createSheet', book: currentBook, sheetName, grid: JSON.stringify(grid) }));
    if (!result.ok) throw new Error(result.error || 'สร้างแท็บไม่สำเร็จ');

    setCreateSheetStatus(result.message, 'success');
    createSheetModal.hidden = true;

    const sheetsResult = await jsonpRequest(apiUrl({ action: 'sheets', book: currentBook }));
    if (sheetsResult.ok) {
      renderTabs(sheetsResult.sheets);
      selectTab(sheetName);
    }
  } catch (err) {
    setCreateSheetStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    gridSave.disabled = false;
  }
});

function setCreateSheetStatus(message, type) {
  createSheetStatus.textContent = message;
  createSheetStatus.className = 'modal-box__status' + (type ? ` modal-box__status--${type}` : '');
}
