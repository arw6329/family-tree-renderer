import type { AndFilterDefinition } from "./filter-elements/AndFilter"
import type { ChildRecordFilterDefinition } from "./filter-elements/ChildRecordFilter"
import type { DateCompareFilterDefinition } from "./filter-elements/DateCompareFilter"
import type { NotFilterDefinition } from "./filter-elements/NotFilter"
import type { ParentsRelativeFilterDefinition } from "./filter-elements/ParentsRelativeFilter"
import type { StringCompareFilterDefinition } from "./filter-elements/StringCompareFilter"
import type { NoopFilterDefinition } from "./filter-elements/NoopFilter"
import type { StoredValueChildRecordFilterDefinition } from "./filter-elements/StoredValueChildRecordFilter"
import type { VariableStore } from "./VariableStore"
import type { ReactNode } from "react"
import type { ChildRelationship, NodeMetadata, Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import type { DatabaseView } from "@/lib/family-tree/DatabaseView"
import { andFilterRegistration, orFilterRegistration } from "./filter-elements/AndFilter"
import { childRecordFilterRegistration } from "./filter-elements/ChildRecordFilter"
import { dateCompareFilterRegistration } from "./filter-elements/DateCompareFilter"
import { notFilterRegistration } from "./filter-elements/NotFilter"
import { parentsRelativeFilterRegistration } from "./filter-elements/ParentsRelativeFilter"
import { stringCompareFilterRegistration } from "./filter-elements/StringCompareFilter"
import { noopFilterRegistration } from "./filter-elements/NoopFilter"
import { storedValueChildRecordFilterRegistration } from "./filter-elements/StoredValueChildRecordFilter"

export type FilterDefinition =
    AndFilterDefinition
    | NotFilterDefinition
    | ChildRecordFilterDefinition
    | ParentsRelativeFilterDefinition
    | StringCompareFilterDefinition
    | DateCompareFilterDefinition
    | NoopFilterDefinition
    | StoredValueChildRecordFilterDefinition

export type FilterType = FilterDefinition['type']

export type FilterTestSubjectType = 'Profile' | 'SpousalRelationship' | 'ChildRelationship' | 'NodeMetadata'

type FilterElementCommonProps<T extends FilterDefinition> = {
    filter: T
    testSubjectType: FilterTestSubjectType
    onChange: (filter: FilterDefinition | null) => void
}

export type FilterRegistration<T extends FilterDefinition> = {
    type: string
    createEmpty(): T
    execute(
        filter: T,
        testSubject: Profile | ChildRelationship | NodeMetadata,
        database: DatabaseView,
        variableStore: VariableStore
    ): Generator<boolean, undefined, undefined>
    element(props: FilterElementCommonProps<T>): ReactNode
}

const filterRegistrations: FilterRegistration<FilterDefinition>[] = [
    andFilterRegistration,
    orFilterRegistration,
    childRecordFilterRegistration,
    dateCompareFilterRegistration,
    noopFilterRegistration,
    notFilterRegistration,
    parentsRelativeFilterRegistration,
    stringCompareFilterRegistration,
    storedValueChildRecordFilterRegistration
]

export function *executeFilter(
    filter: FilterDefinition | null,
    testSubject: Profile | ChildRelationship | NodeMetadata,
    database: DatabaseView,
    variableStore: VariableStore
): Generator<boolean, undefined, undefined> {
    if(!filter) {
        yield false
        return
    }

    const reg = filterRegistrations.find(reg => reg.type === filter.type)

    if(!reg) {
        throw new Error(`Unknown filter type ${filter.type}`)
    }

    yield *reg.execute(filter, testSubject, database, variableStore)
}

export function createFilterElement(props: FilterElementCommonProps<FilterDefinition>): ReactNode {
    const reg = filterRegistrations.find(reg => reg.type === props.filter.type)

    if(!reg) {
        throw new Error(`Unknown filter type ${props.filter.type}`)
    }

    return reg.element(props)
}

export function createEmptyFilter(type: FilterType): FilterDefinition {
    const reg = filterRegistrations.find(reg => reg.type === type)

    if(!reg) {
        throw new Error(`Unknown filter type ${type}`)
    }

    return reg.createEmpty()
}
