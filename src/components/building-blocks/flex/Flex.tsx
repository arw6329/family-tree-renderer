import type { ReactNode } from "react"

const Flex: React.FC<{
    column?: boolean
    gap?: number,
    alignItems?: React.CSSProperties['alignItems']
    wrap?: boolean
    style?: React.CSSProperties
    className?: string
    children: ReactNode
}> = ({
    column = false,
    gap = 0,
    alignItems,
    wrap = false,
    style = {},
    className,
    children
}) => {
    return (
        <div className={className} style={{
            ...style,
            display: 'flex',
            flexDirection: column ? 'column' : 'row',
            alignItems,
            ...(wrap ? { flexWrap: 'wrap' } : {}),
            gap
        }}>{children}</div>
    )
}

export default Flex
