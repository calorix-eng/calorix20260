export const formatTimeAgo = (timestamp: number): string => {
    const now = new Date();
    const secondsPast = (now.getTime() - timestamp) / 1000;

    if (secondsPast < 60) {
        return 'agora mesmo';
    }
    if (secondsPast < 3600) {
        return `${Math.round(secondsPast / 60)}m atrás`;
    }
    if (secondsPast <= 86400) {
        return `${Math.round(secondsPast / 3600)}h atrás`;
    }
    if (secondsPast <= 604800) { // 7 days
        return `${Math.round(secondsPast / 86400)}d atrás`;
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
};
