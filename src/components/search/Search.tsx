import { useState } from "react"
import "./Search.scoped.css"
import "@/global.css"
import { selectFilter } from "./search-filter/FilterSelection"
import type { FilterDefinition } from "./search-filter/FilterDefinition"
import ActionButton from "../building-blocks/action-button/ActionButton"
import Flex from "../building-blocks/flex/Flex"
import { executeFilter } from "./search-filter/FilterExecution"
import type { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import type { DatabaseView } from "@/lib/family-tree/DatabaseView"

const Search: React.FC<{
    database: DatabaseView
}> = ({ database }) => {
    const [filter, setFilter] = useState<FilterDefinition | null>({
        type: 'AND',
        filters: [{
            type: 'NOT',
            filter: null
        }]
    })

    return (
        <div className="root">
            <Flex column={true} gap={10} alignItems="baseline">
                {filter && selectFilter(filter, 'Profile', filter => setFilter(filter))}
                <ActionButton onClick={() => {
                    const results: Profile[] = []
                    for(const profile of database.getAllObjects('Profile')) {
                        if(executeFilter(filter, profile, database)) {
                            results.push(profile)
                        }
                    }
                    console.log('Results:', results)
                }}>
                    <span>Search</span>
                </ActionButton>
            </Flex>
        </div>
    )
}

export default Search