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
/**
 * ข้อมูลของคำขอล่าสุด ไว้ใส่ในข้อความแจ้งเตือนเวลาผลลัพธ์ว่าง
 *
 * จำเป็นเพราะ "ไม่มีข้อมูล" เกิดได้จากหลายสาเหตุที่หน้าเว็บแยกไม่ออกเลย
 * (สิทธิ์ RLS ปฏิเสธ / ชื่อไม่ตรง / ตั๋วหมดอายุ / ตารางผิด) ทุกกรณีได้ 0 แถวเหมือนกันหมด
 * ถ้าไม่บอกรหัสตอบกลับกับอีเมลในตั๋วมาด้วย จะต้องไปไล่ดูใน DevTools ทุกครั้ง
 */
let supaLastCall_ = { status: 0, path: '', count: -1 };

/** อ่านอีเมลจากตั๋ว ใช้เทียบกับรายชื่อในตาราง allowed_users ตอนหาสาเหตุ */
function supaTokenEmail_() {
  try {
    return JSON.parse(atob((supaSession.access_token || '').split('.')[1])).email || '(ไม่มีอีเมลในตั๋ว)';
  } catch (e) {
    return '(อ่านตั๋วไม่ออก)';
  }
}

/** ข้อความอธิบายว่าคำขอล่าสุดเกิดอะไรขึ้น ใช้ต่อท้าย error ให้วินิจฉัยได้ทันที */
function supaDiagnostic_() {
  const d = supaLastCall_;
  let hint = '';
  if (d.status === 200 && d.count === 0) {
    hint = ' — เซิร์ฟเวอร์ตอบสำเร็จแต่ไม่มีแถวไหนที่อ่านได้ ' +
           'แปลว่ากฎความปลอดภัย (RLS) ปฏิเสธ หรือชื่อที่ใช้ค้นไม่ตรงกับในฐานข้อมูล';
  } else if (d.status === 401 || d.status === 403) {
    hint = ' — ตั๋วเข้าใช้งานใช้ไม่ได้';
  } else if (d.status === 404) {
    hint = ' — ไม่พบตารางหรือวิวนี้ในฐานข้อมูล';
  }
  return ' [รหัส ' + d.status + ', ได้ ' + d.count + ' แถว, อีเมลในตั๋ว: ' +
         supaTokenEmail_() + ', คำขอ: ' + decodeURIComponent(d.path) + ']' + hint;
}

async function supaSelect_(path, extraHeaders) {
  const token = await supaAccessToken_();
  supaLastCall_ = { status: 0, path: path, count: -1 };
  const res = await supaFetchRaw_('/rest/v1' + path, {
    method: 'GET',
    headers: Object.assign({ Authorization: 'Bearer ' + token }, extraHeaders || {})
  });
  supaLastCall_.status = res.status;
  if (res.status === 401 || res.status === 403) {
    // ตั๋วหมดอายุระหว่างทาง หรือสิทธิ์ถูกถอน — ลองต่ออายุหนึ่งครั้งแล้วยิงใหม่
    await supaRefreshSession_();
    const token2 = await supaAccessToken_();
    const res2 = await supaFetchRaw_('/rest/v1' + path, {
      method: 'GET',
      headers: Object.assign({ Authorization: 'Bearer ' + token2 }, extraHeaders || {})
    });
    supaLastCall_.status = res2.status;
    if (!res2.ok) throw new Error(await supaReadError_(res2));
    return res2;
  }
  if (!res.ok) throw new Error(await supaReadError_(res));
  return res;
}

/* ===== เครื่องมือประกอบคำค้น ===== */

/**
 * ใส่เครื่องหมายคำพูดให้ค่า — ใช้ได้เฉพาะในรายการแบบ in.(ก,ข,ค) เท่านั้น
 *
 * ===== ห้ามใช้กับเงื่อนไขแบบ eq. เด็ดขาด =====
 *
 * PostgREST ไม่ถอดเครื่องหมายคำพูดออกให้ในเงื่อนไขแบบ eq. มันเอาไปค้นทั้งเครื่องหมาย
 * กลายเป็นค้นหาคำว่า  "พิจารณาปลด 2026"  ที่มีอัญประกาศติดอยู่จริงๆ ซึ่งไม่มีในฐานข้อมูล
 * ผลคือได้ 0 แถวทุกครั้ง โดยไม่มี error ใดๆ ให้เห็น — เป็นบั๊กที่หายากที่สุดของโปรเจกต์นี้
 *
 * เงื่อนไขแบบ eq. ให้ส่งค่าดิบผ่าน encodeURIComponent อย่างเดียวพอ
 * จุลภาคในค่าไม่เป็นปัญหา เพราะ PostgREST อ่านจุลภาคเป็นตัวคั่นเฉพาะใน in.() และ or() เท่านั้น
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

/**
 * ทำให้ชื่อไฟล์/ชื่อแท็บอยู่ในรูปแบบมาตรฐานก่อนนำมาเทียบกัน
 *
 * จำเป็นมากกับภาษาไทย เพราะสระและวรรณยุกต์เก็บได้หลายรูปแบบในระดับไบต์
 * เช่น "พิ" เก็บเป็น พ + สระอิ (2 หน่วย) หรือเป็นอักขระรวม (1 หน่วย) ก็ได้
 * มองด้วยตาเหมือนกันทุกประการ แต่คอมพิวเตอร์เทียบแล้วไม่ตรง แล้วหาข้อมูลไม่เจอแบบไม่มีสัญญาณเตือน
 *
 * normalize('NFC') รวมให้เป็นรูปแบบเดียว ส่วนการยุบช่องว่างกันกรณีเผลอเคาะเว้นวรรคซ้ำในชื่อแท็บ
 */
function supaNormalizeName_(value) {
  let s = String(value === null || value === undefined ? '' : value);
  try { s = s.normalize('NFC'); } catch (e) { /* เบราว์เซอร์เก่ามาก ข้ามไป ยังเทียบแบบตัดช่องว่างได้ */ }
  return s.trim().replace(/\s+/g, ' ');
}

function supaMetaKey_(book, sheet) {
  return supaNormalizeName_(book) + '\u0000' + supaNormalizeName_(sheet);
}

/**
 * โหลดโครงสร้างของ "ทุกแท็บทุกไฟล์" มาเก็บไว้ครั้งเดียว แล้วค้นในหน่วยความจำแทน
 *
 * ทำไมถึงเลิกค้นด้วยชื่อผ่านฐานข้อมูล: การส่งชื่อภาษาไทยไปเป็นเงื่อนไขใน URL
 * มีจุดที่พลาดได้หลายชั้น (รูปแบบการเก็บสระ การแปลงอักขระใน URL เครื่องหมายคำพูด วงเล็บ)
 * และทุกความผิดพลาดให้ผลเหมือนกันหมดคือ "ไม่พบข้อมูล" ซึ่งแยกสาเหตุไม่ได้เลย
 *
 * ทั้งระบบมีแค่ 26 แท็บ ข้อมูลส่วนนี้เล็กมาก (ไม่กี่สิบกิโลไบต์) โหลดทีเดียวจบ
 * แล้วใช้ "ชื่อที่ฐานข้อมูลเก็บไว้จริง" ไปค้นข้อมูลแถวต่อ จึงตรงกันแน่นอนเสมอ
 *
 * ผลพลอยได้: เร็วขึ้นด้วย เพราะไม่ต้องยิงคำขอถามโครงสร้างทีละแท็บอีกต่อไป
 */
let supaMetaLoaded_ = false;
let supaMetaLoading_ = null;

async function supaLoadAllMeta(force) {
  if (supaMetaLoaded_ && !force) return supaMetaCache_.size;
  if (supaMetaLoading_) return supaMetaLoading_;

  supaMetaLoading_ = (async () => {
    const res = await supaSelect_(
      '/sheet_meta?select=book,sheet,headers,header_row_index,list_columns,' +
      'status_header,date_header,dropdown_options,row_count,position&order=position.asc,id.asc'
    );
    const rows = await res.json();
    supaLastCall_.count = Array.isArray(rows) ? rows.length : -1;
    if (!rows.length) throw new Error('ไม่พบโครงสร้างแท็บใดเลยใน Supabase' + supaDiagnostic_());

    supaMetaCache_.clear();
    rows.forEach(meta => {
      meta.headers = meta.headers || [];
      meta.statusIndex = meta.status_header
        ? meta.headers.indexOf(meta.status_header)
        : meta.headers.findIndex(h => h === 'สถานะ' || String(h || '').toLowerCase() === 'status');
      const dd = meta.dropdown_options || {};
      meta.headersMeta = Object.keys(dd).map(name => ({ name: name, options: dd[name] }));
      supaMetaCache_.set(supaMetaKey_(meta.book, meta.sheet), meta);
    });
    supaMetaLoaded_ = true;
    return supaMetaCache_.size;
  })();

  try {
    return await supaMetaLoading_;
  } finally {
    supaMetaLoading_ = null;
  }
}

async function supaSheetMeta_(book, sheet) {
  await supaLoadAllMeta();
  const meta = supaMetaCache_.get(supaMetaKey_(book, sheet));
  if (!meta) {
    // ถึงตรงนี้แปลว่าโหลดโครงสร้างมาได้แล้ว แต่ไม่มีแท็บชื่อนี้อยู่จริง
    // (เพิ่งสร้างแท็บใหม่แล้วยังไม่ถึงรอบซิงก์ หรือเปลี่ยนชื่อแท็บ)
    const known = Array.from(supaMetaCache_.values())
      .filter(m => supaNormalizeName_(m.book) === supaNormalizeName_(book))
      .map(m => m.sheet);
    throw new Error(
      'ไม่พบแท็บ "' + sheet + '" ของไฟล์ "' + book + '" ในข้อมูลที่ซิงก์ไว้ ' +
      '(แท็บที่มีของไฟล์นี้: ' + (known.length ? known.join(', ') : 'ไม่มีเลย') + ')'
    );
  }
  // หัวตาราง ตำแหน่งคอลัมน์สถานะ และตัวเลือก dropdown เตรียมไว้ตอนโหลดแล้ว (ดู supaLoadAllMeta)
  return meta;
}

/** ล้างโครงสร้างที่จำไว้ ต้องเรียกเมื่อมีการเพิ่ม/ลบคอลัมน์ หรือสร้างแท็บใหม่ */
function supaClearMetaCache() {
  supaMetaCache_.clear();
  supaTallyMemo_ = null;
  supaMetaLoaded_ = false;   // ต้องโหลดใหม่ ไม่งั้นแท็บ/คอลัมน์ที่เพิ่งเพิ่มจะไม่โผล่
}

/**
 * ดึงโครงสร้างของ "ทุกแท็บในไฟล์" มาจำไว้ล่วงหน้าด้วยคำขอเดียว
 *
 * ทำไมถึงช่วยให้เร็วขึ้นชัดเจน: เดิมการกดแท็บต้องยิง 2 คำขอเรียงกัน
 * คำขอแรกถามโครงสร้าง (หัวตาราง ตำแหน่งคอลัมน์สถานะ) แล้วค่อยถามข้อมูลแถว
 * คำขอที่สองเริ่มไม่ได้จนกว่าคำขอแรกจะกลับมา เวลารอจึงเป็นผลบวกของทั้งคู่
 *
 * เรียกตอนโหลดรายชื่อแท็บครั้งเดียว หลังจากนั้นทุกแท็บในไฟล์เหลือคำขอเดียว
 * เวลาที่ประหยัดได้ = เวลาไป-กลับหนึ่งรอบ ประมาณ 100-200 มิลลิวินาทีต่อการกดแท็บ 1 ครั้ง
 */
async function supaWarmBookMeta() {
  return await supaLoadAllMeta();
}

/**
 * แทน action 'sheets' — รายชื่อแท็บของไฟล์ พร้อมจำนวนแถว
 * เดิมคำสั่งนี้ต้องเปิดไฟล์ Google Sheets จริงเพื่อนับแถวของทุกแท็บ ซึ่งช้าที่สุดตอนเพิ่งเปิดไฟล์
 */
async function supaSheetList(book) {
  await supaLoadAllMeta();
  // คัดจากโครงสร้างที่โหลดไว้แล้ว ไม่ต้องยิงคำขอใหม่ และไม่ต้องส่งชื่อไทยไปเป็นเงื่อนไขใน URL
  // ลำดับที่ได้คือลำดับที่โหลดมา ซึ่งเรียงตามตำแหน่งจริงในชีท (ซ้ายไปขวา) อยู่แล้ว
  const want = supaNormalizeName_(book);
  const sheets = [];
  supaMetaCache_.forEach(meta => {
    if (supaNormalizeName_(meta.book) !== want) return;
    sheets.push({ book: meta.book, name: meta.sheet, rowCount: meta.row_count || 0 });
  });
  if (!sheets.length) {
    const books = Array.from(new Set(Array.from(supaMetaCache_.values()).map(m => m.book)));
    throw new Error('ไม่พบไฟล์ "' + book + '" ในข้อมูลที่ซิงก์ไว้ (ไฟล์ที่มี: ' + books.join(' | ') + ')');
  }
  return { ok: true, sheets: sheets, source: 'supabase' };
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

  // ใช้ชื่อที่ "ฐานข้อมูลเก็บไว้จริง" ไม่ใช่ชื่อที่หน้าเว็บส่งมา
  // สองค่านี้อาจต่างกันในระดับไบต์ได้ (รูปแบบการเก็บสระภาษาไทย ช่องว่างเกิน)
  // ซึ่งทำให้หาข้อมูลไม่เจอแบบไม่มีสัญญาณเตือนอะไรเลย
  let query = '/sheet_rows?select=row_index,data,links,row_color' +
    '&book=eq.' + encodeURIComponent(meta.book) +
    '&sheet=eq.' + encodeURIComponent(meta.sheet);

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
      query += '&status=eq.' + encodeURIComponent(status);
    }
  }

  query += '&order=row_index.asc';
  if (limit > 0) query += '&offset=' + offset + '&limit=' + limit;

  // count=exact ทำให้ฐานข้อมูลนับยอดรวมของ "ทุกแถวที่ตรงเงื่อนไข" มาให้ในหัวข้อตอบกลับ
  // หน้าเว็บต้องใช้ตัวเลขนี้คำนวณจำนวนหน้า จะนับจากแถวที่ส่งมาไม่ได้ เพราะส่งมาแค่หน้าเดียว
  const res = await supaSelect_(query, { Prefer: 'count=exact' });
  const rows = await res.json();
  const total = supaParseContentRange_(res.headers.get('content-range'), rows.length, offset);
  supaLastCall_.count = Array.isArray(rows) ? rows.length : -1;

  // ตาข่ายกันหน้าจอว่าง
  //
  // ถ้าโครงสร้างบอกว่าแท็บนี้มีข้อมูลอยู่ แต่ถามข้อมูลแถวแล้วได้ 0 แถว แปลว่ามีอะไรผิดปกติ
  // (สิทธิ์ของตารางข้อมูลแถวต่างจากตารางโครงสร้าง หรือซิงก์โครงสร้างมาแต่ยังไม่ได้ซิงก์แถว)
  // ห้ามแสดงว่า "ไม่พบข้อมูล" เด็ดขาด เพราะผู้ใช้จะเข้าใจว่าข้อมูลในชีทหายไป
  // โยน error ออกไปให้ถอยไปอ่านจาก Google Sheets แทน ซึ่งเป็นต้นฉบับจริงเสมอ
  if (total === 0 && !keyword && !status && (meta.row_count || 0) > 0) {
    throw new Error(
      'แท็บ "' + meta.sheet + '" ควรมี ' + meta.row_count + ' แถว แต่อ่านข้อมูลแถวได้ 0 แถว' +
      supaDiagnostic_()
    );
  }

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

/* ===== ข้อมูลประกอบการเพิ่ม/แก้ไข (แทน action headers / tableHeaders / rowFull) =====
 *
 * เดิมการเปิดหน้าต่างแก้ไขต้องรอ Apps Script 3 คำขอ (คอลัมน์ ตัวเลือก dropdown ข้อมูลทั้งแถว)
 * ซึ่งต้องเปิดไฟล์ Google Sheets ทุกครั้ง ใช้เวลาหลายวินาที
 * ตอนนี้โครงสร้างแท็บโหลดไว้ในหน่วยความจำแล้ว (supaLoadAllMeta) จึงตอบได้ทันทีโดยไม่ต้องยิงคำขอ
 */

/** แทน action 'headers' — เฉพาะคอลัมน์ที่มีชื่อ พร้อมตัวเลือก dropdown */
async function supaHeaders(book, sheet) {
  const meta = await supaSheetMeta_(book, sheet);
  const dd = meta.dropdown_options || {};
  const seen = {};
  const headers = [];
  meta.headers.forEach(name => {
    const n = (name || '').toString().trim();
    if (!n || seen[n]) return;
    seen[n] = true;
    headers.push({ name: n, options: dd[n] || [] });
  });
  return { ok: true, headers: headers, source: 'supabase' };
}

/** แทน action 'tableHeaders' — หัวตารางเรียงตามตำแหน่งจริง (รวมคอลัมน์ที่ไม่มีชื่อ) */
async function supaTableHeaders(book, sheet) {
  const meta = await supaSheetMeta_(book, sheet);
  return {
    ok: true,
    headers: meta.headers.slice(),
    statusIndex: meta.statusIndex,
    headerRowIndex: meta.header_row_index,
    source: 'supabase'
  };
}

/**
 * แทน action 'rowFull' — ข้อมูลทุกคอลัมน์ของแถวเดียว
 *
 * ส่งลายนิ้วมือแถว (fingerprint) ที่ตัวซิงก์คำนวณจากชีทจริงกลับไปด้วย
 * หน้าเว็บต้องใช้ค่านี้ตอนสั่งแก้/ลบ ห้ามคำนวณจาก cells เอง
 * เพราะ cells ที่สร้างจาก Supabase ไม่มีค่าของคอลัมน์ที่ไม่มีชื่อหัวตาราง ลายนิ้วมือจะไม่ตรงกับชีท
 * แล้วการบันทึกจะถูกปฏิเสธว่า "ข้อมูลแถวนี้เปลี่ยนไปแล้ว" ทั้งที่ไม่มีใครแก้
 */
async function supaRowFull(book, sheet, rowNum) {
  const meta = await supaSheetMeta_(book, sheet);
  const res = await supaSelect_(
    '/sheet_rows?select=row_index,data,links,row_color,fingerprint' +
    '&book=eq.' + encodeURIComponent(meta.book) +
    '&sheet=eq.' + encodeURIComponent(meta.sheet) +
    '&row_index=eq.' + encodeURIComponent(parseInt(rowNum, 10)) +
    '&limit=1'
  );
  const rows = await res.json();
  if (!rows.length || !rows[0].fingerprint) {
    throw new Error('ไม่พบแถวที่ ' + rowNum + ' ใน Supabase');
  }
  const item = supaRowToItem_(rows[0], meta, null);
  return {
    ok: true,
    book: meta.book,
    sheet: meta.sheet,
    row: item.row,
    headers: meta.headers.slice(),
    cells: item.cells,
    links: item.links || {},
    fingerprint: rows[0].fingerprint,
    source: 'supabase'
  };
}

/* ===== สรุปยอดตามสถานะ ===== */

/**
 * แทน action 'sheetStatusTally' — นับจำนวนเคสแยกตามสถานะของแท็บหนึ่ง
 * ใช้วิวที่สร้างไว้ในฐานข้อมูลแล้ว จึงไม่ต้องดึงข้อมูลทั้งแท็บมานับฝั่งหน้าเว็บ
 */
async function supaStatusTally(book, sheet) {
  const meta = await supaSheetMeta_(book, sheet);  // เพื่อให้ได้ชื่อที่ฐานข้อมูลเก็บไว้จริง
  const res = await supaSelect_(
    '/sheet_status_tally?select=status,count' +
    '&book=eq.' + encodeURIComponent(meta.book) +
    '&sheet=eq.' + encodeURIComponent(meta.sheet)
  );
  const rows = await res.json();
  const tally = {};
  rows.forEach(r => {
    const label = (r.status || '').toString().trim() || NO_STATUS_LABEL_CLIENT;
    tally[label] = (tally[label] || 0) + Number(r.count || 0);
  });
  return { ok: true, tally: tally, source: 'supabase' };
}

/**
 * ตรวจสุขภาพการเชื่อมต่อหนึ่งครั้งหลังล็อกอิน แล้วสรุปผลลง Console
 *
 * ทำไมต้องมี: เวลาอ่านข้อมูลไม่ได้ สาเหตุที่เป็นไปได้มีหลายอย่างและหน้าเว็บแยกไม่ออก
 * การตรวจแบบ "ขอข้อมูลโดยไม่ใส่เงื่อนไขอะไรเลย" แยกสองสาเหตุหลักออกจากกันได้ทันที
 *
 *   ได้ 0 แถว ทั้งที่ไม่ได้กรองอะไร  → กฎความปลอดภัย (RLS) ปฏิเสธ
 *   ได้แถวมา แต่พอกรองด้วยชื่อแล้วหาย → ชื่อไฟล์หรือชื่อแท็บไม่ตรงกัน
 *
 * ไม่ throw ไม่ว่าเกิดอะไรขึ้น เป็นแค่เครื่องมือช่วยวินิจฉัย ห้ามทำให้ล็อกอินล้มเหลว
 */
async function supaSelfTest() {
  try {
    // โหลดโครงสร้างทั้งหมดไปเลยในตัว ถือเป็นการตรวจและเตรียมข้อมูลพร้อมกัน
    const count = await supaLoadAllMeta(true);
    console.log('[Supabase] พร้อมใช้งาน — โหลดโครงสร้างแล้ว ' + count + ' แท็บ');
    return true;
  } catch (errLoad) {
    console.error('[Supabase] โหลดโครงสร้างไม่สำเร็จ: ' + errLoad.message);
  }
  try {
    const res = await supaSelect_('/sheet_meta?select=book,sheet&limit=3');
    const rows = await res.json();
    supaLastCall_.count = Array.isArray(rows) ? rows.length : -1;

    if (!rows.length) {
      console.error(
        '[Supabase] อ่านข้อมูลไม่ได้เลยแม้แต่แถวเดียว แม้จะไม่ได้กรองอะไร\n' +
        'สาเหตุคือกฎความปลอดภัย (RLS) ปฏิเสธ ไม่ใช่เรื่องชื่อไม่ตรง\n' +
        'อีเมลในตั๋ว: ' + supaTokenEmail_() + '\n' +
        'ให้ตรวจว่าอีเมลนี้มีอยู่ในตาราง allowed_users และสะกดเหมือนกันทุกตัวอักษร'
      );
      return false;
    }

    console.log('[Supabase] เชื่อมต่อและอ่านข้อมูลได้ปกติ — ตัวอย่างที่อ่านได้:', rows);
    return true;
  } catch (err) {
    console.error('[Supabase] ตรวจการเชื่อมต่อไม่ผ่าน: ' + err.message);
    return false;
  }
}

/**
 * ข้อมูลทุกคอลัมน์ของเคสเดียว ในรูปแบบ fields ของ action 'caseDetail' ([{name, value}])
 * ใช้เปิดหน้าต่างรายละเอียดเคสได้ทันที ส่วนประวัติ (timeline) ยังต้องขอจาก Apps Script เพราะอยู่ใน Log
 */
async function supaCaseFields(book, sheet, rowNum) {
  const full = await supaRowFull(book, sheet, rowNum);
  const fields = [];
  const seen = {};
  full.headers.forEach((name, i) => {
    const n = (name || '').toString().trim();
    if (!n || seen[n]) return;      // เฉพาะคอลัมน์ที่มีชื่อ เหมือน getHeaderMap_ ฝั่ง Apps Script
    seen[n] = true;
    const link = full.links && full.links[i];
    fields.push({ name: n, value: link || full.cells[i] || '' });
  });
  return fields;
}

/* ===== หน้ารายละเอียดตามสถานะ (status.html) =====
 *
 * เดิม Apps Script ต้องเปิดไล่อ่านทุกไฟล์ทุกแท็บเพื่อนับสถานะ แล้วเปิดอ่านทั้งแท็บอีกรอบเพื่อหาเคส
 * ใช้เวลาหลายวินาทีถึงหลายสิบวินาที ตอนนี้ถามฐานข้อมูลที่มีดัชนีตามสถานะอยู่แล้ว
 *
 * ทุกฟังก์ชันคืนรูปแบบเดียวกับ Apps Script เป๊ะ status.js จึงไม่ต้องแก้วิธีแสดงผล
 * นับเฉพาะแท็บที่ "มีคอลัมน์สถานะ" เหมือน Apps Script ไม่งั้นแท็บที่ไม่มีคอลัมน์นี้
 * จะถูกนับเป็น "ตรวจสอบสถานะ" ทั้งแท็บ แล้วตัวเลขจะไม่ตรงกับหน้าหลัก
 */

function supaStatusKey_(status) {
  const s = (status || '').toString().trim();
  return s || NO_STATUS_LABEL_CLIENT;
}

/** แท็บไหนมีคอลัมน์สถานะบ้าง (คีย์: ไฟล์ + แท็บ) */
async function supaStatusSheets_() {
  await supaLoadAllMeta();
  const map = {};
  supaMetaCache_.forEach(meta => {
    if (meta.status_header) map[meta.book + '\u0000' + meta.sheet] = meta;
  });
  return map;
}

/** อ่านยอดนับสถานะทุกแท็บทั้งระบบ (จากวิว sheet_status_tally) */
// ผลนับสถานะใช้ร่วมกันได้ 15 วินาที — แถบสถานะด้านข้างกับสรุปของสถานะที่เลือกขอพร้อมกันตอนเปิดหน้า
// จะได้ยิงคำขอเดียว ไม่ต้องรอ 2 รอบ
let supaTallyMemo_ = null;
function supaAllStatusTally_() {
  if (supaTallyMemo_ && Date.now() - supaTallyMemo_.at < 15000) return supaTallyMemo_.p;
  const p = Promise.all([
    supaSelect_('/sheet_status_tally?select=book,sheet,status,count').then(res => res.json()),
    supaStatusSheets_()   // ยิงพร้อมกัน ไม่รอกันเป็นทอด
  ]).then(([rows, withStatus]) => rows.filter(r => withStatus[r.book + '\u0000' + r.sheet]));
  supaTallyMemo_ = { at: Date.now(), p };
  p.catch(() => { supaTallyMemo_ = null; });
  return p;
}

/** แทน action 'globalDashboard' สำหรับแถบรายชื่อสถานะด้านซ้าย (ใช้แค่ statusBreakdown) */
async function supaStatusBreakdown() {
  const rows = await supaAllStatusTally_();
  const tally = {};
  const sheets = {};
  let totalRows = 0;
  rows.forEach(r => {
    const key = supaStatusKey_(r.status);
    const n = Number(r.count || 0);
    tally[key] = (tally[key] || 0) + n;
    totalRows += n;
    sheets[r.book + '\u0001' + r.sheet] = true;
  });
  const statusBreakdown = Object.keys(tally)
    .map(status => ({ status: status, count: tally[status] }))
    .sort((a, b) => b.count - a.count);
  return { ok: true, statusBreakdown: statusBreakdown, totalRows: totalRows,
    sheetsScanned: Object.keys(sheets).length, source: 'supabase' };
}

/** แทน action 'statusSummary' — สถานะนี้อยู่ที่ไฟล์/แท็บไหนบ้าง กี่เคส */
async function supaStatusSummary(status) {
  const target = (status || '').toString().trim();
  if (!target) throw new Error('กรุณาระบุสถานะที่ต้องการดู');
  const rows = await supaAllStatusTally_();
  const groups = [];
  let total = 0;
  rows.forEach(r => {
    if (supaStatusKey_(r.status) !== target) return;
    const count = Number(r.count || 0);
    if (count <= 0) return;
    groups.push({ book: r.book, sheet: r.sheet, count: count });
    total += count;
  });
  groups.sort((a, b) => b.count - a.count);
  return { ok: true, status: target, total: total, groups: groups, source: 'supabase' };
}

// ต้องตรงกับ pickListColumns_ ใน Code.gs (คอลัมน์ที่ตารางแสดง: วันที่ / EXE ID / Ticket)
function supaPickListColumns_(headers) {
  const picked = [];
  (headers || []).forEach((name, index) => {
    const h = (name || '').toString().trim();
    if (!h) return;
    const isDate = /วันที่|วัน\s*เดือน|^date$|_date$|^date\b/i.test(h) || h.toLowerCase() === 'date';
    const isExeId = /exe\s*[_-]?\s*id/i.test(h);
    const isTicket = /ticket/i.test(h);
    if (isDate || isExeId || isTicket) picked.push(index);
  });
  return picked;
}

const SUPA_STATUS_ROWS_LIMIT = 2000; // ต้องเท่ากับ STATUS_ROWS_LIMIT ใน Code.gs

/**
 * แทน action 'statusRows' — เคสทุกคอลัมน์ของสถานะนี้ในแท็บเดียว
 *
 * ส่งครบทุกคอลัมน์ (ไม่ตัด) เพราะปุ่มดาวน์โหลด Excel ของหน้านี้ใช้ข้อมูลชุดนี้ตรงๆ
 * หัวตารางเป็นเฉพาะคอลัมน์ที่มีชื่อ เรียงตามชีท (เหมือน getHeaderMap_ ฝั่ง Apps Script)
 * คีย์ของลิงก์คือตำแหน่งในรายการหัวตารางชุดนี้ ไม่ใช่เลขคอลัมน์จริงในชีท
 */
async function supaStatusRows(status, book, sheet) {
  const target = (status || '').toString().trim();
  if (!target) throw new Error('กรุณาระบุสถานะที่ต้องการดู');
  const meta = await supaSheetMeta_(book, sheet);
  if (!meta.status_header) throw new Error(`แท็บ "${sheet}" ไม่มีคอลัมน์สถานะ`);

  const headers = [];
  meta.headers.forEach(name => {
    const n = (name || '').toString().trim();
    if (n && headers.indexOf(n) === -1) headers.push(n);
  });

  let query = '/sheet_rows?select=row_index,data,links' +
    '&book=eq.' + encodeURIComponent(meta.book) +
    '&sheet=eq.' + encodeURIComponent(meta.sheet);
  query += target === NO_STATUS_LABEL_CLIENT
    ? '&or=(status.is.null,status.eq.)'
    : '&status=eq.' + encodeURIComponent(target);
  query += '&order=row_index.asc&limit=' + SUPA_STATUS_ROWS_LIMIT;

  const res = await supaSelect_(query, { Prefer: 'count=exact' });
  const data = await res.json();
  const matched = supaParseContentRange_(res.headers.get('content-range'), data.length, 0);

  const rows = data.map(r => {
    const d = r.data || {};
    const item = { row: r.row_index, cells: headers.map(n => (d[n] === null || d[n] === undefined) ? '' : String(d[n])) };
    const links = {};
    headers.forEach((n, j) => { if (r.links && r.links[n]) links[j] = r.links[n]; });
    if (Object.keys(links).length) item.links = links;
    return item;
  });

  const listColumns = supaPickListColumns_(headers);
  return {
    ok: true,
    book: meta.book,
    sheet: meta.sheet,
    status: target,
    headers: headers,
    listColumns: listColumns.length ? listColumns : null,
    rows: rows,
    matched: matched,
    truncated: matched > rows.length,
    source: 'supabase'
  };
}

// ต้องตรงกับค่า NO_STATUS_LABEL ใน Code.gs เป๊ะ
// เป็นทั้งป้ายที่แสดงและคีย์ที่ใช้ค้นต่อ ถ้าไม่ตรงกัน กดจากหน้าสรุปแล้วจะค้นไม่เจอ
const NO_STATUS_LABEL_CLIENT = 'ตรวจสอบสถานะ';
