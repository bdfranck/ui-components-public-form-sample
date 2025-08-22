export const startViewTransition = (callback: () => void) => {
    if (document.startViewTransition) {
        document.startViewTransition(() => callback());
    } else {
        console.warn("View transitions not supported");
        callback();
    }
}