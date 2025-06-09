import type { AndFilterDefinition } from "./filter-elements/AndFilter"
import type { ChildRecordFilterDefinition } from "./filter-elements/ChildRecordFilter"
import type { DateCompareFilterDefinition } from "./filter-elements/DateCompareFilter"
import type { NotFilterDefinition } from "./filter-elements/NotFilter"
import type { ParentsRelativeFilterDefinition } from "./filter-elements/ParentsRelativeFilter"
import type { RelativeFilterDefinition } from "./RelativeFilter"
import type { StringCompareFilterDefinition } from "./filter-elements/StringCompareFilter"
import type { NoopFilterDefinition } from "./filter-elements/NoopFilter"

export type FilterDefinition =
    AndFilterDefinition
    | NotFilterDefinition
    | ChildRecordFilterDefinition
    | ParentsRelativeFilterDefinition
    | StringCompareFilterDefinition
    | DateCompareFilterDefinition
    | NoopFilterDefinition

export type FilterType = FilterDefinition['type']

export type FilterTestSubjectType = 'Profile' | 'SpousalRelationship' | 'ChildRelationship' | 'NodeMetadata'
