// วาง Web app URL ที่ deploy จาก Apps Script ไว้ตรงนี้
// ตัวอย่าง: https://script.google.com/macros/s/AKfycb.../exec
const API_URL = 'https://script.google.com/macros/s/AKfycbxCOgi69ybzSLBktjma9Djj23jTv1Jh0WTmkLshBnPi3YX6Bi6LKbwPgriHD6LeHsvK/exec';

// รหัสเข้าถึง ต้องตรงกับค่าที่ตั้งไว้ใน Script Properties ชื่อ DASHBOARD_ACCESS_KEY
const ACCESS_KEY = 'a07pxG9js452JLCQAc3F';

// Client ID จาก Google Cloud Console (สร้างที่ APIs & Services > Credentials > OAuth client ID)
// ต้องตรงกับค่าที่ตั้งไว้ใน Script Properties ฝั่ง Apps Script ชื่อ GOOGLE_CLIENT_ID ด้วย
// (ดูวิธีสร้างแบบละเอียดในไฟล์ README.md หัวข้อ "ตั้งค่าล็อกอินด้วย Google")
const GOOGLE_CLIENT_ID = '671642907953-d5j5886jeq6b5uu3jtor6aotl292h77g.apps.googleusercontent.com';

// ต้องตรงกับค่าที่ตั้งไว้ตอน Deploy: Execute as: 'Me', Access: 'Anyone'
// (เปลี่ยนจาก 'Anyone within organization' เป็น 'Anyone' เพื่อให้ fetch()/JSONP ทำงานได้
//  โดยไม่ติดปัญหา CORS/login redirect — ใช้รหัสลับด้านบนแทนการเช็คอีเมล)
//
// สำคัญ: ทุกครั้งที่แก้ Code.gs แล้ว Deploy ใหม่ ให้ตรวจสอบว่าแก้ deployment
// รายการเดียวกับที่ URL นี้ชี้ไปเสมอ (เช็คได้ที่ Deploy > Manage deployments)
