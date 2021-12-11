const Module = require("module");
const path = require("path");

exports.loadModule = function (request, context) {
  // 引入模块
  return Module.createRequire(path.resolve(context, "package.json"))(request);
};
