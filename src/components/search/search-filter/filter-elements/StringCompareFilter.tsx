import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"
import ExpressionSelectInput from "../value-expressions/ExpressionSelectInput"
import { createExpressionElement, type ValueExpressionDefinition } from "../value-expressions/expressions"

export type StringCompareFilterDefinition = {
    type: 'STRING COMPARE'
    operation: 'equals' | 'contains' | 'starts-with' | 'ends-with' | 'regex'
    expression: ValueExpressionDefinition | null
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

export default StringCompareFilter
