import { isNumber } from "util";

const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

type FormatInstruction = { tag: number, index: number, offset?: number }

export function memoryToBytes(size: number, unit: string) {
  return size * Math.pow(1024, units.indexOf(unit))
}

export function randonHex(lim: number) {
  return '0x' + Math.floor(Math.random() * lim).toString(16).toUpperCase()
}

export function itemExist(array: any, object: any) {
  return array.indexOf(object) > -1
}

export function mapperSlot(value: string) {
  const _value = value.replace(/\s+/g, '').toUpperCase();
  const size = +_value.replace(/[a-zA-Z]/g, '');
  const unit = _value.replace(/\d+/g, '');

  return { size, unit }
}

export function slotInBytes(size: number, unit: string) {
  const units = ['', 'K', 'M', 'G']

  return size * Math.pow(1024, units.indexOf(unit))
}

/**
 * Formats memory (Remove spaces and Uppercase, and return size and unit)
 * @param value Value of Memory Primary
 */
export function mapperMemory(value: string) {
  const _value = value.replace(/\s+/g, '').toUpperCase();
  const size = +_value.replace(/[a-zA-Z]/g, '');
  const unit = _value.replace(/\d+/g, '');

  return { size, unit }
}

/**
 * Format instruction adding requerids characters
 * @param instruction address in Binary
 * @param bitsRequerids memory primary in Bits (log2)
 */
export function formatBinary(bitsRequerids: number, instruction: string) {
  const qtd = bitsRequerids - instruction.length;
  if (qtd > 0) {
    const bits = '0'.repeat(qtd);
    instruction = bits + instruction;
  }

  return instruction;
}

/**
 * @description Retorna a Tag, o Índice e o Offset da instrução
 * @param instruction   - ID da instrução que deseja consultar
 * @param format        - formatação de bits de instrução (tag, index, offset)
 */
export function getInfoInstruction(instruction: string, format: FormatInstruction) {
  const tag = instruction.slice(0, format.tag);
  const index = instruction.slice(format.tag, (format.tag + format.index));

  return { tag, index };
}

export function isValidSize(size: number, unit: string) {
  const isUnit = units.includes(unit);
  const isSizeValid = (isNumber(size) && (memoryToBytes(size, unit) % 2) == 0 && size > 0);

  return (isSizeValid && isUnit);
}

export function decimalToBin(value: number) {
  return Number(value).toString(2);
}

export function binToDecimal(value: string) {
  return parseInt(value, 2);
}

export function hexToBin(value: string) {
  return parseInt(value, 16).toString(2)
}
