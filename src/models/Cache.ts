import { mapperMemory, formatBinary, memoryToBytes, convert, mapperBlock, getInfoInstruction, randonHex } from "../utils";
import { SlotMemory, TypeMapping, ResultAccess } from "./types";
import { Conjunt, Block } from "./Conjunt";
import { History } from "./History";

/**
 * (Simulador de Cache)
 * @author joaoeudes7<joaoeudes7@gmail.com>
 */
export class Cache {

  public memoryPrimary: SlotMemory;
  public blocks: number;
  public blocksPerConjunt: number;
  public wordsPerBlock: number;

  public conjunt: Conjunt = {};

  public reads: number = 0;      // Leituras no Cache
  public written: number = 0;    // Escritas no Cache

  public hits: number = 0;       // Número de acertos (Encontrado no Cache)
  public miss: number = 0;       // Número de erros (Não encontrado na Cache)
  public collisions: number = 0; // Número de colisões

  public history: History[] = [];

  /**
   * @param memory            - memória principal
   * @param blocks            - total de slots/blocks no Cache
   * @param blocksPerConjunt  - quantidade de blocos por conjunto (Potência de 2)
   * @param wordsInBlock      - quantidade palavras por bloco (Potência de 2)
   */
  constructor(memory: string, blocks: string, blocksPerConjunt: number, wordsInBlock: number) {
    this.memoryPrimary = mapperMemory(memory);
    this.blocks = mapperBlock(blocks);
    this.blocksPerConjunt = +blocksPerConjunt;
    this.wordsPerBlock = +wordsInBlock;

    this.initSlots();
  }

  /**
   * Inicializando blocos
   */
  private initSlots() {
    if (this.typeMapping == TypeMapping.fullAssociative) {
      this.conjunt['0'] = new Block();
    } else {
      for (let num = 0; num < (this.blocks / this.blocksPerConjunt); num++) {
        const index = formatBinary(this.bitsIndex, convert.dec2bin(num.toString()));

        this.conjunt[index] = new Block();
      }
    }
  }

  private upReads() {
    this.reads++;
  }

  private upCollisions() {
    this.collisions++;
  }

  private upMiss() {
    this.written++;
    this.miss++;
  }

  private upHits() {
    this.hits++

    this.history.push()
  }

  private removeLastItem(block: Block) {
    const len = block.data.length;

    block.data.splice(len - 1, 1);
  }

  /**
   * @description O Método pega o index e a tag e determina se é resulta em um Hit ou Miss
   * @param adress   - ID do índice
   */
  getData(addressHex: string) {
    const bin = formatBinary(this.memoryInBits, convert.hex2bin(addressHex))
    const { tag, index } = getInfoInstruction(bin, this.formatInstruction)

    if (!Object.keys(this.conjunt).includes(index)) {
      throw `Endereço inválido! O índice ${index || 'NULL'} está fora da faixa ou nula`;
    }

    this.upReads();

    const actualConjunt = this.conjunt[index];

    if (actualConjunt.data.includes(tag)) {
      this.upHits();

      this.history.push(new History(bin, ResultAccess.success));
    } else {
      this.upMiss();
      actualConjunt.setValid();

      // Verifica se o cache está cheio
      if (actualConjunt.data.length == this.blocksPerConjunt) {
        this.upCollisions();
        this.history.push(new History(bin, ResultAccess.collision));

        // Remove um item aleatório (1 das opções que podem ser feitas)
        this.removeLastItem(actualConjunt);
      } else {
        this.history.push(new History(bin, ResultAccess.empty));
      }
    }

    // change position to address recent
    actualConjunt.data = [...new Set([tag, ...actualConjunt.data])]
  }

  /**
   * @description Sets data
   * @param index   - Índice da memória cache
   * @param data    - Conteúdo ao ser adicionado
   */
  setData(index: number, data: any) {
    this.written++;
    this.conjunt[index] = data;
  }

  getRandomAddress() {
    return randonHex(this.memoryInBytes)
  }

  /**
   * log2(blocks/blocksPerConjunt) (bits)
   */
  get bitsIndex() {
    return Math.round(Math.log2(this.blocks / this.blocksPerConjunt));
  }

  /**
   * log2(wordsPerBlock) (bits)
   */
  get bitsOffset() {
    return Math.log2(this.wordsPerBlock * 4);
  }

  get bytesInWords() {
    return this.wordsPerBlock * 4
  }

  /**
   * (MpBits) – (n + m) (bits)
   */
  get bitsTag() {
    return (this.memoryInBits) - (this.bitsIndex + this.bitsOffset);
  }

  get conjuntInBytes() {
    return this.blocksPerConjunt * this.wordsPerBlock * 4;
  }

  get cacheInBytes() {
    return this.blocks * this.wordsPerBlock * 4;
  }

  get memoryInBytes() {
    return memoryToBytes(this.memoryPrimary);
  }

  get memoryInBits() {
    return Math.log2(this.memoryInBytes);
  }

  get typeMapping(): TypeMapping {
    if (this.blocksPerConjunt == 1) {
      return TypeMapping.direct
    } else if (this.blocks == this.blocksPerConjunt) {
      return TypeMapping.fullAssociative
    } else {
      return TypeMapping.associative
    }
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


  /**
   * @description Valor total de bits num bloco usando Mapeamento Direto
   */
  get totalOfBits(): number { // [2^indice * ((sizeBlock) + (sizeTag))] (bits)
    const { bitsTag, bitsIndex, blocks, memoryInBits } = this;

    return Math.pow(2, bitsIndex) * ((blocks + memoryInBits) + bitsTag);
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

