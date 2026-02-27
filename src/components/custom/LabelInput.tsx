import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LabelInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function LabelInput({ value, onChange, className }: LabelInputProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Escape") {
            setIsEditing(false);
        }
    }

    const handleOnBlur = () => {
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <Input
                className={className}
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                onKeyDown={handleKeyDown}
                onBlur={handleOnBlur}
            />
        )
    }

    return (
        <Label
            className={`cursor-pointer ${className}`} onClick={() => setIsEditing(true)}>{value}</Label>
    )
}