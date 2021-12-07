class PromptModuleAPI {
  constructor(creator) {
    this.creator = creator;
  }
  injectFeature(feture) {
    this.creator.feturePrompt.choices.push(feature);
  }
  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt);
  }
  onPromptComplete(cb) {
    this.creator.promptCompleteCbs.push(cb);
  }
}
module.exports = PromptModuleAPI;
