const yargs = require("yargs");
const script = require("./script");

(() => {
  const argv = yargs.argv;
  const file = argv._[0];
  script(file);
})();