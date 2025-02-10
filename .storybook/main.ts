import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { reactScopedCssPlugin } from 'rollup-plugin-react-scoped-css';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [reactScopedCssPlugin(), tsconfigPaths()]
    })
  }
};
export default config;
