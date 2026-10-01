/* ===== หน้ารายละเอียดตามสถานะ (เปิดจากการคลิกสถานะใน Dashboard หน้าหลัก) =====
 *
 * หน้านี้แยกออกมาเป็นหน้าเว็บของตัวเอง เพื่อให้เปิดในแท็บใหม่ได้ และเปิดค้างไว้หลายสถานะพร้อมกันได้
 * ใช้ตั๋วเข้าใช้งานตัวเดียวกับหน้าหลัก (เก็บอยู่ใน localStorage ซึ่งใช้ร่วมกันทุกแท็บของเว็บเดียวกัน)
 */

const JSONP_TIMEOUT_MS = 60000; // สถานะที่มีเป็นพันเคสต้องไล่อ่านหลายแท็บ จึงเผื่อเวลาไว้มากกว่าหน้าหลัก
let jsonpCounter = 0;

const statusNameEl = document.getElementById('statusName');
const statusMetaEl = document.getElementById('statusMeta');
const pageStatusEl = document.getElementById('pageStatus');
const summarySection = document.getElementById('summarySection');
const summaryTable = document.getElementById('summaryTable');
const detailSection = document.getElementById('detailSection');
const detailGroups = document.getElementById('detailGroups');
const downloadBtn = document.getElementById('downloadBtn');

let targetStatus = '';
let loadedGroups = []; // { book, sheet, count, headers, rows } สะสมไว้ใช้ตอนดาวน์โหลด Excel

/* ===== เครื่องมือกลาง (สำเนาแบบย่อจาก script.js ให้หน้านี้ทำงานได้ด้วยตัวเอง) ===== */

function jsonpRequest(url) {
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
  pageStatusEl.textContent = message;
  pageStatusEl.className = 'status-page__status' + (type ? ` status-page__status--${type}` : '');
}

/* ===== โหลดข้อมูล ===== */

async function init() {
  const params = new URLSearchParams(window.location.search);
  targetStatus = (params.get('status') || '').trim();

  if (!targetStatus) {
    statusNameEl.textContent = '—';
    statusMetaEl.textContent = '';
    setPageStatus('ไม่ได้ระบุสถานะที่ต้องการดู กรุณากลับไปคลิกจากหน้าหลัก', 'error');
    return;
  }

  statusNameEl.textContent = targetStatus;
  document.title = `สถานะ: ${targetStatus} · Data Search and Recording System`;

  if (!localStorage.getItem('sheetSearchToken')) {
    statusMetaEl.textContent = '';
    setPageStatus('ยังไม่ได้เข้าสู่ระบบ กรุณากลับไปเข้าสู่ระบบที่หน้าหลักก่อน แล้วคลิกสถานะใหม่อีกครั้ง', 'error');
    return;
  }

  try {
    setPageStatus('กำลังค้นหาว่าสถานะนี้อยู่ที่ไฟล์ไหนบ้าง...', null);
    const summary = await jsonpRequest(apiUrl({ action: 'statusSummary', status: targetStatus }));
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
          action: 'statusRows', status: targetStatus, book: group.book, sheet: group.sheet
        }));
        if (!result.ok) throw new Error(result.error || 'โหลดไม่สำเร็จ');
        loadedGroups.push(Object.assign({ count: group.count }, result));
        renderGroup(result, group.count);
      } catch (err) {
        renderGroupError(group, err.message);
      }
    }

    setPageStatus('', null);
    downloadBtn.hidden = false;
  } catch (err) {
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

  wrap.innerHTML = `
    <h4 class="status-group__title">
      ${escapeHtml(result.book)} · ${escapeHtml(result.sheet)}
      <span class="status-group__count">${expectedCount.toLocaleString()} เคส</span>
      ${truncatedNote}
    </h4>
    <div class="status-group__table-wrap">
      <table class="status-group__table">
        <thead>
          <tr><th>แถวที่</th>${result.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${result.rows.map(r => `
            <tr>
              <td class="status-group__rownum">${r.row}</td>
              ${r.cells.map(c => `<td>${escapeHtml(c)}</td>`).join('')}
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

init();
