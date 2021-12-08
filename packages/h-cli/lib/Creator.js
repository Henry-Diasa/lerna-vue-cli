const { defaults } = require("./options");
const PromptModuleAPI = require("./PromptModuleAPI");

// 询问
const inquirer = require("inquirer");
const isManualMode = (answers) => answers.preset === "__manual__";

class Creator {
  constructor(name, context, promptModules) {
    this.name = name;
    this.context = process.env.VUE_CLI_CONTEXT = context;
    // 获取预设
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    this.presetPrompt = presetPrompt;
    this.featurePrompt = featurePrompt;
    this.injectedPrompts = [];
    this.promptCompleteCbs = [];
    const promptAPI = new PromptModuleAPI(this);
    promptModules.forEach((m) => m(promptAPI));
  }
  resolveIntroPrompts() {
    const presets = this.getPresets();
    const presetChoices = Object.entries(presets).map(([name]) => {
      let displayName = name;
      if (name === "default") {
        displayName = "Default";
      } else if (name === "__default_vue_3__") {
        displayName = "Default (Vue 3)";
      }
      return {
        name: `${displayName}`,
        value: name,
      };
    });
    const presetPrompt = {
      name: "preset",
      type: "list",
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices,
        {
          name: "Manually select features",
          value: "__manual__",
        },
      ],
    };
    const featurePrompt = {
      name: "features",
      when: isManualMode,
      type: "checkbox",
      message: "Check the features needed for your project:",
      choices: [],
      pageSize: 10,
    };
    return {
      presetPrompt,
      featurePrompt,
    };
  }
  getPresets() {
    return Object.assign({}, defaults.presets);
  }
  async create() {
    let answers = await this.promptAndResolvePresets();
    let preset;
    if (answers.preset && answers.preset !== "__manual__") {
      preset = await this.resolvePreset(answers.preset);
    } else {
      preset = {
        plugins: {},
      };
      answers.features = answers.features || [];
      this.promptCompleteCbs.forEach((cb) => cb(answers, preset));
    }
    console.log(preset, 99);
  }
  async resolvePreset(name) {
    return this.getPresets()[name];
  }
  async promptAndResolvePresets() {
    let answers = await inquirer.prompt(this.resolveFinalPrompts());
    return answers;
  }
  resolveFinalPrompts() {
    this.injectedPrompts.forEach((prompt) => {
      let originWhen = prompt.when || (() => true);
      prompt.when = (answers) => {
        return isManualMode(answers) && originWhen(answers);
      };
    });
    let prompts = [
      this.presetPrompt, // 预设
      this.featurePrompt, // 特性
      ...this.injectedPrompts, // 不同的特性对应的选项
    ];
    return prompts;
  }
}

module.exports = Creator;
