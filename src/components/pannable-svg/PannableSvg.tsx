import { LinearAnimator } from "@/lib/LinearAnimator"
import { forwardRef, ReactNode, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react"
import "./PannableSvg.scoped.css"
import { focusClosestActiveElementNeighborWithDirection } from "../family-tree/family-tree-renderer/focus-control"

const ZOOM_SCALE_WHEEL = 0.0005
const ZOOM_SCALE_PINCH = 1
const ZOOM_SCALE_TRACKPAD_PINCH = 0.0025
const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const PAN_SCALE = 1;
const PAN_DECELERATION = 5;
const KEYBOARD_PAN_STEP = 100;
const ZOOM_DECELERATION = 0.25;

function clamp(min: number, max: number, n: number) {
    return Math.max(min, Math.min(n, max))
}

function fetchViewBox(svg: SVGSVGElement) {
    return svg.getAttribute('viewBox').split(' ').map(num => parseFloat(num))
}

function attachControls(svg: SVGSVGElement) {
    let mouseX = 0
    let mouseY = 0
    let last_timestamp = 0
    let instant_velocity_x = 0
    let instant_velocity_y = 0

    let touches = {} // TODO: also cache mouse events?
    let zoom_instant_velocity = 0 // TODO: this differs based on the rate touch events are fired - take performance.now into account

    let animators: LinearAnimator[] = []

    function screenToSVG(screenX: number, screenY: number) {
        let p = svg.createSVGPoint()
        p.x = screenX
        p.y = screenY
        return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    
    function zoom(dz, zoom_center_screen_coord_x, zoom_center_screen_coord_y) {
        let viewBox = fetchViewBox(svg)

        // make sure zoom doesn't exceed threshold, if the passed parameters go past threshold just zoom to threshold
        const newWidth = viewBox[2] * dz
        const newHeight = viewBox[3] * dz

        viewBox[2] = Math.min(svg.scrollWidth / ZOOM_MIN, Math.max(svg.scrollWidth / ZOOM_MAX, newWidth))
        viewBox[3] = Math.min(svg.scrollHeight / ZOOM_MIN, Math.max(svg.scrollHeight / ZOOM_MAX, newHeight))

        let oldSVGCenter = screenToSVG(zoom_center_screen_coord_x, zoom_center_screen_coord_y)
        svg.setAttribute('viewBox', viewBox.join(' '))
        let newSVGCenter = screenToSVG(zoom_center_screen_coord_x, zoom_center_screen_coord_y)
        viewBox[0] -= newSVGCenter.x - oldSVGCenter.x
        viewBox[1] -= newSVGCenter.y - oldSVGCenter.y
        svg.setAttribute('viewBox', viewBox.join(' '))
    }
    
    function pan(dx: number, dy: number) {        
        let viewBox = fetchViewBox(svg)
        viewBox[0] -= dx * PAN_SCALE
        viewBox[1] -= dy * PAN_SCALE
        svg.setAttribute('viewBox', viewBox.join(' '))
    }

    let dragging = false
    
    function handle_mouse_down(evt: PointerEvent) {
        if(!evt.isPrimary || evt.pointerType === 'touch') {
            return
        }

        svg.setPointerCapture(evt.pointerId)

        animators.forEach(animator => {
            animator.cancel()
        })
        animators = []

        dragging = true
        mouseX = evt.x
        mouseY = evt.y
        last_timestamp = performance.now()
        instant_velocity_x = 0
        instant_velocity_y = 0
        ;[...svg.children].forEach(child => child.classList.add('no-interrupt-drag'))
        svg.dispatchEvent(new Event('panstart'))
    }

    function handle_mouse_move(evt: PointerEvent) {
        if(!evt.isPrimary || evt.pointerType === 'touch') {
            return
        }

        if(dragging) {
            pan(
                evt.movementX / svg.scrollWidth * fetchViewBox(svg)[2],
                evt.movementY / svg.scrollHeight * fetchViewBox(svg)[3]
            )
            svg.dispatchEvent(new Event('pan'))
        }
        
        mouseX = evt.x
        mouseY = evt.y
        let this_timestamp = performance.now()
        instant_velocity_x = evt.movementX / (this_timestamp - last_timestamp)
        instant_velocity_y = evt.movementY / (this_timestamp - last_timestamp)
        last_timestamp = this_timestamp
    }

    function handle_end_drag_mouse(evt: PointerEvent) {
        if(!evt.isPrimary || evt.pointerType === 'touch') {
            return
        }

        svg.releasePointerCapture(evt.pointerId)

        if(dragging) {
            dragging = false
            ;[...svg.children].forEach(child => child.classList.remove('no-interrupt-drag'))

            let pan_instant_velocity_initial = Math.sqrt(Math.pow(instant_velocity_x, 2) + Math.pow(instant_velocity_y, 2))
            let pan_vector_x_component_ratio = instant_velocity_x / pan_instant_velocity_initial
            let pan_vector_y_component_ratio = instant_velocity_y / pan_instant_velocity_initial
            if(!isNaN(pan_vector_x_component_ratio) && !isNaN(pan_vector_y_component_ratio)) {
                animators.push(new LinearAnimator(pan_instant_velocity_initial, 0, - PAN_DECELERATION, (v, dt) => {
                    pan(
                        (v * pan_vector_x_component_ratio * dt) / svg.scrollWidth * fetchViewBox(svg)[2],
                        (v * pan_vector_y_component_ratio * dt) / svg.scrollHeight * fetchViewBox(svg)[3]
                    )
                }))
            }

            svg.dispatchEvent(new Event('panend'))
        }
    }

    function handle_touch_start(evt: TouchEvent) {
        animators.forEach(animator => {
            animator.cancel()
        })
        animators = []

        ;[...evt.changedTouches].forEach(touch => {
            touches[touch.identifier] = touch
        })

        ;[...svg.children].forEach(child => child.classList.add('no-interrupt-drag'))

        instant_velocity_x = 0
        instant_velocity_y = 0

        if(Object.keys(touches).length === 1) {
            svg.dispatchEvent(new Event('panstart'))
        }
    }

    function handle_touch_move(evt: TouchEvent) {
        if(evt.changedTouches.length === 1 && Object.keys(touches).length === 1 && [...evt.changedTouches].every(touch => touch.identifier in touches)) {
            // pan gesture
            let identifier = evt.changedTouches[0].identifier

            let dx = evt.changedTouches[0].pageX - touches[identifier].pageX
            let dy = evt.changedTouches[0].pageY - touches[identifier].pageY

            pan(
                dx / svg.scrollWidth * fetchViewBox(svg)[2],
                dy / svg.scrollHeight * fetchViewBox(svg)[3]
            )

            let this_timestamp = performance.now()
            instant_velocity_x = dx / (this_timestamp - last_timestamp)
            instant_velocity_y = dy / (this_timestamp - last_timestamp)
            last_timestamp = this_timestamp

            touches[identifier] = evt.changedTouches[0]

            svg.dispatchEvent(new Event('pan'))
        } else if(evt.changedTouches.length <= 2 && Object.keys(touches).length === 2 && [...evt.changedTouches].every(touch => touch.identifier in touches)) {
            // pinch-and-zoom gesture
            let dist_old = Math.sqrt(
                Math.pow(Object.values(touches)[0].pageX - Object.values(touches)[1].pageX, 2) +
                Math.pow(Object.values(touches)[0].pageY - Object.values(touches)[1].pageY, 2)
            )

            // there could be less than 2 changed touches
            // this only updates changed touches and uses the old value for unchanged touches
            ;[...evt.changedTouches].forEach(touch => {
                touches[touch.identifier] = touch
            })

            let dist_new = Math.sqrt(
                Math.pow(Object.values(touches)[0].pageX - Object.values(touches)[1].pageX, 2) +
                Math.pow(Object.values(touches)[0].pageY - Object.values(touches)[1].pageY, 2)
            )

            let dz = dist_old / dist_new
            zoom_instant_velocity = dz
            zoom(
                ZOOM_SCALE_PINCH * dz,
                (Object.values(touches)[0].pageX + Object.values(touches)[1].pageX) / 2,
                (Object.values(touches)[0].pageY + Object.values(touches)[1].pageY) / 2
            )
        }

        evt.preventDefault() // stops back gesture behavior and might prevent mouse event from being dispatched
    }

    function handle_touch_end(evt: TouchEvent) {
        if(Object.keys(touches).length === 2) {
            // pinch-and-zoom just ended

            // the touches object will be modified immediately after scheduling the callback to the following function inside LinearAnimator with requestAnimationFrame
            // that means if we directly reference the touches object in this callback, it will be modified and will not contain both touches almost immediately, throwing an error
            // therefore, the closure for the following callback has to contain references to the touches directly rather than use the touches object
            const touch1 = Object.values(touches)[0]
            const touch2 = Object.values(touches)[1]
            // TODO: remove debug log
            animators.push(
                new LinearAnimator(zoom_instant_velocity, 1, Math.sign(1 - zoom_instant_velocity) * ZOOM_DECELERATION, v => {
                    zoom(
                        ZOOM_SCALE_PINCH * v,
                        (touch1.pageX + touch2.pageX) / 2,
                        (touch1.pageY + touch2.pageY) / 2
                    )
                })
            )
        } else if(Object.keys(touches).length === 1) {
            // pan gesture just ended
            let pan_instant_velocity_initial = Math.sqrt(Math.pow(instant_velocity_x, 2) + Math.pow(instant_velocity_y, 2))
            let pan_vector_x_component_ratio = instant_velocity_x / pan_instant_velocity_initial
            let pan_vector_y_component_ratio = instant_velocity_y / pan_instant_velocity_initial
            if(!isNaN(pan_vector_x_component_ratio) && !isNaN(pan_vector_y_component_ratio)) {
                animators.push(new LinearAnimator(pan_instant_velocity_initial, 0, - PAN_DECELERATION, (v, dt) => {
                    pan(
                        (v * pan_vector_x_component_ratio * dt) / svg.scrollWidth * fetchViewBox(svg)[2],
                        (v * pan_vector_y_component_ratio * dt) / svg.scrollHeight * fetchViewBox(svg)[3]
                    )
                }))
            }

            svg.dispatchEvent(new Event('panend'))
        }

        [...evt.changedTouches].forEach(touch => {
            delete touches[touch.identifier]
        })

        if(Object.keys(touches).length === 0) {
            ;[...svg.children].forEach(child => child.classList.remove('no-interrupt-drag'))
        }
    }

    function handle_zoom(evt: WheelEvent) {
        if(svg.matches(':hover')) {
            animators.forEach(animator => {
                animator.cancel()
            })
            animators = []

            if(evt.ctrlKey) {
                zoom(
                    clamp(-1, 1, ZOOM_SCALE_TRACKPAD_PINCH * evt.deltaY) + 1,
                    mouseX, mouseY
                )
            } else {
                zoom(
                    clamp(-1, 1, ZOOM_SCALE_WHEEL * evt.deltaY) + 1,
                    mouseX, mouseY
                )
            }

            svg.dispatchEvent(new Event('zoom'))

            evt.preventDefault() // prevent zoom-in when user is zooming in with trackpad two-finger gesture
        }
    }

    function handle_keyboard_pan(evt: KeyboardEvent) {
        if(svg.matches(':has(:focus)')) {
            if(evt.code === 'ArrowUp' && evt.altKey) {
                svg.focus()
                return
            }

            console.log(evt)
            switch(evt.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    focusClosestActiveElementNeighborWithDirection(svg, 'left')
                    return
                case 'KeyD':
                case 'ArrowRight':
                    focusClosestActiveElementNeighborWithDirection(svg, 'right')
                    return
                case 'KeyW':
                case 'ArrowUp':
                    focusClosestActiveElementNeighborWithDirection(svg, 'up')
                    return
                case 'KeyS':
                case 'ArrowDown':
                    focusClosestActiveElementNeighborWithDirection(svg, 'down')
                    return
            }
        }

        if(svg.getRootNode().activeElement !== svg) {
            return
        }

        let dx = 0
        let dy = 0
        // TODO: different speeds on ctrl and shift
        switch(evt.code) {
            case 'KeyA':
            case 'ArrowLeft':
                dx = KEYBOARD_PAN_STEP
                break
            case 'KeyD':
            case 'ArrowRight':
                dx = - KEYBOARD_PAN_STEP
                break
            case 'KeyW':
            case 'ArrowUp':
                dy = KEYBOARD_PAN_STEP
                break
            case 'KeyS':
            case 'ArrowDown':
                dy = - KEYBOARD_PAN_STEP
                break
        }

        if(dx !== 0 || dy !== 0) {
            animators.forEach(animator => {
                animator.cancel()
            })
            animators = []

            pan(dx, dy)
        }
    }

    function handle_focus_change(evt) {
        const target = evt.target

        if(target === svg) {
            return
        }

        const focusedElementMinPadding = 50

        const boundingBox = target.getBoundingClientRect()
        const svgSafeUpperLeft = screenToSVG(boundingBox.left, boundingBox.top)
        const svgSafeLowerRight = screenToSVG(boundingBox.right, boundingBox.bottom)
        const currentViewBox = fetchViewBox(svg)
        const newViewBoxX = Math.max(Math.min(currentViewBox[0], svgSafeUpperLeft.x - focusedElementMinPadding), svgSafeLowerRight.x + focusedElementMinPadding - currentViewBox[2])
        const newViewBoxY = Math.max(Math.min(currentViewBox[1], svgSafeUpperLeft.y - focusedElementMinPadding), svgSafeLowerRight.y + focusedElementMinPadding - currentViewBox[3])
        
        svg.setAttribute('viewBox', [newViewBoxX, newViewBoxY, currentViewBox[2], currentViewBox[3]].join(' '))
    }

    svg.addEventListener('pointerdown', handle_mouse_down)
    svg.addEventListener('pointerup', handle_end_drag_mouse)
    svg.addEventListener('pointerout', handle_end_drag_mouse)
    svg.addEventListener('pointermove', handle_mouse_move)

    svg.addEventListener('touchstart', handle_touch_start)
    svg.addEventListener('touchmove', handle_touch_move, {
        passive: false
    })
    svg.addEventListener('touchend', handle_touch_end)

    svg.addEventListener('focusin', handle_focus_change)

    window.addEventListener('wheel', handle_zoom, {
        passive: false
    })

    window.addEventListener('keydown', handle_keyboard_pan)
}

// export { attachControls }




// const PannableSvg: React.FC<{}> = (props) => {
//     const svg: RefObject<SVGSVGElement | null> = useRef(null)

//     const mouseX = useRef(0)
//     const mouseY = useRef(0)
//     const last_timestamp = useRef(0)
//     const instant_velocity_x = useRef(0)
//     const instant_velocity_y = useRef(0)
//     const dragging = useRef(false)

//     const touches = useRef({}) // TODO: also cache mouse events?
//     const zoom_instant_velocity = useRef(0) // TODO: this differs based on the rate touch events are fired - take performance.now into account

//     const animators: RefObject<LinearAnimator[]> = useRef([])

//     function handlePointerDown(evt: PointerEvent<SVGSVGElement>) {
//         if(!evt.isPrimary || evt.pointerType === 'touch') {
//             return
//         }

//         svg.current.setPointerCapture(evt.pointerId)

//         animators.current.forEach(animator => {
//             animator.cancel()
//         })
//         animators.current = []

//         dragging.current = true
//         mouseX.current = evt.x
//         mouseY.current = evt.y
//         last_timestamp.current = performance.now()
//         instant_velocity_x.current = 0
//         instant_velocity_y.current = 0
//         ;[...svg.current.children].forEach(child => child.classList.add('no-interrupt-drag'))
//     }

//     return (
//         <div>
//             <svg
//                 ref={svg}
//                 onPointerDown={handlePointerDown}
//             ></svg>
//         </div>
//     )
// }

const PannableSvg = forwardRef<{
    setCenter: (centerX: number, centerY: number) => void
    getCenter: () => [number, number]
    zoom: (pixels: number) => void
}, { children: ReactNode }>(({ children }, ref) => {
    const svg: RefObject<SVGSVGElement | null> = useRef(null)

    useEffect(() => {
        let previousWidth = svg.current.scrollWidth
        let previousHeight = svg.current.scrollHeight

        const currentCenterX = svg.current.viewBox.baseVal.x + svg.current.viewBox.baseVal.width / 2
        const currentCenterY = svg.current.viewBox.baseVal.y + svg.current.viewBox.baseVal.height / 2
        svg.current.viewBox.baseVal.x = currentCenterX - previousWidth / 2
        svg.current.viewBox.baseVal.y = currentCenterY - previousHeight / 2
        svg.current.viewBox.baseVal.width = previousWidth
        svg.current.viewBox.baseVal.height = previousHeight
        attachControls(svg.current)

        new ResizeObserver((entries) => {
            // resize maintains center point
            for(const entry of entries) {
                const currentCenterX = svg.current.viewBox.baseVal.x + svg.current.viewBox.baseVal.width / 2
                const currentCenterY = svg.current.viewBox.baseVal.y + svg.current.viewBox.baseVal.height / 2
                svg.current.viewBox.baseVal.width *= entry.contentBoxSize[0].inlineSize / previousWidth
                svg.current.viewBox.baseVal.height *= entry.contentBoxSize[0].blockSize / previousHeight
                svg.current.viewBox.baseVal.x = currentCenterX - svg.current.viewBox.baseVal.width / 2
                svg.current.viewBox.baseVal.y = currentCenterY - svg.current.viewBox.baseVal.height / 2
                previousWidth = entry.contentBoxSize[0].inlineSize
                previousHeight = entry.contentBoxSize[0].blockSize
            }
        }).observe(svg.current)
    }, [])

    useImperativeHandle(ref, () => {
        return {
            setCenter(centerX: number, centerY: number) {
                svg.current.viewBox.baseVal.x = centerX - svg.current.viewBox.baseVal.width / 2
                svg.current.viewBox.baseVal.y = centerY - svg.current.viewBox.baseVal.height / 2
            },

            getCenter() {
                return [
                    svg.current.viewBox.baseVal.x + svg.current.viewBox.baseVal.width / 2,
                    svg.current.viewBox.baseVal.y + svg.current.viewBox.baseVal.height / 2
                ]
            },

            zoom(pixels: number) {
                const aspectRatio = svg.current.scrollWidth / svg.current.scrollHeight
                const pxDeltaWidth = pixels / (aspectRatio + 1) * aspectRatio
                const pxDeltaHeight = pixels - pxDeltaWidth

                console.log(aspectRatio, pxDeltaWidth, pxDeltaHeight)

                const newWidth = svg.current.viewBox.baseVal.width + pxDeltaWidth
                const clampedNewWidth = Math.min(svg.current.scrollWidth / ZOOM_MIN, Math.max(svg.current.scrollWidth / ZOOM_MAX, newWidth))
                const newHeight = svg.current.viewBox.baseVal.height + pxDeltaHeight
                const clampedNewHeight = Math.min(svg.current.scrollHeight / ZOOM_MIN, Math.max(svg.current.scrollHeight / ZOOM_MAX, newHeight))

                const clampedPxDeltaWidth = clampedNewWidth - svg.current.viewBox.baseVal.width
                const clampedPxDeltaHeight = clampedNewHeight - svg.current.viewBox.baseVal.height

                svg.current.viewBox.baseVal.x -= clampedPxDeltaWidth / 2
                svg.current.viewBox.baseVal.y -= clampedPxDeltaHeight / 2
                svg.current.viewBox.baseVal.width = clampedNewWidth
                svg.current.viewBox.baseVal.height = clampedNewHeight
            }
        }
    })

    return (
        // TODO: interactive semantics / aria role
        <svg
            viewBox="0 0 0 0"
            ref={svg}
            tabIndex={0}
            aria-keyshortcuts="Alt+ArrowUp"
            aria-label="Interactive family tree graphic"
        >
            {children}
        </svg>
    )
})

export default PannableSvg

export type PannableSvgControls = (typeof PannableSvg extends React.ForwardRefExoticComponent<infer T> ? T : never) extends React.RefAttributes<infer T> ? T : never