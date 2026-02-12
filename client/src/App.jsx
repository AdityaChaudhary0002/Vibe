import React, { useRef, lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice.js";
import { fetchConnections } from "./features/connections/connectionSlice.js";
import { addMessage } from "./features/messages/messagesSlice.js";
import Notification from "./components/Notification.jsx";
import Loading from "./components/Loading";

// Lazy Imports
const Login = lazy(() => import("./pages/Login"));
const Feed = lazy(() => import("./pages/Feed"));
const Message = lazy(() => import("./pages/Message"));
const ChatBox = lazy(() => import("./pages/ChatBox"));
const Connections = lazy(() => import("./pages/Connections"));
const Discover = lazy(() => import("./pages/Discover"));
const Profile = lazy(() => import("./pages/Profile"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Layout = lazy(() => import("./pages/Layout"));
const VideoCall = lazy(() => import("./pages/VideoCall"));

const App = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        import.meta.env.VITE_BASE_URL + "/api/message/" + user.id
      );

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (pathnameRef.current === "/messages/" + message.from_user_id._id) {
          dispatch(addMessage(message));
        } else {
          toast.custom(
            (t) => {
              // Note: Notification component needs to be returned properly?
              // The original code had: <Notification t={t} message={message} />; inside a function block?
              // Ah, toast.custom takes (t) => JSX.
              // Original: (t) => { <Notification ... /> } -> this returns undefined if no return statement!
              // Wait, original code (Step 2169, line 58):
              // (t) => { <Notification t={t} message={message} />; },
              // This is a bug in original code too? { <Component /> } is void. ({ <Component /> }) or { return <Component /> } is correct.
              // But let's restore it as is first, or fix it if I can.
              return <Notification t={t} message={message} />;
            },
            { position: "bottom-right" }
          );
        }
      };
      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <Toaster />
      <Suspense fallback={
        <div className="h-screen w-full flex justify-center items-center bg-white dark:bg-slate-900">
          <Loading />
        </div>
      }>
        <Routes>
          <Route
            path="/"
            element={
              !isLoaded ? (
                <div className="h-screen w-full flex justify-center items-center">
                  <Loading />
                </div>
              ) : !user ? (
                <Login />
              ) : (
                <Layout />
              )
            }
          >
            <Route index element={<Feed />} />
            <Route path="messages" element={<Message />} />
            <Route path="messages/:userId" element={<ChatBox />} />
            <Route path="connections" element={<Connections />} />
            <Route path="discover" element={<Discover />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:profileId" element={<Profile />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="room/:roomId" element={<VideoCall />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
