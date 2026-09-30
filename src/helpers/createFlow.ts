export function createFlow<Args extends unknown[], Result>(
    operation: (...args: Args) => Promise<Result>,
) {
    const flow = (...args: Args) => operation(...args);
    flow.use = <Next>(
        wrapper: (
            operation: (...args: Args) => Promise<Result>,
        ) => (...args: Args) => Promise<Next>,
    ) => createFlow(wrapper(operation));
    return flow;
}
