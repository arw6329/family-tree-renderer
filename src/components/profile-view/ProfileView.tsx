import type { DatabaseView } from "@/lib/family-tree/DatabaseView"
import "./ProfileView.scoped.css"
import Flex from "../building-blocks/flex/Flex"
import NameAndGender from "../misc/name-and-gender/NameAndGender"
import Grid from "../building-blocks/grid/Grid"
import MetadataFrame from "../building-blocks/metadata-frame/MetadataFrame"
import LabeledElement from "../building-blocks/labeled-text/LabeledText"
import { getEventDate, getFirstRecord, getPedigree, getSpousalRelationshipType } from "@/lib/family-tree/metadata-helpers"
import { prettyDate } from "@/lib/family-tree/date-utils"

const ProfileView: React.FC<{
    profileId: string
    database: DatabaseView
}> = ({ profileId, database }) => {
    const profile = database.getObjectById('Profile', profileId)

    if(!profile) {
        return <Flex style={{ padding: 10 }}>
            <span>Error: profile {profileId} not found</span>
        </Flex>
    }

    const familiesOfOrigin = database.getParentsOf(profile).map(family => {
        const children = database.getChildrenOf(family.spousalRelationship)
        return {
            ...family,
            children: children,
            pedigree: getPedigree(family.childRelationship.metadata)
        }
    })

    const familiesOfProcreation = database.getSpousesOf(profile).map(family => {
        const children = database.getChildrenOf(family.relationship)
        const type = getSpousalRelationshipType(family.relationship.metadata)
        // TODO: does not work for standard GEDCOM marriage definitions outside of MARRIAGE
        // records or multiple divorces/remarriages
        const marriageDate = getEventDate('MARRIAGE', family.relationship.metadata)
        const marriageRecord = getFirstRecord('MARRIAGE', family.relationship.metadata)
        const divorceDate = marriageRecord ? getEventDate('DIVORCE', marriageRecord.children) : null
        return {
            ...family,
            children: children,
            type,
            marriageDate,
            divorceDate
        }
    })

    return (
        <div className="root">
            <Flex column={true} gap={20} style={{ width: 'min(850px, 100%)', margin: 'auto' }}>
                <NameAndGender profile={profile} />
                <LabeledElement label="Metadata" style={{ width: '100%' }}>
                    <MetadataFrame
                        metadata={profile.metadata}
                        metadataLookup={metadataId => database.getRootMetadataById(metadataId)}
                    />
                </LabeledElement>
                {familiesOfOrigin.map(family => <LabeledElement label="Family of origin" style={{ width: '100%' }}>
                    <div className="family">
                        <Grid gap={20} columns="repeat(auto-fill, minmax(260px, 1fr))">
                            <LabeledElement label={
                                family.parent1.family_tree_gender === 'FEMALE'
                                    ? 'Mother'
                                    : family.parent1.family_tree_gender === 'MALE'
                                    ? 'Father'
                                    : 'Parent'
                            }>
                                <div className="profile-cell">
                                    <NameAndGender profile={family.parent1} size="small" />
                                </div>
                            </LabeledElement>
                            <LabeledElement label={
                                family.parent2.family_tree_gender === 'FEMALE'
                                    ? 'Mother'
                                    : family.parent2.family_tree_gender === 'MALE'
                                    ? 'Father'
                                    : 'Parent'
                            }>
                                <div className="profile-cell">
                                    <NameAndGender profile={family.parent2} size="small" />
                                </div>
                            </LabeledElement>
                        </Grid>
                        {family.pedigree && <LabeledElement label="Pedigree" text={{
                            'adoptive': 'Adoptive',
                            'biological': 'Biological',
                            'foster': 'Foster'
                        }[family.pedigree]} />}
                        <LabeledElement label="Siblings">
                            <Grid gap={20} rowGap={10} columns="repeat(auto-fill, minmax(260px, 1fr))">
                                {family.children.map(child => <div className="profile-cell">
                                    <NameAndGender profile={child.child} size="small" />
                                </div>)}
                            </Grid>
                        </LabeledElement>
                    </div>
                </LabeledElement>)}
                {familiesOfProcreation.map(family => <LabeledElement label="Partner / Family of procreation" style={{ width: '100%' }}>
                    <div className="family">
                        <Grid gap={20} columns="repeat(auto-fill, minmax(260px, 1fr))">
                            <LabeledElement label="Partner">
                                <div className="profile-cell">
                                    <NameAndGender profile={family.spouse} size="small" />
                                </div>
                            </LabeledElement>
                        </Grid>
                        <Flex gap={20} wrap={true}>
                            {family.type && <LabeledElement label="Relationship type" text={{
                                'married': 'Married',
                                'divorced': 'Divorced',
                                'never-married': 'Never married'
                            }[family.type]} />}
                            {family.marriageDate && <LabeledElement label="Marriage date" text={prettyDate(family.marriageDate)} />}
                            {family.divorceDate && <LabeledElement label="Divorce date" text={prettyDate(family.divorceDate)} />}
                        </Flex>
                        <LabeledElement label="Children">
                            <Grid gap={20} rowGap={10} columns="repeat(auto-fill, minmax(260px, 1fr))">
                                {family.children.map(child => <div className="profile-cell">
                                    <NameAndGender profile={child.child} size="small" />
                                </div>)}
                            </Grid>
                        </LabeledElement>
                    </div>
                </LabeledElement>)}
            </Flex>
        </div>
    )
}

export default ProfileView
