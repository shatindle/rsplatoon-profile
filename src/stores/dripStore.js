export const getDrip = async () => (await fetch("/api/drip")).json();
// TODO: move other form post methods here