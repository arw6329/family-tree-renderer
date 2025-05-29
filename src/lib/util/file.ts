type Directory = {
    [filename: string]: File | Directory
}

export function fileListToJsonDirectory(files: FileList): Directory {
    const directory: Directory = {}

    for(const file of files) {
        const path = file.webkitRelativePath.split(/[\/\\]/).filter(path => path)

        if(path.length === 0) {
            throw new Error(`Path "${file.webkitRelativePath}" was empty`)
        }

        let currentDirectory = directory
        for(let i = 0; i < path.length - 1; i++) {
            if(!(path[i] in currentDirectory)) {
                currentDirectory[path[i]] = {}
            }

            if(currentDirectory[path[i]] instanceof File) {
                throw new Error(
                    `FileList has a file "${file.webkitRelativePath}" under directory "${path[i]}" but also has a file at this location`
                )
            }

            currentDirectory = currentDirectory[path[i]] as Directory
        }

        currentDirectory[path[path.length - 1]] = file
    }

    return directory
}

// Map paths to a parsed directory returned from fileListToJsonDirectory.
// For example, map a path like C:/some/absolute/path/media/photos/grandma.jpg
// to media/photos/grandma.jpg in JSON directory.
// If descend is true, also check one level deeper in JSON directory.
// For example, map a path like ./photos/grandma.jpg
// to ancestry/photos/grandma.jpg in JSON directory.
export function fuzzyFindFileInDirectory(path: string, directory: Directory, descend = true): File | null {
    const pathSegments = path.split(/[\/\\]/).filter(segment => segment && segment !== '.')

    if(pathSegments.length === 0) {
        throw new Error(`Path "${path}" was empty`)
    }

    searchRoot:
    for(let searchRoot = 0; searchRoot < pathSegments.length; searchRoot++) {
        let currentDirectory = directory

        for(let i = searchRoot; i < pathSegments.length - 1; i++) {
            const segment = pathSegments[i]
            if(!(segment in currentDirectory)) {
                continue searchRoot
            }

            if(currentDirectory[segment] instanceof File) {
                continue searchRoot
            }

            currentDirectory = currentDirectory[segment]
        }

        const file = currentDirectory[pathSegments[pathSegments.length - 1]]
        if(file instanceof File) {
            return file
        }
    }

    if(descend) {
        // If we didn't find the file, check one level deeper.
        // FileList reports name of selected directory at beginning of path,
        // so this is particularly relevant in that case if the file path
        // is relative (starts with .).
        for(const subdirectory of Object.values(directory)) {
            if(subdirectory instanceof File) {
                continue
            }

            const file = fuzzyFindFileInDirectory(path, subdirectory, false)
            if(file) {
                return file
            }
        }
    }

    return null
}
