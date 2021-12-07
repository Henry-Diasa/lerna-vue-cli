const { defaults } = require("./options");
const PromptModuleAPI = require("./PromptModuleAPI");

// 询问
const inquirer = require("inquirer");
const isManualMode = (answers) => answers.preset === "__manual__";

class Creator {
  constructor(name, context, promptModules) {
    this.name = name;
    this.context = process.env.VUE_CLI_CONTEXT = context;
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    this.presetPrompt = presetPrompt;
    this.featurePrompt = featurePrompt;
    this.injectedPrompts = [];
    this.promptCompleteCbs = [];
    const promptAPI = new PromptModuleAPI(this);
    promptModules.forEach((m) => m(promptAPI));
  }

  async create() {}
}
