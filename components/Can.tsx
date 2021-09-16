import { ReactNode } from "react";
import { useCan } from "../hooks/useCan";

interface CanProps {
    children: ReactNode;
    permissions?: string[];
    roles?: string[];
}

export function Can({children, permissions, roles}:CanProps) {
    const UserCanSeeComponent = useCan({permissions,roles})

    if(!UserCanSeeComponent){
        return null
    }

    return (
        <>
        {children}
        </>
    )
}