
# Panda Swap App
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/nikpcenicni/panda-swap-app/astro.yml)

Open Source GCode merger to be used with Panda Swap



## Demo

[Live Demo](https://panda-swap.github.io/panda-swap-app)


## 👀 Want to learn more?

[Documentation](https://github.com/nikpcenicni/panda-swap-app/wiki)


## Running Locally

Begin by cloning this repo and installing dependencies
```bash
  git clone https://github.com/nikpcenicni/panda-swap-app.git | cd panda-swap-app
  npm install
```

To run this project run 

```bash
  npm run dev
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |



## 🚀 Project Structure

Inside this project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── FileUpload/
│   │   │   └── ErrorMessage.astro
│   │   │   └── FileList.astro
│   │   │   └── FileUploadCard.astro
│   │   │   └── fileUploadHandlers
│   │   │   └── UploadZone.astro
│   │   └── LanguageSelector/
│   │   │   └── LanguageButton.astro
│   │   │   └── LanguageDropDown.astro
│   │   │   └── LanguageSelector
│   │   └── PrintSummary/
│   │   │   └── CompileButton.astro
│   │   │   └── filamentDisplayHandlers.ts
│   │   │   └── FilamentUsage.astro
│   │   │   └── PrinterInfo.astro
│   │   │   └── PrintSummaryCard.astro
│   │   │   └── printSummaryHandlers.ts
│   │   └── Settings/
│   │   │   └── Settings.astro
│   │   │   └── SettingsIcon.ts
│   │   │   └── FilamentUsage.astro
│   │   │   └── SettingsSection.astro
│   │   │   └── TextareaSetting.astro
│   │   │   └── ToggleSetting.astro
│   │   └── ThemeToggle/
│   │   │   └── ThemeIcons.astro
│   │   │   └── themeToggle.ts
│   │   └── Card.astro
│   │   └── Header.astro
│   │   └── Card.astro
│   ├── i18n/
│   │   └── translations/
│   │   └── config.ts
│   │   └── utils.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── store/
│   │   └── file-store.ts
│   │   └── language-store.ts
│   │   └── settings-store.ts
│   │   └── theme-store.ts
│   ├── types/
│   │   └── gcode.ts
│   │   └── language.ts
│   │   └── settings.ts
│   │   └── theme.ts
│   ├── utils/
│   │   └── FileUpload/
│   │   │   └── filament-calculator.ts
│   │   │   └── file-handlers.ts
│   │   │   └── file-list-template.ts
│   │   │   └── gcode-parser.ts
│   │   │   └── gcode-preview-handlers.ts
│   │   │   └── sortable-handlers.ts
│   │   └── i18n/
│   │   │   └── language-handlers.ts
│   │   │   └── translations-handlers.ts
│   │   └── PrintSummary/
│   │   │   └── gcode-handlers.ts
│   │   └── format-handlers.ts
│   │   └── settings-handlers.ts
│   │   └── theme-handlers.ts
│   └── utils/
│       └── index.astro
└── package.json
```


## License

[APACHE 2.0](https://www.apache.org/licenses/LICENSE-2.0)

