export function move_element_to_pos<T>(target: T[], elem: T, pos: number) {
    let index = target.indexOf(elem)
    if(index < 0)
        throw new Error('element not found in array')
    target.splice(index, 1)
    target.splice(pos, 0, elem)
}

export function move_element_to_start<T>(target: T[], elem: T) {
    move_element_to_pos(target, elem, 0)
}

export function move_element_to_end<T>(target: T[], elem: T) {
    move_element_to_pos(target, elem, target.length)
}

export function remove_elem<T>(target: T[], elem: T) {
    let index = target.indexOf(elem)
    if(index < 0)
        throw new Error('Tried to remove element from array not contained within array')
    target.splice(index, 1)
}

export function remove_elem_if_present<T>(target: T[], elem: T) {
    let index = target.indexOf(elem)
    if(index < 0) {
        return
    }
    target.splice(index, 1)
}

export function remove_elems_by<T>(target: T[], predicate: (elem: T) => boolean) {
    const indices: number[] = []
    target.forEach((elem, i) => {
        if(predicate(elem)) {
            indices.push(i)
        }
    })
    indices.forEach((index, i) => {
        target.splice(index - i, 1)
    })   
}

export function replace_elem<T>(target: T[], old_elem: T, new_elem: T) {
    let index = target.indexOf(old_elem)
    if(index < 0)
        throw new Error('Tried to replace element not contained within array')
    target[index] = new_elem
}

export function center_of_values(target: number[],) {
    return (Math.min(...target) + Math.max(...target)) / 2
}

export function min_by_with_index<T>(target: T[], func: (elem: T) => number): [undefined, -1] | [T, number] {
	if(target.length === 0) {
		return [undefined, -1]
	}

	let min = target[0]
	let min_i = 0

	for(let i = 1; i < target.length; i++) {
		if(func(target[i]) < func(min)) {
			min = target[i]
			min_i = i
		}
	}

	return [min, min_i]
}