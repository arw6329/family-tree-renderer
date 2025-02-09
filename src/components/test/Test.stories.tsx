import { StoryFn, Meta } from "@storybook/react";
import TestComponent from "./Test";

export default {
  title: "FamilyTreeRenderer/TestComponent",
  component: TestComponent,
} as Meta<typeof TestComponent>;

const Template: StoryFn<typeof TestComponent> = (args) => <TestComponent {...args} />;

export const RatingTest = Template.bind({});
RatingTest.args = {
  title: "Default theme"
};

export const RatingSecondary = Template.bind({});
RatingSecondary.args = {
  title: "Secondary theme"
};
