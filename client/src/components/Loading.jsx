import React from "react";

const Loading = ({ height = "100vh" }) => {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center h-screen"
    >
      <div className="border-3 border-purple-500 rounded-full w-10 h-10 border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Loading;
