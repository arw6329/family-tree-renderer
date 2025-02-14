import { StoryFn, Meta } from "@storybook/react";
import database from "../exampleDatabase.json"
import FamilyTree from "./FamilyTree";

export default {
    title: "FamilyTree/FamilyTree",
    component: FamilyTree,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta<typeof FamilyTree>;

const Template: StoryFn<typeof FamilyTree> = (args) => <div style={{ height: '100vh' }}>
    <FamilyTree {...args} />
</div>;

export const Prepopulated = Template.bind({});
Prepopulated.args = {
    database: database
};

export const Blank = Template.bind({});
Blank.args = {};
