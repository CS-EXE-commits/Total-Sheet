// วาง Web app URL ที่ deploy จาก Apps Script ไว้ตรงนี้
// ตัวอย่าง: https://script.google.com/macros/s/วาง-DEPLOYMENT-ID-ของคุณที่นี่.../exec
const API_URL = 'https://script.google.com/macros/s/วาง-DEPLOYMENT-ID-ของคุณที่นี่/exec';

// รหัสเข้าถึง ต้องตรงกับค่าที่ตั้งไว้ใน Script Properties ชื่อ DASHBOARD_ACCESS_KEY
const ACCESS_KEY = 'วาง-ACCESS-KEY-ที่ตั้งไว้ใน-Script-Properties';

// Client ID จาก Google Cloud Console (สร้างที่ APIs & Services > Credentials > OAuth client ID)
// ต้องตรงกับค่าที่ตั้งไว้ใน Script Properties ฝั่ง Apps Script ชื่อ GOOGLE_CLIENT_ID ด้วย
// (ดูวิธีสร้างแบบละเอียดในไฟล์ README.md หัวข้อ "ตั้งค่าล็อกอินด้วย Google")
const GOOGLE_CLIENT_ID = 'วาง-GOOGLE-CLIENT-ID-ของคุณ';

// ต้องตรงกับค่าที่ตั้งไว้ตอน Deploy: Execute as: 'Me', Access: 'Anyone'
// (เปลี่ยนจาก 'Anyone within organization' เป็น 'Anyone' เพื่อให้ fetch()/JSONP ทำงานได้
//  โดยไม่ติดปัญหา CORS/login redirect — ใช้รหัสลับด้านบนแทนการเช็คอีเมล)
//
// สำคัญ: ทุกครั้งที่แก้ Code.gs แล้ว Deploy ใหม่ ให้ตรวจสอบว่าแก้ deployment
// รายการเดียวกับที่ URL นี้ชี้ไปเสมอ (เช็คได้ที่ Deploy > Manage deployments)
