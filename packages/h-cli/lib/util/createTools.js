exports.getPromptModules = function () {
  return ["vueVersion"].map((file) => require(`../promptModules/${file}`));
};
