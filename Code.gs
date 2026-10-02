// ===== รายชื่อไฟล์ Google Sheet ที่ระบบนี้รู้จัก =====
// เก็บไว้ใน Script Properties (ไม่ใช่ค่าคงที่ในโค้ดอีกต่อไป) เพื่อให้เพิ่ม/ลบไฟล์ได้จากหน้าเว็บ
// โดยไม่ต้องแก้โค้ดหรือ Deploy ใหม่ทุกครั้ง — ใช้ค่าเริ่มต้นด้านล่างแค่ครั้งแรกที่รันเท่านั้น
const SPREADSHEETS_PROPERTY = 'SPREADSHEETS_JSON';
const REMOVED_BOOKS_PROPERTY = 'REMOVED_BOOKS_JSON'; // ถังขยะของไฟล์ที่ถูกเอาออกจากระบบ (กู้คืนได้)
const ACTIVITY_LOG_PROPERTY = 'ACTIVITY_LOG_JSON'; // ประวัติการแก้ไขล่าสุด (วันเวลา + ชื่อผู้แก้ไข)
const ACTIVITY_LOG_MAX = 50; // เก็บประวัติล่าสุดไว้กี่รายการ (เก่ากว่านี้จะถูกลบทิ้ง)
const DEFAULT_SPREADSHEETS = {
  'CS : TOSM 2026': '1LDHINffP0_p9QlMppzzH-ivgod8tybYhWtuyqllNefM',
  'Z4 CS-GP 26': '1byqYMHA67jAoZfr2nSpD3Ll0aQUXB_X3NsT1ydlByh4',
  'Z4/GE ปัญหาเติมเงิน': '1zuuFFgyDHHlSlb5H51u3ZtAPgAWTtP3GqFNCazj4Qe0',
};

const CACHE_SECONDS = 300;
const HIDDEN_SHEETS = ['ชีต12']; // เพิ่มชื่อชีตที่ไม่ต้องการให้ขึ้นเมนูได้ที่นี่ (ใช้ร่วมกันทุกไฟล์)
const ACCESS_KEY_PROPERTY = 'DASHBOARD_ACCESS_KEY';
const ALLOWED_EMAILS_PROPERTY = 'ALLOWED_EMAILS'; // รายชื่ออีเมลที่อนุญาตให้เข้าใช้งาน คั่นด้วย comma
// รายชื่ออีเมล "ผู้ดูแลระบบ" คั่นด้วย comma — เห็นหน้าตรวจสอบการใช้งานของทุกคนได้
// ต้องอยู่ใน ALLOWED_EMAILS ด้วย (ผู้ดูแลก็ต้องมีสิทธิ์เข้าใช้งานปกติก่อน)
// ถ้าไม่ได้ตั้งค่าไว้ จะไม่มีใครเป็นผู้ดูแลเลย (ปลอดภัยไว้ก่อน ดีกว่าเผลอให้สิทธิ์ทุกคน)
const ADMIN_EMAILS_PROPERTY = 'ADMIN_EMAILS';
const GOOGLE_CLIENT_ID_PROPERTY = 'GOOGLE_CLIENT_ID'; // OAuth Client ID จาก Google Cloud Console (ใช้ตรวจสอบ token ตอนล็อกอินด้วย Gmail จริง)
const SEARCH_RESULT_LIMIT = 20000; // จำกัดจำนวนผลลัพธ์การค้นหาต่อครั้ง (กันโหลดหนักเกินไปถ้าแท็บใหญ่มากๆ) — ปรับเพิ่มได้ตามต้องการ
const BOOK_SEP = '::'; // ตัวคั่นระหว่างชื่อไฟล์กับชื่อแท็บ ใช้ทำ cache key ภายใน
const TRASH_SHEET_NAME = '_Trash'; // แท็บซ่อนสำหรับเก็บสำเนาข้อมูลที่ถูกลบ (สร้าง/ซ่อนอัตโนมัติ)
const TRASH_MAX_ENTRIES = 200; // เก็บประวัติการลบไว้สูงสุดกี่รายการต่อไฟล์ (เก่ากว่านี้จะถูกลบทิ้ง)

// ===== ระบบเก็บประวัติการแก้ไข (สำหรับรายงานเคสประจำวัน) =====
// เก็บเป็นแถวในสเปรดชีตแยกต่างหาก (ไม่ใช่ Script Properties) เพราะ Properties เก็บได้แค่ 500KB รวม
// ไม่พอสำหรับเก็บประวัติระยะยาวเพื่อทำรายงานย้อนหลัง — สเปรดชีตเก็บได้หลักล้านแถวสบายๆ
// และเปิดดูตรงๆ ใน Google Sheets ได้เลยถ้าต้องการตรวจสอบละเอียด
const LOG_SPREADSHEET_PROPERTY = 'LOG_SPREADSHEET_ID';
const LOG_SHEET_NAME = 'บันทึกเหตุการณ์';

/**
 * ฟังก์ชันทดสอบเฉยๆ ไม่ได้ถูกเรียกจากหน้าเว็บ มีไว้ให้กด "Run" ในหน้า Editor ครั้งเดียว
 * เพื่อบังคับให้ Google ถามขอสิทธิ์ "เชื่อมต่อบริการภายนอก" (UrlFetchApp) จริงๆ
 * (ต่างจาก doGet ที่กด Run ตรงๆ ในนี้จะ error ตั้งแต่บรรทัดแรกเพราะไม่มี e ส่งมา เลยไม่ทันได้ขอสิทธิ์)
 * ลบทิ้งได้หลังจากขอสิทธิ์สำเร็จแล้ว ไม่มีผลอะไรกับเว็บไซต์
 */
function testExternalRequestAuth() {
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=test', { muteHttpExceptions: true });
  Logger.log('รหัสตอบกลับ: ' + res.getResponseCode());
  Logger.log(res.getContentText());
}

/**
 * คำสั่งที่ "เขียน" ข้อมูลลงชีท — ต้องจับล็อกก่อนทำเสมอ ห้ามทำพร้อมกันหลายคำขอ
 *
 * ทำไมต้องมี: Apps Script รับหลายคำขอพร้อมกันได้ ถ้า 2 คนกดบันทึกแถวเดียวกันในเสี้ยววินาทีเดียวกัน
 * ทั้งคู่จะอ่านค่าเดิมเหมือนกันแล้วเขียนทับกัน คนที่เขียนทีหลังจะลบงานของคนแรกทิ้งโดยไม่มีใครรู้
 * (ลายนิ้วมือแถวกันกรณีข้อมูลเปลี่ยนไปแล้วได้ แต่กันกรณีชนกันพอดีในเสี้ยววินาทีไม่ได้ เพราะทั้งคู่เห็นค่าเดิมตรงกัน)
 */
const WRITE_ACTIONS = [
  'add', 'deleteRow', 'updateRow', 'setRowColor', 'deleteColumn',
  'restore', 'restoreBook', 'addBook', 'createBook', 'removeBook',
  'renameBook', 'createSheet', 'repairDropdowns', 'uploadRows', 'splitYear'
];

const WRITE_LOCK_WAIT_MS = 25000; // รอคิวนานสุด 25 วินาที (คำขอ JSONP ฝั่งเว็บรอ 30 วินาที)

function doGet(e) {
  const callback = (e.parameter.callback || '').replace(/[^A-Za-z0-9_]/g, '');
  const action = e.parameter.action || 'books';
  let payload;
  let lock = null;
  try {
    requireValidAccessKey_(e.parameter.key);

    // ทุกคำสั่ง (ยกเว้นตัวล็อกอินเอง) ต้องแนบตั๋วที่ระบบออกให้หลังยืนยันกับ Google เท่านั้น
    // editor = อีเมลที่ยืนยันแล้วจากตั๋ว ใช้เป็นชื่อผู้แก้ไขใน Log — ปลอมไม่ได้
    let editor = '';
    if (action !== 'loginGoogle') {
      editor = verifySessionToken_(e.parameter.token);
    }

    // คำสั่งที่เขียนข้อมูลต้องเข้าคิวทีละคน กันเขียนทับกันเมื่อมีคนใช้พร้อมกัน
    if (WRITE_ACTIONS.indexOf(action) !== -1) {
      lock = LockService.getScriptLock();
      if (!lock.tryLock(WRITE_LOCK_WAIT_MS)) {
        lock = null; // จับไม่ได้ ไม่ต้องไปปลดใน finally
        throw new Error('ขณะนี้มีคนอื่นกำลังบันทึกข้อมูลอยู่ และรอคิวนานเกินไป กรุณาลองใหม่อีกครั้ง');
      }
    }

    if (action === 'session') {
      payload = { ok: true, email: editor, isAdmin: isAdminEmail_(editor) };
    } else if (action === 'loginGoogle') {
      payload = loginGoogle_(e.parameter.credential);
    } else if (action === 'books') {
      payload = getBooks_();
    } else if (action === 'sheets') {
      payload = getSheets_(e.parameter.book);
    } else if (action === 'sheet') {
      payload = getSheetData_(e.parameter.book, e.parameter.name);
    } else if (action === 'search') {
      payload = searchAll_(e.parameter.q, e.parameter.book, e.parameter.sheet);
    } else if (action === 'headers') {
      payload = getSheetHeaders_(e.parameter.book, e.parameter.sheet);
    } else if (action === 'tabView') {
      payload = getTabView_(e.parameter.book, e.parameter.sheet, e.parameter.q, e.parameter.offset, e.parameter.limit, e.parameter.slim === '1');
    } else if (action === 'rowFull') {
      payload = getRowFull_(e.parameter.book, e.parameter.sheet, e.parameter.row);
    } else if (action === 'rowLinks') {
      payload = getRowLinks_(e.parameter.book, e.parameter.sheet, e.parameter.rows);
    } else if (action === 'tableHeaders') {
      payload = getTableHeaders_(e.parameter.book, e.parameter.sheet);
    } else if (action === 'add') {
      payload = addRecord_(e.parameter.book, e.parameter.sheet, e.parameter.data, editor);
    } else if (action === 'deleteRow') {
      payload = deleteRow_(e.parameter.book, e.parameter.sheet, e.parameter.row, editor, e.parameter.fp);
    } else if (action === 'updateRow') {
      payload = updateRow_(e.parameter.book, e.parameter.sheet, e.parameter.row, e.parameter.data, editor, e.parameter.fp);
    } else if (action === 'setRowColor') {
      payload = setRowColor_(e.parameter.book, e.parameter.sheet, e.parameter.row, e.parameter.bg, e.parameter.font, editor);
    } else if (action === 'deleteColumn') {
      payload = deleteColumn_(e.parameter.book, e.parameter.sheet, e.parameter.column, editor);
    } else if (action === 'trash') {
      payload = getTrash_(e.parameter.book);
    } else if (action === 'restore') {
      payload = restoreItem_(e.parameter.book, e.parameter.id, editor);
    } else if (action === 'addBook') {
      payload = addBook_(e.parameter.name, e.parameter.sheetUrl, editor, e.parameter.folder);
    } else if (action === 'createBook') {
      payload = createBook_(e.parameter.name, e.parameter.sheetName, editor, e.parameter.folder);
    } else if (action === 'uploadRows') {
      payload = appendUploadRows_(e.parameter.book, e.parameter.sheet, e.parameter.rows, editor);
    } else if (action === 'removeBook') {
      payload = removeBook_(e.parameter.name, editor);
    } else if (action === 'renameBook') {
      payload = renameBook_(e.parameter.oldName, e.parameter.newName, editor);
    } else if (action === 'bookTrash') {
      payload = getBookTrash_();
    } else if (action === 'restoreBook') {
      payload = restoreBook_(e.parameter.id, editor);
    } else if (action === 'activity') {
      payload = getActivityLog_();
    } else if (action === 'createSheet') {
      payload = createSheet_(e.parameter.book, e.parameter.sheetName, e.parameter.grid, editor);
    } else if (action === 'dailyReport') {
      payload = getDailyReport_(e.parameter.book, e.parameter.sheet);
    } else if (action === 'statusSummary') {
      payload = getStatusSummary_(e.parameter.status);
    } else if (action === 'statusRows') {
      payload = getStatusRows_(e.parameter.status, e.parameter.book, e.parameter.sheet);
    } else if (action === 'caseDetail') {
      payload = getCaseDetail_(e.parameter.book, e.parameter.sheet, e.parameter.row);
    } else if (action === 'globalDashboard') {
      payload = getGlobalDashboard_();
    } else if (action === 'dashboardReport') {
      payload = getDashboardReport_(e.parameter.from, e.parameter.to);
    } else if (action === 'splitPreview') {
      requireAdmin_(editor);
      payload = previewSplitByYear_(e.parameter.book, e.parameter.sheet);
    } else if (action === 'splitYear') {
      requireAdmin_(editor);
      payload = splitSheetByYear_(e.parameter.book, e.parameter.sheet, e.parameter.year, editor);
    } else if (action === 'auditLog') {
      // คำสั่งสำหรับผู้ดูแลระบบเท่านั้น — ต้องตรวจสิทธิ์ที่นี่ ไม่ใช่แค่ซ่อนปุ่มบนหน้าเว็บ
      requireAdmin_(editor);
      payload = getAuditLog_({
        from: e.parameter.from,
        to: e.parameter.to,
        email: e.parameter.email,
        actionType: e.parameter.actionType,
        book: e.parameter.book,
        keyword: e.parameter.keyword,
        offset: e.parameter.offset
      });
    } else if (action === 'repairDropdowns') {
      payload = repairDropdownChips_();
    } else {
      payload = getBooks_();
    }
  } catch (error) {
    payload = { ok: false, error: error.message };
  } finally {
    // ต้องปลดล็อกเสมอ แม้คำสั่งจะพังกลางคัน ไม่งั้นคนถัดไปจะค้างรอคิวจนหมดเวลา
    if (lock) lock.releaseLock();
  }
  const output = callback ? `${callback}(${JSON.stringify(payload)});` : JSON.stringify(payload);
  return ContentService.createTextOutput(output).setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

/** อ่านรายชื่อไฟล์ที่บันทึกไว้ใน Script Properties ถ้ายังไม่เคยตั้งค่ามาก่อน จะสร้างจากค่าเริ่มต้นให้อัตโนมัติ */
function getSpreadsheetsMap_() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(SPREADSHEETS_PROPERTY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // ค่าที่บันทึกไว้เสีย ใช้ค่าเริ่มต้นแทนแล้วบันทึกทับ
    }
  }
  props.setProperty(SPREADSHEETS_PROPERTY, JSON.stringify(DEFAULT_SPREADSHEETS));
  return DEFAULT_SPREADSHEETS;
}

function saveSpreadsheetsMap_(map) {
  PropertiesService.getScriptProperties().setProperty(SPREADSHEETS_PROPERTY, JSON.stringify(map));
}

/**
 * ดึง ID ของไฟล์ Google Sheet จากลิงก์เต็ม หรือจาก ID ที่วางมาตรงๆ ก็ได้
 * รองรับทั้งสองแบบ เพื่อให้ผู้ใช้ไม่ต้องมาตัด ID เองจากลิงก์
 */
function extractSpreadsheetId_(input) {
  const value = (input || '').toString().trim();
  const match = value.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(value)) return value;
  return null;
}

/**
 * เพิ่มไฟล์ Google Sheet ใหม่เข้าระบบ โดยไม่ต้องแก้โค้ดหรือ Deploy ใหม่
 * ตรวจสอบก่อนว่าเปิดไฟล์ได้จริง (บัญชีที่รันสคริปต์มีสิทธิ์เข้าถึง) ก่อนบันทึก
 */
/**
 * ย้าย/กำหนดว่าไฟล์นี้อยู่โฟลเดอร์ไหนบนแถบด้านบน แล้วบันทึกลง Script Property
 * ถ้ายังไม่เคยตั้งค่า จะยึดค่าเริ่มต้นในโค้ดเป็นฐานก่อน แล้วค่อยเพิ่มไฟล์ใหม่เข้าไป
 * เรียกเมื่อไม่ได้ระบุโฟลเดอร์ก็ไม่ทำอะไร (ไฟล์จะไปโผล่ในโฟลเดอร์ "อื่นๆ" เองอยู่แล้ว)
 */
function assignBookFolder_(bookName, folderName) {
  const folder = (folderName || '').toString().trim();
  const book = (bookName || '').toString().trim();
  if (!folder || !book || folder === UNFILED_FOLDER_NAME) return;

  try {
    const config = getBookFoldersConfig_().map(f => ({
      name: (f.name || '').toString(),
      books: (f.books || []).slice()
    }));

    // เอาชื่อไฟล์นี้ออกจากทุกโฟลเดอร์ก่อน กันไฟล์เดียวอยู่ 2 โฟลเดอร์
    config.forEach(f => {
      f.books = f.books.filter(b => normalizeBookName_(b) !== normalizeBookName_(book));
    });

    let target = config.find(f => normalizeBookName_(f.name) === normalizeBookName_(folder));
    if (!target) {
      target = { name: folder, books: [] };
      config.push(target);
    }
    target.books.push(book);

    PropertiesService.getScriptProperties()
      .setProperty(BOOK_FOLDERS_PROPERTY, JSON.stringify(config));
  } catch (e) {
    // จัดโฟลเดอร์ไม่สำเร็จไม่ควรทำให้การเพิ่มไฟล์ล้มเหลวตามไปด้วย
    // ไฟล์จะไปอยู่โฟลเดอร์ "อื่นๆ" แทน ซึ่งผู้ใช้ย้ายเองทีหลังได้
  }
}

const UPLOAD_MAX_ROWS_PER_CALL = 200; // กันคำขอใหญ่เกินไป (JSONP ส่งข้อมูลผ่าน URL)

/**
 * เติมข้อมูลลงแท็บทีละชุด ใช้ตอนนำเข้าไฟล์ Excel/CSV จากเครื่องผู้ใช้
 *
 * หน้าเว็บอ่านไฟล์เองในเบราว์เซอร์ (ด้วย SheetJS) แล้วส่งข้อมูลมาทีละชุด
 * ไม่ได้อัปโหลดตัวไฟล์มาจริงๆ เพราะระบบนี้สื่อสารด้วย JSONP ซึ่งส่งข้อมูลผ่าน URL
 * จึงส่งไฟล์ทั้งก้อนไม่ได้
 */
function appendUploadRows_(book, sheetName, rowsJson, editor) {
  if (!book || !sheetName) throw new Error('ไม่พบไฟล์หรือแท็บปลายทาง');

  let rows;
  try {
    rows = JSON.parse(rowsJson || '[]');
  } catch (e) {
    throw new Error('รูปแบบข้อมูลที่ส่งมาไม่ถูกต้อง');
  }
  if (!Array.isArray(rows) || rows.length === 0) return { ok: true, added: 0 };
  if (rows.length > UPLOAD_MAX_ROWS_PER_CALL) {
    throw new Error(`ส่งข้อมูลได้ครั้งละไม่เกิน ${UPLOAD_MAX_ROWS_PER_CALL} แถว`);
  }

  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet) throw new Error(`ไม่พบแท็บ "${sheetName}"`);

  // ทุกแถวต้องยาวเท่ากัน ไม่งั้น setValues จะ error
  let width = 0;
  rows.forEach(r => { if (Array.isArray(r) && r.length > width) width = r.length; });
  if (width === 0) return { ok: true, added: 0 };

  const normalized = rows.map(r => {
    const row = Array.isArray(r) ? r.slice(0, width) : [];
    while (row.length < width) row.push('');
    return row.map(c => (c === null || c === undefined) ? '' : c);
  });

  const startRow = sheet.getLastRow() + 1;
  if (width > sheet.getMaxColumns()) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());
  }
  sheet.getRange(startRow, 1, normalized.length, width).setValues(normalized);

  clearSheetCache_(book, sheetName);
  return { ok: true, added: normalized.length, nextRow: startRow + normalized.length };
}

function addBook_(name, sheetUrlOrId, editor, folder) {
  const bookName = (name || '').toString().trim();
  if (!bookName) throw new Error('กรุณาระบุชื่อไฟล์ที่จะแสดงบนหน้าเว็บ');

  const id = extractSpreadsheetId_(sheetUrlOrId);
  if (!id) throw new Error('ไม่พบ ID ของไฟล์ กรุณาวางลิงก์ Google Sheet ให้ถูกต้อง');

  const map = getSpreadsheetsMap_();
  if (map[bookName]) throw new Error(`มีไฟล์ชื่อ "${bookName}" อยู่แล้ว กรุณาตั้งชื่ออื่น`);
  if (Object.values(map).includes(id)) throw new Error('ไฟล์นี้ถูกเพิ่มเข้าระบบไว้แล้ว (ภายใต้ชื่ออื่น)');

  try {
    SpreadsheetApp.openById(id); // ทดสอบเปิดไฟล์จริงก่อนบันทึก
  } catch (e) {
    throw new Error('ไม่สามารถเปิดไฟล์นี้ได้ ตรวจสอบว่าลิงก์/ID ถูกต้อง และบัญชีที่รันสคริปต์นี้มีสิทธิ์เข้าถึงไฟล์');
  }

  map[bookName] = id;
  saveSpreadsheetsMap_(map);
  assignBookFolder_(bookName, folder);
  logActivity_(editor, 'เพิ่มไฟล์', `เพิ่มไฟล์ "${bookName}"`);
  logCaseEvent_(editor, 'เพิ่มไฟล์', bookName, '', `เพิ่มไฟล์ "${bookName}" เข้าระบบ`);
  return { ok: true, message: `เพิ่มไฟล์ "${bookName}" สำเร็จ`, books: Object.keys(map) };
}

/**
 * สร้างไฟล์ Google Sheet ใหม่ทั้งไฟล์ (ยังไม่มีมาก่อน) ขึ้นมาจากหน้าเว็บไซต์โดยตรง
 * แล้วเพิ่มเข้าระบบให้อัตโนมัติ (ไม่ต้องเอาลิงก์มาวางเองแบบ addBook_)
 * ไฟล์ใหม่จะไปอยู่ใน Google Drive ของบัญชีที่รัน Apps Script นี้ (บัญชี "Execute as: Me" ตอน Deploy)
 * @param {string} name ชื่อไฟล์ที่จะแสดงบนหน้าเว็บ (ใช้เป็นชื่อไฟล์ Google Sheet จริงด้วย)
 * @param {string} firstSheetName ชื่อแท็บแรกในไฟล์ใหม่ (ถ้าไม่ระบุ จะใช้ชื่อที่ Google ตั้งให้อัตโนมัติ)
 */
function createBook_(name, firstSheetName, editor, folder) {
  const bookName = (name || '').toString().trim();
  if (!bookName) throw new Error('กรุณาระบุชื่อไฟล์ที่จะสร้าง');

  const map = getSpreadsheetsMap_();
  if (map[bookName]) throw new Error(`มีไฟล์ชื่อ "${bookName}" อยู่แล้ว กรุณาตั้งชื่ออื่น`);

  const ss = SpreadsheetApp.create(bookName);
  const id = ss.getId();

  const sheetName = (firstSheetName || '').toString().trim();
  if (sheetName) {
    const firstSheet = ss.getSheets()[0];
    firstSheet.setName(sheetName);
  }

  map[bookName] = id;
  saveSpreadsheetsMap_(map);
  assignBookFolder_(bookName, folder);
  logActivity_(editor, 'สร้างไฟล์ใหม่', `สร้างไฟล์ Google Sheet ใหม่ "${bookName}"`);
  logCaseEvent_(editor, 'สร้างไฟล์ใหม่', bookName, '', `สร้างไฟล์ Google Sheet ใหม่ "${bookName}"`);

  return {
    ok: true,
    message: `สร้างไฟล์ "${bookName}" สำเร็จ`,
    books: Object.keys(map),
    bookName,
    sheetName: ss.getSheets()[0].getName(),
    url: ss.getUrl()
  };
}

/** เอาไฟล์ออกจากระบบ (ไม่ได้ลบไฟล์ Google Sheet จริง แค่เอาออกจากรายการที่เว็บนี้รู้จัก) — บันทึกไว้ในถังขยะไฟล์ก่อนเสมอ เพื่อให้กู้คืนได้ */
function removeBook_(name, editor) {
  const bookName = (name || '').toString().trim();
  const map = getSpreadsheetsMap_();
  if (!map[bookName]) throw new Error('ไม่พบไฟล์นี้ในระบบ');

  const sheetId = map[bookName];
  delete map[bookName];
  saveSpreadsheetsMap_(map);

  logBookTrash_(bookName, sheetId);
  logActivity_(editor, 'เอาไฟล์ออก', `เอาไฟล์ "${bookName}" ออกจากระบบ`);
  logCaseEvent_(editor, 'เอาไฟล์ออก', bookName, '', `เอาไฟล์ "${bookName}" ออกจากระบบ (กู้คืนได้)`);

  return { ok: true, message: `เอาไฟล์ "${bookName}" ออกจากระบบแล้ว (กู้คืนได้ที่ปุ่มถังขยะไฟล์)`, books: Object.keys(map) };
}

/** อ่านรายการไฟล์ที่ถูกเอาออกจากระบบ (ถังขยะไฟล์) จาก Script Properties */
function getRemovedBooks_() {
  const raw = PropertiesService.getScriptProperties().getProperty(REMOVED_BOOKS_PROPERTY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveRemovedBooks_(list) {
  PropertiesService.getScriptProperties().setProperty(REMOVED_BOOKS_PROPERTY, JSON.stringify(list));
}

/** บันทึกไฟล์ที่ถูกเอาออกไว้ในถังขยะไฟล์ แล้วตัดรายการเก่าสุดทิ้งถ้าเกินจำนวนที่กำหนด */
function logBookTrash_(name, sheetId) {
  const removed = getRemovedBooks_();
  removed.push({
    id: Utilities.getUuid(),
    name,
    sheetId,
    removedAt: new Date().toISOString()
  });
  if (removed.length > TRASH_MAX_ENTRIES) {
    removed.splice(0, removed.length - TRASH_MAX_ENTRIES);
  }
  saveRemovedBooks_(removed);
}

/** คืนรายการไฟล์ในถังขยะไฟล์ (ใหม่สุดขึ้นก่อน) */
function getBookTrash_() {
  const items = getRemovedBooks_().slice().reverse();
  return { ok: true, items };
}

/** กู้คืนไฟล์จากถังขยะไฟล์ กลับเข้ารายการไฟล์ที่ใช้งานอยู่ แล้วลบออกจากถังขยะ (กู้คืนได้ครั้งเดียวต่อรายการ) */
function restoreBook_(id, editor) {
  if (!id) throw new Error('ไม่พบรายการที่จะกู้คืน');
  const removed = getRemovedBooks_();
  const index = removed.findIndex(item => item.id === id);
  if (index === -1) throw new Error('ไม่พบรายการนี้ในถังขยะไฟล์ (อาจถูกกู้คืนไปแล้ว)');

  const item = removed[index];
  const map = getSpreadsheetsMap_();
  if (map[item.name]) {
    throw new Error(`มีไฟล์ชื่อ "${item.name}" อยู่ในระบบแล้ว กรุณาเอาไฟล์ปัจจุบันออกหรือเปลี่ยนชื่อก่อนกู้คืน`);
  }

  map[item.name] = item.sheetId;
  saveSpreadsheetsMap_(map);

  removed.splice(index, 1);
  saveRemovedBooks_(removed);

  logActivity_(editor, 'กู้คืนไฟล์', `กู้คืนไฟล์ "${item.name}"`);
  logCaseEvent_(editor, 'กู้คืนไฟล์', item.name, '', `กู้คืนไฟล์ "${item.name}" กลับเข้าระบบ`);

  return { ok: true, message: `กู้คืนไฟล์ "${item.name}" สำเร็จ`, books: Object.keys(map) };
}

/** บันทึกประวัติการแก้ไข 1 รายการ (วันเวลา + ชื่อผู้แก้ไข + คำอธิบาย) แล้วตัดรายการเก่าสุดทิ้งถ้าเกินจำนวนที่กำหนด */
function logActivity_(editor, action, detail) {
  const props = PropertiesService.getScriptProperties();
  let list = [];
  const raw = props.getProperty(ACTIVITY_LOG_PROPERTY);
  if (raw) {
    try { list = JSON.parse(raw); } catch (e) { list = []; }
  }
  list.push({
    at: new Date().toISOString(),
    editor: (editor || '').toString().trim() || 'ไม่ระบุชื่อ',
    action,
    detail
  });
  if (list.length > ACTIVITY_LOG_MAX) {
    list.splice(0, list.length - ACTIVITY_LOG_MAX);
  }
  props.setProperty(ACTIVITY_LOG_PROPERTY, JSON.stringify(list));
}

/**
 * แปลงข้อความวันที่เป็น Date (เวลา 00:00:00 ของวันนั้น)
 * รับได้ทั้ง "2026-10-01" (ค่าที่ช่อง date ของเบราว์เซอร์ส่งมา) และ "01/10/2026" (รูปแบบที่คนไทยพิมพ์)
 */
function parseDateInput_(input) {
  const str = (input || '').toString().trim();
  if (!str) return null;

  let y, m, d;
  let match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    y = +match[1]; m = +match[2]; d = +match[3];
  } else {
    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) throw new Error(`รูปแบบวันที่ไม่ถูกต้อง: "${str}" (ต้องเป็น วว/ดด/ปปปป)`);
    d = +match[1]; m = +match[2]; y = +match[3];
  }

  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  if (isNaN(date.getTime()) || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`ไม่มีวันที่นี้อยู่จริง: "${str}"`);
  }
  return date;
}

/* ===== แยกแท็บตามปี (ลดจำนวนแถวต่อแท็บ เพื่อให้โหลดเร็วขึ้น) ===== */

/**
 * อ่าน "ปี" จากค่าในช่องวันที่ รองรับทุกรูปแบบที่พบจริงในชีทของทีม
 * คืนค่าว่างถ้าอ่านไม่ได้ (แถวพวกนั้นจะถูกจัดเข้ากลุ่ม "ไม่ระบุปี" ไม่ใช่ถูกทิ้ง)
 */
function yearFromCell_(value) {
  if (value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return isNaN(value.getTime()) ? '' : normalizeYear_(value.getFullYear());
  }
  const str = value.toString().trim();
  if (!str) return '';

  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);      // วว/ดด/ปปปป
  if (m) return normalizeYear_(+m[3]);
  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);              // ปปปป-ดด-วว (มีเวลาต่อท้ายก็ได้)
  if (m) return normalizeYear_(+m[1]);
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);             // วว-ดด-ปปปป
  if (m) return normalizeYear_(+m[3]);

  // ตัวเลขลำดับวันของ Google Sheets (เช่น 45085) นับจาก 30 ธ.ค. 1899
  // จำกัดช่วงให้เป็นวันที่ที่เป็นไปได้จริง (ปี 2000-2100) ไม่งั้นเลขอย่าง Level 35
  // หรือ UID จะถูกตีความเป็นวันที่ไปด้วย
  if (/^\d+(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str);
    if (serial >= 36526 && serial <= 73415) {
      const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
      if (!isNaN(d.getTime())) return normalizeYear_(d.getUTCFullYear());
    }
  }
  return '';
}

/** ชีทบางไฟล์กรอกเป็น พ.ศ. ต้องแปลงเป็น ค.ศ. ไม่งั้นจะได้แท็บชื่อ "2569" ปนมา */
function normalizeYear_(year) {
  return String(year > 2400 ? year - 543 : year);
}

const SPLIT_UNKNOWN_YEAR_LABEL = 'ไม่ระบุปี';

/** หาคอลัมน์วันที่ของแท็บนี้ (ใช้เกณฑ์เดียวกับที่เลือกคอลัมน์มาแสดงในตาราง) */
function findDateColumn_(headers) {
  for (let i = 0; i < headers.length; i++) {
    const h = (headers[i] || '').toString().trim();
    if (!h) continue;
    if (/วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test(h)) return i;
  }
  return -1;
}

/**
 * ดูก่อนว่าถ้าแยกแท็บนี้ตามปี จะได้กี่ปี ปีละกี่แถว (ไม่แก้ข้อมูลใดๆ)
 * ให้ผู้ดูแลตรวจตัวเลขก่อนตัดสินใจแยกจริง
 */
function previewSplitByYear_(book, sheetName) {
  if (!sheetName) throw new Error('กรุณาระบุแท็บที่ต้องการแยก');
  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error(`ไม่พบแท็บ "${sheetName}"`);

  const { headerRowIndex, headers } = getPositionalHeaders_(sheet);
  const dateIndex = findDateColumn_(headers);
  if (dateIndex === -1) throw new Error(`แท็บ "${sheetName}" ไม่มีคอลัมน์วันที่ จึงแยกตามปีไม่ได้`);

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= headerRowIndex) throw new Error('แท็บนี้ยังไม่มีข้อมูล');

  const values = safeGetDisplayValues_(sheet, headerRowIndex + 1, 1, lastRow - headerRowIndex, lastCol);
  const tally = {};
  let dataRows = 0;
  values.forEach(row => {
    if (row.every(c => !c.trim())) return; // แถวว่างทั้งแถว ไม่นับ
    dataRows++;
    const year = yearFromCell_(row[dateIndex]) || SPLIT_UNKNOWN_YEAR_LABEL;
    tally[year] = (tally[year] || 0) + 1;
  });

  const groups = Object.keys(tally).sort().map(year => ({
    year,
    count: tally[year],
    targetSheet: `${sheetName} ${year}`,
    exists: !!getSpreadsheet_(book).getSheetByName(`${sheetName} ${year}`)
  }));

  return {
    ok: true, book, sheet: sheetName,
    dateColumn: headers[dateIndex],
    totalRows: dataRows,
    groups
  };
}

/**
 * แยกข้อมูลของ "ปีเดียว" ออกมาเป็นแท็บใหม่
 *
 * วิธีทำ: ทำสำเนาทั้งแท็บก่อน แล้วค่อยลบแถวของปีอื่นออกจากสำเนา
 * ห้ามสร้างแท็บเปล่าแล้วคัดลอกค่าเข้าไปเด็ดขาด เพราะสีของตัวเลือกใน Dropdown
 * และกฎ Data Validation จะหายทั้งแท็บ (ดูเหตุผลเดียวกันใน CLAUDE.md)
 *
 * แท็บต้นฉบับไม่ถูกแตะต้องเลย ผู้ดูแลต้องตรวจความถูกต้องเองก่อนค่อยลบทิ้ง
 */
function splitSheetByYear_(book, sheetName, yearParam, editor) {
  const targetYear = (yearParam || '').toString().trim();
  if (!sheetName || !targetYear) throw new Error('กรุณาระบุแท็บและปีที่ต้องการแยก');

  const ss = getSpreadsheet_(book);
  const source = ss.getSheetByName(sheetName);
  if (!source || isHiddenSheet_(source)) throw new Error(`ไม่พบแท็บ "${sheetName}"`);

  const newName = `${sheetName} ${targetYear}`;
  if (ss.getSheetByName(newName)) {
    throw new Error(`มีแท็บ "${newName}" อยู่แล้ว กรุณาลบหรือเปลี่ยนชื่อแท็บนั้นก่อน`);
  }

  const { headerRowIndex, headers } = getPositionalHeaders_(source);
  const dateIndex = findDateColumn_(headers);
  if (dateIndex === -1) throw new Error(`แท็บ "${sheetName}" ไม่มีคอลัมน์วันที่`);

  const lastRow = source.getLastRow();
  const lastCol = source.getLastColumn();
  if (lastRow <= headerRowIndex) throw new Error('แท็บนี้ยังไม่มีข้อมูล');

  // ทำสำเนาทั้งแท็บ — สี รูปแบบ Dropdown และ Conditional formatting ติดมาครบ
  // ห้ามสร้างแท็บเปล่าแล้วคัดลอกค่าเข้าไป เพราะสีของตัวเลือกใน Dropdown จะหายทั้งแท็บ
  const copy = source.copyTo(ss).setName(newName);

  const numRows = lastRow - headerRowIndex;
  const firstDataRow = headerRowIndex + 1;

  try {
    // นับก่อนว่าปีนี้มีกี่แถว ถ้าไม่มีเลยก็ไม่ต้องทำต่อ
    const values = safeGetDisplayValues_(source, firstDataRow, 1, numRows, lastCol);
    let kept = 0;
    values.forEach(row => {
      if (row.every(c => !c.trim())) return;
      const year = yearFromCell_(row[dateIndex]) || SPLIT_UNKNOWN_YEAR_LABEL;
      if (year === targetYear) kept++;
    });
    if (kept === 0) {
      ss.deleteSheet(copy);
      throw new Error(`ไม่พบข้อมูลของปี "${targetYear}" ในแท็บนี้`);
    }

    // เพิ่มคอลัมน์ชั่วคราวเก็บ "ปี" ของแต่ละแถว แล้วเรียงตามคอลัมน์นั้น
    //
    // ทำแบบนี้เพื่อให้แถวของปีเดียวกันมาอยู่ติดกันเป็นก้อนเดียว จะได้ลบทีเดียวจบ
    // ถ้าไม่เรียงก่อน ข้อมูลที่ปีสลับไปมาจะต้องสั่งลบทีละช่วงเป็นพันครั้ง
    // ซึ่งเกินเวลา 6 นาทีที่ Apps Script รันได้ แล้วจะค้างกลางคัน
    const helperCol = copy.getLastColumn() + 1;
    const marks = values.map(row => {
      if (row.every(c => !c.trim())) return ['~ว่าง'];  // แถวว่างให้ไปรวมท้ายสุด
      const year = yearFromCell_(row[dateIndex]) || SPLIT_UNKNOWN_YEAR_LABEL;
      return [year === targetYear ? '0' : '1_' + year];  // '0' = เก็บไว้ จะถูกเรียงขึ้นบนสุด
    });
    if (helperCol > copy.getMaxColumns()) {
      copy.insertColumnsAfter(copy.getMaxColumns(), helperCol - copy.getMaxColumns());
    }
    copy.getRange(firstDataRow, helperCol, numRows, 1).setValues(marks);
    copy.getRange(firstDataRow, 1, numRows, helperCol).sort({ column: helperCol, ascending: true });

    // ตอนนี้แถวที่ต้องเก็บอยู่บนสุดติดกันหมดแล้ว ที่เหลือลบทิ้งทีเดียว
    const deleteFrom = firstDataRow + kept;
    const deleteCount = numRows - kept;
    if (deleteCount > 0) copy.deleteRows(deleteFrom, deleteCount);
    copy.deleteColumn(helperCol);

    clearSheetCache_(book, newName);
    logActivity_(editor, 'แยกแท็บตามปี', `แยกแท็บ "${sheetName}" ปี ${targetYear} เป็น "${newName}" (${kept} แถว)`);
    logCaseEvent_(editor, 'แยกแท็บตามปี', book, newName, `แยกจากแท็บ "${sheetName}" เฉพาะปี ${targetYear} จำนวน ${kept} แถว`);

    return {
      ok: true,
      message: `สร้างแท็บ "${newName}" สำเร็จ ${kept} แถว (แท็บเดิมยังอยู่ครบทุกแถว ตรวจสอบแล้วค่อยลบเอง)`,
      newSheet: newName,
      kept
    };
  } catch (err) {
    // ล้มกลางคัน ต้องเก็บกวาดแท็บที่สร้างค้างไว้ ไม่ให้เหลือแท็บครึ่งๆ กลางๆ ให้สับสน
    try { if (ss.getSheetByName(newName)) ss.deleteSheet(copy); } catch (e) {}
    throw err;
  }
}

const AUDIT_LOG_PAGE_SIZE = 300; // จำนวนรายการสูงสุดที่ส่งกลับต่อ 1 ครั้ง (JSONP ส่งผ่าน URL ส่งทีละมากๆ ไม่ไหว)

/**
 * ประวัติการใช้งานทั้งระบบสำหรับ "ผู้ดูแลระบบ" — ใครทำอะไร ที่ไฟล์ไหน แท็บไหน เมื่อไหร่
 * อ่านจากชีท Log กลาง ซึ่งเก็บถาวรไม่มีวันหมดอายุ (ต่างจาก activity log เดิมที่เก็บแค่ 50 รายการล่าสุด)
 *
 * กรองได้ตาม: ช่วงวันที่ / อีเมลผู้ทำ / ประเภทคำสั่ง / ไฟล์ / คำค้นในรายละเอียด
 * คืนรายชื่ออีเมลและประเภทคำสั่งทั้งหมดที่พบในช่วงนั้นมาด้วย เพื่อให้หน้าเว็บเอาไปทำตัวเลือกในกล่องกรอง
 *
 * @param {Object} opts { from, to, email, actionType, book, keyword, offset }
 */
function getAuditLog_(opts) {
  const o = opts || {};
  const tz = Session.getScriptTimeZone();

  const from = o.from ? parseDateInput_(o.from) : null;
  const to = o.to ? parseDateInput_(o.to) : null;
  if (from && to && from > to) throw new Error('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
  // ให้ "ถึงวันที่" ครอบคลุมทั้งวัน ไม่ใช่หยุดที่เที่ยงคืนตรง
  const toEnd = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999) : null;

  const emailFilter = (o.email || '').toString().trim().toLowerCase();
  const actionFilter = (o.actionType || '').toString().trim();
  const bookFilter = (o.book || '').toString().trim();
  const keyword = (o.keyword || '').toString().trim().toLowerCase();
  const offset = Math.max(0, parseInt(o.offset, 10) || 0);

  const rows = readLogRows_(from, toEnd);

  // เก็บรายชื่ออีเมล/ประเภทคำสั่ง/ไฟล์ ที่พบจริง เพื่อเอาไปทำตัวเลือกในกล่องกรอง
  const editorsSeen = {};
  const actionsSeen = {};
  const booksSeen = {};
  const matched = [];

  rows.forEach(r => {
    const when = r[0] instanceof Date ? r[0] : new Date(r[0]);
    if (isNaN(when.getTime())) return;
    if (from && when < from) return;
    if (toEnd && when > toEnd) return;

    const editor = (r[1] || '').toString().trim();
    const action = (r[2] || '').toString().trim();
    const book = (r[3] || '').toString().trim();
    const sheetName = (r[4] || '').toString().trim();
    const detail = (r[5] || '').toString();

    // นับตัวเลือกจาก "ทุกแถวในช่วงวันที่" ก่อนกรองเงื่อนไขอื่น ไม่งั้นพอเลือกกรองแล้วตัวเลือกอื่นจะหายไปหมด
    if (editor) editorsSeen[editor] = (editorsSeen[editor] || 0) + 1;
    if (action) actionsSeen[action] = (actionsSeen[action] || 0) + 1;
    if (book) booksSeen[book] = true;

    if (emailFilter && editor.toLowerCase() !== emailFilter) return;
    if (actionFilter && action !== actionFilter) return;
    if (bookFilter && book !== bookFilter) return;
    if (keyword && (detail + ' ' + sheetName + ' ' + book).toLowerCase().indexOf(keyword) === -1) return;

    matched.push({
      time: Utilities.formatDate(when, tz, 'dd/MM/yyyy HH:mm:ss'),
      sortKey: when.getTime(),
      editor: editor || 'ไม่ระบุชื่อ',
      action,
      book,
      sheet: sheetName,
      detail
    });
  });

  matched.sort((a, b) => b.sortKey - a.sortKey); // ใหม่สุดขึ้นก่อน
  const total = matched.length;
  const page = matched.slice(offset, offset + AUDIT_LOG_PAGE_SIZE).map(item => {
    delete item.sortKey;
    return item;
  });

  // สรุปว่าแต่ละคนทำไปกี่ครั้งในช่วงที่เลือก (นับจากผลที่ผ่านตัวกรองแล้ว)
  const perEditor = {};
  matched.forEach(m => { perEditor[m.editor] = (perEditor[m.editor] || 0) + 1; });

  return {
    ok: true,
    items: page,
    total,
    offset,
    pageSize: AUDIT_LOG_PAGE_SIZE,
    hasMore: offset + page.length < total,
    editors: Object.keys(editorsSeen).sort(),
    actions: Object.keys(actionsSeen).sort(),
    books: Object.keys(booksSeen).sort(),
    summary: Object.keys(perEditor)
      .map(editor => ({ editor, count: perEditor[editor] }))
      .sort((a, b) => b.count - a.count),
    generatedAt: new Date().toISOString()
  };
}

/** คืนประวัติการแก้ไขล่าสุด (ใหม่สุดขึ้นก่อน) */
function getActivityLog_() {
  const raw = PropertiesService.getScriptProperties().getProperty(ACTIVITY_LOG_PROPERTY);
  let list = [];
  if (raw) {
    try { list = JSON.parse(raw); } catch (e) { list = []; }
  }
  return { ok: true, items: list.slice().reverse() };
}

/** เปลี่ยนชื่อไฟล์ที่แสดงบนหน้าเว็บ (ไม่ได้เปลี่ยนชื่อไฟล์ Google Sheet จริง) */
function renameBook_(oldName, newName, editor) {
  oldName = (oldName || '').toString().trim();
  newName = (newName || '').toString().trim();
  if (!oldName || !newName) throw new Error('กรุณาระบุชื่อเดิมและชื่อใหม่');

  const map = getSpreadsheetsMap_();
  if (!map[oldName]) throw new Error('ไม่พบไฟล์นี้ในระบบ');
  if (oldName === newName) return { ok: true, message: 'ชื่อไม่มีการเปลี่ยนแปลง', books: Object.keys(map) };
  if (map[newName]) throw new Error(`มีไฟล์ชื่อ "${newName}" อยู่แล้ว กรุณาตั้งชื่ออื่น`);

  const id = map[oldName];
  delete map[oldName];
  map[newName] = id;
  saveSpreadsheetsMap_(map);

  logActivity_(editor, 'เปลี่ยนชื่อไฟล์', `เปลี่ยนชื่อ "${oldName}" เป็น "${newName}"`);
  logCaseEvent_(editor, 'เปลี่ยนชื่อไฟล์', newName, '', `เปลี่ยนชื่อไฟล์ "${oldName}" → "${newName}"`);

  return { ok: true, message: `เปลี่ยนชื่อเป็น "${newName}" สำเร็จ`, books: Object.keys(map) };
}

/**
 * สร้างแท็บใหม่ในไฟล์ที่ระบุ พร้อมใส่ข้อมูลเริ่มต้นจากตารางที่กรอกในหน้าเว็บ (แบบ Excel)
 * @param {string} book ไฟล์ปลายทาง
 * @param {string} sheetName ชื่อแท็บใหม่
 * @param {string} gridJson JSON string ของ 2D array เช่น [["ชื่อ","อายุ"],["สมชาย","30"]]
 */
function createSheet_(book, sheetName, gridJson, editor) {
  const name = (sheetName || '').toString().trim();
  if (!name) throw new Error('กรุณาระบุชื่อแท็บใหม่');
  if (name === TRASH_SHEET_NAME) throw new Error('ชื่อนี้สงวนไว้ใช้งานภายในระบบ กรุณาตั้งชื่ออื่น');

  const ss = getSpreadsheet_(book);
  if (ss.getSheetByName(name)) throw new Error(`มีแท็บชื่อ "${name}" อยู่แล้วในไฟล์นี้`);

  let grid;
  try {
    grid = JSON.parse(gridJson || '[]');
  } catch (e) {
    throw new Error('รูปแบบข้อมูลตารางไม่ถูกต้อง');
  }
  if (!Array.isArray(grid)) throw new Error('รูปแบบข้อมูลตารางไม่ถูกต้อง');

  // ตัดแถวที่ว่างสนิททิ้งท้ายตาราง (เช่นแถว/คอลัมน์เผื่อไว้ที่ผู้ใช้ไม่ได้กรอกอะไรเลย)
  const rows = grid.filter(row => Array.isArray(row) && row.some(cell => (cell || '').toString().trim() !== ''));

  const sheet = ss.insertSheet(name);
  if (rows.length > 0) {
    const numCols = Math.max(...rows.map(row => row.length));
    const paddedRows = rows.map(row => {
      const padded = row.slice(0, numCols);
      while (padded.length < numCols) padded.push('');
      return padded;
    });
    sheet.getRange(1, 1, paddedRows.length, numCols).setValues(paddedRows);
  }

  const targetBookName = book || Object.keys(getSpreadsheetsMap_())[0];
  logActivity_(editor, 'สร้างแท็บใหม่', `สร้างแท็บ "${name}" ในไฟล์ "${targetBookName}"`);
  logCaseEvent_(editor, 'สร้างแท็บใหม่', targetBookName, name, `สร้างแท็บ "${name}"`);

  return { ok: true, message: `สร้างแท็บ "${name}" สำเร็จ` };
}
/**
 * ตรวจสิทธิ์ด้วยรหัสลับที่ตั้งไว้ใน Script Properties แทนการเช็คอีเมล
 * ใช้ร่วมกับ fetch()/JSONP ข้ามโดเมนได้ไม่มีปัญหา CORS/redirect เพราะไม่ต้อง login ผ่าน Google
 */
function requireValidAccessKey_(providedKey) {
  const correctKey = PropertiesService.getScriptProperties().getProperty(ACCESS_KEY_PROPERTY) || '';

  if (!correctKey) {
    throw new Error('ผู้ดูแลยังไม่ได้ตั้งค่ารหัสลับ (DASHBOARD_ACCESS_KEY)');
  }
  if (!providedKey || providedKey !== correctKey) {
    throw new Error('รหัสเข้าถึงไม่ถูกต้อง');
  }
}

/**
 * ตรวจว่าอีเมลที่ส่งมาอยู่ในรายชื่อที่อนุญาต (ALLOWED_EMAILS ใน Script Properties คั่นด้วย comma)
 * นี่คือ "รายชื่ออีเมลที่อนุญาต" ไม่ใช่การตรวจรหัสผ่าน — ไม่ได้ยืนยันว่าเป็นเจ้าของอีเมลจริง
 * เหมาะสำหรับกันคนนอกทีมเข้าใช้งานแบบสุ่มๆ ไม่ใช่ความปลอดภัยระดับสูง
 */
function requireAuthorizedEmail_(email) {
  const raw = PropertiesService.getScriptProperties().getProperty(ALLOWED_EMAILS_PROPERTY) || '';
  const allowed = raw.split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean);

  if (!allowed.length) {
    throw new Error('ผู้ดูแลยังไม่ได้ตั้งค่ารายชื่ออีเมลที่อนุญาต (ALLOWED_EMAILS)');
  }

  const normalized = (email || '').toString().trim().toLowerCase();
  if (!normalized) {
    throw new Error('กรุณาเข้าสู่ระบบด้วยอีเมลก่อนใช้งาน');
  }
  if (!allowed.includes(normalized)) {
    throw new Error(`อีเมล ${normalized} ไม่ได้รับอนุญาตให้เข้าใช้งานระบบนี้ กรุณาติดต่อผู้ดูแลระบบ`);
  }
  return normalized;
}

/**
 * ตรวจว่าอีเมลนี้เป็น "ผู้ดูแลระบบ" หรือไม่ (อ่านจาก ADMIN_EMAILS ใน Script Properties)
 * คืน true/false เฉยๆ ไม่ throw — ใช้ตอนบอกหน้าเว็บว่าควรโชว์เมนูผู้ดูแลไหม
 */
function isAdminEmail_(email) {
  const raw = PropertiesService.getScriptProperties().getProperty(ADMIN_EMAILS_PROPERTY) || '';
  const admins = raw.split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!admins.length) return false; // ยังไม่ได้ตั้งค่า = ไม่มีใครเป็นผู้ดูแล

  const normalized = (email || '').toString().trim().toLowerCase();
  if (!normalized) return false;

  // ใส่ค่า "*" = ทุกคนที่อยู่ใน ALLOWED_EMAILS เป็นผู้ดูแลทั้งหมด
  // มีไว้เพื่อไม่ต้องดูแลรายชื่อ 2 ชุดให้ตรงกัน เวลาเพิ่มคนใหม่เข้าทีมจะได้ไม่ลืมเพิ่มที่นี่ด้วย
  // ยังต้องเช็คกับ ALLOWED_EMAILS อยู่ดี ไม่ใช่เปิดให้ใครก็ได้ที่ส่งอีเมลอะไรมาก็เป็นผู้ดูแล
  if (admins.indexOf('*') !== -1) {
    const allowedRaw = PropertiesService.getScriptProperties().getProperty(ALLOWED_EMAILS_PROPERTY) || '';
    const allowed = allowedRaw.split(/[\s,;]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
    return allowed.indexOf(normalized) !== -1;
  }

  return admins.indexOf(normalized) !== -1;
}

/**
 * บังคับว่าคำสั่งนี้ต้องเป็นผู้ดูแลระบบเท่านั้น — ใช้กับคำสั่งที่เปิดดูการใช้งานของคนอื่น
 *
 * สำคัญ: ต้องตรวจที่ฝั่งเซิร์ฟเวอร์เสมอ การซ่อนปุ่มบนหน้าเว็บอย่างเดียวไม่ใช่ความปลอดภัย
 * เพราะใครก็เรียก URL ของ API ตรงๆ ได้ถ้ารู้ว่ามีคำสั่งนี้อยู่
 */
function requireAdmin_(email) {
  if (!isAdminEmail_(email)) {
    throw new Error('คำสั่งนี้สำหรับผู้ดูแลระบบเท่านั้น');
  }
  return (email || '').toString().trim().toLowerCase();
}

/* ===== ระบบ Session Token (ยืนยันตัวตนจริง) =====
 *
 * ปัญหาของระบบเดิม: หน้าเว็บส่งอีเมลมาเป็นข้อความธรรมดาใน URL แล้ว backend เชื่อเลย
 * ใครก็ตามที่รู้ URL + รู้อีเมลของคนในทีม สามารถสั่งลบ/แก้ไขข้อมูลได้ทั้งหมด
 * และ Log จะบันทึกว่าเป็นฝีมือของคนที่ถูกสวมรอย
 *
 * ระบบใหม่: หลังยืนยันตัวตนกับ Google สำเร็จ จะออก "ตั๋ว" (token) ที่เซ็นลายเซ็นด้วยกุญแจลับ
 * ที่อยู่ใน Script Properties เท่านั้น (ไม่เคยส่งออกไปหน้าเว็บ) ปลอมแปลงไม่ได้
 * ทุกคำสั่งหลังจากนั้นต้องแนบตั๋วนี้มา และชื่อผู้แก้ไขใน Log จะดึงจากตั๋วเสมอ ไม่ใช่จากที่หน้าเว็บส่งมา
 */

const SESSION_SECRET_PROPERTY = 'SESSION_TOKEN_SECRET';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // ตั๋วมีอายุ 7 วัน หมดอายุแล้วให้ล็อกอิน Google ใหม่

/** อ่านกุญแจลับสำหรับเซ็นตั๋ว ถ้ายังไม่เคยมี จะสุ่มสร้างให้อัตโนมัติครั้งเดียวแล้วเก็บไว้ถาวร */
function getSessionSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty(SESSION_SECRET_PROPERTY);
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(SESSION_SECRET_PROPERTY, secret);
  }
  return secret;
}

/** ออกตั๋วให้อีเมลที่ยืนยันตัวตนกับ Google สำเร็จแล้วเท่านั้น */
function createSessionToken_(email) {
  const payload = Utilities.base64EncodeWebSafe(JSON.stringify({ e: email, x: Date.now() + SESSION_TTL_MS }));
  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payload, getSessionSecret_())
  );
  return payload + '.' + signature;
}

/**
 * ตรวจตั๋วที่หน้าเว็บแนบมา: ลายเซ็นต้องถูก + ยังไม่หมดอายุ + อีเมลต้องยังอยู่ในรายชื่อที่อนุญาต
 * คืนอีเมลที่ยืนยันแล้ว เพื่อให้ผู้เรียกใช้เป็น "ผู้แก้ไข" ใน Log ได้อย่างมั่นใจว่าไม่ถูกปลอม
 */
function verifySessionToken_(token) {
  const raw = (token || '').toString().trim();
  if (!raw) throw new Error('กรุณาเข้าสู่ระบบก่อนใช้งาน');

  const parts = raw.split('.');
  if (parts.length !== 2) throw new Error('เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง');

  const expectedSignature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(parts[0], getSessionSecret_())
  );
  if (parts[1] !== expectedSignature) throw new Error('เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง');

  let payload;
  try {
    payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  } catch (e) {
    throw new Error('เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
  }

  if (!payload.x || Date.now() > payload.x) throw new Error('เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');

  // ตรวจซ้ำกับรายชื่อที่อนุญาตเสมอ เผื่อคนนี้ถูกถอนสิทธิ์ไปหลังจากออกตั๋วแล้ว
  return requireAuthorizedEmail_(payload.e);
}

// หมายเหตุ: ฟังก์ชัน login_ (ล็อกอินด้วยการพิมพ์อีเมลเอง) ถูกถอดออกแล้ว
// เพราะเป็นช่องโหว่ — ใครพิมพ์อีเมลของคนในทีมก็เข้าใช้งานได้เลยโดยไม่ต้องพิสูจน์ว่าเป็นเจ้าของจริง
// ตอนนี้เข้าระบบได้ทางเดียวคือยืนยันตัวตนกับ Google จริง (loginGoogle_) แล้วรับตั๋วมาใช้

/**
 * ตรวจสอบ Google ID token (credential) ที่ได้จากปุ่ม "Sign in with Google" ฝั่งหน้าเว็บ
 * โดยส่งไปให้ Google ยืนยันความถูกต้องจริงๆ (ไม่ได้เชื่อฝั่ง frontend อย่างเดียว)
 * ตรวจ 3 อย่าง: (1) ยิงไป Google แล้วต้องไม่ error, (2) aud ต้องตรงกับ GOOGLE_CLIENT_ID ที่ตั้งไว้,
 * (3) email_verified ต้องเป็นจริง — ถ้าผ่านหมด ถือว่าอีเมลนี้เป็นของเจ้าของบัญชี Google จริง
 * คืนอีเมลที่ยืนยันแล้ว (lowercase) หรือ throw error ถ้าไม่ผ่าน
 */
function verifyGoogleIdToken_(idToken) {
  const token = (idToken || '').toString().trim();
  if (!token) {
    throw new Error('ไม่พบข้อมูลการเข้าสู่ระบบจาก Google กรุณากดปุ่ม Sign in with Google อีกครั้ง');
  }

  const clientId = (PropertiesService.getScriptProperties().getProperty(GOOGLE_CLIENT_ID_PROPERTY) || '').trim();
  if (!clientId) {
    throw new Error('ผู้ดูแลยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID ใน Script Properties');
  }

  let info;
  let res;
  try {
    res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true }
    );
  } catch (err) {
    // มักเกิดจากสคริปต์ยังไม่ได้รับสิทธิ์ "เชื่อมต่อบริการภายนอก" (UrlFetchApp) — ต้องไปกด Run
    // ฟังก์ชันไหนก็ได้ครั้งหนึ่งในหน้า Editor แล้วกด Allow ให้สิทธิ์ก่อน ถึงจะใช้งานได้จากเว็บจริง
    throw new Error('เรียก UrlFetchApp ไปหา Google ไม่สำเร็จ (' + (err && err.message ? err.message : err) + ') — ลองไปที่หน้า Apps Script Editor เลือกฟังก์ชันใดก็ได้แล้วกด Run เพื่อขอสิทธิ์ "เชื่อมต่อบริการภายนอก" ก่อน');
  }
  if (res.getResponseCode() !== 200) {
    throw new Error('token ไม่ถูกต้องหรือหมดอายุ (Google ตอบกลับรหัส ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200) + ')');
  }
  try {
    info = JSON.parse(res.getContentText());
  } catch (err) {
    throw new Error('อ่านข้อมูลตอบกลับจาก Google ไม่สำเร็จ: ' + (err && err.message ? err.message : err));
  }

  if (info.aud !== clientId) {
    throw new Error('token นี้ไม่ได้ออกให้กับเว็บนี้ (Client ID ไม่ตรงกัน)');
  }
  if (info.email_verified !== true && info.email_verified !== 'true') {
    throw new Error('อีเมล Google นี้ยังไม่ได้ยืนยัน กรุณาใช้บัญชีอื่น');
  }
  if (!info.email) {
    throw new Error('ไม่พบอีเมลในข้อมูลการเข้าสู่ระบบจาก Google');
  }

  return info.email.toString().trim().toLowerCase();
}

/** ใช้ตรวจสอบตอนหน้าเว็บล็อกอินด้วยปุ่ม "Sign in with Google" (ยืนยันตัวจริงกับ Google ก่อน แล้วเช็คกับรายชื่อที่อนุญาต) */
function loginGoogle_(idToken) {
  const verifiedEmail = verifyGoogleIdToken_(idToken);
  const normalized = requireAuthorizedEmail_(verifiedEmail);
  // บันทึกการเข้าสู่ระบบด้วย เพื่อให้ผู้ดูแลตรวจสอบได้ว่าใครเข้าใช้งานเมื่อไหร่
  logCaseEvent_(normalized, 'เข้าสู่ระบบ', '', '', 'เข้าสู่ระบบด้วยบัญชี Google สำเร็จ');
  // ออกตั๋วให้หลังยืนยันกับ Google สำเร็จแล้วเท่านั้น — หน้าเว็บต้องแนบตั๋วนี้ทุกคำสั่งหลังจากนี้
  return {
    ok: true,
    message: 'เข้าสู่ระบบสำเร็จ',
    email: normalized,
    isAdmin: isAdminEmail_(normalized),
    token: createSessionToken_(normalized)
  };
}

/** เปิดไฟล์ Sheet ตามชื่อไฟล์ที่บันทึกไว้ ถ้าไม่ระบุหรือไม่พบ จะใช้ไฟล์แรกเป็นค่าเริ่มต้น */
function getSpreadsheet_(bookName) {
  const map = getSpreadsheetsMap_();
  const bookKeys = Object.keys(map);
  if (bookKeys.length === 0) throw new Error('ยังไม่ได้ตั้งค่าไฟล์ใดๆ ในระบบ');

  // ไม่ได้ระบุชื่อไฟล์มา = ใช้ไฟล์แรกเป็นค่าเริ่มต้น (ใช้ตอนเปิดหน้าเว็บครั้งแรก)
  if (!bookName) return SpreadsheetApp.openById(map[bookKeys[0]]);

  // ระบุชื่อไฟล์มาแต่ไม่มีในระบบ = ต้อง error ทันที ห้ามถอยไปใช้ไฟล์แรกเด็ดขาด
  // (ของเดิมถอยไปใช้ไฟล์แรกเงียบๆ ทำให้การลบ/แก้ไขไปลงผิดไฟล์โดยไม่มีใครรู้)
  if (!map[bookName]) {
    throw new Error(`ไม่พบไฟล์ "${bookName}" ในระบบ (อาจถูกเปลี่ยนชื่อหรือลบไปแล้ว) กรุณารีเฟรชหน้าเว็บแล้วลองใหม่`);
  }
  return SpreadsheetApp.openById(map[bookName]);
}

/**
 * สร้าง "ลายนิ้วมือ" ของแถวจากค่าที่แสดงในทุกเซลล์ ใช้ตรวจว่าแถวที่ผู้ใช้เห็นบนเว็บ
 * ยังเป็นแถวเดียวกับในชีทจริงหรือไม่ ก่อนจะลบ/แก้ไข
 * ต้องใช้สูตรเดียวกันเป๊ะกับฝั่งหน้าเว็บ (ฟังก์ชัน rowFingerprint_ ใน script.js)
 */
function rowFingerprint_(cells) {
  const str = (cells || []).map(c => (c === null || c === undefined) ? '' : c.toString().trim()).join('\u0001');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

/**
 * ตรวจว่าแถวที่กำลังจะลบ/แก้ไข ยังเป็นแถวเดิมที่ผู้ใช้เห็นบนหน้าเว็บจริงๆ
 *
 * จำเป็นมาก เพราะ sheet.deleteRow() จะเลื่อนแถวที่อยู่ข้างล่างขึ้นมาทั้งหมด
 * ถ้าคนอื่นลบแถวที่ 50 ไปแล้ว ข้อมูลที่เคยอยู่แถว 51 จะเลื่อนมาอยู่แถว 50
 * ถ้าเราแก้ไข "แถวที่ 51" ตามเลขเดิมที่ค้างอยู่บนหน้าจอ จะไปทับข้อมูลของเคสอื่นทันที
 *
 * ถ้าไม่ได้ส่ง fingerprint มา (เช่นเรียกจากโค้ดภายใน) จะข้ามการตรวจไป
 */
function verifyRowFingerprint_(sheet, rowNum, expected) {
  if (!expected) return;
  const lastCol = sheet.getLastColumn();
  const actual = rowFingerprint_(safeReadRow_(sheet, rowNum, 1, lastCol));
  if (actual !== expected) {
    throw new Error('ข้อมูลแถวนี้ในชีทเปลี่ยนไปแล้ว (อาจมีคนอื่นเพิ่ม/ลบ/แก้ไขแถวอยู่ก่อนหน้า) ระบบจึงหยุดไว้เพื่อกันการเขียนทับผิดแถว — กรุณากดค้นหาใหม่อีกครั้งแล้วลองอีกที');
  }
}

/** คืนแค่รายชื่อไฟล์ทั้งหมด (โหลดเร็วมาก ไม่แตะเนื้อหาในชีตเลย) ใช้แสดงเป็นการ์ดเลือกไฟล์หน้าแรก */
/**
 * โฟลเดอร์สำหรับจัดกลุ่มไฟล์ชีตบนแถบด้านบนของหน้าเว็บ
 *
 * เก็บเป็นค่าเริ่มต้นไว้ในโค้ด แล้วให้ Script Property "BOOK_FOLDERS_JSON" เขียนทับได้
 * ถ้าภายหลังอยากย้ายไฟล์ไปโฟลเดอร์อื่น หรือเพิ่มโฟลเดอร์ใหม่ ก็แก้ที่ Script Property ได้เลย
 * ไม่ต้องแก้โค้ดและไม่ต้อง Deploy ใหม่
 *
 * รูปแบบ: [{ "name": "ชื่อโฟลเดอร์", "books": ["ชื่อไฟล์", ...] }, ...]
 */
const BOOK_FOLDERS_PROPERTY = 'BOOK_FOLDERS_JSON';
const UNFILED_FOLDER_NAME = 'อื่นๆ';
const DEFAULT_BOOK_FOLDERS = [
  { name: 'เติมเงิน', books: ['Z4/GE ปัญหาเติมเงิน'] },
  { name: 'Zone 4', books: ['พิจารณาปลด 2026', 'Z4 CS-GP 2026'] },
  { name: 'TOSM', books: ['CS TOSM 2026'] },
  { name: '9Yin', books: [] }
];

/** ตัดช่องว่างและตัวพิมพ์เล็กใหญ่ออก เพื่อให้จับคู่ชื่อไฟล์ได้แม้พิมพ์ต่างกันนิดหน่อย */
function normalizeBookName_(name) {
  return (name || '').toString().replace(/\s+/g, '').toLowerCase();
}

function getBookFoldersConfig_() {
  const raw = PropertiesService.getScriptProperties().getProperty(BOOK_FOLDERS_PROPERTY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) { /* ค่าที่ตั้งไว้เสีย ใช้ค่าเริ่มต้นแทน */ }
  }
  return DEFAULT_BOOK_FOLDERS;
}

/**
 * จัดไฟล์ที่มีอยู่จริงในระบบลงโฟลเดอร์
 * ไฟล์ที่ไม่ได้อยู่ในโฟลเดอร์ไหนเลย (เช่น เพิ่มเข้ามาใหม่) จะไปรวมอยู่ในโฟลเดอร์ "อื่นๆ"
 * เพื่อไม่ให้ไฟล์หายไปจากหน้าเว็บโดยที่ไม่มีใครรู้
 */
function getBookFolders_(bookNames) {
  const config = getBookFoldersConfig_();
  const assigned = {};
  const byNormalized = {};
  bookNames.forEach(b => { byNormalized[normalizeBookName_(b)] = b; });

  const folders = config.map(folder => {
    const books = [];
    (folder.books || []).forEach(wanted => {
      const actual = byNormalized[normalizeBookName_(wanted)];
      if (actual && !assigned[actual]) {
        assigned[actual] = true;
        books.push(actual);
      }
    });
    return { name: (folder.name || '').toString(), books };
  }).filter(f => f.name);

  const leftovers = bookNames.filter(b => !assigned[b]);
  if (leftovers.length > 0) {
    folders.push({ name: UNFILED_FOLDER_NAME, books: leftovers });
  }
  return folders;
}

function getBooks_() {
  const books = Object.keys(getSpreadsheetsMap_());
  return { ok: true, books, folders: getBookFolders_(books) };
}

/**
 * คืนรายชื่อแท็บ ถ้าระบุ bookFilter จะคืนเฉพาะแท็บของไฟล์นั้น ถ้าไม่ระบุจะคืนของทุกไฟล์
 * ใช้ getLastRow() แทนการอ่านข้อมูลทั้งหมดมานับ เพื่อความเร็ว (ไม่ต้องเป๊ะ 100% แค่ประมาณเพียงพอสำหรับโชว์)
 */
function getSheets_(bookFilter) {
  const entries = getAllSheetEntries_(bookFilter, null);
  const sheetList = entries.map(entry => ({
    book: entry.book,
    name: entry.sheet.getName(),
    rowCount: Math.max(entry.sheet.getLastRow() - 1, 0)
  }));
  return { ok: true, sheets: sheetList, updatedAt: new Date().toISOString() };
}

/** รวมแท็บ (ที่ไม่ถูกซ่อน ทั้งแบบซ่อนจริงในชีตและแบบระบุชื่อเอง) จากไฟล์ที่ระบุ (หรือทุกไฟล์ถ้าไม่ระบุ) เป็นลิสต์เดียว พร้อมชื่อไฟล์กำกับ */
function getAllSheetEntries_(bookFilter, sheetFilter) {
  const map = getSpreadsheetsMap_();
  const entries = [];
  Object.keys(map).forEach(book => {
    if (bookFilter && bookFilter !== book) return;
    const ss = SpreadsheetApp.openById(map[book]);
    ss.getSheets().forEach(sheet => {
      if (sheet.isSheetHidden()) return; // ซ่อนแท็บไว้จริงในตัว Google Sheets เอง
      if (HIDDEN_SHEETS.includes(sheet.getName())) return; // หรือระบุชื่อไว้เองในโค้ด
      if (sheetFilter && sheetFilter !== sheet.getName()) return;
      entries.push({ book, sheet });
    });
  });
  return entries;
}

/** เช็คว่าแท็บนี้ควรถือว่า "ซ่อนอยู่" หรือไม่ (ซ่อนจริงในชีต หรือระบุชื่อไว้เองในโค้ด) */
function isHiddenSheet_(sheet) {
  return sheet.isSheetHidden() || HIDDEN_SHEETS.includes(sheet.getName());
}

/**
 * อ่านค่าจากช่วงเซลล์แบบปลอดภัย ถ้าเจอเซลล์ที่มีสูตรพัง (เช่น =VALUE(...) ใส่อาร์กิวเมนต์ผิด)
 * ปกติแล้วการอ่านทั้งช่วงจะพังไปทั้งหมดถ้ามีแค่ 1 เซลล์เสีย ฟังก์ชันนี้จะลองอ่านทีละแถวแทน
 * เพื่อให้เสียแค่เซลล์ที่พังจริงๆ (แสดงเป็น "#ERROR#") ไม่กระทบแถว/คอลัมน์อื่น
 */
function safeGetDisplayValues_(sheet, startRow, startCol, numRows, numCols) {
  if (numRows <= 0 || numCols <= 0) return [];
  try {
    return sheet.getRange(startRow, startCol, numRows, numCols).getDisplayValues();
  } catch (e) {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(safeReadRow_(sheet, startRow + i, startCol, numCols));
    }
    return rows;
  }
}

/** อ่านทั้งแถวแบบปลอดภัย ถ้าพังทั้งแถว จะลองอ่านทีละเซลล์แทน เพื่อระบุเฉพาะเซลล์ที่พังจริง */
function safeReadRow_(sheet, row, col, numCols) {
  try {
    return sheet.getRange(row, col, 1, numCols).getDisplayValues()[0];
  } catch (e) {
    const cells = [];
    for (let c = 0; c < numCols; c++) {
      try {
        cells.push(sheet.getRange(row, col + c).getDisplayValues()[0][0]);
      } catch (cellErr) {
        cells.push('#ERROR#');
      }
    }
    return cells;
  }
}

/**
 * บันทึกแคชแบบปลอดภัย ถ้าข้อมูลใหญ่เกิน 100KB (ขีดจำกัดของ CacheService) จะข้ามการแคชไปเงียบๆ
 * แทนที่จะปล่อยให้ทั้งคำขอพัง — แท็บที่มีข้อมูลเยอะจะแค่ไม่ได้ประโยชน์จากแคช ไม่ใช่ใช้งานไม่ได้เลย
 */
function safeCachePut_(cache, key, value) {
  try {
    cache.put(key, value, CACHE_SECONDS);
  } catch (e) {
    // ข้อมูลใหญ่เกินไปสำหรับแคช ('Argument too large: value') หรือเหตุผลอื่น ข้ามไปเฉยๆ
  }
}

function getSheetData_(book, name) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  const cache = CacheService.getScriptCache(); const cacheKey = `dashboard:${book}${BOOK_SEP}${name}`;
  const saved = cache.get(cacheKey); if (saved) return JSON.parse(saved);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const headerRowIndex = getHeaderRowIndex_(sheet); // 1 หรือ 2 แล้วแต่โครงสร้างชีต
  const values = safeGetDisplayValues_(sheet, 1, 1, lastRow, lastCol);
  const headerRowValues = values[headerRowIndex - 1] || [];
  const headers = headerRowValues.map((header, i) => header.trim() || `คอลัมน์ ${i + 1}`);
  const dataRows = values.slice(headerRowIndex); // ข้อมูลเริ่มหลังแถวหัวตารางจริง
  const rows = dataRows
    .map((row, idx) => ({ row, sheetRow: idx + headerRowIndex + 1 })) // แปลง index กลับเป็นเลขแถวจริงในชีต
    .filter(item => item.row.some(cell => cell.trim()))
    .map(item => {
      const record = {};
      headers.forEach((header, i) => record[header] = item.row[i] || '');
      record.__row = item.sheetRow; // เลขแถวจริงในชีต ใช้สำหรับลบแถวนี้จากหน้าตาราง
      return record;
    });
  const payload = { ok: true, headers, rows, updatedAt: new Date().toISOString() };
  safeCachePut_(cache, cacheKey, JSON.stringify(payload));
  return payload;
}

/**
 * ค้นหาแบบเต็มข้อความทุกเซลล์ เฉพาะไฟล์/แท็บที่ระบุเท่านั้น (ไม่ค้นทุกไฟล์พร้อมกันอีกต่อไป เพื่อความเร็ว)
 * ต้องระบุ bookFilter เสมอ (เลือกไฟล์ก่อนจึงค้นได้) ส่วน sheetFilter ถ้าไม่ระบุจะค้นทุกแท็บในไฟล์นั้น
 */
function searchAll_(keyword, bookFilter, sheetFilter, offsetParam, limitParam) {
  if (!bookFilter) throw new Error('กรุณาเลือกไฟล์ก่อนค้นหา');
  const kw = (keyword || '').toString().trim().toLowerCase();
  const entries = getAllSheetEntries_(bookFilter, sheetFilter);

  // แบ่งส่งเป็นช่วงๆ (ถ้าหน้าเว็บขอมา) — ดู getTabView_ ว่าทำไมถึงต้องแบ่ง
  const offset = Math.max(0, parseInt(offsetParam, 10) || 0);
  const limit = parseInt(limitParam, 10) || 0; // 0 = ส่งทั้งหมดเหมือนเดิม

  const results = [];
  let linksDeferred = false; // แท็บใหญ่เกินไป เลยยังไม่อ่านลิงก์ Ticket มาด้วย (หน้าเว็บจะขอทีหลังเฉพาะแถวที่แสดง)
  for (const entry of entries) {
    const values = getRawValues_(entry.book, entry.sheet);
    const skipRows = getHeaderRowIndex_(entry.sheet); // ข้ามแถวหัวตารางจริง (อาจเป็น 1 หรือ 2 แถว แล้วแต่โครงสร้างชีต)
    const dataRowCount = values.length - skipRows;

    // เตรียม URL จริงที่ซ่อนอยู่หลังข้อความในคอลัมน์ Ticket ไว้ล่วงหน้า (ถ้ามีคอลัมน์แบบนี้)
    //
    // สำคัญเรื่องความเร็ว: การอ่านลิงก์ (getRichTextValues/getFormulas) เป็นคำสั่งที่ช้าที่สุดในระบบ
    // แท็บที่มีข้อมูลหลักพันแถว (เช่น "ชีทพิจารณาปลด" ~9,000 แถว) ถ้าอ่านลิงก์ทั้งคอลัมน์ทุกครั้ง
    // จะใช้เวลานานจนเกิน 30 วินาที แล้วหน้าเว็บขึ้นว่า "เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด"
    // (แคชก็ช่วยไม่ได้ เพราะผลลัพธ์ของแท็บใหญ่เกิน 100KB ซึ่งเป็นเพดานของ CacheService จึงแคชไม่ติด)
    //
    // แท็บใหญ่เกินเกณฑ์จึงไม่อ่านลิงก์ตรงนี้ แต่ส่ง linksDeferred กลับไปบอกหน้าเว็บ
    // ให้ขอลิงก์เฉพาะแถวที่กำลังแสดงอยู่บนหน้าจอ (20-100 แถว) ผ่าน action 'rowLinks' แทน
    let ticketLinkColumns = {}; // { colIndex: [url แต่ละแถวข้อมูล ตามลำดับ] }
    if (dataRowCount > 0 && dataRowCount <= LINKS_INLINE_ROW_LIMIT) {
      const { headers } = getPositionalHeaders_(entry.sheet);
      const ticketColIndices = [];
      headers.forEach((h, i) => { if (isTicketHeaderName_(h)) ticketColIndices.push(i); });
      ticketLinkColumns = getCachedTicketLinksForSheet_(entry.book, entry.sheet, ticketColIndices, skipRows + 1, dataRowCount);
    } else if (dataRowCount > LINKS_INLINE_ROW_LIMIT) {
      linksDeferred = true;
    }

    for (let r = skipRows; r < values.length; r++) {
      const row = values[r];
      if (row.every(cell => !cell.trim())) continue;
      if (kw && !row.some(cell => cell.toLowerCase().includes(kw))) continue;

      const dataRowOffset = r - skipRows;
      const links = {};
      Object.keys(ticketLinkColumns).forEach(colIndexStr => {
        const url = ticketLinkColumns[colIndexStr][dataRowOffset];
        if (url) links[colIndexStr] = url;
      });

      const resultItem = { book: entry.book, sheet: entry.sheet.getName(), row: r + 1, cells: row };
      if (Object.keys(links).length > 0) resultItem.links = links;
      results.push(resultItem);

      if (results.length >= SEARCH_RESULT_LIMIT) {
        return finishSearchResult_(results, true, linksDeferred, offset, limit);
      }
    }
  }
  return finishSearchResult_(results, false, linksDeferred, offset, limit);
}

/**
 * ตัดผลลัพธ์ให้เหลือเฉพาะช่วงที่หน้าเว็บขอ แล้วแนบจำนวนทั้งหมดไปด้วย
 * ถ้าไม่ได้ขอช่วงมา (limit = 0) จะส่งทั้งหมดเหมือนเดิม เพื่อไม่ให้กระทบส่วนอื่นที่เรียกใช้อยู่
 */
function finishSearchResult_(results, truncated, linksDeferred, offset, limit) {
  const total = results.length;
  const page = limit > 0 ? results.slice(offset, offset + limit) : results;
  return {
    ok: true,
    results: page,
    total,
    offset: limit > 0 ? offset : 0,
    hasMore: limit > 0 ? (offset + page.length < total) : false,
    truncated,
    linksDeferred,
    updatedAt: new Date().toISOString()
  };
}

// แท็บที่มีข้อมูลเกินจำนวนนี้ จะไม่อ่านลิงก์ Ticket มาพร้อมผลค้นหา แต่ให้หน้าเว็บขอเฉพาะแถวที่แสดงอยู่แทน
// ตั้งไว้ 1,500 เพราะต่ำกว่านี้การอ่านทั้งคอลัมน์ยังเร็วพอ และผลลัพธ์ยังเล็กพอที่จะแคชได้
const LINKS_INLINE_ROW_LIMIT = 1500;

// หน้าเว็บขอลิงก์ได้ครั้งละไม่เกินกี่แถว (หน้าเว็บแสดงทีละ 20-100 แถว จึงเหลือเฟือ)
const ROW_LINKS_MAX = 200;

/**
 * อ่านลิงก์ Ticket เฉพาะ "แถวที่หน้าเว็บกำลังแสดงอยู่" เท่านั้น (ไม่กี่สิบแถว)
 * ใช้คู่กับ linksDeferred ของ searchAll_ สำหรับแท็บที่มีข้อมูลเยอะเกินกว่าจะอ่านลิงก์ทั้งคอลัมน์ได้ทัน
 *
 * @param {string} rowsParam เลขแถวจริงในชีต คั่นด้วย comma เช่น "8988,8989,8990"
 * @return {Object} { links: { "เลขแถว": { "เลขคอลัมน์": url } } }
 */
function getRowLinks_(book, sheetName, rowsParam) {
  if (!sheetName) throw new Error('ไม่พบชื่อชีต');
  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');

  const rows = (rowsParam || '').toString().split(',')
    .map(r => parseInt(r.trim(), 10))
    .filter(r => !!r && r > 0);
  if (!rows.length) return { ok: true, links: {} };
  if (rows.length > ROW_LINKS_MAX) throw new Error(`ขอลิงก์ได้ครั้งละไม่เกิน ${ROW_LINKS_MAX} แถว`);

  const { headers } = getPositionalHeaders_(sheet);
  const ticketColIndices = [];
  headers.forEach((h, i) => { if (isTicketHeaderName_(h)) ticketColIndices.push(i); });
  if (!ticketColIndices.length) return { ok: true, links: {} };

  const lastRow = sheet.getLastRow();
  const links = {};

  // อ่านเป็นช่วงต่อเนื่องทีเดียว (แถวที่หน้าเว็บแสดงมักเรียงติดกันอยู่แล้ว) แทนการอ่านทีละแถว
  const minRow = Math.min.apply(null, rows);
  const maxRow = Math.min(Math.max.apply(null, rows), lastRow);
  if (minRow > lastRow) return { ok: true, links: {} };
  const span = maxRow - minRow + 1;
  if (span <= 0 || span > ROW_LINKS_MAX * 2) return { ok: true, links: {} };

  ticketColIndices.forEach(colIndex => {
    let columnLinks;
    try {
      columnLinks = getTicketLinksForColumn_(sheet, colIndex, minRow, span);
    } catch (e) {
      return; // คอลัมน์นี้อ่านไม่ได้ ข้ามไป ไม่ให้ทั้งคำขอพัง
    }
    rows.forEach(rowNum => {
      const url = columnLinks[rowNum - minRow];
      if (!url) return;
      if (!links[rowNum]) links[rowNum] = {};
      links[rowNum][colIndex] = url;
    });
  });

  return { ok: true, links };
}

// CacheService เก็บได้ไม่เกิน 100KB ต่อ 1 คีย์ แท็บที่มีข้อมูลหลักพันแถวจะเกินเพดานนี้เสมอ
// ของเดิมพอเกินแล้ว safeCachePut_ จะข้ามการแคชไปเงียบๆ ผลคือแท็บใหญ่ "ไม่เคยถูกแคชเลย"
// ทุกครั้งที่ค้นหา/สลับหน้า/บันทึกข้อมูล ต้องอ่านชีตใหม่ทั้งแท็บ ซึ่งเป็นสาเหตุหนึ่งที่ทำให้โหลดช้ามาก
// จึงเปลี่ยนมาหั่นเก็บเป็นก้อนย่อยหลายคีย์ แล้วเก็บ "สารบัญ" บอกว่ามีกี่ก้อน
// สำคัญ: เพดาน 100KB ของ CacheService นับเป็น "ไบต์" ไม่ใช่ "ตัวอักษร"
// ภาษาไทยใช้ 3 ไบต์ต่อ 1 ตัวอักษร ดังนั้น 90,000 ตัวอักษรไทย = 255KB ซึ่งเกินเพดานไปมาก
// ผลคือ putAll โยน error แล้วถูกกลืนไปเงียบๆ ใน catch → แท็บที่มีข้อความไทยเยอะ "ไม่เคยแคชติดเลย"
// ทุกคำขอจึงต้องอ่านชีตใหม่ทั้งแท็บ เป็นสาเหตุหลักที่แท็บใหญ่โหลดช้ามาก
// ตั้ง 25,000 ตัวอักษร = 71KB แม้เป็นภาษาไทยล้วน จึงไม่มีทางชนเพดาน
const RAW_CACHE_CHUNK_CHARS = 25000;
const RAW_CACHE_MAX_CHUNKS = 250;    // รองรับได้ถึงราว 6 ล้านตัวอักษร (แท็บ 8,500 แถวใช้ราว 41 ก้อน)
const RAW_CACHE_PUT_BATCH = 50;      // putAll ทีละ 50 คีย์ กันชนขีดจำกัดจำนวนรายการต่อครั้ง

/** ดึงค่าดิบทั้งชีต แบบมี cache แยกตามไฟล์+แท็บ (อ่านแบบปลอดภัย ข้ามเซลล์สูตรพังโดยไม่ทำให้ทั้งชีตอ่านไม่ได้) */
function getRawValues_(book, sheet) {
  const cache = CacheService.getScriptCache();
  const baseKey = `raw:${book}${BOOK_SEP}${sheet.getName()}`;

  const cached = readChunkedCache_(cache, baseKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { /* แคชเสีย อ่านใหม่ */ }
  }

  const values = safeGetDisplayValues_(sheet, 1, 1, sheet.getLastRow(), sheet.getLastColumn());
  writeChunkedCache_(cache, baseKey, JSON.stringify(values));
  return values;
}

/**
 * อ่านค่าที่ถูกหั่นเก็บไว้หลายคีย์ แล้วต่อกลับเป็นข้อความเดียว
 * ถ้าก้อนใดก้อนหนึ่งหายไป (หมดอายุไม่พร้อมกัน) ถือว่าแคชใช้ไม่ได้ทั้งก้อน เพื่อไม่ให้ได้ข้อมูลขาดๆ หายๆ
 */
function readChunkedCache_(cache, baseKey) {
  const manifest = cache.get(`${baseKey}:n`);
  if (!manifest) return null;
  const count = parseInt(manifest, 10);
  if (!count || count < 1 || count > RAW_CACHE_MAX_CHUNKS) return null;

  // อ่านทีละชุดให้เท่ากับตอนเขียน (getAll ก็มีขีดจำกัดจำนวนคีย์ต่อครั้งเหมือนกัน)
  const parts = {};
  try {
    for (let start = 0; start < count; start += RAW_CACHE_PUT_BATCH) {
      const keys = [];
      for (let i = start; i < Math.min(start + RAW_CACHE_PUT_BATCH, count); i++) {
        keys.push(`${baseKey}:${i}`);
      }
      const got = cache.getAll(keys);
      Object.keys(got).forEach(k => { parts[k] = got[k]; });
    }
  } catch (e) {
    return null;
  }

  let joined = '';
  for (let i = 0; i < count; i++) {
    const part = parts[`${baseKey}:${i}`];
    if (part === undefined || part === null) return null; // ขาดไปก้อนหนึ่ง ใช้ไม่ได้
    joined += part;
  }
  return joined;
}

/** หั่นข้อความเก็บลงแคชหลายคีย์ พร้อมสารบัญบอกจำนวนก้อน (ล้มเหลวได้เงียบๆ แคชเป็นแค่ตัวช่วย ไม่ใช่ของจำเป็น) */
function writeChunkedCache_(cache, baseKey, value) {
  try {
    const count = Math.ceil(value.length / RAW_CACHE_CHUNK_CHARS);
    if (count > RAW_CACHE_MAX_CHUNKS) return; // ใหญ่เกินไป ไม่แคช

    // เขียนทีละชุด ชุดละไม่เกิน RAW_CACHE_PUT_BATCH คีย์
    // ถ้ายัดทีเดียวหลายร้อยคีย์ putAll อาจล้มทั้งก้อน แล้วกลายเป็นไม่ได้แคชอะไรเลย
    let batch = {};
    let inBatch = 0;
    for (let i = 0; i < count; i++) {
      batch[`${baseKey}:${i}`] = value.substr(i * RAW_CACHE_CHUNK_CHARS, RAW_CACHE_CHUNK_CHARS);
      inBatch++;
      if (inBatch >= RAW_CACHE_PUT_BATCH) {
        cache.putAll(batch, CACHE_SECONDS);
        batch = {};
        inBatch = 0;
      }
    }
    if (inBatch > 0) cache.putAll(batch, CACHE_SECONDS);
    // เขียนสารบัญ "ทีหลังสุด" เสมอ เพื่อให้ไม่มีช่วงเวลาที่สารบัญชี้ไปยังก้อนที่ยังเขียนไม่เสร็จ
    cache.put(`${baseKey}:n`, String(count), CACHE_SECONDS);
  } catch (e) {
    // แคชไม่สำเร็จก็ไม่เป็นไร แค่ทำงานช้าลง ไม่ใช่ใช้งานไม่ได้
  }
}

/**
 * บางชีตมี "หัวตาราง 2 ชั้น" (แถวที่ 1 เป็นป้ายกำกับหมวดสั้นๆ แถวที่ 2 ถึงเป็นชื่อคอลัมน์จริง)
 * ฟังก์ชันนี้เช็คว่าแถวไหนน่าจะเป็น "หัวตารางจริง" โดยเทียบว่าแถวไหนมีเซลล์ที่ไม่ว่างมากกว่ากัน
 * ถ้าแถวที่ 2 มีข้อมูลมากกว่าแถวที่ 1 อย่างชัดเจน ถือว่าแถวที่ 2 คือหัวตารางจริง (ข้ามแถวที่ 1 เป็นป้ายกำกับ)
 */
function getHeaderRowIndex_(sheet) {
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  if (lastCol === 0 || lastRow < 2) return 1;

  const row1 = safeReadRow_(sheet, 1, 1, lastCol).filter(v => v.trim() !== '');
  const row2 = safeReadRow_(sheet, 2, 1, lastCol).filter(v => v.trim() !== '');

  return row2.length > row1.length ? 2 : 1;
}

/**
 * คืนรายการคอลัมน์ที่ "มีชื่อหัวตาราง" เท่านั้น พร้อมตำแหน่งคอลัมน์จริง (index)
 * ใช้ข้ามคอลัมน์ว่างที่ไม่ได้ตั้งชื่อ ไม่ให้ขึ้นเป็นช่องกรอกในฟอร์ม
 */
function getHeaderMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  const headerRowIndex = getHeaderRowIndex_(sheet);
  const headerRow = safeReadRow_(sheet, headerRowIndex, 1, lastCol);
  return headerRow
    .map((header, i) => ({ index: i, name: header.trim() }))
    .filter(h => h.name !== '');
}

/**
 * คืนหัวตารางแบบเต็ม (ไม่ข้ามคอลัมน์ว่าง) เรียงตามตำแหน่งจริงในชีต ให้ตรงกับลำดับคอลัมน์ใน cells
 * ที่ได้จากผลค้นหา — คอลัมน์ที่ไม่มีชื่อหัวตารางในชีตจริง จะคืนเป็นสตริงว่าง (ให้หน้าเว็บซ่อนออกได้ถูกต้อง)
 */
function getPositionalHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  const headerRowIndex = getHeaderRowIndex_(sheet);
  const headerRow = lastCol > 0 ? safeReadRow_(sheet, headerRowIndex, 1, lastCol) : [];
  const headers = headerRow.map(h => h.trim());
  return { headerRowIndex, headers };
}

/**
 * คืนหัวตารางแบบเต็ม (ไม่ข้ามคอลัมน์ว่าง) เรียงตามตำแหน่งจริงในชีต — ใช้แสดงเป็นตารางบนหน้าเว็บ
 * ให้ตรงกับลำดับคอลัมน์ใน cells ที่ได้จากผลค้นหา พร้อมบอกตำแหน่งคอลัมน์ "สถานะ" ถ้ามี (ใช้ทำ dropdown กรองสถานะ)
 */
/**
 * รวม 3 คำสั่งที่หน้าเว็บต้องใช้พร้อมกันตอนเปิด/ค้นหาแท็บ ไว้ในคำขอเดียว
 * (หัวตาราง + ตัวเลือก dropdown ของคอลัมน์ + ผลค้นหา)
 *
 * ทำไมถึงสำคัญ: เดิมหน้าเว็บยิง 3 คำขอ "เรียงต่อกัน" ต้องรอคำขอก่อนหน้าเสร็จถึงจะยิงอันถัดไป
 * แต่ละคำขอมีค่าโสหุ้ยของ Apps Script เอง (ตรวจสิทธิ์ + เปิดไฟล์ + อ่านหัวตาราง) ประมาณ 0.5-2 วินาที
 * รวมแล้วกว่าตารางจะขึ้นใช้เวลา 2-6 วินาทีทุกครั้งที่สลับแท็บ/ค้นหา/บันทึก
 * พอรวมเป็นคำขอเดียว เหลือรอบเดียว และยังใช้ไฟล์/หัวตารางที่เปิดไว้แล้วร่วมกันได้ด้วย
 */
/**
 * ทำไมต้องแบ่งส่งเป็นช่วงๆ:
 * แท็บใหญ่อย่าง "ชีทพิจารณาปลด" (~9,000 แถว) ถ้าส่งข้อมูลทั้งแท็บมาในคำตอบเดียว
 * คำตอบจะมีขนาดราว 4.4 MB ซึ่งใหญ่เกินกว่าจะส่งทัน 30 วินาที หน้าเว็บจึงขึ้นว่า
 * "เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด" และโหลดข้อมูลไม่ได้เลยสักแถว
 *
 * หน้าเว็บจึงขอมาทีละช่วง (ดู TAB_CHUNK_SIZE ใน script.js) ช่วงละประมาณ 1 MB
 * ช่วงแรกแสดงผลได้ทันที ช่วงที่เหลือทยอยต่อท้ายให้เอง ผู้ใช้ไม่ต้องรอครบทั้งแท็บ
 *
 * หัวตารางและตัวเลือก dropdown ส่งเฉพาะช่วงแรก (offset = 0) เท่านั้น
 * ช่วงถัดๆ ไปไม่ต้องอ่านซ้ำ เพราะหน้าเว็บเก็บไว้แล้ว
 */
function getTabView_(book, sheetName, keyword, offset, limit, slim) {
  if (!sheetName) throw new Error('ไม่พบชื่อชีต');

  const isFirstChunk = !(parseInt(offset, 10) > 0);
  let headers = [];
  let statusIndex = -1;
  let headersMeta = [];

  if (isFirstChunk) {
    const tableHeaders = getTableHeaders_(book, sheetName);
    headers = tableHeaders.headers;
    statusIndex = tableHeaders.statusIndex;
    // ดึงตัวเลือก dropdown เฉพาะตอนที่แท็บนี้มีคอลัมน์ "สถานะ" จริงๆ (ใช้ทำช่องเลือกสถานะในตาราง)
    if (statusIndex !== -1) {
      try {
        headersMeta = getSheetHeaders_(book, sheetName).headers;
      } catch (e) {
        headersMeta = []; // ดึงไม่ได้ก็ยังแสดงตารางได้ แค่ไม่มีช่องเลือกสถานะ
      }
    }
  }

  const search = searchAll_(keyword, book, sheetName, offset, limit);

  // ตัดชื่อไฟล์และชื่อแท็บออกจากทุกแถว เพราะหน้านี้ดูแท็บเดียว ค่าจึงซ้ำกันหมดทุกแถว
  // แท็บ 8,500 แถวประหยัดได้เกือบ 1 MB ต่อการโหลด 1 ครั้ง (หน้าเว็บเติมค่ากลับเองหลังรับข้อมูล)
  search.results.forEach(item => {
    delete item.book;
    delete item.sheet;
  });

  // ส่งเฉพาะคอลัมน์ที่ตารางรายการใช้แสดงจริง (วันที่ / EXE ID / Ticket)
  // คอลัมน์ข้อความยาวที่เหลือไม่ต้องส่ง ผู้ใช้กดปุ่ม "ดูข้อมูล" แล้วค่อยดึงทั้งแถวทีหลัง
  // คงตำแหน่ง index เดิมไว้ (ช่องที่ไม่ได้ส่งเป็นค่าว่าง) เพื่อให้เทียบกับหัวตารางได้ตรงกันเหมือนเดิม
  let listColumns = null;
  if (slim) {
    const fullHeaders = isFirstChunk ? headers : getTableHeaders_(book, sheetName).headers;
    listColumns = pickListColumns_(fullHeaders);
    if (listColumns.length > 0) {
      const keep = {};
      listColumns.forEach(i => { keep[i] = true; });

      // ต้องส่งคอลัมน์ "สถานะ" มาด้วยเสมอ แม้ตารางจะไม่ได้แสดงคอลัมน์นี้
      // เพราะช่องกรองสถานะด้านบนตารางกรองจากค่าในแถวที่โหลดมา ไม่ได้ถามเซิร์ฟเวอร์ใหม่
      // ถ้าตัดออก ทุกแถวจะมีสถานะว่าง เลือกสถานะไหนก็ขึ้น "ไม่พบข้อมูล" ทั้งที่ในชีตมีอยู่จริง
      // ค่าในคอลัมน์นี้สั้นมาก (ไม่กี่ตัวอักษร) จึงแทบไม่กระทบขนาดข้อมูลที่ส่ง
      const statusIdx = fullHeaders.findIndex(h => {
        const s = (h || '').toString().trim();
        return s === 'สถานะ' || s.toLowerCase() === 'status';
      });
      if (statusIdx !== -1) keep[statusIdx] = true;
      search.results.forEach(item => {
        const trimmed = [];
        for (let i = 0; i < item.cells.length; i++) trimmed.push(keep[i] ? item.cells[i] : '');
        item.cells = trimmed;
      });
    } else {
      listColumns = null; // หาคอลัมน์ที่ต้องการไม่เจอเลย ส่งทั้งแถวไปตามเดิมดีกว่าโชว์ตารางว่าง
    }
  }

  return {
    ok: true,
    headers: headers,
    listColumns: listColumns,
    statusIndex: statusIndex,
    headersMeta: headersMeta,
    results: search.results,
    total: search.total,
    offset: search.offset,
    hasMore: !!search.hasMore,
    truncated: !!search.truncated,
    linksDeferred: !!search.linksDeferred
  };
}

function getTableHeaders_(book, name) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  const { headerRowIndex, headers } = getPositionalHeaders_(sheet);
  const statusIndex = headers.findIndex(h => h === 'สถานะ' || h.toLowerCase() === 'status');
  return { ok: true, headers, statusIndex, headerRowIndex };
}

/**
 * เลือกว่าจะส่งคอลัมน์ไหนมาแสดงในตารางรายการ (ไม่ใช่ทุกคอลัมน์)
 *
 * ตารางรายการแสดงแค่ วันที่ / EXE ID / ลิงก์ Ticket เท่านั้น (บวกเลขแถวที่หน้าเว็บใส่ให้เอง)
 * คอลัมน์ที่เหลือ โดยเฉพาะคอลัมน์ข้อความยาวอย่าง "รายละเอียด" หรือ "ITEM" ไม่ต้องส่งมา
 * เพราะเป็นตัวที่กินขนาดข้อมูลมากที่สุด และผู้ใช้ดูได้จากปุ่ม "ดูข้อมูล" ทีละแถวอยู่แล้ว
 *
 * จับคู่จาก "ชื่อคอลัมน์" ไม่ใช่ตำแหน่ง เพราะแต่ละชีตเรียงคอลัมน์ไม่เหมือนกัน
 * และตั้งชื่อต่างกัน (เช่น "วันที่" กับ "DATE", "Ticket / ลิ้ง" กับ "TICKET")
 *
 * @return {Array<number>} ตำแหน่งคอลัมน์ที่จะส่ง เรียงตามลำดับในชีต
 */
function pickListColumns_(headers) {
  const picked = [];
  (headers || []).forEach((name, index) => {
    const h = (name || '').toString().trim();
    if (!h) return;
    const lower = h.toLowerCase();
    const isDate = /วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test(h) || lower === 'date';
    const isExeId = /exe\s*[_-]?\s*id/i.test(h);
    const isTicket = isTicketHeaderName_(h);
    if (isDate || isExeId || isTicket) picked.push(index);
  });
  return picked;
}

/**
 * ดึงข้อมูลทั้งแถว (ทุกคอลัมน์) ของแถวเดียว ใช้ตอนกดปุ่ม "ดูข้อมูล" หรือ "แก้ไข"
 * เพราะตารางรายการส่งมาแค่ไม่กี่คอลัมน์ เพื่อให้โหลดเร็ว
 */
function getRowFull_(book, sheetName, rowParam) {
  if (!sheetName) throw new Error('ไม่พบชื่อชีต');
  const rowNum = parseInt(rowParam, 10);
  if (!rowNum) throw new Error('หมายเลขแถวไม่ถูกต้อง');

  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  const headerRowIndex = getHeaderRowIndex_(sheet);
  if (rowNum <= headerRowIndex) throw new Error('หมายเลขแถวไม่ถูกต้อง (เป็นแถวหัวตาราง)');
  if (rowNum > sheet.getLastRow()) throw new Error('ไม่พบแถวที่ระบุ (อาจถูกลบไปแล้ว)');

  const lastCol = sheet.getLastColumn();
  const { headers } = getPositionalHeaders_(sheet);
  const cells = safeReadRow_(sheet, rowNum, 1, lastCol);

  // ลิงก์จริงที่ซ่อนอยู่หลังข้อความในคอลัมน์ Ticket (ถ้ามี)
  const links = {};
  try {
    const richValues = sheet.getRange(rowNum, 1, 1, lastCol).getRichTextValues()[0];
    richValues.forEach((rich, index) => {
      if (!isTicketHeaderName_(headers[index])) return;
      const url = rich && rich.getLinkUrl();
      if (url) links[index] = url;
    });
  } catch (e) { /* อ่านลิงก์ไม่ได้ ยังแสดงข้อมูลได้ตามปกติ */ }

  return { ok: true, book, sheet: sheetName, row: rowNum, headers, cells, links };
}

/** เช็คว่าชื่อคอลัมน์นี้คือคอลัมน์ Ticket หรือไม่ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) */
function isTicketHeaderName_(name) {
  return /ticket/i.test((name || '').toString());
}

/**
 * บางคอลัมน์ Ticket ในชีตแสดงเป็นข้อความป้ายกำกับ (เช่น "Ticket #756950") แต่ข้อความนั้นถูกผูกลิงก์จริง
 * (Insert > Link) หรือเป็นสูตร =HYPERLINK("...", "...") ซ่อนอยู่เบื้องหลัง ไม่ใช่ URL ตรงๆ ในตัวข้อความเอง
 * ฟังก์ชันนี้ดึง URL จริงที่ซ่อนอยู่ออกมาทีละคอลัมน์ (อ่านทั้งคอลัมน์ครั้งเดียว ไม่ใช่ทีละเซลล์ เพื่อความเร็ว)
 * คืนเป็น array ของ URL (หรือ null ถ้าแถวนั้นไม่มีลิงก์ซ่อนอยู่) เรียงตามลำดับแถวข้อมูล
 */
/** อ่าน getRichTextValues()/getFormulas() พร้อมลองใหม่ 1 ครั้งถ้าพลาด (กัน API หลุดชั่วคราว ทำให้ลิงก์หายไปเงียบๆ) */
function readRangeWithRetry_(range, methodName) {
  try {
    return range[methodName]();
  } catch (e) {
    try {
      Utilities.sleep(300);
      return range[methodName]();
    } catch (e2) {
      return null;
    }
  }
}

// อ่านทีละก้อนใหญ่สุดกี่แถว (ป้องกันแท็บที่มีแถวจำนวนมาก เช่น 8,000-9,000+ แถว ที่พบว่าการอ่าน
// getRichTextValues()/getFormulas() แบบช่วงเดียวยาวๆ ทั้งคอลัมน์บางครั้งจะคืนค่าผิดพลาด/ว่างเปล่าเงียบๆ
// โดยไม่ throw error ให้เห็น — การแบ่งอ่านเป็นก้อนย่อยๆ ช่วยให้ถ้าก้อนไหนพลาดจริง จะเสียแค่ก้อนนั้น
// (บางแถวไม่มีลิงก์ไปชั่วคราว) ไม่ใช่ทั้งคอลัมน์หายไปหมดเหมือนก่อนหน้านี้
const TICKET_LINK_CHUNK_SIZE = 1000;

function getTicketLinksForColumn_(sheet, colIndex, startRow, numRows) {
  if (numRows <= 0) return [];

  const links = [];
  for (let offset = 0; offset < numRows; offset += TICKET_LINK_CHUNK_SIZE) {
    const chunkRows = Math.min(TICKET_LINK_CHUNK_SIZE, numRows - offset);
    const chunkLinks = getTicketLinksForColumnChunk_(sheet, colIndex, startRow + offset, chunkRows);
    for (let i = 0; i < chunkLinks.length; i++) links.push(chunkLinks[i]);
  }
  return links;
}

/** อ่าน getRichTextValues()/getFormulas() ของช่วงย่อยหนึ่งก้อน (สูงสุด TICKET_LINK_CHUNK_SIZE แถว) แล้วดึง URL ออกมา */
function getTicketLinksForColumnChunk_(sheet, colIndex, startRow, numRows) {
  const range = sheet.getRange(startRow, colIndex + 1, numRows, 1);

  const richValues = readRangeWithRetry_(range, 'getRichTextValues');
  const formulas = readRangeWithRetry_(range, 'getFormulas');

  const links = [];
  for (let i = 0; i < numRows; i++) {
    let url = null;

    if (richValues) {
      const rich = richValues[i][0];
      if (rich) {
        url = rich.getLinkUrl();
        if (!url) {
          const runs = rich.getRuns();
          for (let j = 0; j < runs.length; j++) {
            const runUrl = runs[j].getLinkUrl();
            if (runUrl) { url = runUrl; break; }
          }
        }
      }
    }

    if (!url && formulas && formulas[i][0]) {
      const match = formulas[i][0].match(/HYPERLINK\(\s*"([^"]+)"/i);
      if (match) url = match[1];
    }

    links.push(url || null);
  }
  return links;
}

/**
 * เหมือน getTicketLinksForColumn_ แต่แคชผลของทุกคอลัมน์ Ticket ในแท็บนี้ไว้ด้วยกันเป็นก้อนเดียว
 * (คีย์เดียวต่อแท็บ ไม่ใช่ต่อคอลัมน์ เพื่อให้ clearSheetCache_ ล้างแคชนี้ทิ้งได้ง่ายเวลาข้อมูลถูกแก้ไข)
 * เพื่อไม่ต้องอ่าน rich text/สูตรซ้ำทุกครั้งที่มีคนค้นหา โดยเฉพาะตอนค้นหาแบบ "ทั้งหมดในไฟล์นี้"
 * ที่ต้องวนดูทุกแท็บ — คืนเป็น { colIndex: [url แต่ละแถวข้อมูล] }
 */
// เพิ่มเลขเวอร์ชันไว้ในคีย์แคช เพื่อให้ทุกครั้งที่แก้โค้ดส่วนนี้แล้ว Deploy ใหม่ แคชเก่า (ที่อาจเป็นผลลัพธ์ผิดพลาด
// จากโค้ดเวอร์ชันก่อนหน้า) ถูกมองว่าเป็นคนละคีย์กันทันที ไม่ต้องรอให้หมดอายุเอง (300 วินาที) — กันปัญหา
// "แก้โค้ดแล้วแต่เว็บยังขึ้นผลลัพธ์แบบเดิม" เพราะแคชเก่าค้างอยู่
const TICKET_LINKS_CACHE_VERSION = 'v2';

function getCachedTicketLinksForSheet_(book, sheet, ticketColIndices, startRow, numRows) {
  if (ticketColIndices.length === 0) return {};
  const cache = CacheService.getScriptCache();
  const cacheKey = `ticketLinks:${TICKET_LINKS_CACHE_VERSION}:${book}${BOOK_SEP}${sheet.getName()}`;
  const saved = cache.get(cacheKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // ตรวจว่าจำนวนแถวที่แคชไว้ตรงกับจำนวนแถวข้อมูลตอนนี้ไหม — ถ้ามีคนแก้ไข/เพิ่ม/ลบแถวในชีตจริง
      // โดยตรง (ไม่ผ่านเว็บนี้) แคชเก่าจะมีจำนวนแถวไม่ตรงกับของจริง ทำให้ลิงก์เยื้องแถวผิดหรือหายไป
      // เงียบๆ (ปัญหาที่ทำให้ Ticket link บางครั้งขึ้นบางครั้งไม่ขึ้น) ถ้าตรวจพบว่าไม่ตรง ให้อ่านใหม่ทันที
      // แทนที่จะเชื่อแคชเก่า ไม่ต้องรอให้ครบเวลาหมดอายุ (300 วินาที)
      const isStale = ticketColIndices.some(colIndex => {
        const arr = parsed[colIndex];
        return !Array.isArray(arr) || arr.length !== numRows;
      });
      if (!isStale) return parsed;
    } catch (e) {
      // แคชอ่านไม่ได้ (ข้อมูลเสีย) ให้อ่านใหม่เหมือนไม่มีแคชเลย
    }
  }

  const result = {};
  ticketColIndices.forEach(colIndex => {
    result[colIndex] = getTicketLinksForColumn_(sheet, colIndex, startRow, numRows);
  });
  safeCachePut_(cache, cacheKey, JSON.stringify(result));
  return result;
}

/**
 * คืนแค่รายชื่อคอลัมน์ (แถวแรก) ของแท็บที่ระบุ ใช้สร้างฟอร์มกรอกข้อมูล/จัดการคอลัมน์ฝั่งหน้าเว็บ
 * เร็วกว่า getSheetData_ เพราะไม่ต้องอ่านข้อมูลทั้งหมด — ข้ามคอลัมน์ที่ไม่มีชื่อหัวตาราง
 * แต่ละคอลัมน์จะแนบ options มาด้วย ถ้าคอลัมน์นั้นตั้ง "ตรวจสอบข้อมูล" แบบเลือกจากรายการไว้ในชีตอยู่แล้ว
 */
function getSheetHeaders_(book, name) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  const headerMap = getHeaderMap_(sheet);
  const headers = headerMap.map(h => ({
    name: h.name,
    options: getDropdownOptions_(sheet, h.index)
  }));
  return { ok: true, headers };
}

/**
 * ถ้าคอลัมน์นี้มีการตั้งค่า Data Validation แบบ "เลือกจากรายการ" หรือ "เลือกจากช่วงเซลล์"
 * ไว้อยู่แล้วในชีต จะดึงตัวเลือกจริงออกมาคืนเป็น array ถ้าคอลัมน์นั้นไม่มีการตั้งค่าแบบนี้ จะคืนค่า null
 * (ให้ใช้ช่องกรอกข้อความปกติ) — ไล่ตรวจสอบทีละแถวจากแถวข้อมูลแถวแรกจริง (ข้ามแถวหัวตารางให้ถูกต้อง
 * ไม่ว่าหัวตารางจะเป็น 1 หรือ 2 แถว) ไปหลายแถว เผื่อบางแถวเป็นแถวคั่น/merge ที่ไม่มี validation ติดอยู่
 */
function getDropdownOptions_(sheet, colIndex) {
  try {
    const headerRowIndex = getHeaderRowIndex_(sheet);
    const lastRow = sheet.getLastRow();
    const firstDataRow = headerRowIndex + 1;
    if (firstDataRow > lastRow) return null;

    const scanLimit = Math.min(lastRow, firstDataRow + 19); // ตรวจสอบ 20 แถวแรกของข้อมูลก็เพียงพอ
    for (let row = firstDataRow; row <= scanLimit; row++) {
      const rule = sheet.getRange(row, colIndex + 1).getDataValidation();
      if (!rule) continue;

      const criteriaType = rule.getCriteriaType();
      if (criteriaType === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
        return rule.getCriteriaValues()[0];
      }
      if (criteriaType === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE) {
        const range = rule.getCriteriaValues()[0];
        return range.getValues()
          .map(r => r[0])
          .filter(v => v !== '' && v !== null && v !== undefined)
          .map(String);
      }
    }
    return null;
  } catch (e) {
    return null; // ถ้าดึงไม่ได้ด้วยเหตุผลใดก็ตาม ให้ตกกลับไปเป็นช่องกรอกข้อความปกติ ไม่ทำให้ทั้งฟอร์มพัง
  }
}

/**
 * เพิ่มแถวข้อมูลใหม่ต่อท้ายแท็บที่ระบุ
 * @param {string} book ชื่อไฟล์ปลายทาง (ตาม key ใน SPREADSHEETS)
 * @param {string} name ชื่อแท็บปลายทาง
 * @param {string} dataJson ข้อมูลรูปแบบ JSON string ของ object { "ชื่อคอลัมน์": "ค่า", ... }
 */
function addRecord_(book, name, dataJson, editor) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');

  let data;
  try {
    data = JSON.parse(dataJson || '{}');
  } catch (e) {
    throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
  }

  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) throw new Error('แท็บนี้ยังไม่มีหัวคอลัมน์ ไม่สามารถเพิ่มข้อมูลได้');
  const headerMap = getHeaderMap_(sheet);
  if (headerMap.length === 0) throw new Error('แท็บนี้ไม่มีคอลัมน์ที่ตั้งชื่อไว้ ไม่สามารถเพิ่มข้อมูลได้');

  const newRow = new Array(lastCol).fill('');
  headerMap.forEach(h => {
    if (data[h.name] !== undefined) newRow[h.index] = data[h.name];
  });

  const lastRowBeforeAdd = sheet.getLastRow();
  sheet.appendRow(newRow);
  const newRowIndex = sheet.getLastRow();

  // คัดลอกเส้นขอบ/รูปแบบตัวเลข และ Data Validation (dropdown) จากแถวข้อมูลแถวก่อนหน้ามาใส่แถวใหม่ด้วย
  // (แต่ไม่เอาสีพื้นเซลล์ติดมาด้วย — รีเซ็ตเป็นพื้นขาวปกติเสมอ กันกรณีแถวบนถูกทำสีไว้ด้วยมือ เช่น สีเขียว)
  copyRowFormatting_(sheet, lastRowBeforeAdd, newRowIndex, lastCol);

  // ขยายขอบเขตของ Conditional Format (เช่น dropdown แบบ chip สีของคอลัมน์ "เซิร์ฟเวอร์"/"สถานะ") ให้ครอบคลุม
  // แถวใหม่นี้ด้วย เพราะสีของ dropdown แบบ chip มาจากกฎ Conditional Format ของชีท ไม่ใช่สีพื้นเซลล์ตรงๆ
  // ถ้าขอบเขตกฎเดิมยังไม่ครอบคลุมแถวใหม่ (เช่นกฎตั้งไว้ถึงแค่แถวก่อนหน้า) สีจะไม่ขึ้นให้อัตโนมัติ
  extendConditionalFormatRangeForNewRow_(sheet, newRowIndex);

  // ช่องที่กรอกเป็น URL (เช่นลิงก์ Ticket) ให้กลายเป็นไฮเปอร์ลิงก์สีฟ้ากดได้ เหมือนพิมพ์เองในชีท
  applyUrlHyperlinks_(sheet, newRowIndex, newRow);

  clearSheetCache_(book, name);

  // บันทึกค่าที่กรอกเข้าไปจริงด้วย ไม่ใช่แค่บอกว่า "เพิ่มแถวใหม่"
  // ใช้รูปแบบเดียวกับตอนแก้ไขข้อมูล (คั่นคอลัมน์ด้วย " | ") หน้าเว็บจะได้แยกบรรทัดให้เองได้
  const filled = [];
  headerMap.forEach(h => {
    const value = formatCellForLog_(data[h.name]);
    if (value) filled.push(`${h.name}: "${truncateForLog_(value)}"`);
  });
  const addDetail = filled.length
    ? `${filled.length} คอลัมน์ | ${filled.join(' | ')}`
    : 'ไม่ได้กรอกข้อมูลในช่องใดเลย';

  logActivity_(editor, 'เพิ่มข้อมูล', `เพิ่มแถวใหม่ในแท็บ "${name}" (${book}) — ${addDetail}`);
  logCaseEvent_(editor, 'เพิ่มข้อมูล', book, name, `เพิ่มแถวใหม่ (แถวที่ ${newRowIndex}) — ${addDetail}`);

  return { ok: true, message: 'เพิ่มข้อมูลสำเร็จ', row: newRowIndex };
}

const LINK_TEXT_COLOR = '#1155cc'; // สีลิงก์มาตรฐานของ Google Sheets

/**
 * ทำให้เซลล์ที่มีค่าเป็น URL กลายเป็น "ไฮเปอร์ลิงก์จริง" (ตัวหนังสือสีฟ้า กดได้) เหมือนพิมพ์เองในชีท
 *
 * ทำไมต้องมี: setValues() เขียนลงไปเป็นข้อความธรรมดาเท่านั้น ชีทจะไม่ผูกลิงก์ให้เอง
 * ลิงก์ Ticket ที่บันทึกจากหน้าเว็บจึงขึ้นเป็นตัวหนังสือสีดำกดไม่ได้ ต่างจากแถวที่คนพิมพ์เองในชีท
 * แก้โดยเขียนทับเฉพาะเซลล์นั้นด้วย RichTextValue ที่ผูก URL ไว้
 *
 * ทำเฉพาะเซลล์ที่ "ทั้งช่องเป็น URL" เท่านั้น ข้อความอื่นไม่ถูกแตะ
 * เป็น best-effort — ถ้าพลาดจะไม่ทำให้การบันทึกข้อมูลหลักล้มเหลว
 *
 * @param {Array} values ค่าของทั้งแถว เรียงตามคอลัมน์จริงในชีท (index 0 = คอลัมน์ A)
 * @param {Array<number>} [onlyColumns] จำกัดเฉพาะบาง index ถ้าไม่ระบุจะดูทุกคอลัมน์
 */
function applyUrlHyperlinks_(sheet, rowNum, values, onlyColumns) {
  try {
    values.forEach((value, index) => {
      if (onlyColumns && onlyColumns.indexOf(index) === -1) return;

      const text = (value === null || value === undefined) ? '' : value.toString().trim();
      if (!/^https?:\/\/\S+$/i.test(text)) return; // ไม่ใช่ URL ล้วนๆ ข้ามไป

      try {
        // กำหนดสไตล์ลิงก์ให้ชัดเจน (ฟ้า + ขีดเส้นใต้) ไม่ปล่อยให้รับค่าจากรูปแบบของเซลล์
        // เพราะถ้าแถวนั้นถูกตั้งสีตัวอักษรไว้ (เช่นผู้ใช้เปลี่ยนสีแถวจากหน้าเว็บ) ลิงก์จะกลายเป็นสีนั้นตามไปด้วย
        const richText = SpreadsheetApp.newRichTextValue()
          .setText(text)
          .setLinkUrl(text)
          .setTextStyle(SpreadsheetApp.newTextStyle()
            .setForegroundColor(LINK_TEXT_COLOR)
            .setUnderline(true)
            .build())
          .build();
        sheet.getRange(rowNum, index + 1).setRichTextValue(richText);
      } catch (e) {
        // เซลล์นี้ผูกลิงก์ไม่ได้ (เช่น URL ยาวผิดปกติ) ข้ามไป ไม่ให้กระทบเซลล์อื่น
      }
    });
  } catch (e) {
    // best-effort — ไม่ throw ต่อ
  }
}

/**
 * คัดลอกรูปแบบเซลล์ (สีพื้น สีตัวอักษร เส้นขอบ ฯลฯ) และ Data Validation (dropdown) จาก sourceRow มาใส่ targetRow
 * ใช้ตอนเพิ่มแถวใหม่ผ่านเว็บ เพื่อให้แถวใหม่หน้าตาและ dropdown เหมือนแถวข้อมูลปกติ ไม่ใช่แถวเปล่า
 * เป็น best-effort — ถ้าคัดลอกไม่สำเร็จ (เช่นแท็บมีการป้องกันบางเซลล์) จะไม่ทำให้การเพิ่มข้อมูลหลักล้มเหลวตามไปด้วย
 */
function copyRowFormatting_(sheet, sourceRow, targetRow, numCols) {
  try {
    if (sourceRow < 1 || sourceRow === targetRow) return;
    const sourceRange = sheet.getRange(sourceRow, 1, 1, numCols);
    const targetRange = sheet.getRange(targetRow, 1, 1, numCols);
    sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

    // คัดลอก Dropdown แยกต่างหาก (ดูคำอธิบายในฟังก์ชันด้านล่าง)
    copyRowDataValidation_(sheet, targetRow, numCols, sourceRow);

    // ล้างสีพื้นเซลล์ที่ copy ติดมาด้วย (PASTE_FORMAT เอาสีพื้นมาด้วยเสมอ) ให้แถวใหม่เป็นพื้นขาวปกติเสมอ
    // ไม่ว่าแถวข้อมูลด้านบนจะถูกทำสีอะไรไว้ก็ตาม
    targetRange.setBackground('#ffffff');
  } catch (e) {
    // best-effort — ไม่ throw ต่อ
  }
}

/**
 * คัดลอก Dropdown (Data Validation) มาใส่แถวใหม่ ครอบคลุมทุกคอลัมน์ ไม่จำกัดชื่อคอลัมน์
 *
 * ยึด "แถวข้อมูลแถวแรก" ของแท็บเป็นต้นแบบก่อนเสมอ เพราะเป็นแถวที่ตั้งค่า Dropdown ไว้ถูกต้องตั้งแต่แรก
 * (ถ้ายึดแถวก่อนหน้าอย่างเดียว แล้วบังเอิญแถวนั้นเคยเสีย ความเสียจะลามต่อไปทุกแถวใหม่เรื่อยๆ)
 * ถ้าแถวต้นแบบไม่มี Dropdown เลย ค่อยถอยไปใช้แถวก่อนหน้าแทน
 *
 * ต้องใช้ copyTo แบบ PASTE_DATA_VALIDATION เท่านั้น (เหมือนกด Copy/Paste ในชีท) สีของแต่ละตัวเลือก (chip) จึงติดมาด้วย
 * ห้ามใช้ setDataValidations(getDataValidations()) เพราะ API อ่านสีไม่ได้ จะสร้างกฎใหม่ที่ไม่มีสี (กลายเป็นลูกศรสีดำ)
 */
function copyRowDataValidation_(sheet, targetRow, numCols, fallbackRow) {
  const targetRange = sheet.getRange(targetRow, 1, 1, numCols);

  const candidates = [];
  const firstDataRow = getHeaderRowIndex_(sheet) + 1;
  if (firstDataRow >= 1 && firstDataRow !== targetRow) candidates.push(firstDataRow);
  if (fallbackRow && fallbackRow >= 1 && fallbackRow !== targetRow && candidates.indexOf(fallbackRow) === -1) {
    candidates.push(fallbackRow);
  }

  for (let i = 0; i < candidates.length; i++) {
    try {
      const sourceRange = sheet.getRange(candidates[i], 1, 1, numCols);
      const validations = sourceRange.getDataValidations()[0];
      if (!validations.some(dv => !!dv)) continue; // แถวนี้ไม่มี Dropdown เลย ลองแถวถัดไป
      sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
      return true;
    } catch (e) {
      // แถวนี้อ่าน/คัดลอกไม่ได้ ลองแถวถัดไป
    }
  }
  return false;
}

/**
 * ขยายขอบเขตของกฎ Conditional Format ที่ใช้กับคอลัมน์ในแถวนี้ ให้ครอบคลุมแถวใหม่ที่เพิ่งเพิ่มด้วย
 * ใช้กับกรณีที่กฎเดิมตั้งขอบเขตไว้แค่ถึงแถวสุดท้ายก่อนหน้า (เช่น dropdown แบบ chip สีของ "เซิร์ฟเวอร์"/"สถานะ"
 * ที่ Google Sheets ผูกสีไว้กับกฎ Conditional Format ไม่ใช่สีพื้นเซลล์ตรงๆ) — จัดการเฉพาะกรณีปกติที่สุด คือ
 * แถวใหม่ต่อท้ายขอบเขตเดิมพอดี (กรณีเพิ่มแถวท้ายสุดของตาราง) เป็น best-effort ถ้าทำไม่ได้ก็ข้ามไปเงียบๆ
 */
function extendConditionalFormatRangeForNewRow_(sheet, newRowIndex) {
  try {
    const rules = sheet.getConditionalFormatRules();
    if (!rules || rules.length === 0) return;
    let changed = false;
    const updatedRules = rules.map(rule => {
      const ranges = rule.getRanges();
      let ruleChanged = false;
      const newRanges = ranges.map(range => {
        const startRow = range.getRow();
        const numRows = range.getNumRows();
        const endRow = startRow + numRows - 1;
        if (newRowIndex === endRow + 1) {
          ruleChanged = true;
          return sheet.getRange(startRow, range.getColumn(), numRows + 1, range.getNumColumns());
        }
        return range;
      });
      if (!ruleChanged) return rule;
      changed = true;
      return rule.copy().setRanges(newRanges).build();
    });
    if (changed) sheet.setConditionalFormatRules(updatedRules);
  } catch (e) {
    // best-effort — ไม่ throw ต่อ
  }
}

/**
 * ซ่อมแถวที่ถูกเพิ่มจากหน้าเว็บแล้ว Dropdown ไม่มีสี — ทุกไฟล์ ทุกแท็บ และ "ทุกคอลัมน์ที่เป็น Dropdown"
 * (ไม่จำกัดชื่อคอลัมน์ ใช้วิธีไล่ดูทุกคอลัมน์ว่าแถวข้อมูลแถวแรกมี Data Validation แบบตัวเลือกไหม)
 * ถ้ามี จะคัดลอก Dropdown ของแถวนั้น (ที่ยังมีสี chip ถูกต้อง) ลงไปทุกแถวที่เหลือในคอลัมน์เดียวกัน
 * ใช้ copyTo แบบ PASTE_DATA_VALIDATION = เหมือนกด Copy/Paste ในชีท สีของแต่ละตัวเลือกจึงติดไปด้วย
 * ไม่แตะค่าข้อมูลในเซลล์เลย ค่าที่เลือกไว้เดิมยังอยู่ครบ
 */
function repairDropdownChips_() {
  const map = getSpreadsheetsMap_();
  const results = [];
  const DROPDOWN_TYPES = [
    SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST,
    SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE,
  ];

  Object.keys(map).forEach(bookName => {
    let ss;
    try { ss = SpreadsheetApp.openById(map[bookName]); }
    catch (e) { results.push({ book: bookName, error: 'เปิดไฟล์ไม่ได้: ' + e.message }); return; }

    ss.getSheets().forEach(sheet => {
      if (isHiddenSheet_(sheet)) return;
      const sheetName = sheet.getName();
      let headerMap;
      try { headerMap = getHeaderMap_(sheet); } catch (e) { headerMap = []; }

      const startRow = getHeaderRowIndex_(sheet) + 1;
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow <= startRow || lastCol === 0) return;

      // อ่าน Data Validation ของแถวข้อมูลแถวแรกทีเดียวทั้งแถว (เร็วกว่าไล่อ่านทีละเซลล์)
      let firstRowValidations;
      try {
        firstRowValidations = sheet.getRange(startRow, 1, 1, lastCol).getDataValidations()[0];
      } catch (e) {
        results.push({ book: bookName, sheet: sheetName, error: 'อ่าน Data Validation ไม่ได้: ' + e.message });
        return;
      }

      firstRowValidations.forEach((dv, colIndex) => {
        if (!dv) return;
        let criteriaType;
        try { criteriaType = dv.getCriteriaType(); } catch (e) { return; }
        if (DROPDOWN_TYPES.indexOf(criteriaType) === -1) return; // ไม่ใช่ Dropdown (เช่น checkbox/วันที่) ข้ามไป

        const col = colIndex + 1;
        const headerName = (headerMap.find(h => h.index === colIndex) || {}).name || `คอลัมน์ที่ ${col}`;
        try {
          const source = sheet.getRange(startRow, col);
          const target = sheet.getRange(startRow + 1, col, lastRow - startRow, 1);
          source.copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
          results.push({ book: bookName, sheet: sheetName, column: headerName, rows: lastRow - startRow });
        } catch (e) {
          results.push({ book: bookName, sheet: sheetName, column: headerName, error: e.message });
        }
      });
    });
  });

  return { ok: true, repaired: results.length, results };
}

/**
 * ลบแถวข้อมูลออกจากชีตจริง (ใช้เลขแถวจริงที่ได้จากผลค้นหาเท่านั้น)
 * ป้องกันไม่ให้ลบแถวหัวตาราง (แถวที่ 1) — บันทึกสำเนาไว้ในถังขยะก่อนลบเสมอ เพื่อให้กู้คืนได้
 */
function deleteRow_(book, name, rowParam, editor, fingerprint) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const rowNum = parseInt(rowParam, 10);
  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  if (!rowNum || rowNum <= getHeaderRowIndex_(sheet)) throw new Error('หมายเลขแถวไม่ถูกต้อง หรือพยายามลบแถวหัวตาราง');
  if (rowNum > sheet.getLastRow()) throw new Error('ไม่พบแถวที่ระบุ (อาจถูกลบไปแล้ว)');

  // กันลบผิดแถว: ตรวจว่าแถวนี้ยังเป็นแถวเดิมที่ผู้ใช้เห็นบนหน้าเว็บ
  verifyRowFingerprint_(sheet, rowNum, fingerprint);

  const rowValues = safeReadRow_(sheet, rowNum, 1, sheet.getLastColumn());
  logTrash_(book, name, 'row', '', rowValues);

  sheet.deleteRow(rowNum);
  clearSheetCache_(book, name);
  logActivity_(editor, 'ลบแถว', `ลบแถวข้อมูลในแท็บ "${name}" (${book})`);
  logCaseEvent_(editor, 'ลบแถว', book, name, `ลบแถวที่ ${rowNum}`);

  return { ok: true, message: 'ลบข้อมูลสำเร็จ (กู้คืนได้ที่ปุ่มถังขยะ)' };
}

/**
 * แก้ไขข้อมูลแถวที่มีอยู่แล้วในชีตจริง (เขียนทับเฉพาะคอลัมน์ที่ส่งมาใน dataJson)
 * ใช้ได้ทั้งแก้ไขทั้งแถวจากหน้าเว็บ และแก้ไขแค่ช่อง "สถานะ" อย่างเดียว (ส่ง data มาแค่คอลัมน์เดียว)
 * บันทึกค่าเดิมของแถวไว้ในถังขยะก่อนเขียนทับเสมอ เพื่อให้กู้คืนค่าเดิมได้ถ้าแก้ไขผิด
 * @param {string} book ชื่อไฟล์ปลายทาง
 * @param {string} name ชื่อแท็บปลายทาง
 * @param {string|number} rowParam เลขแถวจริงในชีต (ต้องมาจากผลค้นหาเท่านั้น)
 * @param {string} dataJson JSON string ของ object { "ชื่อคอลัมน์": "ค่าใหม่", ... } — ใส่แค่คอลัมน์ที่ต้องการแก้ไขก็ได้
 */
function updateRow_(book, name, rowParam, dataJson, editor, fingerprint) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const rowNum = parseInt(rowParam, 10);
  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  if (!rowNum || rowNum <= getHeaderRowIndex_(sheet)) throw new Error('หมายเลขแถวไม่ถูกต้อง หรือพยายามแก้ไขแถวหัวตาราง');
  if (rowNum > sheet.getLastRow()) throw new Error('ไม่พบแถวที่ระบุ (อาจถูกลบไปแล้ว)');

  // กันเขียนทับผิดแถว: ตรวจว่าแถวนี้ยังเป็นแถวเดิมที่ผู้ใช้เห็นบนหน้าเว็บ
  verifyRowFingerprint_(sheet, rowNum, fingerprint);

  let data;
  try {
    data = JSON.parse(dataJson || '{}');
  } catch (e) {
    throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
  }

  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) throw new Error('แท็บนี้ยังไม่มีหัวคอลัมน์ ไม่สามารถแก้ไขข้อมูลได้');
  const headerMap = getHeaderMap_(sheet);
  if (headerMap.length === 0) throw new Error('แท็บนี้ไม่มีคอลัมน์ที่ตั้งชื่อไว้ ไม่สามารถแก้ไขข้อมูลได้');

  // บันทึกค่าเดิมไว้ในถังขยะก่อนเขียนทับ เพื่อให้กู้คืนค่าเดิมได้ (จะไปเพิ่มเป็นแถวใหม่ท้ายชีตถ้ากู้คืน)
  const oldValues = safeReadRow_(sheet, rowNum, 1, lastCol);
  logTrash_(book, name, 'row', '', oldValues);

  const currentRange = sheet.getRange(rowNum, 1, 1, lastCol);
  const newValues = currentRange.getValues()[0];
  const oldSnapshot = newValues.slice(); // ค่าก่อนเขียนทับ ใช้เทียบว่าแต่ละคอลัมน์เปลี่ยนจากอะไรเป็นอะไร

  const submittedColumns = [];  // ทุกคอลัมน์ที่ฟอร์มส่งมา (ส่วนใหญ่คือทั้งแถว)
  const changedColumns = [];    // เฉพาะคอลัมน์ที่ค่าเปลี่ยนไปจริงๆ
  const changeDetails = [];
  headerMap.forEach(h => {
    if (data[h.name] === undefined) return;
    newValues[h.index] = data[h.name];
    submittedColumns.push(h.name);
    // เทียบกันด้วยค่าที่ "จัดรูปแบบแล้ว" ทั้งสองฝั่ง ไม่งั้นช่องวันที่จะขึ้นว่าถูกแก้ทุกครั้ง
    const oldVal = formatCellForLog_(oldSnapshot[h.index]);
    const newVal = formatCellForLog_(data[h.name]);
    if (oldVal !== newVal) {
      changedColumns.push(h.name);
      changeDetails.push(
        `${h.name}: "${truncateForLog_(oldVal || '(ว่าง)')}" → "${truncateForLog_(newVal || '(ว่าง)')}"`
      );
    }
  });
  if (submittedColumns.length === 0) throw new Error('ไม่มีข้อมูลที่จะแก้ไข');

  currentRange.setValues([newValues]);

  // ช่องที่เพิ่งแก้แล้วมีค่าเป็น URL ให้ผูกไฮเปอร์ลิงก์ให้ด้วย (แก้เฉพาะคอลัมน์ที่เปลี่ยน ไม่ไปแตะช่องอื่น)
  const changedIndices = headerMap.filter(h => data[h.name] !== undefined).map(h => h.index);
  applyUrlHyperlinks_(sheet, rowNum, newValues, changedIndices);

  // ถ้าไม่ได้แก้คอลัมน์ Ticket เลย ให้เก็บแคชลิงก์ Ticket ไว้ (ไม่ต้องไปอ่านใหม่ทั้งคอลัมน์รอบหน้า)
  const touchedTicketColumn = submittedColumns.some(colName => isTicketHeaderName_(colName));
  clearSheetCache_(book, name, !touchedTicketColumn);

  // Log ต้องบอกเฉพาะ "คอลัมน์ที่เปลี่ยนจริง" พร้อมค่าเดิม → ค่าใหม่ทุกคอลัมน์
  // (เดิมไล่ชื่อทุกคอลัมน์ที่ฟอร์มส่งมา ทำให้ดูเหมือนแก้ไป 11 คอลัมน์ ทั้งที่เปลี่ยนจริงแค่ช่องเดียว)
  const detailText = changeDetails.length
    ? `${changedColumns.length} คอลัมน์ | ${changeDetails.join(' | ')}`
    : 'กดบันทึกแต่ไม่มีค่าใดเปลี่ยนแปลง';
  logActivity_(editor, 'แก้ไขข้อมูล', `แก้ไขแถวข้อมูลในแท็บ "${name}" (${book}) — ${detailText}`);
  logCaseEvent_(editor, 'แก้ไขข้อมูล', book, name, `แก้ไขแถวที่ ${rowNum} — ${detailText}`);

  return { ok: true, message: 'แก้ไขข้อมูลสำเร็จ (กู้คืนค่าเดิมได้ที่ปุ่มถังขยะ)' };
}

/**
 * เปลี่ยนสีพื้นหลังและ/หรือสีตัวอักษรของทั้งแถว (ทุกคอลัมน์) — ใช้ตอนเพิ่มข้อมูลใหม่หรือแก้ไขข้อมูลจากหน้าเว็บ
 * ถ้าไม่ส่ง bg หรือ font มา (ค่าว่าง) จะไม่แตะต้องสีนั้น (ตั้งแค่สีพื้นอย่างเดียว หรือแค่สีตัวอักษรอย่างเดียวก็ได้)
 * @param {string} bg สีพื้นหลัง รูปแบบ hex เช่น "#ffcc00" (ส่งค่าว่างถ้าไม่ต้องการเปลี่ยน)
 * @param {string} font สีตัวอักษร รูปแบบ hex เช่น "#000000" (ส่งค่าว่างถ้าไม่ต้องการเปลี่ยน)
 */
function setRowColor_(book, name, rowParam, bg, font, editor) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  const rowNum = parseInt(rowParam, 10);
  if (!rowNum || rowNum < 2) throw new Error('หมายเลขแถวไม่ถูกต้อง หรือพยายามเปลี่ยนสีแถวหัวตาราง');

  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');
  if (rowNum > sheet.getLastRow()) throw new Error('ไม่พบแถวที่ระบุ (อาจถูกลบไปแล้ว)');

  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) throw new Error('แท็บนี้ยังไม่มีหัวคอลัมน์');

  const range = sheet.getRange(rowNum, 1, 1, lastCol);
  const bgValue = (bg || '').toString().trim();
  const fontValue = (font || '').toString().trim();

  // อ่านสีเดิมไว้ก่อนเปลี่ยน เพื่อบันทึกลง Log ว่าเปลี่ยนจากสีอะไรเป็นสีอะไร
  // ใช้สีของเซลล์แรกเป็นตัวแทนทั้งแถว (ทั้งแถวถูกตั้งสีพร้อมกันอยู่แล้ว)
  let oldBg = '';
  let oldFont = '';
  try {
    const firstCell = sheet.getRange(rowNum, 1);
    oldBg = (firstCell.getBackground() || '').toString().toLowerCase();
    oldFont = (firstCell.getFontColor() || '').toString().toLowerCase();
  } catch (e) { /* อ่านสีเดิมไม่ได้ ไม่เป็นไร แค่ Log จะไม่มีค่าเดิม */ }

  if (bgValue) range.setBackground(bgValue);
  if (fontValue) range.setFontColor(fontValue);

  // การตั้งสีตัวอักษรทับทั้งแถว จะลบสไตล์ลิงก์ของช่องที่เป็น URL ไปด้วย (ลิงก์กลายเป็นสีเดียวกับแถว)
  // จึงต้องผูกลิงก์พร้อมสไตล์ลิงก์กลับเข้าไปใหม่หลังเปลี่ยนสีเสร็จ
  if (fontValue) {
    applyUrlHyperlinks_(sheet, rowNum, safeReadRow_(sheet, rowNum, 1, lastCol));
  }

  clearSheetCache_(book, name);

  const colorChanges = [];
  if (bgValue && bgValue.toLowerCase() !== oldBg) {
    colorChanges.push(`สีพื้นหลัง: ${colorLabelForLog_(oldBg)} → ${colorLabelForLog_(bgValue)}`);
  }
  if (fontValue && fontValue.toLowerCase() !== oldFont) {
    colorChanges.push(`สีตัวอักษร: ${colorLabelForLog_(oldFont)} → ${colorLabelForLog_(fontValue)}`);
  }
  const colorDetail = colorChanges.length ? colorChanges.join(' | ') : 'เลือกสีเดิม ไม่มีอะไรเปลี่ยน';

  logActivity_(editor, 'เปลี่ยนสีแถว', `เปลี่ยนสีแถวที่ ${rowNum} ในแท็บ "${name}" (${book}) — ${colorDetail}`);
  // บันทึกลง Log กลางด้วย เพื่อให้เห็นในประวัติเคสว่าใครเปลี่ยนสีแถวนี้เป็นสีอะไรเมื่อไหร่
  logCaseEvent_(editor, 'เปลี่ยนสีแถว', book, name, `เปลี่ยนสีแถวที่ ${rowNum} — ${colorDetail}`);

  return { ok: true, message: 'เปลี่ยนสีแถวสำเร็จ' };
}

/**
 * ลบคอลัมน์ทั้งคอลัมน์ออกจากชีตจริง โดยระบุด้วย "ชื่อคอลัมน์" (ไม่ใช่ตำแหน่ง)
 * เพื่อความปลอดภัย เพราะตำแหน่งอาจเปลี่ยนได้ถ้ามีคนลบคอลัมน์อื่นไปก่อนหน้า
 * บันทึกสำเนาไว้ในถังขยะก่อนลบเสมอ เพื่อให้กู้คืนได้
 */
function deleteColumn_(book, name, columnName, editor) {
  if (!name) throw new Error('ไม่พบชื่อชีต');
  if (!columnName) throw new Error('ไม่พบชื่อคอลัมน์ที่จะลบ');

  const sheet = getSpreadsheet_(book).getSheetByName(name);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบชีตที่ร้องขอ');

  const headerMap = getHeaderMap_(sheet);
  const match = headerMap.find(h => h.name === columnName);
  if (!match) throw new Error('ไม่พบคอลัมน์ที่ระบุ (อาจถูกลบไปแล้ว)');

  // ต้องเริ่มอ่านจากแถวแรกของ "ข้อมูลจริง" ไม่ใช่แถวที่ 2 ตายตัว
  // เพราะบางชีทมีหัวตาราง 2 ชั้น (แถว 1 เป็นป้ายหมวด แถว 2 เป็นชื่อคอลัมน์จริง)
  // ถ้ายึดแถว 2 ตายตัว ชื่อคอลัมน์จะถูกเก็บลงถังขยะปนมาเป็นข้อมูล แล้วตอนกู้คืนจะเลื่อนผิดทั้งคอลัมน์
  const headerRowIndex = getHeaderRowIndex_(sheet);
  const firstDataRow = headerRowIndex + 1;
  const lastRow = sheet.getLastRow();
  const values = lastRow >= firstDataRow
    ? safeGetDisplayValues_(sheet, firstDataRow, match.index + 1, lastRow - headerRowIndex, 1).map(r => r[0])
    : [];
  logTrash_(book, name, 'column', columnName, values);

  sheet.deleteColumn(match.index + 1);
  clearSheetCache_(book, name);
  logActivity_(editor, 'ลบคอลัมน์', `ลบคอลัมน์ "${columnName}" ในแท็บ "${name}" (${book})`);
  logCaseEvent_(editor, 'ลบคอลัมน์', book, name, `ลบคอลัมน์ "${columnName}"`);

  return { ok: true, message: 'ลบคอลัมน์สำเร็จ (กู้คืนได้ที่ปุ่มถังขยะ)' };
}

/* ===== ระบบเก็บประวัติการแก้ไข (event log) สำหรับรายงานเคสประจำวัน ===== */

/**
 * เปิด (หรือสร้างถ้ายังไม่เคยมี) สเปรดชีตกลางสำหรับเก็บ Log เหตุการณ์ทั้งหมดของทุกไฟล์
 * เก็บ ID ไว้ใน Script Properties ครั้งเดียว ครั้งต่อไปจะเปิดไฟล์เดิมเสมอ
 * แยกเป็นสเปรดชีตต่างหาก (ไม่ปนกับไฟล์ข้อมูล) เพื่อไม่ให้กระทบไฟล์ของทีมเวลาเปิดดู/แชร์
 */
function getLogSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty(LOG_SPREADSHEET_PROPERTY);
  if (savedId) {
    // ห้าม catch แล้วสร้างไฟล์ใหม่เด็ดขาด — ถ้าเปิดไม่ได้ชั่วคราว (เน็ตสะดุด/สิทธิ์มีปัญหา)
    // แล้วไปสร้างไฟล์ Log ใหม่ ประวัติทั้งหมดที่ผ่านมาจะหายไปเงียบๆ และรายงานย้อนหลังจะกลายเป็นศูนย์
    return SpreadsheetApp.openById(savedId);
  }
  const ss = SpreadsheetApp.create('Sheet Search - บันทึกเหตุการณ์ (Log)');
  props.setProperty(LOG_SPREADSHEET_PROPERTY, ss.getId());
  return ss;
}

/** ตัดข้อความให้สั้นลงก่อนใส่ในรายละเอียด log กันแถวยาวเกินไปถ้ามีคนใส่ข้อความยาวๆ ในบางคอลัมน์ */
function truncateForLog_(value) {
  const str = (value || '').toString();
  const MAX_LEN = 80;
  return str.length > MAX_LEN ? str.slice(0, MAX_LEN) + '…' : str;
}

/**
 * แปลงค่าในเซลล์ให้เป็นข้อความแบบเดียวกับที่เห็นบนหน้าเว็บ ก่อนเอาไปเทียบว่า "เปลี่ยนไปไหม" และก่อนเขียนลง Log
 *
 * จำเป็นเพราะช่องวันที่: หน้าเว็บส่งมาเป็นข้อความ "01/10/2026" แต่ชีตเก็บเป็นชนิดวันที่
 * พออ่านกลับมาด้วย getValues() จะได้ Date object ซึ่ง .toString() ออกมาเป็น
 * "Thu Oct 01 2026 00:00:00 GMT+0700 (เวลาอินโดจีน)" ไม่มีทางตรงกับ "01/10/2026" เลย
 * ระบบจึงเข้าใจผิดว่าช่องวันที่ถูกแก้ไขทุกครั้ง ทั้งที่ผู้ใช้ไม่ได้แตะเลย (ตามที่เห็นใน Log)
 */
function formatCellForLog_(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    const tz = Session.getScriptTimeZone();
    const hasTime = value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0;
    return Utilities.formatDate(value, tz, hasTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
  }
  const str = value.toString().trim();
  // เติมเลข 0 ข้างหน้าให้วันที่แบบ 1/10/2026 กลายเป็น 01/10/2026 จะได้เทียบกันได้ตรงๆ
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
  }
  return str;
}

/** ชื่อสีภาษาไทยของสีที่ใช้บ่อย เพื่อให้ Log อ่านรู้เรื่องกว่าการเห็นแต่รหัส hex */
const COLOR_NAMES_ = {
  '#ffffff': 'ขาว', '#000000': 'ดำ', '#ff0000': 'แดง', '#00ff00': 'เขียว',
  '#0000ff': 'น้ำเงิน', '#ffff00': 'เหลือง', '#ff9900': 'ส้ม', '#9900ff': 'ม่วง',
  '#ff00ff': 'ชมพู', '#00ffff': 'ฟ้า', '#999999': 'เทา', '#cccccc': 'เทาอ่อน',
  '#666666': 'เทาเข้ม', '#f4cccc': 'ชมพูอ่อน', '#fce5cd': 'ส้มอ่อน',
  '#fff2cc': 'เหลืองอ่อน', '#d9ead3': 'เขียวอ่อน', '#cfe2f3': 'ฟ้าอ่อน',
  '#d9d2e9': 'ม่วงอ่อน', '#ead1dc': 'ชมพูนวล', '#1155cc': 'น้ำเงินลิงก์'
};

/** แปลงรหัสสีเป็นข้อความอ่านง่าย เช่น "#ffff00" → "เหลือง (#ffff00)" */
function colorLabelForLog_(hex) {
  const value = (hex || '').toString().trim().toLowerCase();
  if (!value) return '(ไม่เปลี่ยน)';
  const name = COLOR_NAMES_[value];
  return name ? `${name} (${value})` : value;
}

/** เปิด (หรือสร้างถ้ายังไม่มี) แท็บเก็บ Log เหตุการณ์ พร้อมหัวตาราง */
/**
 * แท็บ Log ของ "ปีปัจจุบัน" สำหรับเขียนบันทึกใหม่ (สร้างให้อัตโนมัติเมื่อขึ้นปีใหม่)
 *
 * ทำไมต้องแยกรายปี: เดิมทุกเหตุการณ์ต่อท้ายแท็บเดียวไปเรื่อยๆ ไม่มีวันจบ และ Dashboard กับรายงาน
 * ต้องอ่านทั้งแท็บทุกครั้ง พอใช้ไปหลายเดือนแถวสะสมเป็นหมื่น ทุกหน้าที่พึ่ง Log จะช้าลงเรื่อยๆ
 * การแยกรายปีทำให้แต่ละแท็บมีขนาดจำกัด และการอ่านข้ามไปปีที่ไม่เกี่ยวข้องถูกข้ามไปได้เลย
 */
function getLogSheetForWrite_() {
  const ss = getLogSpreadsheet_();
  const year = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy');
  const name = `${LOG_SHEET_NAME} ${year}`;

  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    // ถ้ามี 2 คนเขียนพร้อมกันตอนขึ้นปีใหม่พอดี คนที่ช้ากว่าจะโดน error ชื่อซ้ำ
    // กรณีนั้นแค่ไปใช้แท็บที่อีกคนสร้างไว้แล้ว
    try {
      sheet = ss.insertSheet(name);
      sheet.appendRow(['เวลา', 'ผู้แก้ไข', 'การกระทำ', 'ไฟล์', 'แท็บ', 'รายละเอียด']);
      sheet.setFrozenRows(1);
    } catch (e) {
      sheet = ss.getSheetByName(name);
      if (!sheet) throw e;
    }
  }
  return sheet;
}

/**
 * อ่านแถว Log จากทุกแท็บที่เกี่ยวข้อง (ทั้งแท็บรายปีและแท็บเดิมก่อนแยกรายปี)
 * คืนค่าเป็น array ของแถว หน้าตาเหมือนตอนอ่านจากแท็บเดียว ผู้เรียกจึงใช้ต่อได้เลย
 *
 * @param {Date} [from] ถ้าระบุช่วงวันที่มาด้วย จะข้ามแท็บของปีที่อยู่นอกช่วงไปเลย ไม่ต้องเสียเวลาอ่าน
 * @param {Date} [to]
 */
function readLogRows_(from, to) {
  const ss = getLogSpreadsheet_();
  const rows = [];

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    const isLegacy = name === LOG_SHEET_NAME;                       // แท็บเดิมก่อนแยกรายปี
    const isYearly = name.indexOf(`${LOG_SHEET_NAME} `) === 0;      // แท็บรายปี
    if (!isLegacy && !isYearly) return;

    // ข้ามแท็บปีที่อยู่นอกช่วงที่ขอ (แท็บเดิมไม่รู้ปี จึงต้องอ่านเสมอ)
    if (isYearly && from && to) {
      const m = name.match(/(\d{4})$/);
      if (m) {
        const year = parseInt(m[1], 10);
        if (year < from.getFullYear() || year > to.getFullYear()) return;
      }
    }

    try {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return;
      sheet.getRange(2, 1, lastRow - 1, 6).getValues().forEach(r => rows.push(r));
    } catch (e) {
      // แท็บนี้อ่านไม่ได้ ข้ามไป ไม่ให้รายงานทั้งก้อนพัง
    }
  });

  return rows;
}

/**
 * บันทึกเหตุการณ์ 1 รายการลง Log sheet กลาง — ใช้เฉพาะเหตุการณ์ที่เกี่ยวกับ "ข้อมูลเคส" จริงๆ
 * (เพิ่ม/แก้ไข/ลบ/กู้คืนแถว) เพื่อเอาไปทำรายงานเคสประจำวันได้ ไม่ใช่ทุก action ในระบบ
 * เป็น best-effort — ถ้าบันทึกไม่สำเร็จ (เช่น Log sheet มีปัญหาชั่วคราว) จะไม่ทำให้การกระทำหลักล้มเหลวตามไปด้วย
 */
function logCaseEvent_(editor, action, book, sheetName, detail) {
  try {
    const sheet = getLogSheetForWrite_();
    sheet.appendRow([
      new Date(),
      (editor || '').toString().trim() || 'ไม่ระบุชื่อ',
      action,
      book || '',
      sheetName || '',
      detail || ''
    ]);
  } catch (e) {
    // ไม่ throw ต่อ — การบันทึก log ต้องไม่ทำให้การเพิ่ม/แก้/ลบข้อมูลจริงล้มเหลว
  }
}

/**
 * สรุปรายงานเคสประจำวันของแท็บที่ระบุ: วันนี้เพิ่ม/แก้ไข/ลบ/กู้คืนไปกี่เคส
 * และสรุปยอดคงเหลือปัจจุบันแยกตามค่าในคอลัมน์ "สถานะ" (เช่น UNBANNED กี่แถว, BANNED กี่แถว)
 * ใช้เขตเวลาของสเปรดชีต (โดยปกติคือ Asia/Bangkok) ในการนับว่า "วันนี้" คือวันไหน
 */
function getDailyReport_(book, sheetName) {
  if (!sheetName) throw new Error('กรุณาเลือกแท็บที่ต้องการดูรายงาน');
  const ss = getSpreadsheet_(book);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error('ไม่พบแท็บที่ร้องขอ');

  const tz = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone();
  const todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

  // นับเหตุการณ์วันนี้ของแท็บนี้จาก Log sheet กลาง
  const counts = { เพิ่มข้อมูล: 0, แก้ไขข้อมูล: 0, ลบแถว: 0, กู้คืนข้อมูล: 0 };
  const recentToday = [];   // เฉพาะแท็บนี้
  const recentAllToday = []; // ทุกไฟล์ทุกแท็บ
  try {
    const rows = readLogRows_();
    {
      rows.forEach(row => {
        const [ts, editorName, action, rowBook, rowSheet, detail] = row;
        const rowDateStr = Utilities.formatDate(new Date(ts), tz, 'yyyy-MM-dd');
        if (rowDateStr !== todayStr) return;

        const event = {
          time: Utilities.formatDate(new Date(ts), tz, 'HH:mm'),
          editor: editorName, action, detail,
          book: rowBook, sheet: rowSheet   // ส่งไฟล์/แท็บไปด้วย ให้หน้าเว็บแสดงได้ว่าเหตุการณ์นี้เกิดที่ไหน
        };

        // เหตุการณ์วันนี้ของ "ทุกแท็บ" เก็บไว้ด้วย เพราะถ้าโชว์แค่แท็บที่เปิดอยู่
        // วันที่แก้งานอยู่แท็บอื่น ช่องนี้จะว่างเปล่าเหมือนไม่มีใครทำอะไรเลย
        recentAllToday.push(event);

        if (rowBook !== book || rowSheet !== sheetName) return;
        if (counts[action] !== undefined) counts[action]++;
        recentToday.push(event);
      });
    }
  } catch (e) {
    // Log sheet มีปัญหา ให้ข้ามส่วนนับเหตุการณ์วันนี้ไปเงียบๆ (ยังแสดงยอดคงเหลือปัจจุบันได้ตามปกติ)
  }
  recentToday.reverse(); // ใหม่สุดขึ้นก่อน
  recentAllToday.reverse();
  const recentAll = recentAllToday.slice(0, DAILY_REPORT_EVENT_LIMIT);

  // สรุปยอดคงเหลือปัจจุบันแยกตามค่าคอลัมน์ "สถานะ"
  const { headers } = getPositionalHeaders_(sheet);
  const statusIndex = headers.findIndex(h => h === 'สถานะ' || h.toLowerCase() === 'status');
  let statusBreakdown = [];
  let totalRows = 0;
  if (statusIndex !== -1) {
    const values = getRawValues_(book, sheet);
    const headerRowIndex = getHeaderRowIndex_(sheet);
    const dataRows = values.slice(headerRowIndex);
    const tally = {};
    dataRows.forEach(row => {
      if (row.every(cell => !cell.trim())) return;
      totalRows++;
      const status = (row[statusIndex] || '').toString().trim() || NO_STATUS_LABEL;
      tally[status] = (tally[status] || 0) + 1;
    });
    statusBreakdown = Object.keys(tally)
      .map(status => ({ status, count: tally[status] }))
      .sort((a, b) => b.count - a.count);
  }

  return {
    ok: true,
    date: todayStr,
    book,
    sheet: sheetName,
    addedToday: counts['เพิ่มข้อมูล'],
    editedToday: counts['แก้ไขข้อมูล'],
    deletedToday: counts['ลบแถว'],
    restoredToday: counts['กู้คืนข้อมูล'],
    recentToday,
    recentAll,
    allTodayCount: recentAllToday.length,
    statusBreakdown,
    totalRows,
    hasStatusColumn: statusIndex !== -1
  };
}

// จำนวนเหตุการณ์วันนี้ (ทุกไฟล์) ที่ส่งไปแสดงในแถบด้านข้าง — มากกว่านี้คนก็ไม่ได้ไล่อ่านแล้ว
const DAILY_REPORT_EVENT_LIMIT = 40;

const STATUS_ROWS_LIMIT = 2000; // จำกัดจำนวนแถวต่อการขอ 1 แท็บ กันคำตอบใหญ่เกินไป

/**
 * สรุปว่า "สถานะ" ที่ระบุ มีอยู่ที่ไฟล์ไหน แท็บไหน อย่างละกี่เคส (ยังไม่ส่งตัวข้อมูลแถวมา)
 * ใช้ตอนคลิกสถานะใน Dashboard เพื่อเปิดหน้ารายละเอียดในแท็บใหม่
 *
 * ใช้วิธีนับแบบเดียวกับ getGlobalDashboard_ เป๊ะๆ (รวมถึงการข้ามแถวว่างและการแปลงค่าว่างเป็น
 * NO_STATUS_LABEL) เพื่อให้ยอดรวมที่ได้ตรงกับตัวเลขที่โชว์ใน Dashboard เสมอ
 */
function getStatusSummary_(statusValue) {
  const target = (statusValue || '').toString().trim();
  if (!target) throw new Error('กรุณาระบุสถานะที่ต้องการดู');

  // ใช้แคชผลนับรายแท็บก้อนเดียวกับ Dashboard ภาพรวม ตัวเลขจึงตรงกันเสมอ และไม่ต้องไล่อ่านชีตใหม่
  const scan = scanAllStatusTallies_();
  const groups = [];
  let total = 0;

  scan.perSheet.forEach(entry => {
    const count = entry.tally[target] || 0;
    if (count > 0) {
      groups.push({ book: entry.book, sheet: entry.sheet, count });
      total += count;
    }
  });

  groups.sort((a, b) => b.count - a.count);
  return { ok: true, status: target, total, groups, generatedAt: new Date().toISOString() };
}

/**
 * ดึงรายการเคสจริงของสถานะที่ระบุ เฉพาะแท็บเดียว (หน้ารายละเอียดจะไล่ขอทีละแท็บ
 * แทนการขอทีเดียวทั้งหมด เพราะบางสถานะมีเป็นพันเคส ถ้าส่งก้อนเดียวจะหนักเกินไป)
 */
function getStatusRows_(statusValue, book, sheetName) {
  const target = (statusValue || '').toString().trim();
  if (!target) throw new Error('กรุณาระบุสถานะที่ต้องการดู');
  if (!book || !sheetName) throw new Error('กรุณาระบุไฟล์และแท็บ');

  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error(`ไม่พบแท็บ "${sheetName}"`);

  const headerMap = getHeaderMap_(sheet);
  const statusHeader = headerMap.find(h => h.name === 'สถานะ' || h.name.toLowerCase() === 'status');
  if (!statusHeader) throw new Error(`แท็บ "${sheetName}" ไม่มีคอลัมน์สถานะ`);

  const values = getRawValues_(book, sheet);
  const headerRowIndex = getHeaderRowIndex_(sheet);
  const dataRows = values.slice(headerRowIndex);

  // ดึงลิงก์จริงที่ซ่อนอยู่หลังข้อความในคอลัมน์ Ticket (เช่น "Ticket #283838" ที่ผูกไฮเปอร์ลิงก์ไว้)
  // ใช้แคชชุดเดียวกับหน้าหลัก จึงไม่เพิ่มภาระให้ชีท ถ้าหน้าหลักเคยเปิดแท็บนี้มาแล้ว
  const ticketColIndices = [];
  headerMap.forEach(h => { if (isTicketHeaderName_(h.name)) ticketColIndices.push(h.index); });
  let ticketLinkColumns = {};
  if (ticketColIndices.length > 0 && dataRows.length > 0) {
    try {
      ticketLinkColumns = getCachedTicketLinksForSheet_(book, sheet, ticketColIndices, headerRowIndex + 1, dataRows.length);
    } catch (e) {
      ticketLinkColumns = {}; // อ่านลิงก์ไม่ได้ก็ยังแสดงตารางได้ แค่ไม่มีลิงก์ให้กด
    }
  }

  // บอกหน้าเว็บว่าให้ "แสดง" แค่คอลัมน์ วันที่ / EXE ID / Ticket เหมือนตารางหน้าหลัก
  //
  // หน้านี้ยังส่งข้อมูลครบทุกคอลัมน์มาเหมือนเดิม (ต่างจากตารางหน้าหลักที่ตัดคอลัมน์ออกจริง)
  // เพราะปุ่มดาวน์โหลด Excel ของหน้านี้สร้างไฟล์จากข้อมูลที่โหลดมาแล้วโดยตรง
  // ถ้าตัดคอลัมน์ออก ไฟล์ Excel จะมีคอลัมน์ว่างเปล่าโดยที่ผู้ใช้ไม่รู้ตัว
  // อีกทั้งหน้านี้จำกัดไว้ที่ STATUS_ROWS_LIMIT แถวต่อแท็บอยู่แล้ว ขนาดข้อมูลจึงไม่ใช่ปัญหา
  const allHeaderNames = headerMap.map(h => h.name);
  const listColumns = pickListColumns_(allHeaderNames);

  const rows = [];
  let matched = 0;
  dataRows.forEach((row, i) => {
    if (row.every(cell => !cell.trim())) return;
    const status = (row[statusHeader.index] || '').toString().trim() || NO_STATUS_LABEL;
    if (status !== target) return;
    matched++;
    if (rows.length >= STATUS_ROWS_LIMIT) return;

    // คีย์ของ links ใช้ "ตำแหน่งในตารางที่ส่งไปหน้าเว็บ" (ลำดับใน headerMap)
    // ไม่ใช่เลขคอลัมน์จริงในชีท เพราะ cells ที่ส่งไปก็เรียงตาม headerMap เหมือนกัน
    const links = {};
    headerMap.forEach((h, j) => {
      const col = ticketLinkColumns[h.index];
      if (col && col[i]) links[j] = col[i];
    });

    const item = {
      row: headerRowIndex + i + 1, // แปลงกลับเป็นเลขแถวจริงในชีท
      cells: headerMap.map(h => (row[h.index] || '').toString())
    };
    if (Object.keys(links).length > 0) item.links = links;
    rows.push(item);
  });

  return {
    ok: true,
    book,
    sheet: sheetName,
    status: target,
    headers: allHeaderNames,
    listColumns: listColumns.length > 0 ? listColumns : null,
    rows,
    matched,
    truncated: matched > rows.length
  };
}

/**
 * ดึงรายละเอียดของเคสเดียว: ข้อมูลปัจจุบันทุกคอลัมน์ + ประวัติทั้งหมดว่าใครทำอะไรกับเคสนี้บ้าง
 * ใช้ตอนคลิกดูรายละเอียดเคสจาก Dashboard / รายงานย้อนหลัง
 *
 * ข้อจำกัดที่ต้องรู้: Log บันทึกเคสด้วย "เลขแถว" ซึ่งจะเลื่อนเมื่อมีการลบแถวที่อยู่ข้างบน
 * ถ้าแท็บนี้เคยมีการลบแถว ประวัติที่ดึงมาอาจมีของเคสอื่นที่เคยอยู่เลขแถวเดียวกันปนมาได้
 * จึงส่ง flag hasDeletionInSheet กลับไปด้วย เพื่อให้หน้าเว็บเตือนผู้ใช้ตามความเป็นจริง
 */
function getCaseDetail_(book, sheetName, rowParam) {
  const rowNum = parseInt(rowParam, 10);
  if (!book || !sheetName || !rowNum) throw new Error('ข้อมูลไม่ครบ ไม่สามารถเปิดรายละเอียดเคสได้');

  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet || isHiddenSheet_(sheet)) throw new Error(`ไม่พบแท็บ "${sheetName}" (อาจถูกลบไปแล้ว)`);

  // ข้อมูลปัจจุบันของแถวนี้ แยกเป็นรายคอลัมน์
  const fields = [];
  const rowExists = rowNum > getHeaderRowIndex_(sheet) && rowNum <= sheet.getLastRow();
  if (rowExists) {
    const headerMap = getHeaderMap_(sheet);
    const values = safeReadRow_(sheet, rowNum, 1, sheet.getLastColumn());
    headerMap.forEach(h => {
      fields.push({ name: h.name, value: (values[h.index] || '').toString() });
    });
  }

  // ไล่ประวัติทั้งหมดของเคสนี้จาก Log กลาง
  const timeline = [];
  let hasDeletionInSheet = false;
  try {
    const tz = Session.getScriptTimeZone();
    const logRows = readLogRows_();
    {
      logRows.forEach(r => {
        if (r[3] !== book || r[4] !== sheetName) return;
        const detail = (r[5] || '').toString();
        if (r[2] === 'ลบแถว') hasDeletionInSheet = true;

        const m = detail.match(/แถวที่\s*(\d+)/);
        if (!m || parseInt(m[1], 10) !== rowNum) return;

        timeline.push({
          time: Utilities.formatDate(new Date(r[0]), tz, 'dd/MM/yyyy HH:mm'),
          editor: (r[1] || '').toString(),
          action: (r[2] || '').toString(),
          detail: detail
        });
      });
    }
  } catch (e) {
    // Log มีปัญหาชั่วคราว ยังแสดงข้อมูลปัจจุบันของเคสได้ แค่ไม่มีประวัติ
  }

  return {
    ok: true,
    book,
    sheet: sheetName,
    row: rowNum,
    rowExists,
    fields,
    timeline,
    hasDeletionInSheet
  };
}

/** เก็บผลรวมภาพรวมทั้งระบบไว้สั้นๆ กันคำนวณใหม่ทุกครั้งที่เปิดหน้าเว็บ (ต้องไล่อ่านทุกไฟล์ทุกแท็บ ค่อนข้างหนัก) */
const GLOBAL_DASHBOARD_CACHE_TTL = 90; // วินาที

/**
 * เก็บ "ผลนับสถานะของแต่ละแท็บ" แยกเป็นรายแท็บ อายุยาว (6 ชั่วโมง) เพราะจะถูกล้างทิ้งเองทุกครั้งที่
 * แท็บนั้นถูกแก้ข้อมูล (ดู clearSheetCache_) จึงไม่มีทางค้างเป็นยอดเก่า
 *
 * เหตุผลที่ต้องแยกเป็นรายแท็บ: เดิมเก็บเป็นก้อนเดียวทั้งระบบ แล้วล้างทั้งก้อนทุกครั้งที่มีใครบันทึกข้อมูล
 * ช่วงที่ทีมทำงานกันหลายคน แคชจึงว่างแทบตลอดเวลา ทุกครั้งที่เปิด Dashboard ต้องไล่อ่านใหม่ทั้งระบบ
 * จนเกิน 30 วินาทีและขึ้นข้อความ "เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด"
 * แยกรายแท็บแล้ว การบันทึก 1 ครั้งจะทำให้ต้องอ่านใหม่แค่ 1 แท็บ ที่เหลือใช้ค่าที่นับไว้แล้ว
 */
// ป้ายของแถวที่คอลัมน์ "สถานะ" ยังว่างอยู่ — ใช้เป็น "คีย์" ของสถานะนี้ทั้งระบบ
// (Dashboard, หน้ารายละเอียดตามสถานะ, แคชยอดรายแท็บ) ถ้าแก้ ต้องแก้ที่เดียวตรงนี้
// และต้องขยับ SHEET_TALLY_CACHE_VERSION ด้วย ไม่งั้นแคชเก่าจะยังคืนป้ายเดิมมา
const NO_STATUS_LABEL = 'ตรวจสอบสถานะ';
const SHEET_TALLY_CACHE_TTL = 6 * 60 * 60; // วินาที
const SHEET_TALLY_CACHE_VERSION = 'v2'; // v2: เปลี่ยนป้ายแถวที่ยังไม่ได้ระบุสถานะ แคชเก่าใช้ต่อไม่ได้

function sheetTallyCacheKey_(book, sheetName) {
  return `statusTally:${SHEET_TALLY_CACHE_VERSION}:${book}${BOOK_SEP}${sheetName}`;
}

/**
 * นับจำนวนเคสแยกตามค่าคอลัมน์ "สถานะ" ของแท็บเดียว (มีแคชรายแท็บ)
 * วิธีนับต้องเหมือนเดิมเป๊ะ: ข้ามแถวที่ทุกเซลล์ว่าง และค่าว่างนับเป็น NO_STATUS_LABEL
 *
 * @return {Object|null} { tally: {สถานะ: จำนวน}, totalRows: n } หรือ null ถ้าแท็บนี้ไม่มีคอลัมน์สถานะ
 */
function getSheetStatusTally_(bookName, sheet) {
  const sheetName = sheet.getName();
  const cache = CacheService.getScriptCache();
  const cacheKey = sheetTallyCacheKey_(bookName, sheetName);
  const cached = cache.get(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return parsed.hasStatus ? parsed : null;
    } catch (e) { /* แคชเสีย นับใหม่ */ }
  }

  const headerMap = getHeaderMap_(sheet);
  const statusHeader = headerMap.find(h => h.name === 'สถานะ' || h.name.toLowerCase() === 'status');
  if (!statusHeader) {
    // จำไว้ด้วยว่าแท็บนี้ไม่มีคอลัมน์สถานะ ไม่ต้องเสียเวลาอ่านหัวตารางซ้ำทุกครั้ง
    try { cache.put(cacheKey, JSON.stringify({ hasStatus: false }), SHEET_TALLY_CACHE_TTL); } catch (e) {}
    return null;
  }

  // อ่านตรงจากชีตเลย ไม่ผ่าน getRawValues_ เพราะแคชก้อนนั้นเก็บค่าดิบทั้งแท็บ
  // แท็บที่มีข้อมูลหลายพันแถวจะใหญ่เกิน 100KB แคชไม่ติด แต่ยังเสียเวลาแปลงเป็นข้อความทุกครั้งอยู่ดี
  const headerRowIndex = getHeaderRowIndex_(sheet);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const tally = {};
  let totalRows = 0;

  if (lastRow > headerRowIndex && lastCol > 0) {
    const dataRows = safeGetDisplayValues_(sheet, headerRowIndex + 1, 1, lastRow - headerRowIndex, lastCol);
    dataRows.forEach(row => {
      if (row.every(cell => !cell.trim())) return;
      totalRows++;
      const status = (row[statusHeader.index] || '').toString().trim() || NO_STATUS_LABEL;
      tally[status] = (tally[status] || 0) + 1;
    });
  }

  const result = { hasStatus: true, tally, totalRows };
  try { cache.put(cacheKey, JSON.stringify(result), SHEET_TALLY_CACHE_TTL); } catch (e) {}
  return result;
}

/**
 * ไล่นับสถานะของทุกไฟล์ทุกแท็บ (ใช้ร่วมกันทั้ง Dashboard ภาพรวม และหน้ารายละเอียดตามสถานะ
 * เพื่อให้ตัวเลขทั้ง 2 หน้าตรงกันเสมอ และใช้แคชรายแท็บก้อนเดียวกัน)
 *
 * @return {Object} { perSheet: [{book, sheet, tally, totalRows}], totalRows, sheetsScanned }
 */
function scanAllStatusTallies_() {
  const booksMap = getSpreadsheetsMap_();
  const perSheet = [];
  let totalRows = 0;
  let sheetsScanned = 0;

  Object.keys(booksMap).forEach(bookName => {
    let ss;
    try {
      ss = getSpreadsheet_(bookName);
    } catch (e) {
      return; // ไฟล์นี้เปิดไม่ได้ (ถูกลบ/ไม่มีสิทธิ์) ข้ามไปเลย ไม่ให้ทั้งก้อนพัง
    }
    ss.getSheets().forEach(sheet => {
      if (isHiddenSheet_(sheet)) return;
      try {
        const entry = getSheetStatusTally_(bookName, sheet);
        if (!entry) return;
        sheetsScanned++;
        totalRows += entry.totalRows;
        perSheet.push({ book: bookName, sheet: sheet.getName(), tally: entry.tally, totalRows: entry.totalRows });
      } catch (e) {
        // แท็บนี้อ่านไม่ได้ ข้ามไปเงียบๆ
      }
    });
  });

  return { perSheet, totalRows, sheetsScanned };
}

/**
 * อ่านค่า "สถานะ" ปัจจุบันจริงของแถวที่ระบุ (ใช้ตอนแสดงรายการเคสใหม่วันนี้ใน Dashboard เพื่อโชว์สถานะล่าสุด
 * ไม่ใช่สถานะตอนที่เพิ่งเพิ่มเข้ามา เผื่อมีคนแก้ไขสถานะไปแล้วหลังจากนั้น) ssCache ใช้กันเปิดไฟล์ book เดิมซ้ำๆ
 */
/**
 * อ่านสถานะปัจจุบันของ "หลายเคสพร้อมกัน" ทีเดียว แยกตามไฟล์/แท็บ
 *
 * ทำไมต้องมี: ของเดิมเรียก getCurrentStatusForRow_ ทีละเคส ซึ่งแต่ละครั้งต้องอ่านหัวตารางใหม่
 * + อ่านเซลล์ทีละช่อง รวมแล้วประมาณ 4 คำสั่งต่อ 1 เคส พอรายงานปีมีเป็นพันเคสจะใช้เวลาเกิน
 * ลิมิต 6 นาทีของ Apps Script แล้วพังทั้งรายงาน
 *
 * วิธีใหม่: จับกลุ่มตามแท็บ แล้วอ่านคอลัมน์สถานะทีเดียวรวดเดียวทั้งช่วงแถวที่ต้องใช้
 * เหลือประมาณ 3 คำสั่งต่อ 1 แท็บ (ไม่ใช่ต่อ 1 เคส) เร็วขึ้นหลายสิบเท่า
 *
 * @param {Array} refs รายการ { book, sheet, row }
 * @return {Object} ตารางค้นหา key = "book\u0000sheet\u0000row" -> สถานะปัจจุบัน
 */
function buildStatusLookup_(refs) {
  const lookup = {};
  const groups = {};

  refs.forEach(ref => {
    if (!ref.book || !ref.sheet || !ref.row) return;
    const key = ref.book + '\u0000' + ref.sheet;
    if (!groups[key]) groups[key] = { book: ref.book, sheet: ref.sheet, rows: [] };
    groups[key].rows.push(ref.row);
  });

  const ssCache = {};
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    try {
      let ss = ssCache[group.book];
      if (!ss) {
        ss = getSpreadsheet_(group.book);
        ssCache[group.book] = ss;
      }
      const sheet = ss.getSheetByName(group.sheet);
      if (!sheet) return;

      const headerMap = getHeaderMap_(sheet); // อ่านหัวตารางครั้งเดียวต่อแท็บ
      const statusHeader = headerMap.find(h => h.name === 'สถานะ' || h.name.toLowerCase() === 'status');
      if (!statusHeader) return;

      const lastRow = sheet.getLastRow();
      const validRows = group.rows.filter(r => r >= 1 && r <= lastRow);
      if (validRows.length === 0) return;

      const minRow = Math.min.apply(null, validRows);
      const maxRow = Math.max.apply(null, validRows);
      // อ่านคอลัมน์สถานะรวดเดียวทั้งช่วง แทนการอ่านทีละเซลล์
      const values = sheet.getRange(minRow, statusHeader.index + 1, maxRow - minRow + 1, 1).getDisplayValues();

      validRows.forEach(r => {
        lookup[group.book + '\u0000' + group.sheet + '\u0000' + r] = (values[r - minRow][0] || '').toString().trim();
      });
    } catch (e) {
      // แท็บนี้อ่านไม่ได้ ข้ามไปเงียบๆ ไม่ให้รายงานทั้งก้อนพังเพราะแท็บเดียว
    }
  });

  return lookup;
}

/** ดึงสถานะจากตารางค้นหาที่ buildStatusLookup_ สร้างไว้ */
function statusFromLookup_(lookup, book, sheetName, rowIndex) {
  if (!rowIndex) return '';
  return lookup[book + '\u0000' + sheetName + '\u0000' + rowIndex] || '';
}

/**
 * สรุปภาพรวมการใช้งานทั้งระบบ (ทุกไฟล์ ทุกแท็บ) สำหรับ Dashboard มุมล่างซ้ายของหน้าเว็บ:
 * (1) จำนวนเคสที่ถูก "เพิ่มข้อมูล" เข้าระบบวันนี้ นับจาก Log กลาง รวมทุกไฟล์ทุกแท็บ
 * (2) ยอดคงเหลือปัจจุบันแยกตามค่าคอลัมน์ "สถานะ" ของทุกแท็บที่มีคอลัมน์นี้ รวมเป็นก้อนเดียวทั้งระบบ
 * ข้ามไฟล์/แท็บที่อ่านไม่ได้แบบเงียบๆ เพื่อไม่ให้ทั้ง dashboard พังเพราะไฟล์เดียวมีปัญหา
 */
function getGlobalDashboard_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'globalDashboard:v1';
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { /* ค่า cache เสีย คำนวณใหม่ */ }
  }

  const scan = scanAllStatusTallies_();
  const statusTally = {};
  const totalRows = scan.totalRows;
  const sheetsScanned = scan.sheetsScanned;
  scan.perSheet.forEach(entry => {
    Object.keys(entry.tally).forEach(status => {
      statusTally[status] = (statusTally[status] || 0) + entry.tally[status];
    });
  });

  const statusBreakdown = Object.keys(statusTally)
    .map(status => ({ status, count: statusTally[status] }))
    .sort((a, b) => b.count - a.count);

  // นับเคสที่ถูก "เพิ่มข้อมูล" เข้าระบบวันนี้ จาก Log กลาง (รวมทุกไฟล์ทุกแท็บ)
  const tz = Session.getScriptTimeZone();
  const todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  let casesToday = 0;
  const newCasesToday = [];
  const NEW_CASES_LIST_LIMIT = 30; // กันรายการยาวเกินไปถ้าวันนั้นมีเคสเข้าเยอะมาก
  try {
    // อ่าน Log แค่แท็บของปีนี้ (ส่งช่วงวันที่ไปด้วย) ไม่ต้องอ่านแท็บปีเก่าทั้งหมดเพื่อนับเคสของวันนี้
    const now = new Date();
    const rows = readLogRows_(now, now);
    {
      rows.forEach(row => {
        const ts = row[0];
        const action = row[2];
        const detail = row[5];
        if (action !== 'เพิ่มข้อมูล') return;
        const rowDateStr = Utilities.formatDate(new Date(ts), tz, 'yyyy-MM-dd');
        if (rowDateStr !== todayStr) return;
        casesToday++;

        // ดึงเลขแถวจากข้อความรายละเอียด (เช่น "เพิ่มแถวใหม่ (แถวที่ 295)") ไว้ไปเช็คสถานะปัจจุบันทีหลัง
        const rowMatch = (detail || '').toString().match(/แถวที่\s*(\d+)/);
        newCasesToday.push({
          time: Utilities.formatDate(new Date(ts), tz, 'HH:mm'),
          book: row[3] || '',
          sheet: row[4] || '',
          row: rowMatch ? parseInt(rowMatch[1], 10) : null,
          status: ''
        });
      });

      // อ่านสถานะปัจจุบันของทุกเคสทีเดียว (จับกลุ่มตามแท็บ) แทนการอ่านทีละเคส
      const statusLookup = buildStatusLookup_(newCasesToday);
      newCasesToday.forEach(c => {
        c.status = statusFromLookup_(statusLookup, c.book, c.sheet, c.row) || NO_STATUS_LABEL;
      });
    }
  } catch (e) {
    // Log sheet มีปัญหาชั่วคราว ข้ามส่วนนี้ไปเงียบๆ
  }
  newCasesToday.reverse(); // ใหม่สุดขึ้นก่อน
  const newCasesTruncated = newCasesToday.length > NEW_CASES_LIST_LIMIT;
  const newCasesTodayList = newCasesToday.slice(0, NEW_CASES_LIST_LIMIT);

  const payload = {
    ok: true,
    date: todayStr,
    casesToday,
    newCasesToday: newCasesTodayList,
    newCasesTruncated,
    totalRows,
    sheetsScanned,
    statusBreakdown,
    generatedAt: new Date().toISOString()
  };
  try {
    cache.put(cacheKey, JSON.stringify(payload), GLOBAL_DASHBOARD_CACHE_TTL);
  } catch (e) { /* ผลรวมใหญ่เกินไปสำหรับ cache ก็ไม่เป็นไร แค่ไม่ได้แคช */ }
  return payload;
}

const DASHBOARD_REPORT_ROW_LIMIT = 5000; // จำกัดจำนวนเคสต่อรายงาน 1 ครั้ง กันโหลดหนักเกินไปถ้าเลือกช่วงกว้างมากๆ

/**
 * รายงานย้อนหลัง (ใช้กับปุ่ม "รายวัน" / "รายเดือน" / กำหนดช่วงวันที่เอง บนหน้าเว็บ)
 * คืนรายการ "เคสที่ถูกเพิ่มเข้าระบบ" ในช่วงวันที่ที่ระบุ (ทุกไฟล์ทุกแท็บ) พร้อมสถานะปัจจุบันของแต่ละเคส
 * และตัวเลขสรุปแยกตามสถานะของเคสกลุ่มนี้ — ไม่แคช เพราะช่วงวันที่เปลี่ยนได้ทุกครั้งที่เรียก
 * @param {string} fromStr วันที่เริ่มต้น รูปแบบ yyyy-MM-dd (มาจาก <input type="date"> ฝั่งเว็บ)
 * @param {string} toStr วันที่สิ้นสุด รูปแบบ yyyy-MM-dd (รวมวันนี้ด้วย)
 */
function getDashboardReport_(fromStr, toStr) {
  if (!fromStr || !toStr) throw new Error('กรุณาระบุช่วงวันที่ให้ครบ (จากวันที่ / ถึงวันที่)');

  const tz = Session.getScriptTimeZone();
  const from = new Date(fromStr + 'T00:00:00');
  const to = new Date(toStr + 'T23:59:59');
  if (isNaN(from.getTime()) || isNaN(to.getTime())) throw new Error('รูปแบบวันที่ไม่ถูกต้อง');
  if (from > to) throw new Error('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');

  const cases = [];
  const statusTally = {};

  try {
    const rows = readLogRows_(from, to);
    {
      rows.forEach(row => {
        const ts = row[0];
        const action = row[2];
        const detail = row[5];
        if (action !== 'เพิ่มข้อมูล') return;
        const tsDate = new Date(ts);
        if (tsDate < from || tsDate > to) return;

        const rowMatch = (detail || '').toString().match(/แถวที่\s*(\d+)/);
        cases.push({
          date: Utilities.formatDate(tsDate, tz, 'dd/MM/yyyy'),
          time: Utilities.formatDate(tsDate, tz, 'HH:mm'),
          book: row[3] || '',
          sheet: row[4] || '',
          row: rowMatch ? parseInt(rowMatch[1], 10) : null,
          status: ''
        });
      });

      // อ่านสถานะปัจจุบันของทุกเคสทีเดียว (จับกลุ่มตามแท็บ อ่านคอลัมน์สถานะรวดเดียวต่อแท็บ)
      // จุดนี้คือหัวใจที่ทำให้ "รายงานปีนี้" ที่มีเป็นพันเคสรันทันใน 6 นาที
      const statusLookup = buildStatusLookup_(cases);
      cases.forEach(c => {
        c.status = statusFromLookup_(statusLookup, c.book, c.sheet, c.row) || NO_STATUS_LABEL;
        statusTally[c.status] = (statusTally[c.status] || 0) + 1;
      });
    }
  } catch (e) {
    // Log sheet มีปัญหาชั่วคราว ข้ามส่วนนี้ไปเงียบๆ (คืนรายงานเปล่าแทน error ทั้งหมด)
  }

  const truncated = cases.length > DASHBOARD_REPORT_ROW_LIMIT;
  const casesList = cases.slice(0, DASHBOARD_REPORT_ROW_LIMIT);

  const statusBreakdown = Object.keys(statusTally)
    .map(status => ({ status, count: statusTally[status] }))
    .sort((a, b) => b.count - a.count);

  return {
    ok: true,
    from: fromStr,
    to: toStr,
    totalCases: cases.length,
    truncated,
    statusBreakdown,
    cases: casesList,
    generatedAt: new Date().toISOString()
  };
}

/* ===== ระบบถังขยะ / กู้คืนข้อมูล ===== */

/** เปิด (หรือสร้างถ้ายังไม่มี) แท็บ _Trash ของไฟล์ที่ระบุ และซ่อนไว้อัตโนมัติเสมอ */
function getTrashSheet_(book) {
  const ss = getSpreadsheet_(book);
  let sheet = ss.getSheetByName(TRASH_SHEET_NAME);
  if (!sheet) {
    // เช่นเดียวกับ Log: ถ้าสร้างชนกันตอนใช้ครั้งแรก ให้ไปใช้แท็บที่อีกคนสร้างไว้แทน
    try {
      sheet = ss.insertSheet(TRASH_SHEET_NAME);
      sheet.appendRow(['id', 'deletedAt', 'type', 'sheetName', 'columnName', 'payload']);
    } catch (e) {
      sheet = ss.getSheetByName(TRASH_SHEET_NAME);
      if (!sheet) throw e;
    }
  }
  if (!sheet.isSheetHidden()) sheet.hideSheet();
  return sheet;
}

/** บันทึกสำเนาข้อมูลที่กำลังจะลบไว้ในถังขยะ แล้วตัดรายการเก่าสุดทิ้งถ้าเกินจำนวนที่กำหนด */
function logTrash_(book, sheetName, type, columnName, payloadValue) {
  const trash = getTrashSheet_(book);
  const id = Utilities.getUuid();
  trash.appendRow([id, new Date().toISOString(), type, sheetName, columnName, JSON.stringify(payloadValue)]);

  const lastRow = trash.getLastRow();
  const dataRows = lastRow - 1; // ไม่นับแถวหัวตาราง
  if (dataRows > TRASH_MAX_ENTRIES) {
    trash.deleteRows(2, dataRows - TRASH_MAX_ENTRIES);
  }
}

/** คืนรายการล่าสุดในถังขยะของไฟล์ที่ระบุ (ใหม่สุดขึ้นก่อน) พร้อมคำอธิบายสั้นๆ ให้เห็นว่าลบอะไรไป */
function getTrash_(book) {
  const trash = getTrashSheet_(book);
  const lastRow = trash.getLastRow();
  if (lastRow < 2) return { ok: true, items: [] };

  const values = trash.getRange(2, 1, lastRow - 1, 6).getDisplayValues();
  const items = values.map(row => {
    const [id, deletedAt, type, sheetName, columnName, payloadJson] = row;
    let preview = '';
    try {
      const payload = JSON.parse(payloadJson);
      if (type === 'row') {
        preview = payload.filter(v => v && v.toString().trim()).slice(0, 3).join(' · ') || '(แถวว่าง)';
      } else {
        preview = `คอลัมน์ "${columnName}" (${payload.length} แถว)`;
      }
    } catch (e) {
      preview = '(ไม่สามารถแสดงตัวอย่างได้)';
    }
    return { id, deletedAt, type, sheetName, columnName, preview };
  }).reverse();

  return { ok: true, items };
}

/** กู้คืนรายการจากถังขยะ ใส่ข้อมูลกลับเข้าชีตจริง แล้วลบรายการนั้นออกจากถังขยะ (กู้คืนได้ครั้งเดียวต่อรายการ) */
function restoreItem_(book, id, editor) {
  if (!id) throw new Error('ไม่พบรายการที่จะกู้คืน');
  const trash = getTrashSheet_(book);
  const lastRow = trash.getLastRow();
  if (lastRow < 2) throw new Error('ไม่พบรายการที่จะกู้คืน');

  const values = trash.getRange(2, 1, lastRow - 1, 6).getValues();
  const rowIndex = values.findIndex(row => row[0] === id);
  if (rowIndex === -1) throw new Error('ไม่พบรายการนี้ในถังขยะ (อาจถูกกู้คืนไปแล้ว)');

  const [, , type, sheetName, columnName, payloadJson] = values[rowIndex];
  const sheet = getSpreadsheet_(book).getSheetByName(sheetName);
  if (!sheet) throw new Error(`ไม่พบแท็บ "${sheetName}" ปลายทาง (อาจถูกลบทั้งแท็บไปแล้ว)`);

  const payload = JSON.parse(payloadJson);

  if (type === 'row') {
    const lastRowBeforeRestore = sheet.getLastRow();
    sheet.appendRow(payload);
    const restoredRowIndex = sheet.getLastRow();
    // แถวที่กู้คืนมาต้องได้รูปแบบ + Dropdown เหมือนแถวข้อมูลปกติด้วย ไม่งั้นจะกลายเป็นแถวเปล่าไม่มีตัวเลือกให้เลือก
    copyRowFormatting_(sheet, lastRowBeforeRestore, restoredRowIndex, sheet.getLastColumn());
    extendConditionalFormatRangeForNewRow_(sheet, restoredRowIndex);
    // ลิงก์ที่เคยผูกไว้หายไปตอนเก็บลงถังขยะ (เก็บแค่ข้อความ) ต้องผูกกลับให้ด้วย
    applyUrlHyperlinks_(sheet, restoredRowIndex, payload);
  } else if (type === 'column') {
    // เขียนชื่อคอลัมน์ลง "แถวหัวตารางจริง" และข้อมูลเริ่มที่แถวถัดไป
    // (ชีทหัวตาราง 2 ชั้น หัวจริงอยู่แถว 2 ถ้ายึดแถว 1 ตายตัว คอลัมน์จะกลายเป็นไม่มีชื่อและข้อมูลเลื่อนผิดแถว)
    const headerRowIndex = getHeaderRowIndex_(sheet);
    const newCol = sheet.getLastColumn() + 1;
    sheet.getRange(headerRowIndex, newCol).setValue(columnName);
    if (payload.length > 0) {
      sheet.getRange(headerRowIndex + 1, newCol, payload.length, 1).setValues(payload.map(v => [v]));
    }
  } else {
    throw new Error('ไม่รู้จักประเภทของรายการนี้');
  }

  trash.deleteRow(rowIndex + 2); // +2 เพราะ values เริ่มนับจากแถวที่ 2 ของชีตจริง
  clearSheetCache_(book, sheetName);
  logActivity_(editor, 'กู้คืนข้อมูล', `กู้คืน${type === 'row' ? 'แถว' : 'คอลัมน์'}ในแท็บ "${sheetName}" (${book})`);
  logCaseEvent_(editor, 'กู้คืนข้อมูล', book, sheetName, `กู้คืน${type === 'row' ? 'แถว' : 'คอลัมน์'}`);

  return { ok: true, message: type === 'row' ? 'กู้คืนแถวข้อมูลสำเร็จ (เพิ่มไว้ท้ายชีต)' : 'กู้คืนคอลัมน์สำเร็จ (เพิ่มไว้ท้ายชีต)' };
}

/** ล้างแคชแบบหั่นก้อนทิ้งทั้งชุด (ลบสารบัญก่อน เพื่อให้ทุกคนมองว่าแคชใช้ไม่ได้ทันที) */
function clearChunkedCache_(cache, baseKey) {
  const manifest = cache.get(`${baseKey}:n`);
  cache.remove(`${baseKey}:n`);
  const count = parseInt(manifest, 10);
  if (!count || count < 1 || count > RAW_CACHE_MAX_CHUNKS) return;
  const keys = [];
  for (let i = 0; i < count; i++) keys.push(`${baseKey}:${i}`);
  try { cache.removeAll(keys); } catch (e) { /* ลบไม่ได้ก็ปล่อยให้หมดอายุเอง */ }
}

/** ล้าง cache ของแท็บที่เพิ่งแก้ไข เพื่อให้ค้นหา/ดูข้อมูลเห็นการเปลี่ยนแปลงทันที ไม่ต้องรอ cache หมดอายุ */
function clearSheetCache_(book, name, keepTicketLinks) {
  const cache = CacheService.getScriptCache();
  cache.remove(`dashboard:${book}${BOOK_SEP}${name}`);
  clearChunkedCache_(cache, `raw:${book}${BOOK_SEP}${name}`);
  // การอ่านลิงก์ Ticket (getRichTextValues) เป็นคำสั่งที่ช้าที่สุดในระบบ ต้องอ่านทีละก้อนทั้งคอลัมน์
  // ถ้าการแก้ไขครั้งนี้ไม่ได้แตะคอลัมน์ Ticket เลย ก็ไม่มีเหตุผลต้องล้างแคชนี้ทิ้ง
  if (!keepTicketLinks) {
    cache.remove(`ticketLinks:${TICKET_LINKS_CACHE_VERSION}:${book}${BOOK_SEP}${name}`);
  }
  // ต้องล้างสรุปภาพรวมด้วย ไม่งั้น Dashboard จะยังโชว์ยอดเก่าค้างอยู่อีกถึง 90 วินาทีหลังแก้ข้อมูล
  cache.remove('globalDashboard:v1');
  // ล้างผลนับสถานะ "แค่แท็บนี้แท็บเดียว" แท็บอื่นยังใช้ค่าที่นับไว้แล้วได้
  // Dashboard จึงต้องอ่านชีตใหม่แค่แท็บเดียว ไม่ใช่ทั้งระบบ
  cache.remove(sheetTallyCacheKey_(book, name));
}
