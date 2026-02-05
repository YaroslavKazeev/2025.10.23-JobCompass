import { defaultUser } from "../data/defaultUser";

export default function userReducer(state, action) {
  switch (action.type) {
    case "REGISTER":
    case "LOGIN":
      return { ...defaultUser, ...action.payload };
    case "UPDATE_USER": {
      return { ...state, ...action.payload };
    }
    case "LOGOUT":
      return defaultUser;
    case "SET_SKILLS": {
      return { ...state, skills: action.payload };
    }
    case "TOGGLE_FAVORITE": {
      const job = action.payload;
      const jobId = job?.id;
      const prevFavorites = state.favorites;
      const exists = prevFavorites.some((fav) => fav.id === jobId);
      const newFavorites = exists
        ? prevFavorites.filter((fav) => fav.id !== jobId)
        : [...prevFavorites, job];
      return { ...state, favorites: newFavorites };
    }
    default:
      return state;
  }
}
