/**
 * ชั้นอ่านข้อมูลจาก Supabase
 * =========================================================================
 *
 * ทำไมต้องมีไฟล์นี้
 * -----------------
 * เดิมหน้าเว็บขอข้อมูลตารางจาก Apps Script ซึ่งต้องเปิด Google Sheets อ่านทีละแท็บ
 * แท็บใหญ่ใช้เวลา 2-5 วินาทีต่อครั้ง ไฟล์นี้เปลี่ยนให้ "การอ่าน" ไปดึงจาก Supabase แทน
 * ซึ่งเป็นฐานข้อมูลจริงมีดัชนี ตอบกลับในระดับ 100-300 มิลลิวินาที
 *
 * สิ่งที่ไฟล์นี้ "ไม่" ทำ
 * ---------------------
 * ไม่เขียนข้อมูล การเพิ่ม/แก้ไข/ลบ ยังวิ่งผ่าน Apps Script เส้นเดิมทั้งหมด
 * เพราะต้นฉบับจริงยังเป็น Google Sheets ถ้าเขียนลง Supabase ตรงๆ ข้อมูล 2 ที่จะไม่ตรงกัน
 * และจะเสียระบบตรวจสิทธิ์กับการบันทึก Log ที่ทำไว้ครบแล้วใน Apps Script
 *
 * หลักสำคัญ: ถ้า Supabase มีปัญหา ต้องถอยไปใช้ Apps Script ได้เสมอ
 * ทุกฟังก์ชันในนี้ throw ได้ และผู้เรียก (jsonpRequest ใน script.js) จะ catch แล้วยิงของเดิมแทน
 * ห้ามทำให้ความล้มเหลวของ Supabase กลายเป็นหน้าจอว่าง
 */

/* ===== ค่าตั้งต้น ===== */

// คีย์นี้เปิดเผยในหน้าเว็บได้ ตัวที่กันข้อมูลจริงคือกฎ RLS ฝั่งฐานข้อมูล
// คนที่ถือคีย์นี้แต่ไม่ได้ล็อกอิน หรือล็อกอินแล้วแต่อีเมลไม่อยู่ในตาราง allowed_users
// อ่านข้อมูลไม่ได้แม้แต่แถวเดียว (ทดสอบแล้วทั้งการอ่านตารางตรงๆ และผ่านวิวรายแท็บ)
const SUPABASE_URL = 'https://prqhajnnnqfvdnsilcnr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wfNo-aeS5viwOoRnEdFvpA_Pb4aJsMS';

const SUPA_TOKEN_STORAGE = 'sheetSearchSupaSession';
const SUPA_TIMEOUT_MS = 15000;

// ขอต่ออายุตั๋วก่อนหมดอายุจริงเท่านี้ กันกรณีคำขอเดินทางช้าแล้วตั๋วหมดอายุระหว่างทาง
const SUPA_REFRESH_MARGIN_MS = 60 * 1000;

/* ===== สถานะตั๋วเข้าใช้งาน ===== */

let supaSession = null;      // { access_token, refresh_token, expires_at (ms), email }
let supaRefreshPromise = null; // กันการต่ออายุพร้อมกันหลายเส้นตอนหน้าเว็บยิงหลายคำขอพร้อมกัน

/** Supabase พร้อมใช้งานไหม (ล็อกอินผ่านและตั๋วยังอยู่) */
function supaReady() {
  return !!(supaSession && supaSession.access_token);
}

function supaSaveSession_(json, email) {
  if (!json || !json.access_token) throw new Error('Supabase ไม่ได้ส่งตั๋วเข้าใช้งานกลับมา');
  supaSession = {
    access_token: json.access_token,
    refresh_token: json.refresh_token || '',
    // expires_in เป็นวินาที แปลงเป็นเวลาหมดอายุจริงเก็บไว้ จะได้ไม่ต้องเดาตอนใช้
    expires_at: Date.now() + (parseInt(json.expires_in, 10) || 3600) * 1000,
    email: email || (json.user && json.user.email) || ''
  };
  try {
    localStorage.setItem(SUPA_TOKEN_STORAGE, JSON.stringify(supaSession));
  } catch (e) {
    // localStorage เต็มหรือถูกปิด ยังใช้งานต่อได้ในหน้านี้ แค่รีเฟรชแล้วต้องล็อกอิน Supabase ใหม่
  }
  return supaSession;
}

function supaClearSession() {
  supaSession = null;
  try { localStorage.removeItem(SUPA_TOKEN_STORAGE); } catch (e) { /* ไม่เป็นไร */ }
}

/**
 * แลก Google ID token เป็นตั๋วของ Supabase
 *
 * ใช้ ID token ตัวเดียวกับที่ปุ่ม "Sign in with Google" เดิมได้มาอยู่แล้ว
 * ผู้ใช้จึงไม่ต้องกดล็อกอินเพิ่มอีกรอบ และไม่มีการเด้งออกไปหน้าอื่น
 *
 * ต้องตั้งค่าใน Supabase > Authentication > Providers > Google ให้ช่อง "Client IDs"
 * มี Client ID ของหน้าเว็บ (ตัวใน config.js) อยู่ด้วย ไม่งั้นจะได้ error ว่า audience ไม่ตรง
 */
async function supaSignInWithGoogle(idToken, email) {
  const res = await supaFetchRaw_('/auth/v1/token?grant_type=id_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', id_token: idToken })
  });
  if (!res.ok) {
    const detail = await supaReadError_(res);
    throw new Error('เข้าสู่ระบบ Supabase ไม่สำเร็จ: ' + detail);
  }
  return supaSaveSession_(await res.json(), email);
}

/**
 * กู้ตั๋วที่จำไว้ตอนรีเฟรชหน้าเว็บ ให้ไม่ต้องกดปุ่ม Google ใหม่
 * ถ้าตั๋วหมดอายุแล้วจะต่ออายุให้เองด้วย refresh_token
 */
async function supaRestoreSession() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(SUPA_TOKEN_STORAGE) || 'null');
  } catch (e) {
    saved = null;
  }
  if (!saved || !saved.refresh_token) return null;
  supaSession = saved;
  if (Date.now() < (saved.expires_at || 0) - SUPA_REFRESH_MARGIN_MS) return supaSession;
  try {
    return await supaRefreshSession_();
  } catch (e) {
    supaClearSession();
    return null;
  }
}

async function supaRefreshSession_() {
  if (supaRefreshPromise) return supaRefreshPromise;
  const refreshToken = supaSession && supaSession.refresh_token;
  if (!refreshToken) throw new Error('ไม่มีตั๋วสำหรับต่ออายุ');
  const email = supaSession.email;
  supaRefreshPromise = (async () => {
    const res = await supaFetchRaw_('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) throw new Error('ต่ออายุตั๋ว Supabase ไม่สำเร็จ');
    return supaSaveSession_(await res.json(), email);
  })();
  try {
    return await supaRefreshPromise;
  } finally {
    supaRefreshPromise = null;
  }
}

/** คืนตั๋วที่ยังใช้ได้ ต่ออายุให้เองถ้าใกล้หมด */
async function supaAccessToken_() {
  if (!supaSession) throw new Error('ยังไม่ได้เข้าสู่ระบบ Supabase');
  if (Date.now() >= (supaSession.expires_at || 0) - SUPA_REFRESH_MARGIN_MS) {
    await supaRefreshSession_();
  }
  return supaSession.access_token;
}

/* ===== ตัวยิงคำขอ ===== */

function supaFetchRaw_(path, options) {
  const opts = Object.assign({}, options);
  opts.headers = Object.assign({ apikey: SUPABASE_PUBLISHABLE_KEY }, opts.headers || {});

  // ตัดคำขอที่ค้างนานเกินไปทิ้ง ไม่งั้นผู้ใช้จะเห็นตารางค้างว่างเปล่าโดยไม่มีข้อความบอก
  // และ jsonpRequest จะไม่มีโอกาสถอยไปใช้ Apps Script
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPA_TIMEOUT_MS);
  opts.signal = controller.signal;
  return fetch(SUPABASE_URL + path, opts).finally(() => clearTimeout(timer));
}

async function supaReadError_(res) {
  try {
    const body = await res.json();
    return body.error_description || body.msg || body.message || body.error || ('HTTP ' + res.status);
  } catch (e) {
    return 'HTTP ' + res.status;
  }
}

/**
 * ยิงคำขออ่านข้อมูลไปที่ PostgREST พร้อมตั๋วของผู้ใช้
 * ตั๋วนี้แหละที่ทำให้กฎ RLS รู้ว่าเป็นใคร และตัดสินว่าจะให้เห็นแถวไหนบ้าง
 */
async function supaSelect_(path, extraHeaders) {
  const token = await supaAccessToken_();
  const res = await supaFetchRaw_('/rest/v1' + path, {
    method: 'GET',
    headers: Object.assign({ Authorization: 'Bearer ' + token }, extraHeaders || {})
  });
  if (res.status === 401 || res.status === 403) {
    // ตั๋วหมดอายุระหว่างทาง หรือสิทธิ์ถูกถอน — ลองต่ออายุหนึ่งครั้งแล้วยิงใหม่
    await supaRefreshSession_();
    const token2 = await supaAccessToken_();
    const res2 = await supaFetchRaw_('/rest/v1' + path, {
      method: 'GET',
      headers: Object.assign({ Authorization: 'Bearer ' + token2 }, extraHeaders || {})
    });
    if (!res2.ok) throw new Error(await supaReadError_(res2));
    return res2;
  }
  if (!res.ok) throw new Error(await supaReadError_(res));
  return res;
}

/* ===== เครื่องมือประกอบคำค้น ===== */

/**
 * ใส่เครื่องหมายคำพูดให้ค่าที่จะส่งเป็นเงื่อนไขของ PostgREST
 *
 * จำเป็นมากกับข้อมูลชุดนี้ เพราะชื่อไฟล์และชื่อแท็บภาษาไทยมีทั้งเว้นวรรค วงเล็บ และจุลภาค
 * ถ้าไม่ใส่ PostgREST จะอ่านจุลภาคเป็นตัวคั่นเงื่อนไข แล้วได้ผลลัพธ์ผิดแบบเงียบๆ
 */
function supaQuote_(value) {
  return '"' + String(value === null || value === undefined ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"') + '"';
}

/** หนีอักขระพิเศษของ LIKE ก่อนเอาไปค้นแบบมีคำค้นอยู่ตรงไหนก็ได้ */
function supaLikePattern_(keyword) {
  const safe = String(keyword || '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, '\\,');
  return '*' + safe + '*';
}

/* ===== อ่านโครงสร้างแท็บ ===== */

// โครงสร้างแท็บ (หัวตาราง ตำแหน่งคอลัมน์สถานะ) เปลี่ยนน้อยมาก จำไว้ได้ทั้งรอบการใช้งาน
// ช่วยให้การเปลี่ยนหน้าไม่ต้องยิงคำขอซ้ำเรื่องเดิม
const supaMetaCache_ = new Map();

async function supaSheetMeta_(book, sheet) {
  const key = book + '\u0000' + sheet;
  if (supaMetaCache_.has(key)) return supaMetaCache_.get(key);
  const res = await supaSelect_(
    '/sheet_meta?select=headers,header_row_index,list_columns,status_header,date_header,dropdown_options' +
    '&book=eq.' + encodeURIComponent(supaQuote_(book)) +
    '&sheet=eq.' + encodeURIComponent(supaQuote_(sheet)) +
    '&limit=1'
  );
  const rows = await res.json();
  if (!rows.length) throw new Error('ยังไม่มีข้อมูลแท็บนี้ใน Supabase');
  const meta = rows[0];
  meta.headers = meta.headers || [];
  meta.statusIndex = meta.status_header
    ? meta.headers.indexOf(meta.status_header)
    : meta.headers.findIndex(h => h === 'สถานะ' || String(h || '').toLowerCase() === 'status');

  // แปลงตัวเลือก dropdown ให้เป็นรูปแบบ [{name, options}] ตามที่หน้าเว็บใช้อยู่
  // ต้องได้ตัวเลือก "ครบทุกค่าที่ตั้งไว้ในชีต" ไม่ใช่เฉพาะค่าที่บังเอิญมีในหน้าที่กำลังดู
  // ไม่งั้นช่องเปลี่ยนสถานะในตารางจะขาดตัวเลือกไปเงียบๆ แล้วแก้สถานะเป็นค่านั้นไม่ได้เลย
  const dd = meta.dropdown_options || {};
  meta.headersMeta = Object.keys(dd).map(name => ({ name: name, options: dd[name] }));

  supaMetaCache_.set(key, meta);
  return meta;
}

/** ล้างโครงสร้างที่จำไว้ ต้องเรียกเมื่อมีการเพิ่ม/ลบคอลัมน์ หรือสร้างแท็บใหม่ */
function supaClearMetaCache() {
  supaMetaCache_.clear();
}

/* ===== แปลงแถวของ Supabase ให้เป็นรูปแบบเดิมที่หน้าเว็บเข้าใจ ===== */

/**
 * ฐานข้อมูลเก็บข้อมูลเป็น jsonb ที่คีย์ด้วย "ชื่อคอลัมน์" (ทนต่อการสลับตำแหน่งคอลัมน์ในชีต)
 * แต่หน้าเว็บทั้งหมดทำงานกับ cells ที่เป็น "อาร์เรย์เรียงตามตำแหน่ง" จึงต้องแปลงกลับตรงนี้
 *
 * ต้องเรียงตามหัวตารางของแท็บนั้นเสมอ ห้ามใช้ลำดับคีย์ใน jsonb เพราะ PostgreSQL ไม่รับประกันลำดับ
 */
function supaRowToItem_(row, meta, keepIndices) {
  const headers = meta.headers;
  const data = row.data || {};
  const links = {};
  const cells = [];

  for (let i = 0; i < headers.length; i++) {
    const name = headers[i];
    if (keepIndices && !keepIndices[i]) {
      cells.push('');
    } else {
      const v = data[name];
      cells.push(v === null || v === undefined ? '' : String(v));
    }
    // ลิงก์เก็บคีย์ด้วยชื่อคอลัมน์ แต่หน้าเว็บอ้างด้วยตำแหน่ง จึงต้องแปลงคีย์ด้วย
    if (row.links && row.links[name]) links[i] = row.links[name];
  }

  const item = { row: row.row_index, cells: cells };
  if (Object.keys(links).length > 0) item.links = links;
  if (row.row_color) item.color = row.row_color;
  return item;
}

/* ===== คำสั่งหลัก: ดึงข้อมูลตารางหนึ่งหน้า ===== */

/**
 * แทนที่ action 'tabView' ของ Apps Script — คืนค่าในรูปแบบเดียวกันเป๊ะ
 * เพื่อให้ applyTabViewResult_() ใน script.js ใช้ได้โดยไม่ต้องแก้อะไรเลย
 *
 * สำคัญ: ต้องกรอง (คำค้น + สถานะ) ก่อนตัดหน้าเสมอ
 * ถ้าตัดหน้าก่อนกรอง หน้าแรกจะได้แถวไม่ครบตามจำนวนที่ขอ และยอดรวมจะผิด
 * ตรงนี้ฐานข้อมูลจัดการให้เองผ่าน where + range ซึ่งถูกต้องตามลำดับอยู่แล้ว
 */
async function supaTabView(params) {
  const book = params.book;
  const sheet = params.sheet;
  const offset = Math.max(0, parseInt(params.offset, 10) || 0);
  const limit = parseInt(params.limit, 10) || 0;
  const keyword = (params.q || '').toString().trim();
  const status = (params.status || '').toString().trim();
  const slim = params.slim !== false;
  const isFirstChunk = offset === 0;

  const meta = await supaSheetMeta_(book, sheet);

  let query = '/sheet_rows?select=row_index,data,links,row_color' +
    '&book=eq.' + encodeURIComponent(supaQuote_(book)) +
    '&sheet=eq.' + encodeURIComponent(supaQuote_(sheet));

  if (keyword) {
    // ค้นแบบไม่สนตัวพิมพ์เล็กใหญ่ จากคอลัมน์ search_text ที่รวมทุกช่องไว้แล้วตอนซิงก์
    // คอลัมน์นี้มีดัชนี pg_trgm รองรับ จึงค้นคำที่อยู่กลางข้อความได้เร็ว
    // (ภาษาไทยไม่มีการเว้นวรรคระหว่างคำ จึงใช้ full-text search แบบตัดคำไม่ได้)
    query += '&search_text=ilike.' + encodeURIComponent(supaLikePattern_(keyword));
  }
  if (status) {
    if (status === NO_STATUS_LABEL_CLIENT) {
      // "ตรวจสอบสถานะ" ไม่ใช่ค่าที่มีอยู่จริงในชีต แต่เป็นป้ายที่ระบบตั้งให้แถวที่ยังไม่ได้ระบุสถานะ
      // ในฐานข้อมูลแถวพวกนี้เก็บเป็น null หรือค่าว่าง ถ้ากรองด้วยตัวข้อความตรงๆ จะได้ 0 แถวเสมอ
      // ทั้งที่หน้าสรุปแสดงว่ามีอยู่หลายร้อยเคส
      query += '&or=(status.is.null,status.eq.)';
    } else {
      query += '&status=eq.' + encodeURIComponent(supaQuote_(status));
    }
  }

  query += '&order=row_index.asc';
  if (limit > 0) query += '&offset=' + offset + '&limit=' + limit;

  // count=exact ทำให้ฐานข้อมูลนับยอดรวมของ "ทุกแถวที่ตรงเงื่อนไข" มาให้ในหัวข้อตอบกลับ
  // หน้าเว็บต้องใช้ตัวเลขนี้คำนวณจำนวนหน้า จะนับจากแถวที่ส่งมาไม่ได้ เพราะส่งมาแค่หน้าเดียว
  const res = await supaSelect_(query, { Prefer: 'count=exact' });
  const rows = await res.json();
  const total = supaParseContentRange_(res.headers.get('content-range'), rows.length, offset);

  // ส่งเฉพาะคอลัมน์ที่ตารางรายการแสดงจริง เหมือนที่ Apps Script ทำ
  // แต่ต้องเก็บคอลัมน์ "สถานะ" ไว้เสมอ เพราะช่องกรองสถานะด้านบนตารางอ่านค่าจากแถวที่โหลดมา
  // ถ้าตัดออก เลือกสถานะไหนก็จะขึ้น "ไม่พบข้อมูล" ทั้งที่ในชีตมีอยู่จริง (เคยพลาดมาแล้ว)
  let listColumns = null;
  let keepIndices = null;
  if (slim && Array.isArray(meta.list_columns) && meta.list_columns.length > 0) {
    listColumns = meta.list_columns;
    keepIndices = {};
    listColumns.forEach(i => { keepIndices[i] = true; });
    if (meta.statusIndex !== -1) keepIndices[meta.statusIndex] = true;
  }

  return {
    ok: true,
    headers: isFirstChunk ? meta.headers : [],
    listColumns: listColumns,
    statusIndex: isFirstChunk ? meta.statusIndex : -1,
    headersMeta: isFirstChunk ? (meta.headersMeta || []) : [],
    results: rows.map(r => supaRowToItem_(r, meta, keepIndices)),
    total: total,
    offset: limit > 0 ? offset : 0,
    hasMore: limit > 0 ? (offset + rows.length < total) : false,
    truncated: false,
    linksDeferred: false,  // ลิงก์ Ticket ซิงก์มาเก็บไว้แล้ว ไม่ต้องขอเพิ่มทีหลังเหมือนเดิม
    source: 'supabase'
  };
}

/**
 * อ่านยอดรวมจากหัวข้อ Content-Range ที่ PostgREST ส่งมา เช่น "0-49/1234"
 * ถ้าอ่านไม่ได้ให้ถอยไปใช้จำนวนแถวที่ได้มาจริง ดีกว่าให้ตัวเลขหน้าพัง
 */
function supaParseContentRange_(header, fallbackCount, offset) {
  const m = /\/(\d+)$/.exec(header || '');
  if (m) return parseInt(m[1], 10);
  return offset + fallbackCount;
}

/* ===== สรุปยอดตามสถานะ ===== */

/**
 * แทน action 'sheetStatusTally' — นับจำนวนเคสแยกตามสถานะของแท็บหนึ่ง
 * ใช้วิวที่สร้างไว้ในฐานข้อมูลแล้ว จึงไม่ต้องดึงข้อมูลทั้งแท็บมานับฝั่งหน้าเว็บ
 */
async function supaStatusTally(book, sheet) {
  const res = await supaSelect_(
    '/sheet_status_tally?select=status,count' +
    '&book=eq.' + encodeURIComponent(supaQuote_(book)) +
    '&sheet=eq.' + encodeURIComponent(supaQuote_(sheet))
  );
  const rows = await res.json();
  const tally = {};
  rows.forEach(r => {
    const label = (r.status || '').toString().trim() || NO_STATUS_LABEL_CLIENT;
    tally[label] = (tally[label] || 0) + Number(r.count || 0);
  });
  return { ok: true, tally: tally, source: 'supabase' };
}

// ต้องตรงกับค่า NO_STATUS_LABEL ใน Code.gs เป๊ะ
// เป็นทั้งป้ายที่แสดงและคีย์ที่ใช้ค้นต่อ ถ้าไม่ตรงกัน กดจากหน้าสรุปแล้วจะค้นไม่เจอ
const NO_STATUS_LABEL_CLIENT = 'ตรวจสอบสถานะ';
