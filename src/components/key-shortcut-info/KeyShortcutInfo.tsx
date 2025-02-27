import "./KeyShortcutInfo.scoped.css"

const KeyShortcutInfo: React.FC = () => {
    return (
        <div className="root">
            <span className="title">Keyboard controls</span>
            <ul>
                <li>
                    <span>Use arrow keys or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to pan canvas</span>
                </li>
                <li>
                    <span>Use <kbd>Alt</kbd> + <kbd>Up Arrow</kbd> to refocus canvas while inside tree</span>
                </li>
            </ul>
        </div>
    )
}

export default KeyShortcutInfo
