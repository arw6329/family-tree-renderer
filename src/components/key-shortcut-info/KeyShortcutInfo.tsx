import "./KeyShortcutInfo.scoped.css"

const KeyShortcutInfo: React.FC = () => {
    return (
        <div className="root" aria-keyshortcuts="Alt+Shift+K" role="status" aria-label="Keyboard shortcuts menu">
            <span className="title">Keyboard controls</span>
            <ul>
                <li>
                    <span>Arrow keys or <span style={{ whiteSpace: 'nowrap' }}><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></span>:</span>
                    <span>Pan canvas</span>
                </li>
                <li>
                    <span><kbd>Alt</kbd> + <kbd>Up Arrow</kbd>:</span>
                    <span>Refocus canvas while inside tree</span>
                </li>
                <li>
                    <span><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd>:</span>
                    <span>Toggle this <span className="underline">k</span>eyboard shortcuts menu</span>
                </li>
            </ul>
        </div>
    )
}

export default KeyShortcutInfo
