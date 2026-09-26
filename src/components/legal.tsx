import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="fixed-background" />
      <main className="legal-page">
        <Link to="/">← На сторінку замовлення</Link>
        <h1>{title}</h1>
        {children}
      </main>
    </>
  );
}
