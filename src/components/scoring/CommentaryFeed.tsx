import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit2, Trash2, History } from 'lucide-react';
import { Button } from '../ui/button';

export interface CommentaryBall {
    id: string;
    over: number;
    ball: number;
    commentary: string;
    isWicket: boolean;
    isBoundary: boolean;
    runs: number;
}

interface CommentaryFeedProps {
    balls: CommentaryBall[];
    height?: string;
    onEditBall?: (ball: CommentaryBall) => void;
    onDeleteBall?: (ballId: string) => void;
    onViewHistory?: (ball: CommentaryBall) => void;
}

const CommentaryFeed: React.FC<CommentaryFeedProps> = ({
    balls,
    height = "h-[300px]",
    onEditBall,
    onDeleteBall,
    onViewHistory
}) => {
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new ball
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [balls.length]);

    // Latest at top
    const sortedBalls = [...balls].reverse();

    return (
        <div className={cn("bg-card rounded-xl border border-border overflow-hidden flex flex-col", height)}>
            <div className="p-3 border-b bg-muted/30">
                <h3 className="font-semibold text-sm">Ball Commentary</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {sortedBalls.map((ball) => (
                        <div key={ball.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-col items-center min-w-[3rem]">
                                <span className="font-bold text-muted-foreground text-xs">
                                    {ball.over}.{ball.ball}
                                </span>
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mt-1",
                                    ball.isWicket ? "bg-destructive text-destructive-foreground" :
                                        ball.isBoundary ? "bg-primary text-primary-foreground" :
                                            "bg-secondary text-secondary-foreground"
                                )}>
                                    {ball.isWicket ? 'W' : ball.runs}
                                </div>
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className={cn(
                                    "leading-relaxed",
                                    (ball.isWicket || ball.isBoundary) && "font-medium"
                                )}>
                                    {ball.commentary}
                                </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={() => onViewHistory?.(ball)}
                                    title="View History"
                                >
                                    <History className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={() => onEditBall?.(ball)}
                                    title="Edit Ball"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => onDeleteBall?.(ball.id)}
                                    title="Delete Ball"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {balls.length === 0 && (
                        <p className="text-center text-muted-foreground text-xs py-8">
                            Match about to start...
                        </p>
                    )}
                    <div ref={scrollEndRef} />
                </div>
            </ScrollArea>
        </div>
    );
};

export default CommentaryFeed;
