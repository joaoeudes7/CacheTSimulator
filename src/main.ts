import chalk from 'chalk';
import { prompt } from 'inquirer';

import { Cache } from './models/Cache';
import { convert } from "./utils";
import { requestConfigs, requestAdress, requestManualAddress } from "./questions";
import { showInfoCache, showMemory, showRatioOfCache } from "./logs";

async function createCache() {
  const data = await prompt(requestConfigs)
  const { memory, slotsCache, slotsPerConjunt, wordsPerSlot } = data;

  const cache = new Cache(memory, slotsCache, slotsPerConjunt, wordsPerSlot);

  showInfoCache(cache)
  demoMemory(cache);
}

async function demoMemory(cache: Cache) {
  const { option } = await prompt(requestAdress)

  if (option == 'exit') {
    return;
  }

  let address = '';

  if (option == 'insert') {
    const data = await prompt(requestManualAddress)
    const addressesBin = extractAddressesInput(data['adress'])
    const addressesHex = addressesBin.map(b => convert.bin2hex(b))

    address = addressesHex[addressesHex.length - 1]

    addressesHex.forEach(address => {
      cache.getData(address)
    })
  } else {
    address = cache.getRandomAddress()
    cache.getData(address);
  }

  try {
    showMemory(cache, address);
    showRatioOfCache(cache);
  } catch (error) {
    console.log(`${chalk.red(error)}`);
  }

  demoMemory(cache);
}

function extractAddressesInput(stringAddresses: string) {
  // Formatter: remove spaces && symbols
  const _stringAddresses = stringAddresses.replace(/\[|\]|\s+/g, '');
  const addresses = _stringAddresses.split(',')

  return addresses
}


createCache();
