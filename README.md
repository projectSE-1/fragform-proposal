# AI Perfumery Engine

ระบบช่วยออกแบบ ประเมิน และเตรียมผสมน้ำหอมสำหรับนักปรุงและแล็บ

**สถานะ 2026-10-04:** ปรับเอกสาร MVP แล้วตามคำสั่งเจ้าของโครงการ; `src/` ยังเป็นโครงโฟลเดอร์ ไม่มีแอป ฐานข้อมูล หรือชุดทดสอบที่รันได้ การมี OpenAPI draft ไม่ใช่หลักฐานว่า backend ทำแล้ว

## ขอบเขตและเทคโนโลยี

ใช้ **Next.js + TypeScript, Go + Gin, PostgreSQL, sqlc + pgx, REST, Docker, GitHub Actions, Go tests/Vitest/Playwright** ตาม Honney ส่วน MVP ใช้บัญชี/MFA → สูตรและเวอร์ชัน/วิเคราะห์ → batch/การชั่ง → compliance/เอกสาร → โหมดสอนและมาสคอตแบบข้อความคงที่ จาก repo frontend ที่เจ้าของเลือก

อ่าน [MVP scope](.docs/02-design/mvp-scope.md) และ [tech stack](.docs/02-design/tech-stack.md) เพื่อแยกสิ่งที่เลือกแล้วจากคำตัดสินใจที่ยังค้างอยู่ ไม่มีการนำ Vite, Mantine หรือ Python/FastAPI มาเป็น stack ของโปรเจกต์นี้

## เอกสารสำหรับตรวจงาน

| เอกสาร | ใช้ดูอะไร |
|---|---|
| [Proposal](proposal/proposal.md) | ปัญหา ผู้ใช้ และขอบเขตโครงการ |
| [Product backlog](.docs/01-requirements/backlog.md) | ข้อกำหนด เกณฑ์ตรวจรับ ลำดับ wave และประเด็นที่ยังต้องตัดสินใจ |
| [Feature list](.docs/02-design/feature-list.md) / [journey](.docs/02-design/user-journey.md) | ส่วนงานและเส้นทางผู้ใช้ |
| [Diagrams](.docs/02-design/diagrams.md) | Context, use case, architecture และ activity |
| [Data model](.docs/02-design/data-model.md) / [engine](.docs/02-design/calculation-engine.md) | ข้อมูลและเส้นทางคำนวณ |
| [Roles](.docs/02-design/roles-permissions.md) / [REST contract](.docs/02-design/api-contract.md) | สิทธิ์และสัญญาเชื่อมหน้าจอกับ Go |
| [Rules](.docs/03-compliance/rule.md) / [legal requirements](.docs/03-compliance/legal-requirements.md) | กฎบังคับและ traceability จาก W2 |
| [Prototype status](.docs/02-design/prototype/prototype.md) | สถานะต้นแบบและงานที่ต้องปรับ |
| [Source layout](src/README.md) | โครงโฟลเดอร์ปัจจุบันและโครงที่จะต้องเพิ่ม |

ข้อมูลสาร กฎ interaction เกณฑ์ และสูตรจริงเป็นความลับ ต้องใช้ข้อมูลสังเคราะห์ในการพัฒนาและคงข้อมูลจริงใน infrastructure ที่อนุมัติ ผลที่ข้อมูลไม่พอต้องแสดง `insufficient data` พร้อมเหตุผล ไม่สร้างตัวเลขหรือค่าความมั่นใจขึ้นมาเอง

ไม่มีคำสั่งติดตั้ง/รันแอปในสถานะนี้ ต้องสร้างโปรเจกต์และเลือกเวอร์ชันที่ตรวจแล้วก่อน ทุกรอบที่เพิ่ม authentication ต้องส่ง consent/สิทธิ์ข้อมูลส่วนตัว/access log พร้อมกันตาม rule.md
