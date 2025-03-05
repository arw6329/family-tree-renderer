import type { ReactNode } from "react"

const Flex: React.FC<{
    column?: boolean
    gap?: number
    children: ReactNode
}> = ({
    column = false,
    gap = 0,
    children
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: column ? 'column' : 'row',
            gap: gap
        }}>{children}</div>
    )
}

export default Flex
