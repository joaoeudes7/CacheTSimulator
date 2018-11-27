import inquirer = require("inquirer");
import chalk from 'chalk';
import { Cache } from './src/Cache';
import { randonHex, isValidSize, mapperMemory, hexToBin, formatBinary, getInfoInstruction } from "./src/utils";

let cache: Cache;

requestInputs()

function requestInputs() {
  const questions: inquirer.Questions = [{
    type: 'input',
    name: 'memory',
    message: 'Tamanho da memória Principal (4 GB):',
    validate: (input) => {
      const { size, unit } = mapperMemory(input);
      if (isValidSize(size, unit)) {
        return true
      } else {
        throw Error(`Entrada de memória inválida! (${input})`)
      }
    }
  },
  {
    type: 'input',
    name: 'slotsCache',
    message: 'Slot no Cache (2 KB):'
  },
  {
    type: 'input',
    name: 'slotsPerConjunt',
    message: 'Conjuntos por Slot:',
    validate: (input: string) => {
      if ((/\d+/).exec(input)) {
        return true
      } else {
        throw Error('Entrada inválida!')
      }
    }
  },
  {
    type: 'input',
    name: 'wordsPerSlot',
    message: 'Palavras por Conjunto:',
    validate: (input: string) => {
      if ((/\d+/).exec(input)) {
        return true
      } else {
        throw Error('Entrada inválida!')
      }
    }
  }];

  inquirer.prompt(questions)
    .then(data => {
      const { memory, slotsCache, slotsPerConjunt, wordsPerSlot } = data;
      cache = new Cache(memory, slotsCache, slotsPerConjunt, wordsPerSlot);
    })
    .then(() => showResult())
    .then(() => requestInputDemoMemory())
}

function showResult() {
  console.log(`
    Memoria Principal: ${cache.memoryInBytes} bytes²
    Blocos por Conjunto: ${cache.slotsPerConjunt}
    Palavras por Bloco: ${cache.wordsPerSlot}

    // MAPEAMENTO DIRETO
    TAG ${cache.formatInstruction.tag} (bits)
    IND ${cache.formatInstruction.index} (bits)
    OFF ${cache.formatInstruction.offset} (bits)

    Tamanho do bloco: ${cache.sizeBlock} bytes
    Tamanho total de Palavras por bloco: ${cache.sizeDataPerBlock} bytes²
    Total de bits usados no cache: ${cache.memoryInBits} bits
  `)
}

async function requestInputDemoMemory() {
  let option = null;
  while (option !== 'exit') {
    const question: inquirer.Question =
    {
      type: 'list',
      name: 'option',
      message: 'O que deseja fazer?',
      choices: [
        { value: 'insert', name: 'Inserir endereço' },
        { value: 'random', name: 'Gerar endereço Aleatório' },
        { value: 'exit', name: 'Sair' }
      ]
    }

    await inquirer.prompt(question)
      .then(async data => {
        option = data['option'];

        if (option == 'insert') {
          const questionAddress: inquirer.Question = { name: 'adress', message: 'Endereço:' }
          await inquirer.prompt(questionAddress)
            .then(data => showMemory(data['adress']))
        } else if (option == 'random') {
          const _randonHex = randonHex(cache.memoryInBytes)
          showMemory(_randonHex)
        }
      })
      .then(() => showRatio())
  }
}

function showRatio() {
  console.log(chalk`
    Leituras no Cache: ${cache.reads} vezes
    Escritas no Cache: ${cache.written} vezes
    Conflitos: ${cache.collisions} vezes
    Miss rate: {redBright ${cache.miss} / ${cache.ratio.miss}% (erro)}
    Hits rate: {greenBright ${cache.hits} / ${cache.ratio.hits}% (sucesso)}
  `);
}

function showMemory(addressHex: string) {
  const _andressBin = formatBinary(cache.memoryInBits, hexToBin(addressHex))
  const {tag, index} = getInfoInstruction(_andressBin, cache.formatInstruction)

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