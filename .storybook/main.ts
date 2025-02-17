import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite"
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js' 

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [cssInjectedByJsPlugin({
        dev: {
          enableDev: true
        },
        injectCodeFunction: function(cssCode) {
          customElements.whenDefined('reunionpage-family-tree')
            .then(() => {
              customElements.get('reunionpage-family-tree').injectStyles(cssCode)
            })
        }
      })]
    })
  }
};
export default config;
