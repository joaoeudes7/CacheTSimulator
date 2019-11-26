export interface SlotMemory {
  size: number,
  unit: string
}

export interface BlockSize {
  size: number,
  unit: string
}

export interface FormatInstruction {
  tag: number,
  index: number,
  offset?: number
}

export enum TypeMapping {
  direct = 'DIRECT',
  associative = 'ASSOCIATIVE',
  fullAssociative = 'FULL ASSOCIATIVE'
}

export enum ResultAccess {
  empty = 0,
  collision = 1,
  success = 2
}

export type Validator = 0 | 1;

