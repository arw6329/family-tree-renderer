import type { ReactNode } from "react"
import React from "react"

const Grid: React.FC<{
    columns?: string
    rows?: string
    gap?: number
    columnGap?: number
    rowGap?: number
    justifyContent?: React.CSSProperties['justifyContent']
    style?: React.CSSProperties
    children: ReactNode
}> = ({
    columns,
    rows,
    gap = 0,
    columnGap = gap ?? 0,
    rowGap = gap ?? 0,
    justifyContent,
    style = {},
    children
}) => {
    return (
        <div style={{
            ...style,
            display: 'grid',
            gridTemplateColumns: columns,
            gridTemplateRows: rows,
            gap,
            columnGap,
            rowGap,
            justifyContent
        }}>{children}</div>
    )
}

export default Grid
