import { useState, useEffect } from "react";

export function useVisibleCount(breakpoints: { sm: number; md: number; def: number } = { sm: 600, md: 960, def: 3 }): number {
    const [count, setCount] = useState(breakpoints.def);
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w < breakpoints.sm) setCount(1);
            else if (w < breakpoints.md) setCount(2);
            else setCount(breakpoints.def);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [breakpoints.sm, breakpoints.md, breakpoints.def]);
    return count;
}
