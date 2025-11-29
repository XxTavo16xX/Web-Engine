
export const isWithinOneWeek = (timestamp: number): boolean => {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000); // 7 días en ms

    return timestamp >= oneWeekAgo && timestamp <= now;
};