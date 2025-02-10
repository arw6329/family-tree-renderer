import { StoryFn, Meta } from "@storybook/react";
import FamilyTreeRenderer from "./FamilyTreeRenderer";
import database from "./exampleDatabase.json"

export default {
    title: "FamilyTreeRenderer/FamilyTreeRenderer",
    component: FamilyTreeRenderer,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta<typeof FamilyTreeRenderer>;

const Template: StoryFn<typeof FamilyTreeRenderer> = (args) => <div style={{ height: '100vh' }}>
    <FamilyTreeRenderer {...args} />
</div>;

export const RatingTest = Template.bind({});
RatingTest.args = {
    database: database
};
