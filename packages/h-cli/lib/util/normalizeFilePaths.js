const slash = require("slash");
// 格式化 mac和window 不同路径分隔符
module.exports = function normalizeFilePaths(files) {
  Object.keys(files).forEach((file) => {
    const normalized = slash(file);
    if (file !== normalized) {
      files[normalized] = files[file];
      delete files[file];
    }
  });
  return files;
};
