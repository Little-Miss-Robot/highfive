import container from '../container';

function describeReceiver(receiver: unknown): string {
    if (typeof receiver === 'function') {
        return receiver.name || '<anonymous class>';
    }

    if (receiver !== null && typeof receiver === 'object') {
        return receiver.constructor.name;
    }

    return String(receiver);
}

export default function logResult(
    formatResult: (value: unknown) => string = String,
    formatReceiver: (receiver: unknown) => string = describeReceiver,
) {
    return function <This, Args extends unknown[], Result>(
        method: (this: This, ...args: Args) => Promise<Result>,
        context: ClassMethodDecoratorContext<
            This,
            (this: This, ...args: Args) => Promise<Result>
        >,
    ) {
        return async function (this: This, ...args: Args): Promise<Result> {
            const result = await method.apply(this, args);

            container.make('logger').info(
                `${formatReceiver(this)}.${String(context.name)} returned: ${formatResult(result)}`,
            );

            return result;
        };
    };
}
