import type { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import "./Search.scoped.css"
import "./Results.scoped.css"
import "./Paginator.css"
import Flex from "../building-blocks/flex/Flex"
import HeaderButton from "../building-blocks/header-button/HeaderButton"
import ReactPaginate from "react-paginate"
import { useState } from "react"
import NameAndGender from "../misc/name-and-gender/NameAndGender"
import LabeledElement from "../building-blocks/labeled-text/LabeledText"

const resultsPerPage = 25

const Results: React.FC<{
    results: Profile[]
    onBackToSearch: () => void
}> = ({ results, onBackToSearch }) => {
    const [page, setPage] = useState(0)
    const shownResults = results.slice(page * resultsPerPage, page * resultsPerPage + resultsPerPage)
    return (
        <div className="root">
            <Flex column={true} gap={20} alignItems="baseline" style={{ width: 'min(850px, 100%)', margin: 'auto' }}>
                <h1>{results.length || 'No'} Results</h1>
                {results.length === 0 && <p>No results found. Try going back and revising your query.</p>}
                {results.length > 0 && <p>Showing {page * resultsPerPage + 1} to {page * resultsPerPage + shownResults.length} of {results.length} results.</p>}
                <HeaderButton onClick={onBackToSearch}>
                    <span>Back to search</span>
                </HeaderButton>
                {results.length > 0 && <LabeledElement label="Results" style={{ width: '100%' }}>
                    <Flex column={true} gap={10} style={{ width: '100%' }}>
                        <ReactPaginate
                            breakLabel="..."
                            nextLabel="next >"
                            previousLabel="< previous"
                            pageCount={Math.ceil(results.length / resultsPerPage)}
                            containerClassName="paginator"
                            marginPagesDisplayed={4}
                            renderOnZeroPageCount={null}
                            forcePage={page}
                            onPageChange={event => {
                                setPage(event.selected)
                            }}
                        />
                        <Flex column={true} style={{ width: '100%' }}>
                            {shownResults.map((profile, i) => <>
                                <a className="result">
                                    <NameAndGender key={i} profile={profile} size="small" />
                                </a>
                            </>)}
                        </Flex>
                        <ReactPaginate
                            breakLabel="..."
                            nextLabel="next >"
                            previousLabel="< previous"
                            pageCount={Math.ceil(results.length / resultsPerPage)}
                            containerClassName="paginator"
                            marginPagesDisplayed={4}
                            renderOnZeroPageCount={null}
                            forcePage={page}
                            onPageChange={event => {
                                setPage(event.selected)
                            }}
                        />
                    </Flex>
                </LabeledElement>}
            </Flex>
        </div>
    )
}

export default Results
