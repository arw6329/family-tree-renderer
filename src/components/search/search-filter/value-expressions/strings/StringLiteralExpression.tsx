import Flex from "@/components/building-blocks/flex/Flex"
import ValueExpression from "../ValueExpression"
import type { ExpressionRegistration, ValueExpressionDefinition } from "../expressions"

export type StringLiteralExpressionDefinition = {
    type: 'STRING LITERAL'
    value: string
}

export const stringLiteralExpressionRegistration: ExpressionRegistration = {
    type: 'STRING LITERAL',
    createEmpty() {
        return {
            type: 'STRING LITERAL',
            value: ''
        }
    },
    value(expression: StringLiteralExpressionDefinition): string {
        return expression.value
    },
    element(props) {
        return <StringLiteralExpression {...props} />
    }
}

const StringLiteralExpression: React.FC<{
    expression: StringLiteralExpressionDefinition
    onChange: (expression: ValueExpressionDefinition | null) => void
}> = ({ expression: thisExpression, onChange }) => {
    return (
        <ValueExpression
            label="STRING LITERAL"
            color="white"
            expression={thisExpression}
            onChange={onChange}
            allowWraps={false}
        >
            <Flex gap={6} alignItems="center">
                <span>Literal value:</span>
                <input
                    type="text"
                    onChange={event => {
                        onChange({
                            type: 'STRING LITERAL',
                            value: event.target.value
                        })
                    }}
                />
            </Flex>
        </ValueExpression>
    )
}
