const pluginRE = /^@vue\/cli-plugin-/;

exports.isPlugin = (id) => pluginRE.test(id);
exports.toShortPluginId = (id) => id.replace(pluginRE, "");
exports.matchesPluginId = (input, full) => {
  return full === input;
};
