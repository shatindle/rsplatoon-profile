export const userData = async () => (await fetch("/api/user")).json();
export const templateList = async () => (await fetch("/api/templates/all")).json();