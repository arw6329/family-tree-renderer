import { StoryFn, Meta } from "@storybook/react"
import gedcom from "@/../test/gedcoms/pres2020.ged?raw"
import { parseGedcom } from "@/lib/family-tree/gedcom/gedcom"
import ProfileView from "./ProfileView"

export default {
    title: "FamilyTree/Profiles",
    component: ProfileView,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta<typeof ProfileView>;

const Template: StoryFn<typeof ProfileView> = (args) => <div style={{ height: '100vh' }}>
    <ProfileView {...args} />
</div>;

const database = parseGedcom(gedcom)

export const JFK = Template.bind({});
JFK.args = {
    profileId: '@I1509@',
    database: database
};

export const AmericaWorkmanMultiName = Template.bind({});
AmericaWorkmanMultiName.args = {
    profileId: '@I2281@',
    database: database
};
