import { Cache } from "./models/Cache";
import chalk from 'chalk';
import { formatBinary, hexToBin, getInfoInstruction } from "./utils";

function showInfoCache(cache: Cache) {
  console.log(`
    Memoria Principal: ${cache.memoryInBytes} bytes
    Blocos: ${cache.blocks}
    Palavras: ${cache.wordsInBlock}

    MP Bytes: ${cache.memoryInBytes}
    Bits: ${cache.memoryInBits}

    // MAPEAMENTO ${cache.typeMapping ? 'DIRETO' : 'ASSOCIATIVO'}
    TAG ${cache.formatInstruction.tag} (bits)
    IND ${cache.formatInstruction.index} (bits)
    OFF ${cache.formatInstruction.offset} (bits)

    Tamanho total de Palavras por bloco: ${cache.sizeDataPerBlock} bytes
  `)
}

function showRatioOfCache(cache: Cache) {
  console.log(chalk`
    Leituras no Cache: ${cache.reads} vezes
    Escritas no Cache: ${cache.written} vezes
    Conflitos: ${cache.collisions} vezes
    Miss rate: {redBright ${cache.miss} / ${cache.ratio.miss}% (erro)}
    Hits rate: {greenBright ${cache.hits} / ${cache.ratio.hits}% (sucesso)}
  `);
}

function showMemory(cache: Cache, addressHex: string) {
  const _andressBin = formatBinary(cache.memoryInBits, hexToBin(addressHex))
  const { tag, index } = getInfoInstruction(_andressBin, cache.formatInstruction)

  console.log(`
  Endereço:
    HEX: ${addressHex}
    BIN: ${_andressBin}
    TAG: [${tag}]     INDEX: [${index}]
  `)

  cache.getData(tag, index);

  for (const index of Object.keys(cache.data)) {
    if (cache.data[index].length) {
      console.log(`    {${chalk.blueBright(index)}}: [ ${chalk.whiteBright(cache.data[index])} ]`)
    }
  }
}

export {
  showMemory,
  showRatioOfCache,
  showInfoCache
}
