import { createEmptyExpression, type ExpressionType, type ExpressionReturnDataType, type ValueExpressionDefinition } from "./expressions"

const ExpressionSelectInput: React.FC<{
    expressionType: ExpressionReturnDataType
    onChoose: (expression: ValueExpressionDefinition) => void
}> = ({ expressionType, onChoose }) => {
    return (
        <select onChange={event => {
            onChoose(createEmptyExpression(event.currentTarget.value as ExpressionType))
            event.currentTarget.value = ''
        }}>
            <option value="">Select an expression type</option>
            {expressionType === 'string' && <>
                <option value="STRING LITERAL">String literal</option>
            </>}
            {expressionType === 'date' && <>
                
            </>}
        </select>
    )
}

export default ExpressionSelectInput
