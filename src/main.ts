import inquirer = require("inquirer");
import chalk from 'chalk';

import { Cache } from './models/Cache';
import { randonHex, convert } from "./utils";
import { requestConfigs, requestAdress, requestManualAddress } from "./questions";
import { showInfoCache, showMemory, showRatioOfCache } from "./logs";

async function createCache() {
  const data = await inquirer.prompt(requestConfigs)
  const { memory, slotsCache, slotsPerConjunt, wordsPerSlot } = data;

  const cache = new Cache(memory, slotsCache, slotsPerConjunt, wordsPerSlot);

  showInfoCache(cache)
  demoMemory(cache);
}

async function demoMemory(cache: Cache) {
  const { option } = await inquirer.prompt(requestAdress)

  if (option == 'exit') {
    return;
  }

  let address = '';

  if (option == 'insert') {
    const data = await inquirer.prompt(requestManualAddress)
    const addressesBin = extractAddresses(data['adress'])
    const addressesHex = addressesBin.map(b => convert.bin2hex(b))

    address = addressesHex[addressesHex.length - 1]
    addressesHex.forEach(address => {
      cache.getData(address)
    })
  } else {
    const randomAddress = randonHex(cache.memoryInBytes);

    address = randomAddress
    cache.getData(randomAddress);
  }

  try {
    showInfoCache(cache)
    showMemory(cache, address);
    showRatioOfCache(cache);
  } catch (error) {
    console.log(`${chalk.red(error)}`);
  }

  demoMemory(cache);
}

function extractAddresses(stringAddresses: string) {
  // Formatter: remove spaces && symbols
  const _stringAddresses = stringAddresses.replace(/\s+/g, '').replace('[', '').replace(']', '');
  const addresses = _stringAddresses.split(',')

  return addresses
}


createCache();
