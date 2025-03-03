# ReunionPage Family Tree Renderer

ReunionPage is an interactive in-browser family tree renderer that allows you to build, edit, and explore family trees, written in React.

## Demo

https://family-tree-demo.arw9234.net

## Disclaimer

This project is in early development and a work in progress. Don't expect it to be stable yet or for all features to work correctly.

This project is currently in major version 0. I will try to avoid making backwards-incompatible changes while in this version but will not guarantee as such. The codebase, API, features, and visuals of this component are subject to change. I will bump the project to version 1.0.0 once it is in a state I consider stable.

## Features

- Fully interactive with pan/zoom, recenter/rebuild on different nodes
- Editable
- Supports complex relationships including multiple spouses, half siblings, step siblings, etc.
- Keyboard accessible

## Install

For React projects:

```
npm install @reunionpage/react-family-tree
```

## Basic Usage

Import the component (in a React project) and use:

```jsx
import { FamilyTree } from "@reunionpage/react-family-tree"

export default function App() {
    return (
        <div>
            <FamilyTree />
        </div>
    )
}
```

I am planning to add entrypoints/separate packages for Vue and other environments (as as web component), but as of right now only React projects can comsume this library.

## Save family tree on edit

By default the family tree will be lost upon closing/reloading the page.

To save the family tree as the user makes edits, pass a callback function to the `onDatabaseChange` prop:

```jsx
<FamilyTree
    onDatabaseChange={(database) => {
        console.log('Family tree changed: ', database)
        return new Promise((resolve, reject) => {
            // save family tree somewhere..
            resolve()
        })
    }}
/>
```

The function passed to `onDatabaseChange` accepts a `database` parameter, which is a JSON object representing the family tree. `onDatabaseChange` MUST return a promise that resolves when you are ready to handle another update event. Once `onDatabaseChange` is called, it will NOT be called again until the promise it returns either resolves or rejects. This allows you to do an async save operation (like posting the data to a backend API) without worrying about race conditions.

Here is an example of how you could use `onDatabaseChange` to post the tree to a backend API every time a change is made:

```jsx
<FamilyTree
    onDatabaseChange={(database) => {
        return new Promise(async (resolve, reject) => {
            await fetch('/api/family-tree', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(database)
            })
            resolve()
        })
    }}
/>
```

Here, `/api/family-tree` is expected to save the tree to some backing database, completely replacing the previous version.

To demonstrate how this works, consider the following series of events:

- The user makes an edit to the family tree
- `onDatabaseChange` is called and the serialized state of the tree is passed
- Your application POSTs the tree somewhere to be saved server-side
- The user rapidly makes 3 more edits before the previous POST completes

In this case, `onDatabaseChange` will not be called for the subsequent 3 edits since the promise returned from the first `onDatabaseChange` call has not resolved yet. If they were all fired at once, they might complete out-of-order, and you could end up not saving some of the edits.

Once the fetch call completes and the promise resolves, `onDatabaseChange` will immediately be called again with the most recent version of the tree. Only the most recent version will be passed to `onDatabaseChange`, so even though 3 edits were made while the first one was being processed, you will only be notified once.

## Populate with data

Use the `database` prop to populate the tree with saved data (for example, data previously passed to `onDatabaseChange` and saved):

```jsx
const database = { /* ... */ }

<FamilyTree
    database={database}
/>
```

## TODO/Planned Features

- Profile picture uploading
- GEDCOM import (and export?)
- Options to enable/disable editing and other fine tuning
- Arbitrary metadata editing for profiles and relationships
- Support replacing default profile nodes with custom components

## Contributing

I am not accepting pull requests at this time since the project is not yet stable and the codebase is changing rapidly. However, any bug reports or feature requests are greatly appreciated and can be submitted as issues at https://github.com/arw6329/family-tree-renderer.

## License

This project uses the MPL 2.0 license. You are free to use this library in larger works and release that work under a different license. You do not have to release source code for files added in larger works. If you make modifications to any of the files in this project, those modifications must be made available under the same license.
