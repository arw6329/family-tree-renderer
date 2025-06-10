import type { ReactNode } from "react"
import type { StringLiteralExpressionDefinition } from "./strings/StringLiteralExpression"
import { stringLiteralExpressionRegistration } from "./strings/StringLiteralExpression"

export type ValueExpressionDefinition = 
    StringLiteralExpressionDefinition

export type ExpressionType = ValueExpressionDefinition['type']

export type ExpressionReturnDataType = 'string' | 'date'
    
type ExpressionElementCommonProps = {
    expression: ValueExpressionDefinition
    onChange: (expression: ValueExpressionDefinition | null) => void
}

export type ExpressionRegistration = {
    type: string
    createEmpty(): ValueExpressionDefinition
    value(expression: ValueExpressionDefinition): string
    element(props: ExpressionElementCommonProps): ReactNode
}

const expressionRegistrations: ExpressionRegistration[] = [
    stringLiteralExpressionRegistration
]

export function createEmptyExpression(type: ExpressionType): ValueExpressionDefinition {
    const reg = expressionRegistrations.find(reg => reg.type === type)

    if(!reg) {
        throw new Error(`Unknown expression type ${type}`)
    }

    return reg.createEmpty()
}

export function evaluateExpression(expression: ValueExpressionDefinition) {
    const reg = expressionRegistrations.find(reg => reg.type === expression.type)

    if(!reg) {
        throw new Error(`Unknown expression type ${expression.type}`)
    }

    return reg.value(expression)
}

export function createExpressionElement(props: ExpressionElementCommonProps): ReactNode {
    const reg = expressionRegistrations.find(reg => reg.type === props.expression.type)

    if(!reg) {
        throw new Error(`Unknown expression type ${props.expression.type}`)
    }

    return reg.element(props)
}
