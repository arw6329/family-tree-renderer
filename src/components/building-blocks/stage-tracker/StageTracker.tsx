import "./StageTracker.scoped.css"

const StageTracker: React.FC<{ stageCount: number, stage: number }> = ({ stageCount, stage }) => {
    const stages = []
    
    for(let i = 1; i <= stageCount; i++) {
        stages.push({
            stage: i,
            status: i < stage ? 'complete' : i === stage ? 'in-progress' : 'incomplete'
        })
    }
    
    return (
        <div className="root">
            {stages.flatMap(stage => [
                <div className="line" data-complete={stage.status !== 'incomplete'} data-incomplete={stage.status === 'incomplete'} />,
                <div className="stage" {...{[`data-${stage.status}`]: true}}>
                    <span>{stage.stage}</span>
                </div>
            ]).slice(1)}
        </div>
    )
}

export default StageTracker
