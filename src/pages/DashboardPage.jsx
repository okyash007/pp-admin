import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Creator from "../our/Creator";

async function getCreators() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/creator/all`
  );
  const data = await response.json();
  return data;
}

const DashboardPage = () => {
  const [creators, setCreators] = useState(null);
  useEffect(() => {
    getCreators().then((data) => {
      setCreators(data.data);
    });
  }, []);

  if (!creators) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {creators.map((creator) => (
        <Creator key={creator.creator_id} creator={creator} />
      ))}
    </div>
  );
};

export default DashboardPage;
