let myTemplates = null;

export const getMyTemplates = async () => {
    if (!myTemplates) {
        myTemplates = (await fetch("/api/templates")).json();
    }

    return myTemplates;
};

export const searchTemplates = async (searchTerm) => {
    let url = new URL(window.location.origin + "/api/templates/all");

    url.search = new URLSearchParams({ q: searchTerm });

    return (await fetch(url)).json();
};

export const deleteTemplate = async (slot) => {
    await fetch("/api/templates/delete", {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slot })
    });
};