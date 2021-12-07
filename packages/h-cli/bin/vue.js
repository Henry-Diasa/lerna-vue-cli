#!/usr/bin/env node
// 解析参数  添加命令
const program = require("commander");
program
  .version(`h-cli ${require("../package").version}`)
  .usage("<command> [options]");

program
  .command("create <app-name>")
  .description("create a new project powered by vue-cli-service")
  .action((name) => {
    require("../lib/create")(name);
  });

program.parse(process.argv);
