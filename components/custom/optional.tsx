import type React from "react";

export function Optional({ hidden = false, children }: { hidden: boolean, children: React.ReactNode }) {
    return !hidden && children
}