"use client";
import LandingPage from "./components/LandingPage";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';

export default function HomePage() {
  return <LandingPage />;
}
