import IntervalTree from "@flatten-js/interval-tree";
import React from "react";

let verticalTree: IntervalTree = new IntervalTree();
let horizontalTree: IntervalTree = new IntervalTree();
let centerVerticalTree: IntervalTree = new IntervalTree();
let centerHorizontalTree: IntervalTree = new IntervalTree();
let horizontalOverlapObjectTree: IntervalTree = new IntervalTree();
let verticalOverlapObjectTree: IntervalTree = new IntervalTree();
let horizontalDistTree: IntervalTree = new IntervalTree();
let verticalDistTree: IntervalTree = new IntervalTree();
let isSmartGuide: boolean = false;
export type GuideCoordinate = { x: number; y: number; w: number; h: number };
export type distCoordinate = {
  dist: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  endX: number;
  endY: number;
  endWidth: number;
  endheight: number;
};
export type snapCoordinate = { newX: number; newY: number };

export function setSmartGuideStructure(cLst: GuideCoordinate[], snapDistance?: number) {
  verticalTree = new IntervalTree();
  horizontalTree = new IntervalTree();
  centerVerticalTree = new IntervalTree();
  centerHorizontalTree = new IntervalTree();
  horizontalOverlapObjectTree = new IntervalTree();
  verticalOverlapObjectTree = new IntervalTree();
  horizontalDistTree = new IntervalTree();
  verticalDistTree = new IntervalTree();
  const snapDist = snapDistance ?? 2
  cLst.forEach((coordi) => {
    verticalTree.insert([coordi.x - snapDist, coordi.x + snapDist], {
      x: coordi.x,
      y: coordi.y,
      w: coordi.w,
      h: coordi.h,
    });
    verticalTree.insert(
      [coordi.x + coordi.w - snapDist, coordi.x + coordi.w + snapDist],
      {
        x: coordi.x + coordi.w,
        y: coordi.y,
        w: coordi.w,
        h: coordi.h,
      }
    );
  });
  cLst.forEach((coordi) => {
    centerVerticalTree.insert(
      [coordi.x + coordi.w / 2 - snapDist, coordi.x + coordi.w / 2 + snapDist],
      {
        x: coordi.x + coordi.w / 2,
        y: coordi.y,
        w: coordi.w,
        h: coordi.h,
      }
    );
  });
  cLst.forEach((coordi) => {
    horizontalTree.insert([coordi.y - snapDist, coordi.y + snapDist], {
      x: coordi.x,
      y: coordi.y,
      w: coordi.w,
      h: coordi.h,
    });
    horizontalTree.insert(
      [coordi.y + coordi.h - snapDist, coordi.y + coordi.h + snapDist],
      {
        x: coordi.x,
        y: coordi.y + coordi.h,
        w: coordi.w,
        h: coordi.h,
      }
    );
  });
  cLst.forEach((coordi) => {
    centerHorizontalTree.insert(
      [coordi.y + coordi.h / 2 - snapDist, coordi.y + coordi.h / 2 + snapDist],
      {
        x: coordi.x,
        y: coordi.y + coordi.h / 2,
        w: coordi.w,
        h: coordi.h,
      }
    );
  });
  cLst.forEach((coordi) => {
    cLst.forEach((gCoordi) => {
      const startX = coordi.x;
      const startY = coordi.y;
      const startWidth = coordi.w;
      const startHeight = coordi.h;
      const endX = gCoordi.x;
      const endY = gCoordi.y;
      const endWidth = gCoordi.w;
      const endheight = gCoordi.h;
      if (
        startX + startWidth < endX &&
        startY + startHeight > endY &&
        startY < endY + endheight
      ) {
        const dist = endX - (startX + startWidth);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY + startHeight, endY + endheight);
        horizontalOverlapObjectTree.insert([minY - snapDist, maxY + snapDist], {
          dist,
          startX,
          startY,
          startWidth,
          startHeight,
          endX,
          endY,
          endWidth,
          endheight,
        });
        horizontalDistTree.insert([dist - snapDist, dist + snapDist], {
          dist,
          startX: startX + startWidth,
          startY,
          startWidth,
          startHeight,
          endX,
          endY,
          endWidth,
          endheight,
        });
      }
      if (
        startY + startHeight < endY &&
        startX + startWidth > endX &&
        startX < endX + endWidth
      ) {
        const dist = endY - (startY + startHeight);
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX + startWidth, endX + endWidth);
        verticalOverlapObjectTree.insert([minX - snapDist, maxX + snapDist], {
          dist,
          startX,
          startY,
          startWidth,
          startHeight,
          endX,
          endY,
          endWidth,
          endheight,
        });
        verticalDistTree.insert([dist - snapDist, dist + snapDist], {
          dist,
          startX,
          startY: startY + startHeight,
          startWidth,
          startHeight,
          endX,
          endY,
          endWidth,
          endheight,
        });
      }
    });
  });
}

export function clearSmartGuideStructure() {
  verticalTree.clear();
  horizontalTree.clear();
  centerVerticalTree.clear();
  centerHorizontalTree.clear();
  horizontalOverlapObjectTree.clear();
  verticalOverlapObjectTree.clear();
  horizontalDistTree.clear();
  verticalDistTree.clear();
}

export function getVerticalGuideLineDatas(x: number) {
  return verticalTree.search([x, x]);
}

export function getHorizontalGuideLineDatas(y: number) {
  return horizontalTree.search([y, y]);
}

export function getCenterVerticalGuideLineDatas(x: number) {
  return centerVerticalTree.search([x, x]);
}

export function getCenterHorizontalGuideLineDatas(y: number) {
  return centerHorizontalTree.search([y, y]);
}

export function getHorizontalOverlapObjects(
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return [];
  }
  const distArr: any[] = [];
  const guideArr = horizontalOverlapObjectTree.search([y, y]);
  guideArr.forEach((child) => {
    if (x > child.endX + child.endWidth) {
      const lx = child.endX + child.endWidth;
      const rx = x;
      distArr.push({
        startX: lx,
        startY: child.startY,
        startWidth: child.startWidth,
        startHeight: child.startHeight,
        endX: rx,
        endY: child.endY,
        endWidth: child.endWidth,
        endheight: child.endheight,
      });
    }
    if (x + w < child.startX) {
      const lx = x + w;
      const rx = child.startX;
      distArr.push({
        startX: lx,
        startY: child.startY,
        startWidth: child.startWidth,
        startHeight: child.startHeight,
        endX: rx,
        endY: child.endY,
        endWidth: child.endWidth,
        endheight: child.endheight,
      });
    }
  });
  const sortedArr = distArr.slice().sort((a, b) => {
    if (a.endX - a.startX > b.endX - b.startX) return 1;
    if (a.endX - a.startX < b.endX - b.startX) return -1;
    return 0;
  });
  return sortedArr;
}

export function getBetweenHorizontalOverlapObjects(
  x: number,
  y: number,
  w: number,
  h: number, 
  snapDistance? : number,
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return [];
  }
  const distArr: any[] = [];
  const guideArr = horizontalOverlapObjectTree.search([y, y]);
  const snapDist = snapDistance ?? 2
  guideArr.forEach((child) => {
    if (x + w < child.endX && child.startX + child.startWidth < x) {
      const leftDist = x - child.startX - child.startWidth;
      const rightDist = child.endX - x - w;
      if (leftDist - snapDist <= rightDist && rightDist <= leftDist + snapDist) {
        distArr.push({
          sd: (leftDist + rightDist) / 2,
          startX: child.startX + child.startWidth,
          startY: child.startY,
          startWidth: child.startWidth,
          startHeight: child.startHeight,
          endX: x,
          endY: child.endY,
          endWidth: child.endWidth,
          endheight: child.endheight,
        });
        distArr.push({
          sd: (leftDist + rightDist) / 2,
          startX: x + w,
          startY: child.startY,
          startWidth: child.startWidth,
          startHeight: child.startHeight,
          endX: child.endX,
          endY: child.endY,
          endWidth: child.endWidth,
          endheight: child.endheight,
        });
      }
    }
  });
  const sortedArr = distArr.slice().sort((a, b) => {
    if (a.endX - a.startX > b.endX - b.startX) return 1;
    if (a.endX - a.startX < b.endX - b.startX) return -1;
    return 0;
  });
  return sortedArr;
}

export function getVerticalOverlapObjects(
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return [];
  }
  const distArr: any[] = [];
  const guideArr = verticalOverlapObjectTree.search([x, x]);
  guideArr.forEach((child) => {
    const lx = Math.min(child.startX, child.endX);
    const rx = Math.max(
      child.startX + child.startWidth,
      child.endX + child.endWidth
    );
    if (y > child.endY + child.endheight) {
      const ty = child.endY + child.endheight;
      const by = y;
      distArr.push({
        startX: child.startX,
        startY: ty,
        startWidth: child.startWidth,
        startHeight: child.startHeight,
        endX: child.endX,
        endY: by,
        endWidth: child.endWidth,
        endheight: child.endheight,
      });
    }
    if (y + h < child.startY) {
      const ty = y + h;
      const by = child.startY;
      distArr.push({
        startX: child.startX,
        startY: ty,
        startWidth: child.startWidth,
        startHeight: child.startHeight,
        endX: child.endX,
        endY: by,
        endWidth: child.endWidth,
        endheight: child.endheight,
      });
    }
  });
  const sortedArr = distArr.slice().sort((a, b) => {
    if (a.endY - a.startY > b.endY - b.startY) return 1;
    if (a.endY - a.startY < b.endY - b.startY) return -1;
    return 0;
  });
  return sortedArr;
}

export function getBetweenVerticalOverlapObjects(
  x: number,
  y: number,
  w: number,
  h: number,
  snapDistance?: number,
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return [];
  }
  const distArr: any[] = [];
  const guideArr = verticalOverlapObjectTree.search([x, x]);
  const snapDist = snapDistance ?? 2
  guideArr.forEach((child) => {
    if (y + h < child.endY && child.startY + child.startHeight < y) {
      const topDist = y - child.startY - child.startHeight;
      const bottomDist = child.endY - y - h;
      if (topDist - snapDist <= bottomDist && bottomDist <= topDist + snapDist) {
        distArr.push({
          sd: (topDist + bottomDist) / 2,
          startX: child.startX,
          startY: child.startY + child.startHeight,
          startWidth: child.startWidth,
          startHeight: child.startHeight,
          endX: child.endX,
          endY: y,
          endWidth: child.endWidth,
          endheight: child.endheight,
        });
        distArr.push({
          sd: (topDist + bottomDist) / 2,
          startX: child.startX,
          startY: y + h,
          startWidth: child.startWidth,
          startHeight: child.startHeight,
          endX: child.endX,
          endY: child.endY,
          endWidth: child.endWidth,
          endheight: child.endheight,
        });
      }
    }
  });
  const sortedArr = distArr.slice().sort((a, b) => {
    if (a.endY - a.startY > b.endY - b.startY) return 1;
    if (a.endY - a.startY < b.endY - b.startY) return -1;
    return 0;
  });
  return sortedArr;
}

export function getHorizontalDistGuideLineDatas(y: number, dist: number) {
  if (y === undefined || dist === undefined) {
    return [];
  }
  const horizonDistArr = horizontalDistTree.search([dist, dist])
    ? horizontalDistTree.search([dist, dist])
    : [];
  const distArray: distCoordinate[] = [];
  horizonDistArr.forEach((child) => {
    const ty = Math.min(child.startY, child.endY);
    const by = Math.max(
      child.startY + child.startHeight,
      child.endY + child.endheight
    );
    if (ty <= y && y <= by) {
      distArray.push(child);
    }
  });
  return distArray;
}

export function getVerticalDistGuideLineDatas(x: number, dist: number) {
  if (x === undefined || dist === undefined) {
    return [];
  }
  const verticalDistArr = verticalDistTree.search([dist, dist])
    ? verticalDistTree.search([dist, dist])
    : [];
  const distArray: distCoordinate[] = [];
  verticalDistArr.forEach((child) => {
    const lx = Math.min(child.startX, child.endX);
    const rx = Math.max(
      child.startX + child.startWidth,
      child.endX + child.endWidth
    );
    if (lx <= x && x <= rx) {
      distArray.push(child);
    }
  });
  return distArray;
}

export function getHorizontalDistGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string,
  snapDistance?: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null;
  }
  const snapDist = snapDistance ?? 2
  const sortedTHorizontalArr = getHorizontalOverlapObjects(x, y, w, h);
  const sortedBHorizontalArr = getHorizontalOverlapObjects(x, y + h, w, h);
  if (module === "gaia") {
    return sortedTHorizontalArr.length > 0
      ? sortedTHorizontalArr.map((value, idx1) => {
          const tty = Math.min(value.startY, value.endY);
          const bby = Math.max(
            value.startY + value.startHeight,
            value.endY + value.endheight
          );
          if (idx1 === 0 && y >= tty && y <= bby) {
            const dist = value.endX - value.startX;
            const dxArray = getHorizontalDistGuideLineDatas(y, dist)
              ? getHorizontalDistGuideLineDatas(y, dist)
              : [];
            return dxArray.length > 0 ? (
              <g>
                {dxArray.map((val, idx) => {
                  const vDist = val.endX - val.startX;
                  const by = Math.max(
                    Math.max(
                      val.startY + val.startHeight,
                      val.endY + val.endheight
                    ),
                    y + h
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist && idx === 0 ? (
                    <g>
                      <rect
                        fill="#FF00A9"
                        fillOpacity={0.2}
                        stroke="#FF00A9"
                        strokeOpacity={0.2}
                        x={val.startX}
                        y={tty}
                        width={val.endX - val.startX}
                        height={bby - tty}
                      />
                      <rect
                        fill="#FF00A9"
                        x={val.startX}
                        y={bby + 10}
                        rx={4}
                        ry={4}
                        width={val.endX - val.startX}
                        height={18}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <rect
                    fill="#FF00A9"
                    fillOpacity={0.2}
                    stroke="#FF00A9"
                    strokeOpacity={0.2}
                    x={value.startX}
                    y={value.startY}
                    width={value.endX - value.startX}
                    height={bby - tty}
                  />
                  <rect
                    fill="#FF00A9"
                    x={value.startX}
                    y={bby + 10}
                    rx={4}
                    ry={4}
                    width={value.endX - value.startX}
                    height={18}
                  />
                </g>
              </g>
            ) : null;
          }
        })
      : sortedBHorizontalArr.map((value, idx1) => {
          const tty = Math.min(value.startY, value.endY);
          const bby = Math.max(
            value.startY + value.startHeight,
            value.endY + value.endheight
          );
          if (idx1 === 0 && y + h >= tty && y + h <= bby) {
            const dist = value.endX - value.startX;
            const dxArray = getHorizontalDistGuideLineDatas(y + h, dist)
              ? getHorizontalDistGuideLineDatas(y + h, dist)
              : [];
            return dxArray.length > 0 ? (
              <g>
                {dxArray.map((val, idx) => {
                  const vDist = val.endX - val.startX;
                  const by = Math.max(
                    Math.max(
                      val.startY + val.startHeight,
                      val.endY + val.endheight
                    ),
                    y + h
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist ? (
                    <g>
                      <rect
                        fill="#FF00A9"
                        fillOpacity={0.2}
                        stroke="#FF00A9"
                        strokeOpacity={0.2}
                        x={val.startX}
                        y={tty}
                        width={val.endX - val.startX}
                        height={bby - tty}
                      />
                      <rect
                        fill="#FF00A9"
                        x={val.startX}
                        y={bby + 10}
                        rx={4}
                        ry={4}
                        width={val.endX - val.startX}
                        height={18}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <rect
                    fill="#FF00A9"
                    fillOpacity={0.2}
                    stroke="#FF00A9"
                    strokeOpacity={0.2}
                    x={value.startX}
                    y={tty}
                    width={value.endX - value.startX}
                    height={bby - tty}
                  />
                  <rect
                    fill="#FF00A9"
                    x={value.startX}
                    y={bby + 10}
                    rx={4}
                    ry={4}
                    width={value.endX - value.startX}
                    height={18}
                  />
                </g>
              </g>
            ) : null;
          }
        });
  } else {
    return sortedTHorizontalArr.length > 0
      ? sortedTHorizontalArr.map((value, idx1) => {
          const tty = Math.min(value.startY, value.endY);
          const bby = Math.max(
            value.startY + value.startHeight,
            value.endY + value.endheight
          );
          if (idx1 === 0 && y >= tty && y <= bby) {
            const dist = value.endX - value.startX;
            const dxArray = getHorizontalDistGuideLineDatas(y, dist)
              ? getHorizontalDistGuideLineDatas(y, dist)
              : [];
            return dxArray.length > 0 ? (
              <g>
                {dxArray.map((val, idx) => {
                  const vDist = val.endX - val.startX;
                  const by = Math.max(
                    Math.max(
                      val.startY + val.startHeight,
                      val.endY + val.endheight
                    ),
                    y + h
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist && idx === 0 ? (
                    <g>
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${val.startX} ${val.startY}, ${val.startX} ${
                          by + 10
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={`${val.startX} ${by + 10}, ${val.startX + 5} ${
                          by + 5
                        }, ${val.startX + 5} ${by + 15},${val.startX} ${
                          by + 10
                        }`}
                      />
                      <polyline
                        fill="none"
                        stroke="red"
                        strokeDasharray="2, 2"
                        points={`${val.startX} ${by + 10}, ${val.endX} ${
                          by + 10
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={`${val.endX} ${by + 10}, ${val.endX - 5} ${
                          by + 5
                        }, ${val.endX - 5}, ${by + 15}, ${val.endX} ${by + 10}`}
                      />
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${val.endX} ${by + 10}, ${val.endX} ${
                          val.endY
                        }`}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${value.startX} ${value.endY}, ${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="red"
                    points={`${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.startX + 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 -
                      5
                    }, ${value.startX + 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 +
                      5
                    }, ${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="none"
                    stroke="red"
                    strokeDasharray="2, 2"
                    points={`${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="red"
                    points={`${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.endX - 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 -
                      5
                    }, ${value.endX - 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 +
                      5
                    }, ${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.endX} ${y}`}
                  />
                </g>
              </g>
            ) : null;
          }
        })
      : sortedBHorizontalArr.map((value, idx1) => {
          const tty = Math.min(value.startY, value.endY);
          const bby = Math.max(
            value.startY + value.startHeight,
            value.endY + value.endheight
          );
          if (idx1 === 0 && y + h >= tty && y + h <= bby) {
            const dist = value.endX - value.startX;
            const dxArray = getHorizontalDistGuideLineDatas(y + h, dist)
              ? getHorizontalDistGuideLineDatas(y + h, dist)
              : [];
            return dxArray.length > 0 ? (
              <g>
                {dxArray.map((val, idx) => {
                  const vDist = val.endX - val.startX;
                  const by = Math.max(
                    Math.max(
                      val.startY + val.startHeight,
                      val.endY + val.endheight
                    ),
                    y + h
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist ? (
                    <g>
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${val.startX} ${val.startY}, ${val.startX} ${
                          by + 10
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={`${val.startX} ${by + 10}, ${val.startX + 5} ${
                          by + 5
                        }, ${val.startX + 5} ${by + 15},${val.startX} ${
                          by + 10
                        }`}
                      />
                      <polyline
                        fill="none"
                        stroke="red"
                        strokeDasharray="2, 2"
                        points={`${val.startX} ${by + 10}, ${val.endX} ${
                          by + 10
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={`${val.endX} ${by + 10}, ${val.endX - 5} ${
                          by + 5
                        }, ${val.endX - 5}, ${by + 15}, ${val.endX} ${by + 10}`}
                      />
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${val.endX} ${by + 10}, ${val.endX} ${
                          val.endY
                        }`}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${value.startX} ${value.endY}, ${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="red"
                    points={`${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.startX + 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 -
                      5
                    }, ${value.startX + 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 +
                      5
                    }, ${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="none"
                    stroke="red"
                    strokeDasharray="2, 2"
                    points={`${value.startX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="red"
                    points={`${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.endX - 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 -
                      5
                    }, ${value.endX - 5} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) +
                      10 +
                      5
                    }, ${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }`}
                  />
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${value.endX} ${
                      Math.max(
                        Math.max(
                          value.startY + value.startHeight,
                          value.endY + value.endheight
                        ),
                        y + h
                      ) + 10
                    }, ${value.endX} ${y}`}
                  />
                </g>
              </g>
            ) : null;
          }
        });
  }
}

export function getVerticalDistGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string,
  snapDistance?: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null;
  }
  const snapDist = snapDistance ?? 2
  const sortedLVerticalArr = getVerticalOverlapObjects(x, y, w, h);
  const sortedRVerticalArr = getVerticalOverlapObjects(x + w, y, w, h);
  if (module === "gaia") {
    return sortedLVerticalArr.length > 0
      ? sortedLVerticalArr.map((value, idx1) => {
          const llx = Math.min(value.startX, value.endX);
          const rrx = Math.max(
            value.startX + value.startWidth,
            value.endX + value.endWidth
          );
          if (idx1 === 0 && x >= llx && x <= rrx) {
            const dist = value.endY - value.startY;
            const dyArray = getVerticalDistGuideLineDatas(x, dist)
              ? getVerticalDistGuideLineDatas(x, dist)
              : [];
            return dyArray.length > 0 ? (
              <g>
                {dyArray.map((val, idx) => {
                  const vDist = val.endY - val.startY;
                  const rx = Math.max(
                    val.startX + val.startWidth,
                    val.endX + val.endWidth
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist && idx === 0 ? (
                    <g>
                      <rect
                        fill="#FF00A9"
                        fillOpacity={0.2}
                        stroke="#FF00A9"
                        strokeOpacity={0.2}
                        x={llx}
                        y={val.startY}
                        width={rrx - llx}
                        height={val.endY - val.startY}
                      />
                      <rect
                        fill="#FF00A9"
                        x={rrx + 10}
                        y={val.startY}
                        rx={4}
                        ry={4}
                        width={18}
                        height={val.endY - val.startY}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <rect
                    fill="#FF00A9"
                    fillOpacity={0.2}
                    stroke="#FF00A9"
                    strokeOpacity={0.2}
                    x={llx}
                    y={value.startY}
                    width={rrx - llx}
                    height={value.endY - value.startY}
                  />
                  <rect
                    fill="#FF00A9"
                    x={rrx + 10}
                    y={value.startY}
                    rx={4}
                    ry={4}
                    width={18}
                    height={value.endY - value.startY}
                  />
                </g>
              </g>
            ) : null;
          }
        })
      : sortedRVerticalArr.map((value, idx1) => {
          const llx = Math.min(value.startX, value.endX);
          const rrx = Math.max(
            value.startX + value.startWidth,
            value.endX + value.endWidth
          );
          if (idx1 === 0 && x + w >= llx && x + w <= rrx) {
            const dist = value.endY - value.startY;
            const dyArray = getVerticalDistGuideLineDatas(x + w, dist)
              ? getVerticalDistGuideLineDatas(x + w, dist)
              : [];
            return dyArray.length > 0 ? (
              <g>
                {dyArray.map((val, idx) => {
                  const vDist = val.endY - val.startY;
                  const rx = Math.max(
                    val.startX + val.startWidth,
                    val.endX + val.endWidth
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist ? (
                    <g>
                      <rect
                        fill="#FF00A9"
                        fillOpacity={0.2}
                        stroke="#FF00A9"
                        strokeOpacity={0.2}
                        x={llx}
                        y={val.startY}
                        width={rrx - llx}
                        height={val.endY - val.startY}
                      />
                      <rect
                        fill="#FF00A9"
                        x={rrx + 10}
                        y={val.startY}
                        rx={4}
                        ry={4}
                        width={18}
                        height={val.endY - val.startY}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <rect
                    fill="#FF00A9"
                    fillOpacity={0.2}
                    stroke="#FF00A9"
                    strokeOpacity={0.2}
                    x={llx}
                    y={value.startY}
                    width={rrx - llx}
                    height={value.endY - value.startY}
                  />
                  <rect
                    fill="#FF00A9"
                    x={rrx + 10}
                    y={value.startY}
                    rx={4}
                    ry={4}
                    width={18}
                    height={value.endY - value.startY}
                  />
                </g>
              </g>
            ) : null;
          }
        });
  } else {
    return sortedLVerticalArr.length > 0
      ? sortedLVerticalArr.map((value, idx1) => {
          const llx = Math.min(value.startX, value.endX);
          const rrx = Math.max(
            value.startX + value.startWidth,
            value.endX + value.endWidth
          );
          if (idx1 === 0 && x >= llx && x <= rrx) {
            const dist = value.endY - value.startY;
            const dyArray = getVerticalDistGuideLineDatas(x, dist)
              ? getVerticalDistGuideLineDatas(x, dist)
              : [];
            return dyArray.length > 0 ? (
              <g>
                {dyArray.map((val, idx) => {
                  const vDist = val.endY - val.startY;
                  const rx = Math.max(
                    val.startX + val.startWidth,
                    val.endX + val.endWidth
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist && idx === 0 ? (
                    <g>
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${val.startX} ${val.startY}, ${rx + 10} ${
                          val.startY
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={`${rx + 10} ${val.startY}, ${rx + 5} ${
                          val.startY + 5
                        }, ${rx + 15} ${val.startY + 5}, ${rx + 10} ${
                          val.startY
                        }`}
                      />
                      <polyline
                        fill="none"
                        stroke="red"
                        strokeDasharray="2, 2"
                        points={`${rx + 10} ${val.startY}, ${rx + 10} ${
                          val.endY
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={` ${rx + 10} ${val.endY},${rx + 5} ${
                          val.endY - 5
                        },${rx + 15} ${val.endY - 5},${rx + 10} ${val.endY}`}
                      />
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${rx + 10} ${val.endY}, ${val.endX} ${
                          val.endY
                        }`}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${Math.min(
                      Math.min(
                        value.startX + value.startWidth,
                        value.endX + value.endWidth
                      ),
                      x + w
                    )} ${value.startY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    }, ${value.startY}`}
                  />
                  <polyline
                    fill="red"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.startY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 5
                    } ${value.startY + 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 15
                    } ${value.startY + 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.startY}`}
                  />
                  <polyline
                    fill="none"
                    stroke="red"
                    strokeDasharray="2, 2"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.startY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}`}
                  />
                  <polyline
                    fill="red"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 5
                    } ${value.endY - 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 15
                    } ${value.endY - 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}`}
                  />
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}, ${Math.min(
                      Math.min(
                        value.startX + value.startWidth,
                        value.endX + value.endWidth
                      ),
                      x + w
                    )} ${value.endY}`}
                  />
                </g>
              </g>
            ) : null;
          }
        })
      : sortedRVerticalArr.map((value, idx1) => {
          const llx = Math.min(value.startX, value.endX);
          const rrx = Math.max(
            value.startX + value.startWidth,
            value.endX + value.endWidth
          );
          if (idx1 === 0 && x + w >= llx && x + w <= rrx) {
            const dist = value.endY - value.startY;
            const dyArray = getVerticalDistGuideLineDatas(x + w, dist)
              ? getVerticalDistGuideLineDatas(x + w, dist)
              : [];
            return dyArray.length > 0 ? (
              <g>
                {dyArray.map((val, idx) => {
                  const vDist = val.endY - val.startY;
                  const rx = Math.max(
                    val.startX + val.startWidth,
                    val.endX + val.endWidth
                  );
                  return vDist - snapDist <= dist && dist <= vDist + snapDist ? (
                    <g>
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${val.startX} ${val.startY}, ${rx + 10} ${
                          val.startY
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={`${rx + 10} ${val.startY}, ${rx + 5} ${
                          val.startY + 5
                        }, ${rx + 15} ${val.startY + 5}, ${rx + 10} ${
                          val.startY
                        }`}
                      />
                      <polyline
                        fill="none"
                        stroke="red"
                        strokeDasharray="2, 2"
                        points={`${rx + 10} ${val.startY}, ${rx + 10} ${
                          val.endY
                        }`}
                      />
                      <polyline
                        fill="red"
                        points={` ${rx + 10} ${val.endY},${rx + 5} ${
                          val.endY - 5
                        },${rx + 15} ${val.endY - 5},${rx + 10} ${val.endY}`}
                      />
                      <polyline
                        fill="none"
                        stroke="gray"
                        strokeDasharray="2, 2"
                        points={`${rx + 10} ${val.endY}, ${val.endX} ${
                          val.endY
                        }`}
                      />
                    </g>
                  ) : null;
                })}
                <g>
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${Math.min(
                      Math.min(
                        value.startX + value.startWidth,
                        value.endX + value.endWidth
                      ),
                      x + w
                    )} ${value.startY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    }, ${value.startY}`}
                  />
                  <polyline
                    fill="red"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.startY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 5
                    } ${value.startY + 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 15
                    } ${value.startY + 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.startY}`}
                  />
                  <polyline
                    fill="none"
                    stroke="red"
                    strokeDasharray="2, 2"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.startY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}`}
                  />
                  <polyline
                    fill="red"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 5
                    } ${value.endY - 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 15
                    } ${value.endY - 5}, ${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}`}
                  />
                  <polyline
                    fill="none"
                    stroke="gray"
                    strokeDasharray="2, 2"
                    points={`${
                      Math.max(
                        Math.max(
                          value.startX + value.startWidth,
                          value.endX + value.endWidth
                        ),
                        x + w
                      ) + 10
                    } ${value.endY}, ${Math.min(
                      Math.min(
                        value.startX + value.startWidth,
                        value.endX + value.endWidth
                      ),
                      x + w
                    )} ${value.endY}`}
                  />
                </g>
              </g>
            ) : null;
          }
        });
  }
}

export function getBetweenHorizontalDistGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string,
  snapDistance?: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null;
  }
  const snapDist = snapDistance ?? 2
  const sortedTHorizontalArr = getBetweenHorizontalOverlapObjects(x, y, w, h, snapDist);
  const sortedBHorizontalArr = getBetweenHorizontalOverlapObjects(
    x,
    y + h,
    w,
    h, snapDist
  );
  if (module === "gaia") {
    return sortedTHorizontalArr.length > 0
      ? sortedTHorizontalArr.map((val, idx) => {
          const minTy = Math.min(Math.min(val.startY, val.endY), y);
          const maxBy = Math.max(
            Math.max(val.startY + val.startHeight, val.endY + val.endheight),
            y + h
          );
          return (
            <g>
              <rect
                fill="#FF00A9"
                fillOpacity={0.2}
                stroke="#FF00A9"
                strokeOpacity={0.2}
                x={val.startX}
                y={minTy}
                width={val.endX - val.startX}
                height={maxBy - minTy}
              />
              <rect
                fill="#FF00A9"
                x={val.startX}
                y={maxBy + 10}
                rx={4}
                ry={4}
                width={val.endX - val.startX}
                height={18}
              />
            </g>
          );
        })
      : sortedBHorizontalArr.map((val, idx) => {
          const minTy = Math.min(Math.min(val.startY, val.endY), y - h);
          const maxBy = Math.max(
            Math.max(val.startY + val.startHeight, val.endY + val.endheight),
            y
          );
          return (
            <g>
              <rect
                fill="#FF00A9"
                fillOpacity={0.2}
                stroke="#FF00A9"
                strokeOpacity={0.2}
                x={val.startX}
                y={minTy}
                width={val.endX - val.startX}
                height={maxBy - minTy}
              />
              <rect
                fill="#FF00A9"
                x={val.startX}
                y={maxBy + 10}
                rx={4}
                ry={4}
                width={val.endX - val.startX}
                height={18}
              />
            </g>
          );
        });
  } else {
    return sortedTHorizontalArr.length > 0
      ? sortedTHorizontalArr.map((val, idx) => {
          const maxTy = Math.max(Math.max(val.startY, val.endY), y);
          const maxBy = Math.max(
            Math.max(val.startY + val.startHeight, val.endY + val.endheight),
            y + h
          );
          return (
            <g>
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${val.startX} ${maxTy}, ${val.startX} ${maxBy + 10}`}
              />
              <polyline
                fill="red"
                points={`${val.startX} ${maxBy + 10}, ${val.startX + 5} ${
                  maxBy + 5
                }, ${val.startX + 5} ${maxBy + 15},${val.startX} ${maxBy + 10}`}
              />
              <polyline
                fill="none"
                stroke="red"
                strokeDasharray="2, 2"
                points={`${val.startX} ${maxBy + 10}, ${val.endX} ${
                  maxBy + 10
                }`}
              />
              <polyline
                fill="red"
                points={`${val.endX} ${maxBy + 10}, ${val.endX - 5} ${
                  maxBy + 5
                }, ${val.endX - 5}, ${maxBy + 15}, ${val.endX} ${maxBy + 10}`}
              />
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${val.endX} ${maxBy + 10}, ${val.endX} ${maxTy}`}
              />
            </g>
          );
        })
      : sortedBHorizontalArr.map((val, idx) => {
          const maxTy = Math.max(Math.max(val.startY, val.endY), y - h);
          const maxBy = Math.max(
            Math.max(val.startY + val.startHeight, val.endY + val.endheight),
            y
          );
          return (
            <g>
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${val.startX} ${maxTy}, ${val.startX} ${maxBy + 10}`}
              />
              <polyline
                fill="red"
                points={`${val.startX} ${maxBy + 10}, ${val.startX + 5} ${
                  maxBy + 5
                }, ${val.startX + 5} ${maxBy + 15},${val.startX} ${maxBy + 10}`}
              />
              <polyline
                fill="none"
                stroke="red"
                strokeDasharray="2, 2"
                points={`${val.startX} ${maxBy + 10}, ${val.endX} ${
                  maxBy + 10
                }`}
              />
              <polyline
                fill="red"
                points={`${val.endX} ${maxBy + 10}, ${val.endX - 5} ${
                  maxBy + 5
                }, ${val.endX - 5}, ${maxBy + 15}, ${val.endX} ${maxBy + 10}`}
              />
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${val.endX} ${maxBy + 10}, ${val.endX} ${maxTy}`}
              />
            </g>
          );
        });
  }
}

export function getBetweenVerticalDistGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string,
  snapDistance?: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null;
  }
  const snapDist = snapDistance ?? 2
  const sortedLVerticalArr = getBetweenVerticalOverlapObjects(x, y, w, h, snapDist);
  const sortedRVerticalArr = getBetweenVerticalOverlapObjects(x + w, y, w, h, snapDist);
  if (module === "gaia") {
    return sortedLVerticalArr.length > 0
      ? sortedLVerticalArr.map((val, idx) => {
          const minLx = Math.min(Math.min(val.startX, val.endX), x);
          const maxRx = Math.max(
            Math.max(val.startX + val.startWidth, val.endX + val.endWidth),
            x + w
          );
          return (
            <g>
              <rect
                fill="#FF00A9"
                fillOpacity={0.2}
                stroke="#FF00A9"
                strokeOpacity={0.2}
                x={minLx}
                y={val.startY}
                width={maxRx - minLx}
                height={val.endY - val.startY}
              />
              <rect
                fill="#FF00A9"
                x={maxRx + 10}
                y={val.startY}
                rx={4}
                ry={4}
                width={18}
                height={val.endY - val.startY}
              />
            </g>
          );
        })
      : sortedRVerticalArr.map((val, idx) => {
          const minLx = Math.min(Math.min(val.startX, val.endX), x);
          const maxRx = Math.max(
            Math.max(val.startX + val.startWidth, val.endX + val.endWidth),
            x + w
          );
          return (
            <g>
              <rect
                fill="#FF00A9"
                fillOpacity={0.2}
                stroke="#FF00A9"
                strokeOpacity={0.2}
                x={minLx}
                y={val.startY}
                width={maxRx - minLx}
                height={val.endY - val.startY}
              />
              <rect
                fill="#FF00A9"
                x={maxRx + 10}
                y={val.startY}
                rx={4}
                ry={4}
                width={18}
                height={val.endY - val.startY}
              />
            </g>
          );
        });
  } else {
    return sortedLVerticalArr.length > 0
      ? sortedLVerticalArr.map((val, idx) => {
          const maxLx = Math.max(Math.max(val.startX, val.endX), x);
          const maxRx = Math.max(
            Math.max(val.startX + val.startWidth, val.endX + val.endWidth),
            x + w
          );
          return (
            <g>
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${maxLx} ${val.startY}, ${maxRx + 10} ${val.startY}`}
              />
              <polyline
                fill="red"
                points={`${maxRx + 10} ${val.startY}, ${maxRx + 5} ${
                  val.startY + 5
                }, ${maxRx + 15} ${val.startY + 5}, ${maxRx + 10} ${
                  val.startY
                }`}
              />
              <polyline
                fill="none"
                stroke="red"
                strokeDasharray="2, 2"
                points={`${maxRx + 10} ${val.startY}, ${maxRx + 10} ${
                  val.endY
                }`}
              />
              <polyline
                fill="red"
                points={` ${maxRx + 10} ${val.endY},${maxRx + 5} ${
                  val.endY - 5
                },${maxRx + 15} ${val.endY - 5},${maxRx + 10} ${val.endY}`}
              />
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${maxRx + 10} ${val.endY}, ${maxLx} ${val.endY}`}
              />
            </g>
          );
        })
      : sortedRVerticalArr.map((val, idx) => {
          const maxLx = Math.max(Math.max(val.startX, val.endX), x);
          const maxRx = Math.max(
            Math.max(val.startX + val.startWidth, val.endX + val.endWidth),
            x + w
          );
          return (
            <g>
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${maxLx} ${val.startY}, ${maxRx + 10} ${val.startY}`}
              />
              <polyline
                fill="red"
                points={`${maxRx + 10} ${val.startY}, ${maxRx + 5} ${
                  val.startY + 5
                }, ${maxRx + 15} ${val.startY + 5}, ${maxRx + 10} ${
                  val.startY
                }`}
              />
              <polyline
                fill="none"
                stroke="red"
                strokeDasharray="2, 2"
                points={`${maxRx + 10} ${val.startY}, ${maxRx + 10} ${
                  val.endY
                }`}
              />
              <polyline
                fill="red"
                points={` ${maxRx + 10} ${val.endY},${maxRx + 5} ${
                  val.endY - 5
                },${maxRx + 15} ${val.endY - 5},${maxRx + 10} ${val.endY}`}
              />
              <polyline
                fill="none"
                stroke="gray"
                strokeDasharray="2, 2"
                points={`${maxRx + 10} ${val.endY}, ${maxLx} ${val.endY}`}
              />
            </g>
          );
        });
  }
}

export function getHorizontalDistGuideArrayForSnap(
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null;
  }
  const sortedHorizontalArr = getHorizontalOverlapObjects(x, y, w, h);
  return sortedHorizontalArr.map((value, idx1) => {
    const tty = Math.min(value.startY, value.endY);
    const bby = Math.max(
      value.startY + value.startHeight,
      value.endY + value.endheight
    );
    if (idx1 === 0 && y >= tty && y <= bby) {
      const dist = value.endX - value.startX;
      const dxArray = getHorizontalDistGuideLineDatas(y, dist)
        ? getHorizontalDistGuideLineDatas(y, dist)
        : [];
      return dxArray.length > 0 ? dxArray : [];
    }
  });
}

export function getVerticalDistGuideArrayForSnap(
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined
  ) {
    return null;
  }
  const sortedVerticalArr = getVerticalOverlapObjects(x, y, w, h);
  return sortedVerticalArr.map((value, idx1) => {
    const llx = Math.min(value.startX, value.endX);
    const rrx = Math.max(
      value.startX + value.startWidth,
      value.endX + value.endWidth
    );
    if (idx1 === 0 && x >= llx && x <= rrx) {
      const dist = value.endY - value.startY;
      const dyArray = getVerticalDistGuideLineDatas(x, dist)
        ? getVerticalDistGuideLineDatas(x, dist)
        : [];
      return dyArray.length > 0 ? dyArray : [];
    }
  });
}

export function getTopHorizontalGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string
) {
  const topHorizontalGuideLines = getHorizontalGuideLineDatas(y);
  return topHorizontalGuideLines.length > 0 ? (
    <line
      x1={Math.min(Number(topHorizontalGuideLines[0].x), Number(x))}
      x2={Math.max(
        Number(topHorizontalGuideLines[0].x) +
          Number(topHorizontalGuideLines[0].w),
        Number(x) + Number(w)
      )}
      y1={Number(topHorizontalGuideLines[0].y)}
      y2={Number(topHorizontalGuideLines[0].y)}
      stroke="red"
      strokeDasharray="2, 2"
      style={{ zIndex: 30 }}
    />
  ) : null;
}

export function getBottomHorizontalGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string
) {
  const bottomHorizontalGuideLines = getHorizontalGuideLineDatas(y + h);
  return bottomHorizontalGuideLines.length > 0 ? (
    <line
      x1={Math.min(Number(bottomHorizontalGuideLines[0].x), Number(x))}
      x2={Math.max(
        Number(bottomHorizontalGuideLines[0].x) +
          Number(bottomHorizontalGuideLines[0].w),
        Number(x) + Number(w)
      )}
      y1={Number(bottomHorizontalGuideLines[0].y)}
      y2={Number(bottomHorizontalGuideLines[0].y)}
      stroke="red"
      strokeDasharray="2, 2"
      style={{ zIndex: 30 }}
    />
  ) : null;
}

export function getCenterHorizontalGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number
) {
  const centerHorizontalGuideLines = [
    ...getCenterHorizontalGuideLineDatas(y),
    ...getCenterHorizontalGuideLineDatas(y + h / 2),
    ...getCenterHorizontalGuideLineDatas(y + h),
  ];
  return centerHorizontalGuideLines.length > 0 ? (
    <line
      x1={Math.min(Number(centerHorizontalGuideLines[0].x), Number(x))}
      x2={Math.max(
        Number(centerHorizontalGuideLines[0].x) +
          Number(centerHorizontalGuideLines[0].w),
        Number(x) + Number(w)
      )}
      y1={Number(centerHorizontalGuideLines[0].y)}
      y2={Number(centerHorizontalGuideLines[0].y)}
      stroke="red"
      strokeDasharray="2, 2"
      style={{ zIndex: 30 }}
    />
  ) : null;
}

export function getLeftVerticalGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number
) {
  const leftVerticalGuideLines = getVerticalGuideLineDatas(x);
  return leftVerticalGuideLines.length > 0 ? (
    <line
      x1={Number(leftVerticalGuideLines[0].x)}
      x2={Number(leftVerticalGuideLines[0].x)}
      y1={Math.min(Number(leftVerticalGuideLines[0].y), Number(y)) - 10}
      y2={Math.max(
        Number(leftVerticalGuideLines[0].y) +
          Number(leftVerticalGuideLines[0].h),
        Number(y) + Number(h)
      )}
      stroke="red"
      strokeDasharray="2, 2"
      style={{ zIndex: 30, position: "absolute" }}
    />
  ) : null;
}

export function getRightVerticalGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number
) {
  const rightVerticalGuideLines = getVerticalGuideLineDatas(x + w);
  return rightVerticalGuideLines.length > 0 ? (
    <line
      x1={Number(rightVerticalGuideLines[0].x)}
      x2={Number(rightVerticalGuideLines[0].x)}
      y1={Math.min(Number(rightVerticalGuideLines[0].y), Number(y)) - 10}
      y2={Math.max(
        Number(rightVerticalGuideLines[0].y) +
          Number(rightVerticalGuideLines[0].h),
        Number(y) + Number(h)
      )}
      stroke="red"
      strokeDasharray="2, 2"
      style={{ zIndex: 30 }}
    />
  ) : null;
}

export function getCenterVerticalGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number
) {
  const centerVerticalGuideLines = [
    ...getCenterVerticalGuideLineDatas(x),
    ...getCenterVerticalGuideLineDatas(x + w / 2),
    ...getCenterVerticalGuideLineDatas(x + w),
  ];
  return centerVerticalGuideLines.length > 0 ? (
    <line
      x1={Number(centerVerticalGuideLines[0].x)}
      x2={Number(centerVerticalGuideLines[0].x)}
      y1={Math.min(Number(centerVerticalGuideLines[0].y), Number(y)) - 10}
      y2={Math.max(
        Number(centerVerticalGuideLines[0].y) +
          Number(centerVerticalGuideLines[0].h),
        Number(y) + Number(h)
      )}
      stroke="red"
      strokeDasharray="2, 2"
      style={{ zIndex: 30 }}
    />
  ) : null;
}

export function getSnapCoordinate(
  x: number,
  y: number,
  w: number,
  h: number,
  newX: number,
  newY: number,
  snapDistance?: number,
): snapCoordinate {
  if (
    x === undefined ||
    y === undefined ||
    w === undefined ||
    h === undefined ||
    newX === undefined ||
    newY === undefined
  ) {
    return { newX, newY };
  }
  const snapDist = snapDistance ?? 2
  const verticalGuideLineArr = [
    ...getVerticalGuideLineDatas(x),
    ...getCenterVerticalGuideLineDatas(x),
  ];
  const horizontalGuideLineArr = [
    ...getHorizontalGuideLineDatas(y),
    ...getCenterHorizontalGuideLineDatas(y),
  ];
  const verticalDistGuideLineArr = getVerticalDistGuideArrayForSnap(x, y, w, h);
  const horizonDistGuideLineArr = getHorizontalDistGuideArrayForSnap(
    x,
    y,
    w,
    h
  );
  if (
    verticalGuideLineArr.length > 0 &&
    x &&
    Math.round(verticalGuideLineArr[0].x) !== Math.round(x)
  ) {
    newX =
      (newX - snapDist) < verticalGuideLineArr[0].x &&
      verticalGuideLineArr[0].x < (newX + snapDist)
        ? verticalGuideLineArr[0].x
        : newX;
  } else if (
    horizontalGuideLineArr.length > 0 &&
    y &&
    Math.round(horizontalGuideLineArr[0].y) !== Math.round(y)
  ) {
    newY =
      (newY - snapDist) < horizontalGuideLineArr[0].y &&
      horizontalGuideLineArr[0].y < (newY + snapDist)
        ? horizontalGuideLineArr[0].y
        : newY;
  } else if (
    verticalDistGuideLineArr &&
    verticalDistGuideLineArr.length > 0 &&
    verticalDistGuideLineArr[0] &&
    verticalDistGuideLineArr[0][0] &&
    verticalDistGuideLineArr[0][0].endY +
      verticalDistGuideLineArr[0][0].endheight <
      y &&
    Math.round(verticalDistGuideLineArr[0][0].dist) !==
      Math.round(
        y -
          verticalDistGuideLineArr[0][0].endY -
          verticalDistGuideLineArr[0][0].endheight
      )
  ) {
    const dist =
      verticalDistGuideLineArr[0][0].endY +
      verticalDistGuideLineArr[0][0].endheight +
      verticalDistGuideLineArr[0][0].dist;
    newY = (newY - snapDist) < dist && dist < (newY + snapDist) ? dist : newY;
  } else if (
    horizonDistGuideLineArr &&
    horizonDistGuideLineArr.length > 0 &&
    horizonDistGuideLineArr[0] &&
    horizonDistGuideLineArr[0][0] &&
    horizonDistGuideLineArr[0][0].endX +
      horizonDistGuideLineArr[0][0].endWidth <
      x &&
    Math.round(horizonDistGuideLineArr[0][0].dist) !==
      Math.round(
        x -
          horizonDistGuideLineArr[0][0].endX -
          horizonDistGuideLineArr[0][0].endWidth
      )
  ) {
    const dist =
      horizonDistGuideLineArr[0][0].endX +
      horizonDistGuideLineArr[0][0].endWidth +
      horizonDistGuideLineArr[0][0].dist;
    newX = (newX - snapDist) < dist && dist < (newX + snapDist) ? dist : newX;
  } else if (
    verticalDistGuideLineArr &&
    verticalDistGuideLineArr.length > 0 &&
    verticalDistGuideLineArr[0] &&
    verticalDistGuideLineArr[0][0] &&
    verticalDistGuideLineArr[0][0].startY > y + h &&
    Math.round(verticalDistGuideLineArr[0][0].dist) !==
      Math.round(verticalDistGuideLineArr[0][0].startY - y - h)
  ) {
    const dist =
      verticalDistGuideLineArr[0][0].startY -
      verticalDistGuideLineArr[0][0].startHeight -
      verticalDistGuideLineArr[0][0].dist -
      h;
    newY = (newY - snapDist) < dist && dist < (newY + snapDist) ? dist : newY;
  } else if (
    horizonDistGuideLineArr &&
    horizonDistGuideLineArr.length > 0 &&
    horizonDistGuideLineArr[0] &&
    horizonDistGuideLineArr[0][0] &&
    horizonDistGuideLineArr[0][0].startX > x + w &&
    Math.round(horizonDistGuideLineArr[0][0].dist) !==
      Math.round(horizonDistGuideLineArr[0][0].startX - x - w)
  ) {
    const dist =
      horizonDistGuideLineArr[0][0].startX -
      horizonDistGuideLineArr[0][0].startWidth -
      horizonDistGuideLineArr[0][0].dist -
      w;
    newX = (newX - snapDist) < dist && dist < (newX + snapDist) ? dist : newX;
  }
  return { newX, newY };
}

export function getTotalSmartGuideJSXElements(
  x: number,
  y: number,
  w: number,
  h: number,
  module?: string,
  snapDistance?: number
) {
  const snapDist = snapDistance ?? 2
  return (
    <g id="smartGuideLines">
      {getLeftVerticalGuideJSXElements(x, y, w, h)}
      {getRightVerticalGuideJSXElements(x, y, w, h)}
      {getVerticalGuideLineDatas(x).length === 0 &&
      getVerticalGuideLineDatas(x + w).length === 0
        ? getCenterVerticalGuideJSXElements(x, y, w, h)
        : null}
      {getTopHorizontalGuideJSXElements(x, y, w, h)}
      {getBottomHorizontalGuideJSXElements(x, y, w, h)}
      {getHorizontalGuideLineDatas(y).length === 0 &&
      getHorizontalGuideLineDatas(y + h).length === 0
        ? getCenterHorizontalGuideJSXElements(x, y, w, h)
        : null}
      {getHorizontalDistGuideJSXElements(x, y, w, h, module, snapDist)}
      {getVerticalDistGuideJSXElements(x, y, w, h, module, snapDist)}
      {getBetweenHorizontalDistGuideJSXElements(x, y, w, h, module, snapDist)}
      {getBetweenVerticalDistGuideJSXElements(x, y, w, h, module, snapDist)}
    </g>
  );
}
