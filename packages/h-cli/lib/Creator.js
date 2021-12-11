const { defaults } = require("./options");
const PromptModuleAPI = require("./PromptModuleAPI");

// 询问
const inquirer = require("inquirer");
const cloneDeep = require("lodash.clonedeep");
const writeFileTree = require("./util/writeFileTree");
const { chalk, execa } = require("h-cli-shared-utils");
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
    this.run = this.run.bind(this); // 安装依赖
    const promptAPI = new PromptModuleAPI(this);
    promptModules.forEach((m) => m(promptAPI));
  }
  run(command, args) {
    return execa(command, args, { cwd: this.context });
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
    const { context, name, run } = this;
    let preset = await this.promptAndResolvePresets();
    preset = cloneDeep(preset);
    preset.plugins["@vue/cli-service"] = Object.assign(
      { projectName: name },
      preset
    );
    console.log(`✨  Creating project in ${chalk.yellow(context)}.`);
    const pkg = {
      name,
      version: "0.1.0",
      private: true,
      devDependencies: {},
    };
    const deps = Object.keys(preset.plugins);
    deps.forEach((dep) => {
      pkg.devDependencies[dep] = "latest";
    });
    await writeFileTree(context, {
      "package.json": JSON.stringify(pkg, null, 2),
    });
    console.log(`🗃  Initializing git repository...`);
    await run("git init -y");
    console.log(`⚙\u{fe0f} Installing CLI plugins. This might take a while...`);
    await run("npm install");
  }
  async resolvePreset(name) {
    return this.getPresets()[name];
  }
  async promptAndResolvePresets(answers = null) {
    if (!answers) {
      answers = await inquirer.prompt(this.resolveFinalPrompts());
    }
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
    return preset;
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
