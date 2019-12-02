import chalk from 'chalk';

import { Cache } from "./models/Cache";
import { formatBinary, getInfoInstruction, convert } from "./utils";
import { ResultAccess } from './models/types';

function showInfoCache(cache: Cache) {
  console.log(`
    Memoria Principal: ${cache.memoryInBytes} bytes
    Bits: ${cache.memoryInBits}
    Memoria Cache: ${cache.cacheInBytes} bytes
    Blocos: ${cache.blocksPerConjunt}
    Palavras: ${cache.wordsPerBlock}

    // MAPEAMENTO ${cache.typeMapping}
    TAG ${cache.formatInstruction.tag} (bits)
    IND ${cache.formatInstruction.index} (bits)
    OFF ${cache.formatInstruction.offset} (bits)

    Tamanho do bloco: ${cache.conjuntInBytes} bytes
    Tamanho do cache: ${cache.cacheInBytes} bytes

  `)
}

function showRatioOfCache(cache: Cache) {
  console.log(chalk`
    Leituras no Cache: ${cache.reads} vezes
    Escritas no Cache: ${cache.written} vezes
    Conflitos: {yellow ${cache.collisions} vezes}
    Miss rate: {redBright ${cache.miss} / ${cache.ratio.miss}% (erro)}
    Hits rate: {greenBright ${cache.hits} / ${cache.ratio.hits}% (sucesso)}
  `);
}

function showMemory(cache: Cache, addressHex: string) {
  const bin = formatBinary(cache.memoryInBits, convert.hex2bin(addressHex))
  const { tag, index, offset } = getInfoInstruction(bin, cache.formatInstruction)

  let stringsHistoryColorid: string[] = []
  cache.history.forEach(h => {
    if (h.result == ResultAccess.empty) {
      stringsHistoryColorid.push(chalk.red(h.address))
    } else if (h.result == ResultAccess.collision) {
      stringsHistoryColorid.push(chalk.yellow(h.address))
    } else {
      stringsHistoryColorid.push(chalk.green(h.address))
    }
  });

  console.log(`
  Histórico: [${stringsHistoryColorid}]
  Endereço:
    HEX: ${addressHex}
    BIN: ${chalk.green(tag) + chalk.blue(index) + chalk.red(offset)}
    TAG: [${tag}]     INDEX: [${index}]
  `)

  for (const index of Object.keys(cache.conjunt).sort()) {
    console.log(`    {${chalk.blue(index)}}: [${chalk.bold(cache.conjunt[index].v)}][ ${chalk.green(cache.conjunt[index].data)} ]`)
  }
}

export {
  showMemory,
  showRatioOfCache,
  showInfoCache
}
