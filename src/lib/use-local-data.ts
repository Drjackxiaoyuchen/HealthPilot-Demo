"use client";
import { useEffect, useState } from "react";
import { readJSON } from "./user-data";

export function useLocalData<T>(key: string): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    const update = () => setData(readJSON<T>(key));
    update();
    window.addEventListener("storage", update);
    window.addEventListener("symphony:data", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("symphony:data", update);
    };
  }, [key]);
  return data;
}
