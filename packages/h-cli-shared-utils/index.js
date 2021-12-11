["pluginResolution", "module"].forEach((m) => {
  Object.assign(exports, require(`./lib/${m}`));
});
exports.chalk = require("chalk");
// 开启线程执行
exports.execa = require("execa");
