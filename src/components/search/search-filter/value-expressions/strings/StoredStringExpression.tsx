import Flex from "@/components/building-blocks/flex/Flex"
import ValueExpression from "../ValueExpression"
import type { ExpressionRegistration, ValueExpressionDefinition } from "../expressions"

export type StoredStringExpressionDefinition = {
    type: 'STORED STRING'
    variable: string
}

export const storedStringExpressionRegistration: ExpressionRegistration<StoredStringExpressionDefinition> = {
    type: 'STORED STRING',
    createEmpty() {
        return {
            type: 'STORED STRING',
            variable: ''
        }
    },
    value(expression, variableStore): string | null {
        const value = variableStore.getVariable(expression.variable)
        if(typeof value === 'string') {
            return value
        } else {
            return null
        }
    },
    element(props) {
        return <StoredStringExpression {...props} />
    }
}

const StoredStringExpression: React.FC<{
    expression: StoredStringExpressionDefinition
    onChange: (expression: ValueExpressionDefinition | null) => void
}> = ({ expression: thisExpression, onChange }) => {
    return (
        <ValueExpression
            label="STORED STRING"
            color="white"
            expression={thisExpression}
            onChange={onChange}
            allowWraps={false}
        >
            <Flex gap={6} alignItems="center">
                <span>Stored value:</span>
                <input
                    type="text"
                    defaultValue={thisExpression.variable}
                    onChange={event => {
                        onChange({
                            type: 'STORED STRING',
                            variable: event.target.value
                        })
                    }}
                />
            </Flex>
        </ValueExpression>
    )
}
