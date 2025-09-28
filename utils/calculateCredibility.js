export const calculateCredibility = (severity) => {
    const baseScore = severity === 'severe' ? 85 :
                      severity === 'high' ? 75 :
                      severity === 'moderate' ? 60 : 45;
    return Math.min(100, baseScore + Math.floor(Math.random() * 15));
};
