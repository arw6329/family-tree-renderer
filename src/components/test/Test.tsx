import React from "react"

const TestComponent: React.FC<{ title: string }> = (props) => {
    return (
        <h1>Hello world! {props.title}</h1>
    )
}

export default TestComponent