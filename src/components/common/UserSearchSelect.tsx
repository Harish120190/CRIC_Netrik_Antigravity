
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { mockDB, User } from "@/services/mockDatabase";

interface UserSearchSelectProps {
    onSelect: (userId: string) => void;
    label?: string;
    placeholder?: string;
    excludeIds?: string[];
    roleFilter?: 'scorer' | 'umpire' | 'organizer' | 'player'; // Optional filter
}

export function UserSearchSelect({
    onSelect,
    label = "Select User",
    placeholder = "Search users...",
    excludeIds = [],
    roleFilter
}: UserSearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Load users from mockDB
        let allUsers = mockDB.getUsers();

        // Filter by role if specified
        if (roleFilter) {
            allUsers = allUsers.filter(u => u.role === roleFilter);
        }

        // Filter out excluded IDs
        if (excludeIds.length > 0) {
            allUsers = allUsers.filter(u => !excludeIds.includes(u.id));
        }

        setUsers(allUsers);
    }, [open, excludeIds, roleFilter]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? users.find((user) => user.id === value)?.fullName
                        : label}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder={placeholder} />
                    <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                            {users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={user.fullName} // Command uses this for filtering
                                    onSelect={(currentValue) => {
                                        setValue(user.id);
                                        onSelect(user.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === user.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{user.fullName}</span>
                                        <span className="text-xs text-muted-foreground">{user.mobile || user.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
