import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite"
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js' 

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
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
          if(typeof window !== 'undefined') {
            customElements.whenDefined('reunionpage-shadow-boundary')
              .then(() => {
                customElements.get('reunionpage-shadow-boundary').injectStyles(cssCode)
              })
          }
        }
      })]
    })
  }
};
export default config;
