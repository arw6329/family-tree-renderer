import { min_by_with_index } from "@/lib/array-utils/array-utils"
import { FocusableElement, tabbable } from "tabbable"

function getForeignObjectCenter(fo: SVGForeignObjectElement): [number, number] {
    return [
        fo.x.baseVal.value + fo.width.baseVal.value / 2,
        fo.y.baseVal.value + fo.height.baseVal.value / 2
    ]
}

export function focusClosestChild(parent: SVGElement, pointX: number, pointY: number) {
    const focusableElementsWithPos = [...parent.querySelectorAll('button')]
        .map<[HTMLButtonElement, number, number]>(element => {
            const fo = element.closest('foreignObject')!
            return [
                element,
                fo.x.baseVal.value + fo.width.baseVal.value / 2,
                fo.y.baseVal.value + fo.height.baseVal.value / 2
            ]
        })

    const [[element]] = min_by_with_index(focusableElementsWithPos, ([_, x, y]) => {
        return Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2)
    }) as [[HTMLButtonElement, number, number], number]

    element.focus()
}

export function focusClosestActiveElementNeighborWithDirection(parent: SVGElement, direction: 'up' | 'down' | 'left' | 'right') {
    const root = parent.getRootNode() as Document | ShadowRoot
    const focusedElement = root.activeElement as HTMLElement

    if(!focusedElement) {
        return
    }

    switch(direction) {
        case 'up':
        case 'down': {
            const preferredNeighborIds = focusedElement.dataset[direction === 'up'
                ? 'preferredFocusNeighborsUp' : 'preferredFocusNeighborsDown'
            ]?.split(' ') ?? []
            for(const id of preferredNeighborIds) {
                const neighbor = root.querySelector(`[data-focus-id="${id}"]`) as HTMLElement
                if(neighbor) {
                    neighbor.focus()
                    return
                }
            }
            return
        }
        case 'left':
        case 'right': {
            const currentCenter = getForeignObjectCenter(focusedElement.closest('foreignObject')!)
            const tabbableElements = tabbable(parent)
            const sameGenerationElems = tabbableElements
                .filter(elem => getForeignObjectCenter(elem.closest('foreignObject')!)[1] === currentCenter[1])
            const currentIndex = sameGenerationElems.indexOf(focusedElement as FocusableElement)
            sameGenerationElems[currentIndex + (direction === 'left' ? 1 : - 1)]?.focus()
            return
        }
    }
}
