import * as ng from "./lib/name_generator";

import * as fsPromise from 'node:fs/promises';

async function readFile(fn: string) {
  const names: string[] = [];
  const file = await fsPromise.open(fn, 'r');
  for await (const line of file.readLines()) {
      names.push(line);
  }
  ng.add_name_set("names", names);

  // const names: string[] = [];
  // console.log(names.length)
  // ng.add_name_set("names", names);
  // console.log(ng.generate_name("names"));
}

async function generateName() {
  await readFile("./assets/names-f.txt");
  console.log(ng.generate_name("names"));

}

void generateName();