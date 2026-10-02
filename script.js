/* ===== อ้างอิง element ===== */
const loginModal = document.getElementById('loginModal');
const googleSignInButton = document.getElementById('googleSignInButton');
const loginStatus = document.getElementById('loginStatus');
const appLayout = document.getElementById('appLayout');
const topbarAccount = document.getElementById('topbarAccount');
const topbarEmail = document.getElementById('topbarEmail');
const topbarAvatar = document.getElementById('topbarAvatar');

/** แสดงตัวอักษรแรกของอีเมลเป็นวงกลมอวาตาร์เล็กๆ ข้างชื่อผู้ใช้บนแถบหัวเว็บ */
function setTopbarAccountEmail(email) {
  topbarEmail.textContent = email;
  topbarAvatar.textContent = (email || '?').trim().charAt(0).toUpperCase();
}
const logoutButton = document.getElementById('logoutButton');
const adminLink = document.getElementById('adminLink');

/**
 * โชว์/ซ่อนลิงก์หน้าตรวจสอบการใช้งาน ตามว่าบัญชีนี้เป็นผู้ดูแลระบบหรือไม่
 * การซ่อนลิงก์เป็นแค่ความสะดวก ไม่ใช่ความปลอดภัย — ฝั่งเซิร์ฟเวอร์ปฏิเสธคำสั่งของคนที่ไม่ใช่ผู้ดูแลอยู่แล้ว
 */
function setAdminLinkVisible(isAdmin) {
  if (adminLink) adminLink.hidden = !isAdmin;
}
const themeToggle = document.getElementById('themeToggle');

/* ===== สลับธีมสว่าง/มืด (จำไว้ใน localStorage เบราว์เซอร์นี้) ===== */
function applyThemeToggleIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  themeToggle.title = isDark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('sheetSearchTheme', 'light'); } catch (e) {}
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('sheetSearchTheme', 'dark'); } catch (e) {}
  }
  applyThemeToggleIcon();
});

applyThemeToggleIcon();

const booksHint = document.getElementById('booksHint');
// ปุ่ม "+ เพิ่มไฟล์" บนแถบด้านบนถูกเอาออกแล้ว เปิดฟอร์มจากปุ่ม + ท้ายเมนูโฟลเดอร์แทน
const addModeLink = document.getElementById('addModeLink');
const addModeFile = document.getElementById('addModeFile');
const addBookUrlField = document.getElementById('addBookUrlField');
const addBookFileField = document.getElementById('addBookFileField');
const addBookFile = document.getElementById('addBookFile');
const addBookFolder = document.getElementById('addBookFolder');
const addBookCancel = document.getElementById('addBookCancel');
const createBookCancel = document.getElementById('createBookCancel');
const createBookFolder = document.getElementById('createBookFolder');
const addFilePanel = document.getElementById('addFilePanel');
const addBookName = document.getElementById('addBookName');
const addBookUrl = document.getElementById('addBookUrl');
const addBookSubmit = document.getElementById('addBookSubmit');
const addBookStatus = document.getElementById('addBookStatus');
const createBookToggle = document.getElementById('createBookToggle');
const createBookPanel = document.getElementById('createBookPanel');
const createBookName = document.getElementById('createBookName');
const createBookSheetName = document.getElementById('createBookSheetName');
const createBookSubmit = document.getElementById('createBookSubmit');
const createBookStatus = document.getElementById('createBookStatus');
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

const reportPanel = document.getElementById('reportPanel');
const reportPanelSheetName = document.getElementById('reportPanelSheetName');
const reportPanelDate = document.getElementById('reportPanelDate');
const reportStats = document.getElementById('reportStats');
const reportStatusList = document.getElementById('reportStatusList'); // ไม่มีแล้วในหน้าเว็บ (null) — คงไว้เพื่อไม่ให้โค้ดเดิมพัง
const reportLogList = document.getElementById('reportLogList');
const reportStatus = document.getElementById('reportStatus');

const dashboardDate = document.getElementById('dashboardDate');
const dashboardCasesToday = document.getElementById('dashboardCasesToday');
const dashboardNewCasesList = document.getElementById('dashboardNewCasesList');
const dashboardStatusList = document.getElementById('dashboardStatusList');
const dashboardStatus = document.getElementById('dashboardStatus');

const dashReportPresetToday = document.getElementById('dashReportPresetToday');
const dashReportPresetMonth = document.getElementById('dashReportPresetMonth');
const dashReportPresetYear = document.getElementById('dashReportPresetYear');
const dashReportFromDate = document.getElementById('dashReportFromDate');
const dashReportToDate = document.getElementById('dashReportToDate');
const dashReportViewBtn = document.getElementById('dashReportViewBtn');
const dashReportStatus = document.getElementById('dashReportStatus');
const dashReportResult = document.getElementById('dashReportResult');
const dashReportSummary = document.getElementById('dashReportSummary');
const dashReportStatusList = document.getElementById('dashReportStatusList');
const dashReportCasesList = document.getElementById('dashReportCasesList');
const dashReportDownloadBtn = document.getElementById('dashReportDownloadBtn');

const tableToolbar = document.getElementById('tableToolbar');
const pageSizeSelect = document.getElementById('pageSizeSelect');
const pagination = document.getElementById('pagination');
const tabLoadProgress = document.getElementById('tabLoadProgress');
const folderBar = document.getElementById('folderBar');
const folderList = document.getElementById('folderList');

let filteredRows = []; // ผลลัพธ์หลังกรองสถานะ (โหมดแท็บเดียว) หรือผลค้นหาทั้งหมด (โหมดทั้งหมด) — ใช้แบ่งหน้า

pageSizeSelect.addEventListener('change', () => {
  pageSize = parseInt(pageSizeSelect.value, 10) || 20;
  currentPage = 1;
  renderCurrentPage();
});

function renderCurrentPage() {
  if (!filteredRows || filteredRows.length === 0) {
    tableWrap.hidden = true;
    countLabel.hidden = true;
    tableToolbar.hidden = true;
    pagination.hidden = true;
    showHint('ไม่พบข้อมูลที่ตรงกับคำค้นหา', false);
    return;
  }

  hint.hidden = true;
  countLabel.hidden = false;
  tableToolbar.hidden = false;
  countLabel.textContent = `พบ ${filteredRows.length} รายการ` + (lastTruncated ? ' (แสดงได้สูงสุดตามขีดจำกัด อาจมีมากกว่านี้ ลองพิมพ์คำค้นหาให้เจาะจงขึ้น)' : '');

  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);

  tableHead.innerHTML = '<tr>' + '<th class="data-table__rownum-col">แถวที่</th>' + visibleColumnIndices.map(i => {
    const cls = isTicketColumn(currentTableHeaders[i]) ? ' class="data-table__ticket-col"' : '';
    return `<th${cls}>${escapeHtml(currentTableHeaders[i])}</th>`;
  }).join('') + '<th class="data-table__actions-col"></th></tr>';
  tableBody.innerHTML = '';
  pageRows.forEach(row => tableBody.appendChild(buildSingleRow(row)));
  syncTicketColumnOffset_();

  tableWrap.hidden = false;
  renderPaginationControls(totalPages);

  // แท็บใหญ่: เซิร์ฟเวอร์ยังไม่ได้ส่งลิงก์ Ticket มาด้วย (จะช้าเกินไป) ขอเฉพาะแถวที่แสดงอยู่หน้านี้
  if (linksDeferred) loadLinksForRows_(pageRows);
}

/* ===== ลิงก์ Ticket แบบขอทีหลัง (เฉพาะแท็บที่มีข้อมูลเยอะ) =====
 *
 * แท็บที่มีข้อมูลหลักพันแถว ถ้าให้เซิร์ฟเวอร์อ่านลิงก์ทั้งคอลัมน์มาพร้อมผลค้นหา จะใช้เวลานานจนหมดเวลา
 * (การอ่านลิงก์เป็นคำสั่งที่ช้าที่สุดในระบบ) จึงเปลี่ยนมาขอเฉพาะแถวที่กำลังแสดงอยู่บนหน้าจอแทน
 * ซึ่งมีแค่ 20-100 แถวต่อหน้า แล้วเติมลิงก์ลงในตารางที่ render ไปแล้ว
 */
let linksDeferred = false;
const fetchedLinkRows_ = new Set(); // แถวที่ขอลิงก์ไปแล้ว กันขอซ้ำตอนสลับหน้าไปมา

async function loadLinksForRows_(pageRows) {
  const book = currentBook;

  // ผลลัพธ์อาจมาจากหลายแท็บปนกัน (ตอนค้นหาทั้งไฟล์) จึงต้องจัดกลุ่มตามแท็บก่อน แล้วขอทีละแท็บ
  const bySheet = {};
  pageRows.forEach(r => {
    const sheetName = r.sheet || selectedSheet;
    if (!r.row || !sheetName) return;
    if (fetchedLinkRows_.has(`${sheetName}#${r.row}`)) return;
    if (!bySheet[sheetName]) bySheet[sheetName] = [];
    bySheet[sheetName].push(r.row);
  });

  const sheetNames = Object.keys(bySheet);
  if (!sheetNames.length) return;

  await Promise.all(sheetNames.map(async (sheetName) => {
    const need = bySheet[sheetName];
    need.forEach(rowNum => fetchedLinkRows_.add(`${sheetName}#${rowNum}`));
    try {
      const result = await jsonpRequest(apiUrl({
        action: 'rowLinks', book, sheet: sheetName, rows: need.join(',')
      }));
      if (!result.ok || !result.links) return;
      // ถ้าผู้ใช้สลับไฟล์ไปแล้วระหว่างรอ อย่าเขียนทับตารางที่เปลี่ยนไปแล้ว
      if (book !== currentBook) return;

      let changed = false;
      Object.keys(result.links).forEach(rowNumStr => {
        const target = filteredRows.find(r => String(r.row) === rowNumStr && (r.sheet || selectedSheet) === sheetName);
        if (!target) return;
        target.links = Object.assign({}, target.links || {}, result.links[rowNumStr]);
        changed = true;
      });
      if (changed) renderCurrentPage();
    } catch (err) {
      // ขอลิงก์ไม่สำเร็จ ไม่ใช่เรื่องใหญ่ — ตารางยังใช้งานได้ปกติ แค่ช่อง Ticket เป็นข้อความธรรมดา
      // ลบออกจากรายการที่ขอแล้ว เผื่อผู้ใช้สลับกลับมาหน้านี้อีกครั้งจะได้ลองใหม่
      need.forEach(rowNum => fetchedLinkRows_.delete(`${sheetName}#${rowNum}`));
    }
  }));
}

function renderPaginationControls(totalPages) {
  pagination.innerHTML = '';
  if (totalPages <= 1) { pagination.hidden = true; return; }
  pagination.hidden = false;

  const makeButton = (label, page, disabled, active) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('aria-current', active ? 'true' : 'false');
    btn.disabled = !!disabled;
    btn.addEventListener('click', () => { currentPage = page; renderCurrentPage(); });
    return btn;
  };

  pagination.appendChild(makeButton('‹ ก่อนหน้า', currentPage - 1, currentPage === 1, false));

  // จำกัดจำนวนปุ่มเลขหน้าไม่ให้เยอะเกินไปถ้ามีหลายสิบหน้า
  const windowSize = 5;
  let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let endPage = Math.min(totalPages, startPage + windowSize - 1);
  startPage = Math.max(1, endPage - windowSize + 1);

  if (startPage > 1) {
    pagination.appendChild(makeButton('1', 1, false, currentPage === 1));
    if (startPage > 2) pagination.appendChild(makeButton('…', 0, true, false));
  }
  for (let p = startPage; p <= endPage; p++) {
    pagination.appendChild(makeButton(String(p), p, false, p === currentPage));
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pagination.appendChild(makeButton('…', 0, true, false));
    pagination.appendChild(makeButton(String(totalPages), totalPages, false, currentPage === totalPages));
  }

  pagination.appendChild(makeButton('ถัดไป ›', currentPage + 1, currentPage === totalPages, false));
}

/**
 * ตัดชื่อโดเมนในวงเล็บท้ายข้อความออก เช่น "Ticket #880074 (exe.in.th)" -> "Ticket #880074"
 * ให้เลขที่ Ticket อ่านง่ายและแสดงได้ครบในคอลัมน์ที่กว้างจำกัด (URL เต็มยังดูได้จากการชี้เมาส์ค้าง)
 *
 * ตัดเฉพาะวงเล็บที่ "หน้าตาเป็นโดเมน" จริงๆ (มีจุดคั่น ไม่มีเว้นวรรค) เท่านั้น
 * วงเล็บที่เป็นหมายเหตุ เช่น "Ticket #123 (ด่วน)" จะไม่ถูกตัดทิ้ง
 * ต้องใช้สูตรเดียวกับ shortenTicketLabel ใน status.js
 */
function shortenTicketLabel(value) {
  const text = (value || '').toString();
  const shortened = text.replace(/\s*\((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\)\s*$/, '').trim();
  return shortened || text; // กันกรณีตัดแล้วเหลือข้อความว่าง
}

/**
 * ทำให้ทั้งแถวกดได้ เพื่อเปิดรายละเอียดข้อมูลทั้งแถว (ใช้แทนปุ่มดูข้อมูลเดิม)
 *
 * ช่องที่กดแล้วต้องทำอย่างอื่น (ปุ่มแก้ไข/ลบ, ลิงก์ Ticket, dropdown สถานะ)
 * หยุดการส่งต่อคลิกไว้เองด้วย stopPropagation จึงยังใช้งานได้ตามปกติ
 */
function makeRowClickable_(tr, row) {
  tr.classList.add('data-table__row--clickable');
  tr.title = 'คลิกเพื่อดูข้อมูลทั้งหมดของแถวนี้';
  tr.addEventListener('click', () => openCaseModal({
    book: row.book || currentBook,
    sheet: row.sheet || selectedSheet,
    row: row.row
  }));
}

function buildSingleRow(row) {
  const tr = document.createElement('tr');

  // ช่องแรกคือเลขแถวจริงในชีต ช่วยให้อ้างอิงกลับไปหาแถวในชีตได้ตรงกัน
  const rowNumTd = document.createElement('td');
  rowNumTd.className = 'data-table__rownum-col';
  rowNumTd.textContent = row.row;
  tr.appendChild(rowNumTd);

  visibleColumnIndices.forEach(i => {
    const h = currentTableHeaders[i];
    const td = document.createElement('td');
    const cellValue = (row.cells[i] || '').toString();

    if (i === statusColIndex) {
      td.addEventListener('click', (e) => e.stopPropagation()); // ช่องนี้มี dropdown ให้แก้สถานะ
      td.appendChild(buildStatusCell(row, cellValue));
    } else if (isTicketColumn(h)) {
      td.className = 'data-table__ticket-col';
      // ลิงก์จริงอาจซ่อนอยู่หลังข้อความ (เช่น "Ticket #756950" ที่ผูกไฮเปอร์ลิงก์ไว้) — ใช้ลิงก์จริงจาก
      // row.links ถ้ามี ไม่งั้นถ้าข้อความในเซลล์เป็น URL ตรงๆ อยู่แล้วก็ใช้ค่านั้นแทน
      const linkUrl = (row.links && row.links[i]) || (isLikelyUrl(cellValue) ? cellValue.trim() : null);
      if (linkUrl) {
        const link = document.createElement('a');
        link.href = linkUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'ticket-link';
        // ถ้าข้อความในเซลล์เป็นป้ายกำกับที่อ่านง่ายอยู่แล้ว (ไม่ใช่ URL ดิบๆ) ให้แสดงข้อความนั้นเป็นลิงก์เลย
        const label = cellValue && !isLikelyUrl(cellValue) ? shortenTicketLabel(cellValue) : 'เปิด Ticket ↗';
        link.innerHTML = highlightMatch(label, lastKeyword);
        link.title = linkUrl;
        link.addEventListener('click', (e) => e.stopPropagation()); // กดลิงก์ = เปิด Ticket ไม่ใช่เปิดกล่องรายละเอียด
        td.appendChild(link);
      } else {
        td.innerHTML = highlightMatch(cellValue, lastKeyword);
      }
    } else {
      td.innerHTML = highlightMatch(cellValue, lastKeyword);
    }

    tr.appendChild(td);
  });
  tr.appendChild(buildActionsCell(row, tr));
  makeRowClickable_(tr, row);
  return tr;
}

/**
 * ช่องสถานะแบบแก้ไขได้ทันที: แสดงค่าปัจจุบัน + dropdown ให้เลือกเปลี่ยนสถานะ
 * เมื่อเลือกค่าใหม่จะเขียนกลับเข้าชีตจริงทันที (ผ่าน action=updateRow)
 */
function buildStatusCell(row, currentValue) {
  const wrap = document.createElement('div');
  wrap.className = 'status-cell';

  const label = document.createElement('span');
  label.innerHTML = highlightMatch(currentValue, lastKeyword) || '-';
  wrap.appendChild(label);

  const headerName = currentTableHeaders[statusColIndex];
  const headerMeta = currentHeadersMeta.find(h => h.name === headerName);
  const knownValues = new Set(currentRows.map(r => (r.cells[statusColIndex] || '').toString().trim()).filter(Boolean));
  const options = headerMeta && headerMeta.options && headerMeta.options.length > 0
    ? headerMeta.options
    : Array.from(knownValues);

  if (options.length === 0) return wrap;

  const select = document.createElement('select');
  select.className = 'status-cell__select';
  select.title = 'เปลี่ยนสถานะแถวนี้';
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = 'เปลี่ยนสถานะ...';
  select.appendChild(blank);
  options.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    const newValue = select.value;
    if (!newValue || newValue === currentValue.trim()) { select.value = ''; return; }
    updateStatusQuick(row, headerName, newValue, select);
  });
  wrap.appendChild(select);

  return wrap;
}

/** เปลี่ยนแค่ค่าในคอลัมน์สถานะของแถวนี้ แล้วเขียนกลับเข้าชีตจริงทันที */
/**
 * อัปเดตค่าของแถวที่เพิ่งแก้ไข "ในหน่วยความจำ" แล้ววาดตารางใหม่ทันที
 * แทนการโหลดข้อมูลทั้งแท็บใหม่จากเซิร์ฟเวอร์ (ซึ่งกินเวลาหลายวินาที)
 *
 * ปลอดภัยเพราะการ "แก้ไข" ไม่ทำให้ลำดับแถวขยับ (ต่างจากการลบที่ทำให้แถวข้างล่างเลื่อนขึ้น
 * ซึ่งยังต้องโหลดใหม่เสมอ) และ backend ก็ตรวจลายนิ้วมือแถวก่อนเขียนอยู่แล้ว
 *
 * @param {Object} row แถวที่แก้ไข (อ้างอิงเดียวกับที่อยู่ใน currentRows)
 * @param {Object} data ค่าที่เพิ่งบันทึก { ชื่อคอลัมน์: ค่าใหม่ }
 * @param {Array} headerNames ชื่อคอลัมน์เรียงตามตำแหน่งจริงในชีทของแท็บนั้น
 */
function applyRowEditLocally_(row, data, headerNames) {
  if (!row || !Array.isArray(headerNames)) return false;
  let changed = false;
  headerNames.forEach((name, index) => {
    if (data[name] === undefined) return;
    while (row.cells.length <= index) row.cells.push('');
    row.cells[index] = data[name];
    changed = true;
  });
  // วาดเฉพาะหน้าปัจจุบันใหม่ โดยคงโหมดการแสดงผลและหน้าที่ผู้ใช้อยู่ไว้เหมือนเดิม
  // (ห้ามเรียก applyStatusFilterAndRender เพราะมันบังคับกลับไปโหมดแท็บเดียวและเด้งกลับหน้า 1)
  // row.cells เป็น object เดียวกับที่อยู่ใน currentRows/filteredRows อยู่แล้ว ค่าใหม่จึงขึ้นทันที
  if (changed) renderCurrentPage();
  return changed;
}

/**
 * ดึงข้อมูล "ทั้งแถว" มาเติมให้ครบก่อนใช้งาน
 *
 * จำเป็นเพราะตารางรายการส่งมาแค่ไม่กี่คอลัมน์ (วันที่ / EXE ID / Ticket) เพื่อให้โหลดเร็ว
 * ช่องที่เหลือจึงเป็นค่าว่าง ถ้าเอาไปคำนวณลายนิ้วมือแถว (rowFingerprint_) จะได้ค่าที่ไม่ตรงกับในชีต
 * แล้วการแก้ไข/ลบจะถูกปฏิเสธด้วยข้อความ "ข้อมูลแถวนี้เปลี่ยนไปแล้ว" ทั้งที่ไม่มีใครแก้อะไรเลย
 *
 * ดึงมาแล้วเก็บไว้กับแถวนั้น (__fullLoaded) ครั้งต่อไปไม่ต้องดึงซ้ำ
 */
async function ensureFullRow_(row) {
  if (row.__fullLoaded) return row;
  const result = await jsonpRequest(apiUrl({
    action: 'rowFull', book: currentBook, sheet: row.sheet, row: row.row
  }));
  if (!result.ok) throw new Error(result.error || 'โหลดข้อมูลทั้งแถวไม่สำเร็จ');
  row.cells = result.cells;
  row.links = result.links || {};
  row.__fullHeaders = result.headers;
  row.__fullLoaded = true;
  return row;
}

async function updateStatusQuick(row, headerName, newValue, selectEl) {
  const confirmed = confirm(`ยืนยันเปลี่ยนสถานะแถวที่ ${row.row} เป็น "${newValue}" ?`);
  if (!confirmed) { selectEl.value = ''; return; }

  selectEl.disabled = true;
  try {
    await ensureFullRow_(row); // ต้องมีข้อมูลครบทุกคอลัมน์ก่อน ไม่งั้นลายนิ้วมือแถวจะไม่ตรง
    const data = {};
    data[headerName] = newValue;
    const result = await jsonpRequest(apiUrl({
      action: 'updateRow', book: currentBook, sheet: row.sheet, row: row.row,
      data: JSON.stringify(data), fp: rowFingerprint_(row.cells)
    }));
    if (!result.ok) throw new Error(result.error || 'เปลี่ยนสถานะไม่สำเร็จ');

    // อัปเดตเฉพาะแถวนี้ในหน้าจอทันที ไม่ต้องรอโหลดทั้งแท็บใหม่
    const applied = applyRowEditLocally_(row, data, currentTableHeaders);
    if (!applied) {
      if (selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword);
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
    selectEl.disabled = false;
    selectEl.value = '';
  }
}

/** เช็คว่าชื่อคอลัมน์นี้คือคอลัมน์ Ticket หรือไม่ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) ใช้ได้กับทุกไฟล์/ทุกแท็บ */
function isTicketColumn(headerName) {
  return /ticket/i.test((headerName || '').toString());
}

/** เช็คคร่าวๆ ว่าค่านี้หน้าตาเหมือนลิงก์ (ขึ้นต้นด้วย http:// หรือ https://) ก่อนเปลี่ยนเป็นปุ่มลิงก์ */
function isLikelyUrl(value) {
  return /^https?:\/\//i.test((value || '').toString().trim());
}

/** ช่องปุ่มจัดการท้ายแถว: ปุ่มแก้ไข (แก้ไขข้อมูลในชีตจริง) และปุ่มลบ อยู่ด้วยกัน ใช้ได้ทั้งโหมดแท็บเดียวและโหมดทั้งหมด */
function buildActionsCell(row, tr) {
  const actionsTd = document.createElement('td');
  actionsTd.className = 'data-table__actions-col';
  actionsTd.addEventListener('click', (e) => e.stopPropagation()); // กดปุ่มแก้ไข/ลบ ไม่ต้องเปิดกล่องรายละเอียด
  const wrap = document.createElement('div');
  wrap.className = 'data-table__actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'data-table__edit';
  editBtn.textContent = '✎';
  editBtn.title = 'แก้ไขแถวนี้';
  editBtn.addEventListener('click', () => openEditModal(row));
  wrap.appendChild(editBtn);

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'data-table__delete';
  delBtn.textContent = '🗑';
  delBtn.title = 'ลบแถวนี้';
  delBtn.addEventListener('click', () => deleteRow(row, tr, delBtn));
  wrap.appendChild(delBtn);

  actionsTd.appendChild(wrap);
  return actionsTd;
}

/**
 * วัดความกว้างจริงของคอลัมน์ปุ่มแก้ไข/ลบ (ท้ายตาราง) แล้วบันทึกไว้เป็น CSS variable
 * เพื่อให้คอลัมน์ Ticket ที่ตรึงไว้ (sticky) ชิดขวาถัดจากคอลัมน์ปุ่มพอดี ไม่ทับกัน
 * ต้องวัดจริงเพราะความกว้างของปุ่มเปลี่ยนได้ตามฟอนต์/ขนาดจอ
 */
function syncTicketColumnOffset_() {
  const sampleActionsCell = tableBody.querySelector('.data-table__actions-col');
  if (!sampleActionsCell) return;
  const width = sampleActionsCell.getBoundingClientRect().width;
  if (width > 0) {
    tableWrap.style.setProperty('--actions-col-width', `${width}px`);
  }
}

// ขนาดจอเปลี่ยน (เช่น พลิกมือถือ หรือย่อ/ขยายวินโดว์) อาจทำให้ความกว้างคอลัมน์ปุ่มเปลี่ยนไปด้วย วัดซ้ำให้ตรงเสมอ
window.addEventListener('resize', () => syncTicketColumnOffset_());

const createSheetModal = document.getElementById('createSheetModal');
const newSheetName = document.getElementById('newSheetName');
const gridEditor = document.getElementById('gridEditor');
const gridAddRow = document.getElementById('gridAddRow');
const gridAddCol = document.getElementById('gridAddCol');
const gridCancel = document.getElementById('gridCancel');
const gridSave = document.getElementById('gridSave');
const createSheetStatus = document.getElementById('createSheetStatus');

/* ===== สถานะที่รู้จัก — dropdown จะโชว์เฉพาะค่าที่พบจริงในข้อมูล ===== */
// หมายเหตุ: เดิมเคยใช้รายชื่อสถานะตายตัว ตอนนี้เปลี่ยนเป็นดึงค่าจริงจากข้อมูลแทน (setupStatusFilter)

let currentBook = '';
let selectedSheet = ''; // '' = ทุกแท็บในไฟล์นี้
let lastKeyword = '';
let jsonpCounter = 0;
let currentTableHeaders = []; // หัวตารางเต็ม (โหมดแท็บเดียว) หรือ ['แท็บ','แถวที่','ข้อมูล'] (โหมดทั้งหมด)
let visibleColumnIndices = []; // ตำแหน่งคอลัมน์ที่ "มีชื่อหัวตารางจริง" เท่านั้น (โหมดแท็บเดียว) — ใช้ซ่อนคอลัมน์ว่างที่ไม่มีอยู่จริงในชีต
let currentRows = []; // ผลลัพธ์ล่าสุดที่โหลดมา (ก่อนกรองสถานะ)
let statusColIndex = -1; // ตำแหน่งคอลัมน์ "สถานะ" ในโหมดแท็บเดียว (-1 = ไม่มี)
let currentHeadersMeta = []; // [{name, options}] ของแท็บที่กำลังเปิดอยู่ — ใช้ทำ dropdown เปลี่ยนสถานะแบบเร็ว
let lastTruncated = false; // true ถ้าผลลัพธ์ล่าสุดถูกตัดทิ้งบางส่วนเพราะเกินขีดจำกัด
let loadRequestSeq = 0; // ตัวนับคำขอโหลดข้อมูลล่าสุด กันคำขอเก่าที่ตอบช้ากว่ามาเขียนทับผลลัพธ์ใหม่กว่า (เช่น ตอนสลับแท็บ/ค้นหาซ้อนกันเร็วๆ)
let currentPage = 1;
let pageSize = 20; // ตัวเลือก: 20 / 50 / 100
let currentUserEmail = ''; // อีเมลของผู้ที่เข้าสู่ระบบอยู่ตอนนี้ (ใช้แสดงผลเท่านั้น)
// ตั๋วที่ระบบออกให้หลังยืนยันตัวตนกับ Google สำเร็จ ต้องแนบไปกับทุกคำสั่ง
// (ของเดิมส่งแค่อีเมลเปล่าๆ ซึ่งใครก็พิมพ์สวมรอยได้)
let currentSessionToken = '';

document.addEventListener('DOMContentLoaded', () => {
  // ล้างข้อมูลล็อกอินแบบเก่า (เก็บแค่อีเมล) ทิ้ง เพราะใช้ไม่ได้กับระบบตั๋วแล้ว
  localStorage.removeItem('sheetSearchEmail');
  const savedToken = localStorage.getItem('sheetSearchToken');
  if (savedToken) {
    // เคยล็อกอินผ่าน Google จริงมาก่อนในเบราว์เซอร์นี้แล้ว (ตอนกดปุ่ม Sign in with Google ครั้งแรก)
    // ตอนรีเฟรชหน้าเว็บ ไม่ต้องให้กดปุ่ม Google ซ้ำทุกครั้ง แค่เช็คว่าอีเมลนี้ยังอยู่ใน
    // รายชื่อที่อนุญาต (ALLOWED_EMAILS) อยู่ไหมก็พอ (เหมือนตอนก่อนเปลี่ยนมาใช้ Google Sign-In)
    trySessionRestore(savedToken);
  } else {
    loginModal.hidden = false;
  }
  // ปุ่ม Sign in with Google จะถูกวาดตอน Google Identity Services โหลดเสร็จ (ดู onGoogleLibraryLoad ด้านล่าง)
  // ไว้ใช้ตอนล็อกอินครั้งแรก หรือตอน trySessionRestore ด้านบนล้มเหลว (เช่นอีเมลถูกถอนสิทธิ์ไปแล้ว)
});

/** เช็คอีเมลที่เคยล็อกอินไว้ (จำใน localStorage) กับรายชื่อที่อนุญาตอีกครั้งตอนรีเฟรชหน้าเว็บ โดยไม่ต้องกดปุ่ม Google ซ้ำ */
async function trySessionRestore(token) {
  setLoginStatus('กำลังเข้าสู่ระบบ...', null);
  try {
    const result = await jsonpRequest(rawApiUrl({ action: 'session', token }));
    if (!result.ok) throw new Error(result.error || 'เข้าสู่ระบบไม่สำเร็จ');

    currentSessionToken = token;
    currentUserEmail = result.email;
    loginModal.hidden = true;
    topbarAccount.hidden = false;
    setTopbarAccountEmail(currentUserEmail);
    setAdminLinkVisible(result.isAdmin);
    appLayout.hidden = false;
    setLoginStatus('', null);
    const books = await loadBooks();
    restoreLastView(books);
    initGlobalDashboard();
  } catch (err) {
    // อีเมลนี้อาจถูกถอนสิทธิ์ไปแล้ว หรือ session เก่าใช้ไม่ได้แล้ว ให้กลับไปหน้าล็อกอินด้วย Google ปกติ
    localStorage.removeItem('sheetSearchToken');
    currentSessionToken = '';
    loginModal.hidden = false;
    setLoginStatus('', null);
  }
}

/* ===== เข้าสู่ระบบ / ออกจากระบบ ด้วย Google Sign-In จริง ===== */

/**
 * Google Identity Services (สคริปต์ https://accounts.google.com/gsi/client) จะเรียกฟังก์ชันนี้
 * เองอัตโนมัติทันทีที่โหลดเสร็จ (เป็นชื่อฟังก์ชันที่ไลบรารีนี้กำหนดไว้ ไม่ต้องเรียกเอง)
 */
window.onGoogleLibraryLoad = function () {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('ใส่ Client ID') === 0) {
    setLoginStatus('ผู้ดูแลยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID ใน config.js', 'error');
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    // auto_select: false — ปิดไว้เพื่อไม่ให้ปุ่มแสดงชื่อ/อีเมลของบัญชี Google ที่ล็อกอินอยู่ในเบราว์เซอร์
    // (ถ้าเปิดไว้ ปุ่มจะกลายเป็น "ลงชื่อเข้าใช้เป็น <ชื่อ> <อีเมล>" แทนปุ่ม Sign in with Google ปกติ)
    auto_select: false,
    cancel_on_tap_outside: false,
  });
  google.accounts.id.renderButton(googleSignInButton, {
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    width: 280,
  });
  // หมายเหตุ: ไม่ได้เรียก google.accounts.id.prompt() (One Tap) เพื่อล็อกอินอัตโนมัติตอนรีเฟรช
  // เพราะ One Tap ไม่เสถียร (มีเงื่อนไข/cooldown เยอะ บางเบราว์เซอร์ไม่ขึ้นให้) — ใช้ trySessionRestore()
  // ด้านบนแทน ซึ่งเช็คกับรายชื่อที่อนุญาตตรงๆ ไม่ต้องพึ่ง Google popup ทุกครั้งที่รีเฟรช
};

/** เรียกโดย Google หลังผู้ใช้กดเข้าสู่ระบบสำเร็จ (ปุ่ม Sign in with Google หรือ One Tap) พร้อม ID token ที่เซ็นชื่อมาจริงจาก Google */
function handleGoogleCredential(response) {
  tryLoginGoogle(response.credential);
}

async function tryLoginGoogle(idToken) {
  setLoginStatus('กำลังตรวจสอบกับ Google...', null);
  try {
    const result = await jsonpRequest(rawApiUrl({ action: 'loginGoogle', credential: idToken }));
    if (!result.ok) throw new Error(result.error || 'เข้าสู่ระบบไม่สำเร็จ');

    if (!result.token) throw new Error('ระบบไม่ได้ออกตั๋วเข้าใช้งานมาให้ กรุณาตรวจสอบว่าได้ Deploy โค้ดฝั่ง Apps Script เวอร์ชันล่าสุดแล้ว');
    currentSessionToken = result.token;
    currentUserEmail = result.email;
    localStorage.setItem('sheetSearchToken', currentSessionToken);
    loginModal.hidden = true;
    topbarAccount.hidden = false;
    setTopbarAccountEmail(currentUserEmail);
    setAdminLinkVisible(result.isAdmin);
    appLayout.hidden = false;
    const books = await loadBooks();
    restoreLastView(books);
    initGlobalDashboard();
  } catch (err) {
    localStorage.removeItem('sheetSearchToken');
    currentSessionToken = '';
    loginModal.hidden = false;
    setLoginStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    // ถ้าล็อกอินอัตโนมัติ (One Tap) ล้มเหลว (เช่นอีเมลถูกถอนสิทธิ์ไปแล้ว) ให้เลิกจำไว้ จะได้ไม่วนล็อกอินซ้ำเงียบๆ อีก
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  }
}

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('sheetSearchToken');
  currentSessionToken = '';
  localStorage.removeItem('sheetSearchLastBook');
  localStorage.removeItem('sheetSearchLastSheet');
  currentUserEmail = '';
  currentBook = '';
  selectedSheet = '';
  appLayout.hidden = true;
  topbarAccount.hidden = true;
  if (folderBar) { folderBar.hidden = true; folderBar.innerHTML = ''; }
  setAdminLinkVisible(false);
  setLoginStatus('', null);
  loginModal.hidden = false;
  // ต้องหยุดตัวจับเวลารีเฟรช Dashboard ด้วย ไม่งั้นมันจะยิง request ต่อไปเรื่อยๆ ทั้งที่ออกจากระบบแล้ว
  // และ error ที่เกิดขึ้นจะไปโผล่ซ้อนอยู่หลังหน้าจอเข้าสู่ระบบ
  if (globalDashboardTimer) {
    clearInterval(globalDashboardTimer);
    globalDashboardTimer = null;
  }
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
});

/**
 * เมื่อรีเฟรชหน้าเว็บไซต์แล้วล็อกอินอัตโนมัติสำเร็จ ให้กลับไปที่ไฟล์และแท็บล่าสุดที่เปิดไว้
 * (จำไว้ใน localStorage ของเบราว์เซอร์นี้เท่านั้น) แทนที่จะย้อนกลับไปหน้าเริ่มต้นเปล่าๆ ทุกครั้ง
 */
function restoreLastView(books) {
  try {
    const savedBook = localStorage.getItem('sheetSearchLastBook');
    if (savedBook && Array.isArray(books) && books.includes(savedBook)) {
      const savedSheet = localStorage.getItem('sheetSearchLastSheet') || '';
      openBook(savedBook, savedSheet);
    }
  } catch (e) {
    // ถ้าอ่าน localStorage ไม่ได้ด้วยเหตุผลใดก็ตาม ก็แค่ไม่ย้อนกลับ ไม่ต้องทำให้หน้าเว็บพัง
  }
}

function setLoginStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.className = 'modal-box__status' + (type ? ` modal-box__status--${type}` : '');
}

/* ===== เครื่องมือกลาง ===== */

const JSONP_TIMEOUT_MS = 30000; // เผื่อคำสั่งที่ใช้เวลานาน เช่น Dashboard ที่ต้องไล่อ่านทุกไฟล์
// แท็บที่มีข้อมูลหลักพันแถว (เช่น "ชีทพิจารณาปลด" ~8,500 แถว) การโหลดครั้งแรกตอนแคชยังว่าง
// ใช้เวลานานกว่า 30 วินาทีได้ จึงให้เวลามากกว่าคำสั่งทั่วไป ดีกว่าขึ้นข้อความผิดพลาดทั้งที่กำลังโหลดอยู่
const BIG_TAB_TIMEOUT_MS = 120000;

/**
 * จำนวนแถวที่ขอจากเซิร์ฟเวอร์ต่อ 1 คำขอ
 * ตั้งไว้ 2,500 เพราะคำตอบจะมีขนาดราว 1 MB ซึ่งส่งทันสบายๆ
 * (ถ้าขอทั้งแท็บ 9,000 แถวในคำขอเดียว คำตอบจะราว 4.4 MB ส่งไม่ทันจนหมดเวลา)
 */
const TAB_CHUNK_SIZE = 2500;

/**
 * ยิง request ไปหา Apps Script แบบ JSONP (ใช้แทน fetch เพราะติดปัญหา CORS)
 *
 * สำคัญ: ต้องมี timeout เสมอ เพราะถ้า Apps Script ตอบกลับมาเป็นหน้า HTML (เช่น โควตาหมด
 * หรือ deployment หมดอายุ) มันจะไม่เรียก callback และ onerror ก็ไม่ทำงาน (เพราะ HTTP 200)
 * Promise จะค้างตลอดกาล ทำให้ปุ่มขึ้น "กำลังโหลด..." ค้างและกดอะไรไม่ได้อีกเลยจนกว่าจะรีเฟรช
 */
function jsonpRequest(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonpCallback_${Date.now()}_${jsonpCounter++}`;
    const script = document.createElement('script');
    let timer = null;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    };
    window[callbackName] = (data) => { cleanup(); resolve(data); };
    script.onerror = () => { cleanup(); reject(new Error('เชื่อมต่อ API ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่')); };
    timer = setTimeout(() => {
      cleanup();
      reject(new Error('เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด อาจใช้เวลานานเกินไปหรือระบบมีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง'));
    }, timeoutMs || JSONP_TIMEOUT_MS);
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

/**
 * สร้าง "ลายนิ้วมือ" ของแถวจากค่าในทุกเซลล์ ส่งไปให้ backend ตรวจก่อนลบ/แก้ไข
 * ว่าแถวนั้นยังเป็นแถวเดียวกับที่เห็นบนหน้าจอจริงไหม (กันกรณีมีคนอื่นลบแถวข้างบนไปแล้วแถวเลื่อน)
 * ต้องใช้สูตรเดียวกันเป๊ะกับฝั่ง backend (ฟังก์ชัน rowFingerprint_ ใน Code.gs)
 */
function rowFingerprint_(cells) {
  const str = (cells || []).map(c => (c === null || c === undefined) ? '' : c.toString().trim()).join('\u0001');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function rawApiUrl(params) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  parts.push(`key=${encodeURIComponent(ACCESS_KEY)}`);
  return `${API_URL}?${parts.join('&')}`;
}

function apiUrl(params) {
  return rawApiUrl(Object.assign({ token: currentSessionToken }, params));
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

/**
 * แปลงวันที่ให้แสดงผลเป็น วัน/เดือน/ปี (dd/MM/yyyy) เสมอทั้งเว็บ
 * รับได้ทั้งรูปแบบ yyyy-MM-dd ที่ backend ส่งมา และค่าที่ <input type="date"> ให้มา
 * (เก็บค่าจริงไว้เป็น yyyy-MM-dd เหมือนเดิม เปลี่ยนแค่ตอนแสดงผล)
 */
function formatDateDisplay(value) {
  const str = (value || '').toString().trim();
  if (!str) return '';
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return str;
}

/** แปลงวันที่+เวลา ให้เป็น วัน/เดือน/ปี เวลา (ใช้ปี ค.ศ. ให้ตรงกับที่อื่นทั้งเว็บ) */
function formatDateTime(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return isoString;
  }
}

/* ===== ซ้าย: รายชื่อไฟล์ ===== */

async function loadBooks() {
  if (!API_URL || API_URL.includes('วาง_URL')) {
    booksHint.textContent = 'ยังไม่ได้ตั้งค่า API_URL ใน config.js';
    return [];
  }
  booksHint.textContent = 'กำลังโหลด...';
  try {
    const result = await jsonpRequest(apiUrl({ action: 'books' }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายชื่อไฟล์ไม่สำเร็จ');
    booksHint.textContent = '';
    renderFolderBar(result.folders || []);
    return result.books;
  } catch (err) {
    booksHint.textContent = 'เกิดข้อผิดพลาด: ' + err.message;
    return [];
  }
}


/* ===== แถบโฟลเดอร์ด้านบน ===== */

/**
 * แถบโฟลเดอร์จัดกลุ่มไฟล์ชีตตามเกม/ประเภท (เติมเงิน / Zone 4 / TOSM / 9Yin)
 * กดที่โฟลเดอร์แล้วจะมีรายชื่อไฟล์ในโฟลเดอร์นั้นเลื่อนลงมาให้เลือก
 *
 * การจัดกลุ่มมาจากฝั่งเซิร์ฟเวอร์ (Script Property "BOOK_FOLDERS_JSON")
 * ไฟล์ที่เพิ่มเข้ามาใหม่และยังไม่ได้จัดกลุ่ม จะไปอยู่ในโฟลเดอร์ "อื่นๆ" ให้เอง ไม่หายไปไหน
 */
let knownFolders = []; // รายชื่อโฟลเดอร์ล่าสุด ใช้เติมกล่องเลือกโฟลเดอร์ในฟอร์มเพิ่ม/สร้างไฟล์

/** เติมตัวเลือกโฟลเดอร์ในฟอร์ม โดยคงค่าที่ผู้ใช้เลือกไว้ถ้ายังมีโฟลเดอร์นั้นอยู่ */
function fillFolderSelects_() {
  [addBookFolder, createBookFolder].forEach(select => {
    if (!select) return;
    const previous = select.value;
    const names = knownFolders.map(f => f.name);
    select.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
    select.value = names.indexOf(previous) !== -1 ? previous : (names[0] || '');
  });
}

function renderFolderBar(folders) {
  if (!folderBar || !folderList) return;
  knownFolders = folders || [];
  fillFolderSelects_();
  if (!folders.length) {
    folderBar.hidden = true;
    return;
  }

  folderList.innerHTML = '';
  folders.forEach(folder => {
    const wrap = document.createElement('div');
    wrap.className = 'folder';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'folder__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span class="folder__emoji">📁</span><span class="folder__name"></span>`
      + `<span class="folder__count">${folder.books.length}</span><span class="folder__caret">▾</span>`;
    btn.querySelector('.folder__name').textContent = folder.name;
    wrap.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'folder__menu';
    menu.hidden = true;

    if (folder.books.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'folder__empty';
      empty.textContent = 'ยังไม่มีไฟล์ในโฟลเดอร์นี้';
      menu.appendChild(empty);
    } else {
      folder.books.forEach(book => {
        const line = document.createElement('div');
        line.className = 'folder__line';

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'folder__item';
        item.textContent = book;
        item.title = book;
        item.dataset.book = book;
        item.addEventListener('click', () => {
          closeAllFolders();
          openBook(book);
        });

        // ปุ่มเปลี่ยนชื่อ/เอาไฟล์ออก ย้ายมาจากรายชื่อไฟล์แถบซ้ายที่เอาออกไปแล้ว
        const renameBtn = document.createElement('button');
        renameBtn.type = 'button';
        renameBtn.className = 'folder__icon';
        renameBtn.textContent = '✎';
        renameBtn.title = `เปลี่ยนชื่อไฟล์ "${book}"`;
        renameBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeAllFolders();
          renameBookPrompt(book);
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'folder__icon folder__icon--danger';
        removeBtn.textContent = '×';
        removeBtn.title = `เอาไฟล์ "${book}" ออกจากระบบ`;
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeAllFolders();
          removeBook(book, null);
        });

        line.append(item, renameBtn, removeBtn);
        menu.appendChild(line);
      });
    }

    // ปุ่มเพิ่มไฟล์ของโฟลเดอร์นี้ อยู่ล่างสุดของเมนูเสมอ (แทนปุ่มบนแถบด้านบนที่เอาออกไปแล้ว)
    // กดแล้วเปิดฟอร์มเพิ่มไฟล์โดยเลือกโฟลเดอร์นี้ไว้ให้ ไม่ต้องมาเลือกเองอีกรอบ
    const addLine = document.createElement('button');
    addLine.type = 'button';
    addLine.className = 'folder__add';
    addLine.innerHTML = '<span class="folder__add-plus">+</span> เพิ่มไฟล์';
    addLine.title = `เพิ่มไฟล์เข้าโฟลเดอร์ "${folder.name}"`;
    addLine.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllFolders();
      openAddFilePanel_(folder.name);
    });
    menu.appendChild(addLine);

    wrap.appendChild(menu);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = menu.hidden;
      closeAllFolders();
      if (willOpen) {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        wrap.setAttribute('data-open', 'true');
      }
    });

    folderList.appendChild(wrap);
  });

  folderBar.hidden = false;
  markActiveFolderItem();
}

function closeAllFolders() {
  if (!folderBar) return;
  folderBar.querySelectorAll('.folder__menu').forEach(m => { m.hidden = true; });
  folderBar.querySelectorAll('.folder__btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  folderBar.querySelectorAll('.folder').forEach(f => f.removeAttribute('data-open'));
}

/** ไฮไลต์ไฟล์ที่กำลังเปิดอยู่ และโฟลเดอร์ที่ไฟล์นั้นอยู่ */
function markActiveFolderItem() {
  if (!folderBar) return;
  folderBar.querySelectorAll('.folder__item').forEach(item => {
    const isActive = item.dataset.book === currentBook;
    item.setAttribute('data-active', String(isActive));
    const folder = item.closest('.folder');
    if (isActive && folder) folder.setAttribute('data-active', 'true');
  });
  folderBar.querySelectorAll('.folder').forEach(folder => {
    const has = Array.from(folder.querySelectorAll('.folder__item'))
      .some(i => i.dataset.book === currentBook);
    if (!has) folder.removeAttribute('data-active');
  });
}

// คลิกที่อื่นในหน้าเว็บให้ปิดเมนูโฟลเดอร์ที่เปิดค้างอยู่
document.addEventListener('click', () => closeAllFolders());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllFolders(); });

async function renameBookPrompt(book) {
  const newName = (prompt(`ตั้งชื่อใหม่สำหรับไฟล์ "${book}"`, book) || '').trim();
  if (!newName || newName === book) return;

  try {
    const result = await jsonpRequest(apiUrl({ action: 'renameBook', oldName: book, newName }));
    if (!result.ok) throw new Error(result.error || 'เปลี่ยนชื่อไม่สำเร็จ');

    if (currentBook === book) currentBook = newName;
    await loadBooks(); // ชื่อใหม่ต้องขึ้นในโฟลเดอร์ด้านบนทันที
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

    if (itemEl) itemEl.remove();
    await loadBooks(); // อัปเดตโฟลเดอร์ด้านบนให้ตรงกับไฟล์ที่เหลืออยู่จริง
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

/** ปิดฟอร์มเพิ่มไฟล์ แล้วล้างค่าที่กรอกไว้ (ใช้ร่วมกันทั้งปุ่มบนแถบด้านบนและปุ่มยกเลิกในฟอร์ม) */
function closeAddFilePanel_() {
  addFilePanel.hidden = true;
  addBookName.value = '';
  addBookUrl.value = '';
  if (addBookFile) addBookFile.value = '';
  setAddMode_('link');
}

/**
 * เปิดฟอร์มเพิ่มไฟล์ พร้อมเลือกโฟลเดอร์ปลายทางไว้ให้
 * เรียกจากปุ่ม "+ เพิ่มไฟล์" ท้ายเมนูของแต่ละโฟลเดอร์ จึงรู้อยู่แล้วว่าจะเอาไฟล์ไปไว้ที่ไหน
 */
function openAddFilePanel_(folderName) {
  bookTrashPanel.hidden = true;
  createBookPanel.hidden = true;
  createBookToggle.textContent = '+ สร้างไฟล์ Google Sheet';
  addFilePanel.hidden = false;
  addBookName.value = '';
  addBookUrl.value = '';
  if (addBookFile) addBookFile.value = '';
  setAddMode_('link');
  // เลือกโฟลเดอร์ที่กดมาไว้ให้เลย ถ้าไม่มีชื่อนี้ในรายการก็ปล่อยเป็นค่าเดิม
  if (addBookFolder && folderName) {
    const match = Array.from(addBookFolder.options).some(o => o.value === folderName);
    if (match) addBookFolder.value = folderName;
  }
  addBookName.focus();
}

if (addBookCancel) addBookCancel.addEventListener('click', closeAddFilePanel_);

/* ===== เพิ่มไฟล์: เลือกได้ว่าจะวางลิงก์ หรือแนบไฟล์จากเครื่อง ===== */

let addMode = 'link'; // 'link' = วางลิงก์ Google Sheet | 'file' = แนบไฟล์ .xlsx/.xls/.csv จากเครื่อง

function setAddMode_(mode) {
  addMode = mode;
  const isFile = mode === 'file';
  addModeLink.dataset.active = String(!isFile);
  addModeFile.dataset.active = String(isFile);
  addBookUrlField.hidden = isFile;
  addBookFileField.hidden = !isFile;
  addBookSubmit.textContent = isFile ? 'นำเข้าไฟล์' : 'เพิ่มไฟล์';
  setAddBookStatus('', null);
}

addModeLink.addEventListener('click', () => setAddMode_('link'));
addModeFile.addEventListener('click', () => setAddMode_('file'));

// ชื่อไฟล์ว่างอยู่ ให้เติมชื่อไฟล์ที่แนบมาให้อัตโนมัติ (ตัดนามสกุลออก)
addBookFile.addEventListener('change', () => {
  const file = addBookFile.files && addBookFile.files[0];
  if (file && !addBookName.value.trim()) {
    addBookName.value = file.name.replace(/\.(xlsx|xls|csv)$/i, '');
  }
});

/**
 * ความยาวสูงสุดของข้อมูลต่อ 1 คำขอตอนนำเข้าไฟล์ นับเป็น "ความยาวหลังเข้ารหัสใส่ URL"
 *
 * ระบบนี้คุยกับ Apps Script ด้วย JSONP ซึ่งส่งข้อมูลผ่าน URL จึงส่งไฟล์ทั้งก้อนไม่ได้
 * หน้าเว็บจึงอ่านไฟล์เองในเบราว์เซอร์ แล้วทยอยส่งข้อมูลเป็นชุดๆ
 *
 * สำคัญ: ต้องวัดความยาว "หลัง encodeURIComponent" ไม่ใช่ความยาวข้อความดิบ
 * เพราะภาษาไทย 1 ตัวอักษรกลายเป็น 9 ตัวอักษรใน URL (เช่น ก → %E0%B8%81)
 * ถ้าวัดจากข้อความดิบ ข้อมูลภาษาไทย 5,000 ตัวอักษรจะกลายเป็น URL ยาวเกือบ 40,000 ตัวอักษร
 * ซึ่งเกินเพดานของเซิร์ฟเวอร์ไปมาก และคำขอจะล้มเหลวทั้งชุด
 */
const UPLOAD_CHUNK_URL_CHARS = 6000; // เผื่อที่ให้ส่วนอื่นของ URL (token, key, ชื่อไฟล์) อีกราว 2,000
const UPLOAD_MAX_ROWS_PER_CALL = 200; // ต้องไม่เกินค่าเดียวกันที่ฝั่ง Code.gs กำหนดไว้

/** ความยาวจริงของข้อความนี้เมื่อใส่ลงไปใน URL */
function urlLength_(text) {
  return encodeURIComponent(text).length;
}

/**
 * แบ่งแถวเป็นชุดๆ ให้แต่ละชุดไม่ยาวเกินขีดจำกัดของ URL และไม่เกินจำนวนแถวต่อครั้ง
 * ถ้ามีแถวเดียวที่ยาวเกินขีดจำกัด จะ throw ออกไปพร้อมบอกว่าเป็นแถวที่เท่าไหร่
 * (ส่งต่อไปก็ล้มเหลวอยู่ดี บอกให้ชัดดีกว่าปล่อยให้พังแบบไม่รู้สาเหตุ)
 */
function chunkRowsForUpload_(rows) {
  const chunks = [];
  let current = [];
  // เริ่มที่ 6 เพราะวงเล็บก้ามปูเปิด-ปิดของ JSON array กลายเป็น %5B และ %5D อย่างละ 3 ตัวอักษร
  const BRACKETS = 6;
  const COMMA = 3; // เครื่องหมายจุลภาคคั่นแถว กลายเป็น %2C
  let size = BRACKETS;

  for (let i = 0; i < rows.length; i++) {
    const len = urlLength_(JSON.stringify(rows[i])) + COMMA;
    if (len + BRACKETS > UPLOAD_CHUNK_URL_CHARS) {
      throw new Error(`แถวที่ ${i + 1} ของไฟล์มีข้อมูลยาวเกินไป (ส่งผ่านระบบนี้ได้ไม่เกินราว ${UPLOAD_CHUNK_URL_CHARS} ตัวอักษรต่อแถว) กรุณาย่อข้อมูลแถวนั้นก่อน`);
    }
    if (current.length > 0 && (size + len > UPLOAD_CHUNK_URL_CHARS || current.length >= UPLOAD_MAX_ROWS_PER_CALL)) {
      chunks.push(current);
      current = [];
      size = BRACKETS;
    }
    current.push(rows[i]);
    size += len;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/** อ่านไฟล์ Excel/CSV ในเบราว์เซอร์ แล้วคืนรายการแถวของแท็บแรก */
function readSpreadsheetFile_(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
    if (typeof XLSX === 'undefined') {
      // ไลบรารีอ่านไฟล์ Excel โหลดมาจาก CDN ภายนอก ถ้าเน็ตมีปัญหาหรือถูกบล็อกจะไม่มีตัวนี้
      reject(new Error('ตัวอ่านไฟล์ Excel ยังโหลดไม่เสร็จหรือถูกบล็อก กรุณารีเฟรชหน้าเว็บแล้วลองใหม่ หรือใช้วิธีวางลิงก์ Google Sheet แทน'));
      return;
    }
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        if (!firstSheetName) throw new Error('ไฟล์นี้ไม่มีแท็บข้อมูล');
        // defval: '' เพื่อให้ช่องว่างยังนับเป็นคอลัมน์ ไม่ทำให้คอลัมน์เลื่อน
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheetName], { header: 1, defval: '', raw: false });
        const trimmed = rows.filter(r => r.some(c => (c || '').toString().trim() !== ''));
        if (trimmed.length === 0) throw new Error('ไฟล์นี้ไม่มีข้อมูล');
        resolve({ sheetName: firstSheetName, rows: trimmed, totalSheets: wb.SheetNames.length });
      } catch (err) {
        reject(new Error('อ่านไฟล์ไม่สำเร็จ: ' + err.message));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

addBookSubmit.addEventListener('click', async () => {
  const name = addBookName.value.trim();
  const folder = addBookFolder ? addBookFolder.value : '';

  if (!name) { setAddBookStatus('กรุณากรอกชื่อไฟล์', 'error'); return; }

  if (addMode === 'file') {
    await importBookFromFile_(name, folder);
    return;
  }

  const sheetUrl = addBookUrl.value.trim();
  if (!sheetUrl) { setAddBookStatus('กรุณาวางลิงก์ Google Sheet', 'error'); return; }

  addBookSubmit.disabled = true;
  setAddBookStatus('กำลังตรวจสอบและเพิ่มไฟล์...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'addBook', name, sheetUrl, folder }));
    if (!result.ok) throw new Error(result.error || 'เพิ่มไฟล์ไม่สำเร็จ');

    setAddBookStatus(result.message, 'success');
    addBookName.value = ''; addBookUrl.value = '';
    await loadBooks(); // ไฟล์ใหม่ต้องไปโผล่ในโฟลเดอร์ด้านบนทันที
  } catch (err) {
    setAddBookStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    addBookSubmit.disabled = false;
  }
});

/**
 * นำเข้าไฟล์จากเครื่อง: อ่านไฟล์ในเบราว์เซอร์ → สร้างไฟล์ Google Sheet ใหม่ → ทยอยส่งข้อมูลเข้าไป
 *
 * ถ้าส่งข้อมูลไม่ครบกลางคัน ไฟล์ที่สร้างไว้จะยังอยู่พร้อมข้อมูลเท่าที่ส่งไปได้
 * จึงต้องบอกผู้ใช้ให้ชัดว่าเข้าไปได้กี่แถว ไม่ใช่แจ้งแค่ว่าล้มเหลวเฉยๆ
 */
async function importBookFromFile_(name, folder) {
  const file = addBookFile.files && addBookFile.files[0];
  if (!file) { setAddBookStatus('กรุณาเลือกไฟล์จากเครื่องก่อน', 'error'); return; }

  addBookSubmit.disabled = true;
  let createdBook = '';
  let sent = 0;
  try {
    setAddBookStatus('กำลังอ่านไฟล์...', null);
    const parsed = await readSpreadsheetFile_(file);
    const chunks = chunkRowsForUpload_(parsed.rows);

    // ข้อมูลต้องส่งทีละชุดผ่าน URL ไฟล์ใหญ่จึงใช้เวลานาน บอกให้ผู้ใช้ตัดสินใจก่อน
    if (chunks.length > 40) {
      const minutes = Math.ceil(chunks.length * 1.5 / 60);
      const go = confirm(
        `ไฟล์นี้มี ${parsed.rows.length.toLocaleString()} แถว ต้องส่งข้อมูล ${chunks.length} รอบ ` +
        `คาดว่าใช้เวลาประมาณ ${minutes} นาที\n\nระหว่างนี้ห้ามปิดหน้าเว็บ ต้องการทำต่อหรือไม่?`
      );
      if (!go) { setAddBookStatus('ยกเลิกการนำเข้าแล้ว', null); addBookSubmit.disabled = false; return; }
    }

    setAddBookStatus('กำลังสร้างไฟล์ Google Sheet ใหม่...', null);
    const created = await jsonpRequest(apiUrl({
      action: 'createBook', name, sheetName: parsed.sheetName, folder
    }));
    if (!created.ok) throw new Error(created.error || 'สร้างไฟล์ไม่สำเร็จ');
    createdBook = created.bookName || name;
    const targetSheet = created.sheetName || parsed.sheetName;

    for (let i = 0; i < chunks.length; i++) {
      setAddBookStatus(`กำลังนำเข้าข้อมูล... ${sent.toLocaleString()} / ${parsed.rows.length.toLocaleString()} แถว`, null);
      const res = await jsonpRequest(apiUrl({
        action: 'uploadRows', book: createdBook, sheet: targetSheet, rows: JSON.stringify(chunks[i])
      }));
      if (!res.ok) throw new Error(res.error || 'นำเข้าข้อมูลไม่สำเร็จ');
      sent += chunks[i].length;
    }

    const note = parsed.totalSheets > 1
      ? ` (ไฟล์ต้นฉบับมี ${parsed.totalSheets} แท็บ ระบบนำเข้าให้เฉพาะแท็บแรก)`
      : '';
    setAddBookStatus(`นำเข้าไฟล์ "${createdBook}" สำเร็จ ${sent.toLocaleString()} แถว${note}`, 'success');
    addBookName.value = '';
    addBookFile.value = '';
    await loadBooks();
  } catch (err) {
    if (createdBook) {
      setAddBookStatus(`นำเข้าได้ ${sent.toLocaleString()} แถวแล้วหยุดเพราะ: ${err.message} — ไฟล์ "${createdBook}" ถูกสร้างไว้แล้ว ตรวจสอบแล้วลองนำเข้าส่วนที่เหลือเองได้`, 'error');
      await loadBooks();
    } else {
      setAddBookStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    }
  } finally {
    addBookSubmit.disabled = false;
  }
}

function setAddBookStatus(message, type) {
  addBookStatus.textContent = message;
  addBookStatus.className = 'sidebar-panel__status' + (type ? ` sidebar-panel__status--${type}` : '');
}

/* ===== สร้างไฟล์ Google Sheet ใหม่ทั้งไฟล์ (ยังไม่มีมาก่อน) ===== */

/** ปิดฟอร์มสร้างไฟล์ใหม่ แล้วล้างค่าที่กรอกไว้ */
function closeCreateBookPanel_() {
  createBookPanel.hidden = true;
  createBookToggle.textContent = '+ สร้างไฟล์ Google Sheet';
  createBookName.value = '';
  createBookSheetName.value = '';
  setCreateBookStatus('', null);
}

createBookToggle.addEventListener('click', () => {
  const isOpen = !createBookPanel.hidden;
  if (isOpen) { closeCreateBookPanel_(); return; }

  addFilePanel.hidden = true;
  bookTrashPanel.hidden = true;
  bookTrashToggle.textContent = '🗑 ถังขยะไฟล์';
  createBookPanel.hidden = false;
  createBookToggle.textContent = '+ สร้างไฟล์ Google Sheet';
  createBookName.value = '';
  createBookSheetName.value = '';
  setCreateBookStatus('', null);
});

if (createBookCancel) createBookCancel.addEventListener('click', closeCreateBookPanel_);

createBookSubmit.addEventListener('click', async () => {
  const name = createBookName.value.trim();
  const sheetName = createBookSheetName.value.trim();
  if (!name) { setCreateBookStatus('กรุณากรอกชื่อไฟล์', 'error'); return; }

  createBookSubmit.disabled = true;
  setCreateBookStatus('กำลังสร้างไฟล์ Google Sheet ใหม่...', null);
  try {
    const result = await jsonpRequest(apiUrl({
      action: 'createBook', name, sheetName,
      folder: createBookFolder ? createBookFolder.value : ''
    }));
    if (!result.ok) throw new Error(result.error || 'สร้างไฟล์ไม่สำเร็จ');

    createBookStatus.innerHTML = `${escapeHtml(result.message)} — <a href="${result.url}" target="_blank" rel="noopener noreferrer">เปิดไฟล์ใน Google Sheets ↗</a>`;
    createBookStatus.className = 'sidebar-panel__status sidebar-panel__status--success';
    createBookName.value = ''; createBookSheetName.value = '';
    await loadBooks(); // ไฟล์ใหม่ต้องไปโผล่ในโฟลเดอร์ด้านบนทันที
  } catch (err) {
    setCreateBookStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    createBookSubmit.disabled = false;
  }
});

function setCreateBookStatus(message, type) {
  createBookStatus.textContent = message;
  createBookStatus.className = 'sidebar-panel__status' + (type ? ` sidebar-panel__status--${type}` : '');
}

/* ===== ถังขยะไฟล์ ===== */

bookTrashToggle.addEventListener('click', () => {
  const isOpen = !bookTrashPanel.hidden;
  bookTrashPanel.hidden = isOpen;
  addFilePanel.hidden = true;
  createBookPanel.hidden = true;
  createBookToggle.textContent = '+ สร้างไฟล์ Google Sheet';
  bookTrashToggle.textContent = '🗑 ถังขยะไฟล์';
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
    await loadBooks(); // ไฟล์ที่กู้คืนต้องกลับมาอยู่ในโฟลเดอร์ด้านบนทันที
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

async function openBook(book, initialSheet) {
  if (book !== currentBook && !confirmDiscardAddForm_()) return;
  currentBook = book;
  selectedSheet = '';
  lastKeyword = '';
  input.value = '';

  try { localStorage.setItem('sheetSearchLastBook', book); } catch (e) { /* ignore */ }

  mainEmpty.hidden = true;
  workspace.hidden = false;

  markActiveFolderItem();

  resetPanels();
  statusFilter.hidden = true;
  manageToggle.hidden = true;
  tabsBar.innerHTML = '';
  showHint('กำลังโหลดรายชื่อแท็บ...', false);

  try {
    const result = await jsonpRequest(apiUrl({ action: 'sheets', book }));
    if (!result.ok) throw new Error(result.error || 'โหลดแท็บไม่สำเร็จ');
    renderTabs(result.sheets);
    // ถ้าระบุแท็บล่าสุดไว้ (เช่น ตอนรีเฟรชหน้าเว็บ) และแท็บนั้นยังมีอยู่จริง ให้เปิดแท็บนั้นต่อ
    // ไม่งั้นเปิดแท็บแรกของไฟล์ให้เลย (ไม่มีโหมดรวมทุกแท็บแล้ว)
    const sheetToSelect = (initialSheet && result.sheets.some(s => s.name === initialSheet))
      ? initialSheet
      : (result.sheets[0] ? result.sheets[0].name : '');
    if (sheetToSelect) {
      selectTab(sheetToSelect);
    } else {
      showHint('ไฟล์นี้ยังไม่มีแท็บข้อมูล', false);
    }
  } catch (err) {
    showHint('เกิดข้อผิดพลาด: ' + err.message, true);
  }
}

/**
 * แสดงเฉพาะแท็บที่มีอยู่จริงในไฟล์นี้
 * เดิมมีปุ่ม "ทั้งหมดในไฟล์นี้" ที่ดึงข้อมูลทุกแท็บมารวมกันในครั้งเดียว ซึ่งเป็นคำสั่งที่หนักที่สุดในระบบ
 * (ไฟล์ที่มีหลายแท็บและแต่ละแท็บหลายพันแถว ต้องอ่านทั้งไฟล์) จึงเอาออกเพื่อไม่ให้เผลอกดแล้วรอนาน
 */
function renderTabs(sheets) {
  tabsBar.innerHTML = '';
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
  // ถ้ากรอกฟอร์มเพิ่มข้อมูลค้างไว้ ให้ถามก่อน ไม่งั้นข้อมูลหายเงียบๆ
  if (sheetName !== selectedSheet && !confirmDiscardAddForm_()) return;
  selectedSheet = sheetName;
  try { localStorage.setItem('sheetSearchLastSheet', sheetName || ''); } catch (e) { /* ignore */ }
  updateTabPillStates();
  resetPanels();
  manageToggle.hidden = !sheetName;

  if (sheetName) await loadSingleTabView(sheetName, '');
}

/* ===== โหมดแท็บเดียว: ตารางเต็มคอลัมน์ + ตัวกรองสถานะ ===== */

/**
 * เติมชื่อไฟล์และชื่อแท็บกลับเข้าไปในแต่ละแถว
 * ฝั่งเซิร์ฟเวอร์ตัดออกตอนส่งมาเพื่อลดขนาดข้อมูล (ค่าซ้ำกันทุกแถวอยู่แล้วเพราะดูแท็บเดียว)
 * แต่โค้ดส่วนแก้ไข/ลบ/แสดงผล ใช้ row.sheet อยู่ จึงต้องเติมกลับให้ครบก่อนนำไปใช้
 */
function fillRowSource_(rows, sheetName) {
  (rows || []).forEach(r => {
    if (!r.book) r.book = currentBook;
    if (!r.sheet) r.sheet = sheetName;
  });
  return rows || [];
}

async function loadSingleTabView(sheetName, keyword) {
  lastKeyword = keyword;
  input.value = keyword;
  setLoading(true);
  showHint('กำลังโหลด...', false);

  // กันปัญหาข้อมูล/ลิงก์ Ticket ขึ้นๆ หายๆ ที่เกิดจาก "คำขอเก่าที่ช้ากว่า" กลับมาถึงทีหลัง
  // คำขอที่ใหม่กว่า แล้วไปเขียนทับผลลัพธ์ล่าสุดด้วยข้อมูลเก่า (race condition) — ถ้ามีคนกดค้นหา/สลับแท็บ
  // ซ้อนกันเร็วๆ ให้ยึดเฉพาะคำขอล่าสุดเท่านั้น คำขอเก่าที่ตอบกลับมาทีหลังจะถูกทิ้งไปเงียบๆ
  const requestId = ++loadRequestSeq;

  try {
    // ขอข้อมูลทั้งหมดที่ต้องใช้ในคำขอเดียว (หัวตาราง + ตัวเลือก dropdown + ผลค้นหา)
    // เดิมยิง 3 คำขอเรียงต่อกัน ต้องรอทีละอัน ทำให้ช้ากว่านี้ประมาณ 3 เท่า
    const viewResult = await jsonpRequest(apiUrl({
      action: 'tabView', book: currentBook, sheet: sheetName, q: keyword,
      offset: 0, limit: TAB_CHUNK_SIZE, slim: 1
    }), BIG_TAB_TIMEOUT_MS);
    if (requestId !== loadRequestSeq) return;
    if (!viewResult.ok) throw new Error(viewResult.error || 'โหลดข้อมูลไม่สำเร็จ');

    currentTableHeaders = viewResult.headers;
    statusColIndex = viewResult.statusIndex;
    currentHeadersMeta = viewResult.headersMeta || [];
    currentRows = fillRowSource_(viewResult.results, sheetName);
    lastTruncated = !!viewResult.truncated;
    // แท็บนี้ใหญ่เกินกว่าจะส่งลิงก์ Ticket มาพร้อมกัน จะขอทีหลังเฉพาะแถวที่แสดงอยู่
    linksDeferred = !!viewResult.linksDeferred;
    fetchedLinkRows_.clear();

    // กันเหนียว: ถ้าหัวตารางที่ได้มาสั้นกว่าข้อมูลจริงของบางแถว (ไม่ว่าจะด้วยสาเหตุใด)
    // ให้ขยายหัวตารางเพิ่มโดยอัตโนมัติ เพื่อไม่ให้มีคอลัมน์ไหนถูกตัดทิ้งไปเงียบๆ อีก
    const maxCells = currentRows.reduce((max, r) => Math.max(max, r.cells.length), currentTableHeaders.length);
    while (currentTableHeaders.length < maxCells) {
      currentTableHeaders.push(`คอลัมน์ ${currentTableHeaders.length + 1}`);
    }

    // ซ่อนคอลัมน์ที่ไม่มีชื่อหัวตารางจริงในชีต (ไม่มีอยู่จริง) ออกจากตารางที่แสดงบนหน้าเว็บไซต์
    // ตารางรายการแสดงแค่คอลัมน์ที่เซิร์ฟเวอร์ส่งมา (วันที่ / EXE ID / Ticket)
    // คอลัมน์ที่เหลือดูได้จากปุ่ม "ดูข้อมูล" ของแต่ละแถว
    visibleColumnIndices = (viewResult.listColumns && viewResult.listColumns.length)
      ? viewResult.listColumns.filter(i => (currentTableHeaders[i] || '').trim() !== '')
      : currentTableHeaders.map((h, i) => i).filter(i => currentTableHeaders[i].trim() !== '');

    setupStatusFilter();
    currentPage = 1;
    applyStatusFilterAndRender();

    // ประวัติการแก้ไขไม่มีปุ่มเปิดแล้ว จึงต้องโหลดเองทุกครั้งที่เปลี่ยนแท็บ/ค้นหา/บันทึก
    // ยิงแยกต่างหากไม่ต้อง await เพื่อไม่ให้ตารางที่พร้อมแล้วต้องรอข้อมูลส่วนนี้
    loadDailyReport();

    // ช่วงแรกแสดงผลแล้ว ที่เหลือทยอยโหลดต่อท้ายเบื้องหลัง ผู้ใช้ดูข้อมูลไปพลางได้เลย
    if (viewResult.hasMore) {
      loadRemainingTabChunks_(sheetName, keyword, requestId, viewResult.offset + viewResult.results.length, viewResult.total);
    }
  } catch (err) {
    if (requestId !== loadRequestSeq) return;
    showHint('เกิดข้อผิดพลาด: ' + err.message, true);
  } finally {
    if (requestId === loadRequestSeq) setLoading(false);
  }
}

/**
 * โหลดข้อมูลส่วนที่เหลือของแท็บทีละช่วง แล้วต่อท้ายตารางที่แสดงอยู่
 *
 * ทำแบบนี้เพราะแท็บใหญ่ (เช่น "ชีทพิจารณาปลด" ~9,000 แถว) ถ้าขอทั้งแท็บในคำขอเดียว
 * คำตอบจะใหญ่ราว 4.4 MB ส่งไม่ทัน 30 วินาที แล้วขึ้นว่า "เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด"
 * จนโหลดไม่ได้เลยสักแถว — แบ่งเป็นช่วงละ 2,500 แถว (~1 MB) จึงส่งได้สบายๆ
 *
 * ถ้าผู้ใช้สลับแท็บหรือค้นหาใหม่ระหว่างกำลังโหลด จะหยุดทันที (เช็คจาก requestId)
 */
async function loadRemainingTabChunks_(sheetName, keyword, requestId, startOffset, total) {
  let offset = startOffset;
  try {
    while (offset < total) {
      if (requestId !== loadRequestSeq) return; // ผู้ใช้เปลี่ยนไปดูอย่างอื่นแล้ว เลิกโหลดต่อ
      setTabLoadProgress_(offset, total);

      const chunk = await jsonpRequest(apiUrl({
        action: 'tabView', book: currentBook, sheet: sheetName, q: keyword,
        offset: offset, limit: TAB_CHUNK_SIZE, slim: 1
      }), BIG_TAB_TIMEOUT_MS);

      if (requestId !== loadRequestSeq) return;
      if (!chunk.ok) throw new Error(chunk.error || 'โหลดข้อมูลส่วนที่เหลือไม่สำเร็จ');
      if (!chunk.results || chunk.results.length === 0) break; // กันวนไม่รู้จบถ้าเซิร์ฟเวอร์ส่งว่างกลับมา

      currentRows = currentRows.concat(fillRowSource_(chunk.results, sheetName));
      offset += chunk.results.length;

      // อัปเดตตารางทันทีหลังได้แต่ละช่วง ตัวเลขจำนวนรายการและปุ่มแบ่งหน้าจะเพิ่มขึ้นเรื่อยๆ
      setupStatusFilter();
      applyStatusFilterAndRender(true); // อยู่หน้าเดิมและคงสถานะที่กรองไว้
      if (!chunk.hasMore) break;
    }
    setTabLoadProgress_(0, 0);
  } catch (err) {
    if (requestId !== loadRequestSeq) return;
    // ข้อมูลช่วงที่โหลดมาได้แล้วยังใช้งานได้ตามปกติ แค่บอกให้รู้ว่ายังไม่ครบ
    setTabLoadProgress_(offset, total, err.message);
  }
}

/** แถบบอกความคืบหน้าตอนกำลังทยอยโหลดแท็บใหญ่ (ส่ง 0, 0 เพื่อซ่อน) */
function setTabLoadProgress_(loaded, total, errorMessage) {
  if (!tabLoadProgress) return;
  if (errorMessage) {
    tabLoadProgress.textContent = `โหลดได้ ${loaded.toLocaleString()} จาก ${total.toLocaleString()} รายการ แล้วหยุดเพราะ: ${errorMessage}`;
    tabLoadProgress.className = 'tab-progress tab-progress--error';
    tabLoadProgress.hidden = false;
    return;
  }
  if (!total) {
    tabLoadProgress.hidden = true;
    return;
  }
  tabLoadProgress.textContent = `กำลังโหลดข้อมูลส่วนที่เหลือ... ${loaded.toLocaleString()} จาก ${total.toLocaleString()} รายการ`;
  tabLoadProgress.className = 'tab-progress';
  tabLoadProgress.hidden = false;
}

function setupStatusFilter() {
  if (statusColIndex === -1) {
    statusFilter.hidden = true;
    statusFilter.innerHTML = '';
    return;
  }
  // ตัวเลือกสถานะ = รายการ Dropdown จริงที่ตั้งไว้ในชีต (เรียงตามลำดับในชีต) รวมกับค่าที่พบจริงในข้อมูล
  // ที่อาจไม่ได้อยู่ใน Dropdown ก็ตาม (เผื่อกรอกมาแบบพิมพ์เองก่อนหน้านี้) — ไม่ซ้ำกัน
  const headerName = currentTableHeaders[statusColIndex];
  const headerMeta = currentHeadersMeta.find(h => h.name === headerName);
  const validationOptions = (headerMeta && headerMeta.options) || [];

  const ordered = [];
  const seen = new Set();
  validationOptions.forEach(v => {
    const s = (v || '').toString().trim();
    if (s && !seen.has(s)) { seen.add(s); ordered.push(s); }
  });

  const foundInData = new Set();
  currentRows.forEach(row => {
    const v = (row.cells[statusColIndex] || '').toString().trim();
    if (v) foundInData.add(v);
  });
  Array.from(foundInData).sort((a, b) => a.localeCompare(b, 'th')).forEach(v => {
    if (!seen.has(v)) { seen.add(v); ordered.push(v); }
  });

  if (ordered.length === 0) {
    statusFilter.hidden = true;
    statusFilter.innerHTML = '';
    return;
  }
  // จำค่าที่ผู้ใช้เลือกไว้ แล้วใส่กลับหลังสร้างตัวเลือกใหม่
  // จำเป็นตอนแท็บใหญ่ทยอยโหลดเป็นช่วงๆ — ทุกช่วงที่มาถึงจะเรียกฟังก์ชันนี้ซ้ำ
  // ถ้าไม่จำไว้ ผู้ใช้ที่เลือกกรองสถานะไว้แล้วจะโดนรีเซ็ตกลับเป็น "ทุกสถานะ" เรื่อยๆ ระหว่างโหลด
  const previous = statusFilter.value;
  statusFilter.innerHTML = '<option value="">ทุกสถานะ</option>' +
    ordered.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  statusFilter.hidden = false;
  statusFilter.value = ordered.indexOf(previous) !== -1 ? previous : '';
}

statusFilter.addEventListener('change', () => applyStatusFilterAndRender());

/**
 * @param {boolean} [keepPage] true = อยู่หน้าเดิม (ใช้ตอนแท็บใหญ่ทยอยโหลดข้อมูลมาต่อท้าย
 *   ถ้าเด้งกลับหน้า 1 ทุกครั้งที่ได้ข้อมูลเพิ่ม ผู้ใช้ที่กำลังดูหน้าอื่นอยู่จะใช้งานไม่ได้เลย)
 */
function applyStatusFilterAndRender(keepPage) {
  const chosen = statusFilter.value;
  filteredRows = (!chosen || statusColIndex === -1)
    ? currentRows
    : currentRows.filter(row => (row.cells[statusColIndex] || '').toString().trim() === chosen);
  if (!keepPage) currentPage = 1;
  renderCurrentPage();
}

/* หมายเหตุ: การ render ตารางจริงทำผ่าน renderCurrentPage() + buildSingleRow() ด้านล่าง (รองรับแบ่งหน้า) */

/* ===== ค้นหา ===== */

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const keyword = input.value.trim();
  if (selectedSheet) loadSingleTabView(selectedSheet, keyword);
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
    await ensureFullRow_(row); // ต้องมีข้อมูลครบทุกคอลัมน์ก่อน ไม่งั้นลายนิ้วมือแถวจะไม่ตรง
    const result = await jsonpRequest(apiUrl({
      action: 'deleteRow', book: currentBook, sheet: row.sheet, row: row.row, fp: rowFingerprint_(row.cells)
    }));
    if (!result.ok) throw new Error(result.error || 'ลบไม่สำเร็จ');

    // ต้องโหลดข้อมูลใหม่ทั้งหมด ห้ามแค่ลบแถวนั้นออกจากตารางในหน่วยความจำ
    // เพราะการลบแถวในชีททำให้แถวที่อยู่ข้างล่างเลื่อนขึ้นมาทั้งหมด เลขแถวที่ค้างอยู่บนหน้าจอจะผิดทันที
    // (ถ้าไม่โหลดใหม่ การกดลบ/แก้ไขครั้งถัดไปจะไปโดนข้อมูลของเคสอื่น)
    if (selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword);
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
    buttonEl.disabled = false;
  }
}

/* ===== แก้ไขข้อมูลแถว (ใช้ได้ทุกไฟล์ ทุกแท็บ ทั้งโหมดแท็บเดียวและโหมดทั้งหมดในไฟล์) ===== */

const editModal = document.getElementById('editModal');
const editModalMeta = document.getElementById('editModalMeta');
const editFields = document.getElementById('editFields');
const editCancel = document.getElementById('editCancel');
const editSubmit = document.getElementById('editSubmit');
const editStatus = document.getElementById('editStatus');

let editingRow = null; // แถวที่กำลังแก้ไขอยู่ (เก็บ book/sheet/row ไว้ใช้ตอนบันทึก)
let editingRowHeaders = []; // ชื่อคอลัมน์ของแท็บนั้น เรียงตามตำแหน่งจริง ใช้อัปเดตแถวในหน้าจอหลังบันทึก

/**
 * เปิดหน้าต่างแก้ไขข้อมูลแถว: โหลดรายชื่อคอลัมน์ + ตัวเลือก dropdown จริงของแท็บนั้น (action=headers)
 * และโหลดหัวตารางเต็ม (action=tableHeaders) เพื่อจับคู่ค่าปัจจุบันของแต่ละคอลัมน์ให้ตรงตำแหน่งใน row.cells
 * ใช้ row.sheet เสมอ (ไม่ใช่ selectedSheet) เพื่อให้ปลอดภัยแม้ข้อมูลมาจากแท็บอื่น
 */
async function openEditModal(row) {
  editingRow = row;
  editModalMeta.textContent = `แก้ไขแถวที่ ${row.row} ในแท็บ "${row.sheet}"`;
  editFields.innerHTML = '';
  editSubmit.disabled = true;
  setEditStatus('กำลังโหลดคอลัมน์...', null);
  if (editColorToggle) resetColorPicker_(editColorToggle, editColorPickers, editColorBg, editColorFont);
  editModal.hidden = false;

  try {
    // ดึงข้อมูลทั้งแถวมาด้วย เพราะตารางรายการมีแค่ไม่กี่คอลัมน์
    const [headersResult, tableHeadersResult] = await Promise.all([
      jsonpRequest(apiUrl({ action: 'headers', book: currentBook, sheet: row.sheet })),
      jsonpRequest(apiUrl({ action: 'tableHeaders', book: currentBook, sheet: row.sheet })),
      ensureFullRow_(row)
    ]);
    if (!headersResult.ok) throw new Error(headersResult.error || 'โหลดคอลัมน์ไม่สำเร็จ');
    if (!tableHeadersResult.ok) throw new Error(tableHeadersResult.error || 'โหลดหัวตารางไม่สำเร็จ');

    const fullHeaders = tableHeadersResult.headers;
    editingRowHeaders = fullHeaders; // เก็บไว้ใช้อัปเดตแถวในหน้าจอทันทีหลังบันทึก
    renderEditFields(headersResult.headers, fullHeaders, row);
    editSubmit.disabled = false;
    setEditStatus('', null);
  } catch (err) {
    setEditStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderEditFields(headers, fullHeaders, row) {
  editFields.innerHTML = '';
  headers.forEach(header => {
    const wrap = document.createElement('div');
    wrap.className = 'add-field';
    const label = document.createElement('label');
    label.textContent = header.name;
    label.setAttribute('for', `edit-field-${header.name}`);
    wrap.appendChild(label);

    const inputEl = buildFieldInput(header, 'edit-field-');
    const colIndex = fullHeaders.indexOf(header.name);
    if (colIndex !== -1) {
      const rawValue = (row.cells[colIndex] || '').toString();
      inputEl.value = inputEl.type === 'date' ? toDateInputValue_(rawValue) : rawValue;
    }
    inputEl.dataset.originalValue = inputEl.value; // ใช้เทียบตอนปิดหน้าต่างว่าแก้ไขอะไรค้างไว้ไหม
    wrap.appendChild(inputEl);
    editFields.appendChild(wrap);
  });
}

/**
 * แปลงค่าวันที่ที่อ่านมาจากชีต (ซึ่งอาจแสดงเป็น dd/MM/yyyy, d-M-yyyy หรือรูปแบบอื่นตามการตั้งค่าเซลล์)
 * ให้เป็นรูปแบบ yyyy-MM-dd ที่ input type="date" ต้องการ ไม่งั้นเบราว์เซอร์จะไม่โชว์ค่าเดิมให้ (ช่องว่างเปล่า)
 */
function toDateInputValue_(raw) {
  const str = (raw || '').toString().trim();
  if (!str) return '';

  // อยู่ในรูปแบบ yyyy-MM-dd อยู่แล้ว (มีหรือไม่มีเวลาต่อท้าย)
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  // dd/MM/yyyy หรือ dd-MM-yyyy
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;

  // เผื่อรูปแบบอื่นที่ JavaScript แกะได้เอง (เช่น "Sep 30, 2026")
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = (parsed.getMonth() + 1).toString().padStart(2, '0');
    const dd = parsed.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

/**
 * แปลงกลับจากค่าที่ input type="date" ส่งมา (รูปแบบ yyyy-MM-dd เสมอตามมาตรฐาน HTML)
 * ให้เป็น dd/MM/yyyy ก่อนบันทึกลงชีตจริง เพื่อให้ตรงกับรูปแบบวันที่ที่ใช้แสดงบนหน้าเว็บ
 * (ถ้าไม่ใช้ฟังก์ชันนี้ ชีตจะได้ค่าเป็น "2026-09-30" ปนกับแถวเดิมที่เป็น "30/09/2026")
 */
function fromDateInputValue_(isoValue) {
  const str = (isoValue || '').toString().trim();
  if (!str) return '';
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return str; // ไม่ใช่รูปแบบที่คาด ส่งค่าเดิมกลับไปเผื่อผู้ใช้พิมพ์เอง
  return `${m[3]}/${m[2]}/${m[1]}`;
}

editCancel.addEventListener('click', () => closeEditModal());

// คลิกพื้นหลังนอกกล่องเพื่อปิด (คลิกในกล่องไม่ปิด) — ถามก่อนถ้าแก้ไขค้างไว้
editModal.addEventListener('click', (evt) => {
  if (evt.target === editModal) tryCloseEditModal_();
});

// กด Escape ปิดหน้าต่างแก้ไข
document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && !editModal.hidden) tryCloseEditModal_();
});

/** ปิดหน้าต่างแก้ไข โดยถามก่อนถ้ามีการแก้ไขค้างไว้ที่ยังไม่ได้บันทึก */
function tryCloseEditModal_() {
  const touched = Array.from(editFields.querySelectorAll('input, select'))
    .some(el => el.value !== (el.dataset.originalValue || ''));
  if (touched && !confirm('คุณแก้ไขข้อมูลค้างไว้แต่ยังไม่ได้บันทึก\n\nถ้าปิดตอนนี้ การแก้ไขจะหายไป ต้องการปิดหรือไม่?')) return;
  closeEditModal();
}

function closeEditModal() {
  editModal.hidden = true;
  editingRow = null;
  editingRowHeaders = [];
  editFields.innerHTML = '';
  setEditStatus('', null);
  if (editColorToggle) resetColorPicker_(editColorToggle, editColorPickers, editColorBg, editColorFont);
}

editSubmit.addEventListener('click', async () => {
  if (!editingRow) return;
  const row = editingRow;
  const data = {};
  editFields.querySelectorAll('input, select').forEach(el => {
    data[el.dataset.header] = el.type === 'date' ? fromDateInputValue_(el.value) : el.value;
  });

  editSubmit.disabled = true;
  setEditStatus('กำลังบันทึก...', null);
  try {
    const result = await jsonpRequest(apiUrl({
      action: 'updateRow', book: currentBook, sheet: row.sheet, row: row.row,
      data: JSON.stringify(data), fp: rowFingerprint_(row.cells)
    }));
    if (!result.ok) throw new Error(result.error || 'บันทึกไม่สำเร็จ');

    let statusMessage = 'บันทึกการแก้ไขสำเร็จ';
    const colorChanged = !!(editColorToggle && editColorToggle.checked);
    if (editColorToggle && editColorToggle.checked) {
      const colored = await applyRowColor_(row.sheet, row.row, chosenColor_(editColorBg), chosenColor_(editColorFont));
      statusMessage += colored ? ' (ปรับสีแถวแล้ว)' : ' (แต่ปรับสีแถวไม่สำเร็จ)';
    }

    setEditStatus(statusMessage, 'success');

    // อัปเดตแถวในหน้าจอทันที ไม่ต้องรอโหลดข้อมูลทั้งแท็บใหม่
    // (ถ้ามีการเปลี่ยนสีแถวด้วย ต้องโหลดใหม่ เพราะสีมาจากข้อมูลฝั่งชีท)
    const appliedLocally = !colorChanged && applyRowEditLocally_(row, data, editingRowHeaders);
    closeEditModal();
    if (!appliedLocally) {
      if (selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword);
    }
  } catch (err) {
    setEditStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    editSubmit.disabled = false;
  }
});

function setEditStatus(message, type) {
  editStatus.textContent = message;
  editStatus.className = 'add-panel__status' + (type ? ` add-panel__status--${type}` : '');
}

/* ===== ปิดแผงย่อยทั้งหมด (ใช้ตอนสลับแท็บ/สลับโหมด) ===== */

/**
 * เช็กว่าฟอร์มเพิ่มข้อมูลมีอะไรกรอกค้างไว้ไหม
 * ใช้ก่อนปิดฟอร์มโดยไม่ได้บันทึก (สลับแท็บ/สลับไฟล์) จะได้เตือนก่อนข้อมูลหาย
 */
function addFormHasUnsavedInput_() {
  if (!addPanel || addPanel.hidden) return false;
  return Array.from(addFields.querySelectorAll('input, select'))
    .some(el => (el.value || '').toString().trim() !== '');
}

/**
 * ถามก่อนทิ้งข้อมูลที่กรอกค้างไว้ในฟอร์มเพิ่มข้อมูล
 * @return {boolean} true = ไปต่อได้ (ไม่มีข้อมูลค้าง หรือผู้ใช้ยืนยันว่าทิ้งได้)
 */
function confirmDiscardAddForm_() {
  if (!addFormHasUnsavedInput_()) return true;
  return confirm('คุณกรอกข้อมูลในฟอร์ม "เพิ่มข้อมูล" ค้างไว้แต่ยังไม่ได้บันทึก\n\nถ้าไปต่อ ข้อมูลที่กรอกไว้จะหายทั้งหมด ต้องการไปต่อหรือไม่?');
}

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
  addToggle.textContent = '+ เพิ่มข้อมูล'; // ข้อความปุ่มคงที่เสมอ ปิดฟอร์มด้วยปุ่มในฟอร์มแทน
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

function buildFieldInput(header, idPrefix) {
  const prefix = idPrefix || 'field-';
  const isDateColumn = /วันที่|date/i.test(header.name);

  if (header.options && header.options.length > 0) {
    const select = document.createElement('select');
    select.id = `${prefix}${header.name}`;
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
  inputEl.id = `${prefix}${header.name}`;
  inputEl.dataset.header = header.name;
  return inputEl;
}

/* ===== เปลี่ยนสีพื้นหลัง/ตัวอักษรของแถว (ใช้ทั้งตอนเพิ่มข้อมูลและแก้ไขข้อมูล) ===== */

const addColorToggle = document.getElementById('addColorToggle');
const addColorPickers = document.getElementById('addColorPickers');
const addColorBg = document.getElementById('addColorBg');
const addColorFont = document.getElementById('addColorFont');
const addColorReset = document.getElementById('addColorReset');

if (addColorToggle) {
  addColorToggle.addEventListener('change', () => {
    addColorPickers.hidden = !addColorToggle.checked;
  });
}
if (addColorReset) {
  addColorReset.addEventListener('click', () => {
    setSwatchColor_('addColorBg', '#ffffff', true);
    setSwatchColor_('addColorFont', '#000000', true);
    addColorToggle.checked = true;
    addColorPickers.hidden = false;
  });
}

const editColorToggle = document.getElementById('editColorToggle');
const editColorPickers = document.getElementById('editColorPickers');
const editColorBg = document.getElementById('editColorBg');
const editColorFont = document.getElementById('editColorFont');
const editColorReset = document.getElementById('editColorReset');

if (editColorToggle) {
  editColorToggle.addEventListener('change', () => {
    editColorPickers.hidden = !editColorToggle.checked;
  });
}
if (editColorReset) {
  editColorReset.addEventListener('click', () => {
    setSwatchColor_('editColorBg', '#ffffff', true);
    setSwatchColor_('editColorFont', '#000000', true);
    editColorToggle.checked = true;
    editColorPickers.hidden = false;
  });
}

/** ส่ง request เปลี่ยนสีพื้นหลัง/ตัวอักษรของแถวที่ระบุไปยังชีตจริง เป็น best-effort — ถ้าพลาดจะไม่ทำให้การบันทึกข้อมูลหลักถือว่าล้มเหลว */
async function applyRowColor_(sheetName, rowNum, bg, font) {
  try {
    const result = await jsonpRequest(apiUrl({ action: 'setRowColor', book: currentBook, sheet: sheetName, row: rowNum, bg: bg || '', font: font || '' }));
    return !!(result && result.ok);
  } catch (e) {
    return false;
  }
}

/** ตั้งค่าสีให้ทั้ง input ที่เก็บค่าจริง (hidden) และปุ่มสี่เหลี่ยมที่โชว์สีนั้นให้ตรงกันเสมอ */
function setSwatchColor_(hiddenInputId, hex, chosenByUser) {
  const hiddenInput = document.getElementById(hiddenInputId);
  if (hiddenInput) {
    hiddenInput.value = hex;
    // จำไว้ว่าผู้ใช้ "ตั้งใจเลือกสีนี้" หรือเป็นแค่ค่าเริ่มต้นที่ยังไม่ได้แตะ
    // ถ้าไม่แยกตรงนี้ คนที่เลือกแค่สีพื้นหลังจะโดนบังคับสีตัวอักษรเป็นดำไปด้วย
    // ซึ่งจะไปลบสีของลิงก์และรูปแบบเดิมที่ตั้งไว้ในชีททั้งแถว
    if (chosenByUser) hiddenInput.dataset.chosen = 'true';
  }
  const btn = document.querySelector(`.color-swatch-btn[data-target="${hiddenInputId}"]`);
  if (btn) btn.style.background = hex;
}

function resetColorPicker_(toggleEl, pickersEl, bgEl, fontEl) {
  toggleEl.checked = false;
  pickersEl.hidden = true;
  setSwatchColor_(bgEl.id, '#ffffff');
  setSwatchColor_(fontEl.id, '#000000');
  delete bgEl.dataset.chosen;
  delete fontEl.dataset.chosen;
}

/** คืนค่าสีเฉพาะที่ผู้ใช้เลือกจริง ถ้ายังไม่ได้แตะจะคืนค่าว่าง = ไม่ต้องไปเปลี่ยนสีนั้นในชีท */
function chosenColor_(inputEl) {
  return (inputEl && inputEl.dataset.chosen === 'true') ? inputEl.value : '';
}

/* ===== ตัวเลือกสีแบบกำหนดเอง (popover เดียวใช้ร่วมกันทุกปุ่มสี คล้ายตัวเลือกสีใน Excel) ===== */
(function initColorPickerPopover_() {
  const popover = document.getElementById('colorPickerPopover');
  if (!popover) return;
  const svBox = document.getElementById('colorPickerSV');
  const svCursor = document.getElementById('colorPickerSVCursor');
  const hueBox = document.getElementById('colorPickerHue');
  const hueCursor = document.getElementById('colorPickerHueCursor');
  const presetsBox = document.getElementById('colorPickerPresets');
  const preview = document.getElementById('colorPickerPreview');
  const hexInput = document.getElementById('colorPickerHex');
  const rInput = document.getElementById('colorPickerR');
  const gInput = document.getElementById('colorPickerG');
  const bInput = document.getElementById('colorPickerB');
  const okBtn = document.getElementById('colorPickerOk');
  const cancelBtn = document.getElementById('colorPickerCancel');

  const PRESETS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#f4c7c3', '#fce8b2', '#fff2cc', '#d9ead3', '#b7e1cd', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9c2e9', '#ead1dc',
    '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#e06666',
    '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0', '#cc0000', '#e69138',
    '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79', '#990000', '#b45f06', '#bf9000'
  ];

  let hue = 0, sat = 0, val = 1;
  let targetInputId = null;
  let targetBtn = null;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  function hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = (((g - b) / d) % 6);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(n => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')).join('');
  }

  function hexToRgb(hex) {
    const cleaned = (hex || '').trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
    return { r: parseInt(cleaned.slice(0, 2), 16), g: parseInt(cleaned.slice(2, 4), 16), b: parseInt(cleaned.slice(4, 6), 16) };
  }

  function currentHex() {
    const { r, g, b } = hsvToRgb(hue, sat, val);
    return rgbToHex(r, g, b);
  }

  function renderFromHsv() {
    const { r, g, b } = hsvToRgb(hue, sat, val);
    const hex = rgbToHex(r, g, b);
    preview.style.background = hex;
    hexInput.value = hex;
    rInput.value = r;
    gInput.value = g;
    bInput.value = b;
    svBox.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    svCursor.style.left = (sat * 100) + '%';
    svCursor.style.top = ((1 - val) * 100) + '%';
    hueCursor.style.left = (hue / 360 * 100) + '%';
  }

  function setFromHex(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    hue = hsv.s === 0 ? hue : hsv.h;
    sat = hsv.s;
    val = hsv.v;
    renderFromHsv();
  }

  function setFromRgbInputs() {
    const r = clamp(parseInt(rInput.value, 10) || 0, 0, 255);
    const g = clamp(parseInt(gInput.value, 10) || 0, 0, 255);
    const b = clamp(parseInt(bInput.value, 10) || 0, 0, 255);
    const hsv = rgbToHsv(r, g, b);
    hue = hsv.h; sat = hsv.s; val = hsv.v;
    renderFromHsv();
  }

  PRESETS.forEach(hex => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-picker__preset';
    btn.style.background = hex;
    btn.title = hex;
    btn.addEventListener('click', () => setFromHex(hex));
    presetsBox.appendChild(btn);
  });

  function svPointerToValue(evt) {
    const rect = svBox.getBoundingClientRect();
    sat = clamp((evt.clientX - rect.left) / rect.width, 0, 1);
    val = 1 - clamp((evt.clientY - rect.top) / rect.height, 0, 1);
    renderFromHsv();
  }

  function huePointerToValue(evt) {
    const rect = hueBox.getBoundingClientRect();
    hue = clamp((evt.clientX - rect.left) / rect.width, 0, 1) * 360;
    renderFromHsv();
  }

  function bindDrag(el, onMove) {
    el.addEventListener('pointerdown', (evt) => {
      evt.preventDefault();
      onMove(evt);
      const move = (e) => onMove(e);
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }
  bindDrag(svBox, svPointerToValue);
  bindDrag(hueBox, huePointerToValue);

  hexInput.addEventListener('change', () => {
    let hex = hexInput.value.trim();
    if (hex && hex[0] !== '#') hex = '#' + hex;
    if (hexToRgb(hex)) setFromHex(hex);
    else hexInput.value = currentHex();
  });
  [rInput, gInput, bInput].forEach(inp => inp.addEventListener('change', setFromRgbInputs));

  function openPicker(triggerBtn, hiddenInputId) {
    targetInputId = hiddenInputId;
    targetBtn = triggerBtn;
    const hiddenInput = document.getElementById(hiddenInputId);
    setFromHex((hiddenInput && hiddenInput.value) || '#ffffff');

    popover.hidden = false;
    const rect = triggerBtn.getBoundingClientRect();
    const popW = popover.offsetWidth || 220;
    const popH = popover.offsetHeight || 340;
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
    if (top + popH > window.innerHeight - 8) top = rect.top - popH - 6;
    popover.style.left = Math.max(8, left) + 'px';
    popover.style.top = Math.max(8, top) + 'px';
  }

  function closePicker() {
    popover.hidden = true;
    targetInputId = null;
    targetBtn = null;
  }

  okBtn.addEventListener('click', () => {
    if (targetInputId) setSwatchColor_(targetInputId, currentHex(), true);
    closePicker();
  });
  cancelBtn.addEventListener('click', closePicker);

  document.addEventListener('mousedown', (evt) => {
    if (popover.hidden) return;
    if (popover.contains(evt.target) || (targetBtn && targetBtn.contains(evt.target))) return;
    closePicker();
  });

  document.querySelectorAll('.color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', (evt) => {
      evt.stopPropagation();
      openPicker(btn, btn.dataset.target);
    });
  });
})();

addSubmitButton.addEventListener('click', async () => {
  if (!selectedSheet) return;
  const data = {};
  addFields.querySelectorAll('input, select').forEach(el => {
    data[el.dataset.header] = el.type === 'date' ? fromDateInputValue_(el.value) : el.value;
  });

  addSubmitButton.disabled = true;
  setAddStatus('กำลังบันทึก...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'add', book: currentBook, sheet: selectedSheet, data: JSON.stringify(data) }));
    if (!result.ok) throw new Error(result.error || 'บันทึกไม่สำเร็จ');

    let statusMessage = 'บันทึกข้อมูลสำเร็จ';
    if (addColorToggle && addColorToggle.checked && result.row) {
      const colored = await applyRowColor_(selectedSheet, result.row, chosenColor_(addColorBg), chosenColor_(addColorFont));
      statusMessage += colored ? ' (ปรับสีแถวแล้ว)' : ' (แต่ปรับสีแถวไม่สำเร็จ)';
      resetColorPicker_(addColorToggle, addColorPickers, addColorBg, addColorFont);
    }

    setAddStatus(statusMessage, 'success');
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
  manageToggle.textContent = 'จัดการคอลัมน์';
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
  trashToggle.textContent = '🗑 ถังขยะ';
  if (!isOpen) loadTrash();
});

/* ===== ประวัติการแก้ไข (แสดงถาวรบนสุดของแถบด้านข้าง ไม่มีปุ่มเปิด/ปิดแล้ว) ===== */

async function loadDailyReport() {
  reportPanelSheetName.textContent = selectedSheet;
  reportStats.innerHTML = '';
  if (reportStatusList) reportStatusList.innerHTML = '';
  reportLogList.innerHTML = '';
  setReportStatus('กำลังโหลด...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'dailyReport', book: currentBook, sheet: selectedSheet }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายงานไม่สำเร็จ');
    reportPanelDate.textContent = formatDateDisplay(result.date);
    renderReportStats(result);
    renderReportStatusList(result);
    renderReportLogList(result);
    setReportStatus('', null);
  } catch (err) {
    setReportStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderReportStats(result) {
  const stats = [
    { label: 'เพิ่มวันนี้', value: result.addedToday },
    { label: 'แก้ไขวันนี้', value: result.editedToday },
    { label: 'ลบวันนี้', value: result.deletedToday },
    { label: 'กู้คืนวันนี้', value: result.restoredToday },
    { label: 'ทั้งหมดในแท็บนี้', value: result.totalRows },
  ];
  reportStats.innerHTML = stats.map(s => `
    <div class="report-stat">
      <div class="report-stat__value">${s.value}</div>
      <div class="report-stat__label">${escapeHtml(s.label)}</div>
    </div>`).join('');
}

function renderReportStatusList(result) {
  if (!reportStatusList) return; // ย้ายไปแสดงในรายการ "ตรวจสอบสถานะ" ของแถบด้านข้างแทนแล้ว
  if (!result.hasStatusColumn) {
    reportStatusList.innerHTML = '<p class="report-panel__status">แท็บนี้ไม่มีคอลัมน์ "สถานะ"</p>';
    return;
  }
  if (result.statusBreakdown.length === 0) {
    reportStatusList.innerHTML = '<p class="report-panel__status">ยังไม่มีข้อมูลในแท็บนี้</p>';
    return;
  }
  reportStatusList.innerHTML = result.statusBreakdown.map(s => `
    <div class="report-status-row">
      <span class="report-status-row__name">${escapeHtml(s.status)}</span>
      <span class="report-status-row__count">${s.count}</span>
    </div>`).join('');
}

function renderReportLogList(result) {
  if (result.recentToday.length === 0) {
    reportLogList.innerHTML = '<p class="report-panel__status">วันนี้ยังไม่มีการเพิ่ม/แก้ไข/ลบข้อมูลในแท็บนี้</p>';
    return;
  }
  reportLogList.innerHTML = result.recentToday.map(item => {
    const where = [item.book, item.sheet].filter(Boolean).join(' · ');
    return `
    <div class="report-log-row">
      <b>${escapeHtml(item.time)}</b> · ${escapeHtml(item.action)} · ${escapeHtml(item.editor)}
      ${where ? `<div class="report-log-row__where">📄 ${escapeHtml(where)}</div>` : ''}
      ${item.detail ? `<div class="report-log-row__detail">${formatEventDetail_(item.detail)}</div>` : ''}
    </div>`;
  }).join('');
}

function setReportStatus(message, type) {
  reportStatus.textContent = message;
  reportStatus.className = 'report-panel__status' + (type ? ` report-panel__status--${type}` : '');
}

/* ===== Dashboard ภาพรวมทั้งระบบ (มุมล่างซ้าย ใต้รายชื่อไฟล์ทั้งหมด) ===== */

const GLOBAL_DASHBOARD_REFRESH_MS = 90 * 1000; // รีเฟรชทุก 90 วิ ให้พอดีกับ cache ฝั่งเซิร์ฟเวอร์
let globalDashboardTimer = null;
let globalDashboardLoading = false; // กันการยิงซ้อนกัน ถ้ารอบก่อนยังไม่เสร็จแล้วตัวตั้งเวลาทำงานอีก
let globalDashboardLoadedOnce = false;

/**
 * Dashboard ภาพรวมต้องไล่นับทุกไฟล์ทุกแท็บ รอบแรกของวัน (ตอนแคชฝั่งเซิร์ฟเวอร์ยังว่าง) อาจใช้เวลา
 * เกิน 30 วินาทีได้ จึงให้เวลามากกว่าคำสั่งอื่น — ส่วนนี้โหลดอยู่เบื้องหลัง ไม่ได้ขัดขวางการใช้งานหน้าเว็บ
 * รอบต่อๆ ไปจะได้ค่าจากแคชรายแท็บ จึงเร็วมาก
 */
const GLOBAL_DASHBOARD_TIMEOUT_MS = 150000;

/** เรียกครั้งเดียวตอนล็อกอินสำเร็จ: โหลดข้อมูลทันที แล้วตั้งเวลารีเฟรชอัตโนมัติต่อเนื่อง */
function initGlobalDashboard() {
  loadGlobalDashboard();
  if (globalDashboardTimer) clearInterval(globalDashboardTimer);
  globalDashboardTimer = setInterval(loadGlobalDashboard, GLOBAL_DASHBOARD_REFRESH_MS);
}

async function loadGlobalDashboard() {
  if (globalDashboardLoading) return; // รอบก่อนยังโหลดไม่เสร็จ ข้ามรอบนี้ไป ไม่ยิงซ้อน
  globalDashboardLoading = true;
  // รอบแรกบอกว่ากำลังโหลด รอบถัดๆ ไปบอกว่ากำลังอัปเดต เพื่อให้รู้ว่าตัวเลขที่เห็นอยู่คือค่าก่อนหน้า
  setDashboardStatus(globalDashboardLoadedOnce ? 'กำลังอัปเดต...' : 'กำลังโหลด... (ครั้งแรกอาจใช้เวลาสักครู่)', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'globalDashboard' }), GLOBAL_DASHBOARD_TIMEOUT_MS);
    if (!result.ok) throw new Error(result.error || 'โหลดภาพรวมไม่สำเร็จ');
    dashboardDate.textContent = formatDateDisplay(result.date);
    dashboardCasesToday.textContent = result.casesToday;
    renderDashboardNewCasesList(result);
    renderDashboardStatusList(result);
    globalDashboardLoadedOnce = true;
    setDashboardStatus('', null);
  } catch (err) {
    // ตัวเลขรอบก่อนยังคาหน้าจออยู่ ไม่ล้างทิ้ง เพราะดีกว่าเห็นว่างเปล่า
    setDashboardStatus('อัปเดตไม่สำเร็จ: ' + err.message, 'error');
  } finally {
    globalDashboardLoading = false;
  }
}

function renderDashboardNewCasesList(result) {
  const cases = result.newCasesToday || [];
  if (cases.length === 0) {
    dashboardNewCasesList.innerHTML = '<p class="sidebar-dashboard__empty">วันนี้ยังไม่มีเคสเข้าใหม่</p>';
    return;
  }
  dashboardNewCasesList.innerHTML = cases.map(c => `
    <div class="sidebar-dashboard__case${c.row ? ' sidebar-dashboard__case--clickable' : ''}"
         ${c.row ? `data-case-book="${escapeHtml(c.book)}" data-case-sheet="${escapeHtml(c.sheet)}" data-case-row="${c.row}" title="คลิกเพื่อดูรายละเอียดเคสนี้"` : ''}>
      <div class="sidebar-dashboard__case-top">
        <b>${escapeHtml(c.time)}</b>
        <span class="sidebar-dashboard__case-status">${escapeHtml(c.status)}</span>
      </div>
      <div class="sidebar-dashboard__case-meta">${escapeHtml(c.book)} · ${escapeHtml(c.sheet)}${c.row ? ` · แถวที่ ${c.row}` : ''}</div>
    </div>`).join('') + (result.newCasesTruncated ? '<p class="sidebar-dashboard__empty">แสดงล่าสุด 30 รายการ อาจมีมากกว่านี้</p>' : '');
  bindCaseDetailClicks_(dashboardNewCasesList);
}

function renderDashboardStatusList(result) {
  if (!result.statusBreakdown || result.statusBreakdown.length === 0) {
    dashboardStatusList.innerHTML = '<p class="sidebar-dashboard__empty">ยังไม่พบคอลัมน์ "สถานะ" ในไฟล์ใดเลย</p>';
    return;
  }
  dashboardStatusList.innerHTML = result.statusBreakdown.map(s => `
    <div class="sidebar-dashboard__row sidebar-dashboard__row--clickable"
         data-status="${escapeHtml(s.status)}"
         title="คลิกเพื่อดูว่าสถานะนี้อยู่ไฟล์ไหน แท็บไหนบ้าง (เปิดแท็บใหม่)">
      <span class="sidebar-dashboard__row-name">${escapeHtml(s.status)}</span>
      <span class="sidebar-dashboard__row-count">${s.count}</span>
    </div>`).join('') + `<p class="sidebar-dashboard__total">รวมทั้งหมด ${result.totalRows} เคส (${result.sheetsScanned} แท็บ)</p>`;

  // คลิกสถานะ = เปิดหน้ารายละเอียดในแท็บใหม่ของเบราว์เซอร์
  // (แท็บใหม่ใช้ตั๋วเข้าใช้งานตัวเดียวกัน เพราะ localStorage ใช้ร่วมกันทุกแท็บของเว็บเดียวกัน)
  dashboardStatusList.querySelectorAll('.sidebar-dashboard__row--clickable').forEach(el => {
    el.addEventListener('click', () => {
      window.open(`status.html?status=${encodeURIComponent(el.dataset.status)}`, '_blank');
    });
  });
}

function setDashboardStatus(message, type) {
  dashboardStatus.textContent = message;
  dashboardStatus.className = 'sidebar-dashboard__status' + (type ? ` sidebar-dashboard__status--${type}` : '');
}

/* ===== รายงานย้อนหลัง (เลือกช่วงวันที่เอง + ดาวน์โหลด Excel) ===== */

let lastDashboardReport = null; // เก็บผลลัพธ์ล่าสุดไว้ใช้ตอนกดดาวน์โหลด Excel (ไม่ต้องยิง API ซ้ำ)

function todayDateInputValue_() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

if (dashReportPresetToday) {
  dashReportPresetToday.addEventListener('click', () => {
    const t = todayDateInputValue_();
    dashReportFromDate.value = t;
    dashReportToDate.value = t;
    loadDashboardReport(t, t);
  });
}

if (dashReportPresetMonth) {
  dashReportPresetMonth.addEventListener('click', () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const first = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const last = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    dashReportFromDate.value = first;
    dashReportToDate.value = last;
    loadDashboardReport(first, last);
  });
}

if (dashReportPresetYear) {
  dashReportPresetYear.addEventListener('click', () => {
    const d = new Date();
    const y = d.getFullYear();
    const first = `${y}-01-01`;
    const last = `${y}-12-31`;
    dashReportFromDate.value = first;
    dashReportToDate.value = last;
    loadDashboardReport(first, last);
  });
}

if (dashReportViewBtn) {
  dashReportViewBtn.addEventListener('click', () => {
    if (!dashReportFromDate.value || !dashReportToDate.value) {
      setDashReportStatus('กรุณาเลือกวันที่ให้ครบทั้งจากและถึง', 'error');
      return;
    }
    if (dashReportFromDate.value > dashReportToDate.value) {
      setDashReportStatus('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด', 'error');
      return;
    }
    loadDashboardReport(dashReportFromDate.value, dashReportToDate.value);
  });
}

async function loadDashboardReport(from, to) {
  setDashReportStatus('กำลังโหลด...', null);
  dashReportResult.hidden = true;
  try {
    const result = await jsonpRequest(apiUrl({ action: 'dashboardReport', from, to }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายงานไม่สำเร็จ');
    lastDashboardReport = result;
    renderDashboardReport(result);
    setDashReportStatus('', null);
  } catch (err) {
    setDashReportStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderDashboardReport(result) {
  dashReportSummary.textContent = `ช่วงวันที่ ${formatDateDisplay(result.from)} ถึง ${formatDateDisplay(result.to)} — พบทั้งหมด ${result.totalCases} เคส` +
    (result.truncated ? ' (ข้อมูลเยอะเกินขีดจำกัด แสดงไม่ครบทุกรายการ)' : '');

  if (!result.statusBreakdown || result.statusBreakdown.length === 0) {
    dashReportStatusList.innerHTML = '<p class="sidebar-dashboard__empty">ไม่พบเคสที่เพิ่มในช่วงวันที่นี้</p>';
  } else {
    dashReportStatusList.innerHTML = result.statusBreakdown.map(s => `
      <div class="sidebar-dashboard__row">
        <span class="sidebar-dashboard__row-name">${escapeHtml(s.status)}</span>
        <span class="sidebar-dashboard__row-count">${s.count}</span>
      </div>`).join('');
  }

  if (!result.cases || result.cases.length === 0) {
    dashReportCasesList.innerHTML = '';
  } else {
    dashReportCasesList.innerHTML = result.cases.map(c => `
      <div class="sidebar-dashboard__case${c.row ? ' sidebar-dashboard__case--clickable' : ''}"
           ${c.row ? `data-case-book="${escapeHtml(c.book)}" data-case-sheet="${escapeHtml(c.sheet)}" data-case-row="${c.row}" title="คลิกเพื่อดูรายละเอียดเคสนี้"` : ''}>
        <div class="sidebar-dashboard__case-top">
          <b>${escapeHtml(c.date)} ${escapeHtml(c.time)}</b>
          <span class="sidebar-dashboard__case-status">${escapeHtml(c.status)}</span>
        </div>
        <div class="sidebar-dashboard__case-meta">${escapeHtml(c.book)} · ${escapeHtml(c.sheet)}${c.row ? ` · แถวที่ ${c.row}` : ''}</div>
      </div>`).join('');
    bindCaseDetailClicks_(dashReportCasesList);
  }

  dashReportResult.hidden = false;
}

function setDashReportStatus(message, type) {
  dashReportStatus.textContent = message;
  dashReportStatus.className = 'sidebar-dashboard__status' + (type ? ` sidebar-dashboard__status--${type}` : '');
}

if (dashReportDownloadBtn) {
  dashReportDownloadBtn.addEventListener('click', () => {
    if (!lastDashboardReport) return;
    downloadDashboardReportAsExcel_(lastDashboardReport);
  });
}

/** สร้างไฟล์ .xlsx จากข้อมูลรายงานล่าสุด แล้วสั่งดาวน์โหลดทันที (ทำฝั่ง browser ด้วย SheetJS ไม่ต้องผ่าน backend) */
function downloadDashboardReportAsExcel_(result) {
  if (typeof XLSX === 'undefined') {
    setDashReportStatus('ไม่พบไลบรารีสร้างไฟล์ Excel (โหลดหน้าเว็บใหม่แล้วลองอีกครั้ง)', 'error');
    return;
  }

  const caseRows = (result.cases || []).map(c => ({
    'วันที่': c.date,
    'เวลา': c.time,
    'ไฟล์': c.book,
    'แท็บ': c.sheet,
    'แถวที่': c.row || '',
    'สถานะ': c.status,
  }));
  const summaryRows = (result.statusBreakdown || []).map(s => ({
    'สถานะ': s.status,
    'จำนวน': s.count,
  }));

  const wb = XLSX.utils.book_new();
  const wsCases = XLSX.utils.json_to_sheet(caseRows.length ? caseRows : [{ 'หมายเหตุ': 'ไม่พบเคสในช่วงวันที่นี้' }]);
  XLSX.utils.book_append_sheet(wb, wsCases, 'รายการเคส');
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows.length ? summaryRows : [{ 'หมายเหตุ': 'ไม่มีข้อมูล' }]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปตามสถานะ');

  const filename = `รายงาน_${formatDateDisplay(result.from).replace(/\//g, '-')}_ถึง_${formatDateDisplay(result.to).replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

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

/* ===== รายละเอียดเคส (คลิกจาก Dashboard หรือรายงานย้อนหลัง) ===== */

const caseModal = document.getElementById('caseModal');
const caseModalMeta = document.getElementById('caseModalMeta');
const caseModalStatus = document.getElementById('caseModalStatus');
const caseModalBody = document.getElementById('caseModalBody');
const caseModalWarn = document.getElementById('caseModalWarn');
const caseModalFields = document.getElementById('caseModalFields');
const caseModalTimeline = document.getElementById('caseModalTimeline');
const caseModalClose = document.getElementById('caseModalClose');

let caseModalTarget = null; // เคสที่กำลังเปิดดูอยู่ ใช้ตอนกดปุ่ม "เปิดแท็บนี้"

/** ผูกการคลิกให้รายการเคสในกล่องที่ระบุ (เรียกใหม่ทุกครั้งที่ render รายการใหม่) */
function bindCaseDetailClicks_(container) {
  if (!container) return;
  container.querySelectorAll('.sidebar-dashboard__case--clickable').forEach(el => {
    el.addEventListener('click', () => {
      openCaseModal({
        book: el.dataset.caseBook,
        sheet: el.dataset.caseSheet,
        row: parseInt(el.dataset.caseRow, 10)
      });
    });
  });
}

/**
 * สร้างตารางแสดงข้อมูลทุกคอลัมน์ของเคส แบบ 2 คอลัมน์ (ชื่อคอลัมน์ / ค่า)
 *
 * ต้องเป็น <table> จริง ไม่ใช่ grid เพราะค่าบางช่องยาวมาก (เช่น ข้อหาแบน)
 * ถ้าใช้ grid แล้วห่อแต่ละคู่ด้วย div ซ้อนอีกชั้น คู่ชื่อ-ค่าจะหลุดออกจากคอลัมน์
 * กลายเป็นข้อความไหลปนกันจนอ่านไม่ออก (เป็นอาการที่เกิดขึ้นในหน้าติดตามสถานะ)
 */
function buildCaseFieldsTable_(fields) {
  return '<table class="case-fields"><tbody>' + (fields || []).map(f => {
    const value = (f.value || '').toString().trim();
    const cell = value
      ? (/^https?:\/\/\S+$/i.test(value)
          ? `<a class="ticket-link" href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`
          : escapeHtml(value))
      : '<span class="case-fields__empty">(ว่าง)</span>';
    return `<tr><th scope="row">${escapeHtml(f.name)}</th><td>${cell}</td></tr>`;
  }).join('') + '</tbody></table>';
}

async function openCaseModal(target) {
  caseModalTarget = target;
  caseModalMeta.textContent = `${target.book} · ${target.sheet} · แถวที่ ${target.row}`;
  caseModalBody.hidden = true;
  caseModalWarn.hidden = true;
  caseModalFields.innerHTML = '';
  caseModalTimeline.innerHTML = '';
  setCaseModalStatus('กำลังโหลดรายละเอียด...', null);
  caseModal.hidden = false;

  try {
    const result = await jsonpRequest(apiUrl({
      action: 'caseDetail', book: target.book, sheet: target.sheet, row: target.row
    }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายละเอียดไม่สำเร็จ');

    renderCaseModal(result);
    setCaseModalStatus('', null);
  } catch (err) {
    setCaseModalStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderCaseModal(result) {
  // ข้อมูลปัจจุบันของเคส
  if (!result.rowExists) {
    caseModalFields.innerHTML = '<p class="case-modal__empty">แถวนี้ไม่มีอยู่ในชีทแล้ว (อาจถูกลบไปแล้ว) แต่ยังดูประวัติย้อนหลังได้ด้านล่าง</p>';
  } else if (result.fields.length === 0) {
    caseModalFields.innerHTML = '<p class="case-modal__empty">แท็บนี้ไม่มีคอลัมน์ที่ตั้งชื่อไว้</p>';
  } else {
    caseModalFields.innerHTML = buildCaseFieldsTable_(result.fields);
  }

  // ประวัติการทำงาน (ใหม่สุดขึ้นก่อน)
  const timeline = (result.timeline || []).slice().reverse();
  // (ฟังก์ชันแยกบรรทัดอยู่ที่ formatEventDetail_ ด้านล่าง)
  if (timeline.length === 0) {
    caseModalTimeline.innerHTML = '<p class="case-modal__empty">ยังไม่มีประวัติของเคสนี้ใน Log (อาจเป็นเคสที่กรอกในชีทโดยตรง ไม่ได้ผ่านหน้าเว็บ)</p>';
  } else {
    caseModalTimeline.innerHTML = timeline.map(ev => `
      <div class="case-modal__event">
        <div class="case-modal__event-top">
          <span class="case-modal__event-action">${escapeHtml(ev.action)}</span>
          <span class="case-modal__event-time">${escapeHtml(ev.time)}</span>
          <span class="case-modal__event-editor">โดย ${escapeHtml(ev.editor)}</span>
        </div>
        <div class="case-modal__event-detail">${formatEventDetail_(ev.detail)}</div>
      </div>`).join('');
  }

  // เตือนตามความเป็นจริง: ถ้าแท็บนี้เคยมีการลบแถว ประวัติที่จับคู่ด้วยเลขแถวอาจคลาดเคลื่อนได้
  if (result.hasDeletionInSheet && timeline.length > 0) {
    caseModalWarn.textContent = 'หมายเหตุ: แท็บนี้เคยมีการลบแถว ซึ่งทำให้เลขแถวของเคสที่อยู่ข้างล่างเลื่อนขึ้น ประวัติด้านล่างจับคู่จากเลขแถว จึงอาจมีรายการของเคสอื่นที่เคยอยู่เลขแถวเดียวกันปนมาได้';
    caseModalWarn.hidden = false;
  }

  caseModalBody.hidden = false;
}

/**
 * จัดรูปแบบข้อความรายละเอียดใน Log ให้อ่านง่าย
 * ฝั่งเซิร์ฟเวอร์เก็บการเปลี่ยนแปลงแต่ละคอลัมน์คั่นด้วย " | " เพราะในชีทเก็บได้แค่บรรทัดเดียวต่อ 1 เซลล์
 * พอมาแสดงบนหน้าเว็บจึงแยกกลับเป็นบรรทัดละคอลัมน์ ไม่ต้องอ่านยาวติดกันเป็นพืด
 */
function formatEventDetail_(detail) {
  const text = (detail || '').toString();
  const parts = text.split(' | ');
  if (parts.length <= 1) return escapeHtml(text);
  const head = parts.shift();
  return `<div>${escapeHtml(head)}</div>`
    + `<ul class="case-modal__changes">${parts.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
}

function setCaseModalStatus(message, type) {
  caseModalStatus.textContent = message;
  caseModalStatus.className = 'case-modal__status' + (type ? ` case-modal__status--${type}` : '');
}

function closeCaseModal() {
  caseModal.hidden = true;
  caseModalTarget = null;
}

caseModalClose.addEventListener('click', closeCaseModal);

// คลิกพื้นหลังนอกกล่องเพื่อปิด (คลิกในกล่องไม่ปิด)
caseModal.addEventListener('click', (evt) => {
  if (evt.target === caseModal) closeCaseModal();
});

// กด Escape ปิดหน้าต่างรายละเอียดเคส
document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && !caseModal.hidden) closeCaseModal();
});

/* ===== ปุ่มปิดในแต่ละพาเนล =====
 * ปุ่มบนแถบด้านบนและแถบเครื่องมือจะคงข้อความเดิมเสมอ (ไม่สลับเป็น "× ปิด...")
 * การปิดทำผ่านปุ่มปิดที่อยู่ในพาเนลนั้นๆ แทน จะได้รู้ทันทีว่าปุ่มไหนทำอะไร
 */
[
  ['addPanelClose', addPanel],
  ['managePanelClose', managePanel],
  ['trashPanelClose', trashPanel],
  ['bookTrashClose', bookTrashPanel]
].forEach(([id, panel]) => {
  const btn = document.getElementById(id);
  if (!btn || !panel) return;
  btn.addEventListener('click', () => { panel.hidden = true; });
});
