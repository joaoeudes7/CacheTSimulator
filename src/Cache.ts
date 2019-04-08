import { memoryToBytes, decimalToBin, mapperMemory, mapperSlot, slotInBytes, formatBinary, checkExist } from "./utils";

/**
 * (Simulador de Cache)
 * @author joaoeudes7<joaoeudes7@gmail.com>
 */
export class Cache {

  public memory: { size: number, unit: string };
  public slot: { size: number, unit: string };
  public slotsPerConjunt: number;
  public wordsPerSlot: number;

  public data: { [idBin: string]: any[] } = {};

  public reads: number = 0;      // Leituras no Cache
  public written: number = 0;    // Escritas no Cache

  public hits: number = 0;       // Número de acertos (Encontrado no Cache)
  public miss: number = 0;       // Número de erros (Não encontrado na Cache)
  public collisions: number = 0; // Número de colisões

  /**
   * @param memory            - memória principal
   * @param slots             - quantidade de slots na Cache
   * @param slotsPerConjunt   - quantidade de slots por conjunto (Potência de 2)
   * @param wordsPerSlot      - quantidade palavras por slot (Potência de 2)
   */
  constructor(memory: string, slots: string, slotsPerConjunt: number, wordsPerSlot: number) {
    this.memory = mapperMemory(memory);
    this.slot = mapperSlot(slots);
    this.slotsPerConjunt = +slotsPerConjunt;
    this.wordsPerSlot = +wordsPerSlot;

    this.initSlots();
  }

  /**
   * Inicializando blocos
   */
  private initSlots() {
    for (let num = 0; num < this.slotInBytes; num++) {
      const block = formatBinary(this.bitsIndex, decimalToBin(num));
      this.data[block] = []
    }
  }

  /**
   * @description O Método pega o index e a tag e determina se é resulta em um Hit ou Miss
   * @param adress   - ID do índice
   */
  getData(tag: string, index: string) {
    if (checkExist(Object.keys(this.data), index)) {
      this.reads++;
      if (checkExist(this.data[index], tag)) {
        this.hits++
      } else {
        this.written++;
        this.miss++;

        // Verifica se o cache está cheio
        if (this.data[index].length == this.slotsPerConjunt) {
          this.collisions++;
          // Remove um item aleatório (1 das opções que podem ser feitas)
          const len = this.data[index].length
          const randomItem = Math.floor(Math.random() * len);
          this.data[index].splice(randomItem, 1);
        }

        // Add nova tag
        this.data[index].push(tag);
      }
    } else {
      console.log(`Endereço inválido! A índice ${index} está fora da faixa`)
    }
  }

  /**
   * @description Sets data
   * @param index   - Índice da memória cache
   * @param data    - Conteúdo ao ser adicionado
   */
  setData(index: number, data: any) {
    this.written++;
    this.data[index] = data;
  }

  get bitsIndex() { // [log2(sizeCacheInBytes/blocksPerConjunt)] (bits)
    return Math.log2(this.slotInBytes / this.slotsPerConjunt);
  }

  get bitsOffset() { // [log2(WORDS) + 2 || log2(wordsPerBlock*4) ] (bits)
    return Math.log2(this.wordsPerSlot) + 2;
  }

  get bitsTag() { // [(MpBits-1) – (n + m) || (MpBits - n - m - 2) + 1] (bits)
    return (this.memoryInBits) - (this.bitsIndex + this.bitsOffset);
  }

  get slotInBytes() {
    return slotInBytes(this.slot.size, this.slot.unit);
  }

  get memoryInBytes() {
    return memoryToBytes(this.memory.size, this.memory.unit);
  }

  get memoryInBits() {
    return Math.log2(this.memoryInBytes);
  }

  get typeMapping(): TypeMapping {
    return this.slotsPerConjunt % 2;
  }

  /**
   * @description Retorna o Formato de instrução com seus respectivos tamanhos
   */
  get formatInstruction() {
    const tag = this.bitsTag;
    const index = this.bitsIndex;
    const offset = this.bitsOffset;
    return { tag, index, offset }
  }

  get sizeDataPerBlock() { // [MpBits * wordsPerSlot * slotsPerConjunt] (bytes)
    return (this.memoryInBits * this.wordsPerSlot * this.slotsPerConjunt);
  }

  get sizeBlock() { // [log2(m) * MpBits] (bytes)
    return Math.pow(2, this.bitsOffset + this.memoryInBits);
  }

  /**
   * @description Valor total de bits na cache usando Mapeamento Direto
   */
  get totalOfBits(): number { // [2^indice * ((sizeBlock) + (sizeTag))] (bits)
    const memoryInBits = this.memoryInBits;
    const index = this.bitsIndex;
    const sizeBlock = Math.pow(2, memoryInBits);
    const sizeTag = this.bitsTag
    return Math.pow(2, index) * ((sizeBlock + memoryInBits) + sizeTag);
  }

  /**
   * @description Retorna o ratio do leitura com erros (miss) e acertos(hits)
   */
  get ratio() {
    const radio = { hits: 0.0, miss: 0.0 };
    const toPercent = (value: number) => Math.trunc(value * 100);

    if (this.hits > 0) {
      radio.hits = toPercent(this.hits / this.reads);
    }
    if (this.miss > 0) {
      radio.miss = toPercent(this.miss / this.reads);
    }

    return radio;
  }
}

enum TypeMapping {
  associative = 0,
  direct = 1,
}
