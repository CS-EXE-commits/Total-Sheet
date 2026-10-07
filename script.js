/* ===== เวอร์ชันของโค้ดหน้าเว็บ =====
 * ต้องตรงกับเลข ?v= ใน index.html เสมอ ขยับพร้อมกันทุกครั้งที่แก้ไฟล์ .js / .css
 * มีไว้ให้ดูใน Console ได้ทันทีว่าเบราว์เซอร์กำลังรันโค้ดชุดไหน
 * เคยเสียเวลาไล่บั๊กที่แก้ไปแล้วหลายรอบ เพราะเบราว์เซอร์ผู้ใช้ยังรันไฟล์เก่าที่จำไว้
 */
const APP_VERSION = '20261007-1600';
console.log('%c[หน้าเว็บ] เวอร์ชัน ' + APP_VERSION, 'color:#3fb950;font-weight:bold');

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

// ปุ่ม "จัดการข้อมูลชีทนี้" (เดิม "จัดการคอลัมน์") ถูกเอาออกจากหน้าเว็บตามที่ผู้ใช้ขอ
// คงตัวแปรไว้เป็นของเปล่า เพื่อให้โค้ดเดิมที่สั่งซ่อน/แสดง/รีเซ็ตปุ่มนี้ทำงานต่อได้โดยไม่พัง
const manageToggle = document.getElementById('manageToggle') || document.createElement('button');
const managePanel = document.getElementById('managePanel');
const manageChips = document.getElementById('manageChips');
const manageStatus = document.getElementById('manageStatus');

// ปุ่มถังขยะแยกของแต่ละไฟล์ถูกเอาออกแล้ว (รวมเข้าถังขยะไฟล์มุมขวาบน)
// คงตัวแปรไว้เป็นของเปล่า เพื่อให้โค้ดเดิมที่สั่งปิด/รีเซ็ตปุ่มนี้ทำงานต่อได้โดยไม่พัง
const trashToggle = document.getElementById('trashToggle') || document.createElement('button');
const trashPanel = document.getElementById('trashPanel') || document.createElement('section');
const trashList = document.getElementById('trashList');
const trashStatus = document.getElementById('trashStatus');

const reportPanel = document.getElementById('reportPanel');
const reportPanelSheetName = document.getElementById('reportPanelSheetName'); // ไม่มีแล้ว (null) — ประวัติการแก้ไขเป็นภาพรวมทุกไฟล์ ไม่ผูกกับแท็บ
const reportPanelDate = document.getElementById('reportPanelDate');
const reportStats = document.getElementById('reportStats');
const reportStatusList = document.getElementById('reportStatusList'); // ไม่มีแล้วในหน้าเว็บ (null) — คงไว้เพื่อไม่ให้โค้ดเดิมพัง
const reportLogList = document.getElementById('reportLogList');
const reportStatus = document.getElementById('reportStatus');

const dashboardDate = document.getElementById('dashboardDate');
const dashboardCasesToday = document.getElementById('dashboardCasesToday');
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

let filteredRows = []; // แถวของ "หน้าที่กำลังดูอยู่" เท่านั้น (เซิร์ฟเวอร์แบ่งหน้ามาให้แล้ว)
let serverTotal = 0;   // จำนวนรายการทั้งหมดที่ตรงเงื่อนไข (เซิร์ฟเวอร์นับมาให้ ไม่ใช่จำนวนแถวในเครื่อง)

pageSizeSelect.addEventListener('change', () => {
  pageSize = parseInt(pageSizeSelect.value, 10) || 20;
  goToPage_(1);
});

/** ไปหน้าที่ระบุ — ต้องขอข้อมูลใหม่ทุกครั้ง เพราะในเครื่องมีแค่แถวของหน้าที่กำลังดูอยู่ */
function goToPage_(page) {
  if (!selectedSheet) return;
  const target = Math.max(1, page);
  markPagerActive_(target); // ไฮไลต์ปุ่มทันทีที่กด ไม่ต้องรอข้อมูลมาก่อน
  loadSingleTabView(selectedSheet, lastKeyword, target);
}

/**
 * ย้ายไฮไลต์ไปที่ปุ่มหน้าที่ระบุทันที โดยไม่ต้องวาดแถบแบ่งหน้าใหม่
 * ใช้ตอนกดเปลี่ยนหน้า เพราะข้อมูลใช้เวลาโหลด 1-2 วินาที ถ้ารอให้ข้อมูลมาก่อนค่อยเปลี่ยนสี
 * ผู้ใช้จะรู้สึกว่ากดไม่ติดแล้วกดซ้ำ
 */
function markPagerActive_(page) {
  pagination.querySelectorAll('button[data-page]').forEach(btn => {
    btn.setAttribute('aria-current', String(parseInt(btn.dataset.page, 10) === page));
  });
}

/**
 * วาดตารางของ "หน้าที่กำลังดูอยู่"
 *
 * ตั้งแต่เปลี่ยนมาแบ่งหน้าฝั่งเซิร์ฟเวอร์ filteredRows = แถวของหน้านี้เท่านั้น (ไม่เกิน pageSize แถว)
 * ส่วนจำนวนรายการทั้งหมดใช้ serverTotal ที่เซิร์ฟเวอร์นับมาให้ ไม่ใช่ความยาวของ filteredRows
 */
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
  countLabel.textContent = `พบ ${serverTotal.toLocaleString()} รายการ` + (lastTruncated ? ' (แสดงได้สูงสุดตามขีดจำกัด อาจมีมากกว่านี้ ลองพิมพ์คำค้นหาให้เจาะจงขึ้น)' : '');

  const totalPages = Math.max(Math.ceil(serverTotal / pageSize), 1);
  const pageRows = filteredRows;

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
    btn.dataset.page = String(page);
    btn.setAttribute('aria-current', active ? 'true' : 'false');
    btn.disabled = !!disabled;
    btn.addEventListener('click', () => { goToPage_(page); });
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

/* ===== ปุ่มคัดลอก ===== */

function isExeIdHeader_(name) {
  return /exe\s*[_-]?\s*id/i.test((name || '').toString());
}

/** escapeHtml ไม่ได้หนีเครื่องหมายคำพูด ใช้ใส่ในค่าของ attribute ตรงๆ ไม่ได้ */
function escapeAttr_(value) {
  return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function createCopyButton_(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy-btn';
  btn.textContent = '⧉';
  btn.title = 'คัดลอก';
  btn.setAttribute('aria-label', 'คัดลอก ' + text);
  btn.addEventListener('click', (e) => {
    // ต้องหยุดไม่ให้ไปถึงแถว ไม่งั้นกดคัดลอกแล้วหน้าต่างรายละเอียดเคสจะเด้งขึ้นมาด้วย
    e.stopPropagation();
    copyText_(text, btn);
  });
  return btn;
}

function wireCopyButtons_(container) {
  container.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyText_(btn.dataset.copy, btn);
    });
  });
}

async function copyText_(text, btn) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (e) {
    // บางเบราว์เซอร์/บางสถานการณ์ไม่ให้ใช้ clipboard API ถอยไปใช้วิธีเดิมที่รองรับกว้างกว่า
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
  }
  btn.textContent = ok ? '✓' : '!';
  btn.title = ok ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ';
  btn.classList.toggle('copy-btn--done', ok);
  btn.classList.toggle('copy-btn--fail', !ok);
  clearTimeout(btn._copyTimer);
  btn._copyTimer = setTimeout(() => {
    btn.textContent = '⧉';
    btn.title = 'คัดลอก';
    btn.classList.remove('copy-btn--done', 'copy-btn--fail');
  }, 1200);
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
  // (ห้ามเรียก applyStatusFilterAndRender เพราะมันจะเด้งกลับหน้า 1 และยิงคำขอใหม่โดยไม่จำเป็น)
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
  // ลายนิ้วมือที่คำนวณจากชีทจริง (มาจาก Supabase) ถ้ามาจาก Apps Script จะไม่มี ให้คำนวณจาก cells แทน
  row.__fp = result.fingerprint || null;
  row.__fullLoaded = true;
  return row;
}

/** ลายนิ้วมือแถวที่จะส่งไปให้เซิร์ฟเวอร์ตรวจก่อนแก้/ลบ */
function rowFp_(row) {
  return row.__fp || rowFingerprint_(row.cells);
}

/** ข้อมูลแถวเปลี่ยนแล้ว (เพิ่งแก้เอง) ต้องดึงทั้งแถวใหม่ก่อนแก้ครั้งถัดไป */
function invalidateFullRow_(row) {
  if (!row) return;
  row.__fullLoaded = false;
  row.__fp = null;
}

/**
 * เซิร์ฟเวอร์ปฏิเสธเพราะข้อมูลแถวในชีทไม่ตรงกับที่หน้าเว็บเห็น
 * (มีคนแก้ในชีทตรงๆ ซึ่ง Supabase ยังไม่ทันรู้ หรือแถวเลื่อนเพราะมีการลบ)
 * ให้เลิกเชื่อสำเนาใน Supabase ของไฟล์นี้ชั่วคราว แล้วดึงของจริงจากชีทแทน
 */
function isRowChangedError_(err) {
  return /ข้อมูลแถวนี้ในชีทเปลี่ยนไปแล้ว/.test((err && err.message) || String(err || ''));
}

function handleRowChangedError_(row) {
  invalidateFullRow_(row);
  markBookRecentlyEdited_(currentBook);
  clearTabPageCache_();
}

async function updateStatusQuick(row, headerName, newValue, selectEl) {
  const confirmed = confirm(`ยืนยันเปลี่ยนสถานะแถวที่ ${row.row} เป็น "${newValue}" ?`);
  if (!confirmed) { selectEl.value = ''; return; }

  selectEl.disabled = true;
  const colIndex = currentTableHeaders.indexOf(headerName);
  let oldValue = '';
  let applied = false;
  try {
    await ensureFullRow_(row); // ต้องมีข้อมูลครบทุกคอลัมน์ก่อน ไม่งั้นลายนิ้วมือแถวจะไม่ตรง
    // ต้องเก็บลายนิ้วมือ "ก่อน" แก้ค่าบนหน้าจอ ไม่งั้นจะได้ลายนิ้วมือของค่าใหม่ ซึ่งไม่ตรงกับชีท
    const fp = rowFp_(row);
    oldValue = colIndex !== -1 ? (row.cells[colIndex] || '') : '';
    const data = {};
    data[headerName] = newValue;

    // แสดงค่าใหม่ทันที แล้วค่อยบันทึกเบื้องหลัง — ผู้ใช้ไม่ต้องจ้องรอ Apps Script
    applied = applyRowEditLocally_(row, data, currentTableHeaders);
    showToast_('กำลังบันทึกสถานะ...', 'pending');

    const result = await jsonpRequest(apiUrl({
      action: 'updateRow', book: currentBook, sheet: row.sheet, row: row.row,
      data: JSON.stringify(data), fp: fp
    }));
    if (!result.ok) throw new Error(result.error || 'เปลี่ยนสถานะไม่สำเร็จ');

    invalidateFullRow_(row);
    showToast_('✓ เปลี่ยนสถานะสำเร็จเรียบร้อยแล้ว', 'success');
    if (!applied && selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
  } catch (err) {
    // บันทึกไม่สำเร็จ ต้องคืนค่าเดิมบนหน้าจอ ไม่งั้นผู้ใช้จะเข้าใจว่าเปลี่ยนแล้ว
    if (applied && colIndex !== -1) {
      const back = {};
      back[headerName] = oldValue;
      applyRowEditLocally_(row, back, currentTableHeaders);
    }
    if (isRowChangedError_(err)) {
      handleRowChangedError_(row);
      showToast_('ยังไม่ได้เปลี่ยนสถานะ — แถวนี้ในชีทเพิ่งถูกแก้ไข ระบบโหลดข้อมูลล่าสุดให้แล้ว กรุณาตรวจแล้วลองอีกครั้ง', 'error');
      if (selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
    } else {
      showToast_('เปลี่ยนสถานะไม่สำเร็จ: ' + err.message, 'error');
    }
    selectEl.disabled = false;
    selectEl.value = '';
  }
}

/* ===== ข้อความแจ้งเตือนมุมจอ (ใช้กับการบันทึกเบื้องหลัง) ===== */

let toastEl_ = null;
let toastTimer_ = null;

/**
 * type: 'pending' (กำลังบันทึก ค้างไว้จนกว่าจะเรียกใหม่) | 'success' | 'error'
 * ข้อความ error ค้างไว้นานกว่า เพราะผู้ใช้ต้องอ่านว่าการแก้ไขไม่ได้บันทึก
 */
function showToast_(message, type) {
  if (!toastEl_) {
    toastEl_ = document.createElement('div');
    toastEl_.className = 'toast';
    toastEl_.setAttribute('role', 'status');
    toastEl_.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl_);
  }
  clearTimeout(toastTimer_);
  toastEl_.textContent = message;
  toastEl_.className = 'toast toast--' + (type || 'success') + ' toast--show';
  if (type !== 'pending') {
    toastTimer_ = setTimeout(() => toastEl_.classList.remove('toast--show'), type === 'error' ? 8000 : 2200);
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

/**
 * รายชื่อโฟลเดอร์/ไฟล์ล่าสุด จำไว้ในเบราว์เซอร์ (มีแค่ชื่อไฟล์ ไม่มีข้อมูลเคส)
 * ใช้ตอนรีเฟรชหน้าเว็บ: วาดแถบโฟลเดอร์และเปิดไฟล์ล่าสุดได้ทันที ไม่ต้องรอ Apps Script 2 รอบ
 * ล้างทิ้งตอนออกจากระบบ
 */
const FOLDERS_CACHE_KEY = 'sheetSearchFoldersCache';
function saveFoldersCache_(folders, books) {
  try {
    localStorage.setItem(FOLDERS_CACHE_KEY, JSON.stringify({ folders, books, email: currentUserEmail || '' }));
  } catch (e) { /* ไม่เป็นไร */ }
}
function readFoldersCache_() {
  try {
    const c = JSON.parse(localStorage.getItem(FOLDERS_CACHE_KEY) || 'null');
    return (c && Array.isArray(c.folders) && c.folders.length && Array.isArray(c.books)) ? c : null;
  } catch (e) { return null; }
}

/**
 * รีเฟรชหน้าเว็บ: เข้าสู่ระบบด้วยตั๋วที่จำไว้
 *
 * ถ้ามีรายชื่อโฟลเดอร์ที่จำไว้ → แสดงหน้าเว็บ + เปิดไฟล์/แท็บล่าสุดทันที (ข้อมูลตารางมาจาก Supabase)
 * แล้วค่อยตรวจตั๋วกับ Apps Script เบื้องหลัง ถ้าตั๋วใช้ไม่ได้แล้วค่อยเด้งกลับหน้าล็อกอิน
 * ตรวจตั๋ว + โหลดรายชื่อไฟล์ + เชื่อม Supabase ยิงพร้อมกันทั้งหมด ไม่รอกันเป็นทอดๆ
 */
async function trySessionRestore(token) {
  currentSessionToken = token;
  const cached = readFoldersCache_();
  const supaTask = ensureSupabaseSession_();
  const sessionTask = jsonpRequest(rawApiUrl({ action: 'session', token }));
  sessionTask.catch(() => {}); // กัน unhandled rejection ระหว่างที่ยังไม่ได้ await
  let booksTask = null;

  if (cached) {
    loginModal.hidden = true;
    topbarAccount.hidden = false;
    if (cached.email) { currentUserEmail = cached.email; setTopbarAccountEmail(cached.email); }
    appLayout.hidden = false;
    renderFolderBar(cached.folders);
    await waitForSupabaseOrGiveUp_(supaTask);
    restoreLastView(cached.books);
  } else {
    setLoginStatus('กำลังเข้าสู่ระบบ...', null);
    booksTask = loadBooks(); // ยิงพร้อมกับตรวจตั๋ว ไม่ต้องรอกัน
  }

  let result;
  try {
    result = await sessionTask;
  } catch (err) {
    if (cached) {
      // เน็ตสะดุดชั่วคราว ตั๋วอาจยังดีอยู่ — ใช้งานต่อได้ ไม่เด้งผู้ใช้ออก
      console.warn('[หน้าเว็บ] ตรวจตั๋วไม่สำเร็จ (จะลองใหม่รอบหน้า):', err.message);
      loadBooks(); initGlobalDashboard(); loadDailyReport();
      return;
    }
    result = { ok: false };
  }

  if (!result || !result.ok) {
    // ตั๋วหมดอายุหรือถูกถอนสิทธิ์ → ออกจากระบบให้สะอาด แล้วกลับหน้าล็อกอิน
    if (cached) { logoutButton.click(); return; }
    localStorage.removeItem('sheetSearchToken');
    currentSessionToken = '';
    loginModal.hidden = false;
    setLoginStatus('', null);
    return;
  }

  currentUserEmail = result.email;
  loginModal.hidden = true;
  topbarAccount.hidden = false;
  setTopbarAccountEmail(currentUserEmail);
  setAdminLinkVisible(result.isAdmin);
  appLayout.hidden = false;
  setLoginStatus('', null);

  if (cached) {
    // อัปเดตรายชื่อไฟล์ เผื่อมีไฟล์เพิ่ม/เปลี่ยนชื่อ (Apps Script ใหม่แนบมากับ session แล้ว)
    if (Array.isArray(result.folders) && result.folders.length) applyBooksResult_(result);
    else loadBooks();
  } else {
    const books = await booksTask;
    await waitForSupabaseOrGiveUp_(supaTask);
    restoreLastView(books);
  }
  initGlobalDashboard();
  loadDailyReport();
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

/**
 * เตรียมตั๋ว Supabase ให้พร้อมใช้งาน — มี ID token ก็แลกใหม่ ไม่มีก็กู้ของเดิมที่จำไว้
 *
 * ห้ามโยน error ออกไปเด็ดขาด เพราะฟังก์ชันนี้ถูกเรียกระหว่างขั้นตอนล็อกอิน
 * ถ้า Supabase มีปัญหา (เช่นยังไม่ได้ตั้งค่า Client ID หรือเน็ตมีปัญหา)
 * ต้องให้ผู้ใช้เข้าใช้งานได้ตามปกติผ่าน Apps Script ไม่ใช่ล็อกอินไม่ผ่านทั้งระบบ
 */
/**
 * รอการเชื่อมต่อ Supabase ได้ไม่เกิน 2.5 วินาที แล้วไปต่อไม่ว่าจะเสร็จหรือไม่
 *
 * ทำไมต้องจำกัดเวลา: Supabase เป็นแค่ตัวเร่งความเร็ว ไม่ใช่สิ่งที่ระบบขาดไม่ได้
 * ถ้าปล่อยให้รอจนเสร็จ (ซึ่งรอได้ถึง 15 วินาทีตามเวลาตัดคำขอ) ผู้ใช้จะเห็นหน้าจอว่างเปล่า
 * ไม่มีแถบโฟลเดอร์ ไม่มีอะไรเลย แล้วเข้าใจว่าเว็บพัง — เคยเกิดขึ้นจริงมาแล้ว
 *
 * ถ้ายังไม่ทันเสร็จใน 2.5 วินาที แท็บแรกจะไปอ่านจาก Google Sheets ตามปกติ (ช้าหน่อยครั้งเดียว)
 * แล้วตั๋วจะพร้อมเองเบื้องหลัง การกดแท็บครั้งต่อๆ ไปจึงได้ความเร็วเต็มที่
 */
function waitForSupabaseOrGiveUp_(task) {
  return Promise.race([
    Promise.resolve(task).catch(() => false),
    new Promise(resolve => setTimeout(() => resolve(false), 2500))
  ]);
}

async function ensureSupabaseSession_(idToken, email) {
  if (typeof supaSignInWithGoogle !== 'function') return false;
  try {
    if (idToken) {
      await supaSignInWithGoogle(idToken, email);
    } else {
      await supaRestoreSession();
    }
    // ตรวจหนึ่งครั้งว่าอ่านข้อมูลได้จริงไหม แล้วสรุปสาเหตุลง Console ถ้าไม่ได้
    // ไม่ต้องรอผล เพราะเป็นแค่เครื่องมือช่วยวินิจฉัย ไม่ควรถ่วงการเปิดหน้าเว็บ
    if (supaReady() && typeof supaSelfTest === 'function') supaSelfTest();
    return supaReady();
  } catch (err) {
    console.warn('[Supabase] เข้าสู่ระบบไม่สำเร็จ จะใช้ Apps Script แทน:', err.message);
    return false;
  }
}

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
    // แลก ID token ใบเดียวกันเป็นตั๋วของ Supabase ผู้ใช้ไม่ต้องกดล็อกอินเพิ่ม
    // ยิงคู่ขนานไปกับการโหลดรายชื่อไฟล์ ไม่ใช่รอให้เสร็จก่อน (ดู waitForSupabaseOrGiveUp_)
    const supaTask = ensureSupabaseSession_(idToken, result.email);
    // Apps Script เวอร์ชันใหม่แนบรายชื่อไฟล์มากับผลล็อกอินแล้ว ไม่ต้องรอขออีกรอบ
    const books = Array.isArray(result.folders) && result.folders.length
      ? applyBooksResult_(result)
      : await loadBooks();
    await waitForSupabaseOrGiveUp_(supaTask);
    restoreLastView(books);
    initGlobalDashboard();
    loadDailyReport();
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
  // บอกเซิร์ฟเวอร์ก่อนล้างตั๋ว ไม่งั้นคำขอจะไม่มีตั๋วแนบไปและถูกปฏิเสธ
  // ไม่ต้องรอผล (ไม่ใส่ await) เพราะผู้ใช้ควรออกจากระบบทันที ไม่ต้องค้างรอเซิร์ฟเวอร์
  // ถ้าบันทึกไม่สำเร็จก็ยังออกจากระบบได้ปกติ แค่ไม่มีบรรทัดขาออกใน Log
  if (currentSessionToken) {
    jsonpRequest(apiUrl({ action: 'logout' }))
      .catch(() => { /* บันทึกไม่ได้ก็ไม่ควรขวางการออกจากระบบ */ });
  }
  localStorage.removeItem('sheetSearchToken');
  localStorage.removeItem(FOLDERS_CACHE_KEY);
  // ล้างรายการถังขยะที่โหลดค้างไว้ (มีตัวอย่างข้อมูลที่ถูกลบ) ไม่ให้คนถัดไปเห็น
  if (dataTrashList) dataTrashList.innerHTML = '';
  if (bookTrashList) bookTrashList.innerHTML = '';
  trashPrefetchedAt_ = 0;
  // ต้องล้างตั๋ว Supabase ด้วย ไม่งั้นคนถัดไปที่ใช้เครื่องนี้ยังอ่านข้อมูลจาก Supabase ได้ทั้งที่ออกจากระบบแล้ว
  if (typeof supaClearSession === 'function') supaClearSession();
  if (typeof supaClearMetaCache === 'function') supaClearMetaCache();
  currentSessionToken = '';
  localStorage.removeItem('sheetSearchLastBook');
  localStorage.removeItem('sheetSearchLastSheet');
  currentUserEmail = '';
  currentBook = '';
  selectedSheet = '';
  appLayout.hidden = true;
  topbarAccount.hidden = true;
  // ซ่อนแถบโฟลเดอร์และล้างเฉพาะ "รายการข้างใน" เท่านั้น
  //
  // ห้ามใช้ folderBar.innerHTML = '' เด็ดขาด เพราะจะลบกล่อง folderList กับฟอร์มเพิ่มไฟล์ทิ้งไปด้วย
  // ซึ่งโค้ดจดตำแหน่งไว้ตั้งแต่ตอนเปิดหน้าเว็บ (getElementById ครั้งเดียว)
  // พอล็อกอินใหม่ โฟลเดอร์จะถูกใส่ลงในกล่องใบเก่าที่หลุดจากหน้าจอไปแล้ว ใส่สำเร็จแต่ไม่มีใครเห็น
  // ผู้ใช้ต้องรีเฟรชทุกครั้งหลังล็อกอิน — เคยเกิดขึ้นจริงและหาสาเหตุอยู่นาน
  if (folderBar) folderBar.hidden = true;
  // ปิดกล่องประวัติการแก้ไขด้วย ไม่งั้นล็อกอินครั้งถัดไปจะเห็นกล่องค้างเปิดอยู่พร้อมข้อมูลของรอบก่อน
  if (typeof setHistoryOpen_ === 'function') setHistoryOpen_(false);
  if (folderList) {
    // ฟอร์มเพิ่มไฟล์อาจถูกย้ายไปแปะอยู่ในโฟลเดอร์ ต้องย้ายกลับก่อนล้างรายการ
    // ไม่งั้นฟอร์มจะถูกลบไปด้วย แล้วปุ่มเพิ่มไฟล์จะใช้ไม่ได้อีกเลยจนกว่าจะรีเฟรช
    // (เหตุผลเดียวกับที่ renderFolderBar ทำ)
    if (addFilePanel && folderList.contains(addFilePanel)) {
      addFilePanel.hidden = true;
      anchorAddFilePanel_(null);
    }
    folderList.innerHTML = '';
  }
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
/* ===== แคชหน้าข้อมูลในเครื่อง (ภายในรอบการใช้งานนี้เท่านั้น) =====
 *
 * ค่าโสหุ้ยของ Apps Script อยู่ที่ประมาณ 1-2 วินาทีต่อคำขอ ไม่ว่าจะขอ 1 แถวหรือ 100 แถว
 * ลดไม่ได้ด้วยการส่งข้อมูลให้น้อยลง แต่ "ตัดการรอทิ้ง" ได้ถ้าเคยโหลดหน้านั้นไปแล้ว
 *
 * วิธีทำงาน: กดแล้วเอาของที่จำไว้ขึ้นจอทันที พร้อมกับยิงคำขอจริงไปเช็คเบื้องหลัง
 * ถ้าข้อมูลเปลี่ยนค่อยวาดทับ (stale-while-revalidate) ผู้ใช้จึงไม่ต้องรอ แต่ก็ไม่เห็นข้อมูลเก่าค้าง
 *
 * เก็บไว้ในหน่วยความจำเท่านั้น ปิดแท็บเบราว์เซอร์แล้วหาย — ตั้งใจให้เป็นแบบนั้น
 * เพราะข้อมูลเคสเป็นข้อมูลลูกค้า ไม่ควรไปค้างอยู่ใน localStorage ของเครื่องใคร
 */
const TAB_PAGE_CACHE_MAX = 60; // จำนวนหน้าที่จำไว้ (เกินกว่านี้ทิ้งอันที่เก่าสุด)
const tabPageCache_ = new Map();

function tabCacheKey_(book, sheetName, keyword, status, size, page) {
  return [book, sheetName, keyword || '', status || '', size, page].join('\u0000');
}

function tabCacheGet_(key) {
  const hit = tabPageCache_.get(key);
  if (!hit) return null;
  // ใช้แล้วเลื่อนไปท้ายคิว อันที่ใช้บ่อยจะไม่โดนทิ้งก่อน
  tabPageCache_.delete(key);
  tabPageCache_.set(key, hit);
  return hit;
}

function tabCacheSet_(key, payload) {
  tabPageCache_.set(key, payload);
  while (tabPageCache_.size > TAB_PAGE_CACHE_MAX) {
    tabPageCache_.delete(tabPageCache_.keys().next().value);
  }
}

/** ล้างแคชทั้งหมด — ต้องเรียกทุกครั้งที่มีการเขียนข้อมูล ไม่งั้นจะเห็นค่าเก่าหลังบันทึก */
function clearTabPageCache_() {
  tabPageCache_.clear();
}

// คำสั่งที่เปลี่ยนแปลงข้อมูล ถ้ายิงคำสั่งพวกนี้เมื่อไหร่ แคชที่จำไว้ใช้ไม่ได้แล้ว
// ดักที่จุดเดียวตรงนี้ปลอดภัยกว่าไปไล่ล้างตามแต่ละปุ่ม เพราะไม่มีทางลืม
const CACHE_BUSTING_ACTIONS = [
  'add', 'deleteRow', 'updateRow', 'setRowColor', 'deleteColumn', 'restore',
  'restoreBook', 'addBook', 'createBook', 'removeBook', 'renameBook',
  'createSheet', 'repairDropdowns', 'uploadRows', 'splitYear'
];

// คำสั่งอ่านข้อมูลที่ย้ายไปดึงจาก Supabase แล้ว (เร็วกว่า Apps Script หลายเท่า)
// ถ้า Supabase ใช้ไม่ได้ด้วยเหตุใดก็ตาม จะถอยไปยิง Apps Script เส้นเดิมให้อัตโนมัติ
// ผู้ใช้จึงไม่มีทางเจอหน้าจอว่าง แค่ช้าลงเท่าเดิมกับก่อนย้าย
const SUPABASE_ACTIONS = ['tabView', 'sheetStatusTally', 'sheets', 'headers', 'tableHeaders', 'rowFull'];

// คำสั่งเขียนที่แตะแค่ "ข้อมูลแถว" ไม่ได้เปลี่ยนโครงสร้างแท็บ (คอลัมน์ ชื่อแท็บ รายชื่อไฟล์)
// ไม่ต้องล้างโครงสร้างที่โหลดไว้ ไม่งั้นทุกครั้งที่บันทึก การกดครั้งถัดไปต้องรอโหลดโครงสร้างใหม่ทั้งหมด
const ROW_ONLY_WRITE_ACTIONS = ['add', 'updateRow', 'deleteRow', 'setRowColor'];

/**
 * ไฟล์ที่เพิ่งถูกแก้ไข จะยังอ่านจาก Google Sheets ต่อไปอีกพักหนึ่ง
 *
 * ทำไมต้องมี: Supabase เป็น "สำเนา" ที่ตามหลังอยู่ ซิงก์รอบละ 15 นาที
 * ถ้าไม่กันไว้ ผู้ใช้กดบันทึกแล้วตารางจะรีเฟรชไปอ่านสำเนาเก่าที่ยังไม่มีการแก้ไขนั้น
 * ขึ้นค่าเดิมกลับมาเหมือนบันทึกไม่ติด ซึ่งน่าตกใจกว่าช้าไปสองสามวินาทีมาก
 *
 * ตั้งไว้ 20 นาที = เผื่อรอบซิงก์ 15 นาที บวกเวลาที่ตัวซิงก์ใช้ทำงานจริง
 * กันทั้งไฟล์ ไม่ใช่เฉพาะแท็บ เพราะบางคำสั่ง (เช่น แยกแท็บตามปี) กระทบหลายแท็บพร้อมกัน
 */
const SUPABASE_STALE_GUARD_MS = 20 * 60 * 1000;
const supaStaleBooks_ = new Map(); // ชื่อไฟล์ -> เวลาที่หมดระยะกัน

function markBookRecentlyEdited_(book) {
  if (book) supaStaleBooks_.set(book, Date.now() + SUPABASE_STALE_GUARD_MS);
}

function bookRecentlyEdited_(book) {
  const until = supaStaleBooks_.get(book);
  if (!until) return false;
  if (Date.now() > until) { supaStaleBooks_.delete(book); return false; }
  return true;
}

function jsonpRequest(url, timeoutMs) {
  const actionMatch = /[?&]action=([^&]*)/.exec(url);
  const action = actionMatch ? decodeURIComponent(actionMatch[1]) : '';
  let book = '';
  try { book = new URL(url).searchParams.get('book') || ''; } catch (e) { /* ไม่เป็นไร */ }

  if (action && CACHE_BUSTING_ACTIONS.indexOf(action) !== -1) {
    clearTabPageCache_();
    // โครงสร้างแท็บอาจเปลี่ยน (เพิ่ม/ลบคอลัมน์ สร้างแท็บ เพิ่ม/ลบไฟล์) ต้องให้ถามใหม่
    // แต่คำสั่งที่แตะแค่ข้อมูลแถวไม่ต้องล้าง
    if (ROW_ONLY_WRITE_ACTIONS.indexOf(action) === -1 && typeof supaClearMetaCache === 'function') {
      supaClearMetaCache();
    }
    // บางคำสั่ง (เพิ่ม/ลบ/เปลี่ยนชื่อไฟล์) ไม่ได้ส่งชื่อไฟล์มาในพารามิเตอร์ book
    // กรณีนั้นกันไฟล์ที่กำลังเปิดอยู่แทน ซึ่งเป็นไฟล์ที่ผู้ใช้จะเห็นผลทันที
    const editedBook = book || currentBook;
    return jsonpRequestRaw_(url, timeoutMs).then(result => {
      // Apps Script ส่งแถวที่เพิ่งบันทึกเข้า Supabase ให้ทันทีแล้ว (supabaseSynced)
      // อ่านจาก Supabase ต่อได้เลย ไม่ต้องถอยไปอ่านชีทที่ช้ากว่ามาก
      // ถ้าส่งไม่ได้ หรือเป็นคำสั่งที่ยังไม่รองรับ ค่อยกันไฟล์นั้นไว้ 20 นาทีเหมือนเดิม
      if (!(result && result.supabaseSynced)) markBookRecentlyEdited_(editedBook);
      return result;
    }, err => {
      // ไม่รู้ว่าบันทึกสำเร็จหรือไม่ (เช่นหมดเวลารอ) กันไว้ก่อนเพื่อไม่ให้เห็นค่าเก่า
      markBookRecentlyEdited_(editedBook);
      throw err;
    });
  }

  if (action && SUPABASE_ACTIONS.indexOf(action) !== -1 &&
      typeof supaReady === 'function' && supaReady() && !bookRecentlyEdited_(book)) {
    return serveFromSupabase_(action, url, timeoutMs);
  }

  return jsonpRequestRaw_(url, timeoutMs);
}

/**
 * ดึงข้อมูลจาก Supabase แทน Apps Script โดยคืนค่าในรูปแบบเดิมเป๊ะ
 * ถ้าล้มเหลวจะยิง Apps Script ต่อให้เอง ไม่โยน error ออกไปให้ผู้เรียก
 *
 * เหตุผลที่ต้องถอยเองตรงนี้ ไม่ปล่อยให้ผู้เรียกจัดการ: จุดเรียก jsonpRequest มีกว่า 30 ที่
 * ถ้าให้แต่ละที่ดักเอง จะมีที่ลืมแน่นอน แล้วกลายเป็นหน้าจอค้างโดยไม่มีข้อความบอก
 */
async function serveFromSupabase_(action, url, timeoutMs) {
  try {
    const params = new URL(url).searchParams;
    if (action === 'tabView') {
      return await supaTabView({
        book: params.get('book'),
        sheet: params.get('sheet'),
        q: params.get('q'),
        status: params.get('status'),
        offset: params.get('offset'),
        limit: params.get('limit'),
        slim: params.get('slim') !== '0'
      });
    }
    if (action === 'sheetStatusTally') {
      return await supaStatusTally(params.get('book'), params.get('sheet'));
    }
    if (action === 'sheets') {
      return await supaSheetList(params.get('book'));
    }
    if (action === 'headers') {
      return await supaHeaders(params.get('book'), params.get('sheet'));
    }
    if (action === 'tableHeaders') {
      return await supaTableHeaders(params.get('book'), params.get('sheet'));
    }
    if (action === 'rowFull') {
      return await supaRowFull(params.get('book'), params.get('sheet'), params.get('row'));
    }
    throw new Error('ไม่รู้จักคำสั่ง ' + action);
  } catch (err) {
    console.warn('[Supabase] ดึงข้อมูลไม่สำเร็จ ถอยไปใช้ Apps Script:', err.message);
    return jsonpRequestRaw_(url, timeoutMs);
  }
}

function jsonpRequestRaw_(url, timeoutMs) {
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

/** วาดแถบโฟลเดอร์จากผลรายชื่อไฟล์ (มาจาก action=books หรือแนบมากับ session/loginGoogle) */
function applyBooksResult_(result) {
  booksHint.textContent = '';
  renderFolderBar(result.folders || []);
  if (currentBook) markActiveFolderItem(); // วาดแถบใหม่แล้ว ไฮไลต์ไฟล์ที่เปิดอยู่ต่อ
  saveFoldersCache_(result.folders || [], result.books || []);
  if (!(result.folders || []).length) {
    console.warn('[หน้าเว็บ] เซิร์ฟเวอร์ไม่ได้ส่งรายชื่อโฟลเดอร์มา แถบโฟลเดอร์จึงว่าง ' +
      '— ตรวจค่า BOOK_FOLDERS_JSON ใน Script Properties');
  }
  return result.books || [];
}

async function loadBooks() {
  if (!API_URL || API_URL.includes('วาง_URL')) {
    booksHint.textContent = 'ยังไม่ได้ตั้งค่า API_URL ใน config.js';
    return [];
  }
  booksHint.textContent = 'กำลังโหลด...';

  // ลองใหม่หนึ่งครั้งถ้าพลาด เพราะถ้าคำขอนี้ล้มเหลว แถบโฟลเดอร์จะว่างทั้งหน้า
  // ผู้ใช้จะใช้งานอะไรไม่ได้เลยและต้องรีเฟรชเอง ซึ่งดูเหมือนเว็บพัง
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await jsonpRequest(apiUrl({ action: 'books' }));
      if (!result.ok) throw new Error(result.error || 'โหลดรายชื่อไฟล์ไม่สำเร็จ');
      return applyBooksResult_(result);
    } catch (err) {
      console.warn('[หน้าเว็บ] โหลดรายชื่อไฟล์ไม่สำเร็จ (ครั้งที่ ' + attempt + '): ' + err.message);
      if (attempt === 2) {
        booksHint.textContent = 'เกิดข้อผิดพลาด: ' + err.message;
        return [];
      }
      await new Promise(r => setTimeout(r, 600));
    }
  }
  return [];
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

  // ฟอร์มเพิ่มไฟล์อาจถูกย้ายมาแปะอยู่ในโฟลเดอร์ ต้องย้ายกลับก่อนล้างรายการ
  // ไม่งั้นฟอร์มจะถูกลบไปพร้อมกับโฟลเดอร์เดิม แล้วปุ่มเพิ่มไฟล์จะใช้ไม่ได้อีกเลย
  if (folderList.contains(addFilePanel)) {
    addFilePanel.hidden = true;
    anchorAddFilePanel_(null);
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

    // แถบรายชื่อไฟล์ทั้งหมดของโฟลเดอร์นี้ ห้อยอยู่ใต้ปุ่มโฟลเดอร์ เรียงไปทางขวา
    // แสดงเฉพาะโฟลเดอร์ที่มีไฟล์ที่เปิดอยู่ (markActiveFolderItem เป็นคนเปิด/ปิด)
    // กดชื่อไฟล์ได้ทันที ไม่ต้องกดเปิดเมนูโฟลเดอร์ก่อน
    if (folder.books.length > 0) {
      const files = document.createElement('div');
      files.className = 'folder__files';
      files.hidden = true;
      folder.books.forEach(book => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'folder__file';
        chip.dataset.book = book;
        chip.textContent = '📄 ' + book;
        chip.title = 'เปิดไฟล์ ' + book;
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          closeAllFolders();
          if (book !== currentBook) openBook(book);
        });
        files.appendChild(chip);
      });
      wrap.appendChild(files);
    }

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
      openAddFilePanel_(folder.name, wrap);
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
    const has = !!currentBook && Array.from(folder.querySelectorAll('.folder__item'))
      .some(i => i.dataset.book === currentBook);
    if (!has) folder.removeAttribute('data-active');
    const files = folder.querySelector('.folder__files');
    if (files) {
      files.hidden = !has;
      files.querySelectorAll('.folder__file').forEach(chip => {
        chip.setAttribute('data-active', String(chip.dataset.book === currentBook));
      });
    }
  });
  // เว้นที่ใต้แถบโฟลเดอร์ให้แถบรายชื่อไฟล์ เฉพาะตอนที่มีโฟลเดอร์ถูกเปิดใช้อยู่
  folderBar.classList.toggle('folder-bar--with-files',
    !!folderBar.querySelector('.folder__files:not([hidden])'));
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
  anchorAddFilePanel_(null); // ย้ายกลับที่เดิม ไม่ให้ค้างอยู่ในโฟลเดอร์ที่อาจถูกวาดใหม่
  addBookName.value = '';
  addBookUrl.value = '';
  if (addBookFile) addBookFile.value = '';
  setAddMode_('link');
}

/**
 * เปิดฟอร์มเพิ่มไฟล์ พร้อมเลือกโฟลเดอร์ปลายทางไว้ให้
 * เรียกจากปุ่ม "+ เพิ่มไฟล์" ท้ายเมนูของแต่ละโฟลเดอร์ จึงรู้อยู่แล้วว่าจะเอาไฟล์ไปไว้ที่ไหน
 */
// ที่อยู่เดิมของฟอร์มเพิ่มไฟล์ (ในแถบด้านบนมุมขวา) ไว้ย้ายกลับเมื่อไม่ได้เปิดจากโฟลเดอร์
const addFilePanelHome = addFilePanel.parentElement;

/**
 * ย้ายฟอร์มเพิ่มไฟล์ไปแปะใต้โฟลเดอร์ที่กดมา เพื่อให้ป๊อปอัปโผล่ตรงโฟลเดอร์นั้น
 * ไม่ใช่ไปโผล่มุมขวาบนซึ่งอยู่คนละที่กับที่ผู้ใช้กด
 */
function anchorAddFilePanel_(anchorEl) {
  const host = anchorEl || addFilePanelHome;
  if (addFilePanel.parentElement !== host) host.appendChild(addFilePanel);
  addFilePanel.classList.toggle('topmenu__panel--anchored', !!anchorEl);
  if (!anchorEl) {
    addFilePanel.style.left = '';
    addFilePanel.style.right = '';
    addFilePanel.style.transform = '';
    return;
  }

  // โฟลเดอร์ที่อยู่ค่อนไปทางขวาของจอ ถ้าแปะชิดซ้ายฟอร์มจะล้นออกนอกจอ ให้สลับไปชิดขวาแทน
  addFilePanel.style.left = '0';
  addFilePanel.style.right = 'auto';
  addFilePanel.style.transform = '';
  let rect = addFilePanel.getBoundingClientRect();
  if (rect.right > window.innerWidth - 12) {
    addFilePanel.style.left = 'auto';
    addFilePanel.style.right = '0';
    rect = addFilePanel.getBoundingClientRect();
  }
  // จอแคบๆ ฟอร์มกว้างเกือบเต็มจอ สลับข้างแล้วอาจทะลุขอบซ้ายแทน ดันกลับเข้ามาให้พอดี
  if (rect.left < 12) addFilePanel.style.transform = `translateX(${Math.round(12 - rect.left)}px)`;
}

function openAddFilePanel_(folderName, anchorEl) {
  bookTrashPanel.hidden = true;
  createBookPanel.hidden = true;
  createBookToggle.textContent = '+ สร้างไฟล์ Google Sheet';
  addFilePanel.hidden = false;
  addBookName.value = '';
  addBookUrl.value = '';
  if (addBookFile) addBookFile.value = '';
  setAddMode_('link');
  anchorAddFilePanel_(anchorEl);
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

/* ===== ประวัติการแก้ไข (ปุ่มมุมขวาบน กดแล้วกล่องเด้งลงมา) ===== */

const historyMenu = document.getElementById('historyMenu');
const historyToggle = document.getElementById('historyToggle');
const historyPanel = document.getElementById('historyPanel');

function setHistoryOpen_(open) {
  if (!historyPanel) return;
  historyPanel.hidden = !open;
  historyToggle.setAttribute('aria-expanded', String(open));
  historyToggle.classList.toggle('topbtn--active', open);
}

if (historyToggle) {
  historyToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = historyPanel.hidden;
    // ปิดกล่องอื่นที่อยู่บนแถบเดียวกัน ไม่ให้ซ้อนทับกัน
    addFilePanel.hidden = true;
    createBookPanel.hidden = true;
    bookTrashPanel.hidden = true;
    closeAllFolders();
    setHistoryOpen_(willOpen);
    // โหลดใหม่ทุกครั้งที่เปิด ให้เห็นเหตุการณ์ล่าสุดจริง ไม่ใช่ของตอนเปิดหน้าเว็บ
    if (willOpen) loadDailyReport();
  });

  // คลิกข้างนอกหรือกด Esc เพื่อปิด
  document.addEventListener('click', (e) => {
    if (!historyPanel.hidden && !historyMenu.contains(e.target)) setHistoryOpen_(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !historyPanel.hidden) setHistoryOpen_(false);
  });
}

/* ===== ถังขยะไฟล์ ===== */

// เอาเมาส์ไปวางที่ปุ่มถังขยะ = เริ่มโหลดรอไว้เลย พอกดเปิดก็เห็นข้อมูลทันที (กันยิงซ้ำภายใน 30 วินาที)
let trashPrefetchedAt_ = 0;
bookTrashToggle.addEventListener('mouseenter', () => {
  if (!currentSessionToken || Date.now() - trashPrefetchedAt_ < 30000) return;
  trashPrefetchedAt_ = Date.now();
  loadBookTrash();
});

bookTrashToggle.addEventListener('click', () => {
  const isOpen = !bookTrashPanel.hidden;
  bookTrashPanel.hidden = isOpen;
  addFilePanel.hidden = true;
  createBookPanel.hidden = true;
  createBookToggle.textContent = '+ สร้างไฟล์ Google Sheet';
  bookTrashToggle.textContent = '🗑 ถังขยะไฟล์';
  if (!isOpen && Date.now() - trashPrefetchedAt_ > 5000) loadBookTrash();
});

const dataTrashList = document.getElementById('dataTrashList');
const dataTrashStatus = document.getElementById('dataTrashStatus');

function setDataTrashStatus(message, type) {
  if (!dataTrashStatus) return;
  dataTrashStatus.textContent = message;
  dataTrashStatus.className = 'sidebar-panel__status' + (type ? ` sidebar-panel__status--${type}` : '');
}

/**
 * ข้อมูลที่ลบ (แถว/คอลัมน์) ของ "ทุกไฟล์" รวมไว้ที่เดียว
 * แต่ละไฟล์เก็บถังขยะของตัวเองไว้ในแท็บซ่อน _Trash จึงต้องถามทีละไฟล์ (ยิงพร้อมกัน)
 * ไฟล์ที่เปิดอยู่ขึ้นก่อน เพราะเป็นไฟล์ที่ผู้ใช้น่าจะเพิ่งลบของไป
 */
async function loadDataTrash() {
  if (!dataTrashList) return;
  const books = [];
  (knownFolders || []).forEach(f => (f.books || []).forEach(b => { if (books.indexOf(b) === -1) books.push(b); }));
  if (currentBook && books.indexOf(currentBook) > 0) {
    books.splice(books.indexOf(currentBook), 1);
    books.unshift(currentBook);
  }
  if (!books.length) { dataTrashList.innerHTML = ''; setDataTrashStatus('ยังไม่มีไฟล์ในระบบ', null); return; }

  // รายการรอบก่อนยังแสดงค้างไว้ระหว่างโหลด (ไม่ล้างเป็นหน้าว่าง) แล้ววาดใหม่ทีละไฟล์ทันทีที่ได้คำตอบ
  // ไม่รอให้ครบทุกไฟล์ก่อน — ไฟล์ที่ตอบเร็วขึ้นก่อน
  setDataTrashStatus(dataTrashList.children.length ? 'กำลังอัปเดต...' : 'กำลังโหลด...', null);
  const results = books.map(book => ({ book, items: null, error: '' }));
  const redraw = () => {
    const done = results.filter(r => r.items !== null);
    if (!done.length) return;
    dataTrashList.innerHTML = '';
    let total = 0;
    done.forEach(r => r.items.forEach(item => {
      item.book = r.book;
      dataTrashList.appendChild(buildDataTrashRow_(item));
      total++;
    }));
    const failed = done.filter(r => r.error).map(r => r.book);
    const pending = results.length - done.length;
    const failNote = failed.length ? ` (โหลดไม่สำเร็จ: ${failed.join(', ')})` : '';
    if (pending) setDataTrashStatus(`กำลังโหลดอีก ${pending} ไฟล์...` + failNote, null);
    else setDataTrashStatus(total === 0 ? 'ยังไม่มีข้อมูลที่ถูกลบ' + failNote : failNote, failed.length ? 'error' : null);
  };
  await Promise.all(results.map(r =>
    jsonpRequest(apiUrl({ action: 'trash', book: r.book }))
      .then(res => { r.items = (res && res.ok && Array.isArray(res.items)) ? res.items : []; r.error = (res && !res.ok) ? res.error : ''; })
      .catch(err => { r.items = []; r.error = err.message; })
      .then(redraw)
  ));
}

function buildDataTrashRow_(item) {
  const row = document.createElement('div');
  row.className = 'trash-item';
  const typeLabel = item.type === 'row' ? 'ลบแถว' : 'ลบคอลัมน์';
  row.innerHTML = `
    <div class="trash-item__info">
      <div class="trash-item__meta">${escapeHtml(typeLabel)} · ${escapeHtml(formatDateTime(item.deletedAt))}</div>
      <div class="trash-item__where">📄 ${escapeHtml(item.book)} · ${escapeHtml(item.sheetName)}</div>
      <div class="trash-item__preview">${escapeHtml(item.preview)}</div>
    </div>`;
  const restoreBtn = document.createElement('button');
  restoreBtn.type = 'button';
  restoreBtn.className = 'trash-item__restore';
  restoreBtn.textContent = 'กู้คืน';
  restoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restoreDataTrashItem_(item, row, restoreBtn);
  });
  row.appendChild(restoreBtn);
  return row;
}

async function restoreDataTrashItem_(item, rowEl, buttonEl) {
  buttonEl.disabled = true;
  buttonEl.textContent = 'กำลังกู้คืน...';
  try {
    // ต้องส่งไฟล์ของรายการนั้นเอง ไม่ใช่ไฟล์ที่เปิดอยู่ เพราะถังขยะรวมรายการของทุกไฟล์
    const result = await jsonpRequest(apiUrl({ action: 'restore', book: item.book, id: item.id }));
    if (!result.ok) throw new Error(result.error || 'กู้คืนไม่สำเร็จ');
    rowEl.remove();
    setDataTrashStatus(result.message, 'success');
    if (item.book === currentBook && selectedSheet === item.sheetName) {
      await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
    }
  } catch (err) {
    setDataTrashStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    buttonEl.disabled = false;
    buttonEl.textContent = 'กู้คืน';
  }
}

async function loadBookTrash() {
  loadDataTrash();
  // รายการรอบก่อนแสดงค้างไว้ระหว่างโหลด ไม่ล้างเป็นหน้าว่าง
  setBookTrashStatus(bookTrashList.children.length ? 'กำลังอัปเดต...' : 'กำลังโหลด...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'bookTrash' }));
    if (!result.ok) throw new Error(result.error || 'โหลดถังขยะไฟล์ไม่สำเร็จ');
    const items = Array.isArray(result.items) ? result.items : [];
    renderBookTrashItems(items);
    setBookTrashStatus(items.length === 0 ? 'ยังไม่มีไฟล์ที่ถูกเอาออก' : '', null);
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

    // ดึงโครงสร้างของทุกแท็บในไฟล์มาจำไว้ด้วยคำขอเดียว
    // หลังจากนี้การกดแท็บเหลือคำขอเดียว (ขอข้อมูลแถว) แทนที่จะเป็นสองคำขอเรียงกัน
    // ไม่ต้องรอผล เพราะแท็บแรกเริ่มโหลดได้เลย แท็บที่เหลือได้ประโยชน์ตอนผู้ใช้กด
    if (typeof supaWarmBookMeta === 'function' && typeof supaReady === 'function' && supaReady()) {
      supaWarmBookMeta(book).catch(() => { /* ไม่สำเร็จก็แค่กลับไปถามทีละแท็บเหมือนเดิม */ });
    }
    // ถ้าระบุแท็บล่าสุดไว้ (เช่น ตอนรีเฟรชหน้าเว็บ) และแท็บนั้นยังมีอยู่จริง ให้เปิดแท็บนั้นต่อ
    // ไม่งั้นเปิดแท็บแรกของไฟล์ให้เลย (ไม่มีโหมดรวมทุกแท็บแล้ว)
    const sheetToSelect = (initialSheet && result.sheets.some(s => s.name === initialSheet))
      ? initialSheet
      : (result.sheets[0] ? result.sheets[0].name : '');
    if (sheetToSelect) {
      selectTab(sheetToSelect);
      // ดักโหลดแท็บที่เหลือไว้เงียบๆ หลังแท็บแรกวาดเสร็จ
      // หน่วงไว้ก่อนเพื่อให้แท็บที่ผู้ใช้เห็นอยู่โหลดเสร็จก่อน ไม่ไปแย่งช่องทางกัน
      setTimeout(() => prefetchAllTabsInBook_(result.sheets, sheetToSelect), 1200);
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
  // เอาเมาส์ไปวางก่อนกดจริงมักมีจังหวะ 200-500 มิลลิวินาที ใช้จังหวะนั้นโหลดรอไว้เลย
  pill.addEventListener('mouseenter', () => prefetchTabOnHover_(sheetName));
  pill.addEventListener('focus', () => prefetchTabOnHover_(sheetName));
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

/**
 * โหลด "หน้าที่กำลังดูอยู่" ของแท็บ (ไม่ใช่ทั้งแท็บ)
 *
 * เดิมดึงข้อมูลมาทั้งแท็บแล้วค่อยแบ่งหน้า/กรองสถานะในเครื่อง แท็บ 8,500 แถวจึงต้องรอ ~15 วินาที
 * ทั้งที่หน้าจอแสดงแค่ 100 แถว ตอนนี้ขอเฉพาะแถวของหน้านั้น เวลาโหลดจึงไม่ขึ้นกับขนาดแท็บอีกต่อไป
 *
 * ข้อแลกเปลี่ยน: เปลี่ยนหน้า/กรองสถานะ/ค้นหา ต้องยิงคำขอใหม่ทุกครั้ง (รอ 1-2 วินาที)
 * แต่ไม่ต้องรอยาวตอนเปิดแท็บอีกแล้ว
 *
 * หัวตารางและตัวเลือก dropdown เซิร์ฟเวอร์ส่งมาเฉพาะตอน offset = 0 เท่านั้น
 * หน้าถัดๆ ไปจึงใช้ของเดิมที่เก็บไว้ ไม่ต้องอ่านซ้ำ
 */
async function loadSingleTabView(sheetName, keyword, page) {
  lastKeyword = keyword;
  input.value = keyword;
  const targetPage = Math.max(1, parseInt(page, 10) || 1);

  // กันปัญหาข้อมูล/ลิงก์ Ticket ขึ้นๆ หายๆ ที่เกิดจาก "คำขอเก่าที่ช้ากว่า" กลับมาถึงทีหลัง
  // คำขอที่ใหม่กว่า แล้วไปเขียนทับผลลัพธ์ล่าสุดด้วยข้อมูลเก่า (race condition) — ถ้ามีคนกดค้นหา/สลับแท็บ
  // ซ้อนกันเร็วๆ ให้ยึดเฉพาะคำขอล่าสุดเท่านั้น คำขอเก่าที่ตอบกลับมาทีหลังจะถูกทิ้งไปเงียบๆ
  const requestId = ++loadRequestSeq;

  // เปลี่ยนแท็บแล้ว ตัวกรองสถานะของแท็บเดิมใช้ต่อไม่ได้ ต้องล้างก่อนยิงคำขอ
  // ไม่งั้นจะเผลอส่งค่าสถานะของแท็บเก่าไปกรองแท็บใหม่ แล้วขึ้นว่าไม่พบข้อมูล
  if (sheetName !== statusOptionsSheet) {
    discoveredStatusValues = new Set();
    statusOptionsSheet = sheetName;
    statusFilter.value = '';
    filteredRows = [];
  }

  const status = statusFilter.hidden ? '' : statusFilter.value;
  const cacheKey = tabCacheKey_(currentBook, sheetName, keyword, status, pageSize, targetPage);
  const cached = tabCacheGet_(cacheKey);

  // เคยโหลดหน้านี้แล้ว เอาขึ้นจอทันทีโดยไม่ต้องรอ แล้วค่อยเช็คของจริงเบื้องหลัง
  const servedFromCache = !!(cached && applyTabViewResult_(cached, sheetName, targetPage));
  if (!servedFromCache) {
    setLoading(true);
    if (!filteredRows.length) showHint('กำลังโหลด...', false);
  }

  try {
    const viewResult = await jsonpRequest(apiUrl({
      action: 'tabView', book: currentBook, sheet: sheetName, q: keyword,
      offset: (targetPage - 1) * pageSize, limit: pageSize, slim: 1, status: status
    }), BIG_TAB_TIMEOUT_MS);
    if (requestId !== loadRequestSeq) return;
    if (!viewResult.ok) throw new Error(viewResult.error || 'โหลดข้อมูลไม่สำเร็จ');

    tabCacheSet_(cacheKey, viewResult);
    applyTabViewResult_(viewResult, sheetName, targetPage);

    // ประวัติการแก้ไขเป็นภาพรวมทุกไฟล์ โหลดตั้งแต่เปิดหน้าเว็บแล้ว
    // ตรงนี้แค่ดึงใหม่ให้เห็นรายการล่าสุดหลังเพิ่ม/แก้ไข/ลบข้อมูล (ไม่ต้อง await)
    loadDailyReport();

    // ดักโหลดหน้าถัดไป/ก่อนหน้าไว้เงียบๆ กดเปลี่ยนหน้าแล้วจะขึ้นทันที
    prefetchNeighbourPages_(sheetName, keyword, status, targetPage, viewResult.total || 0);
  } catch (err) {
    if (requestId !== loadRequestSeq) return;
    markPagerActive_(currentPage); // ไปหน้านั้นไม่สำเร็จ ไฮไลต์ต้องกลับมาที่หน้าที่ยังแสดงอยู่จริง
    // ถ้ามีของเก่าขึ้นจออยู่แล้ว อย่าล้างทิ้ง แค่บอกว่าอัปเดตไม่สำเร็จ ดีกว่าหน้าจอว่างเปล่า
    if (!servedFromCache) showHint('เกิดข้อผิดพลาด: ' + err.message, true);
  } finally {
    if (requestId === loadRequestSeq) setLoading(false);
  }
}

/**
 * เอาผลลัพธ์ที่ได้ (จากเซิร์ฟเวอร์หรือจากแคช) ขึ้นแสดงบนตาราง
 * @return {boolean} true ถ้าแสดงผลได้จริง
 */
function applyTabViewResult_(viewResult, sheetName, targetPage) {
  // ได้หัวตารางมาด้วย = คำขอนี้เป็นหน้าแรก (เปลี่ยนแท็บ / ค้นหา / กรองใหม่) จึงตั้งค่าโครงตารางใหม่
  const gotHeaders = !!(viewResult.headers && viewResult.headers.length);

  // หน้าถัดๆ ไปเซิร์ฟเวอร์ไม่ส่งหัวตารางมา ต้องใช้ของเดิมที่เก็บไว้
  // ถ้าบังเอิญไม่มีของเดิม (เช่น เอาหน้า 3 จากแคชมาแสดงตอนเพิ่งเปิดเว็บ) ก็ใช้ไม่ได้ ต้องรอของจริง
  if (!gotHeaders && (!currentTableHeaders.length || sheetName !== statusOptionsSheet)) return false;

  if (gotHeaders) {
    currentTableHeaders = viewResult.headers;
    statusColIndex = viewResult.statusIndex;
    currentHeadersMeta = viewResult.headersMeta || [];
    fetchedLinkRows_.clear();
  }

  currentRows = fillRowSource_(viewResult.results, sheetName);
  filteredRows = currentRows;
  serverTotal = viewResult.total || 0;
  currentPage = targetPage;
  lastTruncated = !!viewResult.truncated;
  // แท็บนี้ใหญ่เกินกว่าจะส่งลิงก์ Ticket มาพร้อมกัน จะขอทีหลังเฉพาะแถวที่แสดงอยู่
  linksDeferred = !!viewResult.linksDeferred;

  // กันเหนียว: ถ้าหัวตารางที่ได้มาสั้นกว่าข้อมูลจริงของบางแถว (ไม่ว่าจะด้วยสาเหตุใด)
  // ให้ขยายหัวตารางเพิ่มโดยอัตโนมัติ เพื่อไม่ให้มีคอลัมน์ไหนถูกตัดทิ้งไปเงียบๆ อีก
  const maxCells = currentRows.reduce((max, r) => Math.max(max, r.cells.length), currentTableHeaders.length);
  while (currentTableHeaders.length < maxCells) {
    currentTableHeaders.push(`คอลัมน์ ${currentTableHeaders.length + 1}`);
  }

  if (gotHeaders) {
    // ซ่อนคอลัมน์ที่ไม่มีชื่อหัวตารางจริงในชีต (ไม่มีอยู่จริง) ออกจากตารางที่แสดงบนหน้าเว็บไซต์
    // ตารางรายการแสดงแค่คอลัมน์ที่เซิร์ฟเวอร์ส่งมา (วันที่ / EXE ID / Ticket)
    // คอลัมน์ที่เหลือดูได้จากปุ่ม "ดูข้อมูล" ของแต่ละแถว
    visibleColumnIndices = (viewResult.listColumns && viewResult.listColumns.length)
      ? viewResult.listColumns.filter(i => (currentTableHeaders[i] || '').trim() !== '')
      : currentTableHeaders.map((h, i) => i).filter(i => currentTableHeaders[i].trim() !== '');
    setupStatusFilter();
  }

  renderCurrentPage();
  return true;
}

/* ===== ดักโหลดล่วงหน้า =====
 * คนมักกดหน้าถัดไป หรือสลับไปมาระหว่างแท็บเดิมๆ โหลดรอไว้ก่อนตั้งแต่ยังไม่กด
 * พอกดจริงข้อมูลอยู่ในแคชแล้ว จึงขึ้นทันทีโดยไม่ต้องรอ
 *
 * คำขอพวกนี้ห้ามไปยุ่งกับหน้าจอ และห้ามแตะ loadRequestSeq เด็ดขาด
 */
let prefetchInFlight_ = 0;
const PREFETCH_MAX_PARALLEL = 2; // ยิงพร้อมกันมากไปจะไปแย่งคิวกับคำขอที่ผู้ใช้กำลังรออยู่

async function prefetchTabPage_(sheetName, keyword, status, page) {
  if (!sheetName || page < 1) return;
  if (prefetchInFlight_ >= PREFETCH_MAX_PARALLEL) return;
  const key = tabCacheKey_(currentBook, sheetName, keyword, status, pageSize, page);
  if (tabPageCache_.has(key)) return;

  prefetchInFlight_++;
  const book = currentBook;
  try {
    const result = await jsonpRequest(apiUrl({
      action: 'tabView', book: book, sheet: sheetName, q: keyword,
      offset: (page - 1) * pageSize, limit: pageSize, slim: 1, status: status
    }), BIG_TAB_TIMEOUT_MS);
    // ผู้ใช้สลับไฟล์ไปแล้วระหว่างรอ ของที่ได้มาใช้ไม่ได้
    if (result && result.ok && book === currentBook) tabCacheSet_(key, result);
  } catch (e) {
    // ดักโหลดไม่สำเร็จไม่ใช่เรื่องใหญ่ ตอนกดจริงจะโหลดใหม่เองตามปกติ
  } finally {
    prefetchInFlight_--;
  }
}

function prefetchNeighbourPages_(sheetName, keyword, status, page, total) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  // หน่วงไว้นิดหนึ่ง ให้หน้าที่ผู้ใช้กำลังดูวาดเสร็จและโหลดลิงก์ Ticket ของหน้านั้นก่อน
  setTimeout(() => {
    if (sheetName !== selectedSheet) return; // ผู้ใช้เปลี่ยนแท็บไปแล้ว ไม่ต้องดักโหลดของเก่า
    if (page < totalPages) prefetchTabPage_(sheetName, keyword, status, page + 1);
    if (page > 1) prefetchTabPage_(sheetName, keyword, status, page - 1);
  }, 400);
}

// ค่าสถานะที่เคยเจอในข้อมูลของแท็บนี้ (สะสมข้ามหน้า) — ล้างเมื่อเปลี่ยนแท็บ
let discoveredStatusValues = new Set();
let statusOptionsSheet = '';

/**
 * ดักโหลดหน้าแรกของ "ทุกแท็บในไฟล์" ไว้เงียบๆ หลังเปิดไฟล์
 *
 * เป้าหมาย: กดแท็บไหนก็ขึ้นทันที ไม่ใช่แค่แท็บที่เผลอเอาเมาส์ไปวางไว้ก่อน
 * เพราะหลายคนกดตรงไปที่แท็บเลยโดยไม่ได้ลากเมาส์ผ่าน การดักโหลดตอน hover จึงไม่ทัน
 *
 * ทำเฉพาะตอนใช้ Supabase เท่านั้น
 * ถ้ายังใช้ Apps Script อยู่ การยิง 26 คำขอรวดเดียวจะไปแย่งคิวกับคำขอที่ผู้ใช้กำลังรอ
 * แล้วกลายเป็นช้าลงกว่าเดิม (Apps Script รับงานพร้อมกันได้จำกัดมาก)
 *
 * ยิงทีละคำขอเรียงกัน ไม่ยิงพร้อมกันทั้งหมด เพื่อให้คำขอที่ผู้ใช้กดจริงได้คิวก่อนเสมอ
 */
async function prefetchAllTabsInBook_(sheets, skipSheet) {
  if (typeof supaReady !== 'function' || !supaReady()) return;
  const book = currentBook;
  for (const s of sheets) {
    if (book !== currentBook) return;  // ผู้ใช้สลับไฟล์ไปแล้ว หยุดทันที
    if (s.name === skipSheet) continue;
    const key = tabCacheKey_(book, s.name, '', '', pageSize, 1);
    if (tabPageCache_.has(key)) continue;
    await prefetchTabPage_(s.name, '', '', 1);
    // เว้นจังหวะให้คำขอที่ผู้ใช้กดจริงแทรกเข้ามาได้ ไม่ให้การดักโหลดกินช่องทางทั้งหมด
    await new Promise(r => setTimeout(r, 120));
  }
}

/** ดักโหลดหน้าแรกของแท็บที่เอาเมาส์ไปวาง (ยังไม่ได้กด) */
function prefetchTabOnHover_(sheetName) {
  if (!sheetName || sheetName === selectedSheet) return;
  prefetchTabPage_(sheetName, '', '', 1);
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

  // สะสมค่าที่เจอจริงในข้อมูลไว้ข้ามหน้า เพราะตอนนี้ในเครื่องมีแค่แถวของหน้าที่ดูอยู่
  // ถ้าสร้างรายการจากหน้าปัจจุบันอย่างเดียว พอกรองสถานะหนึ่งแล้ว ตัวเลือกอื่นจะหายไปหมด
  currentRows.forEach(row => {
    const v = (row.cells[statusColIndex] || '').toString().trim();
    if (v) discoveredStatusValues.add(v);
  });
  Array.from(discoveredStatusValues).sort((a, b) => a.localeCompare(b, 'th')).forEach(v => {
    if (!seen.has(v)) { seen.add(v); ordered.push(v); }
  });

  if (ordered.length === 0) {
    statusFilter.hidden = true;
    statusFilter.innerHTML = '';
    return;
  }
  // จำค่าที่ผู้ใช้เลือกไว้ แล้วใส่กลับหลังสร้างตัวเลือกใหม่
  // ไม่งั้นทุกครั้งที่กรองหรือค้นหาใหม่ ช่องนี้จะเด้งกลับเป็น "ทุกสถานะ" เอง
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
function applyStatusFilterAndRender() {
  goToPage_(1); // กรองใหม่ต้องกลับไปหน้า 1 และให้เซิร์ฟเวอร์กรองให้ (ในเครื่องมีแค่แถวของหน้านี้)
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
      action: 'deleteRow', book: currentBook, sheet: row.sheet, row: row.row, fp: rowFp_(row)
    }));
    if (!result.ok) throw new Error(result.error || 'ลบไม่สำเร็จ');

    // ต้องโหลดข้อมูลใหม่ทั้งหมด ห้ามแค่ลบแถวนั้นออกจากตารางในหน่วยความจำ
    // เพราะการลบแถวในชีททำให้แถวที่อยู่ข้างล่างเลื่อนขึ้นมาทั้งหมด เลขแถวที่ค้างอยู่บนหน้าจอจะผิดทันที
    // (ถ้าไม่โหลดใหม่ การกดลบ/แก้ไขครั้งถัดไปจะไปโดนข้อมูลของเคสอื่น)
    if (selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
    showToast_('ลบข้อมูลแล้ว ✓ (กู้คืนได้ที่ถังขยะ)', 'success');
  } catch (err) {
    if (isRowChangedError_(err)) {
      handleRowChangedError_(row);
      alert('ยังไม่ได้ลบ — แถวนี้ในชีทเพิ่งถูกแก้ไขหรือเลื่อนตำแหน่ง ระบบโหลดข้อมูลล่าสุดให้แล้ว กรุณาตรวจแล้วลองอีกครั้ง');
      if (selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
    } else {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
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
async function openEditModal(row, prefill) {
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
    if (prefill) {
      // เติมค่าที่ผู้ใช้กรอกไว้รอบก่อนกลับเข้าไป (กรณีบันทึกไม่สำเร็จ) จะได้ไม่ต้องพิมพ์ใหม่
      editFields.querySelectorAll('input, select').forEach(el => {
        const v = prefill[el.dataset.header];
        if (v === undefined) return;
        el.value = el.type === 'date' ? toDateInputValue_(v) : v;
      });
    }
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
  const headersAtOpen = editingRowHeaders;
  const data = {};
  editFields.querySelectorAll('input, select').forEach(el => {
    data[el.dataset.header] = el.type === 'date' ? fromDateInputValue_(el.value) : el.value;
  });
  const colorChanged = !!(editColorToggle && editColorToggle.checked);
  const bg = colorChanged ? chosenColor_(editColorBg) : '';
  const font = colorChanged ? chosenColor_(editColorFont) : '';

  // หน้าต่างยังเปิดอยู่ระหว่างบันทึก แล้วค่อยปิดเมื่อบันทึกเสร็จจริง ผู้ใช้จะรู้ชัดว่าเสร็จแล้ว
  editSubmit.disabled = true;
  setEditStatus('กำลังบันทึก...', null);

  try {
    const result = await jsonpRequest(apiUrl({
      action: 'updateRow', book: currentBook, sheet: row.sheet, row: row.row,
      data: JSON.stringify(data), fp: rowFp_(row)
    }));
    if (!result.ok) throw new Error(result.error || 'บันทึกไม่สำเร็จ');

    let statusMessage = '✓ แก้ไขข้อมูลสำเร็จเรียบร้อยแล้ว';
    let colorFailed = false;
    if (colorChanged) {
      setEditStatus('กำลังปรับสีแถว...', null);
      const colored = await applyRowColor_(row.sheet, row.row, bg, font);
      colorFailed = !colored;
      statusMessage += colored ? ' (ปรับสีแถวแล้ว)' : ' (แต่ปรับสีแถวไม่สำเร็จ)';
    }

    // บันทึกเสร็จแล้ว: อัปเดตแถวบนหน้าจอ ปิดหน้าต่าง แล้วแจ้งผล
    const appliedLocally = !colorChanged && applyRowEditLocally_(row, data, headersAtOpen);
    invalidateFullRow_(row);
    closeEditModal();
    showToast_(statusMessage, colorFailed ? 'error' : 'success');
    // สีมาจากข้อมูลฝั่งชีท ต้องโหลดใหม่ถึงจะเห็น
    if (!appliedLocally && selectedSheet) await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
  } catch (err) {
    if (isRowChangedError_(err)) {
      // ข้อมูลในชีทเพิ่งเปลี่ยน: โหลดค่าล่าสุดมาแสดงในหน้าต่างเดิมให้ตรวจก่อน
      handleRowChangedError_(row);
      await openEditModal(row, null);
      setEditStatus('ยังไม่ได้บันทึก — แถวนี้ในชีทเพิ่งถูกแก้ไข ค่าที่แสดงคือค่าล่าสุดในชีท กรุณาตรวจแล้วแก้ไขอีกครั้ง', 'error');
    } else {
      // ไม่สำเร็จ: หน้าต่างยังเปิดอยู่พร้อมค่าที่กรอกไว้ กดบันทึกซ้ำได้เลย
      setEditStatus('บันทึกไม่สำเร็จ: ' + err.message + ' — ค่าที่กรอกไว้ยังอยู่ กดบันทึกเพื่อลองใหม่', 'error');
    }
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
  addToggle.textContent = '+ เพิ่มข้อมูลใหม่ลงชีท';
  manageToggle.setAttribute('aria-pressed', 'false');
  manageToggle.textContent = 'จัดการข้อมูลชีทนี้';
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
  manageToggle.textContent = 'จัดการข้อมูลชีทนี้';
  trashToggle.setAttribute('aria-pressed', 'false');
  trashToggle.textContent = '🗑 ถังขยะ';
  addToggle.setAttribute('aria-pressed', String(!isOpen));
  addToggle.textContent = '+ เพิ่มข้อมูลใหม่ลงชีท'; // ข้อความปุ่มคงที่เสมอ ปิดฟอร์มด้วยปุ่มในฟอร์มแทน
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
  if (isExeIdHeader_(header.name)) restrictToEnglish_(inputEl);
  return inputEl;
}

/**
 * ช่อง EXE ID พิมพ์ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และสัญลักษณ์บนแป้นพิมพ์อังกฤษเท่านั้น
 *
 * EXE ID เป็นรหัสบัญชีในระบบเกม ถ้าเผลอพิมพ์ตอนแป้นยังเป็นภาษาไทย (เช่น "flukeksnc" กลายเป็น "ดสีา...")
 * จะได้ค่าที่ค้นหาในระบบเกมไม่เจอ และค้นในเว็บนี้ก็ไม่เจอด้วย
 *
 * ตัดทิ้งตอนพิมพ์และตอนวาง (ใช้เหตุการณ์ input ซึ่งครอบคลุมทั้งสองแบบ)
 * แล้วขึ้นข้อความเตือนสั้นๆ ใต้ช่อง ให้รู้ว่าแป้นพิมพ์ยังเป็นภาษาอื่นอยู่ ไม่ใช่ช่องเสีย
 */
function restrictToEnglish_(inputEl) {
  inputEl.setAttribute('lang', 'en');
  inputEl.setAttribute('autocomplete', 'off');
  inputEl.setAttribute('autocapitalize', 'off');
  inputEl.setAttribute('spellcheck', 'false');
  inputEl.setAttribute('inputmode', 'latin');

  let warn = null;
  let warnTimer = null;
  inputEl.addEventListener('input', () => {
    const before = inputEl.value;
    const after = before.replace(/[^\x20-\x7E]/g, ''); // อนุญาตเฉพาะตัวอักษรที่พิมพ์ได้บนแป้นภาษาอังกฤษ
    if (after === before) return;

    // ตัดออกแล้วให้เคอร์เซอร์อยู่ตำแหน่งเดิม ไม่เด้งไปท้ายข้อความ
    const caret = inputEl.selectionStart || after.length;
    const removedBeforeCaret = before.slice(0, caret).length - before.slice(0, caret).replace(/[^\x20-\x7E]/g, '').length;
    inputEl.value = after;
    const pos = Math.max(0, caret - removedBeforeCaret);
    try { inputEl.setSelectionRange(pos, pos); } catch (e) { /* บางชนิดช่องไม่รองรับ ไม่เป็นไร */ }

    if (!warn) {
      warn = document.createElement('p');
      warn.className = 'field-warn';
      inputEl.insertAdjacentElement('afterend', warn);
    }
    warn.textContent = 'EXE ID พิมพ์ได้เฉพาะภาษาอังกฤษ — กรุณาเปลี่ยนแป้นพิมพ์เป็นภาษาอังกฤษ';
    warn.hidden = false;
    clearTimeout(warnTimer);
    warnTimer = setTimeout(() => { if (warn) warn.hidden = true; }, 3000);
  });
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
  const sheetName = selectedSheet;
  const book = currentBook;
  const data = {};
  addFields.querySelectorAll('input, select').forEach(el => {
    data[el.dataset.header] = el.type === 'date' ? fromDateInputValue_(el.value) : el.value;
  });
  const wantColor = !!(addColorToggle && addColorToggle.checked);
  const bg = wantColor ? chosenColor_(addColorBg) : '';
  const font = wantColor ? chosenColor_(addColorFont) : '';

  // ฟอร์มยังเปิดอยู่ระหว่างบันทึก แล้วค่อยปิดเมื่อบันทึกเสร็จจริง ผู้ใช้จะรู้ชัดว่าเสร็จแล้ว
  // (ปิดทันทีตั้งแต่กดทำให้ไม่แน่ใจว่าบันทึกไปหรือยัง)
  addSubmitButton.disabled = true;
  setAddStatus('กำลังบันทึก...', null);

  try {
    const result = await jsonpRequest(apiUrl({ action: 'add', book: book, sheet: sheetName, data: JSON.stringify(data) }));
    if (!result.ok) throw new Error(result.error || 'บันทึกไม่สำเร็จ');

    let statusMessage = `✓ บันทึกข้อมูลสำเร็จเรียบร้อยแล้ว (แถวที่ ${result.row})`;
    let colorFailed = false;
    if (wantColor && result.row) {
      setAddStatus('กำลังปรับสีแถว...', null);
      const colored = await applyRowColor_(sheetName, result.row, bg, font);
      colorFailed = !colored;
      statusMessage += colored ? ' ปรับสีแถวแล้ว' : ' แต่ปรับสีแถวไม่สำเร็จ';
    }

    // บันทึกเสร็จแล้ว: ล้างฟอร์ม ปิดหน้าต่าง แล้วแจ้งผล
    addFields.querySelectorAll('input, select').forEach(el => { el.value = ''; });
    if (wantColor) resetColorPicker_(addColorToggle, addColorPickers, addColorBg, addColorFont);
    setAddStatus('', null);
    addPanel.hidden = true;
    addToggle.setAttribute('aria-pressed', 'false');
    showToast_(statusMessage, colorFailed ? 'error' : 'success');

    if (book === currentBook && sheetName === selectedSheet) {
      await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
    }
  } catch (err) {
    // ไม่สำเร็จ: ฟอร์มยังเปิดอยู่พร้อมค่าที่กรอกไว้ กดบันทึกซ้ำได้เลย
    setAddStatus('บันทึกไม่สำเร็จ: ' + err.message + ' — ค่าที่กรอกไว้ยังอยู่ กดบันทึกเพื่อลองใหม่', 'error');
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
  addToggle.textContent = '+ เพิ่มข้อมูลใหม่ลงชีท';
  trashToggle.setAttribute('aria-pressed', 'false');
  trashToggle.textContent = '🗑 ถังขยะ';
  manageToggle.setAttribute('aria-pressed', String(!isOpen));
  manageToggle.textContent = 'จัดการข้อมูลชีทนี้';
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
    await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
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
  addToggle.textContent = '+ เพิ่มข้อมูลใหม่ลงชีท';
  manageToggle.setAttribute('aria-pressed', 'false');
  manageToggle.textContent = 'จัดการข้อมูลชีทนี้';
  trashToggle.setAttribute('aria-pressed', String(!isOpen));
  trashToggle.textContent = '🗑 ถังขยะ';
  if (!isOpen) loadTrash();
});

/* ===== ประวัติการแก้ไข (แสดงถาวรบนสุดของแถบด้านข้าง ไม่มีปุ่มเปิด/ปิดแล้ว) ===== */

/**
 * ประวัติการแก้ไขวันนี้ของ "ทุกไฟล์ทุกแท็บ"
 *
 * อ่านจาก Log กลางอย่างเดียว ไม่ผูกกับแท็บที่เปิดอยู่ จึงโหลดได้ตั้งแต่เปิดหน้าเว็บ
 * ก่อนหน้านี้ต้องเลือกแท็บก่อนถึงจะเห็น และถ้าวันนั้นไปแก้งานอยู่แท็บอื่น ช่องนี้จะว่างเปล่า
 */
async function loadDailyReport() {
  setReportStatus('กำลังโหลด...', null);
  try {
    const result = await jsonpRequest(apiUrl({ action: 'activityToday' }));
    if (!result.ok) throw new Error(result.error || 'โหลดประวัติการแก้ไขไม่สำเร็จ');
    reportPanelDate.textContent = formatDateDisplay(result.date);
    renderReportStats(result);
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
    { label: 'ไฟล์ที่มีการแก้ไข', value: result.booksTouched },
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

/**
 * เหตุการณ์วันนี้แสดง "ทุกไฟล์ทุกแท็บ" ไม่ใช่เฉพาะแท็บที่เปิดอยู่
 * เพราะถ้ากรองแค่แท็บเดียว วันที่ไปแก้งานอยู่แท็บอื่น ช่องนี้จะว่างเหมือนไม่มีใครทำอะไรเลย
 * (ตัวเลขสรุปด้านบนยังเป็นของแท็บที่เปิดอยู่เหมือนเดิม)
 */
// การเข้า/ออกจากระบบไม่ใช่การแก้ไขข้อมูล ไม่ต้องแสดงในประวัติการแก้ไข
// (ยังดูได้ครบในหน้าตรวจสอบการใช้งาน และตาราง login_history ใน Supabase)
const NON_EDIT_ACTIONS = ['เข้าสู่ระบบ', 'ออกจากระบบ'];

function renderReportLogList(result) {
  const events = (result.recentAll || result.recentToday || [])
    .filter(item => NON_EDIT_ACTIONS.indexOf((item.action || '').trim()) === -1);
  if (events.length === 0) {
    reportLogList.innerHTML = '<p class="report-panel__status">วันนี้ยังไม่มีการเพิ่ม/แก้ไข/ลบข้อมูลในไฟล์ใดเลย</p>';
    return;
  }
  reportLogList.innerHTML = events.map(item => {
    const where = [item.book, item.sheet].filter(Boolean).join(' · ');
    return `
    <div class="report-log-row">
      <b>${escapeHtml(item.time)}</b> · <span class="report-log-row__action${item.action === 'ออกจากระบบ' ? ' report-log-row__action--logout' : ''}">${escapeHtml(item.action)}</span> · ${escapeHtml(item.editor)}
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
  // โหลดถังขยะรอไว้เงียบๆ หลังหน้าเว็บพร้อมแล้ว กดเปิดเมื่อไหร่ก็เห็นรายการทันที
  setTimeout(() => {
    if (!currentSessionToken || Date.now() - trashPrefetchedAt_ < 30000) return;
    trashPrefetchedAt_ = Date.now();
    loadBookTrash();
  }, 6000);
  if (globalDashboardTimer) clearInterval(globalDashboardTimer);
  globalDashboardTimer = setInterval(loadGlobalDashboard, GLOBAL_DASHBOARD_REFRESH_MS);
}

async function loadGlobalDashboard() {
  if (globalDashboardLoading) return; // รอบก่อนยังโหลดไม่เสร็จ ข้ามรอบนี้ไป ไม่ยิงซ้อน
  globalDashboardLoading = true;
  setDashboardStatus(globalDashboardLoadedOnce ? 'กำลังอัปเดต...' : 'กำลังโหลด...', null);

  // ยอดสถานะทั้งระบบ (การ์ดตรวจสอบสถานะ) อ่านจาก Supabase ได้ทันที ไม่ต้องรอ Apps Script ไล่นับทุกชีท
  let statusFromSupabase = false;
  const supaPart = (typeof supaReady === 'function' && supaReady() && typeof supaStatusBreakdown === 'function')
    ? supaStatusBreakdown().then(r => { renderDashboardStatusList(r); statusFromSupabase = true; })
        .catch(err => console.warn('[Supabase] นับสถานะไม่สำเร็จ ใช้ Apps Script แทน:', err.message))
    : Promise.resolve();

  try {
    // ยิงคู่ขนานกับ Supabase — ถ้า Supabase พร้อม ขอ Apps Script แค่ "เคสวันนี้" (lite) ไม่ต้องไล่นับทุกชีทซ้ำ
    const useLite = typeof supaReady === 'function' && supaReady();
    const params = { action: 'globalDashboard' };
    if (useLite) params.lite = '1';
    let result = await jsonpRequest(apiUrl(params), GLOBAL_DASHBOARD_TIMEOUT_MS);
    if (!result.ok) throw new Error(result.error || 'โหลดจำนวนงานวันนี้ไม่สำเร็จ');
    dashboardDate.textContent = formatDateDisplay(result.date);
    dashboardCasesToday.textContent = result.casesToday;
    renderDashboardTodayStatus_(result);
    await supaPart;
    if (!statusFromSupabase) {
      // Supabase ใช้ไม่ได้ และรอบนี้ขอแบบ lite ไป ต้องขอยอดเต็มจาก Apps Script อีกรอบ
      if (useLite) result = await jsonpRequest(apiUrl({ action: 'globalDashboard' }), GLOBAL_DASHBOARD_TIMEOUT_MS);
      if (result.ok) renderDashboardStatusList(result);
    }
    globalDashboardLoadedOnce = true;
    setDashboardStatus('', null);
  } catch (err) {
    // ตัวเลขรอบก่อนยังคาหน้าจออยู่ ไม่ล้างทิ้ง เพราะดีกว่าเห็นว่างเปล่า
    setDashboardStatus('อัปเดตไม่สำเร็จ: ' + err.message, 'error');
  } finally {
    globalDashboardLoading = false;
  }
}

/**
 * จำนวนงานวันนี้ — เคสเข้ากี่เคส แยกตามสถานะ (แสดงทุกสถานะที่มีในระบบ รวมสถานะที่เป็น 0)
 * รอตรวจสอบ / แก้ไขแล้ว ขึ้นก่อนเสมอ คลิกสถานะ = กรองรายการเคสด้านล่าง คลิกซ้ำ = แสดงทั้งหมด
 */
const NO_STATUS_LABEL_TODAY = 'ตรวจสอบสถานะ';

function todayStatusRank_(name) {
  if (/รอตรวจสอบ/.test(name)) return 0;
  if (/แก้ไขแล้ว/.test(name)) return 1;
  if (name === NO_STATUS_LABEL_TODAY) return 3;
  return 2;
}

function renderDashboardTodayStatus_(result) {
  const box = document.getElementById('dashboardTodayStatus');
  if (!box) return;
  const cases = result.newCasesToday || [];
  if (!cases.length) {
    box.innerHTML = '<p class="sidebar-dashboard__empty">วันนี้ยังไม่มีเคสเข้า</p>';
    return;
  }
  const dateText = formatDateDisplay(result.date);
  // รายการเคสวันนี้ (ใหม่สุดก่อน) แต่ละเคสแสดงสถานะปัจจุบันของเคสนั้นไว้ด้านขวา
  box.innerHTML = cases.map(c => {
    const st = (c.status || '').trim();
    const noStatus = !st || st === NO_STATUS_LABEL_TODAY;
    return `
    <div class="today-work__case${c.row ? ' sidebar-dashboard__case--clickable' : ''}"
         ${c.row ? `data-case-book="${escapeHtml(c.book)}" data-case-sheet="${escapeHtml(c.sheet)}" data-case-row="${c.row}" title="คลิกเพื่อดูรายละเอียดเคสนี้"` : ''}>
      <div class="today-work__info">
        <div class="today-work__when">${escapeHtml(dateText)} · ${escapeHtml(c.time)} น.</div>
        <div class="today-work__where">${escapeHtml(c.book)} · ${escapeHtml(c.sheet)}${c.row ? ` · แถวที่ ${c.row}` : ''}</div>
      </div>
      <span class="today-work__status${noStatus ? ' today-work__status--none' : ''}">${noStatus ? 'ยังไม่ใส่สถานะ' : escapeHtml(st)}</span>
    </div>`;
  }).join('') + (result.newCasesTruncated ? `<p class="sidebar-dashboard__empty">แสดงล่าสุด ${cases.length} เคส</p>` : '');
  bindCaseDetailClicks_(box);
}

// รายการเคสแยกถูกรวมเข้าไปในการ์ดจำนวนงานวันนี้แล้ว
function renderDashboardNewCasesList() {}

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
    if (selectedSheet === item.sheetName) await loadSingleTabView(selectedSheet, lastKeyword, currentPage);
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
    const copy = (value && isExeIdHeader_(f.name))
      ? ` <button type="button" class="copy-btn" data-copy="${escapeAttr_(value)}" title="คัดลอก" aria-label="คัดลอก ${escapeAttr_(f.name)}">⧉</button>`
      : '';
    return `<tr><th scope="row">${escapeHtml(f.name)}</th><td>${cell}${copy}</td></tr>`;
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

  // 1) ข้อมูลเคสจาก Supabase แสดงทันที (เสี้ยววินาที)
  // ไฟล์ที่เพิ่งแก้แล้วส่งเข้า Supabase ไม่สำเร็จ ข้ามขั้นนี้ไปใช้ข้อมูลจากชีทอย่างเดียว กันเห็นค่าเก่า
  let shownFast = false;
  if (typeof supaCaseFields === 'function' && typeof supaReady === 'function' && supaReady() &&
      !bookRecentlyEdited_(target.book)) {
    try {
      const fields = await supaCaseFields(target.book, target.sheet, target.row);
      if (caseModalTarget !== target) return; // ผู้ใช้ปิดหรือเปิดเคสอื่นไปแล้ว
      renderCaseModal({ rowExists: true, fields, timeline: null });
      setCaseModalStatus('', null);
      shownFast = true;
    } catch (e) {
      // หาไม่เจอใน Supabase (เคสเพิ่งเพิ่ม) ก็รอข้อมูลจากชีทตามเดิม
    }
  }

  // 2) ประวัติการทำงานอยู่ใน Log จึงยังต้องถาม Apps Script — โหลดตามหลังโดยไม่บังข้อมูลที่เห็นอยู่
  //    ข้อมูลเคสจากชีทเป็นของจริงล่าสุดเสมอ ได้มาแล้วจึงวาดทับอีกรอบ
  try {
    const result = await jsonpRequest(apiUrl({
      action: 'caseDetail', book: target.book, sheet: target.sheet, row: target.row
    }));
    if (caseModalTarget !== target) return;
    if (!result.ok) throw new Error(result.error || 'โหลดรายละเอียดไม่สำเร็จ');
    renderCaseModal(result);
    setCaseModalStatus('', null);
  } catch (err) {
    if (caseModalTarget !== target) return;
    if (shownFast) {
      caseModalTimeline.innerHTML = '<p class="case-modal__empty">โหลดประวัติไม่สำเร็จ: ' + escapeHtml(err.message) + '</p>';
    } else {
      setCaseModalStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    }
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
    wireCopyButtons_(caseModalFields);
  }

  // ประวัติการทำงาน (ใหม่สุดขึ้นก่อน) — null = ยังโหลดไม่เสร็จ (ข้อมูลเคสขึ้นก่อนจาก Supabase)
  if (result.timeline === null) {
    caseModalTimeline.innerHTML = '<p class="case-modal__empty">กำลังโหลดประวัติ...</p>';
    caseModalBody.hidden = false;
    return;
  }
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
