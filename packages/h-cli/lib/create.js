const path = require("path");
const Creator = require("./Creator");
const { getPromptModules } = require("./util/createTools");
// 创建项目
async function create(projectName, options) {
  const cwd = process.cwd();
  const name = projectName;
  // 获取创建项目的目录
  const targetDir = path.resolve(cwd, name);
  const promptModules = getPromptModules();
  const creator = new Creator(name, targetDir, promptModules);
  await creator.create();
}

module.exports = (...args) => {
  return create(...args).catch((err) => {
    console.log(err);
  });
};
