const fs = require("fs");
const { promisify } = require("util");
const yargs = require("yargs");
const replace = require("./replace");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const argv = yargs
  .option("file", {
    alias: "f",
    description: "Relative path to dump file",
    type: "string",
  })
  .option("output", {
    alias: "o",
    description: "Relative path to output file",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

const extractInsert = async () => {
  try {
    let fileContent = (
      await readFile(argv.file || "./db/sqlite.sql")
    ).toString();
    // remove everything except insert statements
    fileContent = fileContent.replace(/^(?!(?:INSERT INTO)).*$/gm, "");
    // replace text according to replace.js file
    replace.forEach(
      (item) =>
        (fileContent = fileContent.replace(
          new RegExp(item.source, "g"),
          item.output
        ))
    );
    // remove every insert statement except the ones that add to public schema
    fileContent = fileContent.replace(/^(?!(?:INSERT INTO public\.)).*$/gm, "");
    // remove all empty lines and add lines between statements
    fileContent = fileContent.replace(/[\r\n]+/gm, "");
    fileContent = fileContent.replace(/;/g, ";\r");
    // convert date integer to date type in postgres
    fileContent = fileContent.replace(
      /,(20[1-2]\d)([0-1]\d)([0-3]\d),/g,
      `,'$1-$2-$3',`
    );
    // We convert the insert statements of transfer transactions to two statements: insert with null as transfer, and
    // update statement for the transfer after creatrion of all transactions to overcome the problem of foreign key constraint
    fileContent = fileContent.replace(
      /(VALUES\()('\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b')(.*)('\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b')(,-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?,\d,\d,\d\);)/g,
      `$1$2$3NULL$5\r
       UPDATE public.transactions SET "transferredID" = $4 WHERE id = $2;`
    );
    fileContent = fileContent
      .split("\r")
      // We move transfer transactions update statements to the end of the file until after the creation of all transactions.
      .sort((a, b) => {
        if (a.includes("UPDATE public.transactions")) {
          return 1;
        } else {
          return -1;
        }
      })
      // We move the accounts to the top of the file, because all other relations depend on them.
      .sort((a, b) => {
        if (a.includes("INSERT INTO public.accounts")) {
          return -1;
        } else {
          return 1;
        }
      });
    /**
     * Theres a bug with actual sqlite database, where some new payees are inserted into transaction payeeID column
     * with their name preceeded by the word 'new:' rather than by their id
     * so we find these transactions, and replace the payeeID with the actual payee.id
     */
    const payees = fileContent
      .filter((line) => line.includes("INSERT INTO public.payees"))
      .map((line) => line.split(","));
    fileContent.forEach((line, index) => {
      const match = line.match(/^.*new\:([a-zA-Zء-ي \\/\.]+).*;$/);
      if (match) {
        const payee = payees.find((p) => p.includes(`'${match[1]}'`));
        if (payee) {
          fileContent[index] = line.replace(
            `'new:${match[1]}'`,
            payee[4].replace(' "accountID") VALUES(', "")
          );
        }
      }
    });
    fileContent = fileContent.join("\r");
    await writeFile(argv.output || "./db/output.sql", fileContent);
  } catch (err) {
    console.error(err);
  }
};

extractInsert();

// After execution, you will have the seed available in output.sql or wherever you specified,
// just copy to the seed file in actual-api and the yarn seeds apply
