import axios from "axios";

const axiosInstance = axios.create({
  //local instance of firebase functions
  //baseURL: "http://127.0.0.1:5001/e-clone-2024-6244e/us-central1/api",

  //deployed verssion of firebase function
  baseURL: "https://api-rb6h5z5uda-uc.a.run.app/",
  //deployed verssion of amazone server on render.com
  // baseURL: "https://amazon-api-deploy-ccrj.onrender.com",
});

export { axiosInstance };

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000",
// });
// export { axiosInstance };
