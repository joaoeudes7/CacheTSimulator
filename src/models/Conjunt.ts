import { Validator } from "./types"

export class Block {
  v: Validator = 0;
  // tag: string;
  data: any[] = [];

  setValid() {
    this.v = 1;
  }

  setInvalid() {
    this.v = 0;
  }
}

export class Conjunt {
  [index: string]: Block
}
