// import { useContext, useEffect } from "react";
// import "./App.css";
// import Routing from "./Router";
// import { DataContext } from "./Components/DataProvider/DataProvider";
// import { Type } from "./Utility/action.type";
// import { auth } from "./Utility/firebase.js";

// function App() {
//   const [{ user }, dispatch] = useContext(DataContext);

//   useEffect(() => {
//     auth.onAuthStateChanged((authUser) => {
//       if (authUser) {
//         dispatch({
//           type: Type.SET_USER,
//           user: authUser,
//         });
//       } else {
//         dispatch({
//           type: Type.SET_USER,
//           user: null,
//         });
//       }
//     });
//   }, []);

//   return (
//     <>
//       <Routing />
//     </>
//   );
// }

// export default App;

import { useContext, useEffect } from "react";
import "./App.css";
import Routing from "./Router";
import { DataContext } from "./Components/DataProvider/DataProvider";
import { Type } from "./Utility/action.type";
import { auth } from "./Utility/firebase.js";

function App() {
  const [{ user }, dispatch] = useContext(DataContext);

  useEffect(() => {
    // Monitor authentication state changes
    auth.onAuthStateChanged((authUser) => {
      console.log("Firebase Auth Current User:", authUser);

      if (authUser) {
        dispatch({
          type: Type.SET_USER,
          user: authUser,
        });
      } else {
        dispatch({
          type: Type.SET_USER,
          user: null,
        });
      }

      // Compare authUser.uid and user?.uid
      if (authUser?.uid && user?.uid) {
        console.log("Firebase Auth User UID:", authUser.uid);
        console.log("Context User UID:", user.uid);
        if (authUser.uid !== user.uid) {
          console.error(
            "Mismatch: Firebase Auth UID and Context UID do not match!"
          );
        }
      }
    });
  }, [user]);

  return (
    <>
      <Routing />
    </>
  );
}

export default App;
