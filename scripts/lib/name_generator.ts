// name_generator.ts
// originally written and released to the public domain by drow <drow@bin.sh>
// https://donjon.bin.sh/code/name/
// http://creativecommons.org/publicdomain/zero/1.0/

const name_set: { [key: string]: string[] } = {};
const chain_cache: { [key: string]: Chain } = {};

type Chain = {
    [key: string]: { 
        [key: string | number]: number 
    }
}

function add_name_set(type: string, list: string[]) {
    name_set[type] = list;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generator function

function generate_name(type: string): string {
    const chain = markov_chain(type);
    if (chain) {
        return markov_name(chain);
    }
    return '';
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generate multiple

function name_list(type: string, n_of: number): string[] {
    const list = [];

    for (let i = 0; i < n_of; i++) {
        list.push(generate_name(type));
    }

    return list;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// get markov chain by type

function markov_chain(type: string): Chain | undefined {
    if (Object.keys(chain_cache).includes(type)) {
        return chain_cache[type];
    } else {
        const list = name_set[type];
        if (list && list.length) {
            const chain = construct_chain(list);
            chain_cache[type] = chain;
            return chain;
        }
    }
    return undefined;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// construct markov chain from list of names

function construct_chain(list: string[]): Chain {
    let chain: Chain = {};

    for (let i = 0; i < list.length; i++) {
        const names = list[i].split(/\s+/);
        chain = incr_chain(chain, 'parts', names.length);

        for (const name of names) {
            chain = incr_chain(chain, 'name_len', name.length);

            const c = name.substring(0, 1);
            chain = incr_chain(chain, 'initial', c);

            let string = name.substring(1);
            let last_c = c;

            while (string.length > 0) {
                const c = string.substring(0, 1);
                chain = incr_chain(chain, last_c, c);

                string = string.substring(1);
                last_c = c;
            }
        }
    }

    return scale_chain(chain);
}
function incr_chain(chain: Chain, key: string, token: string | number) {
    if (chain[key]) {
        if (chain[key][token]) {
            chain[key][token]++;
        } else {
            chain[key][token] = 1;
        }
    } else {
        chain[key] = {};
        chain[key][token] = 1;
    }

    return chain;
}

function scale_chain(chain: Chain): Chain {
    const table_len: { [key: string]: number } = {};

    Object.keys(chain).forEach(key => {
        table_len[key] = 0;

        Object.keys(chain[key]).forEach(token => {
            const count = chain[key][token];
            const weighted = Math.floor(Math.pow(count, 1.3));

            chain[key][token] = weighted;
            table_len[key] += weighted;
        });
    });
    chain['table_len'] = table_len;
    return chain;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// construct name from markov chain

function markov_name(chain: Chain): string {
    const parts = parseInt(select_link(chain, 'parts')!);
    const names: string[] = [];

    for (let i = 0; i < parts; i++) {
        const name_len = parseInt(select_link(chain, 'name_len')!);
        let c = select_link(chain, 'initial')!;
        let name = c;
        let last_c = c;

        while (name.length < name_len) {
            c = select_link(chain, last_c)!;
            if (!c) break;

            name += c;
            last_c = c;
        }
        names.push(name);
    }
    return names.join(' ');
}

function select_link(chain: Chain, key: string): string | undefined {
    const len = chain['table_len'][key];
    if (!len) return undefined;
    const idx = Math.floor(Math.random() * len);
    const tokens = Object.keys(chain[key]);
    let acc = 0;

    for (const token of tokens) {
        acc += chain[key][token];
        if (acc > idx) return token;
    }
    return undefined;
}

export { generate_name, name_list, add_name_set }