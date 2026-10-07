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

/* ===== อ่านจาก Supabase แทน Apps Script (เร็วกว่าหลายเท่า) =====
 * ถ้า Supabase ใช้ไม่ได้ด้วยเหตุใดก็ตาม จะถอยไปยิง Apps Script เส้นเดิมให้อัตโนมัติ
 * หน้านี้ไม่มีปุ่มล็อกอินของตัวเอง จึงใช้ตั๋ว Supabase ที่หน้าหลักจำไว้ให้ (localStorage)
 */
let supaSessionTask_ = null;
function ensureSupaOnStatusPage_() {
  if (typeof supaRestoreSession !== 'function') return Promise.resolve(false);
  if (!supaSessionTask_) {
    supaSessionTask_ = supaRestoreSession().then(() => supaReady()).catch(() => false);
  }
  // รอได้ไม่เกิน 2.5 วินาที เกินกว่านั้นใช้ Apps Script ไปก่อน ไม่ให้หน้าค้าง
  return Promise.race([supaSessionTask_, new Promise(r => setTimeout(() => r(false), 2500))]);
}

async function serveStatusFromSupabase_(action, url) {
  const p = new URL(url).searchParams;
  if (action === 'globalDashboard') return await supaStatusBreakdown();
  if (action === 'statusSummary') return await supaStatusSummary(p.get('status'));
  if (action === 'statusRows') return await supaStatusRows(p.get('status'), p.get('book'), p.get('sheet'));
  throw new Error('ไม่รู้จักคำสั่ง ' + action);
}

const STATUS_SUPABASE_ACTIONS = ['globalDashboard', 'statusSummary', 'statusRows'];

async function jsonpRequest(url, timeoutMs) {
  const m = /[?&]action=([^&]*)/.exec(url);
  const action = m ? decodeURIComponent(m[1]) : '';
  if (STATUS_SUPABASE_ACTIONS.indexOf(action) !== -1 && await ensureSupaOnStatusPage_()) {
    try {
      return await serveStatusFromSupabase_(action, url);
    } catch (err) {
      console.warn('[Supabase] ดึงข้อมูลไม่สำเร็จ ถอยไปใช้ Apps Script:', err.message);
    }
  }
  return jsonpRequestRaw_(url, timeoutMs);
}

function jsonpRequestRaw_(url, timeoutMs) {
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
  groupAnchors.clear();
  pendingScrollTo = null;
  resetTimePicker_();
  if (chartFilterNote) chartFilterNote.hidden = true;
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
    // ยิงขอทุกแท็บพร้อมกันตั้งแต่แรก แล้วค่อยวาดตามลำดับทีละแท็บ
    // เดิมขอทีละแท็บรอให้เสร็จก่อนค่อยขอแท็บถัดไป สถานะที่กระจายอยู่ 10 แท็บต้องรอ 10 รอบเต็มๆ
    // ลำดับการวาดยังเหมือนเดิม (มากไปน้อย) ลิงก์วาร์ปไปแต่ละกลุ่มจึงยังตรงตำแหน่ง
    // แต่ถ้าใช้ Supabase ไม่ได้ (ถอยไปใช้ Apps Script) ต้องกลับไปขอทีละแท็บเหมือนเดิม
    // เพราะ Apps Script รับงานพร้อมกันได้น้อย ยิงพร้อมกันหลายแท็บจะยิ่งช้าและหมดเวลา
    const fetchGroup = group => jsonpRequest(apiUrl({
      action: 'statusRows', status, book: group.book, sheet: group.sheet
    })).then(r => ({ r }), e => ({ e }));
    const parallel = await ensureSupaOnStatusPage_();
    const pending = summary.groups.map(group => parallel ? fetchGroup(group) : null);
    for (let i = 0; i < summary.groups.length; i++) {
      const group = summary.groups[i];
      setPageStatus(`กำลังโหลดรายการเคส ${i + 1}/${summary.groups.length} — ${group.book} · ${group.sheet}`, null);
      try {
        const got = await (pending[i] || fetchGroup(group));
        if (got.e) throw got.e;
        const result = got.r;
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
  const ranged = !!(chartRange.fromMs || chartRange.toMs);
  statusMetaEl.textContent = ranged
    ? `ช่วงเวลาที่เลือก: ${summary.total.toLocaleString()} เคส ใน ${summary.groups.length} แท็บ`
    : `พบทั้งหมด ${summary.total.toLocaleString()} เคส ใน ${summary.groups.length} แท็บ`;

  if (summary.groups.length === 0) {
    summaryTable.innerHTML = `<p class="status-page__empty">${ranged ? 'ไม่พบเคสในช่วงเวลาที่เลือก' : 'ไม่พบเคสที่มีสถานะนี้'}</p>`;
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
          <tr class="status-summary__row--clickable" title="คลิกเพื่อเลื่อนไปดูรายการเคสของแท็บนี้"
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

/**
 * คัดเฉพาะเคสที่อยู่ในช่วงเวลาที่เลือกอยู่
 *
 * ไม่ได้กรองช่วงเวลา → คืนทุกแถวเหมือนเดิม
 * ไม่มีคอลัมน์วันที่ → คืนทุกแถวเหมือนกัน เพราะไม่มีทางรู้ว่าเคสอยู่ช่วงไหน
 * ถ้าซ่อนไปเฉยๆ ข้อมูลจะหายไปแบบไม่มีใครรู้ตัว
 */
function filterGroupRows_(group) {
  const rows = group.rows || [];
  if (!(chartRange.fromMs || chartRange.toMs)) return { rows, filtered: false, noDate: false };
  const di = dateIndexOf(group);
  if (di === -1) return { rows, filtered: false, noDate: true };
  return {
    rows: rows.filter(r => inChartRange(dateFromCell(r.cells[di]))),
    filtered: true,
    noDate: false
  };
}

function renderGroup(result, expectedCount) {
  const wrap = document.createElement('div');
  wrap.className = 'status-group';
  wrap.id = anchorIdFor(result.book, result.sheet); // ปลายทางตอนกดชื่อไฟล์/แท็บด้านบน

  const picked = filterGroupRows_(result);
  const rows = picked.rows;
  // กรองช่วงเวลาแล้ว ยอดบนหัวต้องเป็นยอดที่เห็นจริงในตาราง ไม่ใช่ยอดเต็มของแท็บ
  const headCount = picked.filtered ? rows.length : expectedCount;

  let truncatedNote = result.truncated
    ? `<span class="status-group__warn">แสดง ${result.rows.length.toLocaleString()} จาก ${result.matched.toLocaleString()} เคส</span>`
    : '';
  if (picked.filtered) {
    truncatedNote += `<span class="status-group__warn">กรองช่วงเวลา — จากทั้งหมด ${expectedCount.toLocaleString()} เคส</span>`;
  } else if (picked.noDate) {
    truncatedNote += '<span class="status-group__warn">แท็บนี้ไม่มีคอลัมน์วันที่ จึงกรองช่วงเวลาไม่ได้</span>';
  }

  // แสดงเฉพาะคอลัมน์ที่เซิร์ฟเวอร์เลือกมา (วันที่ / EXE ID / Ticket) ที่เหลือดูได้จากปุ่ม "ดูข้อมูล"
  const shown = (result.listColumns && result.listColumns.length)
    ? result.listColumns
    : result.headers.map((h, i) => i);

  wrap.innerHTML = `
    <h4 class="status-group__title">
      ${escapeHtml(result.book)} · ${escapeHtml(result.sheet)}
      <span class="status-group__count">${headCount.toLocaleString()} เคส</span>
      ${truncatedNote}
    </h4>
    <div class="status-group__table-wrap">
      <table class="status-group__table">
        <thead>
          <tr><th>แถวที่</th>${shown.map(i => `<th${isTicketColumn(result.headers[i]) ? ' class="status-group__ticket-col"' : ''}>${escapeHtml(result.headers[i])}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr class="status-group__row--clickable" title="คลิกเพื่อดูข้อมูลทั้งหมดของแถวนี้"
                data-view-book="${escapeHtml(result.book)}" data-view-sheet="${escapeHtml(result.sheet)}" data-view-row="${r.row}">
              <td class="status-group__rownum">${r.row}</td>
              ${shown.map(i => `<td${isTicketColumn(result.headers[i]) ? ' class="status-group__ticket-col"' : ''}>${buildCellHtml(r.cells[i], i, result.headers[i], r.links)}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  if (rows.length === 0) {
    wrap.querySelector('.status-group__table-wrap').innerHTML =
      '<p class="status-page__empty">ไม่มีเคสของแท็บนี้ในช่วงเวลาที่เลือก</p>';
  }

  detailGroups.appendChild(wrap);
  flushPendingScroll_(); // เผื่อมีคนกดรอไว้ตอนกลุ่มนี้ยังโหลดไม่เสร็จ
}

/** วาดรายการเคสด้านล่างใหม่ทั้งหมด ใช้ตอนเปลี่ยนช่วงเวลา */
function redrawGroups_() {
  if (loadedGroups.length === 0) return;
  detailGroups.innerHTML = '';
  loadedGroups.forEach(g => renderGroup(g, g.count));
}

function renderGroupError(group, message) {
  const wrap = document.createElement('div');
  wrap.className = 'status-group';
  wrap.id = anchorIdFor(group.book, group.sheet);
  wrap.innerHTML = `
    <h4 class="status-group__title">${escapeHtml(group.book)} · ${escapeHtml(group.sheet)}</h4>
    <p class="status-page__status status-page__status--error">โหลดรายการเคสไม่สำเร็จ: ${escapeHtml(message)}</p>`;
  detailGroups.appendChild(wrap);
  flushPendingScroll_();
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
  // ดาวน์โหลดตามช่วงเวลาที่เลือกอยู่ ไฟล์จะได้ตรงกับที่เห็นบนหน้าจอ
  const picked = new Map();
  loadedGroups.forEach(g => picked.set(g, filterGroupRows_(g).rows));

  const summaryRows = loadedGroups.map(g => ({
    'ไฟล์': g.book,
    'แท็บ': g.sheet,
    'จำนวนเคส': picked.get(g).length,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'สรุป');

  // ชีทต่อไป: รายการเคสของแต่ละแท็บ
  const usedNames = {};
  loadedGroups.forEach(g => {
    const rows = picked.get(g).map(r => {
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
  if (jump) { scrollToGroup_(jump.dataset.jumpBook, jump.dataset.jumpSheet); return; }

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
const chartTrendTitle = document.getElementById('chartTrendTitle');

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

/**
 * แปลงค่าในช่องวันที่เป็น Date รองรับทุกรูปแบบที่พบจริงในชีท
 * เก็บเวลาด้วยถ้าในค่ามีเวลาติดมา (บางชีทกรอกแค่วันที่ จึงไม่มีเวลา)
 */
function dateFromCell(value) {
  if (value === null || value === undefined) return null;
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return isNaN(value.getTime()) ? null : value;
  }
  const str = value.toString().trim();
  if (!str) return null;

  // เวลาที่ต่อท้าย (ถ้ามี) เช่น "1/10/2026 14:30" หรือ "2026-10-01 14:30:05"
  const timeMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  const hh = timeMatch ? +timeMatch[1] : 0;
  const mi = timeMatch ? +timeMatch[2] : 0;
  const ss = timeMatch && timeMatch[3] ? +timeMatch[3] : 0;

  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);             // วว/ดด/ปปปป
  if (m) return mkDate(normYear(+m[3]), +m[2], +m[1], hh, mi, ss);
  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);                    // ปปปป-ดด-วว
  if (m) return mkDate(normYear(+m[1]), +m[2], +m[3], hh, mi, ss);
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);                    // วว-ดด-ปปปป
  if (m) return mkDate(normYear(+m[3]), +m[2], +m[1], hh, mi, ss);

  // ตัวเลขลำดับวันของ Google Sheets (เช่น 45085) จำกัดช่วงปี 2000-2100
  // ไม่งั้นเลขอย่าง Level 35 หรือ UID จะถูกตีความเป็นวันที่ไปด้วย
  // ส่วนทศนิยมคือเวลาในวันนั้น (0.5 = เที่ยงวัน)
  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str);
    if (serial >= 36526 && serial <= 73415) {
      const days = Math.floor(serial);
      const msInDay = Math.round((serial - days) * 86400000);
      const base = new Date(Date.UTC(1899, 11, 30) + days * 86400000 + msInDay);
      if (!isNaN(base.getTime())) {
        return mkDate(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(),
                      base.getUTCHours(), base.getUTCMinutes(), base.getUTCSeconds());
      }
    }
  }
  return null;
}
function mkDate(y, mo, d, hh, mi, ss) {
  if (!y || !mo || !d || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d, hh || 0, mi || 0, ss || 0);
  return isNaN(date.getTime()) ? null : date;
}
function normYear(y) { return y > 2400 ? y - 543 : y; } // บางชีทกรอกเป็น พ.ศ.

const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const pad2 = n => String(n).padStart(2, '0');

/**
 * จัดเคสลงช่องเวลา ตามความละเอียดที่เหมาะกับช่วงที่เลือก
 * เลือกดูรายชั่วโมงก็ต้องแบ่งเป็นชั่วโมง ไม่ใช่ยังแบ่งเป็นเดือนเหมือนเดิม ไม่งั้นจะเหลือจุดเดียว
 */
function bucketKey(date, unit) {
  if (unit === 'hour') return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}`;
  if (unit === 'day')  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}
function bucketLabel(key, unit) {
  if (unit === 'hour') {
    const [datePart, hour] = key.split(' ');
    const [, mo, d] = datePart.split('-');
    return `${+d} ${THAI_MONTHS[+mo - 1]} ${hour}:00`;
  }
  if (unit === 'day') {
    const [y, mo, d] = key.split('-');
    return `${+d} ${THAI_MONTHS[+mo - 1]} ${y}`;
  }
  const [y, mo] = key.split('-');
  return `${THAI_MONTHS[+mo - 1]} ${y}`;
}
/** ไล่สร้างช่องเวลาต่อเนื่องจากต้นถึงปลาย เพื่อให้ช่วงที่ไม่มีเคสยังเห็นเป็นศูนย์ ไม่ถูกบีบหาย */
function stepBucket(date, unit) {
  const d = new Date(date);
  if (unit === 'hour') d.setHours(d.getHours() + 1);
  else if (unit === 'day') d.setDate(d.getDate() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}
function floorToBucket(date, unit) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  if (unit === 'day' || unit === 'month') d.setHours(0);
  if (unit === 'month') d.setDate(1);
  return d;
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

/* ===== กดชื่อไฟล์/แท็บ แล้วเลื่อนไปที่กลุ่มนั้นใน "รายการเคสทั้งหมด" ด้านล่าง ===== */

// ชื่อไฟล์และแท็บเป็นภาษาไทยและมีอักขระพิเศษ ใช้เป็น id ตรงๆ ไม่ได้
// จึงจับคู่ชื่อกับหมายเลขลำดับไว้ แล้วใช้หมายเลขนั้นเป็น id ของกล่องแต่ละกลุ่ม
const groupAnchors = new Map();
function anchorIdFor(book, sheet) {
  const key = `${book}\u0000${sheet}`;
  if (!groupAnchors.has(key)) groupAnchors.set(key, `grp-${groupAnchors.size}`);
  return groupAnchors.get(key);
}

// ถ้าผู้ใช้กดก่อนที่กลุ่มนั้นจะโหลดเสร็จ ให้จำไว้ แล้วเลื่อนไปให้เองทันทีที่โหลดมาถึง
let pendingScrollTo = null;

function scrollToGroup_(book, sheet) {
  const el = document.getElementById(anchorIdFor(book, sheet));
  if (!el) {
    // ยังโหลดไม่ถึงกลุ่มนี้ จำไว้ก่อน แล้วบอกผู้ใช้ว่ากำลังรอ
    pendingScrollTo = { book, sheet };
    setPageStatus(`กำลังโหลด ${book} · ${sheet} ... จะเลื่อนไปให้เมื่อโหลดเสร็จ`, null);
    return;
  }
  pendingScrollTo = null;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // กะพริบสั้นๆ ให้รู้ว่ามาถึงกลุ่มไหนแล้ว ไม่งั้นเลื่อนไปแล้วงงว่าอยู่ตรงไหน
  //
  // ต้องล้างเอฟเฟกต์ของ "ทุกกลุ่ม" ก่อน ไม่ใช่แค่กลุ่มปลายทาง
  // ไม่งั้นกลุ่มที่กดไว้ก่อนหน้าจะยังมีกรอบค้างอยู่ กลายเป็นเห็นสว่าง 2 ที่พร้อมกันจนสับสน
  detailGroups.querySelectorAll('.status-group--flash')
    .forEach(g => g.classList.remove('status-group--flash'));
  void el.offsetWidth; // บังคับให้เบราว์เซอร์เริ่มอนิเมชันใหม่
  el.classList.add('status-group--flash');
}

/** เรียกหลัง render กลุ่มใหม่ เผื่อมีคนกดรอไว้ก่อนหน้านี้ */
function flushPendingScroll_() {
  if (!pendingScrollTo) return;
  const el = document.getElementById(anchorIdFor(pendingScrollTo.book, pendingScrollTo.sheet));
  if (!el) return;
  const target = pendingScrollTo;
  pendingScrollTo = null;
  setPageStatus('', null);
  scrollToGroup_(target.book, target.sheet);
}

function bindBarHover(root) {
  root.querySelectorAll('.cbar').forEach(g => {
    const canJump = !!g.dataset.book;
    const show = (e) => showChartTip(e, `
      <div class="chart-tip__name">${escapeHtml(g.dataset.label)}</div>
      <div class="chart-tip__value">${(+g.dataset.value).toLocaleString()} เคส
        <span class="chart-tip__muted">(${g.dataset.pct}%)</span></div>
      ${canJump ? '<div class="chart-tip__hint">คลิกเพื่อเลื่อนไปดูรายการเคสของแท็บนี้</div>' : ''}`);

    if (canJump) {
      g.addEventListener('click', () => scrollToGroup_(g.dataset.book, g.dataset.sheet));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToGroup_(g.dataset.book, g.dataset.sheet); }
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
  const unit = chartRange.unit || 'month';
  const tally = {};
  let parsed = 0, unparsed = 0, withTime = 0;
  let minDate = null, maxDate = null;

  groups.forEach(g => {
    const dateIndex = (g.headers || []).findIndex(h =>
      /วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test((h || '').toString().trim()));
    if (dateIndex === -1) { unparsed += (g.rows || []).length; return; }
    (g.rows || []).forEach(r => {
      const d = dateFromCell(r.cells[dateIndex]);
      if (!d) { unparsed++; return; }
      if (filtering && !inChartRange(d)) return; // อยู่นอกช่วงเวลาที่เลือก
      if (d.getHours() || d.getMinutes()) withTime++;
      const key = bucketKey(d, unit);
      tally[key] = (tally[key] || 0) + 1;
      parsed++;
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    });
  });

  if (parsed === 0) {
    chartTrendCard.hidden = true;
    return;
  }
  chartTrendCard.hidden = false;

  // ไล่สร้างช่องเวลาต่อเนื่องให้ครบ ช่วงที่ไม่มีเคสจะเป็นศูนย์ ไม่ถูกบีบหายจนแนวโน้มผิดเพี้ยน
  // ถ้าเลือกช่วงเวลาไว้ ให้ยึดตามช่วงที่เลือก ไม่ใช่ตามวันแรก-วันสุดท้ายของข้อมูล
  const startAt = floorToBucket(filtering && chartRange.fromMs ? new Date(chartRange.fromMs) : minDate, unit);
  const endAt = floorToBucket(filtering && chartRange.toMs ? new Date(chartRange.toMs) : maxDate, unit);
  const all = [];
  const MAX_POINTS = 400; // กันกรณีเลือกช่วงกว้างมากจนจุดเยอะเกินจะวาดไหว
  for (let cur = startAt; cur <= endAt && all.length < MAX_POINTS; cur = stepBucket(cur, unit)) {
    const k = bucketKey(cur, unit);
    all.push({ key: k, value: tally[k] || 0 });
  }

  // เลือกดูรายชั่วโมงแต่ข้อมูลไม่มีเวลาติดมา ต้องบอกให้รู้ ไม่งั้นจะงงว่าทำไมกองอยู่ชั่วโมงเดียว
  const noTimeWarning = (unit === 'hour' && withTime === 0)
    ? ' · คอลัมน์วันที่ในชีทไม่ได้เก็บเวลา ทุกเคสจึงถูกนับไว้ที่ 00:00 ของวันนั้น'
    : '';

  // หัวข้อต้องตรงกับหน่วยที่แบ่งแกนจริง ไม่งั้นเลือกดูรายชั่วโมงแต่หัวข้อยังเขียนว่า "ตามเดือน"
  if (chartTrendTitle) {
    chartTrendTitle.textContent = unit === 'hour' ? 'เคสเข้าตามชั่วโมง'
      : unit === 'day' ? 'เคสเข้าตามวัน' : 'เคสเข้าตามเดือน';
  }

  chartTrendSub.textContent = `${parsed.toLocaleString()} เคสที่ระบุวันที่ได้`
    + (unparsed > 0 ? ` · อีก ${unparsed.toLocaleString()} เคสไม่มีวันที่` : '')
    + noTimeWarning;

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
  const LABEL_W = unit === 'month' ? 62 : 76; // ป้ายวันที่/ชั่วโมงยาวกว่าป้ายเดือน
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
    `<text class="cline__xtick" x="${x(i).toFixed(1)}" y="${h - 10}">${bucketLabel(all[i].key, unit)}</text>`
  ).join('');

  // จุดสูงสุดติดป้ายไว้จุดเดียว ไม่ใส่ตัวเลขทุกจุด
  const peak = all.reduce((best, p, i) => p.value > all[best].value ? i : best, 0);

  const hits = all.map((p, i) => `
    <g class="cpt" tabindex="0" data-label="${escapeHtml(bucketLabel(p.key, unit))}" data-value="${p.value}">
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
  scrollToGroup_(row.dataset.jumpBook, row.dataset.jumpSheet);
});


/* ===== เลือกช่วงเวลาที่จะแสดงในกราฟ =====
 *
 * กรองจาก "เคสที่โหลดมาแล้ว" เท่านั้น เพราะวันที่ของแต่ละเคสอยู่ในตัวข้อมูล
 * ไม่ได้อยู่ในสรุปที่เซิร์ฟเวอร์ส่งมา
 */

const chartFilterNote = document.getElementById('chartFilterNote');
const timePicker = document.getElementById('timePicker');
const timePickerBtn = document.getElementById('timePickerBtn');
const timePickerLabel = document.getElementById('timePickerLabel');
const timePickerPanel = document.getElementById('timePickerPanel');
const timeFromInput = document.getElementById('timeFrom');
const timeToInput = document.getElementById('timeTo');
const timeApplyBtn = document.getElementById('timeApply');
const timeErr = document.getElementById('timeErr');
const timeSearch = document.getElementById('timeSearch');
const timeQuickList = document.getElementById('timeQuickList');

/**
 * ช่วงเวลาที่กำลังแสดงอยู่
 *  fromMs / toMs = ขอบเขตเวลาจริง (0 = ไม่จำกัด)
 *  unit = ความละเอียดของแกนนอน ต้องเหมาะกับความยาวช่วงที่เลือก
 *         เลือกดู 6 ชั่วโมงแล้วยังแบ่งแกนเป็นเดือน กราฟจะเหลือจุดเดียว อ่านอะไรไม่ได้
 */
let chartRange = { fromMs: 0, toMs: 0, unit: 'month' };
let lastSummary = null; // สรุปจากเซิร์ฟเวอร์ของสถานะที่กำลังดู

/* ===== ตัวเลือกช่วงเวลา =====
 * เก็บเป็น "สูตร" แบบข้อความ (now, now-2h, now-1M/M) ไม่ใช่เวลาตายตัว
 * เพราะต้องคิดใหม่ทุกครั้งที่กด ไม่งั้นเปิดหน้าทิ้งไว้ข้ามวันแล้ว "24 ชั่วโมงล่าสุด" จะเพี้ยน
 */
const QUICK_RANGES = [
  { label: 'ทั้งหมด', from: '', to: '' },
  { label: '5 นาทีล่าสุด', from: 'now-5m', to: 'now' },
  { label: '15 นาทีล่าสุด', from: 'now-15m', to: 'now' },
  { label: '30 นาทีล่าสุด', from: 'now-30m', to: 'now' },
  { label: '1 ชั่วโมงล่าสุด', from: 'now-1h', to: 'now' },
  { label: '3 ชั่วโมงล่าสุด', from: 'now-3h', to: 'now' },
  { label: '6 ชั่วโมงล่าสุด', from: 'now-6h', to: 'now' },
  { label: '12 ชั่วโมงล่าสุด', from: 'now-12h', to: 'now' },
  { label: '24 ชั่วโมงล่าสุด', from: 'now-24h', to: 'now' },
  { label: '2 วันล่าสุด', from: 'now-2d', to: 'now' },
  { label: '7 วันล่าสุด', from: 'now-7d', to: 'now' },
  { label: '30 วันล่าสุด', from: 'now-30d', to: 'now' },
  { label: '90 วันล่าสุด', from: 'now-90d', to: 'now' },
  { label: '6 เดือนล่าสุด', from: 'now-6M', to: 'now' },
  { label: '1 ปีล่าสุด', from: 'now-1y', to: 'now' },
  { label: '2 ปีล่าสุด', from: 'now-2y', to: 'now' },
  { label: '5 ปีล่าสุด', from: 'now-5y', to: 'now' },
  { label: 'เมื่อวาน', from: 'now-1d/d', to: 'now-1d/d' },
  { label: 'เมื่อวานซืน', from: 'now-2d/d', to: 'now-2d/d' },
  { label: 'วันนี้ของสัปดาห์ที่แล้ว', from: 'now-7d/d', to: 'now-7d/d' },
  { label: 'สัปดาห์ที่แล้ว', from: 'now-1w/w', to: 'now-1w/w' },
  { label: 'เดือนที่แล้ว', from: 'now-1M/M', to: 'now-1M/M' },
  { label: 'ปีที่แล้ว', from: 'now-1y/y', to: 'now-1y/y' },
  { label: 'วันนี้', from: 'now/d', to: 'now/d' },
  { label: 'วันนี้ถึงตอนนี้', from: 'now/d', to: 'now' },
  { label: 'สัปดาห์นี้', from: 'now/w', to: 'now/w' },
  { label: 'สัปดาห์นี้ถึงตอนนี้', from: 'now/w', to: 'now' },
  { label: 'เดือนนี้', from: 'now/M', to: 'now/M' },
  { label: 'เดือนนี้ถึงตอนนี้', from: 'now/M', to: 'now' },
  { label: 'ปีนี้', from: 'now/y', to: 'now/y' },
  { label: 'ปีนี้ถึงตอนนี้', from: 'now/y', to: 'now' }
];

const UNIT_MS = { m: 60000, h: 3600000, d: 86400000, w: 604800000 };

/**
 * แปลงสูตรเวลาเป็นเวลาจริง
 * รองรับ: now | now-<n><m|h|d|w|M|y> | ต่อท้ายด้วย /<หน่วย> เพื่อปัดเป็นต้น/ท้ายช่วง
 *         หรือวันที่เต็ม 2026-10-01 หรือ 2026-10-01 08:30[:00]
 *
 * @param {boolean} isEnd true = ปลายช่วง (ปัดขึ้นเป็นท้ายหน่วย) / false = ต้นช่วง
 * @return {number|null} เวลาเป็น ms หรือ null ถ้าอ่านไม่ออก
 */
function parseTimeExpr_(raw, isEnd) {
  const text = (raw || '').toString().trim();
  if (!text) return null;

  if (/^now/i.test(text)) {
    const m = text.match(/^now(?:\s*-\s*(\d+)\s*([mhdwMy]))?(?:\s*\/\s*([mhdwMy]))?$/);
    if (!m) return null;
    let date = new Date();
    if (m[1]) {
      const n = parseInt(m[1], 10);
      const unit = m[2];
      if (unit === 'M') date = shiftMonths_(date, -n);
      else if (unit === 'y') date = shiftMonths_(date, -n * 12);
      else date = new Date(date.getTime() - n * UNIT_MS[unit]);
    }
    return m[3] ? snapTo_(date, m[3], isEnd).getTime() : date.getTime();
  }

  // วันที่เต็ม — ไม่ใส่เวลามา ต้นช่วงคือ 00:00:00 ปลายช่วงคือ 23:59:59
  const d = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!d) return null;
  const hasTime = d[4] !== undefined;
  const date = new Date(
    +d[1], +d[2] - 1, +d[3],
    hasTime ? +d[4] : (isEnd ? 23 : 0),
    hasTime ? +d[5] : (isEnd ? 59 : 0),
    hasTime ? (d[6] ? +d[6] : 0) : (isEnd ? 59 : 0)
  );
  return isNaN(date.getTime()) ? null : date.getTime();
}

/** ถอยเดือนโดยไม่ให้วันที่ 31 เด้งข้ามเดือน (31 มี.ค. ถอย 1 เดือน = 28 ก.พ.) */
function shiftMonths_(date, delta) {
  const day = date.getDate();
  const out = new Date(date);
  out.setDate(1);
  out.setMonth(out.getMonth() + delta);
  const lastDay = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
  out.setDate(Math.min(day, lastDay));
  return out;
}

/** ปัดเวลาเป็นต้นหน่วย (isEnd = false) หรือท้ายหน่วย (isEnd = true) */
function snapTo_(date, unit, isEnd) {
  const d = new Date(date);
  if (unit === 'm') { d.setSeconds(isEnd ? 59 : 0, isEnd ? 999 : 0); return d; }
  d.setSeconds(isEnd ? 59 : 0, isEnd ? 999 : 0);
  if (unit === 'h') { d.setMinutes(isEnd ? 59 : 0); return d; }
  d.setMinutes(isEnd ? 59 : 0);
  if (unit === 'd') { d.setHours(isEnd ? 23 : 0); return d; }
  if (unit === 'w') {
    // สัปดาห์เริ่มวันจันทร์ ตามที่คนไทยนับกัน
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() + (isEnd ? 6 - dow : -dow));
    d.setHours(isEnd ? 23 : 0);
    return d;
  }
  d.setHours(isEnd ? 23 : 0);
  if (unit === 'M') { d.setDate(isEnd ? new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() : 1); return d; }
  if (unit === 'y') { d.setMonth(isEnd ? 11 : 0); d.setDate(isEnd ? 31 : 1); return d; }
  return d;
}

/** ช่วงยาวแค่ไหน ควรแบ่งแกนนอนเป็นหน่วยอะไรถึงจะอ่านได้ */
function unitForSpan_(fromMs, toMs) {
  if (!fromMs || !toMs) return 'month';
  const days = (toMs - fromMs) / 86400000;
  if (days <= 2) return 'hour';
  if (days <= 62) return 'day';
  return 'month';
}

/** เคสนี้อยู่ในช่วงเวลาที่เลือกไหม */
function inChartRange(date) {
  if (!date) return false;
  const ms = date.getTime();
  if (chartRange.fromMs && ms < chartRange.fromMs) return false;
  if (chartRange.toMs && ms > chartRange.toMs) return false;
  return true;
}

/** หาตำแหน่งคอลัมน์วันที่ของกลุ่มนี้ */
function dateIndexOf(group) {
  return (group.headers || []).findIndex(h =>
    /วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test((h || '').toString().trim()));
}

/**
 * วาดกราฟใหม่ทั้ง 2 ตัวตามช่วงเวลาที่เลือกอยู่
 *
 * ตอนไม่กรอง กราฟแท่งใช้ยอดจากสรุปของเซิร์ฟเวอร์ ซึ่งเป็นยอดจริงครบทุกเคส
 * พอกรองช่วงเวลา ต้องนับใหม่จากเคสที่โหลดมา ซึ่งอาจไม่ครบถ้าแท็บนั้นมีเกินขีดจำกัด
 * จึงต้องขึ้นข้อความบอกให้ชัด ไม่ปล่อยให้เข้าใจผิดว่าเป็นยอดจริงทั้งหมด
 */
function applyChartRange() {
  if (!lastSummary) return;
  const filtering = !!(chartRange.fromMs || chartRange.toMs);

  redrawGroups_(); // รายการเคสด้านล่างต้องตรงกับช่วงเวลาที่เลือกเสมอ

  if (!filtering) {
    chartFilterNote.hidden = true;
    renderChartByTab(lastSummary.groups, lastSummary.total);
    renderChartTrend(loadedGroups);
    renderSummary(lastSummary);
    return;
  }

  const groups = [];
  let total = 0;
  let noDate = 0;
  loadedGroups.forEach(g => {
    const picked = filterGroupRows_(g);
    if (picked.noDate) noDate += picked.rows.length;
    const count = picked.rows.length;
    if (count > 0) { groups.push({ book: g.book, sheet: g.sheet, count }); total += count; }
  });
  groups.sort((a, b) => b.count - a.count);

  // ตารางสรุปด้านบนต้องเป็นยอดเดียวกับรายการเคสด้านล่าง ไม่งั้นกดแล้วเลขไม่ตรงกัน
  renderSummary({ total, groups });

  const truncated = loadedGroups.some(g => g.truncated);
  chartFilterNote.textContent =
    'กำลังกรองช่วงเวลา — ทั้งกราฟ ตารางสรุป และรายการเคสด้านล่าง แสดงเฉพาะเคสในช่วงนี้ (นับจากเคสที่โหลดมาแล้วเท่านั้น)'
    + (truncated ? ' (บางแท็บมีเคสเกินที่ระบบโหลดมาได้ ยอดจริงอาจมากกว่านี้)' : '')
    + (noDate > 0 ? ` · มี ${noDate.toLocaleString()} เคสในแท็บที่ไม่มีคอลัมน์วันที่ จึงกรองไม่ได้และยังแสดงทั้งหมด` : '');
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

/** นำสูตรช่วงเวลาไปใช้จริง */
function setRangeFromExpr_(fromExpr, toExpr, label) {
  if (!fromExpr && !toExpr) {
    chartRange = { fromMs: 0, toMs: 0, unit: 'month' };
    timePickerLabel.textContent = 'ช่วงเวลา'; // ไม่ได้กรองอยู่ ปุ่มแสดงชื่อฟังก์ชันไว้เฉยๆ
    applyChartRange();
    return true;
  }
  const fromMs = fromExpr ? parseTimeExpr_(fromExpr, false) : 0;
  const toMs = toExpr ? parseTimeExpr_(toExpr, true) : 0;
  if ((fromExpr && fromMs === null) || (toExpr && toMs === null)) return false;
  if (fromMs && toMs && fromMs > toMs) return false;

  chartRange = { fromMs: fromMs || 0, toMs: toMs || 0, unit: unitForSpan_(fromMs, toMs || Date.now()) };
  timePickerLabel.textContent = label || `${fromExpr || 'เริ่มต้น'} ถึง ${toExpr || 'ตอนนี้'}`;
  applyChartRange();
  return true;
}

/** 2026-10-01 -> 1 ต.ค. 2026 */
function formatDateShort_(value) {
  const m = (value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return value;
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${+m[3]} ${months[+m[2] - 1]} ${m[1]}`;
}

/** กลับไปเป็น "ทั้งหมด" ใช้ตอนเปลี่ยนสถานะที่ดูอยู่ */
function resetTimePicker_() {
  chartRange = { fromMs: 0, toMs: 0, unit: 'month' };
  if (timePickerLabel) timePickerLabel.textContent = 'ช่วงเวลา';
  if (timeFromInput) timeFromInput.value = '';
  if (timeToInput) timeToInput.value = '';
  if (timeErr) timeErr.hidden = true;
  closeTimePicker_();
}

/**
 * อ่านช่วงเวลาที่ผู้ใช้พิมพ์เองในช่องค้นหา เช่น "10 นาที" "3 วัน" "8 ชม" "2 สัปดาห์" "5 เดือน"
 * รองรับตัวย่อภาษาอังกฤษด้วย (10m, 3d, 2w, 5M, 1y) เผื่อคนพิมพ์เร็ว
 *
 * มีไว้เพราะรายการสำเร็จรูปมีแค่ค่าที่ใช้บ่อย ถ้าอยากดู 10 นาที หรือ 45 วัน จะไม่มีให้เลือก
 * @return {Object|null} { from, to, label } หรือ null ถ้าอ่านไม่ออก
 */
function parseTypedDuration_(text) {
  const m = (text || '').trim().match(/^(\d{1,4})\s*(นาที|นาธี|ชั่วโมง|ชม\.?|วัน|สัปดาห์|อาทิตย์|เดือน|ปี|m|min|h|hr|d|w|mo|y)?\s*(ล่าสุด)?$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!n) return null;
  const raw = (m[2] || '').toLowerCase();

  let code = '', word = '';
  if (/^(นาที|นาธี|m|min)$/.test(raw)) { code = 'm'; word = 'นาที'; }
  else if (/^(ชั่วโมง|ชม\.?|h|hr)$/.test(raw)) { code = 'h'; word = 'ชั่วโมง'; }
  else if (/^(วัน|d)$/.test(raw)) { code = 'd'; word = 'วัน'; }
  else if (/^(สัปดาห์|อาทิตย์|w)$/.test(raw)) { code = 'w'; word = 'สัปดาห์'; }
  else if (/^(เดือน|mo)$/.test(raw)) { code = 'M'; word = 'เดือน'; }
  else if (/^(ปี|y)$/.test(raw)) { code = 'y'; word = 'ปี'; }
  else return null; // พิมพ์มาแต่ตัวเลข ยังไม่รู้ว่าหน่วยอะไร

  return { from: `now-${n}${code}`, to: 'now', label: `${n} ${word}ล่าสุด` };
}

function renderQuickList_() {
  const raw = (timeSearch.value || '').trim();
  const q = raw.toLowerCase();
  const items = QUICK_RANGES.filter(r => !q || r.label.toLowerCase().includes(q));

  // พิมพ์เป็นช่วงเวลาเอง เช่น "10 นาที" ให้ขึ้นเป็นตัวเลือกแรก (ถ้ายังไม่มีในรายการสำเร็จรูป)
  const typed = parseTypedDuration_(raw);
  if (typed && !items.some(r => r.label === typed.label)) items.unshift(typed);

  if (items.length === 0) {
    timeQuickList.innerHTML = '<p class="timepicker__empty">ไม่พบช่วงเวลาที่ค้นหา — พิมพ์เป็นช่วงเวลาได้ เช่น "10 นาที" หรือ "45 วัน"</p>';
    return;
  }
  timeQuickList.innerHTML = items.map(r => `
    <button type="button" class="timepicker__quick-btn${r === typed ? ' timepicker__quick-btn--typed' : ''}"
            data-from="${escapeHtml(r.from)}" data-to="${escapeHtml(r.to)}"
            data-label="${escapeHtml(r.label)}">${escapeHtml(r.label)}${r === typed ? ' <span class="timepicker__typed-tag">พิมพ์เอง</span>' : ''}</button>`).join('');
}

function openTimePicker_() {
  timePickerPanel.hidden = false;
  timePickerBtn.setAttribute('aria-expanded', 'true');
  timeSearch.value = '';
  renderQuickList_();
  timeQuickList.scrollTop = 0; // เปิดมาต้องเห็นรายการบนสุดเสมอ ไม่ใช่ค้างที่เดิมจากครั้งก่อน
}

function closeTimePicker_() {
  if (!timePickerPanel) return;
  timePickerPanel.hidden = true;
  timePickerBtn.setAttribute('aria-expanded', 'false');
}

timePickerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (timePickerPanel.hidden) openTimePicker_(); else closeTimePicker_();
});

timeQuickList.addEventListener('click', (e) => {
  const btn = e.target.closest('.timepicker__quick-btn');
  if (!btn) return;
  // เลือกจากรายการสำเร็จรูปแล้ว ช่องปฏิทินต้องว่าง ไม่งั้นจะงงว่าตกลงใช้อันไหน
  timeFromInput.value = '';
  timeToInput.value = '';
  timeErr.hidden = true;
  setRangeFromExpr_(btn.dataset.from, btn.dataset.to, btn.dataset.label);
  closeTimePicker_();
});

timeSearch.addEventListener('input', renderQuickList_);

// พิมพ์แล้วกด Enter = ใช้ตัวเลือกแรกในรายการเลย ไม่ต้องเอามือไปคลิก
timeSearch.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const first = timeQuickList.querySelector('.timepicker__quick-btn');
  if (first) first.click();
});

function applyCustomRange_() {
  const from = timeFromInput.value;
  const to = timeToInput.value;
  if (!from && !to) {
    timeErr.textContent = 'กรุณาเลือกวันที่อย่างน้อย 1 ช่อง';
    timeErr.hidden = false;
    return;
  }
  const label = from && to
    ? `${formatDateShort_(from)} – ${formatDateShort_(to)}`
    : (from ? `ตั้งแต่ ${formatDateShort_(from)}` : `ถึง ${formatDateShort_(to)}`);
  const ok = setRangeFromExpr_(from, to, label);
  if (!ok) {
    timeErr.textContent = 'วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด';
    timeErr.hidden = false;
    return;
  }
  timeErr.hidden = true;
  closeTimePicker_();
}

timeApplyBtn.addEventListener('click', applyCustomRange_);
[timeFromInput, timeToInput].forEach(el => {
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyCustomRange_(); });
});

// กดที่อื่นนอกกล่องให้ปิด และกด Esc ก็ปิด — กล่องนี้บังกราฟอยู่ ต้องปิดได้ง่าย
document.addEventListener('click', (e) => {
  if (!timePickerPanel.hidden && !timePicker.contains(e.target)) closeTimePicker_();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTimePicker_(); });

// เริ่มทำงาน — ต้องอยู่ท้ายสุดของไฟล์ เพราะฟังก์ชันและตัวแปรด้านบนต้องถูกประกาศครบก่อน
init();
