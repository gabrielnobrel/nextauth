"use client";
import { Can } from "@/components/Can";
import { AuthContext } from "@/contexts/AuthContext";
import { useCan } from "@/hooks/useCan";
import { api } from "@/services/api";
import { useContext, useEffect } from "react";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get("/me").then((response) => {
      console.log(response);
    });
  }, []);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <Can permissions={["metrics.list"]}>
        <h1>Metrics</h1>
      </Can>
    </>
  );
}
