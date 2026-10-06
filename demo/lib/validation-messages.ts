// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Thai wording for the demo's English validation messages. Validators keep returning English
// (tests assert it); the UI localises at render time. Unknown messages are shown as written.
const validationMessagesTh:Record<string,string>={
  'Declared amounts must total exactly 100%. Values are never normalised.':'ยอดรวมสัดส่วนต้องเท่ากับ 100% พอดี ระบบไม่ปรับค่าให้เอง',
  'Enter a declared product dilution greater than 0 and no more than 100%.':'ใส่การเจือจางในผลิตภัณฑ์ที่มากกว่า 0 และไม่เกิน 100%',
  'Enter a positive decimal amount for every material.':'ใส่สัดส่วนเป็นทศนิยมที่มากกว่า 0 ให้ทุกวัตถุดิบ',
  'Use no more than 12 decimal places for this demo input.':'ใช้ทศนิยมไม่เกิน 12 ตำแหน่งในเดโมนี้',
  'Select a demo vehicle and application.':'เลือกพาหะและการใช้งานของเดโม',
  'A material can appear only once in this demo input.':'วัตถุดิบหนึ่งรายการใส่ได้ครั้งเดียว',
  'Choose a listed demo material.':'เลือกวัตถุดิบจากรายการ',
  'Add at least one demo material.':'เพิ่มวัตถุดิบอย่างน้อย 1 รายการ',
  'Invalid declared amount or dilution.':'สัดส่วนหรือการเจือจางไม่ถูกต้อง',
};

export function localizeValidationMessage(message:string|null,locale:'en'|'th'):string|null {
  if(!message) return message;
  return locale==='th'?validationMessagesTh[message]||message:message;
}
