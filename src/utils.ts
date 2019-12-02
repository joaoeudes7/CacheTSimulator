import { isNumber } from "util";
import { SlotMemory, FormatInstruction } from "./models/types";

const unitsMemory = ['', 'KB', 'MB', 'GB', 'TB'];
const unitsBlock = ['', 'K'];

export function memoryToBytes(memory: SlotMemory) {
  return memory.size * Math.pow(1024, unitsMemory.indexOf(memory.unit))
}

export function randonHex(lim: number) {
  return '0x' + Math.floor(Math.random() * lim).toString(16).toUpperCase()
}

/**
 * Formats memory (Remove spaces and Uppercase, and return size and unit)
 * @param value Value of Memory Primary
 */
export function mapperMemory(value: string): SlotMemory {
  // Clear spaces
  const _value = value.replace(/\s+/g, '').toUpperCase();
  // Extract letters
  const size = +_value.replace(/[a-zA-Z]/g, '');
  // Extract numbers
  const unit = _value.replace(/\d+/g, '');

  return { size, unit }
}

export function mapperBlock(value: string): number {
  const { size, unit } = mapperMemory(value);

  return size * Math.pow(1000, unitsBlock.indexOf(unit));
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
  const limIndex = (format.tag + format.index);

  const tag = instruction.slice(0, format.tag);
  const index = instruction.slice(format.tag, limIndex) || '0';
  const offset = instruction.slice(limIndex)

  return { tag, index, offset };
}

export function isValidSize(size: number, unit: string) {
  const isUnit = unitsMemory.includes(unit);
  const isSizeValid = (isNumber(size) && (memoryToBytes({ size, unit }) % 2) == 0 && size > 0);

  return (isSizeValid && isUnit);
}

/**
 * Utils to Convert
 */
export const convert = {
  bin2dec: (s: string) => Number(parseInt(s, 2).toString(10)),
  bin2hex: (s: string) => '0x' + parseInt(s, 2).toString(16),
  dec2bin: (s: string) => parseInt(s, 10).toString(2),
  dec2hex: (s: string) => parseInt(s, 10).toString(16),
  hex2bin: (s: string) => parseInt(s, 16).toString(2),
  hex2dec: (s: string) => Number(parseInt(s, 16).toString(10))
};
