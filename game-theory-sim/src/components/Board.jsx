import React from "react";

export default function Board() {
    const size = 8;
    const cells = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            cells.push(
                <div key={`${i}-${j}`} className="cell">
                    {i},{j}
                </div>,
            );
        }
    }

    return <div className="board">{cells}</div>;
}
