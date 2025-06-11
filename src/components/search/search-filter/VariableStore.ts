export class VariableStore {
    private variables: { [k: string]: unknown }
    
    constructor() {
        this.variables = {}
    }

    getVariable(variable: string): unknown {
        return this.variables[variable]
    }

    setVariable(variable: string, value: unknown) {
        if(!(variable in this.variables)) {
            this.variables[variable] = []
        }
        this.variables[variable] = value
    }
}
