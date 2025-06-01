import Flex from "@/components/building-blocks/flex/Flex"
import "./FamilyTreeError.scoped.css"

const FamilyTreeError: React.FC<{ error: unknown }> = ({ error }) => {
    return (
        <Flex style={{ padding: 10, height: '100%', boxSizing: 'border-box', backgroundColor: '#191717' }}>
            <div className="root">
                <span className="title">The family tree renderer crashed.</span>
                <span>
                    The family tree renderer encountered an error. This probably occurred due to importing a
                    problematic GEDCOM that ReunionPage does not understand or due to an edge condition in
                    your tree's structure that triggered a bug in the layout algorithm.
                </span>
                <span>
                    You can contribute to ReunionPage by reporting this error at <a href="https://github.com/arw6329/family-tree-renderer/issues">
                        https://github.com/arw6329/family-tree-renderer/issues
                    </a> or by emailing a report to <a href="mailto:family-tree@arw9234.net">family-tree@arw9234.net</a>.
                    Please include the error details below and what you did to trigger the error.
                </span>
                <label>Error Details</label>
                {error instanceof Error
                    ? <>
                        <span className="error">{error.toString()}</span>
                        <details>
                            <summary>
                                <label>Stacktrace</label>
                            </summary>
                            <div className="stacktrace">
                                {error.stack?.split('\n').map(line => <div className="stacktrace-line">{line}</div>)}
                            </div>
                        </details>
                    </>
                    : <span className="error">
                        {error.toString()}
                    </span>
                }
            </div>
        </Flex>
    )
}

export default FamilyTreeError
