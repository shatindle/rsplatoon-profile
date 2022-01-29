export const getSettings = async () => (await fetch("/api/settings")).json();

export const saveBotKeyConfig = async (bot) => {
    await fetch("/api/settings/updatekey", {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bot)
    });
}

export const resetKeyConfig = async (id) => {
    await fetch("/api/settings/resetkey", {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: id
        })
    });
}

export const revokeKeyConfig = async (id) => {
    await fetch("/api/settings/revokekey", {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: id
        })
    });
}