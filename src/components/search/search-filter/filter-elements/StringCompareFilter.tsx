import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition, FilterRegistration } from "../filters"
import ExpressionSelectInput from "../value-expressions/ExpressionSelectInput"
import { createExpressionElement, evaluateExpression, type ValueExpressionDefinition } from "../value-expressions/expressions"

export type StringCompareFilterDefinition = {
    type: 'STRING COMPARE'
    operation: 'equals' | 'contains' | 'starts-with' | 'ends-with' | 'regex'
    expression: ValueExpressionDefinition | null
}

export const stringCompareFilterRegistration: FilterRegistration<StringCompareFilterDefinition> = {
    type: 'STRING COMPARE',
    createEmpty() {
        return {
            type: 'STRING COMPARE',
            operation: 'equals',
            expression: null
        }
    },
    *execute(filter, testSubject, _, variableStore): Generator<boolean, undefined, undefined> {
        if(!('type' in testSubject)) {
            yield false
            return
        }

        // We do not have to deref record here. See other comments.
        if(testSubject.type === 'pointer') {
            throw new Error(`Did not expect pointer record to appear in filter execution`)
        }
        if(typeof testSubject.value !== 'string') {
            yield false
            return
        }

        if(!filter.expression) {
            yield false
            return
        }

        const value = evaluateExpression(filter.expression, variableStore)
        if(typeof value !== 'string') {
            yield false
            return
        }

        switch(filter.operation) {
            case 'equals': {
                yield testSubject.value.toLowerCase() === value.toLowerCase()
                break
            }
            case 'contains': {
                yield testSubject.value.toLowerCase().includes(value.toLowerCase())
                break
            }
            case 'starts-with': {
                yield testSubject.value.toLowerCase().startsWith(value.toLowerCase())
                break
            }
            case 'ends-with': {
                yield testSubject.value.toLowerCase().endsWith(value.toLowerCase())
                break
            }
            case 'regex': {
                yield new RegExp(value).test(testSubject.value)
                break
            }
            default: {
                throw new Error(`Unrecognized string operation ${filter.operation}`)
            }
        }
    },
    element(props) {
        return <StringCompareFilter {...props} />
    }
}

const StringCompareFilter: React.FC<{
    filter: StringCompareFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="STRING COMPARE"
            color="#85b1ff"
            filter={thisFilter}
            onChange={onChange}
        >
            <Flex column={true} gap={10}>
                <Flex gap={8} alignItems="center">
                    <span>Value</span>
                    <select defaultValue={thisFilter.operation} onChange={event => {
                        onChange({
                            type: 'STRING COMPARE',
                            operation: event.currentTarget.value as StringCompareFilterDefinition['operation'],
                            expression: structuredClone(thisFilter.expression)
                        })
                    }}>
                        <option value="equals">Is exactly</option>
                        <option value="contains">Contains string</option>
                        <option value="starts-with">Starts with string</option>
                        <option value="ends-with">Ends with string</option>
                        <option value="regex">Matches regex</option>
                    </select>
                    <span>:</span>
                </Flex>
                {thisFilter.expression
                    ? createExpressionElement({
                        expression: thisFilter.expression,
                        onChange(newExpression) {
                            onChange({
                                type: 'STRING COMPARE',
                                operation: thisFilter.operation,
                                expression: newExpression
                            })
                        }
                    })
                    : <ExpressionSelectInput expressionType="string" onChoose={expression => {
                        onChange({
                            type: 'STRING COMPARE',
                            operation: thisFilter.operation,
                            expression
                        })
                    }} />
                }
            </Flex>
        </SearchFilter>
    )
}
