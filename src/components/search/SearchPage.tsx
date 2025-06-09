import "@/global.css"
import { useState } from "react"
import type { FilterDefinition } from "./search-filter/FilterDefinition"
import Search from "./Search"
import type { DatabaseView } from "@/lib/family-tree/DatabaseView"
import type { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import Results from "./Results"

const SearchPage: React.FC<{
    database: DatabaseView
}> = ({ database }) => {
    const [filter, setFilter] = useState<FilterDefinition>()
    const [results, setResults] = useState<Profile[]>([])
    const [showingResults, setShowingResults] = useState(false)

    return showingResults
        ? <Results results={results} onBackToSearch={() => {
            setShowingResults(false)
        }} />
        : <Search database={database} initialFilter={filter} onResults={(filter, results) => {
            setFilter(filter)
            setResults(results)
            setShowingResults(true)
        }} />
}

export default SearchPage
