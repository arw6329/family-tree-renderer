import type { ReactNode } from "react"

const Flex: React.FC<{
    column?: boolean
    gap?: number,
    alignItems?: React.CSSProperties['alignItems']
    children: ReactNode
}> = ({
    column = false,
    gap = 0,
    alignItems,
    children
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: column ? 'column' : 'row',
            alignItems,
            gap
        }}>{children}</div>
    )
}

export default Flex
