import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Search, Plus, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Player {
    id: string;
    name: string;
    mobile?: string;
}

interface PlayerSelectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    players: Player[];
    onSelect: (playerId: string) => void;
    onAddNew?: (name: string, mobile: string) => void;
    description?: string;
}

const PlayerSelectDialog: React.FC<PlayerSelectDialogProps> = ({
    open,
    onOpenChange,
    title,
    players,
    onSelect,
    onAddNew,
    description
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newMobile, setNewMobile] = useState('');

    const filteredPlayers = players.filter(player => {
        const query = searchQuery.toLowerCase();
        return (
            player.name.toLowerCase().includes(query) ||
            (player.mobile && player.mobile.includes(query))
        );
    });

    const handleAdd = () => {
        if (newName.trim() && onAddNew) {
            onAddNew(newName, newMobile);
            setIsAdding(false);
            setNewName('');
            setNewMobile('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) {
                setIsAdding(false);
                setSearchQuery('');
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isAdding ? 'Add New Player' : title}</DialogTitle>
                    {description && !isAdding && <p className="text-sm text-muted-foreground">{description}</p>}
                </DialogHeader>

                {!isAdding ? (
                    <>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or mobile..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="max-h-[300px] mt-4">
                            <div className="space-y-2">
                                {filteredPlayers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No players found</p>
                                        {onAddNew && (
                                            <Button variant="outline" onClick={() => setIsAdding(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add New Player
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {filteredPlayers.map((player) => (
                                            <Button
                                                key={player.id}
                                                variant="outline"
                                                className="w-full justify-start h-auto py-3 px-4"
                                                onClick={() => {
                                                    onSelect(player.id);
                                                    onOpenChange(false);
                                                }}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-medium">{player.name}</span>
                                                    {player.mobile && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {player.mobile}
                                                        </span>
                                                    )}
                                                </div>
                                            </Button>
                                        ))}
                                        {onAddNew && (
                                            <div className="pt-2 border-t mt-2">
                                                <Button variant="ghost" className="w-full text-primary hover:text-primary/80" onClick={() => setIsAdding(true)}>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add "{searchQuery}" as new player
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>Player Name</Label>
                            <Input
                                placeholder="Enter name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile Number</Label>
                            <Input
                                placeholder="Enter mobile number"
                                value={newMobile}
                                onChange={(e) => setNewMobile(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleAdd} disabled={!newName.trim()}>
                                Add Player
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PlayerSelectDialog;
