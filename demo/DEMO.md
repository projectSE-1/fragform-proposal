<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# DEMO — เปิดใช้งานบนเครื่อง Local

โฟลเดอร์นี้เป็น **เดโม AI Perfumery Engine** บน branch `Honney` มี source code ครบสำหรับเปิดหน้าเว็บบนเครื่องตัวเอง ใช้ข้อมูลจำลอง ไม่มีบริการ backend หรือฐานข้อมูลจริง

## เปิดบนเครื่องอื่น

1. ติดตั้ง Node.js รุ่น 20.9 ขึ้นไปพร้อม npm (เครื่องที่ตรวจงานใช้ Node.js 24.18.1)
2. คัดลอกโฟลเดอร์ `demo/` จาก repository หรือแตกไฟล์ `demo-source.zip` แล้วเปิด terminal ในโฟลเดอร์ `demo`
3. ติดตั้งแพ็กเกจตามไฟล์ล็อก แล้วเปิดเดโม:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

เปิด [เดโมบนเครื่องนี้](http://127.0.0.1:3000/) ในเบราว์เซอร์ ต้องใช้อินเทอร์เน็ตตอนติดตั้งแพ็กเกจครั้งแรก เมื่อมีแพ็กเกจแล้ว หน้าเดโมทำงานในเครื่องโดยไม่เรียก API ภายนอก ไม่ต้องตั้ง `.env` หรือใส่ API key

คำสั่งข้างต้นใช้กับ Windows PowerShell โดยเรียก `npm.cmd` โดยตรง หากใช้ macOS/Linux ให้ใช้ `npm` แทน `npm.cmd`

หาก Terminal ยังอยู่ที่โฟลเดอร์ repository ให้รัน `cd demo` ก่อน คำสั่งติดตั้งและเปิดเว็บต้องรันในโฟลเดอร์ที่มี `demo/package.json`

เมื่อติดตั้งสำเร็จแล้ว ครั้งถัดไปใช้ `npm.cmd run dev` ได้เลย ไม่ต้องติดตั้งใหม่ทุกครั้ง

หากพบ `npm.ps1 cannot be loaded because running scripts is disabled` ให้ใช้ `npm.cmd` ตามตัวอย่าง คู่มือนี้ไม่ต้องเปลี่ยน Execution Policy ของเครื่อง การระบุนามสกุลเลือกคำสั่งให้ชัดเจนตาม [Microsoft PowerShell command precedence](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_command_precedence).

หาก `npm.cmd ci` พบ `EPERM ... unlink ... next-swc.win32-x64-msvc.node` ให้หยุดเดโมที่เปิดอยู่ด้วย `Ctrl+C` ใน Terminal ที่รันเดโม รอให้กลับมาที่ prompt แล้วติดตั้งอีกครั้ง เพราะ Windows อาจล็อกไฟล์ที่ Next.js กำลังใช้อยู่ หากยังติดล็อกอยู่ ให้ตรวจว่ามี Terminal อื่นรันเดโมนี้ค้างอยู่หรือไม่

หากพอร์ต 3000 มีโปรแกรมอื่นใช้อยู่ เปิดด้วยพอร์ตอื่นจากโฟลเดอร์ `demo`:

```powershell
npm.cmd exec next dev -- --hostname 127.0.0.1 --port 3001
```

แล้วเปิด http://127.0.0.1:3001/ กด `Ctrl+C` ใน terminal เพื่อหยุดเดโม

## เปิดจากชุดที่ Build แล้ว

```powershell
npm.cmd run build
npm.cmd start
```

Build นี้ยังเป็นเดโมข้อมูลจำลอง ต้องติดตั้งแพ็กเกจบนเครื่องปลายทาง ไม่คัดลอก `node_modules` หรือ `.next` ข้ามเครื่อง/ระบบปฏิบัติการ

## สิ่งที่ลองได้

- สูตร เวอร์ชัน การทดลอง what-if แล็บ เอกสาร บัญชี และบทสอนด้วยข้อมูลจำลอง
- ปุ่มรูปพระจันทร์/พระอาทิตย์บนแถบด้านบนสำหรับสลับ Light / Dark โดยจำเฉพาะโหมดในเบราว์เซอร์
- เปลี่ยนบทบาทและสถานะ Ready / Loading / Error เพื่อดูหน้าจอแต่ละแบบ

สูตรและข้อมูลทดลองอยู่ในหน่วยความจำ รีเฟรชหรือ Reset demo แล้วกลับค่าเริ่มต้น โหมดสว่าง/มืดยังคงตามที่เลือก ผลวิทยาศาสตร์และข้อกฎหมายยังแสดง `insufficient data` ตามข้อจำกัดของเดโม

รายละเอียดขอบเขตอยู่ใน [README](README.md) และผลตรวจอยู่ใน [validation](validation.md) ลิงก์เอกสารที่อยู่นอก `demo/` ต้องเปิดจาก repository ฉบับเต็ม ส่วน ZIP มีเฉพาะ source code และเอกสารของเดโม
