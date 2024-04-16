import {useEffect, useState} from "react";
import {windowToolbarHeight, separatorThickness} from "./constants";
import {Inset} from "./Insets";
import {useLayout} from "./LayoutContext";

export default function Separator({
    parentInset,
    splitPercentage,
    direction,
    path,
}) {
    const {layout, setLayout, nexusRef} = useLayout();
    const [isDragging, setIsDragging] = useState(false);
    const [newInset, setNewInset] = useState(new Inset({}));

    const minPanelSize = nexusRef.current
        ? (100 * (windowToolbarHeight + separatorThickness)) /
          nexusRef.current.getBoundingClientRect().height
        : 5;

    useEffect(() => {
        if (direction === "column") {
            const height = 100 - parentInset.top - parentInset.bottom;
            const newTop = (height * splitPercentage) / 100 + parentInset.top;
            const newBottom = 100 - newTop;
            setNewInset(
                new Inset({
                    top: newTop,
                    right: parentInset.right,
                    bottom: newBottom,
                    left: parentInset.left,
                })
            );
        } else if (direction === "row") {
            const width = 100 - parentInset.right - parentInset.left;
            const newLeft = (width * splitPercentage) / 100 + parentInset.left;
            const newRight = 100 - newLeft;
            setNewInset(
                new Inset({
                    top: parentInset.top,
                    right: newRight,
                    bottom: parentInset.bottom,
                    left: newLeft,
                })
            );
        }

        const handleMouseMove = (event) => {
            event.preventDefault();
            if (isDragging && nexusRef.current) {
                const parentBBox = nexusRef.current.getBoundingClientRect();
                let absolutesSplitPercentage;
                if (direction === "column") {
                    absolutesSplitPercentage =
                        ((event.clientY - parentBBox.top) / parentBBox.height) *
                        100.0;
                } else {
                    absolutesSplitPercentage =
                        ((event.clientX - parentBBox.left) / parentBBox.width) *
                        100.0;
                }
                const relativeSplitPercentage =
                    parentInset.relativeSplitPercentage(
                        absolutesSplitPercentage,
                        direction
                    );
                let layoutClone = structuredClone(layout);
                let currentLayout = layoutClone;
                for (const index of path) {
                    currentLayout = currentLayout[index];
                }
                currentLayout.splitPercentage = Math.min(
                    Math.max(relativeSplitPercentage, minPanelSize),
                    100 - minPanelSize
                );
                setLayout(layoutClone);
            }
        };

        const handleMouseUp = (event) => {
            event.preventDefault();
            setIsDragging(false);
        };

        // Add event listeners to document
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Clean up event listeners when component unmounts
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [
        parentInset,
        layout,
        direction,
        splitPercentage,
        isDragging,
        setLayout,
        path,
        minPanelSize,
        nexusRef,
    ]);

    const handleMouseDown = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    return (
        <div
            style={{
                inset: newInset.toString(),
                position: "absolute",
                marginTop: `${
                    direction === "column" ? separatorThickness / -2 : 0
                }px`,
                marginLeft: `${
                    direction === "row" ? separatorThickness / -2 : 0
                }px`,
            }}
            className={`${direction === "column" ? "h-2" : "w-2"} ${
                direction === "column"
                    ? "hover:cursor-ns-resize"
                    : "hover:cursor-ew-resize"
            } z-10 grid place-content-center overflow-hidden`}
            onMouseDown={handleMouseDown}
        >
            <div
                className={`${direction === "column" ? "h-0.5" : "w-0.5"} ${
                    direction === "column" ? "w-6" : "h-6"
                } rounded-full bg-zinc-50`}
            ></div>
        </div>
    );
}