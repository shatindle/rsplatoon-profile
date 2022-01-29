export const getProfile = async (id) => (await fetch(`/api/profile/${id}`)).json();

