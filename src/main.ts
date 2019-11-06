import inquirer = require("inquirer");
import { Cache } from './models/Cache';
import { randonHex } from "./utils";
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

  let adress = null;

  if (option == 'insert') {
    const data = await inquirer.prompt(requestManualAddress)
    adress = data['adress']
  } else {
    adress = randonHex(cache.memoryInBytes)
  }

  try {
    showMemory(cache, adress);
    showRatioOfCache(cache);
  } catch (error) {
    console.log(error);
  }
}


createCache();
