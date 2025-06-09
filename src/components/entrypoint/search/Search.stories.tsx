import { StoryFn, Meta } from "@storybook/react"
import Search from "./Search"
import gedcom from "@/../test/gedcoms/pres2020.ged?raw"
import { parseGedcom } from "@/lib/family-tree/gedcom/gedcom"

export default {
    title: "FamilyTree/Search",
    component: Search,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta<typeof Search>;

const Template: StoryFn<typeof Search> = (args) => <div style={{ height: '100vh' }}>
    <Search {...args} />
</div>;

export const Pres2020 = Template.bind({});
Pres2020.args = {
    database: parseGedcom(gedcom)
};
