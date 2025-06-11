import { useState } from "react"
import "./Search.scoped.css"
import { createFilterElement, executeFilter, type FilterDefinition } from "./search-filter/filters"
import ActionButton from "../building-blocks/action-button/ActionButton"
import Flex from "../building-blocks/flex/Flex"
import type { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import type { DatabaseView } from "@/lib/family-tree/DatabaseView"
import FilterSelectInput from "./search-filter/FilterSelectInput"
import LabeledElement from "../building-blocks/labeled-text/LabeledText"
import { VariableStore } from "./search-filter/VariableStore"
import { examples } from "./search-filter/examples"

const Search: React.FC<{
    database: DatabaseView
    initialFilter?: FilterDefinition
    onResults: (filter: FilterDefinition, results: Profile[]) => void
}> = ({ database, initialFilter, onResults }) => {
    const [filter, setFilter] = useState<FilterDefinition | null>(initialFilter ?? null)
    const [examplesShown, setExamplesShown] = useState(false)
    const [title, setTitle] = useState<string | null>(null)
    const [description, setDescription] = useState<string | null>(null)

    return (
        <div className="root">
            <Flex column={true} gap={20} alignItems="baseline" style={{ width: 'min(850px, 100%)', margin: 'auto' }}>
                <h1>Individual Search <span style={{ color: 'gray', fontWeight: 'normal' }}>&gt;</span> Filter Builder</h1>
                <Flex gap={8} wrap={true}>
                    <p>
                        Use the filter builder to search for individuals based on structured conditions. 
                    </p>
                    <a href="javascript:void(0)" onClick={() => setExamplesShown(!examplesShown)}>{examplesShown ? 'Hide' : 'Show'} examples</a>
                </Flex>
                <Flex gap={20}>
                    {examplesShown && <Flex column={true} gap={10}>
                        {examples.map(example => <a
                            key={example.title}
                            onClick={() => {
                                setFilter(example.filter)
                                setTitle(example.title)
                                setDescription(example.description)
                            }}
                        >
                            {example.title}
                        </a>)}
                    </Flex>}
                    <Flex column={true} gap={20} alignItems="baseline">
                        {title && <h2>{title}</h2>}
                        {description && <p>{description}</p>}
                        <LabeledElement label="Filter">
                            {filter
                                ? createFilterElement({
                                    filter,
                                    testSubjectType: 'Profile',
                                    onChange(filter) {
                                        setFilter(filter)
                                    }
                                })
                                : <FilterSelectInput testSubjectType="Profile" onChoose={filter => {
                                    setFilter(filter)
                                }} />
                            }
                        </LabeledElement>
                        <ActionButton disabled={!filter} onClick={() => {
                            const results: Profile[] = []
                            for(const profile of database.getAllObjects('Profile')) {
                                if(executeFilter(filter, profile, database, new VariableStore).some(result => result)) {
                                    results.push(profile)
                                }
                            }
                            onResults(filter!, results)
                        }}>
                            <span>Search</span>
                        </ActionButton>
                    </Flex>
                </Flex>
            </Flex>
        </div>
    )
}

export default Search