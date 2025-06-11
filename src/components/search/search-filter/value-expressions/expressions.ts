import type { ReactNode } from "react"
import type { StringLiteralExpressionDefinition } from "./strings/StringLiteralExpression"
import type { StoredStringExpressionDefinition } from "./strings/StoredStringExpression"
import type { VariableStore } from "../VariableStore"
import { stringLiteralExpressionRegistration } from "./strings/StringLiteralExpression"
import { storedStringExpressionRegistration } from "./strings/StoredStringExpression"

export type ValueExpressionDefinition = 
    StringLiteralExpressionDefinition
    | StoredStringExpressionDefinition

export type ExpressionType = ValueExpressionDefinition['type']

export type ExpressionReturnDataType = 'string' | 'date'
    
type ExpressionElementCommonProps<T extends ValueExpressionDefinition> = {
    expression: T
    onChange: (expression: ValueExpressionDefinition | null) => void
}

export type ExpressionRegistration<T extends ValueExpressionDefinition> = {
    type: string
    createEmpty(): T
    value(expression: T, variableStore: VariableStore): unknown
    element(props: ExpressionElementCommonProps<T>): ReactNode
}

const expressionRegistrations: ExpressionRegistration<ValueExpressionDefinition>[] = [
    stringLiteralExpressionRegistration,
    storedStringExpressionRegistration
]

export function createEmptyExpression(type: ExpressionType): ValueExpressionDefinition {
    const reg = expressionRegistrations.find(reg => reg.type === type)

    if(!reg) {
        throw new Error(`Unknown expression type ${type}`)
    }

    return reg.createEmpty()
}

export function evaluateExpression(expression: ValueExpressionDefinition, variableStore: VariableStore): unknown {
    const reg = expressionRegistrations.find(reg => reg.type === expression.type)

    if(!reg) {
        throw new Error(`Unknown expression type ${expression.type}`)
    }

    return reg.value(expression, variableStore)
}

export function createExpressionElement(props: ExpressionElementCommonProps<ValueExpressionDefinition>): ReactNode {
    const reg = expressionRegistrations.find(reg => reg.type === props.expression.type)

    if(!reg) {
        throw new Error(`Unknown expression type ${props.expression.type}`)
    }

    return reg.element(props)
}
