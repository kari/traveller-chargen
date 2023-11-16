import male from "./names/male";
import female from "./names/female";
import last from "./names/last_name";
import ships from "./names/ships";

const names: {[key: string]: string[] } = {}

names["male"] = male;
names["female"] = female;
names["last"] = last;
names["ship"] = ships;

export { names }
