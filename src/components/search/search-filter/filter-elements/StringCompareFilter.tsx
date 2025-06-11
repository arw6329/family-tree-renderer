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
    execute(filter, testSubject, database): boolean {
        if(!('type' in testSubject)) {
            return false
        }

        // We do not have to deref record here. See other comments.
        if(testSubject.type === 'pointer') {
            throw new Error(`Did not expect pointer record to appear in filter execution`)
        }
        if(typeof testSubject.value !== 'string') {
            return false
        }

        if(!filter.expression) {
            return false
        }

        switch(filter.operation) {
            case 'equals': {
                return testSubject.value.toLowerCase() === evaluateExpression(filter.expression).toLowerCase()
            }
            case 'contains': {
                return testSubject.value.toLowerCase().includes(evaluateExpression(filter.expression).toLowerCase())
            }
            case 'starts-with': {
                return testSubject.value.toLowerCase().startsWith(evaluateExpression(filter.expression).toLowerCase())
            }
            case 'ends-with': {
                return testSubject.value.toLowerCase().endsWith(evaluateExpression(filter.expression).toLowerCase())
            }
            case 'regex': {
                return new RegExp(evaluateExpression(filter.expression)).test(testSubject.value)
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
