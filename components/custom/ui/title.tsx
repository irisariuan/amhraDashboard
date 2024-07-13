import type { ReactNode } from "react";

export default function Title({ children } : {children: ReactNode}) {
    return <h1 className="text-xl font-bold my-4">{children}</h1>;
}