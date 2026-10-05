# AI Perfumery Engine

ระบบช่วยออกแบบ ประเมิน และเตรียมผสมน้ำหอมสำหรับนักปรุงและแล็บ

**สถานะ 2026-10-04:** มี [เดโม MVP แบบโต้ตอบ](demo/README.md) ที่รันได้ด้วย Next.js + TypeScript ใช้ข้อมูลสังเคราะห์และสถานะในหน่วยความจำเท่านั้น ส่วน `src/` ยังเป็นโครงสำหรับระบบจริง ไม่มี backend หรือฐานข้อมูลที่รันได้ การมีเดโมและ OpenAPI draft ไม่ใช่หลักฐานว่า engine/auth/backend ทำแล้ว

## ขอบเขตและเทคโนโลยี

ใช้ **Next.js + TypeScript, Go + Gin, PostgreSQL, sqlc + pgx, REST, Docker, GitHub Actions, Go tests/Vitest/Playwright** ตาม Honney ส่วน MVP ใช้บัญชี/MFA → สูตรและเวอร์ชัน/วิเคราะห์ → batch/การชั่ง → compliance/เอกสาร → โหมดสอนและมาสคอตแบบข้อความคงที่ จาก repo frontend ที่เจ้าของเลือก

อ่าน [MVP scope](.docs/02-design/mvp-scope.md) และ [tech stack](.docs/02-design/tech-stack.md) เพื่อแยกสิ่งที่เลือกแล้วจากคำตัดสินใจที่ยังค้างอยู่ ไม่มีการนำ Vite, Mantine หรือ Python/FastAPI มาเป็น stack ของโปรเจกต์นี้

สิ่งที่ลงมือทำก่อนในสปรินต์นี้อยู่ใน [scope lock](.docs/01-requirements/scope-lock.md) ซึ่งเป็นการจัดลำดับงานสำหรับเดโม ไม่ได้เปลี่ยนลำดับความสำคัญใน backlog

## เอกสารสำหรับตรวจงาน

| เอกสาร | ใช้ดูอะไร |
|---|---|
| [Proposal](proposal/proposal.md) | ปัญหา ผู้ใช้ และขอบเขตโครงการ |
| [Product backlog](.docs/01-requirements/backlog.md) | ข้อกำหนด เกณฑ์ตรวจรับ ลำดับ wave และประเด็นที่ยังต้องตัดสินใจ |
| [Scope lock](.docs/01-requirements/scope-lock.md) | สิ่งที่ทำในสปรินต์นี้ และสิ่งที่ตั้งใจไม่ทำ |
| [Feature list](.docs/02-design/feature-list.md) / [journey](.docs/02-design/user-journey.md) | ส่วนงานและเส้นทางผู้ใช้ |
| [Diagrams](.docs/02-design/diagrams.md) | Context, use case, architecture และ activity |
| [Data model](.docs/02-design/data-model.md) / [engine](.docs/02-design/calculation-engine.md) | ข้อมูลและเส้นทางคำนวณ |
| [Roles](.docs/02-design/roles-permissions.md) / [REST contract](.docs/02-design/api-contract.md) | สิทธิ์และสัญญาเชื่อมหน้าจอกับ Go |
| [Rules](.docs/03-compliance/rule.md) / [legal requirements](.docs/03-compliance/legal-requirements.md) | กฎบังคับและ traceability จาก W2 |
| [Prototype status](.docs/02-design/prototype/prototype.md) | สถานะต้นแบบและงานที่ต้องปรับ |
| [Source layout](src/README.md) | โครงโฟลเดอร์ปัจจุบันและโครงที่จะต้องเพิ่ม |

เมื่อเอกสารขัดกัน ลำดับคือ กฎหมายและข้อบังคับ → `rule.md` → `backlog.md` → เอกสารใน `.docs/02-design/` ถ้าข้อมูลไม่พอให้ตอบว่า `insufficient information` ไม่ใช่สร้างข้อกำหนดขึ้นมาเอง

ข้อมูลสาร กฎ interaction เกณฑ์ และสูตรจริงเป็นความลับ ต้องใช้ข้อมูลสังเคราะห์ในการพัฒนาและคงข้อมูลจริงใน infrastructure ที่อนุมัติ ผลที่ข้อมูลไม่พอต้องแสดง `insufficient data` พร้อมเหตุผล ไม่สร้างตัวเลขหรือค่าความมั่นใจขึ้นมาเอง

## ลองเดโม

ใช้ Node.js >=20.9 แล้วเปิดจากโฟลเดอร์ repo:

```powershell
cd demo
npm.cmd ci --ignore-scripts
npm.cmd run dev
```

ตัวอย่างใช้ `npm.cmd` สำหรับ Windows PowerShell หากใช้ macOS/Linux ให้ใช้ `npm` แทน ต้องเข้าโฟลเดอร์ `demo/` ก่อนติดตั้งหรือเปิดเดโม วิธีแก้ `npm.ps1` ถูกบล็อกและวิธีเปลี่ยนพอร์ตอยู่ใน [DEMO.md](demo/DEMO.md)

เปิด http://127.0.0.1:3000 เพื่อทดลองสูตร/เวอร์ชัน/what-if แล็บ เอกสาร บัญชี บทบาท และบทสอน รีเฟรชหรือรีเซ็ตแล้วข้อมูลกลับค่าเริ่มต้น ปุ่มรูปพระจันทร์/พระอาทิตย์บนแถบด้านบนสลับโหมดสว่าง/มืด และจำเฉพาะโหมดที่เลือกไว้ในเบราว์เซอร์ รายละเอียดการทดลองและข้อจำกัดอยู่ใน [demo/README.md](demo/README.md) และ [สถานะ prototype](.docs/02-design/prototype/prototype.md)

เดโมแยกจากแอปจริงตาม rule 85 ไม่รับข้อมูลจริงและไม่ได้คำนวณผลเคมี การเพิ่ม authentication จริงยังต้องส่ง consent/สิทธิ์ข้อมูลส่วนตัว/access log พร้อมกันตาม rule.md

## การทำงานร่วมกันใน repo นี้

| Branch | ใช้ทำอะไร | จบอย่างไร |
|---|---|---|
| `main` | ต้องรันได้เสมอ | เอกสารและ config commit เข้าตรงได้ |
| `feat/<slug>` | ความสามารถใหม่หนึ่งอย่าง | เปิด PR, squash, ลบ branch |
| `fix/<slug>` | แก้บั๊กหนึ่งเรื่อง | เหมือนกัน |
| `chore/<slug>` | setup, config, CI | เหมือนกัน |

โค้ดต้องแยก branch เสมอ ส่วนเอกสารกับ config ไม่ต้อง เพราะทำให้ build พังไม่ได้ และการรอ review ไฟล์ markdown ทำให้ทีมช้าโดยไม่ได้ความปลอดภัยเพิ่มขึ้น branch ควรมีอายุเป็นชั่วโมง ไม่ใช่เป็นสัปดาห์

commit ทีละเรื่อง commit เมื่อ repo ยังทำงานได้ และอย่าปล่อยให้ `main` พัง
