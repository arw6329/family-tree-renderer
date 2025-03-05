import type { ReactNode } from "react"
import React from "react"

const Grid: React.FC<{
    columns?: string
    rows?: string
    gap?: number
    justifyContent?: React.CSSProperties['justifyContent']
    children: ReactNode
}> = ({
    columns,
    rows,
    gap = 0,
    justifyContent,
    children
}) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: columns,
            gridTemplateRows: rows,
            gap,
            justifyContent
        }}>{children}</div>
    )
}

export default Grid
