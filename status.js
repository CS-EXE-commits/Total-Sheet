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
  chartSection.hidden = true;
  hideChartTip();
  lastSummary = null;
  chartRange = { from: '', to: '' };
  if (chartFromInput) { chartFromInput.value = ''; chartToInput.value = ''; }
  if (chartFilterNote) chartFilterNote.hidden = true;
  setChartPresetActive('all');
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
    lastSummary = summary;
    chartSection.hidden = summary.groups.length === 0;
    if (summary.groups.length > 0) renderChartByTab(summary.groups, summary.total);

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

    applyChartRange(); // เคสครบทุกแท็บแล้ว วาดกราฟตามช่วงเวลาที่เลือกอยู่
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
          <tr class="status-summary__row--clickable" title="คลิกเพื่อเปิดแท็บนี้"
              data-jump-book="${escapeHtml(g.book)}" data-jump-sheet="${escapeHtml(g.sheet)}">
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
      <button type="button" class="status-group__jump"
              data-jump-book="${escapeHtml(result.book)}" data-jump-sheet="${escapeHtml(result.sheet)}"
              title="คลิกเพื่อเปิดแท็บนี้">${escapeHtml(result.book)} · ${escapeHtml(result.sheet)} ↗</button>
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

  // กดชื่อไฟล์/แท็บที่หัวข้อกลุ่ม = วาร์ปไปเปิดแท็บนั้นในหน้าหลัก
  const jump = e.target.closest('[data-jump-book]');
  if (jump) { jumpToSheet_(jump.dataset.jumpBook, jump.dataset.jumpSheet); return; }

  const tr = e.target.closest('.status-group__row--clickable');
  if (!tr) return;
  openCaseModal({
    book: tr.dataset.viewBook,
    sheet: tr.dataset.viewSheet,
    row: parseInt(tr.dataset.viewRow, 10)
  });
});


/* ===== กราฟภาพรวมของสถานะที่กำลังดู =====
 *
 * มี 2 กราฟ ทั้งคู่เป็นข้อมูลชุดเดียว (single series) จึงไม่ต้องมีกล่องคำอธิบายสี
 * หัวข้อของกราฟบอกอยู่แล้วว่ากำลังดูอะไร
 *
 *  1. แท่งแนวนอน — เคสของสถานะนี้กระจายอยู่ไฟล์/แท็บไหนบ้าง
 *     ใช้แท่งแนวนอนเพราะชื่อแท็บภาษาไทยยาว ถ้าเป็นแท่งแนวตั้งชื่อจะซ้อนกันอ่านไม่ออก
 *     ทุกแท่งใช้สีเดียวกัน ไม่ไล่เฉดตามค่า เพราะชื่อไฟล์ไม่มีลำดับก่อนหลังตามธรรมชาติ
 *     (ไล่เฉดจะเป็นการบอกข้อมูลซ้ำกับความยาวแท่งโดยไม่ได้อะไรเพิ่ม)
 *
 *  2. เส้น + พื้นที่ใต้เส้น — เคสเข้ามาเดือนไหนบ้าง อ่านแนวโน้มได้ทันที
 *
 * วาดด้วย SVG เองทั้งหมด ไม่พึ่งไลบรารีภายนอก เพื่อไม่ให้มีอะไรต้องโหลดเพิ่ม
 * และคุมสีให้เข้ากับธีมสว่าง/มืดของเว็บได้เอง
 */

const chartSection = document.getElementById('chartSection');
const chartByTabEl = document.getElementById('chartByTab');
const chartByTabSub = document.getElementById('chartByTabSub');
const chartTrendEl = document.getElementById('chartTrend');
const chartTrendSub = document.getElementById('chartTrendSub');
const chartTrendCard = document.getElementById('chartTrendCard');

const CHART_BAR_MAX_ITEMS = 8; // เกินนี้รวมเป็น "อื่นๆ" ไม่สร้างสีใหม่เพิ่ม

/** กล่องข้อความลอยตอนชี้เมาส์ ใช้ร่วมกันทุกกราฟ */
let chartTip = null;
function showChartTip(evt, html) {
  if (!chartTip) {
    chartTip = document.createElement('div');
    chartTip.className = 'chart-tip';
    document.body.appendChild(chartTip);
  }
  chartTip.innerHTML = html;
  chartTip.hidden = false;
  const pad = 14;
  let x = evt.clientX + pad;
  let y = evt.clientY + pad;
  const box = chartTip.getBoundingClientRect();
  if (x + box.width > window.innerWidth - 8) x = evt.clientX - box.width - pad;
  if (y + box.height > window.innerHeight - 8) y = evt.clientY - box.height - pad;
  chartTip.style.left = x + 'px';
  chartTip.style.top = y + 'px';
}
function hideChartTip() { if (chartTip) chartTip.hidden = true; }
window.addEventListener('scroll', hideChartTip, true);

/** แปลงค่าในช่องวันที่เป็น "ปี-เดือน" รองรับทุกรูปแบบที่พบจริงในชีท (สูตรเดียวกับฝั่ง Code.gs) */
function monthKeyFromCell(value) {
  if (value === null || value === undefined) return '';
  const str = value.toString().trim();
  if (!str) return '';

  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);            // วว/ดด/ปปปป
  if (m) return fmtMonth(normYear(+m[3]), +m[2]);
  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);                    // ปปปป-ดด-วว
  if (m) return fmtMonth(normYear(+m[1]), +m[2]);
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);                   // วว-ดด-ปปปป
  if (m) return fmtMonth(normYear(+m[3]), +m[2]);

  // ตัวเลขลำดับวันของ Google Sheets (เช่น 45085) จำกัดช่วงปี 2000-2100
  // ไม่งั้นเลขอย่าง Level 35 หรือ UID จะถูกตีความเป็นวันที่ไปด้วย
  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str);
    if (serial >= 36526 && serial <= 73415) {
      const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
      if (!isNaN(d.getTime())) return fmtMonth(d.getUTCFullYear(), d.getUTCMonth() + 1);
    }
  }
  return '';
}
function normYear(y) { return y > 2400 ? y - 543 : y; } // บางชีทกรอกเป็น พ.ศ.
function fmtMonth(y, m) {
  if (!y || !m || m < 1 || m > 12) return '';
  return `${y}-${String(m).padStart(2, '0')}`;
}
const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function monthLabel(key) {
  const [y, m] = key.split('-');
  return `${THAI_MONTHS[+m - 1]} ${y}`;
}

/** กราฟแท่งแนวนอน: เคสของสถานะนี้อยู่ไฟล์/แท็บไหนบ้าง */
function renderChartByTab(groups, total) {
  const items = groups.map(g => ({
    label: `${g.book} · ${g.sheet}`, value: g.count, book: g.book, sheet: g.sheet
  }));
  let shown = items;
  if (items.length > CHART_BAR_MAX_ITEMS) {
    const head = items.slice(0, CHART_BAR_MAX_ITEMS - 1);
    const restTotal = items.slice(CHART_BAR_MAX_ITEMS - 1).reduce((n, x) => n + x.value, 0);
    // กลุ่ม "อื่นๆ" ไม่ผูกกับแท็บเดียว จึงกดไปไหนไม่ได้ (ไม่ใส่ book/sheet)
    shown = head.concat([{ label: `อื่นๆ อีก ${items.length - head.length} แท็บ`, value: restTotal }]);
  }

  chartByTabSub.textContent = `รวม ${total.toLocaleString()} เคส · ${items.length} แท็บ`;

  // ความสูงต่อแถว = ชื่อ(14) + ช่องไฟ(5) + แท่ง(18) + ช่องไฟใต้แท่ง(11)
  // ถ้าตั้งเตี้ยกว่านี้ ชื่อแท็บจะไปชนกับแท่งของแถวก่อนหน้า
  const rowH = 48, barH = 18, gap = 6;
  const w = 640, padL = 8, padR = 64;
  const h = shown.length * rowH + gap;
  const max = Math.max(...shown.map(s => s.value), 1);
  const plotW = w - padL - padR;

  const bars = shown.map((item, i) => {
    const y = i * rowH;
    const barW = Math.max((item.value / max) * plotW, 2);
    const pct = total > 0 ? (item.value / total * 100) : 0;
    // ปลายแท่งมนด้านเดียว ติดเส้นฐานเป็นมุมฉาก
    const r = Math.min(4, barW);
    const barY = y + 19;
    const path = `M${padL},${barY} h${barW - r} a${r},${r} 0 0 1 ${r},${r} v${barH - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${barW - r} z`;
    const jump = item.book
      ? ` data-book="${escapeHtml(item.book)}" data-sheet="${escapeHtml(item.sheet)}"`
      : '';
    return `
      <g class="cbar${item.book ? ' cbar--clickable' : ''}" tabindex="0"${jump}
         data-label="${escapeHtml(item.label)}"
         data-value="${item.value}"
         data-pct="${pct.toFixed(1)}">
        <text class="cbar__name" x="${padL}" y="${y + 12}">${escapeHtml(item.label)}</text>
        <rect class="cbar__hit" x="0" y="${y}" width="${w}" height="${rowH - 4}"></rect>
        <path class="cbar__mark" d="${path}"></path>
        <text class="cbar__val" x="${padL + barW + 8}" y="${barY + barH / 2 + 4}">${item.value.toLocaleString()}</text>
      </g>`;
  }).join('');

  chartByTabEl.innerHTML =
    `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMinYMin meet" role="img"
          aria-label="จำนวนเคสแยกตามไฟล์และแท็บ">${bars}</svg>`;
  bindBarHover(chartByTabEl);
}

/** กดแท่งแล้วไปเปิดแท็บนั้นในหน้าหลักทันที (ไม่ใช่เลื่อนลงไปดูตารางข้างล่าง) */
function jumpToSheet_(book, sheet) {
  const url = `index.html?book=${encodeURIComponent(book)}&sheet=${encodeURIComponent(sheet)}`;
  window.location.href = url;
}

function bindBarHover(root) {
  root.querySelectorAll('.cbar').forEach(g => {
    const canJump = !!g.dataset.book;
    const show = (e) => showChartTip(e, `
      <div class="chart-tip__name">${escapeHtml(g.dataset.label)}</div>
      <div class="chart-tip__value">${(+g.dataset.value).toLocaleString()} เคส
        <span class="chart-tip__muted">(${g.dataset.pct}%)</span></div>
      ${canJump ? '<div class="chart-tip__hint">คลิกเพื่อเปิดแท็บนี้</div>' : ''}`);

    if (canJump) {
      g.addEventListener('click', () => jumpToSheet_(g.dataset.book, g.dataset.sheet));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jumpToSheet_(g.dataset.book, g.dataset.sheet); }
      });
    }
    g.addEventListener('mouseenter', show);
    g.addEventListener('mousemove', show);
    g.addEventListener('mouseleave', hideChartTip);
    g.addEventListener('focus', (e) => {
      const r = g.getBoundingClientRect();
      show({ clientX: r.left + 20, clientY: r.top });
    });
    g.addEventListener('blur', hideChartTip);
  });
}

/** กราฟเส้น: เคสของสถานะนี้เข้ามาเดือนไหนบ้าง (อ่านจากคอลัมน์วันที่ของเคสที่โหลดมาแล้ว) */
function renderChartTrend(groups, filtering) {
  const tally = {};
  let parsed = 0, unparsed = 0;

  groups.forEach(g => {
    const dateIndex = (g.headers || []).findIndex(h =>
      /วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test((h || '').toString().trim()));
    if (dateIndex === -1) { unparsed += (g.rows || []).length; return; }
    (g.rows || []).forEach(r => {
      const key = monthKeyFromCell(r.cells[dateIndex]);
      if (!key) { unparsed++; return; }
      if (filtering && !inChartRange(key)) return; // อยู่นอกช่วงเวลาที่เลือก
      tally[key] = (tally[key] || 0) + 1;
      parsed++;
    });
  });

  if (parsed === 0) {
    chartTrendCard.hidden = true;
    return;
  }
  chartTrendCard.hidden = false;

  // เติมเดือนที่ไม่มีเคสให้ครบ ไม่งั้นกราฟจะบีบช่องว่างจนแนวโน้มผิดเพี้ยน
  const keys = Object.keys(tally).sort();
  const all = [];
  let [y, m] = keys[0].split('-').map(Number);
  const [ey, em] = keys[keys.length - 1].split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    const k = fmtMonth(y, m);
    all.push({ key: k, value: tally[k] || 0 });
    m++; if (m > 12) { m = 1; y++; }
  }

  chartTrendSub.textContent = `${parsed.toLocaleString()} เคสที่ระบุวันที่ได้`
    + (unparsed > 0 ? ` · อีก ${unparsed.toLocaleString()} เคสไม่มีวันที่` : '');

  const w = 640, h = 240, padL = 44, padR = 16, padT = 14, padB = 34;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const max = Math.max(...all.map(p => p.value), 1);
  const niceMax = niceCeil(max);
  const x = i => all.length === 1 ? padL + plotW / 2 : padL + (i / (all.length - 1)) * plotW;
  const yPos = v => padT + plotH - (v / niceMax) * plotH;

  // เส้นแนวนอนบอกระดับ 3 เส้น แบบจางๆ ไม่แย่งสายตาจากข้อมูล
  const ticks = [0, niceMax / 2, niceMax];
  const grid = ticks.map(t => `
    <line class="cline__grid" x1="${padL}" y1="${yPos(t)}" x2="${w - padR}" y2="${yPos(t)}"></line>
    <text class="cline__ytick" x="${padL - 8}" y="${yPos(t) + 4}">${Math.round(t).toLocaleString()}</text>`).join('');

  const linePath = all.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${yPos(p.value).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(all.length - 1).toFixed(1)},${yPos(0)} L${x(0).toFixed(1)},${yPos(0)} Z`;

  // ป้ายแกนล่าง: แสดงเท่าที่ไม่ชนกัน ไม่ใช่ทุกเดือน
  const LABEL_W = 62; // ความกว้างโดยประมาณของป้ายอย่าง "ม.ค. 2025"
  const maxLabels = Math.max(2, Math.floor(plotW / LABEL_W));
  const step = Math.max(1, Math.ceil(all.length / maxLabels));
  const shownIdx = [];
  for (let i = 0; i < all.length; i += step) shownIdx.push(i);
  // แสดงเดือนสุดท้ายด้วย แต่ถ้าจะไปทับป้ายก่อนหน้า ให้เอาป้ายก่อนหน้าออกแทน
  const last = all.length - 1;
  if (shownIdx[shownIdx.length - 1] !== last) {
    const prev = shownIdx[shownIdx.length - 1];
    if (x(last) - x(prev) < LABEL_W) shownIdx.pop();
    shownIdx.push(last);
  }
  const xLabels = shownIdx.map(i =>
    `<text class="cline__xtick" x="${x(i).toFixed(1)}" y="${h - 10}">${monthLabel(all[i].key)}</text>`
  ).join('');

  // จุดสูงสุดติดป้ายไว้จุดเดียว ไม่ใส่ตัวเลขทุกจุด
  const peak = all.reduce((best, p, i) => p.value > all[best].value ? i : best, 0);

  const hits = all.map((p, i) => `
    <g class="cpt" tabindex="0" data-label="${escapeHtml(monthLabel(p.key))}" data-value="${p.value}">
      <rect class="cpt__hit" x="${(x(i) - (plotW / Math.max(all.length - 1, 1)) / 2).toFixed(1)}"
            y="${padT}" width="${(plotW / Math.max(all.length - 1, 1)).toFixed(1)}" height="${plotH}"></rect>
      <line class="cpt__cross" x1="${x(i).toFixed(1)}" y1="${padT}" x2="${x(i).toFixed(1)}" y2="${padT + plotH}"></line>
      <circle class="cpt__dot" cx="${x(i).toFixed(1)}" cy="${yPos(p.value).toFixed(1)}" r="5"></circle>
    </g>`).join('');

  chartTrendEl.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMinYMin meet" role="img"
         aria-label="จำนวนเคสตามเดือน">
      ${grid}
      <path class="cline__area" d="${areaPath}"></path>
      <path class="cline__line" d="${linePath}"></path>
      <circle class="cline__peak" cx="${x(peak).toFixed(1)}" cy="${yPos(all[peak].value).toFixed(1)}" r="4.5"></circle>
      <text class="cline__peaklabel" x="${x(peak).toFixed(1)}" y="${(yPos(all[peak].value) - 12).toFixed(1)}">${all[peak].value.toLocaleString()}</text>
      ${xLabels}
      ${hits}
    </svg>`;

  chartTrendEl.querySelectorAll('.cpt').forEach(g => {
    const show = (e) => showChartTip(e, `
      <div class="chart-tip__name">${escapeHtml(g.dataset.label)}</div>
      <div class="chart-tip__value">${(+g.dataset.value).toLocaleString()} เคส</div>`);
    g.addEventListener('mouseenter', show);
    g.addEventListener('mousemove', show);
    g.addEventListener('mouseleave', hideChartTip);
    g.addEventListener('focus', () => {
      const r = g.getBoundingClientRect();
      show({ clientX: r.left + r.width / 2, clientY: r.top });
    });
    g.addEventListener('blur', hideChartTip);
  });
}

/** ปัดเพดานแกนตั้งให้เป็นเลขกลมๆ อ่านง่าย */
function niceCeil(n) {
  if (n <= 5) return 5;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  // ขั้นละเอียดพอที่เพดานจะไม่สูงเกินข้อมูลมาก ไม่งั้นกราฟจะแบนอยู่ครึ่งล่าง อ่านแนวโน้มไม่ออก
  // (เช่น ค่าสูงสุด 58 ถ้าใช้ขั้นหยาบจะได้เพดาน 100 แต่ขั้นนี้ได้ 60 ซึ่งพอดีกว่ามาก)
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(s => n <= s * mag) || 10;
  return step * mag;
}

// แถวในตารางสรุป กดแล้ววาร์ปไปแท็บนั้นในหน้าหลัก
summaryTable.addEventListener('click', (e) => {
  const row = e.target.closest('[data-jump-book]');
  if (!row) return;
  jumpToSheet_(row.dataset.jumpBook, row.dataset.jumpSheet);
});

/* ===== ปฏิทินกำหนดช่วงเวลาของกราฟ =====
 *
 * กรองจาก "เคสที่โหลดมาแล้ว" เท่านั้น เพราะวันที่ของแต่ละเคสอยู่ในตัวข้อมูล
 * ไม่ได้อยู่ในสรุปที่เซิร์ฟเวอร์ส่งมา
 *
 * ตอนไม่กรอง กราฟแท่งจะใช้ยอดจากสรุปของเซิร์ฟเวอร์ ซึ่งเป็นยอดจริงครบทุกเคส
 * พอกรองช่วงเวลา ต้องนับใหม่จากเคสที่โหลดมา ซึ่งอาจไม่ครบถ้าแท็บนั้นมีเกินขีดจำกัด
 * จึงต้องขึ้นข้อความบอกให้ชัด ไม่ปล่อยให้เข้าใจผิดว่าเป็นยอดจริงทั้งหมด
 */

const chartFromInput = document.getElementById('chartFrom');
const chartToInput = document.getElementById('chartTo');
const chartApplyBtn = document.getElementById('chartApply');
const chartFilterNote = document.getElementById('chartFilterNote');

let chartRange = { from: '', to: '' };   // รูปแบบ YYYY-MM-DD ว่าง = ไม่กรอง
let lastSummary = null;                   // สรุปจากเซิร์ฟเวอร์ของสถานะที่กำลังดู

function setChartPresetActive(range) {
  document.querySelectorAll('.chart-preset[data-range]').forEach(btn => {
    btn.dataset.active = String(btn.dataset.range === range);
  });
}

/** เดือนของเคสนี้อยู่ในช่วงที่เลือกไหม (เทียบระดับเดือน เพราะกราฟนับเป็นรายเดือน) */
function inChartRange(monthKey) {
  if (!monthKey) return false;
  if (chartRange.from && monthKey < chartRange.from.slice(0, 7)) return false;
  if (chartRange.to && monthKey > chartRange.to.slice(0, 7)) return false;
  return true;
}

/** หาตำแหน่งคอลัมน์วันที่ของกลุ่มนี้ */
function dateIndexOf(group) {
  return (group.headers || []).findIndex(h =>
    /วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test((h || '').toString().trim()));
}

/** วาดกราฟใหม่ทั้ง 2 ตัวตามช่วงเวลาที่เลือกอยู่ */
function applyChartRange() {
  if (!lastSummary) return;
  const filtering = !!(chartRange.from || chartRange.to);

  if (!filtering) {
    chartFilterNote.hidden = true;
    renderChartByTab(lastSummary.groups, lastSummary.total);
    renderChartTrend(loadedGroups);
    return;
  }

  // นับใหม่จากเคสที่โหลดมา เฉพาะที่อยู่ในช่วงเวลาที่เลือก
  const groups = [];
  let total = 0;
  let noDate = 0;
  loadedGroups.forEach(g => {
    const di = dateIndexOf(g);
    if (di === -1) { noDate += (g.rows || []).length; return; }
    let count = 0;
    (g.rows || []).forEach(r => { if (inChartRange(monthKeyFromCell(r.cells[di]))) count++; });
    if (count > 0) { groups.push({ book: g.book, sheet: g.sheet, count }); total += count; }
  });
  groups.sort((a, b) => b.count - a.count);

  const truncated = loadedGroups.some(g => g.truncated);
  chartFilterNote.textContent =
    `กำลังกรองช่วงเวลา — ตัวเลขในกราฟนับจากเคสที่โหลดมาแล้วเท่านั้น`
    + (truncated ? ' (บางแท็บมีเคสเกินที่ระบบโหลดมาได้ ยอดจริงอาจมากกว่านี้)' : '')
    + (noDate > 0 ? ` · มี ${noDate.toLocaleString()} เคสที่ไม่มีคอลัมน์วันที่ จึงไม่ถูกนับ` : '');
  chartFilterNote.hidden = false;

  if (groups.length === 0) {
    chartByTabSub.textContent = 'ไม่มีเคสในช่วงเวลาที่เลือก';
    chartByTabEl.innerHTML = '<p class="chart-card__empty">ไม่มีเคสในช่วงเวลาที่เลือก</p>';
    chartTrendCard.hidden = true;
    return;
  }

  renderChartByTab(groups, total);
  renderChartTrend(loadedGroups, true);
}

/** ตั้งช่วงเวลาสำเร็จรูป */
function applyChartPreset(range) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (range === 'all') {
    chartRange = { from: '', to: '' };
  } else if (range === '12m') {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    chartRange = { from: fmt(start), to: fmt(now) };
  } else if (range === 'year') {
    chartRange = { from: fmt(new Date(now.getFullYear(), 0, 1)), to: fmt(now) };
  }
  chartFromInput.value = chartRange.from;
  chartToInput.value = chartRange.to;
  setChartPresetActive(range);
  applyChartRange();
}

document.querySelectorAll('.chart-preset[data-range]').forEach(btn => {
  btn.addEventListener('click', () => applyChartPreset(btn.dataset.range));
});

chartApplyBtn.addEventListener('click', () => {
  const from = chartFromInput.value;
  const to = chartToInput.value;
  if (from && to && from > to) {
    chartFilterNote.textContent = 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด';
    chartFilterNote.hidden = false;
    return;
  }
  chartRange = { from, to };
  setChartPresetActive(from || to ? '' : 'all');
  applyChartRange();
});

// เริ่มทำงาน — ต้องอยู่ท้ายสุดของไฟล์ เพราะฟังก์ชันและตัวแปรด้านบนต้องถูกประกาศครบก่อน
init();
