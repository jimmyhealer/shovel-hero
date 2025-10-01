/**
 * 可重用的驗證工具函式
 * 對齊 SRS：欄位格式限制（plan.md section 11）
 */

/**
 * 驗證電話號碼格式
 * 允許數字、連字符號、括號、空格
 */
export function isValidPhone(phone: string): boolean {
  return /^[0-9-+\s()]+$/.test(phone);
}

/**
 * 驗證 Email 格式
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 驗證數量是否為正數
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * 檢查字串是否為空或只含空白
 */
export function isEmptyString(value: string): boolean {
  return !value || value.trim().length === 0;
}

/**
 * 檢查數值是否在範圍內
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
