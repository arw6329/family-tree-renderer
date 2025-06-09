import { useState } from "react"
import "./Search.scoped.css"
import { selectFilter } from "./search-filter/FilterSelection"
import type { FilterDefinition } from "./search-filter/FilterDefinition"
import ActionButton from "../building-blocks/action-button/ActionButton"
import Flex from "../building-blocks/flex/Flex"
import { executeFilter } from "./search-filter/FilterExecution"
import type { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import type { DatabaseView } from "@/lib/family-tree/DatabaseView"
import FilterSelectInput from "./search-filter/FilterSelectInput"
import LabeledElement from "../building-blocks/labeled-text/LabeledText"

const Search: React.FC<{
    database: DatabaseView
    initialFilter?: FilterDefinition
    onResults: (filter: FilterDefinition, results: Profile[]) => void
}> = ({ database, initialFilter, onResults }) => {
    const [filter, setFilter] = useState<FilterDefinition | null>(initialFilter ?? null)

    return (
        <div className="root">
            <Flex column={true} gap={20} alignItems="baseline" style={{ width: 'min(850px, 100%)', margin: 'auto' }}>
                <h1>Individual Search <span style={{ color: 'gray', fontWeight: 'normal' }}>&gt;</span> Filter Builder</h1>
                <p>Use the filter builder to search for individuals based on structured conditions.</p>
                <LabeledElement label="Filter">
                    {filter
                        ? selectFilter(filter, 'Profile', filter => setFilter(filter))
                        : <FilterSelectInput testSubjectType="Profile" onChoose={filter => {
                            setFilter(filter)
                        }} />
                    }
                </LabeledElement>
                <ActionButton disabled={!filter} onClick={() => {
                    const results: Profile[] = []
                    for(const profile of database.getAllObjects('Profile')) {
                        if(executeFilter(filter, profile, database)) {
                            results.push(profile)
                        }
                    }
                    onResults(filter!, results)
                }}>
                    <span>Search</span>
                </ActionButton>
            </Flex>
        </div>
    )
}

export default Search