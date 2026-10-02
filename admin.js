/* ===== หน้าตรวจสอบการใช้งาน (สำหรับผู้ดูแลระบบ) =====
 *
 * แสดงว่า "ใครทำอะไร ที่ไฟล์ไหน แท็บไหน เมื่อไหร่" จากชีท Log กลาง ซึ่งเก็บถาวร
 * กรองได้ตามช่วงวันที่ / อีเมล / ประเภทการกระทำ / ไฟล์ / คำค้นในรายละเอียด
 *
 * สำคัญ: การซ่อนหน้านี้จากคนทั่วไปเป็นเรื่องของความสะดวก ไม่ใช่ความปลอดภัย
 * ความปลอดภัยจริงอยู่ที่ฝั่งเซิร์ฟเวอร์ (requireAdmin_ ใน Code.gs) ซึ่งจะปฏิเสธคำสั่ง
 * ของคนที่ไม่ได้อยู่ใน ADMIN_EMAILS เสมอ ต่อให้เรียก URL ของ API ตรงๆ ก็ตาม
 */

const JSONP_TIMEOUT_MS = 90000; // ช่วงวันที่กว้างๆ ต้องอ่าน Log หลายแท็บ จึงเผื่อเวลาไว้มาก
// การตรวจสอบและแยกแท็บต้องอ่าน/เขียนข้อมูลหลักพันแถว อาจใช้เวลาหลายนาที
const SLOW_SCAN_TIMEOUT_MS = 300000;
let jsonpCounter = 0;

const adminWho = document.getElementById('adminWho');
const deniedBox = document.getElementById('deniedBox');
const deniedText = document.getElementById('deniedText');
const adminContent = document.getElementById('adminContent');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const emailFilter = document.getElementById('emailFilter');
const actionFilter = document.getElementById('actionFilter');
const bookFilter = document.getElementById('bookFilter');
const keywordFilter = document.getElementById('keywordFilter');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const moreBtn = document.getElementById('moreBtn');
const pageStatusEl = document.getElementById('pageStatus');
const summarySection = document.getElementById('summarySection');
const summaryList = document.getElementById('summaryList');
const logSection = document.getElementById('logSection');
const logTitle = document.getElementById('logTitle');
const logBody = document.getElementById('logBody');

let loadedItems = [];   // สะสมไว้ใช้ตอนกดดาวน์โหลด Excel (รวมหน้าที่โหลดเพิ่มแล้วด้วย)
let nextOffset = 0;
let loadSeq = 0;        // กันผลลัพธ์ของการค้นหาครั้งก่อนที่ตอบกลับช้า มาเขียนทับครั้งใหม่

/* ===== เครื่องมือกลาง ===== */

function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `adminCallback_${Date.now()}_${jsonpCounter++}`;
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
      reject(new Error('เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด กรุณาลดช่วงวันที่ให้แคบลงแล้วลองใหม่'));
    }, JSONP_TIMEOUT_MS);
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function apiUrl(params) {
  const token = localStorage.getItem('sheetSearchToken') || '';
  const all = Object.assign({ token }, params);
  const parts = Object.entries(all)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  parts.push(`key=${encodeURIComponent(ACCESS_KEY)}`);
  return `${API_URL}?${parts.join('&')}`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setPageStatus(message, type) {
  pageStatusEl.textContent = message || '';
  pageStatusEl.className = 'status-page__status' + (type ? ` status-page__status--${type}` : '');
}

/** แปลง Date เป็น yyyy-mm-dd สำหรับใส่ในช่อง <input type="date"> */
function toInputDate(date) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/* ===== ตรวจสิทธิ์ก่อนเข้าหน้า ===== */

async function init() {
  const token = localStorage.getItem('sheetSearchToken');
  if (!token) {
    showDenied('ยังไม่ได้เข้าสู่ระบบ กรุณากลับไปเข้าสู่ระบบที่หน้าหลักก่อน');
    return;
  }

  try {
    const session = await jsonpRequest(apiUrl({ action: 'session' }));
    if (!session.ok) throw new Error(session.error || 'ตรวจสอบสิทธิ์ไม่สำเร็จ');
    if (!session.isAdmin) {
      showDenied(`บัญชี ${session.email} ไม่ใช่ผู้ดูแลระบบ จึงไม่สามารถดูประวัติการใช้งานของผู้อื่นได้`);
      return;
    }
    adminWho.textContent = `ผู้ดูแล: ${session.email}`;
    adminContent.hidden = false;
    applyPreset('today');
    runSearch();
    loadSplitBooks();
  } catch (err) {
    showDenied(err.message);
  }
}

function showDenied(message) {
  deniedText.textContent = message;
  deniedBox.hidden = false;
  adminContent.hidden = true;
}

/* ===== ค้นหาและแสดงผล ===== */

function currentFilters() {
  return {
    from: fromDate.value,
    to: toDate.value,
    email: emailFilter.value,
    actionType: actionFilter.value,
    book: bookFilter.value,
    keyword: keywordFilter.value.trim()
  };
}

async function runSearch(append) {
  const seq = ++loadSeq;
  if (!append) {
    nextOffset = 0;
    loadedItems = [];
  }

  setPageStatus(append ? 'กำลังโหลดเพิ่ม...' : 'กำลังค้นหา...', null);
  searchBtn.disabled = true;
  moreBtn.disabled = true;

  try {
    const params = Object.assign({ action: 'auditLog', offset: nextOffset }, currentFilters());
    const result = await jsonpRequest(apiUrl(params));
    if (seq !== loadSeq) return; // มีการค้นหาครั้งใหม่แซงไปแล้ว ทิ้งผลนี้
    if (!result.ok) throw new Error(result.error || 'โหลดประวัติไม่สำเร็จ');

    loadedItems = loadedItems.concat(result.items || []);
    nextOffset = (result.offset || 0) + (result.items || []).length;

    if (!append) {
      fillSelect(emailFilter, result.editors, 'ทุกคน');
      fillSelect(actionFilter, result.actions, 'ทุกประเภท');
      fillSelect(bookFilter, result.books, 'ทุกไฟล์');
      renderSummary(result.summary || []);
    }
    renderRows();

    logTitle.textContent = `ประวัติการใช้งาน (แสดง ${loadedItems.length} จาก ${result.total} รายการ)`;
    logSection.hidden = false;
    moreBtn.hidden = !result.hasMore;
    exportBtn.hidden = loadedItems.length === 0;
    setPageStatus(result.total === 0 ? 'ไม่พบประวัติที่ตรงกับเงื่อนไขที่เลือก' : '', result.total === 0 ? 'muted' : null);
  } catch (err) {
    if (seq !== loadSeq) return;
    setPageStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    searchBtn.disabled = false;
    moreBtn.disabled = false;
  }
}

/** เติมตัวเลือกในกล่องกรอง โดยคงค่าที่ผู้ใช้เลือกไว้เดิมถ้ายังมีอยู่ */
function fillSelect(select, values, allLabel) {
  const current = select.value;
  const list = values || [];
  select.innerHTML = `<option value="">${escapeHtml(allLabel)}</option>`
    + list.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
  if (current && list.indexOf(current) !== -1) select.value = current;
}

function renderSummary(summary) {
  if (!summary.length) {
    summarySection.hidden = true;
    return;
  }
  summaryList.innerHTML = summary.map(s => `
    <button type="button" class="admin-summary__item" data-editor="${escapeHtml(s.editor)}" title="คลิกเพื่อกรองเฉพาะคนนี้">
      <span class="admin-summary__who">${escapeHtml(s.editor)}</span>
      <span class="admin-summary__count">${s.count}</span>
    </button>`).join('');
  summarySection.hidden = false;

  summaryList.querySelectorAll('.admin-summary__item').forEach(btn => {
    btn.addEventListener('click', () => {
      const editor = btn.dataset.editor;
      // ตัวเลือกในกล่องกรองมีเฉพาะอีเมลที่พบจริง ถ้าไม่มีให้เพิ่มเข้าไปก่อน
      if (!Array.from(emailFilter.options).some(o => o.value === editor)) {
        emailFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(editor)}">${escapeHtml(editor)}</option>`);
      }
      emailFilter.value = editor;
      runSearch();
    });
  });
}

function renderRows() {
  if (!loadedItems.length) {
    logBody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">ไม่พบประวัติที่ตรงกับเงื่อนไข</td></tr>';
    return;
  }
  logBody.innerHTML = loadedItems.map(item => {
    const where = [item.book, item.sheet].filter(Boolean).join(' › ') || '—';
    return `<tr>
      <td class="admin-table__time">${escapeHtml(item.time)}</td>
      <td class="admin-table__who">${escapeHtml(item.editor)}</td>
      <td class="admin-table__act"><span class="admin-tag">${escapeHtml(item.action)}</span></td>
      <td class="admin-table__where">${escapeHtml(where)}</td>
      <td class="admin-table__detail">${formatDetail(item.detail)}</td>
    </tr>`;
  }).join('');
}

/**
 * ฝั่งเซิร์ฟเวอร์เก็บการเปลี่ยนแปลงแต่ละคอลัมน์คั่นด้วย " | " เพราะในชีทเก็บได้บรรทัดเดียวต่อ 1 เซลล์
 * พอมาแสดงบนหน้าเว็บจึงแยกกลับเป็นบรรทัดละคอลัมน์ ให้อ่านง่าย
 */
function formatDetail(detail) {
  const text = (detail || '').toString();
  const parts = text.split(' | ');
  if (parts.length <= 1) return escapeHtml(text);
  const head = parts.shift();
  return `<div>${escapeHtml(head)}</div>`
    + `<ul class="admin-changes">${parts.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
}

/* ===== ปุ่มช่วงวันที่สำเร็จรูป ===== */

function applyPreset(preset) {
  const now = new Date();
  let start = now;
  if (preset === 'week') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else if (preset === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  fromDate.value = toInputDate(start);
  toDate.value = toInputDate(now);
}

/* ===== ดาวน์โหลด Excel ===== */

function exportExcel() {
  if (!loadedItems.length) return;
  const rows = [['วันเวลา', 'ผู้ทำ', 'การกระทำ', 'ไฟล์', 'แท็บ', 'รายละเอียด']];
  loadedItems.forEach(item => {
    rows.push([item.time, item.editor, item.action, item.book, item.sheet, item.detail]);
  });
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [{ wch: 20 }, { wch: 28 }, { wch: 16 }, { wch: 22 }, { wch: 24 }, { wch: 90 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'ประวัติการใช้งาน');
  const stamp = `${fromDate.value || 'all'}_ถึง_${toDate.value || 'all'}`;
  XLSX.writeFile(workbook, `ประวัติการใช้งาน_${stamp}.xlsx`);
}

/* ===== ผูกปุ่ม ===== */

searchBtn.addEventListener('click', () => runSearch());
moreBtn.addEventListener('click', () => runSearch(true));
exportBtn.addEventListener('click', exportExcel);
keywordFilter.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
[emailFilter, actionFilter, bookFilter].forEach(el => el.addEventListener('change', () => runSearch()));

resetBtn.addEventListener('click', () => {
  emailFilter.value = '';
  actionFilter.value = '';
  bookFilter.value = '';
  keywordFilter.value = '';
  applyPreset('today');
  runSearch();
});

document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    applyPreset(btn.dataset.preset);
    runSearch();
  });
});

init();

/* ===== แยกแท็บตามปี =====
 *
 * แท็บที่มีข้อมูลหลายพันแถวโหลดช้า เพราะ Google Sheets ไม่มี index
 * การแยกตามปีทำให้แต่ละแท็บเล็กลง จึงโหลดเร็วขึ้นตามสัดส่วนที่ลดลง
 *
 * ขั้นตอนบังคับให้ตรวจก่อนเสมอ: กด "ตรวจสอบก่อน" เพื่อดูว่าแต่ละปีมีกี่แถว
 * แล้วค่อยกดแยกทีละปี — แท็บเดิมไม่ถูกแตะต้องเลย ผู้ดูแลตรวจแล้วค่อยลบเอง
 */

const splitBook = document.getElementById('splitBook');
const splitSheet = document.getElementById('splitSheet');
const splitPreviewBtn = document.getElementById('splitPreviewBtn');
const splitStatus = document.getElementById('splitStatus');
const splitResult = document.getElementById('splitResult');

function setSplitStatus(message, type) {
  splitStatus.textContent = message || '';
  splitStatus.className = 'status-page__status' + (type ? ` status-page__status--${type}` : '');
}

async function loadSplitBooks() {
  try {
    const result = await jsonpRequest(apiUrl({ action: 'books' }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายชื่อไฟล์ไม่สำเร็จ');
    splitBook.innerHTML = (result.books || [])
      .map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    await loadSplitSheets();
  } catch (err) {
    setSplitStatus('โหลดรายชื่อไฟล์ไม่สำเร็จ: ' + err.message, 'error');
  }
}

async function loadSplitSheets() {
  splitSheet.innerHTML = '<option value="">กำลังโหลด...</option>';
  splitResult.innerHTML = '';
  try {
    const result = await jsonpRequest(apiUrl({ action: 'sheets', book: splitBook.value }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายชื่อแท็บไม่สำเร็จ');
    const sheets = result.sheets || [];
    splitSheet.innerHTML = sheets.map(sh =>
      `<option value="${escapeHtml(sh.name)}">${escapeHtml(sh.name)} (${(sh.rowCount || 0).toLocaleString()} แถว)</option>`
    ).join('') || '<option value="">(ไม่มีแท็บ)</option>';
    setSplitStatus('', null);
  } catch (err) {
    splitSheet.innerHTML = '<option value="">(โหลดไม่สำเร็จ)</option>';
    setSplitStatus('โหลดรายชื่อแท็บไม่สำเร็จ: ' + err.message, 'error');
  }
}

async function runSplitPreview() {
  if (!splitSheet.value) { setSplitStatus('กรุณาเลือกแท็บก่อน', 'error'); return; }
  splitPreviewBtn.disabled = true;
  splitResult.innerHTML = '';
  setSplitStatus('กำลังตรวจสอบข้อมูล...', null);
  try {
    const result = await jsonpRequest(apiUrl({
      action: 'splitPreview', book: splitBook.value, sheet: splitSheet.value
    }), SLOW_SCAN_TIMEOUT_MS);
    if (!result.ok) throw new Error(result.error || 'ตรวจสอบไม่สำเร็จ');
    renderSplitPreview(result);
    setSplitStatus('', null);
  } catch (err) {
    setSplitStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  } finally {
    splitPreviewBtn.disabled = false;
  }
}

function renderSplitPreview(result) {
  const rows = (result.groups || []).map(g => `
    <tr>
      <td><b>${escapeHtml(g.year)}</b></td>
      <td>${g.count.toLocaleString()} แถว</td>
      <td>${escapeHtml(g.targetSheet)}</td>
      <td>${g.exists
        ? '<span class="split-done">มีแท็บนี้อยู่แล้ว</span>'
        : `<button type="button" class="toolbar__btn" data-split-year="${escapeHtml(g.year)}">แยกเป็นแท็บใหม่</button>`}</td>
    </tr>`).join('');

  splitResult.innerHTML = `
    <p class="split-box__meta">
      แท็บ <b>${escapeHtml(result.sheet)}</b> มีข้อมูล <b>${result.totalRows.toLocaleString()}</b> แถว
      · ใช้คอลัมน์ <b>${escapeHtml(result.dateColumn)}</b> ในการอ่านปี
    </p>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>ปี</th><th>จำนวน</th><th>แท็บใหม่ที่จะสร้าง</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  splitResult.querySelectorAll('[data-split-year]').forEach(btn => {
    btn.addEventListener('click', () => runSplitYear(btn.dataset.splitYear, btn));
  });
}

async function runSplitYear(year, btn) {
  const go = confirm(
    `สร้างแท็บใหม่สำหรับปี "${year}" จากแท็บ "${splitSheet.value}" ?\n\n` +
    `แท็บเดิมจะไม่ถูกแก้ไขหรือลบใดๆ ทั้งสิ้น\n` +
    `ถ้าข้อมูลเยอะ อาจใช้เวลาสักครู่ ห้ามปิดหน้าเว็บระหว่างนี้`
  );
  if (!go) return;

  btn.disabled = true;
  btn.textContent = 'กำลังแยก...';
  setSplitStatus(`กำลังสร้างแท็บของปี ${year}...`, null);
  try {
    const result = await jsonpRequest(apiUrl({
      action: 'splitYear', book: splitBook.value, sheet: splitSheet.value, year
    }), SLOW_SCAN_TIMEOUT_MS);
    if (!result.ok) throw new Error(result.error || 'แยกแท็บไม่สำเร็จ');
    setSplitStatus(result.message, 'success');
    await runSplitPreview(); // โหลดใหม่ให้เห็นว่าแท็บนั้นถูกสร้างแล้ว
  } catch (err) {
    setSplitStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'แยกเป็นแท็บใหม่';
  }
}

splitBook.addEventListener('change', loadSplitSheets);
splitPreviewBtn.addEventListener('click', runSplitPreview);
