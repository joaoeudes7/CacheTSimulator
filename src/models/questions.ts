import { QuestionCollection } from "inquirer";
import { isValidSize, mapperMemory } from "../utils";

export const requestConfigs: QuestionCollection = [{
  type: 'input',
  name: 'memory',
  message: 'Tamanho da memória Principal:',
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
  message: 'Slot no Cache:'
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

export const requestAdress: QuestionCollection = {
  type: 'list',
  name: 'option',
  message: 'O que deseja fazer?',
  choices: [
    { value: 'insert', name: 'Inserir endereço' },
    { value: 'random', name: 'Gerar endereço Aleatório' },
    { value: 'exit', name: 'Sair' }
  ]
}

export const requestManualAddress: QuestionCollection = {
  name: 'adress',
  message: 'Endereço:'
}
