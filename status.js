/* ===== หน้ารายละเอียดตามสถานะ (เปิดจากการคลิกสถานะใน Dashboard หน้าหลัก) =====
 *
 * หน้านี้แยกออกมาเป็นหน้าเว็บของตัวเอง เพื่อให้เปิดในแท็บใหม่ได้ และเปิดค้างไว้หลายสถานะพร้อมกันได้
 * ใช้ตั๋วเข้าใช้งานตัวเดียวกับหน้าหลัก (เก็บอยู่ใน localStorage ซึ่งใช้ร่วมกันทุกแท็บของเว็บเดียวกัน)
 *
 * แถบด้านซ้ายจะโชว์รายการสถานะทั้งหมดให้กดสลับดูได้ในหน้าเดียว ไม่ต้องกลับไปหน้าหลัก
 */

const JSONP_TIMEOUT_MS = 60000; // สถานะที่มีเป็นพันเคสต้องไล่อ่านหลายแท็บ จึงเผื่อเวลาไว้มากกว่าหน้าหลัก
// คำสั่งที่ต้องไล่นับทุกไฟล์ทุกแท็บ (globalDashboard / statusSummary) รอบแรกที่แคชฝั่งเซิร์ฟเวอร์
// ยังว่างอาจใช้เวลานานเป็นนาที จึงต้องเผื่อเวลาให้มากกว่าคำสั่งทั่วไป
const SLOW_SCAN_TIMEOUT_MS = 150000;
let jsonpCounter = 0;

const statusNameEl = document.getElementById('statusName');
const statusMetaEl = document.getElementById('statusMeta');
const pageStatusEl = document.getElementById('pageStatus');
const summarySection = document.getElementById('summarySection');
const summaryTable = document.getElementById('summaryTable');
const detailSection = document.getElementById('detailSection');
const detailGroups = document.getElementById('detailGroups');
const downloadBtn = document.getElementById('downloadBtn');
const statusSidebarList = document.getElementById('statusSidebarList');

let targetStatus = '';
let loadedGroups = []; // { book, sheet, count, headers, rows } สะสมไว้ใช้ตอนดาวน์โหลด Excel

// กันผลลัพธ์ของสถานะเก่าที่ตอบกลับมาช้า มาเขียนทับสถานะใหม่ที่ผู้ใช้เพิ่งกด
// (ถ้ากดสลับสถานะเร็วๆ ติดกัน คำขอเก่าจะยังค้างอยู่ ต้องทิ้งผลของมันไป)
let loadSeq = 0;

/* ===== เครื่องมือกลาง (สำเนาแบบย่อจาก script.js ให้หน้านี้ทำงานได้ด้วยตัวเอง) ===== */

function jsonpRequest(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const callbackName = `statusCallback_${Date.now()}_${jsonpCounter++}`;
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
      reject(new Error('เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด กรุณาลองใหม่อีกครั้ง'));
    }, timeoutMs || JSONP_TIMEOUT_MS);
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

/** คอลัมน์ที่ชื่อมีคำว่า Ticket ถือเป็นคอลัมน์ลิงก์ (ใช้เกณฑ์เดียวกับหน้าหลักและฝั่ง backend) */
function isTicketColumn(headerName) {
  return /ticket/i.test((headerName || '').toString());
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test((value || '').toString().trim());
}

/**
 * สร้างเนื้อหาในช่องตาราง 1 ช่อง
 * ถ้าเป็นคอลัมน์ Ticket และมีลิงก์ จะทำเป็นลิงก์กดเปิดแท็บใหม่ได้ เหมือนตารางในหน้าหลัก
 *
 * ลิงก์จริงมัก "ซ่อน" อยู่หลังข้อความ (เซลล์โชว์ว่า "Ticket #283838" แต่ผูกไฮเปอร์ลิงก์ไว้)
 * ฝั่ง backend จึงอ่าน URL จริงมาส่งให้ใน row.links — ถ้าไม่มี ค่อยเช็กว่าข้อความในเซลล์เป็น URL ตรงๆ หรือเปล่า
 */
/**
 * ตัดชื่อโดเมนท้ายข้อความออก เช่น "Ticket #877505 (exe.in.th)" -> "Ticket #877505"
 * เพื่อให้เลขที่ Ticket อ่านง่ายและแสดงได้ครบในคอลัมน์ที่กว้างจำกัด (URL เต็มยังดูได้จากการชี้เมาส์ค้าง)
 *
 * ตัดเฉพาะวงเล็บที่ "หน้าตาเป็นโดเมน" จริงๆ (มีจุดคั่น ไม่มีเว้นวรรค) เท่านั้น
 * วงเล็บที่เป็นหมายเหตุ เช่น "Ticket #123 (ด่วน)" จะไม่ถูกตัดทิ้ง
 */
function shortenTicketLabel(value) {
  const shortened = value.replace(/\s*\((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\)\s*$/, '').trim();
  return shortened || value; // กันกรณีตัดแล้วเหลือข้อความว่าง
}

function buildCellHtml(cellValue, columnIndex, headerName, rowLinks) {
  const value = (cellValue || '').toString();
  if (!isTicketColumn(headerName)) return escapeHtml(value);

  const linkUrl = (rowLinks && rowLinks[columnIndex]) || (isLikelyUrl(value) ? value.trim() : null);
  if (!linkUrl) return escapeHtml(value);

  // ถ้าข้อความในเซลล์อ่านง่ายอยู่แล้ว (ไม่ใช่ URL ดิบๆ) ให้โชว์ข้อความนั้นเป็นตัวลิงก์เลย
  const label = value && !isLikelyUrl(value) ? shortenTicketLabel(value) : 'เปิด Ticket ↗';
  return `<a class="ticket-link" href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(linkUrl)}">${escapeHtml(label)}</a>`;
}

function setPageStatus(message, type) {
  pageStatusEl.textContent = message;
  pageStatusEl.className = 'status-page__status' + (type ? ` status-page__status--${type}` : '');
}

/* ===== แถบเลือกสถานะด้านซ้าย ===== */

/**
 * โหลดรายการสถานะทั้งหมดมาทำเป็นปุ่มด้านซ้าย
 * ใช้ข้อมูลชุดเดียวกับ Dashboard หน้าหลัก (action=globalDashboard) ซึ่งมีแคชฝั่งเซิร์ฟเวอร์อยู่แล้ว
 * จึงเร็วและได้ตัวเลขตรงกับที่เห็นในหน้าหลักเสมอ
 */
async function loadStatusSidebar() {
  try {
    const result = await jsonpRequest(apiUrl({ action: 'globalDashboard' }), SLOW_SCAN_TIMEOUT_MS);
    if (!result.ok) throw new Error(result.error || 'โหลดรายการสถานะไม่สำเร็จ');
    renderStatusSidebar(result.statusBreakdown || []);
  } catch (err) {
    statusSidebarList.innerHTML = `<p class="status-sidebar__loading">โหลดรายการสถานะไม่สำเร็จ: ${escapeHtml(err.message)}</p>`;
  }
}

function renderStatusSidebar(breakdown) {
  if (breakdown.length === 0) {
    statusSidebarList.innerHTML = '<p class="status-sidebar__loading">ไม่พบสถานะใดในระบบ</p>';
    return;
  }

  statusSidebarList.innerHTML = breakdown.map(s => `
    <button type="button" class="status-sidebar__item" data-status="${escapeHtml(s.status)}">
      <span class="status-sidebar__item-name">${escapeHtml(s.status)}</span>
      <span class="status-sidebar__item-count">${s.count.toLocaleString()}</span>
    </button>`).join('');

  statusSidebarList.querySelectorAll('.status-sidebar__item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.status === targetStatus) return; // กดสถานะเดิมซ้ำ ไม่ต้องโหลดใหม่
      loadStatus(btn.dataset.status, true);
    });
  });

  markActiveSidebarItem();
}

function markActiveSidebarItem() {
  statusSidebarList.querySelectorAll('.status-sidebar__item').forEach(btn => {
    btn.setAttribute('data-active', String(btn.dataset.status === targetStatus));
  });
}

/* ===== โหลดรายละเอียดของสถานะที่เลือก ===== */

/**
 * @param {string} status สถานะที่ต้องการดู
 * @param {boolean} pushUrl true = เปลี่ยน URL บนแถบที่อยู่ด้วย (ตอนกดสลับจากแถบซ้าย)
 *                          เพื่อให้กดปุ่มย้อนกลับของเบราว์เซอร์ หรือรีเฟรชหน้า แล้วยังอยู่ที่สถานะเดิม
 */
async function loadStatus(status, pushUrl) {
  const requestId = ++loadSeq;
  targetStatus = status;

  // ล้างผลลัพธ์ของสถานะก่อนหน้าออกให้หมดก่อน
  loadedGroups = [];
  detailGroups.innerHTML = '';
  summaryTable.innerHTML = '';
  summarySection.hidden = true;
  detailSection.hidden = true;
  downloadBtn.hidden = true;
  statusMetaEl.textContent = '';

  statusNameEl.textContent = status;
  document.title = `สถานะ: ${status} · Data Search and Recording System`;
  markActiveSidebarItem();

  if (pushUrl) {
    history.pushState({ status }, '', `status.html?status=${encodeURIComponent(status)}`);
  }

  if (!localStorage.getItem('sheetSearchToken')) {
    setPageStatus('ยังไม่ได้เข้าสู่ระบบ กรุณากลับไปเข้าสู่ระบบที่หน้าหลักก่อน แล้วคลิกสถานะใหม่อีกครั้ง', 'error');
    return;
  }

  try {
    setPageStatus('กำลังค้นหาว่าสถานะนี้อยู่ที่ไฟล์ไหนบ้าง...', null);
    const summary = await jsonpRequest(apiUrl({ action: 'statusSummary', status }), SLOW_SCAN_TIMEOUT_MS);
    if (requestId !== loadSeq) return; // ผู้ใช้กดสถานะอื่นไปแล้ว ทิ้งผลนี้
    if (!summary.ok) throw new Error(summary.error || 'โหลดสรุปไม่สำเร็จ');

    renderSummary(summary);

    if (summary.groups.length === 0) {
      setPageStatus('ไม่พบเคสที่มีสถานะนี้', null);
      return;
    }

    // ไล่ขอรายการเคสทีละแท็บ แล้วแสดงผลทันทีที่ได้มา ไม่ต้องรอให้ครบทุกแท็บก่อน
    // (ถ้าขอทีเดียวทั้งหมด สถานะที่มีหลายพันเคสจะตอบกลับเป็นก้อนใหญ่มากจนช้าหรือพัง)
    detailSection.hidden = false;
    for (let i = 0; i < summary.groups.length; i++) {
      const group = summary.groups[i];
      setPageStatus(`กำลังโหลดรายการเคส ${i + 1}/${summary.groups.length} — ${group.book} · ${group.sheet}`, null);
      try {
        const result = await jsonpRequest(apiUrl({
          action: 'statusRows', status, book: group.book, sheet: group.sheet
        }));
        if (requestId !== loadSeq) return;
        if (!result.ok) throw new Error(result.error || 'โหลดไม่สำเร็จ');
        loadedGroups.push(Object.assign({ count: group.count }, result));
        renderGroup(result, group.count);
      } catch (err) {
        if (requestId !== loadSeq) return;
        renderGroupError(group, err.message);
      }
    }

    setPageStatus('', null);
    downloadBtn.hidden = false;
  } catch (err) {
    if (requestId !== loadSeq) return;
    setPageStatus('เกิดข้อผิดพลาด: ' + err.message, 'error');
  }
}

function renderSummary(summary) {
  statusMetaEl.textContent = `พบทั้งหมด ${summary.total.toLocaleString()} เคส ใน ${summary.groups.length} แท็บ`;

  if (summary.groups.length === 0) {
    summaryTable.innerHTML = '<p class="status-page__empty">ไม่พบเคสที่มีสถานะนี้</p>';
    summarySection.hidden = false;
    return;
  }

  summaryTable.innerHTML = `
    <table class="status-summary__table">
      <thead>
        <tr><th>ไฟล์</th><th>แท็บ</th><th class="status-summary__num">จำนวนเคส</th></tr>
      </thead>
      <tbody>
        ${summary.groups.map(g => `
          <tr>
            <td>${escapeHtml(g.book)}</td>
            <td>${escapeHtml(g.sheet)}</td>
            <td class="status-summary__num"><b>${g.count.toLocaleString()}</b></td>
          </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr><td colspan="2">รวมทั้งหมด</td><td class="status-summary__num"><b>${summary.total.toLocaleString()}</b></td></tr>
      </tfoot>
    </table>`;
  summarySection.hidden = false;
}

function renderGroup(result, expectedCount) {
  const wrap = document.createElement('div');
  wrap.className = 'status-group';

  const truncatedNote = result.truncated
    ? `<span class="status-group__warn">แสดง ${result.rows.length.toLocaleString()} จาก ${result.matched.toLocaleString()} เคส</span>`
    : '';

  // แสดงเฉพาะคอลัมน์ที่เซิร์ฟเวอร์เลือกมา (วันที่ / EXE ID / Ticket) ที่เหลือดูได้จากปุ่ม "ดูข้อมูล"
  const shown = (result.listColumns && result.listColumns.length)
    ? result.listColumns
    : result.headers.map((h, i) => i);

  wrap.innerHTML = `
    <h4 class="status-group__title">
      ${escapeHtml(result.book)} · ${escapeHtml(result.sheet)}
      <span class="status-group__count">${expectedCount.toLocaleString()} เคส</span>
      ${truncatedNote}
    </h4>
    <div class="status-group__table-wrap">
      <table class="status-group__table">
        <thead>
          <tr><th>แถวที่</th>${shown.map(i => `<th${isTicketColumn(result.headers[i]) ? ' class="status-group__ticket-col"' : ''}>${escapeHtml(result.headers[i])}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${result.rows.map(r => `
            <tr class="status-group__row--clickable" title="คลิกเพื่อดูข้อมูลทั้งหมดของแถวนี้"
                data-view-book="${escapeHtml(result.book)}" data-view-sheet="${escapeHtml(result.sheet)}" data-view-row="${r.row}">
              <td class="status-group__rownum">${r.row}</td>
              ${shown.map(i => `<td${isTicketColumn(result.headers[i]) ? ' class="status-group__ticket-col"' : ''}>${buildCellHtml(r.cells[i], i, result.headers[i], r.links)}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  detailGroups.appendChild(wrap);
}

function renderGroupError(group, message) {
  const wrap = document.createElement('div');
  wrap.className = 'status-group';
  wrap.innerHTML = `
    <h4 class="status-group__title">${escapeHtml(group.book)} · ${escapeHtml(group.sheet)}</h4>
    <p class="status-page__status status-page__status--error">โหลดรายการเคสไม่สำเร็จ: ${escapeHtml(message)}</p>`;
  detailGroups.appendChild(wrap);
}

/* ===== ดาวน์โหลดเป็น Excel (แยกชีทตามแท็บต้นทาง) ===== */

downloadBtn.addEventListener('click', () => {
  if (typeof XLSX === 'undefined') {
    setPageStatus('ยังโหลดตัวสร้างไฟล์ Excel ไม่เสร็จ กรุณารอสักครู่แล้วลองใหม่', 'error');
    return;
  }
  if (loadedGroups.length === 0) return;

  const wb = XLSX.utils.book_new();

  // ชีทแรก: สรุปตามไฟล์/แท็บ
  const summaryRows = loadedGroups.map(g => ({
    'ไฟล์': g.book,
    'แท็บ': g.sheet,
    'จำนวนเคส': g.count,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'สรุป');

  // ชีทต่อไป: รายการเคสของแต่ละแท็บ
  const usedNames = {};
  loadedGroups.forEach(g => {
    const rows = g.rows.map(r => {
      const obj = { 'แถวที่': r.row };
      g.headers.forEach((h, i) => { obj[h] = r.cells[i] || ''; });
      return obj;
    });
    // ชื่อชีทใน Excel ห้ามเกิน 31 ตัวอักษรและห้ามซ้ำ
    let name = g.sheet.replace(/[\\\/\?\*\[\]:]/g, '-').slice(0, 28);
    usedNames[name] = (usedNames[name] || 0) + 1;
    if (usedNames[name] > 1) name = `${name}_${usedNames[name]}`;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ 'หมายเหตุ': 'ไม่มีข้อมูล' }]), name);
  });

  const safeStatus = targetStatus.replace(/[\\\/\?\*\[\]:]/g, '-');
  XLSX.writeFile(wb, `เคสสถานะ_${safeStatus}.xlsx`);
});

/* ===== เริ่มทำงาน ===== */

// กดปุ่มย้อนกลับ/ไปข้างหน้าของเบราว์เซอร์ แล้วให้กลับไปสถานะที่เคยดู
window.addEventListener('popstate', () => {
  const status = (new URLSearchParams(window.location.search).get('status') || '').trim();
  if (status) loadStatus(status, false);
});

function init() {
  loadStatusSidebar(); // โหลดแถบซ้ายคู่ขนานไป ไม่ต้องรอให้เสร็จก่อนค่อยโหลดเนื้อหา

  const status = (new URLSearchParams(window.location.search).get('status') || '').trim();
  if (!status) {
    statusNameEl.textContent = '—';
    setPageStatus('เลือกสถานะที่ต้องการดูจากแถบด้านซ้าย', null);
    return;
  }
  loadStatus(status, false);
}

/* ===== กล่องรายละเอียดทั้งแถว (เปิดจากปุ่ม 👁 ในตาราง) ===== */

const caseModal = document.getElementById('caseModal');
const caseModalMeta = document.getElementById('caseModalMeta');
const caseModalStatus = document.getElementById('caseModalStatus');
const caseModalBody = document.getElementById('caseModalBody');
const caseModalWarn = document.getElementById('caseModalWarn');
const caseModalFields = document.getElementById('caseModalFields');
const caseModalTimeline = document.getElementById('caseModalTimeline');
const caseModalClose = document.getElementById('caseModalClose');

async function openCaseModal(target) {
  caseModalMeta.textContent = `${target.book} · ${target.sheet} · แถวที่ ${target.row}`;
  caseModalBody.hidden = true;
  caseModalWarn.hidden = true;
  caseModalFields.innerHTML = '';
  caseModalTimeline.innerHTML = '';
  caseModalStatus.textContent = 'กำลังโหลดรายละเอียด...';
  caseModal.hidden = false;

  try {
    const result = await jsonpRequest(apiUrl({
      action: 'caseDetail', book: target.book, sheet: target.sheet, row: target.row
    }));
    if (!result.ok) throw new Error(result.error || 'โหลดรายละเอียดไม่สำเร็จ');

    const fields = result.fields || [];
    caseModalFields.innerHTML = fields.length
      ? buildCaseFieldsTable(fields)
      : '<p class="case-modal__empty">ไม่พบข้อมูลของแถวนี้ (อาจถูกลบไปแล้ว)</p>';

    const timeline = (result.timeline || []).slice().reverse();
    caseModalTimeline.innerHTML = timeline.length
      ? timeline.map(ev => `
        <div class="case-modal__event">
          <div class="case-modal__event-top">
            <span class="case-modal__event-action">${escapeHtml(ev.action)}</span>
            <span class="case-modal__event-time">${escapeHtml(ev.time)}</span>
            <span class="case-modal__event-editor">โดย ${escapeHtml(ev.editor)}</span>
          </div>
          <div class="case-modal__event-detail">${formatEventDetail(ev.detail)}</div>
        </div>`).join('')
      : '<p class="case-modal__empty">ยังไม่มีประวัติของเคสนี้ใน Log</p>';

    if (result.hasDeletionInSheet && timeline.length > 0) {
      caseModalWarn.textContent = 'หมายเหตุ: แท็บนี้เคยมีการลบแถว ซึ่งทำให้เลขแถวเลื่อน ประวัติด้านล่างจับคู่จากเลขแถว จึงอาจมีรายการของเคสอื่นปนมาได้';
      caseModalWarn.hidden = false;
    }

    caseModalBody.hidden = false;
    caseModalStatus.textContent = '';
  } catch (err) {
    caseModalStatus.textContent = 'เกิดข้อผิดพลาด: ' + err.message;
  }
}

/**
 * สร้างตารางแสดงข้อมูลทุกคอลัมน์ของเคส แบบ 2 คอลัมน์ (ชื่อคอลัมน์ / ค่า)
 * ใช้ <table> จริง ให้ชื่อคอลัมน์กับค่าอยู่ตรงแถวเดียวกันเสมอ แม้ค่าจะยาวหลายบรรทัด
 * ต้องให้เหมือนกับ buildCaseFieldsTable_ ใน script.js เพื่อให้ 2 หน้าหน้าตาตรงกัน
 */
function buildCaseFieldsTable(fields) {
  return '<table class="case-fields"><tbody>' + (fields || []).map(f =>
    `<tr><th scope="row">${escapeHtml(f.name)}</th><td>${buildDetailValueHtml(f.value)}</td></tr>`
  ).join('') + '</tbody></table>';
}

/** ค่าที่เป็น URL ให้กดเปิดได้เลย */
function buildDetailValueHtml(value) {
  const text = (value || '').toString();
  if (!text) return '<span class="case-fields__empty">(ว่าง)</span>';
  if (isLikelyUrl(text)) {
    return `<a class="ticket-link" href="${escapeHtml(text)}" target="_blank" rel="noopener noreferrer">${escapeHtml(shortenTicketLabel(text))}</a>`;
  }
  return escapeHtml(text);
}

/** แยกรายการคอลัมน์ที่ถูกแก้ไขเป็นบรรทัดละคอลัมน์ (เซิร์ฟเวอร์คั่นมาด้วย " | ") */
function formatEventDetail(detail) {
  const text = (detail || '').toString();
  const parts = text.split(' | ');
  if (parts.length <= 1) return escapeHtml(text);
  const head = parts.shift();
  return `<div>${escapeHtml(head)}</div>`
    + `<ul class="case-modal__changes">${parts.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`;
}

function closeCaseModal() { caseModal.hidden = true; }

caseModalClose.addEventListener('click', closeCaseModal);
caseModal.addEventListener('click', (e) => { if (e.target === caseModal) closeCaseModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !caseModal.hidden) closeCaseModal();
});

// แถวถูกสร้างใหม่ทุกครั้งที่ render ตาราง จึงดักคลิกที่ตัวครอบแทนการผูกทีละแถว
detailGroups.addEventListener('click', (e) => {
  // กดลิงก์ Ticket = เปิด Ticket ไม่ใช่เปิดกล่องรายละเอียด
  if (e.target.closest('a')) return;

  const tr = e.target.closest('.status-group__row--clickable');
  if (!tr) return;
  openCaseModal({
    book: tr.dataset.viewBook,
    sheet: tr.dataset.viewSheet,
    row: parseInt(tr.dataset.viewRow, 10)
  });
});

init();
