import {
  createContext,
  useReducer,
  useState,
  useContext,
  useEffect,
} from "react";
import { defaultUser } from "../data/defaultUser";
import useFetch from "../hooks/useFetch";
import userReducer from "../reducers/userReducer";

const UserContext = createContext();
function UseUser() {
  return useContext(UserContext);
}

function UserContextProvider({ children }) {
  const [user, dispatch] = useReducer(userReducer, defaultUser);
  const [message, setMessage] = useState(null);
  // -------------------- GET CURRENT USER --------------------
  function handleFetchMeResults(data) {
    if (data.user) {
      const favoriteJobs = data.user.favorites;
      dispatch({
        type: "LOGIN",
        payload: {
          ...data.user,
          skills: data.user.skills,
          favorites: favoriteJobs,
        },
      });
    } else {
      dispatch({ type: "LOGOUT" });
    }
    setMessage(null);
  }

  const { isLoading: isMeLoading, performFetch: performFetchMe } = useFetch(
    "/users/me",
    handleFetchMeResults,
    (errorMessage) => {
      // "No token provided" is expected when browsing as a guest, so avoid noisy logs.
      if (errorMessage !== "No token provided") {
        console.error("Error fetching current user:", errorMessage);
      }
      dispatch({ type: "LOGOUT" });
    },
  );

  useEffect(() => {
    performFetchMe({ credentials: "include" });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        dispatch,
        message,
        setMessage,
        isMeLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContextProvider, UseUser };
