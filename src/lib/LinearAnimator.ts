export class LinearAnimator {
    #cancelled = false

    // 3rd parameter is unit change per second (not millisecond)
    constructor(velocity_initial, velocity_final, acceleration, callback) {
        let start_time = performance.now()
        let last_time = start_time
        let frame = time => {
            let velocity_next = velocity_initial + ((time - start_time) / 1000) * acceleration
            if ((acceleration > 0 ? velocity_next < velocity_final : velocity_next > velocity_final) && !this.#cancelled) {
                callback(velocity_next, time - last_time)
                last_time = time
                window.requestAnimationFrame(frame)
            }
        }
        window.requestAnimationFrame(frame)
    }

    cancel() {
        this.#cancelled = true
    }
}
